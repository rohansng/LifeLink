"""Triage Reasoning Agent for LifeLink Phase 8.

Interprets unstructured paramedic clinical field notes, vitals descriptions,
and injury presentations to extract physiological trauma markers and required hospital specialties.

NOTE: Does NOT compute final numerical scores or assignments.
Deterministic priority scoring remains strictly governed by TriageScoringEngine.
"""

from typing import List, Optional
from backend.app.agents.gemini_client import GeminiClient, gemini_client
from backend.app.agents.schemas import TriageAgentOutput
from backend.app.models.victim import Victim, VictimSeverity


class TriageReasoningAgent:
    """Specialist agent for medical natural language understanding and clinical capability extraction."""

    def __init__(self, client: Optional[GeminiClient] = None):
        self.client = client or gemini_client

    def reason_triage(
        self,
        raw_notes: str,
        victim_id: Optional[str] = None,
        vital_signs: Optional[str] = None,
    ) -> TriageAgentOutput:
        """Parses clinical field notes and vitals into structured medical capability requirements."""
        combined_text = f"Victim {victim_id or 'Unknown'}: {raw_notes} {vital_signs or ''}".strip()

        # 1. Attempt Gemini Structured Output
        if self.client.is_configured:
            system_instruction = (
                "You are the LifeLink Triage Reasoning Agent (Emergency Medicine & Tactical Triage). "
                "Analyze unstructured paramedic field notes and patient vitals. "
                "Identify primary anatomical injuries, clinical urgency, and required hospital specialties "
                "(e.g. Trauma Surgery, ICU, Blood Transfusion, Mechanical Ventilation, Neurosurgery, Orthopedics). "
                "Do NOT calculate mathematical scores. Output strictly valid JSON matching the schema."
            )
            prompt = (
                f"Analyze the following clinical casualty presentation and output structured JSON:\n\n"
                f"CLINICAL REPORT: \"{combined_text}\"\n\n"
                "JSON Schema fields: victim_id (string), suggested_priority ('P1'|'P2'|'P3'|'P4'), "
                "primary_anatomical_trauma (string), required_capabilities (list of strings), "
                "physiological_severity ('CRITICAL'|'SERIOUS'|'MODERATE'|'EXPECTANT'), "
                "needs_icu (bool), needs_blood (bool), needs_vent (bool), needs_trauma_team (bool), "
                "clinical_reasoning (string), confidence (float 0.0-1.0)."
            )

            ai_result = self.client.generate_structured_json(
                prompt=prompt,
                system_instruction=system_instruction,
                schema_class=TriageAgentOutput,
            )
            if ai_result:
                ai_result["fallback_used"] = False
                return TriageAgentOutput(**ai_result)

        # 2. Deterministic Clinical Fallback Parser
        return self._deterministic_fallback(combined_text, victim_id)

    def _deterministic_fallback(self, text: str, victim_id: Optional[str] = None) -> TriageAgentOutput:
        """Deterministic clinical NLP keyword and physiological rule engine."""
        lower = text.lower()
        capabilities: List[str] = []

        is_critical = any(k in lower for k in [
            "arterial", "hemorrhage", "bleeding", "shock", "unconscious", "gcs < 8",
            "pneumothorax", "hypoxia", "amputation", "crush syndrome", "severe head", "tension"
        ])
        is_serious = any(k in lower for k in [
            "fracture", "dislocation", "concussion", "moderate burn", "laceration", "splint", "blunt"
        ])

        needs_icu = is_critical or any(k in lower for k in ["icu", "shock", "intubation", "airway", "pneumo"])
        needs_blood = any(k in lower for k in ["bleeding", "arterial", "shock", "hemorrhage", "pelvic", "transfusion"])
        needs_vent = is_critical or any(k in lower for k in ["airway", "hypoxia", "inhalation", "intubation", "apnea", "ammonia"])
        needs_trauma = is_critical or any(k in lower for k in ["trauma", "surgery", "crush", "open fracture", "stab", "penetrating"])

        if needs_trauma:
            capabilities.append("Trauma Resuscitation & Surgery")
        if needs_icu:
            capabilities.append("ICU Critical Care")
        if needs_blood:
            capabilities.append("Emergency Blood Transfusion")
        if needs_vent:
            capabilities.append("Mechanical Ventilation")
        if "burn" in lower:
            capabilities.append("Burn Care")
        if "neuro" in lower or "head" in lower or "brain" in lower:
            capabilities.append("Neurosurgery")
        if "ortho" in lower or "fracture" in lower:
            capabilities.append("Orthopedic Surgery")

        if not capabilities:
            capabilities = ["Emergency Evaluation"]

        if is_critical:
            priority = "P1"
            severity = "CRITICAL"
            reasoning = "Immediate life-threat detected: uncompensated shock, acute respiratory distress, or severe hemorrhage."
        elif is_serious:
            priority = "P2"
            severity = "SERIOUS"
            reasoning = "Serious trauma presentation requiring urgent surgical or orthopedic intervention within 2-4 hours."
        else:
            priority = "P3"
            severity = "MODERATE"
            reasoning = "Delayed casualty with stable vitals and non-life-threatening extremity injuries."

        primary_trauma = "Polytrauma / Penetrating Trauma"
        if "arterial" in lower or "bleeding" in lower:
            primary_trauma = "Severe Arterial Bleeding & Hypovolemic Shock"
        elif "crush" in lower:
            primary_trauma = "Crush Injury & Compartment Syndrome"
        elif "pneumo" in lower or "chest" in lower:
            primary_trauma = "Tension Pneumothorax / Thoracic Trauma"
        elif "fracture" in lower:
            primary_trauma = "Complex Skeletal Fracture"

        return TriageAgentOutput(
            victim_id=victim_id,
            suggested_priority=priority,
            primary_anatomical_trauma=primary_trauma,
            required_capabilities=capabilities,
            physiological_severity=severity,
            needs_icu=needs_icu,
            needs_blood=needs_blood,
            needs_vent=needs_vent,
            needs_trauma_team=needs_trauma,
            clinical_reasoning=reasoning,
            confidence=0.90,
            fallback_used=True,
        )


triage_reasoning_agent = TriageReasoningAgent()

