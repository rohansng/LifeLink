"""Schemas for LifeLink Deterministic Hospital Matching Engine."""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CriterionStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WARNING = "WARNING"


class CriterionCheck(BaseModel):
    criterion: str = Field(..., description="Criterion evaluated, e.g. ICU Availability")
    status: CriterionStatus = Field(..., description="PASS, FAIL, or WARNING")
    icon: str = Field(..., description="✓ or ✗ or ⚠")
    label: str = Field(..., description="Human-readable status string, e.g. '✓ ICU available'")
    detail: Optional[str] = Field(None, description="Quantified background detail")


class HospitalEvaluation(BaseModel):
    hospital_id: str = Field(..., description="Unique hospital identifier, e.g. H-B")
    hospital_name: str = Field(..., description="Facility name, e.g. St. Jude Regional Hospital")
    hospital_type: str = Field(..., description="Level 1 Trauma Center, Level 2 Emergency, etc.")
    suitability_score: float = Field(..., description="Deterministic multi-factor suitability score")
    rank: int = Field(..., description="Rank among candidate hospitals (1 = best)")
    is_recommended: bool = Field(..., description="True if this facility is the recommended choice")
    decision: str = Field(..., description="'SELECTED' or 'REJECTED'")
    travel_time_minutes: float = Field(..., description="Calculated transit time in minutes")
    icu_beds_available: int = Field(..., description="Available ICU beds")
    trauma_available: bool = Field(..., description="Whether trauma reception is active")
    operating_rooms_open: int = Field(..., description="Available operating rooms")
    blood_units_o_neg: int = Field(..., description="Available O-negative blood units")
    acceptance_reasons: List[str] = Field(default_factory=list, description="List of positive criteria passed")
    rejection_reasons: List[str] = Field(default_factory=list, description="List of reasons for rejection")
    criteria_checks: List[CriterionCheck] = Field(default_factory=list, description="Detailed criteria checklist")
    summary_card: str = Field(default="", description="Quick ASCII summary card")


class HospitalMatchResult(BaseModel):
    victim_id: str = Field(..., description="Casualty identifier, e.g. V083")
    victim_priority: str = Field(..., description="P1, P2, P3, or P4")
    victim_severity: str = Field(..., description="critical, serious, moderate, unknown")
    victim_required_capability: str = Field(..., description="Trauma + ICU, Trauma, Surgery, etc.")
    victim_notes: Optional[str] = Field(None, description="Paramedic assessment or injury details")
    recommended_hospital: Optional[HospitalEvaluation] = Field(None, description="Recommended facility or None if infeasible")
    rejected_alternatives: List[HospitalEvaluation] = Field(default_factory=list, description="Bypassed alternatives")
    all_evaluations: List[HospitalEvaluation] = Field(default_factory=list, description="All evaluated facilities ranked")
    why_explanation: str = Field(..., description="Complete structured 'WHY?' explanation text")
    is_feasible: bool = Field(default=True, description="True if a feasible hospital destination was identified")
    status: str = Field(default="SELECTED", description="'SELECTED' or 'NO FEASIBLE ASSIGNMENT'")
    formula: str = Field(
        default="Suitability Score = Capability Match + ICU Availability + Blood/Resources + Capacity Headroom - ETA Penalty - Demand Penalty",
        description="Deterministic scoring formulation",
    )

