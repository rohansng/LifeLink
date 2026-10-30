"""Victims REST endpoints."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.data.repository import db
from backend.app.models import Victim, VictimSeverity, VictimStatus, VictimUpdate

router = APIRouter(prefix="/victims", tags=["Victims"])


@router.get("", response_model=List[Victim])
def list_victims(
    severity: Optional[VictimSeverity] = Query(None, description="Filter by triage severity: critical, serious, moderate, unknown"),
    status: Optional[VictimStatus] = Query(None, description="Filter by dispatch status: unassigned, assigned, in_transit"),
    limit: int = Query(250, ge=1, le=500),
):
    """Returns list of tracked casualties with optional filtering."""
    return db.get_victims(severity=severity, status=status, limit=limit)


@router.get("/{victim_id}", response_model=Victim)
def get_victim(victim_id: str):
    """Returns details for a specific victim."""
    v = db.get_victim(victim_id)
    if not v:
        raise HTTPException(status_code=404, detail=f"Victim {victim_id} not found")
    return v


@router.patch("/{victim_id}", response_model=Victim)
def update_victim(victim_id: str, update: VictimUpdate):
    """Updates triage classification or transport assignment for a victim."""
    v = db.update_victim(victim_id, **update.model_dump(exclude_unset=True))
    if not v:
        raise HTTPException(status_code=404, detail=f"Victim {victim_id} not found")
    return v
