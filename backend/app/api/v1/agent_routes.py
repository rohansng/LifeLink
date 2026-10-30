"""REST API endpoints for LifeLink Phase 8 Modular AI Agents."""

from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.agents import (
    AgentPipelineResult,
    CommandAgentOutput,
    EvidenceAgentOutput,
    HospitalAgentOutput,
    IncidentAgentOutput,
    TriageAgentOutput,
    command_agent,
    evidence_agent,
    hospital_agent,
    incident_agent,
    orchestrator,
    resource_agent,
    routing_agent,
    triage_reasoning_agent,
)
from backend.app.data.repository import db

router = APIRouter(prefix="/agents", tags=["Modular AI Agents (Gemini & Multi-Agent Pipeline)"])


# Request Schemas
class ProcessReportRequest(BaseModel):
    report: str = Field(..., description="Unstructured 911 call or radio transcript, e.g. '12 injured near Gate 3, 2 unconscious'")


class InterpretEvidenceRequest(BaseModel):
    image_description: str = Field(..., description="Photographic, drone, or visual sensor description")
    metadata: Optional[str] = Field(None, description="Camera/sensor metadata, e.g. thermal or location")


class TriageReasonRequest(BaseModel):
    notes: str = Field(..., description="Clinical field notes, e.g. 'Arterial bleeding from femoral artery, shock'")
    victim_id: Optional[str] = Field(None, description="Optional casualty ID, e.g. 'V083'")
    vitals: Optional[str] = Field(None, description="Optional vital signs, e.g. 'BP 70/40, HR 135'")


class HospitalEvaluateRequest(BaseModel):
    hospital_id: str = Field(..., description="Facility ID, e.g. 'H-A', 'H-B', 'H-C'")
    notes: Optional[str] = Field(None, description="Facility operational status note")


class PipelineRunRequest(BaseModel):
    incident_report: Optional[str] = Field(
        default="12 injured near Gate 3, 2 unconscious, toxic ammonia smell from overturned car",
        description="Unstructured incident text",
    )
    evidence_description: Optional[str] = Field(
        default="Drone photo shows ruptured freight tanker leaking vapor cloud over crushed passenger car 3, 4 trapped victims",
        description="Photographic/visual evidence description",
    )
    traffic_report: Optional[str] = Field(
        default="Route A / Hwy 101 closed at Milepost 14 due to chemical spill and derailed freight car",
        description="Unstructured traffic advisory",
    )


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@router.post("/incident/process", response_model=IncidentAgentOutput)
def process_incident_report(payload: ProcessReportRequest):
    """Incident Agent: Converts unstructured crisis text into structured situational intelligence."""
    return incident_agent.process_report(payload.report)


@router.post("/evidence/interpret", response_model=EvidenceAgentOutput)
def interpret_visual_evidence(payload: InterpretEvidenceRequest):
    """Evidence Agent: Interprets responder imagery, drone reconnaissance, and visual hazard cues."""
    return evidence_agent.interpret_evidence(
        image_description=payload.image_description,
        image_metadata=payload.metadata,
    )


@router.post("/triage/reason", response_model=TriageAgentOutput)
def reason_casualty_triage(payload: TriageReasonRequest):
    """Triage Reasoning Agent: Extracts clinical capabilities & physiological urgency from field notes."""
    return triage_reasoning_agent.reason_triage(
        raw_notes=payload.notes,
        victim_id=payload.victim_id,
        vital_signs=payload.vitals,
    )


@router.post("/hospital/evaluate", response_model=HospitalAgentOutput)
def evaluate_hospital_facility(payload: HospitalEvaluateRequest):
    """Hospital Agent: Analyzes receiving facility bed saturation and surgical bottlenecks."""
    hosp = db.get_hospital(payload.hospital_id)
    if not hosp:
        raise HTTPException(status_code=404, detail=f"Hospital {payload.hospital_id} not found")
    return hospital_agent.evaluate_facility(hosp, payload.notes)


@router.post("/command/briefing", response_model=CommandAgentOutput)
def generate_commander_briefing(intent: Optional[str] = None):
    """Command Agent: Generates executive tactical Commander Briefing from active disaster state."""
    pipeline_res = orchestrator.run_pipeline()
    return pipeline_res.commander_briefing


@router.post("/pipeline/run", response_model=AgentPipelineResult)
def run_multi_agent_pipeline(payload: Optional[PipelineRunRequest] = None):
    """Master Orchestrator: Executes full 7-agent pipeline integrated with OR-Tools optimization."""
    inc_rep = payload.incident_report if payload else "12 injured near Gate 3, 2 unconscious"
    evi_rep = payload.evidence_description if payload else "Drone recon: Ruptured tanker, 4 trapped victims"
    tra_rep = payload.traffic_report if payload else None

    return orchestrator.run_pipeline(
        unstructured_incident_report=inc_rep,
        unstructured_evidence_description=evi_rep,
        unstructured_road_report=tra_rep,
    )


@router.get("/pipeline/status")
def get_agent_pipeline_status() -> Dict:
    """Returns operational status and active configuration of all 7 modular AI agents."""
    return {
        "status": "OPERATIONAL",
        "gemini_model": "gemini-2.5-flash",
        "deterministic_override_protection": "ACTIVE (Mathematical optimization strictly governs assignments and capacity)",
        "agents": [
            {"id": "incident_agent", "name": "Incident Agent", "role": "Unstructured 911 & radio text extraction", "status": "ACTIVE"},
            {"id": "evidence_agent", "name": "Evidence Agent", "role": "Computer vision & scene evidence interpretation", "status": "ACTIVE"},
            {"id": "triage_reasoning_agent", "name": "Triage Reasoning Agent", "role": "Clinical capability & trauma feature extraction", "status": "ACTIVE"},
            {"id": "hospital_agent", "name": "Hospital Agent", "role": "Facility bed & surgical capacity analysis", "status": "ACTIVE"},
            {"id": "resource_agent", "name": "Resource Agent", "role": "Regional fleet strain & mutual aid threshold monitoring", "status": "ACTIVE"},
            {"id": "routing_agent", "name": "Routing Agent", "role": "Corridor blockage & detour synthesis", "status": "ACTIVE"},
            {"id": "command_agent", "name": "Command Agent", "role": "Executive commander briefing & trade-off explanation", "status": "ACTIVE"},
        ],
    }

