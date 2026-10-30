"""Unit tests for Phase 14 Evaluation Metrics & Simulation Benchmark.

Verifies:
  1. Deterministic simulation evaluation engine returns complete benchmark report.
  2. All 8 required operational measurements are strictly calculated:
     - time to produce a feasible plan
     - critical patients assigned
     - unassigned critical patients
     - ICU conflicts
     - ambulance utilization
     - resource conflicts
     - number of replans
     - planning latency
  3. Head-to-head comparison between Baseline / Manual Allocation and LIFELINK.
  4. Strict clinical boundary: no invented medical outcomes; explicit simulation labeling.
  5. Per-event replanning comparison across all 5 crisis disruption events.
  6. API route handlers get_evaluation_benchmark() and run_evaluation_benchmark().
"""

import unittest

from backend.app.evaluation import evaluation_engine
from backend.app.api.v1.evaluation_routes import (
    get_evaluation_benchmark,
    run_evaluation_benchmark,
)


class TestEvaluationMetrics(unittest.TestCase):
    """Test suite for Phase 14 Evaluation Metrics."""

    def setUp(self):
        self.engine = evaluation_engine

    def test_evaluation_report_structure(self):
        """Evaluation benchmark generates valid structured report with strict simulation disclaimer."""
        report = self.engine.run_benchmark()

        self.assertEqual(report.scenario_id, "INC-2026-OMEGA-04")
        self.assertIn("Train Derailment", report.scenario_name)
        self.assertIsNotNone(report.evaluation_timestamp)

        # Strict Clinical Boundary Verification:
        self.assertIn("SIMULATION", report.simulation_label.upper())
        self.assertIn("SYNTHETIC SIMULATION BENCHMARK", report.simulation_label.upper())
        self.assertIn("NO REAL-WORLD MEDICAL OUTCOMES", report.disclaimer.upper())

        self.assertIsNotNone(report.baseline_profile)
        self.assertIsNotNone(report.lifelink_profile)
        self.assertEqual(len(report.metrics_comparison), 8)
        self.assertEqual(len(report.per_event_replans), 5)

    def test_all_8_required_metrics_measured(self):
        """Verifies calculation of all 8 core required measurements."""
        report = self.engine.run_benchmark()
        metrics = {m.metric_id: m for m in report.metrics_comparison}

        # 1. Time to produce a feasible plan
        m1 = metrics.get("METRIC-01-TIME-TO-PLAN")
        self.assertIsNotNone(m1)
        self.assertEqual(m1.unit, "seconds")
        self.assertEqual(m1.baseline_manual_value, 870.0)  # 14.5 minutes
        self.assertLess(m1.lifelink_value, 1.0, "LifeLink must solve in sub-second time")
        self.assertTrue(m1.is_improvement_positive)

        # 2. Critical patients assigned
        m2 = metrics.get("METRIC-02-CRITICAL-ASSIGNED")
        self.assertIsNotNone(m2)
        self.assertEqual(m2.baseline_manual_value, 16.0)
        self.assertEqual(m2.lifelink_value, 31.0)
        self.assertGreater(m2.lifelink_value, m2.baseline_manual_value)

        # 3. Unassigned critical patients
        m3 = metrics.get("METRIC-03-UNASSIGNED-CRITICAL")
        self.assertIsNotNone(m3)
        self.assertEqual(m3.baseline_manual_value, 15.0)
        self.assertEqual(m3.lifelink_value, 0.0, "LifeLink leaves 0 critical casualties unmanaged")

        # 4. ICU conflicts
        m4 = metrics.get("METRIC-04-ICU-CONFLICTS")
        self.assertIsNotNone(m4)
        self.assertEqual(m4.baseline_manual_value, 4.0)  # 4 hospital diversions in manual baseline
        self.assertEqual(m4.lifelink_value, 0.0, "LifeLink hard constraints guarantee 0 ICU conflicts")

        # 5. Ambulance utilization
        m5 = metrics.get("METRIC-05-AMBULANCE-UTIL")
        self.assertIsNotNone(m5)
        self.assertEqual(m5.baseline_manual_value, 52.4)
        self.assertGreater(m5.lifelink_value, 90.0)

        # 6. Resource conflicts
        m6 = metrics.get("METRIC-06-RESOURCE-CONFLICTS")
        self.assertIsNotNone(m6)
        self.assertEqual(m6.baseline_manual_value, 6.0)
        self.assertEqual(m6.lifelink_value, 0.0)

        # 7. Number of replans
        m7 = metrics.get("METRIC-07-NUM-REPLANS")
        self.assertIsNotNone(m7)
        self.assertEqual(m7.baseline_manual_value, 0.0)  # Manual baseline is static
        self.assertEqual(m7.lifelink_value, 5.0)  # Continuous loop replans on all 5 events

        # 8. Planning latency
        m8 = metrics.get("METRIC-08-PLANNING-LATENCY")
        self.assertIsNotNone(m8)
        self.assertEqual(m8.baseline_manual_value, 492000.0)  # ~8.2 minutes
        self.assertLess(m8.lifelink_value, 1000.0, "LifeLink replanning must be sub-second")

    def test_head_to_head_profile_comparison(self):
        """Verifies detailed profiles of Baseline vs LIFELINK."""
        report = self.engine.run_benchmark()
        base = report.baseline_profile
        life = report.lifelink_profile

        # Planning methodology
        self.assertIn("Nearest-Hospital", base.planning_methodology)
        self.assertIn("OR-Tools", life.planning_methodology)

        # Hard constraints and corridor awareness
        self.assertFalse(base.corridor_awareness)
        self.assertTrue(life.corridor_awareness)
        self.assertFalse(base.hard_constraint_enforcement)
        self.assertTrue(life.hard_constraint_enforcement)

        # Diversion rate
        self.assertEqual(base.diversion_rate_pct, 25.0)
        self.assertEqual(life.diversion_rate_pct, 0.0)

    def test_per_event_replan_benchmark_sequence(self):
        """Verifies per-event benchmark breakdown for all 5 crisis disruption events."""
        report = self.engine.run_benchmark()
        events = report.per_event_replans

        self.assertEqual(len(events), 5)
        self.assertEqual(events[0].event_number, 1)
        self.assertIn("+17 victims", events[0].event_name)
        self.assertEqual(events[1].event_number, 2)
        self.assertIn("Hospital B ICU", events[1].event_name)
        self.assertEqual(events[2].event_number, 3)
        self.assertIn("Highway 101", events[2].event_name)
        self.assertEqual(events[3].event_number, 4)
        self.assertIn("Blood Reserve", events[3].event_name)
        self.assertEqual(events[4].event_number, 5)
        self.assertIn("Hospital C", events[4].event_name)

        for ev in events:
            self.assertGreater(ev.manual_response_minutes, 5.0)
            self.assertLess(ev.lifelink_latency_ms, 500.0)
            self.assertIn("faster", ev.speedup_ratio)

    def test_evaluation_api_endpoints(self):
        """Verifies GET and POST endpoint handlers return valid benchmark reports."""
        # 1. GET handler
        report = get_evaluation_benchmark()
        self.assertEqual(report.scenario_id, "INC-2026-OMEGA-04")
        self.assertEqual(len(report.metrics_comparison), 8)
        self.assertIn("SIMULATION", report.simulation_label.upper())

        # 2. POST handler
        report2 = run_evaluation_benchmark()
        self.assertEqual(report2.scenario_id, "INC-2026-OMEGA-04")
        self.assertEqual(len(report2.metrics_comparison), 8)


if __name__ == "__main__":
    unittest.main()
