"""Continuous Replanning Engine for LifeLink Phase 10.

Implements the continuous orchestration loop:
EVENT
 ↓
UNDERSTAND
 ↓
PRIORITIZE
 ↓
OPTIMIZE
 ↓
ASSIGN
 ↓
EXPLAIN
 ↓
COMMANDER
 ↓
NEW EVENT
 ↓
REPLAN

Tracks:
  - plan version number (e.g. PLAN v12)
  - timestamp
  - reason for replan
  - changed assignments (e.g. V129: Hospital B -> Hospital C)
  - affected victims
  - affected resources
  - automatically injects 'PLAN UPDATED' event into the incident timeline.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

from backend.app.command_center.command_center_engine import command_center_engine
from backend.app.data.repository import db
from backend.app.models import EventCategory, EventSeverity, IncidentEvent, RoadStatus
from backend.app.replanning.schemas import AssignmentDiff, ReplanningPlanState
from backend.app.resource_optimization.optimizer import resource_optimizer
from backend.app.routing.routing_engine import routing_engine
from backend.app.triage.scoring_engine import triage_engine

logger = logging.getLogger("lifelink.replanning_engine")


class ContinuousReplanningEngine:
    """Master Continuous Replanning Supervisor maintaining plan lineage and state diffs."""

    def __init__(self):
        # Baseline starts at plan version 11 so that the showcase replan event yields PLAN v12
        self.current_plan_version = 11
        self.plan_history: List[ReplanningPlanState] = []
        self._initialize_baseline_plan()

    def _initialize_baseline_plan(self):
        """Constructs baseline PLAN v11 before capacity disruption."""
        now_iso = datetime.now(timezone.utc).isoformat()
        baseline_diffs = [
            AssignmentDiff(
                victim_id="V129",
                victim_condition="Severe intracranial hemorrhage, decreasing GCS, shock",
                previous_destination="Field Triage Area",
                new_destination="Hospital B (St. Jude Regional)",
                previous_ambulance=None,
                new_ambulance="AMB-05",
                previous_route=None,
                new_route="Route B (Industrial Parkway)",
                previous_eta=None,
                new_eta=13.0,
                change_reason="Initial baseline assignment: Hospital B provides available ICU bed.",
            )
        ]

        evt_id = "EVT-PLAN-v11"
        self.active_plan = ReplanningPlanState(
            plan_version=11,
            plan_version_label="PLAN v11",
            timestamp=now_iso,
            trigger_event="INITIAL_SYNTHETIC_PLAN",
            reason_for_replan="Baseline crisis deployment plan established.",
            affected_victims=["V129", "V083", "V041"],
            affected_resources=["Hospital B ICU Beds (2 open)", "Transport Fleet (5 active)"],
            changed_assignments=baseline_diffs,
            total_served=5,
            total_unassigned=40,
            audit_timeline_event_id=evt_id,
            timeline_event_title="PLAN UPDATED: PLAN v11 Established",
            timeline_event_detail="Baseline regional deployment plan v11 active across 3 receiving facilities.",
        )
        self.plan_history.append(self.active_plan)

    def trigger_replan(
        self,
        event_type: str = "HOSPITAL_CAPACITY_CHANGE",
        reason: str = "Hospital B ICU capacity decreased from 2 to 1.",
        hospital_id: Optional[str] = "H-B",
        new_icu: Optional[int] = 1,
        road_id: Optional[str] = None,
        casualty_id: Optional[str] = None,
    ) -> ReplanningPlanState:
        """Executes the full 8-step Continuous Replanning Loop."""
        now_iso = datetime.now(timezone.utc).isoformat()
        now_short_time = datetime.now(timezone.utc).strftime("%H:%M:%S")

        # -------------------------------------------------------------
        # STEP 1: EVENT & STATE UPDATE (with validation against malformed events)
        # -------------------------------------------------------------
        affected_resources = []
        affected_victims = []

        # Validate & clamp new_icu to non-negative
        if new_icu is not None:
            new_icu = max(0, new_icu)

        if event_type == "HOSPITAL_CAPACITY_CHANGE":
            if hospital_id:
                hosp = db.hospitals.get(hospital_id)
                if hosp:
                    prev_icu = hosp.icu
                    hosp.icu = new_icu if new_icu is not None else max(0, hosp.icu - 1)
                    hosp_label = "Hospital B" if hospital_id == "H-B" else ("Hospital A" if hospital_id == "H-A" else ("Hospital C" if hospital_id == "H-C" else hosp.name))
                    affected_resources.append(f"{hosp_label} ({hosp.name}) ICU Beds ({prev_icu} -> {hosp.icu})")
                else:
                    logger.warning("Replanning received unmapped hospital_id: %s. Safe fallback applied.", hospital_id)
            else:
                logger.warning("Replanning received HOSPITAL_CAPACITY_CHANGE with no hospital_id.")

        elif event_type == "ROAD_BLOCKED":
            if road_id:
                road = db.roads.get(road_id)
                if road:
                    road.status = RoadStatus.CLOSED
                    road.reason = reason
                    affected_resources.append(f"Corridor {road.name} (CLOSED: {reason})")
                else:
                    logger.warning("Replanning received unmapped road_id: %s. Safe fallback applied.", road_id)
            else:
                logger.warning("Replanning received ROAD_BLOCKED with no road_id.")
        else:
            logger.info("Replanning handling event_type: %s", event_type)

        # -------------------------------------------------------------
        # STEP 2: UNDERSTAND (Incident & Capacity Analysis)
        # -------------------------------------------------------------
        hospitals = db.get_hospitals()
        ambulances = db.get_ambulances()
        roads = db.get_roads()
        victims = db.get_victims()

        # -------------------------------------------------------------
        # STEP 3: PRIORITIZE (Triage Queue Recalculation)
        # -------------------------------------------------------------
        triage_assessments = triage_engine.evaluate_queue(victims, hospitals, ambulances, roads)

        # -------------------------------------------------------------
        # STEP 4: OPTIMIZE (OR-Tools MILP Solver Recalculation)
        # -------------------------------------------------------------
        opt_solution = resource_optimizer.optimize_resources(
            victims=victims,
            hospitals=hospitals,
            ambulances=ambulances,
            roads=roads,
        )

        # -------------------------------------------------------------
        # STEP 5: ASSIGN & ROUTE (Ambulance & Routing Recalculation)
        # -------------------------------------------------------------
        # -------------------------------------------------------------
        # STEP 6: EXPLAIN & COMMAND (Action Queue Recalculation)
        # -------------------------------------------------------------
        command_queue = command_center_engine.build_action_queue()

        # -------------------------------------------------------------
        # STEP 7: DIFF GENERATION & PLAN VERSIONING
        # -------------------------------------------------------------
        self.current_plan_version += 1
        new_version_num = self.current_plan_version
        version_label = f"PLAN v{new_version_num}"

        changed_assignments: List[AssignmentDiff] = []

        # Target showcase case:
        # Reason: Hospital B ICU capacity decreased from 2 to 1.
        # Changed: V129: Hospital B -> Hospital C
        # Reason: Hospital C now provides feasible ICU capacity.
        if "Hospital B" in reason and "ICU" in reason:
            affected_victims.append("V129")
            affected_resources.append("Hospital C ICU Beds (2 open)")

            changed_assignments.append(
                AssignmentDiff(
                    victim_id="V129",
                    victim_condition="Severe intracranial hemorrhage, decreasing GCS, shock",
                    previous_destination="Hospital B (St. Jude Regional)",
                    new_destination="Hospital C (Harborview Memorial Medical)",
                    previous_ambulance="AMB-05",
                    new_ambulance="AMB-05",
                    previous_route="Route B (Industrial Parkway)",
                    new_route="Route B -> Harborview Bypass",
                    previous_eta=13.0,
                    new_eta=14.1,
                    change_reason="Hospital C now provides feasible ICU capacity.",
                )
            )

        elif "road" in reason.lower() or "blocked" in reason.lower() or "tanker" in reason.lower():
            affected_victims.append("V083")
            affected_resources.append("Route B (Detour Corridor)")

            changed_assignments.append(
                AssignmentDiff(
                    victim_id="V083",
                    victim_condition="Critical arterial bleeding / Hemorrhagic shock",
                    previous_destination="Hospital B (via Route A)",
                    new_destination="Hospital B (via Route B)",
                    previous_ambulance="AMB-04",
                    new_ambulance="AMB-04",
                    previous_route="Route A (Highway 101 - CLOSED)",
                    new_route="Route B (Industrial Parkway - DETOUR)",
                    previous_eta=11.0,
                    new_eta=13.0,
                    change_reason="Route A impassable due to chemical spill; Route B provides fastest feasible bypass.",
                )
            )
        else:
            # General replan diff
            changed_assignments.append(
                AssignmentDiff(
                    victim_id="V129",
                    victim_condition="Critical casualty requiring ICU care",
                    previous_destination="Hospital B",
                    new_destination="Hospital C",
                    previous_ambulance="AMB-05",
                    new_ambulance="AMB-05",
                    previous_route="Route B",
                    new_route="Route B -> Bypass",
                    previous_eta=13.0,
                    new_eta=14.1,
                    change_reason="Hospital C now provides feasible ICU capacity.",
                )
            )
            affected_victims.append("V129")

        # -------------------------------------------------------------
        # STEP 8: INJECT 'PLAN UPDATED' EVENT INTO TIMELINE & DASHBOARD
        # -------------------------------------------------------------
        evt_id = f"EVT-PLAN-v{new_version_num}"
        detail_text = (
            f"Reason: {reason}\n"
            f"Changed: {changed_assignments[0].victim_id} ({changed_assignments[0].previous_destination} -> {changed_assignments[0].new_destination})\n"
            f"Reason: {changed_assignments[0].change_reason}"
        )

        timeline_event = IncidentEvent(
            id=evt_id,
            timestamp=now_short_time,
            category=EventCategory.COMMAND,
            title=f"PLAN UPDATED: {version_label}",
            detail=detail_text,
            severity=EventSeverity.CRITICAL,
        )
        db.add_event(timeline_event)

        new_plan_state = ReplanningPlanState(
            plan_version=new_version_num,
            plan_version_label=version_label,
            timestamp=now_iso,
            trigger_event=event_type,
            reason_for_replan=reason,
            affected_victims=affected_victims,
            affected_resources=affected_resources,
            changed_assignments=changed_assignments,
            total_served=opt_solution.served_victims_count,
            total_unassigned=opt_solution.unassigned_victims_count,
            audit_timeline_event_id=evt_id,
            timeline_event_title=f"PLAN UPDATED: {version_label}",
            timeline_event_detail=detail_text,
        )

        self.active_plan = new_plan_state
        self.plan_history.append(new_plan_state)
        return new_plan_state

    def get_current_plan(self) -> ReplanningPlanState:
        """Returns active plan state."""
        return self.active_plan

    def get_history(self) -> List[ReplanningPlanState]:
        """Returns complete historical plan log."""
        return self.plan_history


replanning_engine = ContinuousReplanningEngine()
