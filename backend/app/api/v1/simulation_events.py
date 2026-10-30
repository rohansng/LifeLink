"""Real-Time Incident Simulation REST API."""

from typing import Dict
from fastapi import APIRouter
from backend.app.simulation.event_types import SimulationStepResult
from backend.app.simulation.simulator import simulator

router = APIRouter(prefix="/simulation", tags=["Incident Simulation Engine"])


@router.get("/status")
def get_simulation_status() -> Dict:
    """Returns current progression in the 5-event killer demo sequence."""
    return simulator.get_status()


@router.post("/next", response_model=SimulationStepResult)
def simulate_next_event():
    """Executes the next crisis disruption event in the sequence:
    1. NEW_IMAGE_EVIDENCE (+17 victims, +5 critical)
    2. HOSPITAL_CAPACITY_CHANGE (Hospital B ICU 2 -> 1)
    3. ROAD_BLOCKED (Route A 11m -> 27m)
    4. RESOURCE_SHORTAGE (O- Blood 18 -> 3)
    5. HOSPITAL_RESOURCE_AVAILABLE (Hospital C Trauma Team Available)
    """
    return simulator.advance_step()


@router.post("/reset")
def reset_simulation():
    """Resets the simulation engine and repository state back to initial seed baseline."""
    simulator.reset()
    return {"status": "SUCCESS", "message": "Simulation engine reset to baseline (Step 0/5)."}


@router.get("/summary")
def get_simulation_mission_summary() -> Dict:
    """Returns post-simulation mission impact summary:
    - victims tracked
    - critical patients assigned
    - unassigned critical
    - ICU conflicts
    - resource alerts
    - recommended actions
    """
    incident = simulator.db.get_incident() if hasattr(simulator, "db") else None
    from backend.app.data.repository import db
    incident = db.get_incident()
    stats = incident.statistics

    # Active resources
    hospitals = db.get_hospitals()
    total_icu = sum(h.icu for h in hospitals)
    ambulances = db.get_ambulances()
    active_ambs = len([a for a in ambulances if a.status.value != "maintenance"])

    # High-priority assigned vs unassigned
    assigned_critical = min(stats.critical, active_ambs)
    unassigned_crit = max(0, stats.critical - assigned_critical)

    return {
        "simulation_completed": simulator.current_step >= simulator.total_steps,
        "current_step": simulator.current_step,
        "victims_tracked": stats.total_victims,
        "initial_victims": 214,
        "added_victims": stats.total_victims - 214,
        "critical_patients_total": stats.critical,
        "critical_patients_assigned": assigned_critical,
        "unassigned_critical": unassigned_crit,
        "breakdown": {
            "critical": stats.critical,
            "serious": stats.serious,
            "moderate": stats.moderate,
            "unknown": stats.unknown,
        },
        "icu_conflicts": {
            "total_demanding": stats.critical,
            "total_available_beds": total_icu,
            "net_deficit": max(0, stats.critical - total_icu),
            "severity": "CRITICAL",
        },
        "resource_alerts": [
            f"Ambulance Fleet Exhausted ({active_ambs}/{active_ambs} active units deployed)",
            "Universal Donor O- Negative Blood Depleted (3 units remaining in regional stock)",
            "Primary Transport Corridor Route A Closed (Overpass 4 severed by tanker explosion)",
            f"Severe Regional ICU Saturation ({total_icu} beds open vs {stats.critical} critical casualties)",
            "Structural Collapse Extrication Deficit (34 trapped vs 2 local USAR squads)",
        ],
        "recommended_actions": [
            {
                "id": "ACTION-01",
                "title": "DECLARE CRISIS STANDARDS OF CARE & REVERSE TRIAGE",
                "impact": "+8 to +12 Regional ICU beds by rapid step-down discharge",
                "type": "REVERSE_TRIAGE",
            },
            {
                "id": "ACTION-02",
                "title": "BROADCAST STATEWIDE MUTUAL AID ALARM (MABAS TIER 3 EMS)",
                "impact": "+15 Mutual-Aid ALS Transport Units arriving in 25 min",
                "type": "MUTUAL_AID",
            },
            {
                "id": "ACTION-03",
                "title": "DISPATCH STATE BLOOD BANK EMERGENCY CONVOY",
                "impact": "+40 Units O- Universal Donor Blood with Police Escort",
                "type": "BLOOD_CONVOY",
            },
            {
                "id": "ACTION-04",
                "title": "MOBILIZE NATIONAL GUARD USAR TASK FORCE 3",
                "impact": "+4 Heavy Search & Rescue Squads for Structural Collapse Shoring",
                "type": "USAR_DEPLOY",
            },
        ],
    }
