"""Pydantic schemas for LifeLink Phase 8 Modular AI Agents.

All agents produce strictly structured JSON contracts containing:
  - confidence: float (0.0 to 1.0)
  - evidence: list of cited textual/visual excerpts
  - fallback_used: boolean (True if deterministic fallback was triggered)
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------
# 1. Incident Agent Schemas
# ---------------------------------------------------------
class IncidentAgentOutput(BaseModel):
    """Structured incident intelligence extracted from unstructured 911/radio reports."""
    incident_type: str = Field(..., description="Classification, e.g. 'Mass Casualty Derailment'")
    estimated_casualties: int = Field(default=0, ge=0, description="Total casualties identified in report")
    unconscious_count: int = Field(default=0, ge=0, description="Unresponsive/unconscious victims")
    location_sector: str = Field(default="Epicenter", description="Specific sector or landmark, e.g. 'Gate 3'")
    hazard_level: str = Field(default="MODERATE", description="'LOW', 'MODERATE', 'HIGH', 'CRITICAL'")
    hazmat_detected: bool = Field(default=False, description="Presence of chemical/toxic fumes")
    hazmat_type: Optional[str] = Field(None, description="Identified chemical, e.g. 'Ammonia', 'Chlorine'")
    perimeter_radius_meters: float = Field(default=150.0, ge=0.0)
    key_evidence: List[str] = Field(default_factory=list, description="Direct text excerpts supporting findings")
    confidence: float = Field(default=0.85, ge=0.0, le=1.0, description="Extraction confidence score")
    fallback_used: bool = Field(default=False, description="True if deterministic fallback was utilized")


# ---------------------------------------------------------
# 2. Evidence Agent Schemas (Vision / Multimodal)
# ---------------------------------------------------------
class EvidenceAgentOutput(BaseModel):
    """Visual and forensic intelligence extracted from responder imagery or scene evidence."""
    scene_summary: str = Field(..., description="High-level synthesis of photographic evidence")
    detected_hazards: List[str] = Field(default_factory=list, description="Hazards detected, e.g. ['Chemical Leak', 'Structural Collapse']")
    entrapped_count: int = Field(default=0, ge=0, description="Victims mechanically trapped in wreckage")
    structural_stability: str = Field(default="UNSTABLE", description="'STABLE', 'COMPROMISED', 'UNSTABLE'")
    ppe_required: List[str] = Field(default_factory=list, description="Recommended PPE, e.g. ['Level A HazMat', 'SCBA']")
    thermal_hotspots_detected: bool = Field(default=False)
    evidence_tags: List[str] = Field(default_factory=list, description="Specific visual cues, e.g. ['Derailed Tanker Car', 'Crushed Passenger Sedan']")
    confidence: float = Field(default=0.80, ge=0.0, le=1.0)
    fallback_used: bool = Field(default=False)


# ---------------------------------------------------------
# 3. Triage Reasoning Agent Schemas
# ---------------------------------------------------------
class TriageAgentOutput(BaseModel):
    """Clinical reasoning and capability requirements extracted from paramedic field notes."""
    victim_id: Optional[str] = Field(None, description="Victim ID, e.g. 'V083'")
    suggested_priority: str = Field(..., description="START category: 'P1', 'P2', 'P3', 'P4'")
    primary_anatomical_trauma: str = Field(..., description="Primary clinical presentation, e.g. 'Arterial Femoral Bleeding'")
    required_capabilities: List[str] = Field(default_factory=list, description="Matched specialties, e.g. ['Trauma Surgery', 'ICU', 'Blood Transfusion']")
    physiological_severity: str = Field(default="CRITICAL", description="'CRITICAL', 'SERIOUS', 'MODERATE', 'EXPECTANT'")
    needs_icu: bool = Field(default=False)
    needs_blood: bool = Field(default=False)
    needs_vent: bool = Field(default=False)
    needs_trauma_team: bool = Field(default=False)
    clinical_reasoning: str = Field(..., description="Human-interpretable clinical justification")
    confidence: float = Field(default=0.88, ge=0.0, le=1.0)
    fallback_used: bool = Field(default=False)


# ---------------------------------------------------------
# 4. Hospital Agent Schemas
# ---------------------------------------------------------
class HospitalAgentOutput(BaseModel):
    """Operational capability and clinical saturation analysis for receiving facilities."""
    hospital_id: str = Field(..., description="Facility ID, e.g. 'H-A', 'H-B', 'H-C'")
    hospital_name: str = Field(..., description="Full facility name")
    operational_status: str = Field(default="SURGE_ACTIVE", description="'NORMAL', 'SURGE_ACTIVE', 'SATURATED', 'DIVERT'")
    icu_status: str = Field(..., description="Summary of critical care bed availability")
    surgical_capacity_summary: str = Field(..., description="Operating rooms and trauma team staffing")
    surge_capacity_warning: bool = Field(default=False)
    operational_bottlenecks: List[str] = Field(default_factory=list)
    capability_notes: str = Field(..., description="Clinical context for triage coordinator")
    confidence: float = Field(default=0.90, ge=0.0, le=1.0)
    fallback_used: bool = Field(default=False)


# ---------------------------------------------------------
# 5. Resource Agent Schemas
# ---------------------------------------------------------
class ResourceAgentOutput(BaseModel):
    """Fleet status, equipment constraints, and mutual-aid alert triggers."""
    resource_strain_level: str = Field(default="CRITICAL", description="'NOMINAL', 'ELEVATED', 'CRITICAL', 'DEPLETED'")
    active_fleet_summary: str = Field(..., description="Summary of ambulance availability")
    critical_deficits: List[str] = Field(default_factory=list, description="Exhausted categories, e.g. ['ICU Beds', 'ALS Ambulances']")
    mutual_aid_triggers: List[str] = Field(default_factory=list, description="Recommended external alarms, e.g. ['Region II Tier 3 EMS']")
    asset_warnings: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.92, ge=0.0, le=1.0)
    fallback_used: bool = Field(default=False)


# ---------------------------------------------------------
# 6. Routing Agent Schemas
# ---------------------------------------------------------
class RoutingAgentOutput(BaseModel):
    """Corridor status, road hazards, and detour delay evaluation."""
    corridor_evaluations: List[str] = Field(default_factory=list, description="Status per route, e.g. 'Route A Closed, Route B Active'")
    active_road_blocks: List[str] = Field(default_factory=list, description="Obstacle descriptions")
    detour_recommendation: str = Field(..., description="Actionable routing directive for EMS dispatch")
    transit_delay_minutes: float = Field(default=0.0, ge=0.0)
    hazard_zone_affected: bool = Field(default=False)
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    fallback_used: bool = Field(default=False)


# ---------------------------------------------------------
# 7. Command Agent Schemas
# ---------------------------------------------------------
class CommandAgentOutput(BaseModel):
    """Executive tactical Commander Briefing synthesizing all intelligence & optimization."""
    briefing_timestamp: str = Field(..., description="ISO 8601 generation time")
    incident_headline: str = Field(..., description="High-impact tactical summary")
    overall_threat_level: str = Field(default="CRITICAL", description="'NORMAL', 'ELEVATED', 'HIGH', 'CRITICAL'")
    situation_overview: str = Field(..., description="Synthesized operational picture")
    key_clinical_priorities: List[str] = Field(default_factory=list, description="Top life-saving priorities")
    optimization_alignment_summary: str = Field(..., description="Explanation of OR-Tools allocation results")
    unassigned_casualties_alert: str = Field(..., description="Explicit warning and deficit attribution for unassigned casualties")
    critical_tradeoffs_explained: List[str] = Field(default_factory=list, description="Transparent WHY explanations for resource decisions")
    actionable_directives: List[str] = Field(default_factory=list, description="Immediate 1-click commander commands")
    confidence: float = Field(default=0.94, ge=0.0, le=1.0)
    fallback_used: bool = Field(default=False)


# ---------------------------------------------------------
# Orchestrator Pipeline Result
# ---------------------------------------------------------
class AgentPipelineResult(BaseModel):
    """Unified pipeline response connecting all 7 agents with deterministic optimization."""
    incident_assessment: IncidentAgentOutput
    evidence_assessment: EvidenceAgentOutput
    triage_reasoning: List[TriageAgentOutput]
    hospital_assessments: List[HospitalAgentOutput]
    resource_assessment: ResourceAgentOutput
    routing_assessment: RoutingAgentOutput
    commander_briefing: CommandAgentOutput
    deterministic_alignment_verified: bool = Field(
        default=True,
        description="True: All assignments and numerical bounds strictly governed by OR-Tools and deterministic engines",
    )

