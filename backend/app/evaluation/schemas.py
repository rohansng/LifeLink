"""Pydantic schemas for Phase 14 LifeLink Evaluation Metrics.

Deterministic simulation benchmark comparing:
  - Baseline / Manual Allocation (traditional uncoordinated EMS dispatch)
  - LIFELINK Allocation (OR-Tools MILP optimization & continuous replanning)

Strict Clinical Boundary:
  Does NOT invent real-world medical outcomes (mortality/morbidity).
  All results are explicitly labeled as synthetic simulation results.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SimulationEvaluationMetric(BaseModel):
    """A single deterministic evaluation metric comparison."""

    metric_id: str
    metric_name: str
    category: str  # "TIME_EFFICIENCY" | "CAPACITY_ALIGNMENT" | "SYSTEM_RELIABILITY"
    unit: str
    baseline_manual_value: float
    lifelink_value: float
    baseline_display: str
    lifelink_display: str
    improvement_factor: str
    is_improvement_positive: bool = True
    operational_meaning: str


class StrategyEvaluationProfile(BaseModel):
    """Complete evaluation profile for a specific allocation strategy."""

    strategy_id: str
    strategy_name: str
    strategy_type: str  # "MANUAL_BASELINE" | "LIFELINK_OPTIMIZATION"
    planning_methodology: str

    # 1. Time to produce a feasible plan
    time_to_produce_feasible_plan_seconds: float
    time_to_produce_feasible_plan_display: str

    # 2. Critical patients assigned
    critical_patients_assigned: int
    critical_patients_assigned_pct: float

    # 3. Unassigned critical patients
    unassigned_critical_patients: int
    unassigned_critical_patients_pct: float

    # 4. ICU conflicts (patient dispatched to 0-bed facility / hospital diversion)
    icu_conflicts: int
    diversion_rate_pct: float

    # 5. Ambulance utilization
    ambulance_utilization_pct: float
    mean_transit_delay_minutes: float

    # 6. Resource conflicts (blood shortages, trauma team deficits unmanaged)
    resource_conflicts: int

    # 7. Number of replans (adaptation to disruptions)
    number_of_replans: int

    # 8. Planning latency (per event re-optimization execution time)
    mean_planning_latency_ms: float
    mean_planning_latency_display: str

    # Operational characteristics
    corridor_awareness: bool
    dynamic_replanning_active: bool
    hard_constraint_enforcement: bool


class PerEventReplanBenchmark(BaseModel):
    """Detailed benchmark of replanning response for a specific disruption event."""

    event_number: int
    event_name: str
    disruption_type: str
    manual_response_minutes: float
    lifelink_latency_ms: float
    speedup_ratio: str
    manual_conflict_introduced: str
    lifelink_resolution: str


class SimulationBenchmarkReport(BaseModel):
    """Full deterministic benchmark report comparing Baseline vs LIFELINK."""

    scenario_id: str = "INC-2026-OMEGA-04"
    scenario_name: str = "Train Derailment & Chemical Tanker Rupture (214 Casualties, 5 Disruption Events)"
    evaluation_timestamp: str
    simulation_label: str = "SYNTHETIC SIMULATION BENCHMARK RESULTS ONLY"
    disclaimer: str = (
        "CRITICAL NOTICE: All metrics represent simulated algorithmic and logistical throughput "
        "within a deterministic mathematical model. No real-world medical outcomes, clinical survival "
        "rates, or physiological end-points are claimed or evaluated."
    )

    baseline_profile: StrategyEvaluationProfile
    lifelink_profile: StrategyEvaluationProfile

    # The 8 Core Required Measurements
    metrics_comparison: List[SimulationEvaluationMetric]

    # Per-event replan details across the 5 disruption events
    per_event_replans: List[PerEventReplanBenchmark]

    # Executive Operational Takeaway
    executive_summary: str
    algorithmic_speedup_factor: str
    conflict_reduction_pct: str

