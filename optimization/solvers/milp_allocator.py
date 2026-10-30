"""Deterministic Mixed-Integer Linear Programming (MILP) Dispatch Allocator for LifeLink.

Separates AI cognitive reasoning from mathematical optimization.
Guarantees zero hospital capacity overflows, capability specialty matching,
and minimisation of weighted time to definitive medical care (Golden Hour preservation).
"""

import time
from typing import Dict, List, Optional, Tuple

from optimization.schemas import (
    Ambulance,
    DispatchAssignment,
    Hospital,
    OptimizationSolution,
    Patient,
    TriageCategory,
)
from optimization.graph.road_network import DynamicRoadNetwork

try:
    from ortools.linear_solver import pywraplp
    ORTOOLS_AVAILABLE = True
except ImportError:
    pywraplp = None
    ORTOOLS_AVAILABLE = False


class EmergencyDispatchOptimizer:
    """Deterministic MILP Allocation Engine for Emergency Patient Dispatch."""

    def __init__(self, road_network: Optional[DynamicRoadNetwork] = None):
        self.road_network = road_network or DynamicRoadNetwork()

    def solve(
        self,
        patients: List[Patient],
        ambulances: List[Ambulance],
        hospitals: List[Hospital],
        max_time_seconds: float = 3.0,
    ) -> OptimizationSolution:
        """Solves the multi-criteria emergency dispatch assignment.

        Formulation:
          min sum_{i,j,k} w_i * (t_ij + s_i + t_ik) * x_{ijk}
          s.t.
             sum_{j,k} x_{ijk} <= 1                  (each patient assigned at most once)
             sum_{i,k} x_{ijk} <= V_j                 (ambulance capacity bound)
             sum_{i,j} x_{ijk} <= C_k                 (hospital ICU capacity bound)
             x_{ijk} = 0 if hospital k lacks patient i's specialty
        """
        start_time = time.perf_counter()

        if not patients or not ambulances or not hospitals:
            return OptimizationSolution(
                status="EMPTY_INPUT",
                solve_time_ms=(time.perf_counter() - start_time) * 1000.0,
                objective_value=0.0,
                assignments=[],
                unassigned_patient_ids=[p.id for p in patients],
                solver_metadata={"message": "No patients, ambulances, or hospitals provided."},
            )

        # Filter available ambulances
        avail_ambulances = [a for a in ambulances if a.is_available]
        if not avail_ambulances:
            return OptimizationSolution(
                status="NO_AVAILABLE_AMBULANCES",
                solve_time_ms=(time.perf_counter() - start_time) * 1000.0,
                objective_value=0.0,
                assignments=[],
                unassigned_patient_ids=[p.id for p in patients],
                solver_metadata={"message": "All ambulances currently engaged."},
            )

        # Precompute travel times: t_ij (amb -> pat) and t_ik (pat -> hosp)
        t_amb_pat: Dict[Tuple[str, str], float] = {}
        for amb in avail_ambulances:
            for pat in patients:
                t_amb_pat[(amb.id, pat.id)] = self.road_network.estimate_travel_time_minutes(
                    amb.latitude, amb.longitude, pat.latitude, pat.longitude
                )

        t_pat_hosp: Dict[Tuple[str, str], float] = {}
        for pat in patients:
            for hosp in hospitals:
                t_pat_hosp[(pat.id, hosp.id)] = self.road_network.estimate_travel_time_minutes(
                    pat.latitude, pat.longitude, hosp.latitude, hosp.longitude
                )

        # Check hospital capability match matrix M_{ik}
        capability_matrix: Dict[Tuple[str, str], bool] = {}
        for pat in patients:
            for hosp in hospitals:
                reqs = set(pat.required_specialties)
                supp = set(hosp.supported_specialties)
                # If patient needs specific specialties, hospital must have all of them
                capability_matrix[(pat.id, hosp.id)] = reqs.issubset(supp)

        if ORTOOLS_AVAILABLE:
            return self._solve_with_ortools(
                patients,
                avail_ambulances,
                hospitals,
                t_amb_pat,
                t_pat_hosp,
                capability_matrix,
                start_time,
                max_time_seconds,
            )
        else:
            return self._solve_with_greedy_heuristic(
                patients,
                avail_ambulances,
                hospitals,
                t_amb_pat,
                t_pat_hosp,
                capability_matrix,
                start_time,
            )

    def _solve_with_ortools(
        self,
        patients: List[Patient],
        ambulances: List[Ambulance],
        hospitals: List[Hospital],
        t_amb_pat: Dict[Tuple[str, str], float],
        t_pat_hosp: Dict[Tuple[str, str], float],
        capability_matrix: Dict[Tuple[str, str], bool],
        start_time: float,
        max_time_seconds: float,
    ) -> OptimizationSolution:
        """Solves exact MILP with Google OR-Tools CBC/SCIP."""
        solver = pywraplp.Solver.CreateSolver("SCIP")
        if not solver:
            solver = pywraplp.Solver.CreateSolver("CBC")

        solver.SetTimeLimit(int(max_time_seconds * 1000))

        # Decision variables: x[i, j, k] in {0, 1}
        # 1 if ambulance j transports patient i to hospital k
        x = {}
        for pat in patients:
            for amb in ambulances:
                for hosp in hospitals:
                    # Infeasible if hospital cannot treat patient
                    if capability_matrix[(pat.id, hosp.id)]:
                        x[(pat.id, amb.id, hosp.id)] = solver.BoolVar(
                            f"x_{pat.id}_{amb.id}_{hosp.id}"
                        )

        # Constraint 1: Each patient assigned at most once
        for pat in patients:
            solver.Add(
                solver.Sum(
                    x[(pat.id, amb.id, hosp.id)]
                    for amb in ambulances
                    for hosp in hospitals
                    if (pat.id, amb.id, hosp.id) in x
                )
                <= 1
            )

        # Constraint 2: Ambulance capacity bound
        for amb in ambulances:
            solver.Add(
                solver.Sum(
                    x[(pat.id, amb.id, hosp.id)]
                    for pat in patients
                    for hosp in hospitals
                    if (pat.id, amb.id, hosp.id) in x
                )
                <= amb.capacity
            )

        # Constraint 3: Hospital ICU capacity bound (Hard constraint)
        for hosp in hospitals:
            solver.Add(
                solver.Sum(
                    x[(pat.id, amb.id, hosp.id)]
                    for pat in patients
                    for amb in ambulances
                    if (pat.id, amb.id, hosp.id) in x
                )
                <= hosp.icu_capacity
            )

        # Objective Function:
        # Minimize weighted response time + penalty for unserved high-priority patients
        # Cost = sum_{i,j,k} w_i * (t_amb_pat + s_i + t_pat_hosp) * x_{ijk}
        # Plus unassigned penalty: (1 - sum x) * (w_i * 200)
        objective = solver.Objective()
        for (pat_id, amb_id, hosp_id), var in x.items():
            pat = next(p for p in patients if p.id == pat_id)
            total_transit = (
                t_amb_pat[(amb_id, pat_id)]
                + pat.stabilization_time_minutes
                + t_pat_hosp[(pat_id, hosp_id)]
            )
            weight = pat.urgency_weight
            coeff = weight * total_transit
            objective.SetCoefficient(var, coeff)

        # Unserved penalty to force assigning highest-triage victims first
        unserved_penalty_coeff = 500.0
        for pat in patients:
            weight = pat.urgency_weight
            assigned_sum = solver.Sum(
                x[(pat.id, amb.id, hosp.id)]
                for amb in ambulances
                for hosp in hospitals
                if (pat.id, amb.id, hosp.id) in x
            )
            # Add (1 - assigned_sum) * (weight * unserved_penalty_coeff)
            # which simplifies to -assigned_sum * (weight * unserved_penalty_coeff) in minimization
            for amb in ambulances:
                for hosp in hospitals:
                    if (pat.id, amb.id, hosp.id) in x:
                        curr_coeff = objective.GetCoefficient(x[(pat.id, amb.id, hosp.id)])
                        objective.SetCoefficient(
                            x[(pat.id, amb.id, hosp.id)],
                            curr_coeff - (weight * unserved_penalty_coeff),
                        )

        objective.SetMinimization()
        solver_status = solver.Solve()

        solve_time_ms = (time.perf_counter() - start_time) * 1000.0
        assignments: List[DispatchAssignment] = []
        assigned_patients = set()

        if solver_status in [pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE]:
            status_str = "OPTIMAL" if solver_status == pywraplp.Solver.OPTIMAL else "FEASIBLE"
            for (pat_id, amb_id, hosp_id), var in x.items():
                if var.solution_value() > 0.5:
                    pat = next(p for p in patients if p.id == pat_id)
                    amb_eta = t_amb_pat[(amb_id, pat_id)]
                    hosp_eta = t_pat_hosp[(pat_id, hosp_id)]
                    total_time = amb_eta + pat.stabilization_time_minutes + hosp_eta
                    assigned_patients.add(pat_id)

                    assignments.append(
                        DispatchAssignment(
                            patient_id=pat_id,
                            ambulance_id=amb_id,
                            hospital_id=hosp_id,
                            ambulance_eta_minutes=round(amb_eta, 1),
                            hospital_eta_minutes=round(hosp_eta, 1),
                            total_time_to_care_minutes=round(total_time, 1),
                            urgency_score=pat.urgency_weight,
                        )
                    )
        else:
            status_str = "INFEASIBLE"

        unassigned = [p.id for p in patients if p.id not in assigned_patients]

        return OptimizationSolution(
            status=status_str,
            solve_time_ms=round(solve_time_ms, 2),
            objective_value=round(solver.Objective().Value(), 2) if status_str != "INFEASIBLE" else 0.0,
            assignments=assignments,
            unassigned_patient_ids=unassigned,
            solver_metadata={
                "solver_backend": "Google OR-Tools SCIP/CBC",
                "total_patients": str(len(patients)),
                "total_assigned": str(len(assignments)),
            },
        )

    def _solve_with_greedy_heuristic(
        self,
        patients: List[Patient],
        ambulances: List[Ambulance],
        hospitals: List[Hospital],
        t_amb_pat: Dict[Tuple[str, str], float],
        t_pat_hosp: Dict[Tuple[str, str], float],
        capability_matrix: Dict[Tuple[str, str], bool],
        start_time: float,
    ) -> OptimizationSolution:
        """High-speed priority-weighted heuristic baseline when OR-Tools is not yet installed."""
        # Sort patients descending by urgency weight (Red triage first)
        sorted_patients = sorted(patients, key=lambda p: p.urgency_weight, reverse=True)

        amb_remaining = {a.id: a.capacity for a in ambulances}
        hosp_remaining = {h.id: h.icu_capacity for h in hospitals}

        assignments: List[DispatchAssignment] = []
        assigned_patients = set()

        for pat in sorted_patients:
            best_choice = None
            best_cost = float("inf")

            for amb in ambulances:
                if amb_remaining[amb.id] <= 0:
                    continue
                for hosp in hospitals:
                    if hosp_remaining[hosp.id] <= 0:
                        continue
                    if not capability_matrix[(pat.id, hosp.id)]:
                        continue

                    amb_eta = t_amb_pat[(amb.id, pat.id)]
                    hosp_eta = t_pat_hosp[(pat.id, hosp.id)]
                    total_time = amb_eta + pat.stabilization_time_minutes + hosp_eta
                    cost = pat.urgency_weight * total_time

                    if cost < best_cost:
                        best_cost = cost
                        best_choice = (amb.id, hosp.id, amb_eta, hosp_eta, total_time)

            if best_choice:
                amb_id, hosp_id, amb_eta, hosp_eta, total_time = best_choice
                amb_remaining[amb_id] -= 1
                hosp_remaining[hosp_id] -= 1
                assigned_patients.add(pat.id)

                assignments.append(
                    DispatchAssignment(
                        patient_id=pat.id,
                        ambulance_id=amb_id,
                        hospital_id=hosp_id,
                        ambulance_eta_minutes=round(amb_eta, 1),
                        hospital_eta_minutes=round(hosp_eta, 1),
                        total_time_to_care_minutes=round(total_time, 1),
                        urgency_score=pat.urgency_weight,
                    )
                )

        solve_time_ms = (time.perf_counter() - start_time) * 1000.0
        unassigned = [p.id for p in patients if p.id not in assigned_patients]

        return OptimizationSolution(
            status="FEASIBLE_HEURISTIC",
            solve_time_ms=round(solve_time_ms, 2),
            objective_value=sum(a.total_time_to_care_minutes * a.urgency_score for a in assignments),
            assignments=assignments,
            unassigned_patient_ids=unassigned,
            solver_metadata={
                "solver_backend": "Priority-Constrained Greedy Fallback",
                "notice": "Install ortools for exact SCIP/CBC MILP formulation",
            },
        )


