"""Pydantic schemas for LifeLink Phase 9 Command Center & Hero Action Queue.

Every recommendation strictly implements:
  - priority
  - action
  - affected entity
  - reason
  - evidence
  - confidence
  - timestamp
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ActionPriority(str, Enum):
    P1 = "P1"  # Critical / Immediate life-threat
    P2 = "P2"  # Urgent / Serious
    P3 = "P3"  # Moderate / Advisory


class ActionStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    EXECUTED = "EXECUTED"


class WhyInspectionData(BaseModel):
    """Detailed clinical, operational, and routing justification for the 'WHY?' modal."""
    chosen_entity_name: str = Field(..., description="Selected destination hospital or asset")
    selection_criteria: List[str] = Field(default_factory=list, description="Positive match criteria with checkmarks")
    rejected_alternatives: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of alternative facilities/routes with specific rejection reasons",
    )
    allocated_resources: List[str] = Field(default_factory=list, description="Resource bundle assigned")
    corridor_decision: Optional[str] = Field(None, description="Routing rationale, e.g. Route A closed -> Route B open")
    clinical_tradeoff_summary: str = Field(..., description="High-level commander rationale")


class PrioritizedActionItem(BaseModel):
    """A single tactical directive in the Command Center's prioritized action queue."""
    id: str = Field(..., description="Unique action ID, e.g. 'CMD-ACT-001'")
    priority: ActionPriority = Field(..., description="P1, P2, P3")
    action: str = Field(..., description="Actionable directive, e.g. 'ASSIGN AMBULANCE-04 to VICTIM-083...'")
    affected_entity: str = Field(..., description="Target casualty, fleet unit, or facility")
    reason: str = Field(..., description="Crisp clinical & operational justification")
    evidence: List[str] = Field(default_factory=list, description="Bullet points of verified factual evidence")
    confidence: float = Field(default=0.98, ge=0.0, le=1.0, description="Algorithmic confidence score")
    timestamp: str = Field(..., description="ISO 8601 generation timestamp")
    status: ActionStatus = Field(default=ActionStatus.PENDING, description="PENDING, APPROVED, EXECUTED")

    # Granular entity links for UI rendering
    victim_id: Optional[str] = None
    victim_condition: Optional[str] = None
    ambulance_id: Optional[str] = None
    ambulance_callsign: Optional[str] = None
    hospital_id: Optional[str] = None
    hospital_name: Optional[str] = None
    route_name: Optional[str] = None
    eta_minutes: Optional[float] = None

    # Deep 'WHY?' breakdown
    why_breakdown: WhyInspectionData


class CommandCenterActionQueue(BaseModel):
    """Consolidated Command Center action queue output."""
    timestamp: str
    headline: str
    threat_level: str
    total_actions: int
    p1_count: int
    p2_count: int
    p3_count: int
    hero_showcase: PrioritizedActionItem = Field(..., description="Hero showcase action: V083 -> AMB-04 -> Hospital B -> Route B (13m)")
    action_queue: List[PrioritizedActionItem] = Field(default_factory=list)

