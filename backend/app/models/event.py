"""Timeline event and incident log data model for LifeLink."""

from enum import Enum
from pydantic import BaseModel, Field


class EventCategory(str, Enum):
    DISPATCH = "DISPATCH"
    COMMAND = "COMMAND"
    TRIAGE = "TRIAGE"
    HOSPITAL = "HOSPITAL"
    OBSTACLE = "OBSTACLE"
    ALERT = "ALERT"


class EventSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class IncidentEvent(BaseModel):
    id: str = Field(..., description="Unique event identifier, e.g. EVT-01")
    timestamp: str = Field(..., description="Chronological time, e.g. 11:42:00")
    category: EventCategory = Field(default=EventCategory.COMMAND)
    title: str = Field(..., description="Short operational title")
    detail: str = Field(..., description="Detailed operational log note")
    severity: EventSeverity = Field(default=EventSeverity.INFO)


class IncidentEventCreate(BaseModel):
    timestamp: str
    category: EventCategory
    title: str
    detail: str
    severity: EventSeverity = EventSeverity.INFO