if __name__ == "__main__":
    # Self-test demonstration
    from optimization.schemas import MedicalSpecialty

    sample_patients = [
        Patient(
            id="P-01",
            latitude=37.7749,
            longitude=-122.4194,
            triage_category=TriageCategory.RED,
            urgency_weight=95.0,
            required_specialties=[MedicalSpecialty.NEUROSURGERY],
        ),
        Patient(
            id="P-02",
            latitude=37.7833,
            longitude=-122.4167,
            triage_category=TriageCategory.YELLOW,
            urgency_weight=60.0,
        ),
    ]

    sample_ambulances = [
        Ambulance(id="A-01", callsign="Medic 1", latitude=37.7700, longitude=-122.4200),
        Ambulance(id="A-02", callsign="Medic 2", latitude=37.7800, longitude=-122.4100),
    ]

    sample_hospitals = [
        Hospital(
            id="H-01",
            name="Metro Trauma Center",
            latitude=37.7900,
            longitude=-122.4000,
            icu_capacity=2,
            operating_rooms_available=1,
            supported_specialties=[MedicalSpecialty.NEUROSURGERY, MedicalSpecialty.GENERAL_TRAUMA],
        ),
        Hospital(
            id="H-02",
            name="Community General",
            latitude=37.7600,
            longitude=-122.4300,
            icu_capacity=1,
            operating_rooms_available=1,
            supported_specialties=[MedicalSpecialty.GENERAL_TRAUMA],
        ),
    ]

    opt = EmergencyDispatchOptimizer()
    sol = opt.solve(sample_patients, sample_ambulances, sample_hospitals)
    print("Optimization Solution:")
    print(sol.model_dump_json(indent=2))
