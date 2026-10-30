"""First responder and tactical commander data model for LifeLink."""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from backend.app.models.location import Location


class ResponderRole(str, Enum):
    INCIDENT_COMMANDER = "incident_commander"
    TRIAGE_OFFICER = "triage_officer"
    LEAD_PARAMEDIC = "lead_paramedic"
    HAZMAT_SPECIALIST = "hazmat_specialist"
    RESCUE_CHIEF = "rescue_chief"


class ResponderStatus(str, Enum):
    ON_SCENE = "on_scene"
    IN_TRANSIT = "in_transit"
    STAGING = "staging"
    OFF_DUTY = "off_duty"


class Responder(BaseModel):
    id: str = Field(..., description="Unique responder badge ID, e.g. RESP-01")
    name: str = Field(..., description="Full officer or paramedic name")
    agency: str = Field(..., description="Department, e.g. Metro Fire & Rescue, County EMS")
    role: ResponderRole = Field(..., description="Operational crisis role")
    status: ResponderStatus = Field(default=ResponderStatus.ON_SCENE)
    location: Location = Field(...)
    assigned_sector: Optional[str] = Field(None, description="Assigned incident zone")
    radio_channel: str = Field(default="TAC-1")


class ResponderUpdate(BaseModel):
    status: Optional[ResponderStatus] = None
    assigned_sector: Optional[str] = None
    radio_channel: Optional[str] = None
