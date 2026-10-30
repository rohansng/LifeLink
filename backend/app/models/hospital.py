"""Hospital data model for LifeLink."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from backend.app.models.location import Location


class HospitalBloodInventory(BaseModel):
    O_negative: int = Field(default=0, ge=0, description="Critical universal donor units")
    O_positive: Optional[int] = Field(default=0, ge=0)
    A_positive: Optional[int] = Field(default=0, ge=0)


class Hospital(BaseModel):
    id: str = Field(..., description="Unique hospital identifier, e.g. H-A, H-B, H-C")
    name: str = Field(..., description="Full facility name")
    type: str = Field(default="Trauma Center", description="Facility designation, e.g. Level 1 Trauma Center")
    location: Location = Field(..., description="Geospatial location coordinates")
    icu: int = Field(..., ge=0, description="Available ICU critical care beds")
    icu_total: int = Field(..., ge=1, description="Total licensed ICU capacity")
    trauma_available: bool = Field(default=True, description="Active emergency trauma reception capability")
    operating_rooms_open: int = Field(default=1, ge=0, description="Available surgical suites")
    burn_beds_available: int = Field(default=0, ge=0, description="Dedicated burn intensive care beds")
    ventilators_available: int = Field(default=2, ge=0, description="Available mechanical ICU ventilators")
    doctors_available: int = Field(default=4, ge=0, description="On-duty trauma surgeons and intensivists")
    trauma_teams_available: int = Field(default=1, ge=0, description="Staffed active surgical resuscitation teams")
    blood: HospitalBloodInventory = Field(default_factory=HospitalBloodInventory, description="Blood reserve inventory")
    supported_specialties: List[str] = Field(default_factory=list, description="Clinical specialties staffed")
    eta_minutes: float = Field(default=10.0, ge=0.0, description="Estimated transit time from incident epicenter")
    distance_km: float = Field(default=5.0, ge=0.0, description="Distance from incident epicenter in km")
    status: str = Field(default="SURGE_ACTIVE", description="Operational surge status")


class HospitalUpdate(BaseModel):
    icu: Optional[int] = None
    trauma_available: Optional[bool] = None
    operating_rooms_open: Optional[int] = None
    status: Optional[str] = None
