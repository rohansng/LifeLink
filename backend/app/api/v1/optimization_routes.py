"""Deterministic Resource Optimization REST endpoints for LifeLink.

Powered by Google OR-Tools MILP allocation engine.
Enforces multi-resource hard bounds (ICU, blood, ventilators, doctors, trauma teams, ambulances, rescue squads).
"""

from typing import Dict, Optional
from fastapi import APIRouter, Query
from backend.app.data.repository import db
from backend.app.resource_optimization.optimizer import resource_optimizer
from backend.app.resource_optimization.schemas import (
    OptimizationSolutionResult,
    TrackedResourceInventory,
)

router = APIRouter(prefix="/optimization", tags=["Resource Optimization Engine (OR-Tools)"])


@router.post("/solve", response_model=OptimizationSolutionResult)
def run_resource_optimization(
    max_seconds: float = 3.0,
):
    """Executes the Google OR-Tools MILP multi-resource constrained optimizer across
    the active casualty queue, receiving hospitals, and ambulance fleet.
    """
    if not isinstance(max_seconds, (int, float)):
        max_seconds = 3.0
    victims = list(db.victims.values())
    hospitals = list(db.hospitals.values())
    ambulances = list(db.ambulances.values())
    roads = list(db.roads.values())

    result = resource_optimizer.optimize_resources(
        victims=victims,
        hospitals=hospitals,
        ambulances=ambulances,
        roads=roads,
        max_solve_time_seconds=max_seconds,
    )
    return result


@router.get("/resources")
def get_tracked_resources_and_conflicts() -> Dict:
    """Returns current regional tracked inventory, active bottlenecks, and recommended reallocations."""
    victims = list(db.victims.values())
    hospitals = list(db.hospitals.values())
    ambulances = list(db.ambulances.values())
    roads = list(db.roads.values())

    # Fast solve to obtain current inventory and bottleneck state
    result = resource_optimizer.optimize_resources(
        victims=victims,
        hospitals=hospitals,
        ambulances=ambulances,
        roads=roads,
        max_solve_time_seconds=2.0,
    )

    return {
        "tracked_resources": result.tracked_resources.model_dump(),
        "total_high_priority_victims": result.total_high_priority_victims,
        "served_victims_count": result.served_victims_count,
        "unassigned_victims_count": result.unassigned_victims_count,
        "resource_conflicts": [c.model_dump() for c in result.resource_conflicts],
        "recommended_reallocations": [r.model_dump() for r in result.recommended_reallocations],
        "solver_status": result.solver_status,
        "solve_time_ms": result.solve_time_ms,
    }
