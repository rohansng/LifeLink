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
