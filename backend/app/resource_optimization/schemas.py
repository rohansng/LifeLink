"""Schemas for LifeLink OR-Tools Resource Optimization Engine."""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class TrackedResourceInventory(BaseModel):
    icu_beds: int = Field(default=0, ge=0, description="Available ICU critical care beds")
    blood_units_o_neg: int = Field(default=0, ge=0, description="Available O- universal donor blood")
    ventilators: int = Field(default=0, ge=0, description="Available mechanical ventilators")
    doctors: int = Field(default=0, ge=0, description="Available emergency trauma physicians")
    trauma_teams: int = Field(default=0, ge=0, description="Available surgical resuscitation teams")
    ambulances: int = Field(default=0, ge=0, description="Available emergency ambulances")
    rescue_teams: int = Field(default=0, ge=0, description="Available heavy USAR extrication squads")


class ResourceAllocationAssignment(BaseModel):
    victim_id: str = Field(..., description="Victim ID, e.g. V083")
    victim_priority: str = Field(..., description="P1, P2, P3")
    victim_condition: str = Field(..., description="Clinical triage diagnosis")
    ambulance_id: str = Field(..., description="Assigned transport unit, e.g. AMB-04")
    ambulance_callsign: str = Field(..., description="Callsign, e.g. Medic 4")
    hospital_id: str = Field(..., description="Receiving hospital ID, e.g. H-B")
    hospital_name: str = Field(..., description="Facility name, e.g. St. Jude Regional Hospital")
    eta_minutes: float = Field(..., description="Transit time in minutes")
    allocated_resources: List[str] = Field(default_factory=list, description="Specific assets allocated")
    expected_benefit_score: float = Field(..., description="Objective clinical benefit contribution")


class UnassignedVictim(BaseModel):
    victim_id: str = Field(..., description="Victim ID, e.g. V015")
    victim_priority: str = Field(..., description="P1, P2, P3, P4")
    victim_condition: str = Field(..., description="Clinical triage diagnosis")
    primary_bottleneck: str = Field(..., description="ICU_DEFICIT, FLEET_EXHAUSTED, BLOOD_DEFICIT, etc.")
    reason: str = Field(..., description="Explicit human-readable bottleneck rationale")
    urgency_rank: int = Field(..., description="Rank in triage queue")


class ResourceConflict(BaseModel):
    resource_type: str = Field(..., description="ICU Beds, Ambulances, Blood, Ventilators, etc.")
    total_available: int = Field(..., ge=0)
    total_demanded: int = Field(..., ge=0)
    deficit: int = Field(..., ge=0)
    utilization_pct: float = Field(..., ge=0.0)
    severity: str = Field(..., description="CRITICAL, URGENT, ADVISORY")
    conflict_summary: str = Field(..., description="Concise bottleneck summary")


class RecommendedReallocation(BaseModel):
    id: str = Field(..., description="Recommendation ID, e.g. REALLOC-01")
    title: str = Field(..., description="Directive headline")
    target_resource: str = Field(..., description="Resource category affected")
    severity: str = Field(default="CRITICAL")
    projected_impact: str = Field(..., description="Quantified capacity gain")
    action_type: str = Field(..., description="MUTUAL_AID, REVERSE_TRIAGE, BLOOD_CONVOY, USAR_DEPLOY")
    suggested_command: str = Field(..., description="Actionable 1-click execution trigger")


class OptimizationSolutionResult(BaseModel):
    solver_status: str = Field(..., description="OPTIMAL, FEASIBLE, or INFEASIBLE")
    solve_time_ms: float = Field(..., description="MILP execution duration in ms")
    objective_value: float = Field(..., description="Total mathematical objective function score")
    total_high_priority_victims: int = Field(..., description="Total P1/P2 casualties demanding care")
    served_victims_count: int = Field(..., description="Casualties receiving full feasible resource bundle")
    unassigned_victims_count: int = Field(..., description="Casualties unable to be served due to hard bounds")
    tracked_resources: TrackedResourceInventory = Field(..., description="Current tracked regional inventory")
    assignments: List[ResourceAllocationAssignment] = Field(default_factory=list)
    unassigned_victims: List[UnassignedVictim] = Field(default_factory=list)
    resource_conflicts: List[ResourceConflict] = Field(default_factory=list)
    recommended_reallocations: List[RecommendedReallocation] = Field(default_factory=list)

