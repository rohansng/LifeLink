"""Victim data model for LifeLink."""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from backend.app.models.location import Location


class VictimSeverity(str, Enum):
    CRITICAL = "critical"   # Red triage (immediate life-threat)
    SERIOUS = "serious"     # Yellow triage (delayed)
    MODERATE = "moderate"   # Green triage (minor/walking wounded)
    UNKNOWN = "unknown"     # Rubble / unextricated


class VictimStatus(str, Enum):
    UNASSIGNED = "unassigned"
    ASSIGNED = "assigned"
    EXTRICATING = "extricating"
    IN_TRANSIT = "in_transit"
    ADMITTED = "admitted"
    DECEASED = "deceased"


class Victim(BaseModel):
    id: str = Field(..., description="Unique victim identifier, e.g. V083")
    severity: VictimSeverity = Field(..., description="Triage severity classification")
    location: Location = Field(..., description="Geospatial coordinates and sector")
    required_capability: str = Field(..., description="Clinical specialty required, e.g. trauma, neurosurgery, burn")
    status: VictimStatus = Field(default=VictimStatus.UNASSIGNED, description="Current dispatch & transit status")
    triage_tag: str = Field(default="RED", description="Visual triage color tag")
    assigned_ambulance_id: Optional[str] = Field(None, description="Assigned transport ambulance ID")
    assigned_hospital_id: Optional[str] = Field(None, description="Destination receiving hospital ID")
    notes: Optional[str] = Field(None, description="Paramedic assessment or injury details")


class VictimUpdate(BaseModel):
    severity: Optional[VictimSeverity] = None
    status: Optional[VictimStatus] = None
    assigned_ambulance_id: Optional[str] = None
    assigned_hospital_id: Optional[str] = None
    notes: Optional[str] = None
