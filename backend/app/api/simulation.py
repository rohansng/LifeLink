"""Simulation and Dynamic Disruption API endpoints for LifeLink."""

from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.core.state import state_manager
from simulation.events import DisruptionType, SimulationEvent

router = APIRouter(prefix="/simulation", tags=["Simulation & Disruption"])


class RoadBlockRequest(BaseModel):
    segment_id: str
    reason: str


class HospitalCapacityShiftRequest(BaseModel):
    hospital_id: str
    delta: int
    reason: str


@router.post("/disrupt/road")
def trigger_road_blockage(req: RoadBlockRequest):
    """Simulates dynamic road closure and fires automated replanning."""
    event = SimulationEvent(
        event_id=f"EVT-ROAD-{req.segment_id}",
        event_type=DisruptionType.ROAD_BLOCKAGE,
        timestamp_seconds=0.0,
        description=req.reason,
        payload={"segment_id": req.segment_id},
    )
    replan_result = state_manager.engine.apply_event_and_replan(
        event=event,
        incident_id=state_manager.active_incident_id,
        patients=state_manager.patients,
        ambulances=state_manager.ambulances,
        hospitals=state_manager.hospitals,
    )
    state_manager.latest_briefing = replan_result["updated_briefing"]
    return replan_result


@router.post("/disrupt/icu")
def trigger_icu_capacity_shift(req: HospitalCapacityShiftRequest):
    """Simulates sudden hospital ICU drop and triggers instant replanning."""
    event = SimulationEvent(
        event_id=f"EVT-ICU-{req.hospital_id}",
        event_type=DisruptionType.ICU_CAPACITY_CHANGE,
        timestamp_seconds=0.0,
        description=req.reason,
        payload={"hospital_id": req.hospital_id, "delta": req.delta},
    )
    replan_result = state_manager.engine.apply_event_and_replan(
        event=event,
        incident_id=state_manager.active_incident_id,
        patients=state_manager.patients,
        ambulances=state_manager.ambulances,
        hospitals=state_manager.hospitals,
    )
    state_manager.latest_briefing = replan_result["updated_briefing"]
    return replan_result


@router.post("/reset")
def reset_scenario():
    """Resets simulator to baseline crisis state."""
    state_manager.reset_to_default_scenario()
    return {"status": "RESET_SUCCESSFUL", "message": "Highway 101 crisis scenario reinitialized."}
