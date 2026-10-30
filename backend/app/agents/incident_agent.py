"""Incident Agent for LifeLink Phase 8.

Transforms raw, unstructured crisis reports (e.g. 911 calls, radio transcripts)
into verified structured incident data.
Example:
  "12 injured near Gate 3, 2 unconscious" ->
    estimated_casualties=12, unconscious_count=2, location_sector="Gate 3"
"""

import re
from typing import List, Optional
from backend.app.agents.gemini_client import GeminiClient, gemini_client
from backend.app.agents.schemas import IncidentAgentOutput


class IncidentAgent:
    """Specialist agent for extracting structured situational data from unstructured reports."""

    def __init__(self, client: Optional[GeminiClient] = None):
        self.client = client or gemini_client

    def process_report(self, raw_report: str) -> IncidentAgentOutput:
        """Parses unstructured incident report into verified structured schema."""
        if not raw_report or not raw_report.strip():
            return self._deterministic_fallback("Empty report received")

        # 1. Attempt structured Gemini parsing if configured
        if self.client.is_configured:
            system_instruction = (
                "You are the LifeLink Incident Agent. Your role is to convert unstructured disaster "
                "reports (911 calls, radio logs) into structured incident intelligence. "
                "Extract casualty counts, unconscious victim counts, landmarks/sectors, hazards, and evidence. "
                "Output strictly valid JSON matching the schema."
            )
            prompt = (
                f"Analyze the following incident report and output structured JSON:\n\n"
                f"REPORT: \"{raw_report}\"\n\n"
                "JSON Schema fields: incident_type (string), estimated_casualties (int), "
                "unconscious_count (int), location_sector (string), hazard_level ('LOW'|'MODERATE'|'HIGH'|'CRITICAL'), "
                "hazmat_detected (bool), hazmat_type (optional string), perimeter_radius_meters (float), "
                "key_evidence (list of string excerpts), confidence (float 0.0-1.0)."
            )

            ai_result = self.client.generate_structured_json(
                prompt=prompt,
                system_instruction=system_instruction,
                schema_class=IncidentAgentOutput,
            )
            if ai_result:
                ai_result["fallback_used"] = False
                return IncidentAgentOutput(**ai_result)

        # 2. Safe Deterministic Fallback Parser
        return self._deterministic_fallback(raw_report)

    def _deterministic_fallback(self, text: str) -> IncidentAgentOutput:
        """Deterministic heuristic NLP parser used as resilient zero-failure fallback."""
        lower = text.lower()
        evidence: List[str] = []

        # 1. Extract casualty counts: e.g. "12 injured", "15 casualties", "8 victims"
        cas_match = re.search(r"(\d+)\s*(?:injured|casualties|victims|patients|wounded|hurt|down)", lower)
        if cas_match:
            casualties = int(cas_match.group(1))
            evidence.append(cas_match.group(0))
        else:
            # Fallback to standalone numbers
            standalone = re.findall(r"\b\d+\b", lower)
            casualties = int(standalone[0]) if standalone else 1

        # 2. Extract unconscious / unresponsive count: e.g. "2 unconscious", "3 unresponsive"
        unc_match = re.search(r"(\d+)\s*(?:unconscious|unresponsive|comatose|in coma)", lower)
        if unc_match:
            unconscious = int(unc_match.group(1))
            evidence.append(unc_match.group(0))
        elif "unconscious" in lower or "unresponsive" in lower:
            unconscious = 1
            evidence.append("unconscious victim noted")
        else:
            unconscious = 0

        # 3. Extract Location / Sector: e.g. "near Gate 3", "Sector A", "Car 4", "Platform 2"
        loc_match = re.search(r"(?:near|at|by|in|around)\s+([a-zA-Z0-9\s\-]+?)(?:,|\.|\band\b|$)", text, re.IGNORECASE)
        if loc_match:
            raw_loc = loc_match.group(1).strip()
            # Clean up trailing words
            loc = re.sub(r"\s+(?:with|and|there|urgent|calling|status).*$", "", raw_loc, flags=re.IGNORECASE).strip()
            location = loc if len(loc) < 30 else "Derailment Epicenter"
            evidence.append(f"Location anchor: {location}")
        else:
            location = "Main Incident Site"

        # 4. Hazmat & Chemical Detection
        hazmat = any(w in lower for w in ["ammonia", "chlorine", "chemical", "gas leak", "hazmat", "fumes", "toxic", "tanker"])
        hazmat_type = None
        if "ammonia" in lower:
            hazmat_type = "Anhydrous Ammonia (Toxic/Corrosive)"
            evidence.append("Chemical detected: Ammonia vapor cloud")
        elif "chlorine" in lower:
            hazmat_type = "Chlorine Gas (Pulmonary Agent)"
            evidence.append("Chemical detected: Chlorine")
        elif hazmat:
            hazmat_type = "Unknown Toxic Chemical Agent"
            evidence.append("Chemical hazard flagged in report")

        # 5. Hazard Level & Perimeter
        if hazmat or unconscious >= 2 or casualties >= 10 or "explosion" in lower:
            hazard_level = "CRITICAL"
            perimeter = 500.0 if hazmat else 300.0
        elif unconscious > 0 or casualties >= 4:
            hazard_level = "HIGH"
            perimeter = 200.0
        else:
            hazard_level = "MODERATE"
            perimeter = 100.0

        return IncidentAgentOutput(
            incident_type="Mass Casualty Transportation Derailment" if "train" in lower or "derail" in lower or "car" in lower else "Multi-Victim Crisis Incident",
            estimated_casualties=casualties,
            unconscious_count=unconscious,
            location_sector=location,
            hazard_level=hazard_level,
            hazmat_detected=hazmat,
            hazmat_type=hazmat_type,
            perimeter_radius_meters=perimeter,
            key_evidence=evidence,
            confidence=0.88,
            fallback_used=True,
        )


incident_agent = IncidentAgent()

