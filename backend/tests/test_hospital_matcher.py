"""Unit tests for the LifeLink Deterministic Hospital Matching Engine.

Strictly deterministic testing of:
- Capability + Capacity + Resources + ETA matching
- Override of nearest hospital rule when clinically saturated
- Recommended selection:
    Hospital B selected:
    ✓ ICU available
    ✓ Trauma available
    ✓ Required blood available
    ✓ 13 minute ETA
- Rejection reasons:
    Hospital A rejected:
    ✗ ICU unavailable
    ✗ Trauma occupied

    Hospital C:
    ✓ ICU available
    ✗ ETA too high
- 100% mathematical repeatability (Zero LLM drift)
"""

import unittest
from backend.app.models.hospital import Hospital, HospitalBloodInventory
from backend.app.models.location import Location
from backend.app.models.road import Road, RoadStatus
from backend.app.models.victim import Victim, VictimSeverity, VictimStatus
from backend.app.matching.hospital_matcher import HospitalMatchingEngine, hospital_matcher


class TestHospitalMatchingEngine(unittest.TestCase):
    """Test suite for deterministic hospital destination matching."""

    def setUp(self):
        self.engine = HospitalMatchingEngine()

        # Hospital A: Nearest (8.2m), but 0 ICU and 0 OR suites open
        self.hospital_a = Hospital(
            id="H-A",
            name="Metro Trauma Center",
            type="Level 1 Trauma Center",
            location=Location(latitude=37.7870, longitude=-122.4040),
            icu=0,
            icu_total=28,
            trauma_available=False,
            operating_rooms_open=0,
            burn_beds_available=1,
            blood=HospitalBloodInventory(O_negative=18, O_positive=14, A_positive=28),
            supported_specialties=["Neurosurgery", "Thoracic", "Vascular", "General Trauma"],
            eta_minutes=8.2,
            distance_km=4.8,
            status="CRITICAL SATURATION (100% Saturated)",
        )

        # Hospital B: 13.0m ETA, open ICU, open Trauma OR, open O- Blood
        self.hospital_b = Hospital(
            id="H-B",
            name="St. Jude Regional Hospital",
            type="Level 2 Emergency Hospital",
            location=Location(latitude=37.7610, longitude=-122.4410),
            icu=2,
            icu_total=18,
            trauma_available=True,
            operating_rooms_open=1,
            burn_beds_available=0,
            blood=HospitalBloodInventory(O_negative=3, O_positive=8, A_positive=15),
            supported_specialties=["General Trauma", "Orthopedic Surgery", "Emergency Medicine"],
            eta_minutes=13.0,
            distance_km=6.2,
            status="CRITICAL CAPACITY (95% Occupied)",
        )

        # Hospital C: Has ICU & Trauma, but ETA too high due to road disruption
        self.hospital_c = Hospital(
            id="H-C",
            name="Harborview Memorial Medical",
            type="Level 2 Specialized Facility",
            location=Location(latitude=37.7550, longitude=-122.3920),
            icu=2,
            icu_total=16,
            trauma_available=True,
            operating_rooms_open=1,
            burn_beds_available=3,
            blood=HospitalBloodInventory(O_negative=4, O_positive=11, A_positive=19),
            supported_specialties=["Burn Intensive Care", "Pediatric Trauma", "General Trauma"],
            eta_minutes=14.1,
            distance_km=7.9,
            status="SURGE ACTIVE (94% Occupied)",
        )

        self.hospitals = [self.hospital_a, self.hospital_b, self.hospital_c]

        # Highway 101 Southbound closed, adding detour to Hospital C
        self.roads = [
            Road(
                id="ROAD-01",
                name="Highway 101 South",
                status=RoadStatus.CLOSED,
                detour_penalty_minutes=14.0,
                start_latitude=37.7780,
                start_longitude=-122.4140,
                end_latitude=37.7720,
                end_longitude=-122.4080,
            ),
        ]

        # Critical Casualty V083 with critical bleeding needing Trauma + ICU
        self.victim_v083 = Victim(
            id="V083",
            severity=VictimSeverity.CRITICAL,
            location=Location(latitude=37.7765, longitude=-122.4180, sector="Sector Alpha"),
            required_capability="Trauma + ICU",
            status=VictimStatus.UNASSIGNED,
            triage_tag="RED",
            notes="Critical bleeding from pelvic crush injury, hypovolemic shock",
        )

    def test_hospital_b_selected_over_a_and_c(self):
        """Verifies Hospital B is chosen as optimal destination for V083."""
        result = self.engine.match_victim_to_hospital(
            victim=self.victim_v083,
            hospitals=self.hospitals,
            roads=self.roads,
        )

        self.assertEqual(result.recommended_hospital.hospital_id, "H-B")
        self.assertEqual(result.recommended_hospital.decision, "SELECTED")
        self.assertEqual(len(result.rejected_alternatives), 2)

        # Check Hospital B acceptance checklist
        b_acc = result.recommended_hospital.acceptance_reasons
        self.assertIn("✓ ICU available", b_acc)
        self.assertIn("✓ Trauma available", b_acc)
        self.assertIn("✓ Required blood available", b_acc)
        self.assertTrue(any("13 minute ETA" in a for a in b_acc))

        # Check Hospital A rejection reasons
        hosp_a_eval = next(r for r in result.rejected_alternatives if r.hospital_id == "H-A")
        self.assertIn("✗ ICU unavailable", hosp_a_eval.rejection_reasons)
        self.assertIn("✗ Trauma occupied", hosp_a_eval.rejection_reasons)

        # Check Hospital C rejection reasons
        hosp_c_eval = next(r for r in result.rejected_alternatives if r.hospital_id == "H-C")
        self.assertIn("✗ ETA too high", hosp_c_eval.rejection_reasons)
        self.assertIn("✓ ICU available", hosp_c_eval.acceptance_reasons)

    def test_why_explanation_exact_text_format(self):
        """Verifies the exact structured 'WHY?' explanation matching the specification:
        Hospital B selected:
        ✓ ICU available
        ✓ Trauma available
        ✓ Required blood available
        ✓ 13 minute ETA

        Hospital A rejected:
        ✗ ICU unavailable
        ✗ Trauma occupied

        Hospital C:
        ✓ ICU available
        ✗ ETA too high
        """
        result = self.engine.match_victim_to_hospital(
            victim=self.victim_v083,
            hospitals=self.hospitals,
            roads=self.roads,
        )

        why = result.why_explanation

        # Check Hospital B block
        self.assertIn("Hospital B selected:", why)
        self.assertIn("✓ ICU available", why)
        self.assertIn("✓ Trauma available", why)
        self.assertIn("✓ Required blood available", why)
        self.assertIn("✓ 13 minute ETA", why)

        # Check Hospital A block
        self.assertIn("Hospital A rejected:", why)
        self.assertIn("✗ ICU unavailable", why)
        self.assertIn("✗ Trauma occupied", why)

        # Check Hospital C block
        self.assertIn("Hospital C:", why)
        self.assertIn("✗ ETA too high", why)

    def test_nearest_hospital_not_selected_when_incapable(self):
        """Ensures that the algorithm does NOT simply pick nearest hospital (Hospital A is 8.2m vs 13.0m)."""
        result = self.engine.match_victim_to_hospital(
            victim=self.victim_v083,
            hospitals=self.hospitals,
            roads=self.roads,
        )

        hosp_a_eval = next(e for e in result.all_evaluations if e.hospital_id == "H-A")
        hosp_b_eval = next(e for e in result.all_evaluations if e.hospital_id == "H-B")

        # Hospital A is closest (8.2m < 13.0m)
        self.assertLess(hosp_a_eval.travel_time_minutes, hosp_b_eval.travel_time_minutes)

        # But Hospital B has significantly higher suitability score due to clinical capacity
        self.assertGreater(hosp_b_eval.suitability_score, hosp_a_eval.suitability_score)
        self.assertEqual(result.recommended_hospital.hospital_id, "H-B")

    def test_road_disruption_impact(self):
        """Verifies that road closures lengthen transit time and trigger 'ETA too high'."""
        # 1. Closed road -> Hospital C transit is 28.1 mins (> 16 min threshold)
        eval_closed = self.engine.evaluate_hospital_for_victim(self.victim_v083, self.hospital_c, self.roads)
        self.assertIn("✗ ETA too high", eval_closed.rejection_reasons)

        # 2. Open road -> Hospital C transit is 14.1 mins (<= 16 min threshold)
        open_roads = [
            Road(
                id="ROAD-01",
                name="Highway 101 South",
                status=RoadStatus.OPEN,
                detour_penalty_minutes=0.0,
                start_latitude=37.7780,
                start_longitude=-122.4140,
                end_latitude=37.7720,
                end_longitude=-122.4080,
            )
        ]
        eval_open = self.engine.evaluate_hospital_for_victim(self.victim_v083, self.hospital_c, open_roads)
        self.assertNotIn("✗ ETA too high", eval_open.rejection_reasons)
        self.assertTrue(any("14 minute ETA" in a for a in eval_open.acceptance_reasons))

    def test_deterministic_repeatability(self):
        """Verifies 100% deterministic repeatability with zero variance over 50 iterations."""
        first_result = self.engine.match_victim_to_hospital(self.victim_v083, self.hospitals, self.roads)

        for _ in range(50):
            repeated = self.engine.match_victim_to_hospital(self.victim_v083, self.hospitals, self.roads)
            self.assertEqual(repeated.recommended_hospital.hospital_id, first_result.recommended_hospital.hospital_id)
            self.assertEqual(repeated.recommended_hospital.suitability_score, first_result.recommended_hospital.suitability_score)
            self.assertEqual(repeated.why_explanation, first_result.why_explanation)


if __name__ == "__main__":
    unittest.main()

