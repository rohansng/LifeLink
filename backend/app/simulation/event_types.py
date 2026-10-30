"""Event types and simulation schemas for LifeLink Incident Engine."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from backend.app.models.event import IncidentEvent
from backend.app.models.recommendation import Recommendation


class SimulationEventType(str, Enum):
    NEW_RESPONDER_REPORT = "NEW_RESPONDER_REPORT"
    NEW_IMAGE_EVIDENCE = "NEW_IMAGE_EVIDENCE"
    HOSPITAL_CAPACITY_CHANGE = "HOSPITAL_CAPACITY_CHANGE"
    ROAD_BLOCKED = "ROAD_BLOCKED"
    RESOURCE_SHORTAGE = "RESOURCE_SHORTAGE"
    HOSPITAL_RESOURCE_AVAILABLE = "HOSPITAL_RESOURCE_AVAILABLE"


class SimulationStepResult(BaseModel):
    step_number: int = Field(..., description="1-indexed step in the 5-event killer demo")
    total_steps: int = Field(default=5)
    event_type: SimulationEventType
    title: str = Field(..., description="Short operational event title")
    what_changed: str = Field(..., description="Explicit plain-English delta of what changed")
    affected_entities: List[str] = Field(default_factory=list, description="IDs and names of affected entities")
    state_delta: Dict[str, Any] = Field(default_factory=dict, description="Numerical/status deltas")
    resulting_recommendations: List[Recommendation] = Field(default_factory=list)
    timeline_entry: IncidentEvent
    is_completed: bool = False
