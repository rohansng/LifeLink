"""Ambulances REST endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.data.repository import db
from backend.app.models import Ambulance, AmbulanceUpdate

router = APIRouter(prefix="/ambulances", tags=["Ambulances"])


@router.get("", response_model=List[Ambulance])
def list_ambulances():
    """Returns all active EMS ambulance transport units."""
    return db.get_ambulances()


@router.get("/{ambulance_id}", response_model=Ambulance)
def get_ambulance(ambulance_id: str):
    """Returns telemetry and crew information for a specific ambulance."""
    amb = db.get_ambulance(ambulance_id)
    if not amb:
        raise HTTPException(status_code=404, detail=f"Ambulance {ambulance_id} not found")
    return amb


@router.patch("/{ambulance_id}", response_model=Ambulance)
def update_ambulance(ambulance_id: str, update: AmbulanceUpdate):
    """Updates ambulance operational status, location, or assigned destination."""
    amb = db.update_ambulance(ambulance_id, **update.model_dump(exclude_unset=True))
    if not amb:
        raise HTTPException(status_code=404, detail=f"Ambulance {ambulance_id} not found")
    return amb
