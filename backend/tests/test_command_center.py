"""Unit tests for Phase 9 LifeLink Command Center & Hero Action Queue.

Verifies:
  1. Synthesis of all incident inputs into a prioritized action queue.
  2. Strict verification of hero showcase requirements:
     - 🔴 Priority 1
     - V083 (Critical bleeding)
     - -> Ambulance 04
     - -> Hospital B
     - -> Route B
     - -> ETA 13 min
     - WHY? (ICU available, Trauma available, Blood available, Shortest feasible ETA)
  3. Every recommendation contains: priority, action, affected entity, reason, evidence, confidence, timestamp.
  4. Comprehensive 'WHY?' breakdown with rejected alternatives.
  5. Action authorization and execution workflow.
"""

import unittest
from backend.app.command_center.command_center_engine import command_center_engine
from backend.app.command_center.schemas import ActionPriority, ActionStatus
from backend.app.data.repository import db


class TestCommandCenterEngine(unittest.TestCase):
    """Test suite for Command Center Action Queue and Hero Feature."""

    def setUp(self):
        self.engine = command_center_engine

    def test_command_center_builds_action_queue(self):
        """Command Center synthesizes inputs into a prioritized action queue."""
        queue = self.engine.build_action_queue()

        self.assertIsNotNone(queue.timestamp)
        self.assertEqual(queue.threat_level, "CRITICAL")
        self.assertGreaterEqual(queue.total_actions, 5)
        self.assertGreater(queue.p1_count, 0)
        self.assertGreater(queue.p2_count, 0)
        self.assertIsNotNone(queue.hero_showcase)

    def test_hero_showcase_exact_prompt_requirements(self):
        """Verifies exact showcase case: V083 -> AMB-04 -> Hospital B -> Route B -> 13 min."""
        queue = self.engine.build_action_queue()
        hero = queue.hero_showcase

        # 1. Priority 1 (🔴 Critical)
        self.assertEqual(hero.priority, ActionPriority.P1)

        # 2. V083 Critical bleeding
        self.assertEqual(hero.victim_id, "V083")
        self.assertIn("critical bleeding", hero.victim_condition.lower())

        # 3. -> Ambulance 04
        self.assertEqual(hero.ambulance_id, "AMB-04")
        self.assertIn("Medic 4", hero.ambulance_callsign)

        # 4. -> Hospital B
        self.assertEqual(hero.hospital_id, "H-B")
        self.assertIn("St. Jude", hero.hospital_name)

        # 5. -> Route B
        self.assertIn("Route B", hero.route_name)

        # 6. -> ETA 13 min
        self.assertEqual(hero.eta_minutes, 13.0)

        # 7. Reason: critical victim + trauma capability + ICU availability + feasible ETA.
        lower_reason = hero.reason.lower()
        self.assertIn("critical victim", lower_reason)
        self.assertIn("trauma capability", lower_reason)
        self.assertIn("icu availability", lower_reason)
        self.assertIn("feasible eta", lower_reason)

        # 8. Evidence: ICU available, Trauma available, Blood available, Shortest feasible ETA
        evidence_str = " ".join(hero.evidence).lower()
        self.assertIn("icu available", evidence_str)
        self.assertIn("trauma available", evidence_str)
        self.assertIn("blood available", evidence_str)
        self.assertIn("shortest feasible eta", evidence_str)

    def test_every_recommendation_has_mandatory_fields(self):
        """Each recommendation must include: priority, action, affected entity, reason, evidence, confidence, timestamp."""
        queue = self.engine.build_action_queue()

        for item in queue.action_queue:
            # 1. priority
            self.assertIn(item.priority, [ActionPriority.P1, ActionPriority.P2, ActionPriority.P3])

            # 2. action
            self.assertGreater(len(item.action), 10, f"Action description missing for {item.id}")

            # 3. affected entity
            self.assertGreater(len(item.affected_entity), 3, f"Affected entity missing for {item.id}")

            # 4. reason
            self.assertGreater(len(item.reason), 10, f"Reason missing for {item.id}")

            # 5. evidence
            self.assertIsInstance(item.evidence, list)
            self.assertGreater(len(item.evidence), 0, f"Evidence list empty for {item.id}")

            # 6. confidence
            self.assertGreaterEqual(item.confidence, 0.0)
            self.assertLessEqual(item.confidence, 1.0)

            # 7. timestamp
            self.assertIsNotNone(item.timestamp)

    def test_why_breakdown_contains_rejected_alternatives(self):
        """Verifies why modal data provides selected criteria, rejected alternatives, and allocated bundles."""
        queue = self.engine.build_action_queue()
        hero = queue.hero_showcase
        why = hero.why_breakdown

        self.assertGreaterEqual(len(why.selection_criteria), 3)
        self.assertGreaterEqual(len(why.allocated_resources), 3)

        # Verify Hospital A is explicitly listed as rejected with 0 ICU / 0 OR
        hosp_a_rejection = next((r for r in why.rejected_alternatives if "Hospital A" in r["name"]), None)
        self.assertIsNotNone(hosp_a_rejection)
        self.assertEqual(hosp_a_rejection["status"], "REJECTED")
        reasons_str = " ".join(hosp_a_rejection["reasons"]).lower()
        self.assertIn("icu unavailable", reasons_str)
        self.assertIn("trauma occupied", reasons_str)

        # Verify Route A is explicitly rejected due to closure
        route_a_rejection = next((r for r in why.rejected_alternatives if "Route A" in r["name"]), None)
        self.assertIsNotNone(route_a_rejection)
        self.assertIn("closed", " ".join(route_a_rejection["reasons"]).lower())

    def test_action_execution_workflow(self):
        """Verifies commander execution updates action status, dispatches units, and logs timeline events."""
        action_id = "CMD-ACT-HERO-083"
        exec_details = self.engine.execute_action(action_id)

        self.assertEqual(exec_details["status"], "EXECUTED")
        self.assertIn("AMB-04", str(exec_details["dispatched_entities"]))
        self.assertIsNotNone(exec_details["timeline_event_id"])

        # 1. Action status updated in queue
        queue = self.engine.build_action_queue()
        hero = queue.hero_showcase
        self.assertEqual(hero.status, ActionStatus.EXECUTED)

        # 2. Casualty state transitioned
        v083 = db.victims.get("V083")
        self.assertIsNotNone(v083)
        self.assertEqual(v083.status.value.lower(), "in_transit")
        self.assertEqual(v083.assigned_ambulance_id, "AMB-04")

        # 3. Ambulance state transitioned
        amb04 = db.ambulances.get("AMB-04")
        self.assertIsNotNone(amb04)
        self.assertEqual(amb04.status.value.lower(), "transporting")
        self.assertEqual(amb04.assigned_victim_id, "V083")

        # 4. Timeline audit event injected
        events = db.get_events()
        cmd_events = [e for e in events if "AMB-04 Dispatched to V083" in e.title]
        self.assertGreater(len(cmd_events), 0, "Timeline must log executed command directive")

    def test_batch_execution_phase(self):
        """Verifies commander can execute all pending directives across the queue in one phase."""
        results = self.engine.execute_all_pending()
        self.assertGreaterEqual(len(results), 5)

        queue = self.engine.build_action_queue()
        self.assertTrue(all(a.status == ActionStatus.EXECUTED for a in queue.action_queue))


if __name__ == "__main__":
    unittest.main()

