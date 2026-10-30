"""Deterministic Hospital Matching REST endpoints for LifeLink."""

from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.data.repository import db
from backend.app.matching.hospital_matcher import hospital_matcher
from backend.app.matching.schemas import HospitalMatchResult
from backend.app.models.victim import VictimSeverity

router = APIRouter(prefix="/matching", tags=["Hospital Matching Engine"])


@router.get("/hospital/{victim_id}", response_model=HospitalMatchResult)
def get_hospital_match_for_victim(victim_id: str):
    """Evaluates all regional receiving facilities for a specific casualty and provides
    a deterministic match recommendation with full 'WHY?' justification.
    """
    victim = db.get_victim(victim_id)
    if not victim:
        raise HTTPException(status_code=404, detail=f"Victim {victim_id} not found")

    hospitals = list(db.hospitals.values())
    roads = list(db.roads.values())

    return hospital_matcher.match_victim_to_hospital(
        victim=victim,
        hospitals=hospitals,
        roads=roads,
    )


@router.get("/queue")
def get_hospital_matches_for_queue(
    severity: Optional[str] = Query(None, description="critical, serious, all"),
    limit: int = Query(50, ge=1, le=250),
) -> Dict:
    """Computes destination recommendations across the active casualty queue."""
    all_victims = list(db.victims.values())
    hospitals = list(db.hospitals.values())
    roads = list(db.roads.values())

    if severity == "critical":
        targets = [v for v in all_victims if v.severity == VictimSeverity.CRITICAL]
    elif severity == "serious":
        targets = [v for v in all_victims if v.severity == VictimSeverity.SERIOUS]
    else:
        # Prioritize critical and serious first
        targets = sorted(
            all_victims,
            key=lambda v: 0 if v.severity == VictimSeverity.CRITICAL else (1 if v.severity == VictimSeverity.SERIOUS else 2),
        )

    results = [
        hospital_matcher.match_victim_to_hospital(v, hospitals, roads).model_dump(mode="json")
        for v in targets[:limit]
    ]

    return {
        "total_evaluated": len(results),
        "matches": results,
    }


@router.post("/hospital/{victim_id}/assign")
def assign_hospital_to_victim(
    victim_id: str,
    hospital_id: Optional[str] = Query(None, description="Optional target hospital ID. If omitted, assigns recommended."),
) -> Dict:
    """Commits destination hospital assignment to database state."""
    victim = db.get_victim(victim_id)
    if not victim:
        raise HTTPException(status_code=404, detail=f"Victim {victim_id} not found")

    hospitals = list(db.hospitals.values())
    roads = list(db.roads.values())

    match_res = hospital_matcher.match_victim_to_hospital(victim, hospitals, roads)
    target_id = hospital_id or match_res.recommended_hospital.hospital_id

    victim.assigned_hospital_id = target_id
    db.victims[victim_id] = victim

    return {
        "status": "ASSIGNED",
        "victim_id": victim_id,
        "assigned_hospital_id": target_id,
        "recommended_hospital_id": match_res.recommended_hospital.hospital_id,
        "hospital_name": match_res.recommended_hospital.hospital_name,
        "why": match_res.why_explanation,
    }

