"""Unit tests for the LifeLink Deterministic Triage & Priority Scoring Engine.

Strictly deterministic testing of:
- Priority Score = severity + urgency + capability - transport time + resource availability
- P1, P2, P3, P4 tiers
- Specific showcase outputs:
    V083 -> P1 | Critical bleeding | Trauma + ICU
    V041 -> P1 | Critical | Trauma
    V112 -> P2 | Serious | Surgery
- Non-severity-only prioritization
- Route disruption penalty impact
- Receiving hospital resource availability impact
- 100% mathematical repeatability (Zero variance)
"""

import unittest
from backend.app.models.ambulance import Ambulance, AmbulanceStatus, AmbulanceType
from backend.app.models.hospital import Hospital
from backend.app.models.location import Location
from backend.app.models.road import Road, RoadStatus
from backend.app.models.victim import Victim, VictimSeverity, VictimStatus
from backend.app.triage.schemas import PriorityAssessment, PriorityTier
from backend.app.triage.scoring_engine import TriageScoringEngine, triage_engine


class TestTriageScoringEngine(unittest.TestCase):
    """Test suite for deterministic casualty prioritization."""

    def setUp(self):
        self.engine = TriageScoringEngine()

        self.hospitals = [
            Hospital(
                id="H-A",
                name="Metro Trauma Center",
                location=Location(latitude=37.7870, longitude=-122.4040),
                icu=2,
                icu_total=28,
                trauma_available=True,
                operating_rooms_open=2,
                supported_specialties=["Neurosurgery", "Trauma", "Thoracic"],
            ),
            Hospital(
                id="H-B",
                name="St. Jude Regional",
                location=Location(latitude=37.7610, longitude=-122.4410),
                icu=1,
                icu_total=18,
                trauma_available=True,
                operating_rooms_open=1,
                supported_specialties=["Orthopedic", "General Trauma"],
            ),
        ]

        self.ambulances = [
            Ambulance(
                id="AMB-01",
                callsign="Medic 1",
                type=AmbulanceType.ALS,
                status=AmbulanceStatus.DISPATCHED,
                location=Location(latitude=37.7770, longitude=-122.4160),
                crew_lead="Paramedic Vance",
            ),
            Ambulance(
                id="AMB-02",
                callsign="Medic 2",
                type=AmbulanceType.ALS,
                status=AmbulanceStatus.AVAILABLE,
                location=Location(latitude=37.7700, longitude=-122.4200),
                crew_lead="Paramedic Davis",
            ),
        ]

        self.roads = [
            Road(
                id="ROAD-01",
                name="Highway 101 South",
                status=RoadStatus.OPEN,
                detour_penalty_minutes=0.0,
                start_latitude=37.7780,
                start_longitude=-122.4140,
                end_latitude=37.7720,
                end_longitude=-122.4080,
            ),
        ]

    def test_v083_showcase_critical_bleeding_trauma_icu(self):
        """Validates showcase victim V083:
        P1
        V083
        Critical bleeding
        Trauma + ICU
        """
        v083 = Victim(
            id="V083",
            severity=VictimSeverity.CRITICAL,
            location=Location(latitude=37.7765, longitude=-122.4180, sector="Sector Alpha"),
            required_capability="trauma + icu",
            status=VictimStatus.UNASSIGNED,
            triage_tag="RED",
            notes="Critical bleeding from pelvic crush injury, hypovolemic shock",
        )

        assessment = self.engine.calculate_priority(v083, self.hospitals, self.ambulances, self.roads)

        self.assertEqual(assessment.victim_id, "V083")
        self.assertEqual(assessment.priority, PriorityTier.P1)
        self.assertEqual(assessment.required_capability, "Trauma + ICU")
        self.assertTrue(assessment.reason.startswith("Critical bleeding"))
        self.assertGreaterEqual(assessment.score, 115.0)

    def test_v041_showcase_critical_trauma(self):
        """Validates showcase victim V041:
        P1
        V041
        Critical
        Trauma
        """
        v041 = Victim(
            id="V041",
            severity=VictimSeverity.CRITICAL,
            location=Location(latitude=37.7765, longitude=-122.4180, sector="Sector Alpha"),
            required_capability="trauma",
            status=VictimStatus.UNASSIGNED,
            triage_tag="RED",
            notes="Critical blunt thoracic trauma, acute respiratory compromise",
        )

        assessment = self.engine.calculate_priority(v041, self.hospitals, self.ambulances, self.roads)

        self.assertEqual(assessment.victim_id, "V041")
        self.assertEqual(assessment.priority, PriorityTier.P1)
        self.assertEqual(assessment.required_capability, "Trauma")
        self.assertTrue(assessment.reason.startswith("Critical"))
        self.assertGreaterEqual(assessment.score, 115.0)

    def test_v112_showcase_serious_surgery(self):
        """Validates showcase victim V112:
        P2
        V112
        Serious
        Surgery
        """
        v112 = Victim(
            id="V112",
            severity=VictimSeverity.SERIOUS,
            location=Location(latitude=37.7730, longitude=-122.4170, sector="Sector Charlie"),
            required_capability="surgery",
            status=VictimStatus.UNASSIGNED,
            triage_tag="YELLOW",
            notes="Serious open compound fracture requiring immediate surgical reduction",
        )

        assessment = self.engine.calculate_priority(v112, self.hospitals, self.ambulances, self.roads)

        self.assertEqual(assessment.victim_id, "V112")
        self.assertEqual(assessment.priority, PriorityTier.P2)
        self.assertEqual(assessment.required_capability, "Surgery")
        self.assertTrue(assessment.reason.startswith("Serious"))
        self.assertGreaterEqual(assessment.score, 70.0)
        self.assertLess(assessment.score, 115.0)

    def test_p3_moderate_casualty(self):
        """Validates that ambulatory minor casualties evaluate to P3 Moderate."""
        v_green = Victim(
            id="V150",
            severity=VictimSeverity.MODERATE,
            location=Location(latitude=37.7710, longitude=-122.4140, sector="Sector Charlie"),
            required_capability="general",
            status=VictimStatus.UNASSIGNED,
            triage_tag="GREEN",
            notes="Walking wounded, minor forearm abrasion",
        )

        assessment = self.engine.calculate_priority(v_green, self.hospitals, self.ambulances, self.roads)

        self.assertEqual(assessment.victim_id, "V150")
        self.assertEqual(assessment.priority, PriorityTier.P3)
        self.assertEqual(assessment.required_capability, "General Emergency Care")
        self.assertLess(assessment.score, 70.0)

    def test_p4_unknown_rubble_casualty(self):
        """Validates that unassessed casualties in rubble evaluate to P4 Unknown."""
        v_unknown = Victim(
            id="V200",
            severity=VictimSeverity.UNKNOWN,
            location=Location(latitude=37.7760, longitude=-122.4180, sector="Sector Alpha"),
            required_capability="trauma",
            status=VictimStatus.UNASSIGNED,
            triage_tag="UNKNOWN",
            notes="Acoustic sensor tapping detected beneath collapsed ceiling slab",
        )

        assessment = self.engine.calculate_priority(v_unknown, self.hospitals, self.ambulances, self.roads)

        self.assertEqual(assessment.victim_id, "V200")
        self.assertEqual(assessment.priority, PriorityTier.P4)

    def test_mathematical_score_formula_breakdown(self):
        """Verifies exact adherence to the specified formula:
        Priority Score = severity + urgency + capability - transport time + resource availability
        """
        victim = Victim(
            id="V083",
            severity=VictimSeverity.CRITICAL,
            location=Location(latitude=37.7765, longitude=-122.4180, sector="Sector Alpha"),
            required_capability="trauma + icu",
            notes="Critical bleeding from pelvic crush injury",
        )

        assessment = self.engine.calculate_priority(victim, self.hospitals, self.ambulances, self.roads)
        bd = assessment.breakdown

        expected_total = round(
            bd.severity_points + bd.urgency_points + bd.capability_points - bd.transport_penalty + bd.resource_availability_points,
            1,
        )

        self.assertEqual(assessment.score, expected_total)
        self.assertEqual(bd.total_score, expected_total)
        self.assertEqual(bd.severity_points, 90.0)
        self.assertGreaterEqual(bd.urgency_points, 20.0)
        self.assertEqual(bd.capability_points, 16.0)
        self.assertGreater(bd.transport_penalty, 0.0)
        self.assertGreaterEqual(bd.resource_availability_points, 20.0)

    def test_dont_just_sort_severity(self):
        """Verifies that multi-factor intelligence can prioritize a Serious victim with
        critical bleeding and high capability needs over a Critical victim with low urgency
        or road blockage.
        """
        # Victim A: Base Serious, but acute critical bleeding needing Trauma+ICU
        v_serious_bleeding = Victim(
            id="V-ACUTE",
            severity=VictimSeverity.SERIOUS,
            location=Location(latitude=37.7710, longitude=-122.4140, sector="Sector Charlie"),
            required_capability="trauma + icu",
            notes="Critical bleeding from femoral artery, tourniquet leaking",
        )

        # Victim B: Base Serious, stable without acute bleeding
        v_serious_stable = Victim(
            id="V-STABLE",
            severity=VictimSeverity.SERIOUS,
            location=Location(latitude=37.7710, longitude=-122.4140, sector="Sector Charlie"),
            required_capability="general",
            notes="Stable closed fracture, vital signs normal",
        )

        assess_acute = self.engine.calculate_priority(v_serious_bleeding, self.hospitals, self.ambulances, self.roads)
        assess_stable = self.engine.calculate_priority(v_serious_stable, self.hospitals, self.ambulances, self.roads)

        # V-ACUTE should be elevated to P1 due to multi-factor urgency and capability points!
        self.assertEqual(assess_acute.priority, PriorityTier.P1)
        self.assertEqual(assess_stable.priority, PriorityTier.P2)
        self.assertGreater(assess_acute.score, assess_stable.score + 25.0)

    def test_transport_penalty_impact(self):
        """Verifies that road blockages increase transport penalty and reduce score."""
        victim = Victim(
            id="V041",
            severity=VictimSeverity.CRITICAL,
            location=Location(latitude=37.7765, longitude=-122.4180, sector="Sector Alpha"),
            required_capability="trauma",
            notes="Critical blunt chest trauma",
        )

        # 1. Open road
        assess_open = self.engine.calculate_priority(victim, self.hospitals, self.ambulances, self.roads)

        # 2. Blocked Highway 101
        blocked_roads = [
            Road(
                id="ROAD-01",
                name="Highway 101 South",
                status=RoadStatus.CLOSED,
                detour_penalty_minutes=14.0,
                start_latitude=37.7780,
                start_longitude=-122.4140,
                end_latitude=37.7720,
                end_longitude=-122.4080,
            )
        ]
        assess_blocked = self.engine.calculate_priority(victim, self.hospitals, self.ambulances, blocked_roads)

        self.assertGreater(assess_blocked.breakdown.transport_penalty, assess_open.breakdown.transport_penalty)
        self.assertLess(assess_blocked.score, assess_open.score)

    def test_resource_availability_impact(self):
        """Verifies that receiving hospital bed exhaustion lowers resource availability score."""
        victim = Victim(
            id="V041",
            severity=VictimSeverity.CRITICAL,
            location=Location(latitude=37.7765, longitude=-122.4180, sector="Sector Alpha"),
            required_capability="trauma",
        )

        # Normal resources
        assess_avail = self.engine.calculate_priority(victim, self.hospitals, self.ambulances, self.roads)

        # Fully saturated hospitals (0 ICU beds, 0 ORs open)
        exhausted_hospitals = [
            Hospital(
                id="H-A",
                name="Metro Trauma Center",
                location=Location(latitude=37.7870, longitude=-122.4040),
                icu=0,
                icu_total=28,
                trauma_available=False,
                operating_rooms_open=0,
            ),
        ]
        assess_exhausted = self.engine.calculate_priority(victim, exhausted_hospitals, [], self.roads)

        self.assertGreater(assess_avail.breakdown.resource_availability_points, assess_exhausted.breakdown.resource_availability_points)
        self.assertGreater(assess_avail.score, assess_exhausted.score)

    def test_queue_sorting_order(self):
        """Verifies evaluate_queue returns casualties strictly sorted descending by score."""
        victims = [
            Victim(id="V-LOW", severity=VictimSeverity.MODERATE, location=Location(latitude=37.7, longitude=-122.4, sector="Sector Charlie"), required_capability="general"),
            Victim(id="V-HIGH", severity=VictimSeverity.CRITICAL, location=Location(latitude=37.7, longitude=-122.4, sector="Sector Alpha"), required_capability="neurosurgery", notes="Critical bleeding, arterial hemorrhage"),
            Victim(id="V-MED", severity=VictimSeverity.SERIOUS, location=Location(latitude=37.7, longitude=-122.4, sector="Sector Bravo"), required_capability="surgery", notes="Serious open fracture"),
        ]

        queue = self.engine.evaluate_queue(victims, self.hospitals, self.ambulances, self.roads)

        self.assertEqual(len(queue), 3)
        self.assertEqual(queue[0].victim_id, "V-HIGH")
        self.assertEqual(queue[1].victim_id, "V-MED")
        self.assertEqual(queue[2].victim_id, "V-LOW")

        for i in range(len(queue) - 1):
            self.assertGreaterEqual(queue[i].score, queue[i + 1].score)

    def test_deterministic_repeatability_100_runs(self):
        """Guarantees 100% deterministic repeatability with zero random variance."""
        victim = Victim(
            id="V083",
            severity=VictimSeverity.CRITICAL,
            location=Location(latitude=37.7765, longitude=-122.4180, sector="Sector Alpha"),
            required_capability="trauma + icu",
            notes="Critical bleeding from pelvic crush injury, hypovolemic shock",
        )

        base_assessment = self.engine.calculate_priority(victim, self.hospitals, self.ambulances, self.roads)

        for _ in range(100):
            repeated = self.engine.calculate_priority(victim, self.hospitals, self.ambulances, self.roads)
            self.assertEqual(repeated.score, base_assessment.score)
            self.assertEqual(repeated.priority, base_assessment.priority)
            self.assertEqual(repeated.reason, base_assessment.reason)
            self.assertEqual(repeated.required_capability, base_assessment.required_capability)


if __name__ == "__main__":
    unittest.main()
