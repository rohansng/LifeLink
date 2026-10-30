"""Hospital Capability Agent for LifeLink Phase 8.

Analyzes hospital EMR feeds, surgical suite availability, and critical care bed saturation.
Synthesizes clinical capability reports to guide deterministic matching without overriding constraints.
"""

from typing import List, Optional
from backend.app.agents.gemini_client import GeminiClient, gemini_client
from backend.app.agents.schemas import HospitalAgentOutput
from backend.app.models.hospital import Hospital


class HospitalAgent:
    """Specialist agent for evaluating hospital surge status and operational bottlenecks."""

    def __init__(self, client: Optional[GeminiClient] = None):
        self.client = client or gemini_client

    def evaluate_facility(
        self,
        hospital: Hospital,
        unstructured_status_note: Optional[str] = None,
    ) -> HospitalAgentOutput:
        """Produces structured clinical capacity synthesis for a receiving trauma center."""
        context = (
            f"Hospital ID: {hospital.id}, Name: {hospital.name}, Designation: {hospital.type}\n"
            f"Available ICU Beds: {hospital.icu}/{hospital.icu_total}\n"
            f"Operating Rooms Open: {hospital.operating_rooms_open}\n"
            f"Trauma Available: {hospital.trauma_available}\n"
            f"O- Blood Units: {hospital.blood.O_negative if hospital.blood else 0}\n"
            f"Supported Specialties: {', '.join(hospital.supported_specialties or [])}\n"
            f"Facility Status: {hospital.status}\n"
            f"Dispatcher Field Notes: {unstructured_status_note or 'Routine telemetry update'}"
        )

        # 1. Attempt Gemini Structured Output
        if self.client.is_configured:
            system_instruction = (
                "You are the LifeLink Hospital Agent (Hospital Emergency Operations & Bed Bureau). "
                "Evaluate receiving trauma hospital status. Analyze ICU capacity, OR suite availability, "
                "blood bank reserves, and operational bottlenecks. Output strictly valid JSON matching the schema."
            )
            prompt = (
                f"Analyze the following hospital operational context and output structured JSON:\n\n"
                f"HOSPITAL CONTEXT:\n{context}\n\n"
                "JSON Schema fields: hospital_id (string), hospital_name (string), "
                "operational_status ('NORMAL'|'SURGE_ACTIVE'|'SATURATED'|'DIVERT'), "
                "icu_status (string), surgical_capacity_summary (string), surge_capacity_warning (bool), "
                "operational_bottlenecks (list of strings), capability_notes (string), confidence (float 0.0-1.0)."
            )

            ai_result = self.client.generate_structured_json(
                prompt=prompt,
                system_instruction=system_instruction,
                schema_class=HospitalAgentOutput,
            )
            if ai_result:
                ai_result["fallback_used"] = False
                return HospitalAgentOutput(**ai_result)

        # 2. Deterministic Fallback Parser
        return self._deterministic_fallback(hospital, unstructured_status_note)

    def _deterministic_fallback(self, hospital: Hospital, note: Optional[str] = None) -> HospitalAgentOutput:
        """Deterministic rule-based capacity synthesis."""
        bottlenecks: List[str] = []

        if hospital.icu == 0:
            bottlenecks.append("Zero ICU Beds Available (100% Saturated)")
        elif hospital.icu <= 2:
            bottlenecks.append(f"Critical ICU Scarcity ({hospital.icu} beds remaining)")

        if hospital.operating_rooms_open == 0 or not hospital.trauma_available:
            bottlenecks.append("Surgical Resuscitation Unavailable / ORs Full")

        blood_o_neg = hospital.blood.O_negative if hospital.blood else 0
        if blood_o_neg < 5:
            bottlenecks.append(f"Low Universal O- Blood Reserve ({blood_o_neg} units)")

        is_saturated = hospital.icu == 0 and hospital.operating_rooms_open == 0
        surge_warning = is_saturated or hospital.icu <= 2

        if is_saturated:
            status = "SATURATED"
            notes = f"{hospital.name} is fully saturated. Redirect high-acuity surgical cases."
        elif surge_warning:
            status = "SURGE_ACTIVE"
            notes = f"{hospital.name} operating under active mass-casualty surge protocols."
        else:
            status = "NORMAL"
            notes = f"{hospital.name} has standard reception capacity."

        return HospitalAgentOutput(
            hospital_id=hospital.id,
            hospital_name=hospital.name,
            operational_status=status,
            icu_status=f"{hospital.icu}/{hospital.icu_total} open ICU beds",
            surgical_capacity_summary=f"{hospital.operating_rooms_open} open OR suites (Trauma team: {'Active' if hospital.trauma_available else 'Unavailable'})",
            surge_capacity_warning=surge_warning,
            operational_bottlenecks=bottlenecks,
            capability_notes=notes,
            confidence=0.92,
            fallback_used=True,
        )


hospital_agent = HospitalAgent()

