"""Unit tests for Phase 10 LifeLink Continuous Replanning Engine.

Verifies:
  1. Complete continuous replanning loop:
     EVENT -> UNDERSTAND -> PRIORITIZE -> OPTIMIZE -> ASSIGN -> EXPLAIN -> COMMANDER -> REPLAN
  2. Plan version increments (PLAN v11 -> PLAN v12).
  3. Exact showcase requirements:
     - PLAN v12
     - Reason: Hospital B ICU capacity decreased from 2 to 1.
     - Changed: V129 Hospital B -> Hospital C
     - Reason: Hospital C now provides feasible ICU capacity.
  4. 'PLAN UPDATED' event automatically injected into incident timeline.
  5. Multi-event sequential replanning (Road blockages, fleet changes).
"""

import unittest
from backend.app.data.repository import db
from backend.app.replanning import replanning_engine


class TestContinuousReplanningEngine(unittest.TestCase):
    """Test suite for Continuous Replanning Engine and Plan Versioning."""

    def setUp(self):
        db.reset()
        self.engine = replanning_engine
        # Ensure clean baseline
        self.engine.current_plan_version = 11
        self.engine.plan_history = []
        self.engine._initialize_baseline_plan()

    def tearDown(self):
        db.reset()

    def test_baseline_plan_initialized(self):
        """Verifies initial deployment plan version 11."""
        plan = self.engine.get_current_plan()
        self.assertEqual(plan.plan_version, 11)
        self.assertEqual(plan.plan_version_label, "PLAN v11")
        self.assertGreater(len(self.engine.get_history()), 0)

    def test_replan_on_hospital_b_icu_drop_exact_showcase(self):
        """Executes the exact prompt showcase:
        PLAN v12
        Reason:
        Hospital B ICU capacity decreased from 2 to 1.

        Changed:
        V129
        Hospital B → Hospital C

        Reason:
        Hospital C now provides feasible ICU capacity.
        """
        plan = self.engine.trigger_replan(
            event_type="HOSPITAL_CAPACITY_CHANGE",
            reason="Hospital B ICU capacity decreased from 2 to 1.",
            hospital_id="H-B",
            new_icu=1,
        )

        # 1. Plan version number
        self.assertEqual(plan.plan_version, 12)
        self.assertEqual(plan.plan_version_label, "PLAN v12")

        # 2. Timestamp
        self.assertIsNotNone(plan.timestamp)

        # 3. Reason for replan
        self.assertEqual(plan.reason_for_replan, "Hospital B ICU capacity decreased from 2 to 1.")

        # 4. Changed assignments: V129 Hospital B -> Hospital C
        self.assertGreaterEqual(len(plan.changed_assignments), 1)
        diff = plan.changed_assignments[0]
        self.assertEqual(diff.victim_id, "V129")
        self.assertIn("Hospital B", diff.previous_destination)
        self.assertIn("Hospital C", diff.new_destination)

        # 5. Reason for change
        self.assertEqual(diff.change_reason, "Hospital C now provides feasible ICU capacity.")

        # 6. Affected victims & resources
        self.assertIn("V129", plan.affected_victims)
        self.assertTrue(any("Hospital B" in r for r in plan.affected_resources))

    def test_plan_updated_event_injected_in_timeline(self):
        """Every replan event must inject a 'PLAN UPDATED' event into the incident timeline."""
        plan = self.engine.trigger_replan(
            event_type="HOSPITAL_CAPACITY_CHANGE",
            reason="Hospital B ICU capacity decreased from 2 to 1.",
            hospital_id="H-B",
            new_icu=1,
        )

        events = db.get_events()
        plan_events = [e for e in events if "PLAN UPDATED" in e.title]
        self.assertGreater(len(plan_events), 0, "Timeline must contain 'PLAN UPDATED' event")

        latest_event = plan_events[0]
        self.assertIn(plan.plan_version_label, latest_event.title)
        self.assertIn("Hospital B ICU capacity decreased", latest_event.detail)
        self.assertIn("V129", latest_event.detail)
        self.assertIn("Hospital C now provides feasible ICU capacity", latest_event.detail)

    def test_sequential_multi_event_replanning(self):
        """Tests that subsequent events increment plan version (v12 -> v13) and log history."""
        plan_v12 = self.engine.trigger_replan(
            event_type="HOSPITAL_CAPACITY_CHANGE",
            reason="Hospital B ICU capacity decreased from 2 to 1.",
            hospital_id="H-B",
            new_icu=1,
        )
        self.assertEqual(plan_v12.plan_version, 12)

        # Subsequent road blockage event
        plan_v13 = self.engine.trigger_replan(
            event_type="ROAD_BLOCKED",
            reason="Highway 101 closed at Milepost 14 due to chemical spill.",
            road_id="ROAD-01",
        )
        self.assertEqual(plan_v13.plan_version, 13)
        self.assertEqual(plan_v13.plan_version_label, "PLAN v13")
        self.assertIn("Highway 101", plan_v13.reason_for_replan)

        # Check history contains both plans
        history = self.engine.get_history()
        history_versions = [p.plan_version for p in history]
        self.assertIn(12, history_versions)
        self.assertIn(13, history_versions)


if __name__ == "__main__":
    unittest.main()
