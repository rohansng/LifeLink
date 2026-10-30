"""LifeLink Phase 8 Modular AI Agents Bundle."""

from backend.app.agents.command_agent import CommandAgent, command_agent
from backend.app.agents.evidence_agent import EvidenceAgent, evidence_agent
from backend.app.agents.gemini_client import GeminiClient, gemini_client
from backend.app.agents.hospital_agent import HospitalAgent, hospital_agent
from backend.app.agents.incident_agent import IncidentAgent, incident_agent
from backend.app.agents.orchestrator import LifeLinkAgentOrchestrator, orchestrator
from backend.app.agents.resource_agent import ResourceAgent, resource_agent
from backend.app.agents.routing_agent import RoutingAgent, routing_agent
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
from backend.app.agents.triage_reasoning_agent import TriageReasoningAgent, triage_reasoning_agent

__all__ = [
    "GeminiClient",
    "gemini_client",
    "IncidentAgent",
    "incident_agent",
    "EvidenceAgent",
    "evidence_agent",
    "TriageReasoningAgent",
    "triage_reasoning_agent",
    "HospitalAgent",
    "hospital_agent",
    "ResourceAgent",
    "resource_agent",
    "RoutingAgent",
    "routing_agent",
    "CommandAgent",
    "command_agent",
    "LifeLinkAgentOrchestrator",
    "orchestrator",
    "IncidentAgentOutput",
    "EvidenceAgentOutput",
    "TriageAgentOutput",
    "HospitalAgentOutput",
    "ResourceAgentOutput",
    "RoutingAgentOutput",
    "CommandAgentOutput",
    "AgentPipelineResult",
]

