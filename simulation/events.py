"""Disaster disruption events for the LifeLink Simulation Engine."""

from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class DisruptionType(str, Enum):
    ROAD_BLOCKAGE = "ROAD_BLOCKAGE"
    ROAD_REOPEN = "ROAD_REOPEN"
    ICU_CAPACITY_CHANGE = "ICU_CAPACITY_CHANGE"
    BLOOD_SHORTAGE = "BLOOD_SHORTAGE"
    NEW_HOSPITAL_ONLINE = "NEW_HOSPITAL_ONLINE"
    CASUALTY_SURGE = "CASUALTY_SURGE"
    AMBULANCE_BREAKDOWN = "AMBULANCE_BREAKDOWN"


class SimulationEvent(BaseModel):
    event_id: str
    event_type: DisruptionType
    timestamp_seconds: float
    description: str
    payload: Dict[str, Any] = Field(default_factory=dict)
