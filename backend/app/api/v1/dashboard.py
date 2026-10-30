"""Consolidated Dashboard API endpoint for high-speed frontend synchronization."""

from typing import Dict
from fastapi import APIRouter
from backend.app.data.repository import db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard_state() -> Dict:
    """Returns the unified disaster state across all 9 entities for immediate dashboard hydration."""
    incident = db.get_incident()
    return {
        "incident": incident.model_dump(),
        "statistics": incident.statistics.model_dump(),
        "sectors": [s.model_dump() for s in incident.sectors],
        "hospitals": [h.model_dump() for h in db.get_hospitals()],
        "ambulances": [a.model_dump() for a in db.get_ambulances()],
        "resources": [r.model_dump() for r in db.get_resources()],
        "roads": [rd.model_dump() for rd in db.get_roads()],
        "responders": [rp.model_dump() for rp in db.get_responders()],
        "events": [e.model_dump() for e in db.get_events()],
        "recommendations": [rec.model_dump() for rec in db.get_recommendations()],
    }


@router.post("/reset")
def reset_to_seed():
    """Resets all in-memory entities to initial train derailment synthetic seed data."""
    db.reset()
    return {"status": "SUCCESS", "message": "State reset to initial train derailment synthetic scenario."}
