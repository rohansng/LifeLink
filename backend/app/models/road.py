"""Road network corridor and obstacle data model for LifeLink."""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RoadStatus(str, Enum):
    OPEN = "open"
    CONGESTED = "congested"
    CLOSED = "closed"


class Road(BaseModel):
    id: str = Field(..., description="Corridor segment identifier, e.g. ROAD-01")
    name: str = Field(..., description="Highway or avenue name")
    status: RoadStatus = Field(default=RoadStatus.OPEN, description="Current corridor traversal status")
    reason: Optional[str] = Field(None, description="Cause of closure or delay")
    detour_penalty_minutes: float = Field(default=0.0, ge=0.0, description="Transit delay added to routes")
    start_latitude: float = Field(...)
    start_longitude: float = Field(...)
    end_latitude: float = Field(...)
    end_longitude: float = Field(...)


class RoadUpdate(BaseModel):
    status: Optional[RoadStatus] = None
    reason: Optional[str] = None
    detour_penalty_minutes: Optional[float] = None
