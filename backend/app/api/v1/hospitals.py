"""Hospitals REST endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.data.repository import db
from backend.app.models import Hospital, HospitalUpdate

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])


@router.get("", response_model=List[Hospital])
def list_hospitals():
    """Returns regional receiving trauma centers and current bed capacity."""
    return db.get_hospitals()


@router.get("/{hospital_id}", response_model=Hospital)
def get_hospital(hospital_id: str):
    """Returns capacity, surgical suites, and blood reserves for a hospital."""
    hosp = db.get_hospital(hospital_id)
    if not hosp:
        raise HTTPException(status_code=404, detail=f"Hospital {hospital_id} not found")
    return hosp


@router.patch("/{hospital_id}", response_model=Hospital)
def update_hospital(hospital_id: str, update: HospitalUpdate):
    """Updates ICU availability or trauma reception status."""
    hosp = db.update_hospital(hospital_id, **update.model_dump(exclude_unset=True))
    if not hosp:
        raise HTTPException(status_code=404, detail=f"Hospital {hospital_id} not found")
    return hosp
