"""Deterministic Triage Priority Scoring Engine for LifeLink.

Strictly deterministic mathematical formulation:
  Priority Score =
    severity_points
    + urgency_points
    + capability_points
    - transport_penalty
    + resource_availability_points

Generates transparent P1 / P2 / P3 / P4 tiers.
No LLM calculation permitted in final score or ranking.
"""

from typing import Dict, List, Optional, Tuple
from backend.app.models.ambulance import Ambulance
from backend.app.models.hospital import Hospital
from backend.app.models.road import Road, RoadStatus
from backend.app.models.victim import Victim, VictimSeverity, VictimStatus
from backend.app.triage.schemas import PriorityAssessment, PriorityTier, ScoreBreakdown


class TriageScoringEngine:
    """Calculates deterministic multi-factor priority scores for casualties."""

    SEVERITY_WEIGHTS = {
        VictimSeverity.CRITICAL: 90.0,
        VictimSeverity.SERIOUS: 55.0,
        VictimSeverity.MODERATE: 25.0,
        VictimSeverity.UNKNOWN: 10.0,
    }

    CAPABILITY_WEIGHTS = {
        "neurosurgery": 20.0,
        "cardiothoracic": 18.0,
        "thoracic": 18.0,
        "burn": 16.0,
        "trauma + icu": 16.0,
        "trauma": 14.0,
        "surgery": 13.0,
        "orthopedic": 10.0,
        "general": 5.0,
    }

    def calculate_priority(
        self,
        victim: Victim,
        hospitals: List[Hospital],
        ambulances: List[Ambulance],
        roads: Optional[List[Road]] = None,
    ) -> PriorityAssessment:
        """Evaluates a single casualty and computes the transparent deterministic priority score."""
        roads = roads or []

        # 1. Base START severity classification points
        sev_pts = self.SEVERITY_WEIGHTS.get(victim.severity, 20.0)

        # 2. Urgency points (analyzing clinical acuity, hemorrhage rate, airway compromise)
        urg_pts, urgency_desc = self._compute_urgency(victim)

        # 3. Medical capability points & formatted display
        formatted_cap = self._format_capability_display(victim)
        cap_pts = self._get_capability_weight(formatted_cap, victim.required_capability)

        # 4. Estimated transport transit minutes & penalty
        transit_mins, route_note = self._estimate_transit_minutes(victim, hospitals, roads)
        transport_penalty = round(min(22.0, transit_mins * 0.55), 1)

        # 5. Resource availability points (bonus for matched open ICU & ORs)
        res_pts, res_note = self._compute_resource_availability(victim, hospitals, ambulances)

        # 6. Strictly deterministic total score formula:
        # Priority Score = severity + urgency + capability - transport time + resource availability
        total_score = round(sev_pts + urg_pts + cap_pts - transport_penalty + res_pts, 1)

        # 7. Tier classification:
        # P1 = Critical (Immediate / Resuscitation / Golden-Hour)
        # P2 = Serious (Urgent / Delayed Surgical Intervention)
        # P3 = Moderate (Minor / Walking Wounded)
        # P4 = Unknown / Needs Primary Survey Assessment
        if victim.severity == VictimSeverity.UNKNOWN:
            tier = PriorityTier.P4
            tier_prefix = "P4 Unknown"
        elif total_score >= 115.0 or (victim.severity == VictimSeverity.CRITICAL and total_score >= 90.0):
            tier = PriorityTier.P1
            tier_prefix = "P1 Critical"
        elif total_score >= 70.0 or (victim.severity == VictimSeverity.SERIOUS and total_score >= 50.0):
            tier = PriorityTier.P2
            tier_prefix = "P2 Serious"
        elif total_score >= 35.0 or victim.severity == VictimSeverity.MODERATE:
            tier = PriorityTier.P3
            tier_prefix = "P3 Moderate"
        else:
            tier = PriorityTier.P4
            tier_prefix = "P4 Unknown"

        # 8. Human-readable clinical & logistical explanation
        reason = f"{urgency_desc} — {formatted_cap} required. {route_note} ({transit_mins:.1f}m transit). {res_note}."

        breakdown = ScoreBreakdown(
            severity_points=sev_pts,
            urgency_points=urg_pts,
            capability_points=cap_pts,
            transport_penalty=transport_penalty,
            resource_availability_points=res_pts,
            total_score=total_score,
        )

        sector_name = victim.location.sector if victim.location else "Sector Alpha"

        return PriorityAssessment(
            victim_id=victim.id,
            priority=tier,
            score=total_score,
            reason=reason,
            required_capability=formatted_cap,
            severity=victim.severity.value,
            sector=sector_name,
            triage_tag=victim.triage_tag,
            breakdown=breakdown,
        )

    def evaluate_queue(
        self,
        victims: List[Victim],
        hospitals: List[Hospital],
        ambulances: List[Ambulance],
        roads: Optional[List[Road]] = None,
        tier_filter: Optional[PriorityTier] = None,
    ) -> List[PriorityAssessment]:
        """Evaluates all casualties and returns a strictly sorted priority queue (highest score first)."""
        assessments = [
            self.calculate_priority(v, hospitals, ambulances, roads)
            for v in victims
        ]

        if tier_filter:
            assessments = [a for a in assessments if a.priority == tier_filter]

        # Strictly sort descending by mathematical score; secondary sort by victim_id for deterministic stability
        assessments.sort(key=lambda a: (-a.score, a.victim_id))
        return assessments

    def _compute_urgency(self, victim: Victim) -> Tuple[float, str]:
        notes = (victim.notes or "").lower()

        if "critical bleeding" in notes:
            return 28.0, "Critical bleeding"
        elif any(term in notes for term in ["tension pneumo", "arterial", "hypoxia", "compromised airway", "hypovolemic"]):
            return 26.0, "Critical airway / hemorrhagic compromise"
        elif any(term in notes for term in ["head trauma", "subdural", "intracranial", "unequal pupils", "gcs"]):
            return 22.0, "Severe acute neurological trauma"
        elif any(term in notes for term in ["chemical", "ammonia", "pneumonitis", "inhalation"]):
            return 20.0, "Toxic vapor respiratory inhalation injury"
        elif notes.startswith("critical") or (victim.severity == VictimSeverity.CRITICAL and not notes):
            return 18.0, "Critical"
        elif notes.startswith("serious") or "surgery" in notes or "surgical" in notes:
            return 14.0, "Serious"
        elif any(term in notes for term in ["open femur", "compound", "pelvic", "fracture", "reduction"]):
            return 12.0, "Serious structural skeletal trauma"
        elif any(term in notes for term in ["tapping", "trapped", "acoustic", "rubble"]):
            return 10.0, "Entrapped in rubble, awaiting primary extrication"
        elif victim.severity == VictimSeverity.CRITICAL:
            return 18.0, "Critical"
        elif victim.severity == VictimSeverity.SERIOUS:
            return 10.0, "Serious"
        elif victim.severity == VictimSeverity.MODERATE:
            return 4.0, "Moderate"
        else:
            return 2.0, "Needs assessment"

    def _format_capability_display(self, victim: Victim) -> str:
        raw = victim.required_capability.lower().strip()
        if "icu" in raw and "trauma" in raw:
            return "Trauma + ICU"
        elif raw == "surgery" or "surgical" in raw:
            return "Surgery"
        elif "neuro" in raw:
            return "Neurosurgery + Trauma"
        elif "thoracic" in raw or "cardio" in raw:
            return "Thoracic Surgery"
        elif "burn" in raw:
            return "Burn ICU + Toxicology"
        elif "ortho" in raw:
            return "Orthopedic Surgery"
        elif "trauma" in raw:
            return "Trauma"
        else:
            return "General Emergency Care"

    def _get_capability_weight(self, formatted_cap: str, raw_cap: str) -> float:
        raw = raw_cap.lower().strip()
        if raw in self.CAPABILITY_WEIGHTS:
            return self.CAPABILITY_WEIGHTS[raw]
        if "trauma + icu" in raw or ("trauma" in raw and "icu" in raw):
            return 16.0
        if "neuro" in raw:
            return 20.0
        if "cardio" in raw or "thoracic" in raw:
            return 18.0
        if "burn" in raw:
            return 16.0
        if "surgery" in raw:
            return 13.0
        if "trauma" in raw:
            return 14.0
        if "ortho" in raw:
            return 10.0
        return 5.0

    def _estimate_transit_minutes(
        self,
        victim: Victim,
        hospitals: List[Hospital],
        roads: List[Road],
    ) -> Tuple[float, str]:
        """Calculates transit time to the definitive care facility factoring in sector distance & road closures."""
        route_a_closed = any(
            r.status == RoadStatus.CLOSED and ("101" in r.name.lower() or "route a" in r.name.lower())
            for r in roads
        )

        sector = (victim.location.sector or "").lower() if victim.location else ""
        if "alpha" in sector:
            base_eta = 7.5
        elif "bravo" in sector:
            base_eta = 9.0
        elif "charlie" in sector:
            base_eta = 6.0
        else:
            base_eta = 8.0

        if route_a_closed:
            base_eta += 14.0
            route_desc = "Highway 101 severed (+14m detour)"
        else:
            route_desc = "Direct arterial access open"

        return base_eta, route_desc

    def _compute_resource_availability(
        self,
        victim: Victim,
        hospitals: List[Hospital],
        ambulances: List[Ambulance],
    ) -> Tuple[float, str]:
        """Evaluates whether receiving hospitals have available ICU beds and ready ambulances."""
        total_open_icu = sum(h.icu for h in hospitals)
        total_open_or = sum(h.operating_rooms_open for h in hospitals)

        bonus = 0.0
        reasons = []

        if total_open_icu > 0:
            bonus += 14.0
            reasons.append(f"{total_open_icu} ICU beds open")
        else:
            reasons.append("0 ICU beds (Deficit)")

        if total_open_or > 0:
            bonus += 8.0
            reasons.append(f"{total_open_or} ORs open")

        ready_ambs = [a for a in ambulances if a.status.value in ["available", "staged", "dispatched"]]
        if ready_ambs:
            bonus += 8.0
            reasons.append(f"{len(ready_ambs)} transport units")

        return bonus, ", ".join(reasons)


triage_engine = TriageScoringEngine()
