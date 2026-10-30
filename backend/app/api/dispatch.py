"""Dispatch and Optimization API endpoints for LifeLink."""

from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.core.state import state_manager
from optimization.schemas import Ambulance, Hospital, Patient

router = APIRouter(prefix="/dispatch", tags=["Dispatch & Optimization"])


class ApprovalRequest(BaseModel):
    incident_id: str
    approved_assignment_patient_ids: List[str]


class OverrideRequest(BaseModel):
    patient_id: str
    ambulance_id: str
    hospital_id: str
    override_reason: str


@router.get("/status")
def get_current_status():
    """Returns current active crisis state (patients, ambulances, hospitals, roads)."""
    return {
        "incident_id": state_manager.active_incident_id,
        "patients_count": len(state_manager.patients),
        "available_ambulances_count": len([a for a in state_manager.ambulances if a.is_available]),
        "hospitals_count": len(state_manager.hospitals),
        "blocked_corridors": list(state_manager.road_network.blocked_segments),
        "has_latest_briefing": state_manager.latest_briefing is not None,
    }


@router.post("/optimize")
def run_optimization():
    """Runs the cognitive agent analysis and OR-Tools optimization pipeline."""
    result = state_manager.engine.orchestrator.process_and_optimize(
        incident_id=state_manager.active_incident_id,
        patients=state_manager.patients,
        ambulances=state_manager.ambulances,
        hospitals=state_manager.hospitals,
    )
    state_manager.latest_briefing = result["briefing"]
    return result


@router.post("/approve")
def approve_dispatch_plan(request: ApprovalRequest):
    """Commander 1-click execution for recommended dispatch assignments."""
    if not state_manager.latest_briefing:
        raise HTTPException(status_code=400, detail="No active dispatch briefing to approve.")

    approved_list = []
    actions = state_manager.latest_briefing.get("recommended_actions", [])

    for action in actions:
        if action["patient_id"] in request.approved_assignment_patient_ids:
            approved_list.append(action)
            # Mark ambulance as engaged
            for a in state_manager.ambulances:
                if a.id == action["assigned_ambulance"]:
                    a.is_available = False
                    a.current_assigned_patient_id = action["patient_id"]

    state_manager.approved_assignments.extend(approved_list)

    return {
        "status": "APPROVED",
        "approved_count": len(approved_list),
        "approved_actions": approved_list,
    }
