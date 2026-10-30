"""Tactical Recommendation data model for LifeLink.

Enforces: Every major recommendation MUST have an explanation.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class RecommendationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTED = "executed"


class RecommendationSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    URGENT = "URGENT"
    ADVISORY = "ADVISORY"


class Recommendation(BaseModel):
    id: str = Field(..., description="Unique recommendation ID, e.g. REC-01")
    title: str = Field(..., description="Directive headline")
    severity: RecommendationSeverity = Field(default=RecommendationSeverity.URGENT)
    status: RecommendationStatus = Field(default=RecommendationStatus.PENDING)
    action_type: str = Field(..., description="MUTUAL_AID, REVERSE_TRIAGE, AIR_EVAC, DETOUR")
    explanation: str = Field(..., description="Mandatory rationale explaining clinical or logistical necessity")
    suggested_action: str = Field(..., description="1-Click actionable command trigger")
    badge: str = Field(default="DECISION REQUIRED")


class RecommendationUpdate(BaseModel):
    status: RecommendationStatus
    commander_notes: Optional[str] = None
