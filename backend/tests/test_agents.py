"""Unit tests for Phase 8 LifeLink Modular AI Agents.

Verifies:
  1. Incident Agent converts unstructured reports ("12 injured near Gate 3, 2 unconscious") into structured data.
  2. Hazmat, chemical, and perimeter extraction.
  3. Evidence Agent interprets visual and drone reconnaissance evidence.
  4. Triage Reasoning Agent extracts clinical capabilities & physiological markers.
  5. Hospital Agent identifies bed saturation and surgical bottlenecks.
  6. Resource Agent detects fleet exhaustion and triggers mutual aid alarms.
  7. Routing Agent synthesizes corridor obstacles and detour directives.
  8. Command Agent compiles actionable executive Commander Briefings.
  9. Safe handling of malformed AI responses (invalid JSON, wrong types, empty outputs) with fallback_used=True.
 10. Deterministic authority protection (Agents do not override numerical scoring or MILP bounds).
 11. Full multi-agent Orchestrator pipeline execution.
"""

import unittest
from backend.app.agents import (
    command_agent,
    evidence_agent,
    hospital_agent,
    incident_agent,
    orchestrator,
    resource_agent,
    routing_agent,
    triage_reasoning_agent,
)
from backend.app.agents.gemini_client import GeminiClient
from backend.app.agents.incident_agent import IncidentAgent
from backend.app.agents.triage_reasoning_agent import TriageReasoningAgent
from backend.app.data.repository import db
from backend.app.models.road import Road, RoadStatus
from backend.app.resource_optimization.optimizer import resource_optimizer


