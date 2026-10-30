"""REST API endpoints for LifeLink Phase 10 Continuous Replanning."""

from typing import Dict, List
from fastapi import APIRouter

from backend.app.replanning import (
    ReplanningPlanState,
    TriggerReplanRequest,
    replanning_engine,
)

router = APIRouter(prefix="/replanning", tags=["Continuous Replanning Engine (Phase 10)"])


@router.get("/current", response_model=ReplanningPlanState)
def get_current_plan():
    """Returns active crisis plan state (version, diffs, affected victims, and reason)."""
    return replanning_engine.get_current_plan()


@router.get("/history", response_model=List[ReplanningPlanState])
def get_replanning_history():
    """Returns audit log of all previous plan versions."""
    return replanning_engine.get_history()


@router.post("/trigger", response_model=ReplanningPlanState)
def trigger_continuous_replan(payload: TriggerReplanRequest):
    """Triggers the full continuous replanning loop on state update."""
    return replanning_engine.trigger_replan(
        event_type=payload.event_type,
        reason=payload.reason,
        hospital_id=payload.hospital_id,
        new_icu=payload.new_icu_capacity,
        road_id=payload.road_id,
        casualty_id=payload.casualty_id,
    )


@router.post("/demo-event", response_model=ReplanningPlanState)
def trigger_demo_replan_event():
    """Triggers the exact showcase replanning scenario:
    PLAN v12
    Reason: Hospital B ICU capacity decreased from 2 to 1.
    Changed: V129 Hospital B -> Hospital C
    Reason: Hospital C now provides feasible ICU capacity.
    """
    return replanning_engine.trigger_replan(
        event_type="HOSPITAL_CAPACITY_CHANGE",
        reason="Hospital B ICU capacity decreased from 2 to 1.",
        hospital_id="H-B",
        new_icu=1,
    )

