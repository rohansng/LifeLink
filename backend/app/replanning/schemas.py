"""Pydantic schemas for LifeLink Phase 10 Continuous Replanning Engine.

Tracks plan versioning, assignment diffs, trigger events, and timeline audits.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AssignmentDiff(BaseModel):
    """Represents a specific assignment modification caused by a replan event."""
    victim_id: str = Field(..., description="Casualty ID, e.g. 'V129'")
    victim_condition: str = Field(default="Critical trauma presentation")
    previous_destination: str = Field(..., description="Previous receiving hospital, e.g. 'Hospital B'")
    new_destination: str = Field(..., description="New receiving hospital, e.g. 'Hospital C'")
    previous_ambulance: Optional[str] = None
    new_ambulance: Optional[str] = None
    previous_route: Optional[str] = None
    new_route: Optional[str] = None
    previous_eta: Optional[float] = None
    new_eta: Optional[float] = None
    change_reason: str = Field(..., description="Explicit rationale, e.g. 'Hospital C now provides feasible ICU capacity.'")


class ReplanningPlanState(BaseModel):
    """Snapshot of a plan version produced by the continuous replanning loop."""
    plan_version: int = Field(..., description="Sequential plan counter, e.g. 12")
    plan_version_label: str = Field(..., description="Display label, e.g. 'PLAN v12'")
    timestamp: str = Field(..., description="ISO 8601 generation timestamp")
    trigger_event: str = Field(..., description="HOSPITAL_CAPACITY_CHANGE, ROAD_BLOCKED, CASUALTY_SURGE")
    reason_for_replan: str = Field(..., description="e.g. 'Hospital B ICU capacity decreased from 2 to 1.'")
    affected_victims: List[str] = Field(default_factory=list, description="IDs of affected casualties, e.g. ['V129']")
    affected_resources: List[str] = Field(default_factory=list, description="Affected assets, e.g. ['Hospital B ICU Beds']")
    changed_assignments: List[AssignmentDiff] = Field(default_factory=list, description="List of altered assignments")
    total_served: int = Field(default=0)
    total_unassigned: int = Field(default=0)
    audit_timeline_event_id: str = Field(..., description="ID of 'PLAN UPDATED' event injected into incident timeline")
    timeline_event_title: str = Field(..., description="e.g. 'PLAN UPDATED: PLAN v12'")
    timeline_event_detail: str = Field(...)


class TriggerReplanRequest(BaseModel):
    event_type: str = Field(default="HOSPITAL_CAPACITY_CHANGE", description="Event category")
    reason: str = Field(default="Hospital B ICU capacity decreased from 2 to 1.", description="Operational trigger description")
    hospital_id: Optional[str] = Field(default="H-B")
    new_icu_capacity: Optional[int] = Field(default=1)
    road_id: Optional[str] = None
    casualty_id: Optional[str] = None

