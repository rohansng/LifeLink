"""Unit tests for Phase 13 LifeLink Reliability Audit & Failure Testing.

Verifies the 10 failure and stress test scenarios:
  1. No available ambulance (fleet exhausted / all in maintenance)
  2. No hospital with ICU (regional ICU saturated / 0 open beds)
  3. No feasible route (all transit corridors severed / closed)
  4. Insufficient blood (universal donor O- inventory depleted)
  5. Hospital capacity reaches zero (total regional gridlock)
  6. Invalid AI response (malformed / non-JSON / corrupted LLM outputs)
  7. Gemini API failure (network timeouts, 503 HTTP errors)
  8. Backend restart (clean restoration of deterministic baseline state)
  9. Malformed event (negative ICU values, invalid IDs, unknown events)
 10. Optimizer failure (solver infeasibility, exception handling, refusal to fabricate)

Strict Requirement:
  The application must NEVER fabricate a successful allocation when constraints make it impossible.
  Clearly display: NO FEASIBLE ASSIGNMENT when appropriate.
"""

import unittest
from unittest.mock import patch, MagicMock
from ortools.linear_solver import pywraplp

from backend.app.agents.gemini_client import GeminiClient
from backend.app.agents.incident_agent import IncidentAgent
from backend.app.agents.triage_reasoning_agent import TriageReasoningAgent
from backend.app.command_center.command_center_engine import command_center_engine
from backend.app.command_center.schemas import ActionPriority
from backend.app.data.repository import db
from backend.app.matching.hospital_matcher import hospital_matcher
from backend.app.models import (
    Ambulance,
    AmbulanceStatus,
    AmbulanceType,
    Hospital,
    HospitalBloodInventory,
    Location,
    Road,
    RoadStatus,
    Victim,
    VictimSeverity,
    VictimStatus,
)
from backend.app.replanning.replanning_engine import replanning_engine
from backend.app.resource_optimization.optimizer import resource_optimizer
from backend.app.routing.routing_engine import routing_engine
from backend.app.simulation.simulator import simulator