class TestLifeLinkAIAgents(unittest.TestCase):
    """Comprehensive test suite for Phase 8 Modular AI Agents."""

    def setUp(self):
        self.victims = db.get_victims()
        self.hospitals = db.get_hospitals()
        self.ambulances = db.get_ambulances()
        self.roads = db.get_roads()

    def test_incident_agent_structured_extraction(self):
        """Incident Agent extracts casualty counts, unconscious victims, and location anchor."""
        raw_text = "12 injured near Gate 3, 2 unconscious, severe crushing impact"
        output = incident_agent.process_report(raw_text)

        self.assertEqual(output.estimated_casualties, 12)
        self.assertEqual(output.unconscious_count, 2)
        self.assertEqual(output.location_sector, "Gate 3")
        self.assertIn(output.hazard_level, ["HIGH", "CRITICAL"])
        self.assertGreater(output.confidence, 0.0)
        self.assertGreater(len(output.key_evidence), 0)

    def test_incident_agent_hazmat_detection(self):
        """Incident Agent flags chemical leaks, determines chemical type, and expands perimeter."""
        raw_text = "Chemical tanker overturned near Car 4, strong smell of ammonia, 8 victims coughing and unresponsive"
        output = incident_agent.process_report(raw_text)

        self.assertTrue(output.hazmat_detected)
        self.assertIn("Ammonia", output.hazmat_type or "")
        self.assertEqual(output.hazard_level, "CRITICAL")
        self.assertGreaterEqual(output.perimeter_radius_meters, 300.0)

    def test_evidence_agent_visual_interpretation(self):
        """Evidence Agent interprets drone reconnaissance descriptions and detects entrapment & PPE."""
        drone_feed = (
            "Drone thermal scan: Ruptured freight tanker leaking dense toxic vapor cloud over "
            "crushed passenger carriage with 4 trapped victims, structural debris unstable"
        )
        output = evidence_agent.interpret_evidence(drone_feed)

        self.assertEqual(output.entrapped_count, 4)
        self.assertEqual(output.structural_stability, "UNSTABLE")
        self.assertTrue(any("Toxic" in h or "Chemical" in h for h in output.detected_hazards))
        self.assertTrue(any("Level A" in p or "SCBA" in p for p in output.ppe_required))
        self.assertGreater(len(output.evidence_tags), 0)

    def test_triage_reasoning_agent_clinical_extraction(self):
        """Triage Reasoning Agent extracts anatomical trauma, ICU/blood requirements, and START priority."""
        field_notes = (
            "Victim V083: Arterial hemorrhage from deep femoral laceration, severe shock, "
            "BP 75/45, weak pulse 135, diaphoretic, respiratory distress"
        )
        output = triage_reasoning_agent.reason_triage(field_notes, victim_id="V083")

        self.assertEqual(output.suggested_priority, "P1")
        self.assertEqual(output.physiological_severity, "CRITICAL")
        self.assertTrue(output.needs_icu)
        self.assertTrue(output.needs_blood)
        self.assertTrue(output.needs_trauma_team)
        self.assertTrue(any("Trauma" in c or "Blood" in c for c in output.required_capabilities))
        self.assertGreater(len(output.clinical_reasoning), 15)

    def test_hospital_agent_saturation_analysis(self):
        """Hospital Agent detects 100% bed saturation and surgical bottlenecks at Hospital A."""
        hosp_a = next(h for h in self.hospitals if h.id == "H-A")
        output = hospital_agent.evaluate_facility(hosp_a)

        self.assertEqual(output.operational_status, "SATURATED")
        self.assertTrue(output.surge_capacity_warning)
        self.assertTrue(any("Zero ICU Beds" in b for b in output.operational_bottlenecks))
        self.assertIn("H-A", output.hospital_id)

    def test_resource_agent_fleet_exhaustion_and_mutual_aid(self):
        """Resource Agent identifies fleet exhaustion and generates mutual-aid alarm triggers."""
        output = resource_agent.evaluate_resources(
            ambulances=self.ambulances,
            open_icu_beds=4,
            total_casualties=214,
        )

        self.assertEqual(output.resource_strain_level, "CRITICAL")
        self.assertTrue(any("Ambulance" in d for d in output.critical_deficits))
        self.assertTrue(any("MABAS" in t or "Mutual Aid" in t for t in output.mutual_aid_triggers))
        self.assertGreater(len(output.asset_warnings), 0)

    def test_routing_agent_detour_synthesis(self):
        """Routing Agent produces human-readable detour guidance when a primary corridor is closed."""
        blocked_roads = [
            Road(
                id="ROAD-01",
                name="Route A (Highway 101)",
                status=RoadStatus.CLOSED,
                reason="Overturned chemical tanker",
                detour_penalty_minutes=14.0,
                start_latitude=37.77,
                start_longitude=-122.41,
                end_latitude=37.78,
                end_longitude=-122.42,
            )
        ]
        output = routing_agent.evaluate_routes(blocked_roads)

        self.assertTrue(output.hazard_zone_affected)
        self.assertGreaterEqual(output.transit_delay_minutes, 14.0)
        self.assertIn("Detour penalty", output.detour_recommendation)
        self.assertTrue(any("CLOSED" in e for e in output.corridor_evaluations))

    def test_command_agent_briefing_synthesis(self):
        """Command Agent synthesizes OR-Tools solution and intelligence into actionable briefing."""
        opt_res = resource_optimizer.optimize_resources(
            self.victims, self.hospitals, self.ambulances, self.roads
        )
        inc_out = incident_agent.process_report("12 injured near Gate 3, 2 unconscious")
        evi_out = evidence_agent.interpret_evidence("Ruptured tanker with 4 trapped victims")
        res_out = resource_agent.evaluate_resources(self.ambulances, 4, len(self.victims))
        rot_out = routing_agent.evaluate_routes(self.roads)

        briefing = command_agent.generate_briefing(
            optimization_result=opt_res,
            incident_assessment=inc_out,
            evidence_assessment=evi_out,
            resource_assessment=res_out,
            routing_assessment=rot_out,
        )

        self.assertIn("CRISIS", briefing.incident_headline.upper())
        self.assertEqual(briefing.overall_threat_level, "CRITICAL")
        self.assertGreater(len(briefing.key_clinical_priorities), 0)
        self.assertIn("ICU", briefing.unassigned_casualties_alert)
        self.assertGreaterEqual(len(briefing.critical_tradeoffs_explained), 3)
        self.assertGreaterEqual(len(briefing.actionable_directives), 3)

    def test_malformed_ai_response_handling_and_fallback(self):
        """Verifies safe fallback to deterministic logic when LLM output is malformed, non-JSON, or corrupted."""
        # 1. Create a GeminiClient with a mock responder returning invalid non-JSON garbage
        mock_client = GeminiClient(api_key="mock-key-for-test")
        mock_client.set_mock_responder(lambda prompt, sys: "I am a chatbot and I cannot generate valid JSON right now!!!")

        agent_with_broken_llm = IncidentAgent(client=mock_client)
        output = agent_with_broken_llm.process_report("12 injured near Gate 3, 2 unconscious")

        # Must not crash! Must use deterministic fallback!
        self.assertTrue(output.fallback_used, "Should safely fall back to deterministic parser")
        self.assertEqual(output.estimated_casualties, 12)
        self.assertEqual(output.unconscious_count, 2)
        self.assertEqual(output.location_sector, "Gate 3")

        # 2. Test when LLM returns invalid JSON with invalid types
        mock_client.set_mock_responder(lambda prompt, sys: '{"estimated_casualties": "invalid_number_here", "confidence": "high"}')
        output2 = agent_with_broken_llm.process_report("5 casualties at North Platform")
        self.assertTrue(output2.fallback_used)
        self.assertEqual(output2.estimated_casualties, 5)

        # 3. Test Triage Reasoning Agent with broken LLM
        triage_broken = TriageReasoningAgent(client=mock_client)
        t_out = triage_broken.reason_triage("Arterial bleed, unconscious, shock", victim_id="V083")
        self.assertTrue(t_out.fallback_used)
        self.assertEqual(t_out.suggested_priority, "P1")
        self.assertTrue(t_out.needs_blood)

    def test_deterministic_authority_protected(self):
        """Verifies that AI agents never override mathematical optimization decisions."""
        pipeline_res = orchestrator.run_pipeline()

        # The pipeline must explicitly verify deterministic alignment
        self.assertTrue(pipeline_res.deterministic_alignment_verified)

        # Check that OR-Tools allocation results in briefing match real solver output
        opt_res = resource_optimizer.optimize_resources(
            self.victims, self.hospitals, self.ambulances, self.roads
        )
        self.assertIn(str(opt_res.solver_status), pipeline_res.commander_briefing.optimization_alignment_summary)

    def test_orchestrator_pipeline_end_to_end(self):
        """Executes full multi-agent pipeline and verifies all 7 agent outputs."""
        result = orchestrator.run_pipeline(
            unstructured_incident_report="12 injured near Gate 3, 2 unconscious, toxic ammonia cloud",
            unstructured_evidence_description="Drone camera shows crushed passenger carriage, 4 trapped victims",
        )

        self.assertIsNotNone(result.incident_assessment)
        self.assertIsNotNone(result.evidence_assessment)
        self.assertGreater(len(result.triage_reasoning), 0)
        self.assertEqual(len(result.hospital_assessments), 3)
        self.assertIsNotNone(result.resource_assessment)
        self.assertIsNotNone(result.routing_assessment)
        self.assertIsNotNone(result.commander_briefing)
        self.assertEqual(result.incident_assessment.estimated_casualties, 12)
        self.assertEqual(result.evidence_assessment.entrapped_count, 4)


if __name__ == "__main__":
    unittest.main()

