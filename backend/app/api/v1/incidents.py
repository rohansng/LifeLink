"""Incident REST endpoints."""

from fastapi import APIRouter, HTTPException
from backend.app.data.repository import db
from backend.app.models import Incident, IncidentStatistics, IncidentUpdate

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("", response_model=Incident)
def get_current_incident():
    """Returns the primary active mass-casualty incident."""
    return db.get_incident()


@router.get("/statistics", response_model=IncidentStatistics)
def get_incident_statistics():
    """Returns aggregate triage and resource statistics."""
    return db.get_incident().statistics


@router.patch("/{incident_id}", response_model=Incident)
def update_incident(incident_id: str, update: IncidentUpdate):
    """Updates operational status of the incident."""
    inc = db.get_incident()
    if inc.id != incident_id:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    for k, v in update.model_dump(exclude_unset=True).items():
        setattr(inc, k, v)
    return inc
