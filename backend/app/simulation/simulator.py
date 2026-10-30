"""Real-Time Incident Simulation Engine for LifeLink.

Processes crisis disruption events sequentially:
  EVENT -> UPDATE STATE -> RECALCULATE -> NOTIFY DASHBOARD

Events sequence:
  1. NEW_RESPONDER_REPORT / NEW_IMAGE_EVIDENCE: +17 victims, +5 critical
  2. HOSPITAL_CAPACITY_CHANGE: Hospital B ICU 2 -> 1
  3. ROAD_BLOCKED: Route A 11 min -> 27 min
  4. RESOURCE_SHORTAGE: O- blood 18 -> 3 units
  5. HOSPITAL_RESOURCE_AVAILABLE: Hospital C trauma surgical team available
"""

from typing import Dict, List, Optional
from backend.app.data.repository import db
from backend.app.models import (
    EventCategory,
    EventSeverity,
    IncidentEvent,
    Location,
    Recommendation,
    RecommendationSeverity,
    RecommendationStatus,
    RoadStatus,
    Victim,
    VictimSeverity,
    VictimStatus,
)
from backend.app.simulation.event_types import SimulationEventType, SimulationStepResult


class IncidentSimulationEngine:
    """Deterministic event simulation engine managing the 5 killer demo events."""

    def __init__(self):
        self.current_step = 0
        self.total_steps = 5
        self.event_history: List[SimulationStepResult] = []

    def reset(self):
        """Resets engine back to step 0."""
        self.current_step = 0
        self.event_history = []
        db.reset()

    def get_status(self) -> Dict:
        return {
            "current_step": self.current_step,
            "total_steps": self.total_steps,
            "can_advance": self.current_step < self.total_steps,
            "applied_events_count": len(self.event_history),
            "next_event_name": self._get_next_event_name(),
        }

    def _get_next_event_name(self) -> Optional[str]:
        names = [
            "Event 1: NEW_RESPONDER_IMAGE (+17 victims, +5 critical)",
            "Event 2: HOSPITAL_CAPACITY_CHANGE (Hospital B ICU 2 -> 1)",
            "Event 3: ROAD_BLOCKED (Route A 11m -> 27m)",
            "Event 4: RESOURCE_SHORTAGE (O- Blood 18 -> 3 units)",
            "Event 5: HOSPITAL_AVAILABLE (Hospital C Trauma Team Ready)",
        ]
        if self.current_step < self.total_steps:
            return names[self.current_step]
        return "Simulation Complete (5/5 Events Executed)"

    def advance_step(self) -> SimulationStepResult:
        """Executes the next simulation event in sequence."""
        if self.current_step >= self.total_steps:
            # If already completed, reset and re-run step 1 or return last
            self.reset()

        self.current_step += 1

        if self.current_step == 1:
            result = self._execute_event_1_new_victims()
        elif self.current_step == 2:
            result = self._execute_event_2_hospital_icu_drop()
        elif self.current_step == 3:
            result = self._execute_event_3_road_blocked()
        elif self.current_step == 4:
            result = self._execute_event_4_blood_shortage()
        elif self.current_step == 5:
            result = self._execute_event_5_hospital_available()
        else:
            raise ValueError(f"Unknown step {self.current_step}")

        self.event_history.append(result)
        return result

    # -------------------------------------------------------------
    # Event 1: NEW_IMAGE_EVIDENCE / NEW_RESPONDER_REPORT
    # +17 victims, +5 critical
    # -------------------------------------------------------------
    def _execute_event_1_new_victims(self) -> SimulationStepResult:
        # Add 17 new victims (5 critical, 7 serious, 5 moderate)
        new_victim_ids = []
        for i in range(1, 18):
            vid = f"V{214 + i:03d}"
            new_victim_ids.append(vid)
            if i <= 5:
                sev = VictimSeverity.CRITICAL
                cap = "neurosurgery" if i % 2 == 0 else "trauma"
                tag = "RED"
                note = "Thermal drone recon: crushed in sub-level 2 rubble with compromised airway"
            elif i <= 12:
                sev = VictimSeverity.SERIOUS
                cap = "orthopedic"
                tag = "YELLOW"
                note = "Structural debris crush, open fracture, vitals delayed"
            else:
                sev = VictimSeverity.MODERATE
                cap = "general"
                tag = "GREEN"
                note = "Ambulatory concussion, acute blast ear trauma"

            db.victims[vid] = Victim(
                id=vid,
                severity=sev,
                location=Location(
                    latitude=37.7765 + (i * 0.0001),
                    longitude=-122.4180 + (i * 0.0001),
                    sector="Sector Alpha",
                ),
                required_capability=cap,
                status=VictimStatus.UNASSIGNED,
                triage_tag=tag,
                notes=note,
            )

        # Update sector Alpha counts
        for sector in db.incident.sectors:
            if sector.id == "ZONE-ALPHA":
                sector.total_victims += 17
                sector.critical_count += 5
                sector.serious_count += 7
                sector.moderate_count += 5

        # Timeline Event
        evt = IncidentEvent(
            id=f"EVT-SIM-01",
            timestamp="11:55:10",
            category=EventCategory.TRIAGE,
            title="Drone Reconnaissance: +17 Casualties in Sector Alpha",
            detail="Aerial thermal drone imaging confirmed an unmapped structural collapse pocket. 17 additional victims identified (5 Critical Red-triage).",
            severity=EventSeverity.CRITICAL,
        )
        db.add_event(evt)

        # Resulting Recommendation
        rec = Recommendation(
            id="REC-SIM-01",
            title="SURGE ALS TRIAGE POST TO SECTOR ALPHA",
            severity=RecommendationSeverity.CRITICAL,
            status=RecommendationStatus.PENDING,
            action_type="FORWARD_TRIAGE",
            explanation="Drone imagery confirmed 5 additional red-triage tension pneumothorax/crush casualties trapped in sub-level 2 rubble. Divert secondary paramedic squad to establish forward stabilization bay before transit times expire.",
            suggested_action="Deploy Forward ALS Stabilization Bay",
            badge="CASUALTY SURGE",
        )
        db.recommendations[rec.id] = rec

        # Trigger statistics recalculation
        db.get_incident()

        return SimulationStepResult(
            step_number=1,
            event_type=SimulationEventType.NEW_IMAGE_EVIDENCE,
            title="Drone Reconnaissance: +17 Victims (+5 Critical)",
            what_changed="+17 casualties identified in Sector Alpha (5 Critical, 7 Serious, 5 Moderate). Total victims: 214 -> 231. Critical: 31 -> 36.",
            affected_entities=["Sector Alpha Collapse Epicenter", "Victims V215-V231", "Triage Queue"],
            state_delta={
                "victims_added": 17,
                "critical_added": 5,
                "total_victims": 231,
                "critical_victims": 36,
                "unassigned_critical": 32,
            },
            resulting_recommendations=[rec],
            timeline_entry=evt,
            is_completed=False,
        )

    # -------------------------------------------------------------
    # Event 2: HOSPITAL_CAPACITY_CHANGE
    # Hospital B ICU 2 -> 1
    # -------------------------------------------------------------
    def _execute_event_2_hospital_icu_drop(self) -> SimulationStepResult:
        # Hospital B (St. Jude) drops ICU from 2 to 1
        hosp_b = db.hospitals.get("H-B")
        if hosp_b:
            hosp_b.icu = 1
            hosp_b.status = "SURGE_CRITICAL (ICU Saturated)"

        # Timeline Event
        evt = IncidentEvent(
            id=f"EVT-SIM-02",
            timestamp="11:57:30",
            category=EventCategory.HOSPITAL,
            title="Hospital B ICU Drop: 2 -> 1 Beds",
            detail="St. Jude Regional Hospital reported emergency ventilator failure and cardiac arrest in ICU Bed 2. Available ICU beds reduced from 2 to 1.",
            severity=EventSeverity.CRITICAL,
        )
        db.add_event(evt)

        # Resulting Recommendation
        rec = Recommendation(
            id="REC-SIM-02",
            title="REROUTE INBOUND TRANSFERS AWAY FROM HOSPITAL B",
            severity=RecommendationSeverity.CRITICAL,
            status=RecommendationStatus.PENDING,
            action_type="BED_DIVERT",
            explanation="Hospital B ICU capacity dropped from 2 to 1 bed, creating an immediate hospital saturation bottleneck. Reallocate upcoming transport Medic 5 to Metro Trauma Center to prevent hospital diversion.",
            suggested_action="Divert Medic 5 to Metro Trauma Center",
            badge="CAPACITY SHOCK",
        )
        db.recommendations[rec.id] = rec

        # Recalculate
        db.get_incident()

        return SimulationStepResult(
            step_number=2,
            event_type=SimulationEventType.HOSPITAL_CAPACITY_CHANGE,
            title="Hospital B ICU Capacity Shock (2 -> 1)",
            what_changed="St. Jude Regional Hospital (Hospital B) ICU beds dropped from 2 to 1. Regional ICU beds available dropped from 5 to 4.",
            affected_entities=["Hospital B (St. Jude Regional)", "Ambulance Medic 5", "Regional ICU Bed Pool"],
            state_delta={
                "hospital_b_icu": "2 -> 1",
                "total_icu_beds": db.incident.statistics.total_icu_beds,
                "hospital_status": "SURGE_CRITICAL",
            },
            resulting_recommendations=[rec],
            timeline_entry=evt,
            is_completed=False,
        )

    # -------------------------------------------------------------
    # Event 3: ROAD_BLOCKED
    # Route A: 11 min -> 27 min
    # -------------------------------------------------------------
    def _execute_event_3_road_blocked(self) -> SimulationStepResult:
        # Route A (ROAD-01) severed by tanker fire
        road_1 = db.roads.get("ROAD-01")
        if road_1:
            road_1.status = RoadStatus.CLOSED
            road_1.detour_penalty_minutes = 16.0  # 11 + 16 = 27 min
            road_1.reason = "Secondary fuel tanker explosion; Overpass 4 structural integrity compromised"

        # Update Ambulance ETAs
        amb_2 = db.ambulances.get("AMB-02")
        if amb_2:
            amb_2.eta_hospital_minutes = 27.0
            amb_2.assignment_description = "Detouring via Harbor Tunnel (Route A Blocked - ETA 27m)"

        # Timeline Event
        evt = IncidentEvent(
            id=f"EVT-SIM-03",
            timestamp="11:59:15",
            category=EventCategory.OBSTACLE,
            title="Route A Severed: Transit Time Jumps 11m -> 27m",
            detail="Secondary explosion severed Highway 101 South at Overpass 4. Transit time to Metro Trauma Center jumps from 11 minutes to 27 minutes.",
            severity=EventSeverity.CRITICAL,
        )
        db.add_event(evt)

        # Resulting Recommendation
        rec = Recommendation(
            id="REC-SIM-03",
            title="MANDATE GRAND AVE EMERGENCY DETOUR CORRIDOR",
            severity=RecommendationSeverity.URGENT,
            status=RecommendationStatus.PENDING,
            action_type="TRAFFIC_DETOUR",
            explanation="Route A transit delay increased to 27 mins, violating the 45-minute Golden-Hour surgical window for Patient V004. Authorize motorcycle police escorts to enforce contraflow lanes on Grand Ave.",
            suggested_action="Clear Grand Ave Police Escort Corridor",
            badge="ROUTE SEVERED",
        )
        db.recommendations[rec.id] = rec

        return SimulationStepResult(
            step_number=3,
            event_type=SimulationEventType.ROAD_BLOCKED,
            title="Route A Severed (11 min -> 27 min)",
            what_changed="Highway 101 Southbound (Route A) fully blocked by tanker fire. Transit time jumped from 11 min to 27 min (+16 min detour).",
            affected_entities=["Route A (Highway 101)", "Ambulance Medic 2", "Metro Trauma Receiving Corridor"],
            state_delta={
                "route_a_status": "CLOSED",
                "transit_time_minutes": "11 -> 27 min",
                "medic_2_eta": "27.0 min",
            },
            resulting_recommendations=[rec],
            timeline_entry=evt,
            is_completed=False,
        )

    # -------------------------------------------------------------
    # Event 4: RESOURCE_SHORTAGE
    # O- blood: 18 -> 3 units
    # -------------------------------------------------------------
    def _execute_event_4_blood_shortage(self) -> SimulationStepResult:
        # Metro Trauma O- negative blood plunges 18 -> 3
        hosp_a = db.hospitals.get("H-A")
        if hosp_a:
            hosp_a.blood.O_negative = 3

        # Timeline Event
        evt = IncidentEvent(
            id=f"EVT-SIM-04",
            timestamp="12:01:45",
            category=EventCategory.ALERT,
            title="Critical Blood Shortage: O- Negative Drops 18 -> 3 Units",
            detail="Metro Trauma surgical suites transfused 15 units during emergency laparotomies. Universal donor O- blood dropped from 18 to 3 units.",
            severity=EventSeverity.CRITICAL,
        )
        db.add_event(evt)

        # Resulting Recommendation
        rec = Recommendation(
            id="REC-SIM-04",
            title="ACTIVATE EMERGENCY WHOLE-BLOOD MUTUAL AID COURIER",
            severity=RecommendationSeverity.CRITICAL,
            status=RecommendationStatus.PENDING,
            action_type="BLOOD_DISPATCH",
            explanation="O-Negative universal donor reserves plunged from 18 to 3 units with 36 critical surgical casualties pending. Authorize urgent police courier dispatch of 30 units whole blood from State Central Blood Depository.",
            suggested_action="Dispatch State Blood Bank Emergency Courier",
            badge="BLOOD DEPLETED",
        )
        db.recommendations[rec.id] = rec

        return SimulationStepResult(
            step_number=4,
            event_type=SimulationEventType.RESOURCE_SHORTAGE,
            title="O- Blood Shortage: 18 -> 3 Units",
            what_changed="Regional Level 1 Trauma Center O-Negative blood inventory plummeted from 18 units to 3 units due to simultaneous trauma laparotomies.",
            affected_entities=["Metro Trauma Blood Bank", "Trauma OR Suites 1-2", "Red Cross Regional Depot"],
            state_delta={
                "blood_type": "O_negative",
                "units_previous": 18,
                "units_current": 3,
                "deficit": -15,
            },
            resulting_recommendations=[rec],
            timeline_entry=evt,
            is_completed=False,
        )

    # -------------------------------------------------------------
    # Event 5: HOSPITAL_RESOURCE_AVAILABLE
    # Hospital C trauma team available
    # -------------------------------------------------------------
    def _execute_event_5_hospital_available(self) -> SimulationStepResult:
        # Harborview Memorial (Hospital C) trauma team online
        hosp_c = db.hospitals.get("H-C")
        if hosp_c:
            hosp_c.operating_rooms_open += 2  # 1 -> 3
            hosp_c.icu += 2                   # 1 -> 3
            hosp_c.status = "SURGE_RECEPTION_READY (Full Trauma Team Active)"
            if "General Trauma" not in hosp_c.supported_specialties:
                hosp_c.supported_specialties.append("General Trauma")

        # Timeline Event
        evt = IncidentEvent(
            id=f"EVT-SIM-05",
            timestamp="12:04:00",
            category=EventCategory.HOSPITAL,
            title="Hospital C Trauma Team Online — Capacity Unlocked",
            detail="Harborview Memorial emergency recall successful: 2 trauma surgical teams and 2 ICU beds mobilized. Hospital C now ready for high-acuity casualty intake.",
            severity=EventSeverity.INFO,
        )
        db.add_event(evt)

        # Resulting Recommendation
        rec = Recommendation(
            id="REC-SIM-05",
            title="DIRECT SURGE TRAUMA AIR-BRIDGE TO HOSPITAL C",
            severity=RecommendationSeverity.URGENT,
            status=RecommendationStatus.PENDING,
            action_type="AIR_EVAC",
            explanation="Hospital C now possesses staffed trauma teams, 3 available ICU beds, and 3 open OR suites. Direct Medevac 1 and Zone Bravo ambulances directly to Harborview Memorial to relieve Metro Trauma Center.",
            suggested_action="Authorize Air-Bridge Transport to Hospital C",
            badge="CAPACITY UNLOCKED",
        )
        db.recommendations[rec.id] = rec

        # Recalculate stats
        db.get_incident()

        return SimulationStepResult(
            step_number=5,
            event_type=SimulationEventType.HOSPITAL_RESOURCE_AVAILABLE,
            title="Hospital C Trauma Team Available",
            what_changed="Harborview Memorial Medical (Hospital C) fully mobilized: +2 ICU beds (now 3), +2 operating rooms (now 3). Full on-call trauma surgical team ready.",
            affected_entities=["Hospital C (Harborview Memorial)", "Medevac 1 Air Rescue", "Sector Bravo Casualties"],
            state_delta={
                "hospital_c_icu": "1 -> 3 beds",
                "hospital_c_or": "1 -> 3 suites",
                "trauma_team_active": True,
                "total_icu_beds": db.incident.statistics.total_icu_beds,
            },
            resulting_recommendations=[rec],
            timeline_entry=evt,
            is_completed=True,
        )


simulator = IncidentSimulationEngine()
