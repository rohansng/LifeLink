"""Ambulance and EMS unit data model for LifeLink."""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.models.location import Location


class AmbulanceType(str, Enum):
    ALS = "ALS"  # Advanced Life Support
    BLS = "BLS"  # Basic Life Support


class AmbulanceStatus(str, Enum):
    AVAILABLE = "available"
    DISPATCHED = "dispatched"
    EXTRICATING = "extricating"
    TRANSPORTING = "transporting"
    STAGED = "staged"
    MAINTENANCE = "maintenance"


class Ambulance(BaseModel):
    id: str = Field(..., description="Unique vehicle ID, e.g. AMB-01")
    callsign: str = Field(..., description="Radio callsign, e.g. Medic 1")
    type: AmbulanceType = Field(default=AmbulanceType.ALS, description="Care level: ALS or BLS")
    status: AmbulanceStatus = Field(default=AmbulanceStatus.DISPATCHED, description="Operational status")
    location: Location = Field(..., description="Current GPS telemetry location")
    capacity: int = Field(default=1, ge=1, le=4, description="Stretcher patient capacity")
    assigned_victim_id: Optional[str] = Field(None, description="Current assigned patient")
    destination_hospital_id: Optional[str] = Field(None, description="Receiving hospital ID")
    assignment_description: str = Field(default="Staged", description="Human-readable assignment summary")
    eta_scene_minutes: Optional[float] = Field(None, description="ETA to patient scene")
    eta_hospital_minutes: Optional[float] = Field(None, description="ETA to receiving hospital")
    crew_lead: str = Field(..., description="Paramedic in charge")
    equipment: List[str] = Field(default_factory=list, description="On-board specialized medical equipment")


class AmbulanceUpdate(BaseModel):
    status: Optional[AmbulanceStatus] = None
    location: Optional[Location] = None
    assigned_victim_id: Optional[str] = None
    destination_hospital_id: Optional[str] = None
    assignment_description: Optional[str] = None
    eta_hospital_minutes: Optional[float] = None
