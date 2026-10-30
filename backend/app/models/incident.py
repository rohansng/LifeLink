"""Incident data model for LifeLink."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from backend.app.models.location import Location


class IncidentStatistics(BaseModel):
    total_victims: int = Field(default=214)
    critical: int = Field(default=31)
    serious: int = Field(default=67)
    moderate: int = Field(default=82)
    unknown: int = Field(default=34)
    total_ambulances: int = Field(default=5)
    active_ambulances: int = Field(default=5)
    total_hospitals: int = Field(default=3)
    total_icu_beds: int = Field(default=4)
    unassigned_critical: int = Field(default=27)


class IncidentSector(BaseModel):
    id: str
    name: str
    description: str
    location: Location
    radius_meters: float
    total_victims: int
    critical_count: int
    serious_count: int
    moderate_count: int
    unknown_count: int
    hazard: str
    access_status: str


class Incident(BaseModel):
    id: str = Field(..., description="Unique incident identifier, e.g. INC-2026-001")
    codename: str = Field(..., description="Tactical incident name")
    type: str = Field(..., description="Crisis classification, e.g. Train Derailment & HazMat")
    severity: str = Field(..., description="Emergency tier, e.g. Level 3 Mass Casualty (Code Black)")
    location: Location = Field(..., description="Incident epicenter")
    declared_at: str = Field(..., description="Declaration timestamp, e.g. 11:42:00")
    elapsed_minutes: int = Field(default=14, ge=0)
    status: str = Field(default="active", description="active, contained, resolved")
    summary: str = Field(..., description="High-level tactical situational summary")
    sectors: List[IncidentSector] = Field(default_factory=list)
    statistics: IncidentStatistics = Field(default_factory=IncidentStatistics)


class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    summary: Optional[str] = None
    elapsed_minutes: Optional[int] = None
