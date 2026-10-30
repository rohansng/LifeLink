"""Ambulance Assignment and Routing REST endpoints for LifeLink."""

from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.data.repository import db
from backend.app.models.victim import VictimSeverity
from backend.app.routing.routing_engine import routing_engine
from backend.app.routing.schemas import DispatchChain, RoadBlockEventRequest, RoadBlockEventResult

router = APIRouter(prefix="/routing", tags=["Ambulance & Routing Engine"])


@router.get("/chain/{victim_id}", response_model=DispatchChain)
def get_dispatch_chain_for_victim(victim_id: str):
    """Returns the end-to-end dispatch and routing chain:
    Victim → Ambulance → Hospital → Route → ETA
    """
    victim = db.get_victim(victim_id)
    if not victim:
        raise HTTPException(status_code=404, detail=f"Victim {victim_id} not found")

    ambulances = list(db.ambulances.values())
    hospitals = list(db.hospitals.values())
    roads = list(db.roads.values())

    return routing_engine.build_dispatch_chain(victim, ambulances, hospitals, roads)


@router.get("/chains")
def get_all_dispatch_chains(
    limit: int = Query(25, ge=1, le=100),
) -> Dict:
    """Returns dispatch chains across high-priority casualties."""
    victims = list(db.victims.values())
    ambulances = list(db.ambulances.values())
    hospitals = list(db.hospitals.values())
    roads = list(db.roads.values())

    # Prioritize critical and serious casualties (V083, V041, V112 upfront)
    priority_order = {"V083": 0, "V041": 1, "V112": 2}
    sorted_victims = sorted(
        victims,
        key=lambda v: (
            priority_order.get(v.id, 99),
            0 if v.severity == VictimSeverity.CRITICAL else (1 if v.severity == VictimSeverity.SERIOUS else 2),
            v.id,
        ),
    )

    chains = [
        routing_engine.build_dispatch_chain(v, ambulances, hospitals, roads)
        for v in sorted_victims[:limit]
    ]

    return {
        "total_chains": len(chains),
        "chains": [c.model_dump(mode="json") for c in chains],
        "exemplar_summary": chains[0].chain_summary if chains else "",
    }


@router.post("/road-block", response_model=RoadBlockEventResult)
def trigger_road_block_event(request: Optional[RoadBlockEventRequest] = None):
    """Simulates a dynamic ROAD BLOCKED event:
    - Identifies affected ambulances
    - Calculates alternate route (Route A ❌ → Route B ✓)
    - Updates simulated ETA
    - Generates tactical detour recommendation
    """
    req = request or RoadBlockEventRequest()
    return routing_engine.handle_road_block_event(
        road_id=req.road_id,
        new_status=req.status,
        reason=req.reason,
        detour_penalty_minutes=req.detour_penalty_minutes or 14.0,
    )


@router.post("/road-unblock")
def clear_road_block(road_id: str = "ROAD-01") -> Dict:
    """Restores a severed road corridor back to open status."""
    return routing_engine.handle_road_block_event(
        road_id=road_id,
        new_status="open",
        reason="Corridor cleared by heavy rescue engineers",
        detour_penalty_minutes=0.0,
    ).model_dump(mode="json")

