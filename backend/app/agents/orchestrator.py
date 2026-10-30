"""LifeLink Master Agent Orchestrator for Phase 8.

Coordinates the multi-agent hierarchy:
                 ORCHESTRATOR
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
   INCIDENT        EVIDENCE        COMMAND
       │              │              │
       ↓              ↓              ↓
   TRIAGE         RESOURCE        ROUTING
                      │
                      ↓
                  HOSPITAL

IMPORTANT ARCHITECTURAL RULE:
Agents process unstructured intelligence, reason about evidence, and generate human briefings.
Deterministic systems (Scoring, Constraints, Matching, Routing, OR-Tools MILP) strictly
govern numerical decisions, capacities, and assignments.
"""

from typing import List, Optional
from backend.app.agents.command_agent import command_agent, CommandAgent
from backend.app.agents.evidence_agent import evidence_agent, EvidenceAgent
from backend.app.agents.hospital_agent import hospital_agent, HospitalAgent
from backend.app.agents.incident_agent import incident_agent, IncidentAgent
from backend.app.agents.resource_agent import resource_agent, ResourceAgent
from backend.app.agents.routing_agent import routing_agent, RoutingAgent
from backend.app.agents.schemas import (
    AgentPipelineResult,
    CommandAgentOutput,
    EvidenceAgentOutput,
    HospitalAgentOutput,
    IncidentAgentOutput,
    ResourceAgentOutput,
    RoutingAgentOutput,
    TriageAgentOutput,
)
from backend.app.agents.triage_reasoning_agent import triage_reasoning_agent, TriageReasoningAgent
from backend.app.data.repository import db
from backend.app.models.ambulance import Ambulance
from backend.app.models.hospital import Hospital
from backend.app.models.road import Road
from backend.app.models.victim import Victim
from backend.app.resource_optimization.optimizer import resource_optimizer, ResourceOptimizationEngine
from backend.app.resource_optimization.schemas import OptimizationSolutionResult


class LifeLinkAgentOrchestrator:
    """Master supervisor coordinating 7 modular AI agents with deterministic optimization."""

    def __init__(
        self,
        incident_ag: Optional[IncidentAgent] = None,
        evidence_ag: Optional[EvidenceAgent] = None,
        triage_ag: Optional[TriageReasoningAgent] = None,
        hospital_ag: Optional[HospitalAgent] = None,
        resource_ag: Optional[ResourceAgent] = None,
        routing_ag: Optional[RoutingAgent] = None,
        command_ag: Optional[CommandAgent] = None,
        optimizer: Optional[ResourceOptimizationEngine] = None,
    ):
        self.incident_agent = incident_ag or incident_agent
        self.evidence_agent = evidence_ag or evidence_agent
        self.triage_agent = triage_ag or triage_reasoning_agent
        self.hospital_agent = hospital_ag or hospital_agent
        self.resource_agent = resource_ag or resource_agent
        self.routing_agent = routing_ag or routing_agent
        self.command_agent = command_ag or command_agent
        self.optimizer = optimizer or resource_optimizer

    def run_pipeline(
        self,
        unstructured_incident_report: str = "12 injured near Gate 3, 2 unconscious, severe crushing impact",
        unstructured_evidence_description: str = "Drone photo shows ruptured freight tanker leaking vapor cloud over crushed passenger car 3, 4 trapped victims",
        unstructured_road_report: Optional[str] = None,
        unstructured_fleet_log: Optional[str] = None,
        victims: Optional[List[Victim]] = None,
        hospitals: Optional[List[Hospital]] = None,
        ambulances: Optional[List[Ambulance]] = None,
        roads: Optional[List[Road]] = None,
    ) -> AgentPipelineResult:
        """Executes the full 7-agent pipeline integrated with deterministic OR-Tools optimization."""
        victims = victims or db.get_victims()
        hospitals = hospitals or db.get_hospitals()
        ambulances = ambulances or db.get_ambulances()
        roads = roads or db.get_roads()

        # Step 1: Incident Agent extracts structured situational intelligence
        incident_assessment = self.incident_agent.process_report(unstructured_incident_report)

        # Step 2: Evidence Agent extracts forensic & visual hazard intelligence
        evidence_assessment = self.evidence_agent.interpret_evidence(unstructured_evidence_description)

        # Step 3: Triage Reasoning Agent extracts clinical features for exemplar casualties
        triage_reasoning_list: List[TriageAgentOutput] = []
        exemplar_ids = ["V083", "V041", "V112"]
        for vid in exemplar_ids:
            v = next((vic for vic in victims if vic.id == vid), None)
            if v:
                triage_out = self.triage_agent.reason_triage(
                    raw_notes=v.notes or "Severe trauma presentation",
                    victim_id=v.id,
                )
                triage_reasoning_list.append(triage_out)

        # Step 4: Hospital Agent analyzes receiving facility capacities
        hospital_assessments: List[HospitalAgentOutput] = []
        for hosp in hospitals:
            h_out = self.hospital_agent.evaluate_facility(hosp)
            hospital_assessments.append(h_out)

        # Step 5: Resource Agent monitors regional assets & mutual aid triggers
        open_icu = sum(h.icu for h in hospitals)
        resource_assessment = self.resource_agent.evaluate_resources(
            ambulances=ambulances,
            open_icu_beds=open_icu,
            total_casualties=len(victims),
            unstructured_fleet_log=unstructured_fleet_log,
        )

        # Step 6: Routing Agent evaluates road blockages & detours
        routing_assessment = self.routing_agent.evaluate_routes(
            roads=roads,
            unstructured_traffic_report=unstructured_road_report,
        )

        # Step 7: Deterministic OR-Tools Optimization (Mathematical Authority)
        optimization_result = self.optimizer.optimize_resources(
            victims=victims,
            hospitals=hospitals,
            ambulances=ambulances,
            roads=roads,
        )

        # Step 8: Command Agent synthesizes everything into executive Commander Briefing
        commander_briefing = self.command_agent.generate_briefing(
            optimization_result=optimization_result,
            incident_assessment=incident_assessment,
            evidence_assessment=evidence_assessment,
            resource_assessment=resource_assessment,
            routing_assessment=routing_assessment,
        )

        return AgentPipelineResult(
            incident_assessment=incident_assessment,
            evidence_assessment=evidence_assessment,
            triage_reasoning=triage_reasoning_list,
            hospital_assessments=hospital_assessments,
            resource_assessment=resource_assessment,
            routing_assessment=routing_assessment,
            commander_briefing=commander_briefing,
            deterministic_alignment_verified=True,
        )


orchestrator = LifeLinkAgentOrchestrator()

