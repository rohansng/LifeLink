"""REST API endpoints for LifeLink Phase 9 Command Center & Hero Action Queue."""

from typing import Dict
from fastapi import APIRouter, HTTPException

from backend.app.command_center.command_center_engine import command_center_engine
from backend.app.command_center.schemas import (
    CommandCenterActionQueue,
    PrioritizedActionItem,
    WhyInspectionData,
)

router = APIRouter(prefix="/command-center", tags=["Command Center & Hero Action Queue (Phase 9)"])


@router.get("/queue", response_model=CommandCenterActionQueue)
def get_command_center_action_queue():
    """Returns the master prioritized action queue synthesizing incident state, triage,
    hospital matching, routing, resource optimization, and active alerts.
    Includes the hero showcase (V083 -> AMB-04 -> Hospital B -> Route B -> 13 min).
    """
    return command_center_engine.build_action_queue()


@router.get("/actions/{action_id}/why", response_model=WhyInspectionData)
def get_action_why_breakdown(action_id: str):
    """Returns the transparent 'WHY?' clinical and operational justification for any recommendation."""
    queue = command_center_engine.build_action_queue()
    target = next((a for a in queue.action_queue if a.id == action_id), None)
    if not target:
        if queue.hero_showcase.id == action_id:
            return queue.hero_showcase.why_breakdown
        raise HTTPException(status_code=404, detail=f"Action {action_id} not found in Command Center queue")
    return target.why_breakdown


@router.post("/actions/{action_id}/execute")
def execute_command_action(action_id: str) -> Dict:
    """Authorizes and executes a prioritized action item from the Command Center."""
    result = command_center_engine.execute_action(action_id)
    return {
        "status": "EXECUTED",
        "action_id": action_id,
        "message": f"Action {action_id} authorized and dispatched to operational units.",
        "execution_details": result,
    }


@router.post("/actions/execute-all")
def execute_all_command_actions() -> Dict:
    """Authorizes and executes all pending command directives in the Command Center queue."""
    results = command_center_engine.execute_all_pending()
    return {
        "status": "BATCH_EXECUTED",
        "executed_count": len(results),
        "results": results,
    }

