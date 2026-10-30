"""Master AI Orchestrator for LifeLink.

Coordinates specialist agents:
  IncidentAgent -> TriageAgent -> HospitalAgent -> ResourceAgent -> RoutingAgent
  -> Mathematical Optimizer (OR-Tools)
  -> CommandAgent (Tactical Briefing for Human Commander)
"""

from typing import Dict, List, Optional

from ai.agents import (
    CommandAgent,
    HospitalAgent,
    IncidentAgent,
    IncidentSceneAssessment,
    ResourceAgent,
    RoutingAgent,
    TriageAgent,
)
from optimization.graph.road_network import DynamicRoadNetwork
from optimization.schemas import Ambulance, Hospital, OptimizationSolution, Patient
from optimization.solvers.milp_allocator import EmergencyDispatchOptimizer


class LifeLinkOrchestrator:
    """Master Multi-Agent Supervisor and Optimization Pipeline."""

    def __init__(self, road_network: Optional[DynamicRoadNetwork] = None):
        self.road_network = road_network or DynamicRoadNetwork()
        self.incident_agent = IncidentAgent()
        self.triage_agent = TriageAgent()
        self.hospital_agent = HospitalAgent()
        self.resource_agent = ResourceAgent()
        self.routing_agent = RoutingAgent(self.road_network)
        self.command_agent = CommandAgent()
        self.optimizer = EmergencyDispatchOptimizer(self.road_network)

    def process_and_optimize(
        self,
        incident_id: str,
        patients: List[Patient],
        ambulances: List[Ambulance],
        hospitals: List[Hospital],
        emergency_calls: Optional[List[str]] = None,
        responder_notes: Optional[List[str]] = None,
    ) -> Dict:
        """Executes the complete cognitive-to-mathematical pipeline:
        1. Incident Agent evaluates scene safety and hazards.
        2. Filter ready resources and hospital capabilities.
        3. Deterministic MILP optimization computes optimal allocation.
        4. Command Agent generates explainable briefing with rationales.
        """
        # 1. Incident assessment
        scene_assessment = self.incident_agent.assess_scene(
            incident_id=incident_id,
            emergency_calls=emergency_calls or [],
            responder_notes=responder_notes or [],
        )

        # 2. Filter available units
        ready_ambulances = self.resource_agent.filter_available_units(ambulances)

        # 3. Solve exact mathematical optimization
        solution = self.optimizer.solve(
            patients=patients,
            ambulances=ready_ambulances,
            hospitals=hospitals,
        )

        # 4. Generate Commander Briefing with Explainable AI rationales
        patients_map = {p.id: p for p in patients}
        hospitals_map = {h.id: h for h in hospitals}

        briefing = self.command_agent.generate_commander_briefing(
            solution=solution,
            patients_map=patients_map,
            hospitals_map=hospitals_map,
        )

        return {
            "incident_id": incident_id,
            "scene_assessment": scene_assessment.model_dump(),
            "briefing": briefing,
            "raw_solution": solution.model_dump(),
        }
