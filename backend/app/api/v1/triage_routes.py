"""Triage and Priority Queue REST endpoints."""

from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from backend.app.data.repository import db
from backend.app.models.victim import Victim
from backend.app.triage.schemas import PriorityAssessment, PriorityTier
from backend.app.triage.scoring_engine import triage_engine

router = APIRouter(prefix="/triage", tags=["Triage & Priority Engine"])


@router.get("/queue")
def get_triage_priority_queue(
    tier: Optional[PriorityTier] = None,
    sector: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 250,
) -> Dict:
    """Returns the deterministically calculated casualty priority queue.
    Formula: Severity + Urgency + Capability - Transport Penalty + Resource Availability
    """
    victims = list(db.victims.values())
    hospitals = list(db.hospitals.values())
    ambulances = list(db.ambulances.values())
    roads = list(db.roads.values())

    all_assessments = triage_engine.evaluate_queue(
        victims=victims,
        hospitals=hospitals,
        ambulances=ambulances,
        roads=roads,
    )

    p1_count = sum(1 for a in all_assessments if a.priority == PriorityTier.P1)
    p2_count = sum(1 for a in all_assessments if a.priority == PriorityTier.P2)
    p3_count = sum(1 for a in all_assessments if a.priority == PriorityTier.P3)
    p4_count = sum(1 for a in all_assessments if a.priority == PriorityTier.P4)

    filtered = all_assessments
    if tier:
        filtered = [a for a in filtered if a.priority == tier]

    if sector:
        filtered = [a for a in filtered if sector.lower() in (a.sector or "").lower()]

    if search:
        s = search.lower()
        filtered = [
            a for a in filtered
            if s in a.victim_id.lower() or s in a.required_capability.lower() or s in a.reason.lower()
        ]

    # Specific showcase items (V083, V041, V112)
    showcase_ids = ["V083", "V041", "V112"]
    showcase = [a.model_dump(mode="json") for a in all_assessments if a.victim_id in showcase_ids]

    return {
        "total_assessed": len(all_assessments),
        "counts": {
            "P1": p1_count,
            "P2": p2_count,
            "P3": p3_count,
            "P4": p4_count,
        },
        "formula": "Priority Score = severity + urgency + capability - transport time + resource availability",
        "showcase": showcase,
        "queue": [a.model_dump(mode="json") for a in filtered[:limit]],
    }


@router.get("/queue/{victim_id}", response_model=PriorityAssessment)
def get_victim_priority(victim_id: str):
    """Returns detailed priority assessment and mathematical component breakdown for a casualty."""
    victim = db.get_victim(victim_id)
    if not victim:
        raise HTTPException(status_code=404, detail=f"Victim {victim_id} not found")

    hospitals = list(db.hospitals.values())
    ambulances = list(db.ambulances.values())
    roads = list(db.roads.values())

    return triage_engine.calculate_priority(victim, hospitals, ambulances, roads)


@router.post("/evaluate", response_model=PriorityAssessment)
def evaluate_custom_victim(victim: Victim):
    """Evaluates an arbitrary casualty payload against current situational parameters."""
    hospitals = list(db.hospitals.values())
    ambulances = list(db.ambulances.values())
    roads = list(db.roads.values())
    return triage_engine.calculate_priority(victim, hospitals, ambulances, roads)
