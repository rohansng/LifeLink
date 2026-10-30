"""Shared location schema for LifeLink models."""

from typing import Optional
from pydantic import BaseModel, Field


class Location(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS84 Latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS84 Longitude")
    address: Optional[str] = Field(None, description="Street or facility address")
    sector: Optional[str] = Field(None, description="Incident operational sector/zone")
