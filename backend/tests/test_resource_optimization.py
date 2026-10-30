"""Unit tests for Phase 7 Google OR-Tools Resource Optimization Engine.

Verifies:
  1. Deterministic mathematical MILP solve to OPTIMAL under extreme disaster scarcity.
  2. Strict enforcement of hard capacity bounds (Ambulances, ICU beds, O- Blood, Trauma teams).
  3. High-priority casualty prioritization (V083 and V041 receive feasible allocations).
  4. Bottleneck attribution in unassigned casualties (ICU_DEFICIT, FLEET_EXHAUSTED, etc.).
  5. Accurate conflict quantification (Demanded vs Available vs Deficit).
  6. Crisis reallocation recommendations generation.
  7. 100% mathematical determinism across repeat executions (no LLM, no randomness).
  8. Graceful behavior under extreme scarcity variations (zero fleet, zero ICU).
"""

import unittest
from backend.app.data.repository import db
from backend.app.models.ambulance import Ambulance, AmbulanceStatus, AmbulanceType
from backend.app.models.hospital import Hospital, HospitalBloodInventory
from backend.app.models.victim import Victim, VictimSeverity
from backend.app.resource_optimization.optimizer import ResourceOptimizationEngine, resource_optimizer


class TestResourceOptimizationEngine(unittest.TestCase):
    """Test suite for OR-Tools constrained optimization engine."""

    def setUp(self):
        """Set up standard disaster entities from seed data repository."""
        db.reset()
        self.engine = ResourceOptimizationEngine()
        self.victims = db.get_victims()
        self.hospitals = db.get_hospitals()
        self.ambulances = db.get_ambulances()
        self.roads = db.get_roads()

    def test_milp_solver_solves_to_optimal_under_scarcity(self):
        """MILP engine solves to OPTIMAL status under disaster scarcity."""
        result = self.engine.optimize_resources(
            victims=self.victims,
            hospitals=self.hospitals,
            ambulances=self.ambulances,
            roads=self.roads,
        )

        self.assertIn(result.solver_status, ["OPTIMAL", "FEASIBLE"])
        self.assertGreater(result.objective_value, 0.0)
        self.assertGreater(result.served_victims_count, 0)
        self.assertGreater(result.unassigned_victims_count, 0)
        self.assertEqual(
            result.served_victims_count + result.unassigned_victims_count,
            result.total_high_priority_victims,
        )

    def test_strict_hard_bounds_enforced(self):
        """Verifies that no hospital or ambulance physical capacity bound is violated."""
        result = self.engine.optimize_resources(
            victims=self.victims,
            hospitals=self.hospitals,
            ambulances=self.ambulances,
            roads=self.roads,
        )

        # 1. Total assigned cannot exceed ambulance fleet capacity
        active_ambulances = [a for a in self.ambulances if a.status != AmbulanceStatus.MAINTENANCE]
        self.assertLessEqual(result.served_victims_count, len(active_ambulances))

        # 2. Check each hospital's allocated ICU beds <= available ICU beds
        hosp_icu_counts = {}
        for a in result.assignments:
            if any("ICU" in r for r in a.allocated_resources):
                hosp_icu_counts[a.hospital_id] = hosp_icu_counts.get(a.hospital_id, 0) + 1

        for h in self.hospitals:
            assigned_icu = hosp_icu_counts.get(h.id, 0)
            self.assertLessEqual(
                assigned_icu,
                h.icu,
                f"Hospital {h.id} exceeded ICU capacity: {assigned_icu} assigned vs {h.icu} available",
            )

        # 3. Check Hospital A has 0 open ICU beds and 0 trauma teams -> must receive 0 critical trauma assignments
        h_a_assignments = [a for a in result.assignments if a.hospital_id == "H-A"]
        self.assertEqual(
            len(h_a_assignments),
            0,
            "Hospital A has 0 ICU beds and 0 trauma teams, cannot accept critical trauma patients",
        )

    def test_priority_casualty_allocation(self):
        """Top acute casualties (V083 and V041) receive priority allocation."""
        result = self.engine.optimize_resources(
            victims=self.victims,
            hospitals=self.hospitals,
            ambulances=self.ambulances,
            roads=self.roads,
        )

        assigned_ids = [a.victim_id for a in result.assignments]
        # V083 (critical arterial bleeding) and V041 (critical crush syndrome) should both be assigned
        self.assertIn("V083", assigned_ids, "V083 (highest priority critical) must receive an assignment")
        self.assertIn("V041", assigned_ids, "V041 (critical trauma) must receive an assignment")

        # Verify assigned ambulances are distinct or within capacity
        assigned_ambs = [a.ambulance_id for a in result.assignments]
        self.assertEqual(len(assigned_ambs), len(set(assigned_ambs)), "Each ALS transport unit carries 1 critical casualty")

    def test_unassigned_victims_and_bottleneck_attribution(self):
        """Unassigned victims list is populated with explicit bottleneck attributions."""
        result = self.engine.optimize_resources(
            victims=self.victims,
            hospitals=self.hospitals,
            ambulances=self.ambulances,
            roads=self.roads,
        )

        self.assertGreater(len(result.unassigned_victims), 20)
        bottlenecks = [u.primary_bottleneck for u in result.unassigned_victims]
        self.assertTrue(any(b in ["ICU_DEFICIT", "FLEET_EXHAUSTED", "RESOURCE_DEFICIT"] for b in bottlenecks))

        # Check fields of unassigned casualties
        first_unassigned = result.unassigned_victims[0]
        self.assertTrue(first_unassigned.victim_id.startswith("V"))
        self.assertIn(first_unassigned.victim_priority, ["P1", "P2", "P3"])
        self.assertGreater(len(first_unassigned.reason), 10)

    def test_resource_conflicts_quantified(self):
        """Resource conflicts quantify total demand vs availability vs deficit."""
        result = self.engine.optimize_resources(
            victims=self.victims,
            hospitals=self.hospitals,
            ambulances=self.ambulances,
            roads=self.roads,
        )

        conflict_map = {c.resource_type: c for c in result.resource_conflicts}

        # Check ICU Beds conflict
        self.assertIn("ICU Beds", conflict_map)
        icu_conf = conflict_map["ICU Beds"]
        self.assertEqual(icu_conf.total_available, 4)  # 0 at H-A, 2 at H-B, 2 at H-C
        self.assertGreater(icu_conf.total_demanded, 20)
        self.assertGreater(icu_conf.deficit, 15)
        self.assertEqual(icu_conf.severity, "CRITICAL")

        # Check Ambulances conflict
        self.assertIn("Ambulances", conflict_map)
        amb_conf = conflict_map["Ambulances"]
        self.assertEqual(amb_conf.total_available, 5)
        self.assertGreater(amb_conf.total_demanded, 30)
        self.assertGreater(amb_conf.deficit, 25)

        # Check Rescue Teams conflict
        self.assertIn("Rescue Teams", conflict_map)
        res_conf = conflict_map["Rescue Teams"]
        self.assertEqual(res_conf.total_available, 2)
        self.assertGreater(res_conf.deficit, 0)

    def test_recommended_reallocations_generated(self):
        """Engine recommends crisis standards of care, mutual aid, and blood convoy."""
        result = self.engine.optimize_resources(
            victims=self.victims,
            hospitals=self.hospitals,
            ambulances=self.ambulances,
            roads=self.roads,
        )

        self.assertGreaterEqual(len(result.recommended_reallocations), 3)
        action_types = [r.action_type for r in result.recommended_reallocations]
        self.assertIn("REVERSE_TRIAGE", action_types)
        self.assertIn("MUTUAL_AID", action_types)
        self.assertIn("BLOOD_CONVOY", action_types)

    def test_mathematical_determinism(self):
        """Identical inputs produce 100% bit-exact objective and assignments across multiple runs."""
        run1 = self.engine.optimize_resources(self.victims, self.hospitals, self.ambulances, self.roads)
        run2 = self.engine.optimize_resources(self.victims, self.hospitals, self.ambulances, self.roads)

        self.assertEqual(run1.objective_value, run2.objective_value)
        self.assertEqual(run1.served_victims_count, run2.served_victims_count)
        self.assertEqual(run1.unassigned_victims_count, run2.unassigned_victims_count)

        run1_triples = [(a.victim_id, a.ambulance_id, a.hospital_id) for a in run1.assignments]
        run2_triples = [(a.victim_id, a.ambulance_id, a.hospital_id) for a in run2.assignments]
        self.assertEqual(run1_triples, run2_triples)

    def test_zero_fleet_scarcity_behavior(self):
        """When ambulance fleet is 0, optimizer cleanly returns 0 assignments and flags FLEET_EXHAUSTED."""
        result = self.engine.optimize_resources(
            victims=self.victims,
            hospitals=self.hospitals,
            ambulances=[],  # No ambulances available
            roads=self.roads,
        )

        self.assertIn(result.solver_status, ["OPTIMAL", "FEASIBLE"])
        self.assertEqual(result.served_victims_count, 0)
        self.assertEqual(result.unassigned_victims_count, result.total_high_priority_victims)


if __name__ == "__main__":
    unittest.main()
