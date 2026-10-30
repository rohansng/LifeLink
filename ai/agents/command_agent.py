"""Command Agent for LifeLink.

Translates deterministic mathematical optimization solutions into
actionable, explainable commander briefings with transparent trade-offs.
"""

from typing import Dict, List
from optimization.schemas import (
    DispatchAssignment,
    Hospital,
    OptimizationSolution,
    Patient,
)


class CommandAgent:
    """Produces tactical executive briefings and explainable dispatch rationales."""

    def generate_commander_briefing(
        self,
        solution: OptimizationSolution,
        patients_map: Dict[str, Patient],
        hospitals_map: Dict[str, Hospital],
    ) -> Dict:
        """Enriches optimization output with explainable AI clinical rationales."""
        enriched_assignments = []

        for assignment in solution.assignments:
            patient = patients_map.get(assignment.patient_id)
            hospital = hospitals_map.get(assignment.hospital_id)

            if not patient or not hospital:
                continue

            # Synthesize clinical rationale
            reasons = []
            if patient.triage_category.value == "RED":
                reasons.append(f"Immediate life-threat (priority {patient.urgency_weight})")
            
            if patient.required_specialties:
                specs = ", ".join(s.value for s in patient.required_specialties)
                reasons.append(f"Requires matched specialties [{specs}] available at {hospital.name}")
            
            reasons.append(
                f"Definitive surgical care ETA: {assignment.total_time_to_care_minutes} min "
                f"(Golden-hour limit: {patient.golden_hour_deadline_minutes} min)"
            )

            rationale_text = " | ".join(reasons)
            assignment.clinical_rationale = rationale_text

            enriched_assignments.append({
                "patient_id": assignment.patient_id,
                "triage_category": patient.triage_category.value,
                "urgency_score": assignment.urgency_score,
                "assigned_ambulance": assignment.ambulance_id,
                "ambulance_eta_min": assignment.ambulance_eta_minutes,
                "destination_hospital": hospital.name,
                "hospital_eta_min": assignment.hospital_eta_minutes,
                "total_time_to_care_min": assignment.total_time_to_care_minutes,
                "rationale": rationale_text,
            })

        critical_unassigned = [
            pid for pid in solution.unassigned_patient_ids
            if pid in patients_map and patients_map[pid].triage_category.value == "RED"
        ]

        summary = (
            f"Optimized dispatch generated in {solution.solve_time_ms} ms. "
            f"Assigned {len(enriched_assignments)} casualties across ready units. "
        )
        if critical_unassigned:
            summary += f"WARNING: {len(critical_unassigned)} critical casualties remain unassigned due to resource depletion! Surge units required."

        return {
            "status": solution.status,
            "solve_time_ms": solution.solve_time_ms,
            "tactical_summary": summary,
            "recommended_actions": enriched_assignments,
            "unassigned_patients": solution.unassigned_patient_ids,
            "critical_unassigned_count": len(critical_unassigned),
            "requires_commander_attention": len(critical_unassigned) > 0,
        }