class TestReliabilityAuditAndFailureModes(unittest.TestCase):
    """Resilience and failure audit test suite verifying deterministic refusal."""

    def setUp(self):
        # Reset database and simulation to deterministic baseline before each test
        simulator.reset()
        db.reset()

        self.v083 = next(v for v in db.get_victims() if v.id == "V083")
        self.victims = db.get_victims()
        self.hospitals = db.get_hospitals()
        self.ambulances = db.get_ambulances()
        self.roads = db.get_roads()

    # -------------------------------------------------------------------------
    # TEST 1: NO AVAILABLE AMBULANCE
    # -------------------------------------------------------------------------
    def test_01_no_available_ambulance(self):
        """Routing and optimizer safely refuse allocation when ambulance fleet is empty or in maintenance."""
        # A. Empty fleet
        assigned = routing_engine.assign_ambulance_for_victim(self.v083, [], "H-B", self.roads)
        self.assertIsNone(assigned, "Must not return an ambulance when fleet is empty")

        chain = routing_engine.build_dispatch_chain(self.v083, [], self.hospitals, self.roads)
        self.assertFalse(chain.is_feasible, "Chain must be marked infeasible")
        self.assertEqual(chain.ambulance_id, "NONE")
        self.assertIsNone(chain.eta_minutes)
        self.assertIn("NO FEASIBLE ASSIGNMENT", chain.chain_summary)
        self.assertIn("Fleet Exhausted", chain.chain_summary)

        # B. All ambulances in maintenance
        maint_ambulances = [
            Ambulance(
                id=f"AMB-M{i}",
                callsign=f"Medic M{i}",
                type=AmbulanceType.ALS,
                status=AmbulanceStatus.MAINTENANCE,
                location=Location(latitude=37.77, longitude=-122.41),
                capacity=1,
                crew_lead="Paramedic Sgt. Davis",
            )
            for i in range(3)
        ]
        assigned_maint = routing_engine.assign_ambulance_for_victim(self.v083, maint_ambulances, "H-B", self.roads)
        self.assertIsNone(assigned_maint, "Must not assign an ambulance in maintenance")

        # C. Resource optimizer refusal
        res = resource_optimizer.optimize_resources(self.victims, self.hospitals, ambulances=[], roads=self.roads)
        self.assertEqual(res.served_victims_count, 0, "Zero victims may be served when 0 ambulances exist")
        self.assertGreater(res.unassigned_victims_count, 0)
        for unassigned in res.unassigned_victims:
            self.assertIn("NO FEASIBLE ASSIGNMENT", unassigned.reason)
            self.assertEqual(unassigned.primary_bottleneck, "FLEET_EXHAUSTED")

    # -------------------------------------------------------------------------
    # TEST 2: NO HOSPITAL WITH ICU
    # -------------------------------------------------------------------------
    def test_02_no_hospital_with_icu(self):
        """Hospital matcher refuses allocation for critical ICU casualty when all facilities have 0 ICU beds."""
        hospitals_zero_icu = [
            Hospital(
                id=h.id,
                name=h.name,
                type=h.type,
                location=h.location,
                icu=0,  # 0 open ICU beds
                icu_total=h.icu_total,
                trauma_available=h.trauma_available,
                operating_rooms_open=h.operating_rooms_open,
                blood=h.blood,
                supported_specialties=h.supported_specialties,
                eta_minutes=h.eta_minutes,
                distance_km=h.distance_km,
            )
            for h in self.hospitals
        ]

        # V083 requires ICU and Trauma
        result = hospital_matcher.match_victim_to_hospital(self.v083, hospitals_zero_icu, self.roads)
        self.assertFalse(result.is_feasible, "Allocation must be marked infeasible")
        self.assertEqual(result.status, "NO FEASIBLE ASSIGNMENT")
        self.assertIsNone(result.recommended_hospital, "Recommended hospital must be None")
        self.assertIn("NO FEASIBLE ASSIGNMENT", result.why_explanation)
        self.assertIn("ICU", result.why_explanation)

        # Verify Command Center Hero enters safe NO FEASIBLE ASSIGNMENT directive
        with patch.object(db, "get_hospitals", return_value=hospitals_zero_icu):
            queue = command_center_engine.build_action_queue()
            self.assertIn("NO FEASIBLE ASSIGNMENT", queue.hero_showcase.action)
            self.assertIn("0 open ICU beds", queue.hero_showcase.reason)

    # -------------------------------------------------------------------------
    # TEST 3: NO FEASIBLE ROUTE
    # -------------------------------------------------------------------------
    def test_03_no_feasible_route(self):
        """Routing engine safely flags NO FEASIBLE ASSIGNMENT when all corridors are closed."""
        all_roads_closed = [
            Road(
                id="ROAD-01",
                name="Highway 101 Southbound",
                status=RoadStatus.CLOSED,
                reason="Overturned fuel tanker and bridge debris",
                detour_penalty_minutes=15.0,
                start_latitude=37.7780,
                start_longitude=-122.4140,
                end_latitude=37.7720,
                end_longitude=-122.4080,
            ),
            Road(
                id="ROAD-02",
                name="Grand Avenue Western Arterial",
                status=RoadStatus.CLOSED,
                reason="Toxic ammonia plume and sinkhole",
                detour_penalty_minutes=20.0,
                start_latitude=37.7730,
                start_longitude=-122.4270,
                end_latitude=37.7680,
                end_longitude=-122.4380,
            ),
            Road(
                id="ROAD-03",
                name="Harbor Perimeter Highway",
                status=RoadStatus.CLOSED,
                reason="Structural collapse at Harbor overpass",
                detour_penalty_minutes=25.0,
                start_latitude=37.7750,
                start_longitude=-122.4300,
                end_latitude=37.7650,
                end_longitude=-122.4400,
            ),
        ]

        routes = routing_engine.calculate_routes("Sector Bravo", "H-B", all_roads_closed)
        self.assertTrue(all(r.is_blocked for r in routes), "All route options must be blocked")

        chain = routing_engine.build_dispatch_chain(self.v083, self.ambulances, self.hospitals, all_roads_closed)
        self.assertFalse(chain.is_feasible, "Dispatch chain must be marked infeasible")
        self.assertEqual(chain.active_route_id, "BLOCKED")
        self.assertIsNone(chain.eta_minutes)
        self.assertIn("NO FEASIBLE ASSIGNMENT", chain.chain_summary)
        self.assertIn("All Routes Blocked", chain.chain_summary)
        self.assertEqual(chain.reroute_status, "ALERT")

    # -------------------------------------------------------------------------
    # TEST 4: INSUFFICIENT BLOOD
    # -------------------------------------------------------------------------
    def test_04_insufficient_blood(self):
        """Hospital matcher refuses allocation for hemorrhagic casualty when all facilities have 0 units O- blood."""
        hospitals_no_blood = [
            Hospital(
                id=h.id,
                name=h.name,
                type=h.type,
                location=h.location,
                icu=h.icu,
                icu_total=h.icu_total,
                trauma_available=h.trauma_available,
                operating_rooms_open=h.operating_rooms_open,
                blood=HospitalBloodInventory(O_negative=0, O_positive=0, A_positive=0),  # 0 blood
                supported_specialties=h.supported_specialties,
                eta_minutes=h.eta_minutes,
                distance_km=h.distance_km,
            )
            for h in self.hospitals
        ]

        # V083 has arterial bleeding / hemorrhagic shock
        result = hospital_matcher.match_victim_to_hospital(self.v083, hospitals_no_blood, self.roads)
        self.assertFalse(result.is_feasible, "Must not allocate bleeding patient to hospital with 0 blood")
        self.assertEqual(result.status, "NO FEASIBLE ASSIGNMENT")
        self.assertIsNone(result.recommended_hospital)
        self.assertIn("NO FEASIBLE ASSIGNMENT", result.why_explanation)
        self.assertIn("blood", result.why_explanation.lower())

    # -------------------------------------------------------------------------
    # TEST 5: HOSPITAL CAPACITY REACHES ZERO
    # -------------------------------------------------------------------------
    def test_05_hospital_capacity_reaches_zero(self):
        """Application refuses allocation when regional medical gridlock occurs (all beds & ORs = 0)."""
        hospitals_gridlock = [
            Hospital(
                id=h.id,
                name=h.name,
                type=h.type,
                location=h.location,
                icu=0,
                icu_total=h.icu_total,
                operating_rooms_open=0,
                trauma_available=False,
                doctors_available=0,
                blood=HospitalBloodInventory(O_negative=0, O_positive=0, A_positive=0),
                supported_specialties=[],
                eta_minutes=h.eta_minutes,
                distance_km=h.distance_km,
            )
            for h in self.hospitals
        ]

        result = hospital_matcher.match_victim_to_hospital(self.v083, hospitals_gridlock, self.roads)
        self.assertFalse(result.is_feasible)
        self.assertEqual(result.status, "NO FEASIBLE ASSIGNMENT")
        self.assertIsNone(result.recommended_hospital)

        opt_result = resource_optimizer.optimize_resources(self.victims, hospitals_gridlock, self.ambulances, self.roads)
        self.assertEqual(opt_result.served_victims_count, 0)
        self.assertGreater(opt_result.unassigned_victims_count, 0)
        for unassigned in opt_result.unassigned_victims:
            self.assertIn("NO FEASIBLE ASSIGNMENT", unassigned.reason)

    # -------------------------------------------------------------------------
    # TEST 6: INVALID AI RESPONSE
    # -------------------------------------------------------------------------
    def test_06_invalid_ai_response(self):
        """AI agents safely fall back to deterministic NLP logic when LLM outputs corrupt JSON or garbage."""
        # 1. Non-JSON string
        mock_client = GeminiClient(api_key="mock-key-for-test")
        mock_client.set_mock_responder(lambda prompt, sys: "Internal Server Error 500: Database connection closed.")

        incident_agent = IncidentAgent(client=mock_client)
        out1 = incident_agent.process_report("14 injured near Gate 4, 3 unconscious")
        self.assertTrue(out1.fallback_used, "Should safely fall back to deterministic parser")
        self.assertEqual(out1.estimated_casualties, 14)
        self.assertEqual(out1.unconscious_count, 3)

        # 2. Corrupt JSON syntax
        mock_client.set_mock_responder(lambda prompt, sys: '{"estimated_casualties": 12, "unconscious_count": ')
        out2 = incident_agent.process_report("8 injured in rubble")
        self.assertTrue(out2.fallback_used)
        self.assertEqual(out2.estimated_casualties, 8)

        # 3. Type violation (string instead of int)
        mock_client.set_mock_responder(lambda prompt, sys: '{"estimated_casualties": "many", "confidence": "high"}')
        out3 = incident_agent.process_report("6 injured at crossing")
        self.assertTrue(out3.fallback_used)
        self.assertEqual(out3.estimated_casualties, 6)

        # 4. Triage agent invalid response
        triage_agent = TriageReasoningAgent(client=mock_client)
        t_out = triage_agent.reason_triage("Arterial bleeding and pelvic fracture", victim_id="V083")
        self.assertTrue(t_out.fallback_used)
        self.assertEqual(t_out.suggested_priority, "P1")
        self.assertTrue(t_out.needs_blood)

    # -------------------------------------------------------------------------
    # TEST 7: GEMINI / API FAILURE
    # -------------------------------------------------------------------------
    def test_07_gemini_api_failure(self):
        """AI agents safely handle network exceptions or HTTP timeouts from Gemini without crashing."""
        mock_client = GeminiClient(api_key="mock-key-for-test")

        def mock_failing_gemini(prompt, sys):
            raise ConnectionError("Gemini REST API unreachable: 503 Service Unavailable")

        # Mock responder raises network exception
        mock_client.set_mock_responder(mock_failing_gemini)

        # In IncidentAgent, when GeminiClient returns None due to error, deterministic fallback engages
        with patch.object(mock_client, "generate_structured_json", return_value=None):
            agent = IncidentAgent(client=mock_client)
            output = agent.process_report("9 casualties near Track 2, 1 unconscious")

            self.assertTrue(output.fallback_used)
            self.assertEqual(output.estimated_casualties, 9)
            self.assertEqual(output.unconscious_count, 1)
            self.assertGreater(output.confidence, 0.0)

            triage_agent = TriageReasoningAgent(client=mock_client)
            t_out = triage_agent.reason_triage("Severe ammonia inhalation and chemical burn", victim_id="V041")
            self.assertTrue(t_out.fallback_used)
            self.assertGreater(t_out.confidence, 0.0)

    # -------------------------------------------------------------------------
    # TEST 8: BACKEND RESTART
    # -------------------------------------------------------------------------
    def test_08_backend_restart(self):
        """Simulated backend reboot restores canonical baseline state and clears transient state cleanly."""
        # 1. Mutate state
        simulator.advance_step()
        simulator.advance_step()
        self.assertGreater(simulator.current_step, 0)
        self.assertNotEqual(db.incident.statistics.total_victims, 214)

        # 2. Trigger reboot reset
        simulator.reset()
        db.reset()

        # 3. Verify exact baseline restoration
        self.assertEqual(simulator.current_step, 0)
        self.assertEqual(len(simulator.event_history), 0)
        self.assertEqual(db.incident.statistics.total_victims, 214)
        self.assertEqual(db.incident.statistics.critical, 31)
        self.assertEqual(db.incident.statistics.serious, 67)
        self.assertEqual(db.incident.statistics.moderate, 82)
        self.assertEqual(db.incident.statistics.unknown, 34)
        self.assertEqual(len(db.get_ambulances()), 5)
        self.assertEqual(len(db.get_hospitals()), 3)
        self.assertEqual(sum(h.icu for h in db.get_hospitals()), 4)

    # -------------------------------------------------------------------------
    # TEST 9: MALFORMED EVENT
    # -------------------------------------------------------------------------
    def test_09_malformed_event(self):
        """Continuous replanning loop handles negative ICU, non-existent hospital IDs, and corrupt events safely."""
        # A. Negative ICU count injection (must be clamped to 0)
        plan1 = replanning_engine.trigger_replan(
            event_type="HOSPITAL_CAPACITY_CHANGE",
            reason="Corrupted event payload test",
            hospital_id="H-B",
            new_icu=-10,  # Corrupted negative value
        )
        self.assertIsNotNone(plan1.plan_version_label)
        hosp_b = db.hospitals.get("H-B")
        self.assertGreaterEqual(hosp_b.icu, 0, "ICU count must never be negative")

        # B. Non-existent hospital ID (must log warning and fallback cleanly without crashing)
        plan2 = replanning_engine.trigger_replan(
            event_type="HOSPITAL_CAPACITY_CHANGE",
            reason="Unmapped hospital reference test",
            hospital_id="H-NON-EXISTENT-FACILITY-999",
            new_icu=2,
        )
        self.assertIsNotNone(plan2.plan_version_label)

        # C. Non-existent road ID (must log warning and fallback cleanly without crashing)
        plan3 = replanning_engine.trigger_replan(
            event_type="ROAD_BLOCKED",
            reason="Ghost road obstacle",
            road_id="ROAD-GHOST-UNKNOWN",
        )
        self.assertIsNotNone(plan3.plan_version_label)

        # D. Unrecognized event type
        plan4 = replanning_engine.trigger_replan(
            event_type="UNRECOGNIZED_ANOMALOUS_EVENT",
            reason="Random synthetic anomaly",
        )
        self.assertIsNotNone(plan4.plan_version_label)

    # -------------------------------------------------------------------------
    # TEST 10: OPTIMIZER FAILURE
    # -------------------------------------------------------------------------
    def test_10_optimizer_failure(self):
        """Resource optimizer catches solver infeasibility or runtime exceptions and returns safe rejection state."""
        # 1. Mock solver throwing unexpected runtime exception
        with patch.object(pywraplp.Solver, "Solve", side_effect=RuntimeError("OR-Tools solver memory limit exceeded")):
            res = resource_optimizer.optimize_resources(self.victims, self.hospitals, self.ambulances, self.roads)

            self.assertEqual(res.solver_status, "INFEASIBLE")
            self.assertEqual(res.assignments, [], "Assignments must be empty on solver failure")
            self.assertEqual(res.served_victims_count, 0)
            self.assertGreater(res.unassigned_victims_count, 0)
            for unassigned in res.unassigned_victims:
                self.assertIn("NO FEASIBLE ASSIGNMENT", unassigned.reason)

        # 2. Mock solver returning INFEASIBLE status code
        with patch.object(pywraplp.Solver, "Solve", return_value=pywraplp.Solver.INFEASIBLE):
            res2 = resource_optimizer.optimize_resources(self.victims, self.hospitals, self.ambulances, self.roads)

            self.assertEqual(res2.solver_status, "INFEASIBLE")
            self.assertEqual(res2.assignments, [])
            self.assertEqual(res2.served_victims_count, 0)


if __name__ == "__main__":
    unittest.main()
