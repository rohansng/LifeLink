"""Schemas for LifeLink Deterministic Triage & Priority Engine."""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class PriorityTier(str, Enum):
    P1 = "P1"  # Critical (Immediate / Resuscitation / Golden-Hour)
    P2 = "P2"  # Serious (Urgent / Delayed)
    P3 = "P3"  # Moderate (Minor / Walking Wounded)
    P4 = "P4"  # Unknown / Needs Assessment / Expectant


class ScoreBreakdown(BaseModel):
    severity_points: float = Field(..., description="Base score from START triage severity classification")
    urgency_points: float = Field(..., description="Acuity, hemorrhage rate, and airway compromise factors")
    capability_points: float = Field(..., description="Weight of required medical specialty")
    transport_penalty: float = Field(..., description="Subtracted transit time penalty to definitive care")
    resource_availability_points: float = Field(..., description="Bonus for available ICU beds and staffed surgical suites")
    total_score: float = Field(..., description="Final deterministic priority score")


class PriorityAssessment(BaseModel):
    victim_id: str = Field(..., description="Unique victim ID, e.g. V083")
    priority: PriorityTier = Field(..., description="P1, P2, P3, or P4")
    score: float = Field(..., description="Calculated priority score")
    reason: str = Field(..., description="Human-readable clinical and logistical explanation")
    required_capability: str = Field(..., description="Clinical specialty needed, e.g. Trauma + ICU")
    severity: str = Field(default="critical", description="Base triage severity: critical, serious, moderate, unknown")
    sector: Optional[str] = Field(None, description="Incident sector, e.g. Sector Alpha")
    triage_tag: str = Field(default="RED", description="Visual triage tag: RED, YELLOW, GREEN, UNKNOWN")
    breakdown: ScoreBreakdown = Field(..., description="Transparent mathematical score components")
