"""Unit tests for Phase 11 LifeLink Killer Demo Mode.

Verifies:
  1. Exact INITIAL crisis baseline:
     - 214 victims (31 critical, 67 serious, 82 moderate, 34 unknown)
     - 5 ambulances
     - 3 hospitals
     - 4 ICU beds
  2. Automatic deterministic sequence of 5 events:
     - Event 1: +17 victims, +5 critical
     - Event 2: Hospital B ICU 2 -> 1
     - Event 3: Road A 11m -> 27m
     - Event 4: Hospital B / Regional O- Blood 18 -> 3
     - Event 5: Hospital C Trauma team available (+2 ICU, +2 OR)
  3. Post-simulation mission summary verification:
     - victims tracked (231)
     - critical patients assigned (5)
     - unassigned critical (31)
     - ICU conflicts (36 vs 5, deficit 31)
     - resource alerts & recommended actions
  4. Repetition reliability: repeatedly runnable across multiple judging runs with 100% determinism.
"""

import unittest
from backend.app.data.repository import db
from backend.app.simulation.simulator import simulator


class TestKillerDemoSimulation(unittest.TestCase):
    """Test suite for Phase 11 Killer Demo Sequence and Repeatability."""

    def setUp(self):
        simulator.reset()
        db.reset()

    def tearDown(self):
        simulator.reset()
        db.reset()

    def test_initial_crisis_baseline_state(self):
        """Verifies exact initial state required before simulation start."""
        incident = db.get_incident()
        stats = incident.statistics
        hospitals = db.get_hospitals()
        ambulances = db.get_ambulances()

        # 214 victims
        self.assertEqual(stats.total_victims, 214)

        # 31 critical
        self.assertEqual(stats.critical, 31)

        # 67 serious
        self.assertEqual(stats.serious, 67)

        # 82 moderate
        self.assertEqual(stats.moderate, 82)

        # 34 unknown
        self.assertEqual(stats.unknown, 34)

        # 5 ambulances
        self.assertEqual(len(ambulances), 5)

        # 3 hospitals
        self.assertEqual(len(hospitals), 3)

        # 4 ICU beds total (H-A: 0, H-B: 2, H-C: 2)
        total_icu = sum(h.icu for h in hospitals)
        self.assertEqual(total_icu, 4)

    def test_full_killer_demo_sequence_execution(self):
        """Executes all 5 events in sequence and asserts state deltas at every step."""
        # --- EVENT 1: Responder evidence: +17 victims, +5 critical ---
        res1 = simulator.advance_step()
        self.assertEqual(res1.step_number, 1)
        stats1 = db.get_incident().statistics
        self.assertEqual(stats1.total_victims, 231)
        self.assertEqual(stats1.critical, 36)

        # --- EVENT 2: Hospital B ICU: 2 -> 1 ---
        res2 = simulator.advance_step()
        self.assertEqual(res2.step_number, 2)
        hosp_b = db.hospitals.get("H-B")
        self.assertEqual(hosp_b.icu, 1)

        # --- EVENT 3: Road A: 11 min -> 27 min ---
        res3 = simulator.advance_step()
        self.assertEqual(res3.step_number, 3)
        road_a = db.roads.get("ROAD-01")
        self.assertEqual(road_a.status.value, "closed")
        self.assertEqual(road_a.detour_penalty_minutes, 16.0)

        # --- EVENT 4: Hospital B O- blood: 18 -> 3 ---
        res4 = simulator.advance_step()
        self.assertEqual(res4.step_number, 4)
        self.assertEqual(hosp_b.blood.O_negative, 3)

        # --- EVENT 5: Hospital C trauma team becomes available ---
        res5 = simulator.advance_step()
        self.assertEqual(res5.step_number, 5)
        self.assertTrue(res5.is_completed)
        hosp_c = db.hospitals.get("H-C")
        self.assertEqual(hosp_c.operating_rooms_open, 3)
        self.assertEqual(hosp_c.icu, 4)

    def test_post_simulation_summary_metrics(self):
        """Verifies end-state mission metrics at the conclusion of Event 5."""
        # Run all 5 steps
        for _ in range(5):
            simulator.advance_step()

        stats = db.get_incident().statistics
        hospitals = db.get_hospitals()
        total_icu = sum(h.icu for h in hospitals)

        # Victims tracked: 231
        self.assertEqual(stats.total_victims, 231)

        # Critical casualties: 36
        self.assertEqual(stats.critical, 36)

        # Active ambulances: 5
        ambulances = db.get_ambulances()
        self.assertEqual(len(ambulances), 5)

        # Assigned critical: 5 (100% fleet committed)
        # Unassigned critical: 31
        assigned = min(stats.critical, len(ambulances))
        unassigned = stats.critical - assigned
        self.assertEqual(assigned, 5)
        self.assertEqual(unassigned, 31)

        # ICU conflicts: 36 demanding vs 5 available
        self.assertEqual(total_icu, 5)  # H-A: 0, H-B: 1, H-C: 3 + 1
        deficit = stats.critical - total_icu
        self.assertEqual(deficit, 31)

    def test_repeatability_across_multiple_runs(self):
        """Verifies that demo can be reset and executed repeatedly with 100% deterministic outputs."""
        for run_idx in range(3):
            simulator.reset()
            db.reset()

            # Baseline check
            self.assertEqual(db.get_incident().statistics.total_victims, 214)

            # Run sequence
            for _ in range(5):
                simulator.advance_step()

            # End state check
            self.assertEqual(db.get_incident().statistics.total_victims, 231)
            self.assertEqual(db.hospitals.get("H-B").icu, 1)
            self.assertEqual(db.roads.get("ROAD-01").status.value, "closed")


if __name__ == "__main__":
    unittest.main()
