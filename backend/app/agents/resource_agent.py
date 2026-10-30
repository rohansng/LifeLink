"""Resource Agent for LifeLink Phase 8.

Monitors regional emergency transport fleet, extrication squads, critical care assets,
and detects when crisis thresholds trigger external mutual-aid alarms.
"""

from typing import List, Optional
from backend.app.agents.gemini_client import GeminiClient, gemini_client
from backend.app.agents.schemas import ResourceAgentOutput
from backend.app.models.ambulance import Ambulance, AmbulanceStatus


class ResourceAgent:
    """Specialist agent for regional asset tracking and mutual-aid threshold monitoring."""

    def __init__(self, client: Optional[GeminiClient] = None):
        self.client = client or gemini_client

    def evaluate_resources(
        self,
        ambulances: List[Ambulance],
        open_icu_beds: int = 4,
        total_casualties: int = 214,
        unstructured_fleet_log: Optional[str] = None,
    ) -> ResourceAgentOutput:
        """Evaluates fleet strain and identifies mutual-aid triggers."""
        active_ambs = [a for a in ambulances if a.status != AmbulanceStatus.MAINTENANCE]
        context = (
            f"Active Ambulances: {len(active_ambs)}/{len(ambulances)}\n"
            f"Open Regional ICU Beds: {open_icu_beds}\n"
            f"Total Casualties Demanding Care: {total_casualties}\n"
            f"Fleet Callsigns: {', '.join(a.callsign for a in active_ambs)}\n"
            f"Fleet Radio Log: {unstructured_fleet_log or 'All active units deployed on priority runs'}"
        )

        # 1. Attempt Gemini Structured Output
        if self.client.is_configured:
            system_instruction = (
                "You are the LifeLink Resource Agent (Emergency Logistics & Mutual Aid Coordinator). "
                "Evaluate fleet utilization, equipment shortages, and identify mutual aid triggers. "
                "Output strictly valid JSON matching the schema."
            )
            prompt = (
                f"Analyze the following fleet and resource context and output structured JSON:\n\n"
                f"RESOURCE CONTEXT:\n{context}\n\n"
                "JSON Schema fields: resource_strain_level ('NOMINAL'|'ELEVATED'|'CRITICAL'|'DEPLETED'), "
                "active_fleet_summary (string), critical_deficits (list of strings), "
                "mutual_aid_triggers (list of strings), asset_warnings (list of strings), confidence (float 0.0-1.0)."
            )

            ai_result = self.client.generate_structured_json(
                prompt=prompt,
                system_instruction=system_instruction,
                schema_class=ResourceAgentOutput,
            )
            if ai_result:
                ai_result["fallback_used"] = False
                return ResourceAgentOutput(**ai_result)

        # 2. Deterministic Fallback Parser
        return self._deterministic_fallback(ambulances, open_icu_beds, total_casualties)

    def _deterministic_fallback(
        self,
        ambulances: List[Ambulance],
        open_icu_beds: int,
        total_casualties: int,
    ) -> ResourceAgentOutput:
        """Deterministic rule-based asset evaluation."""
        active_ambs = [a for a in ambulances if a.status != AmbulanceStatus.MAINTENANCE]
        deficits: List[str] = []
        triggers: List[str] = []
        warnings: List[str] = []

        if len(active_ambs) < 10:
            deficits.append(f"Ambulance Fleet Exhaustion ({len(active_ambs)} units vs {total_casualties} casualties)")
            triggers.append("Broadcast Statewide Mutual Aid Alarm (MABAS) for Tier 3 EMS Fleet (+15 units)")
            warnings.append("Local transport fleet at 100% commitment; delayed response for subsequent calls")

        if open_icu_beds <= 4:
            deficits.append(f"Regional ICU Deficit ({open_icu_beds} open beds across 3 facilities)")
            triggers.append("Declare Metropolitan Crisis Standards of Care & Reverse Triage protocol")
            warnings.append("ICU saturation reached; step-down transfers required immediately")

        deficits.append("USAR Heavy Extrication Squad Deficit (2 squads vs 34 trapped casualties)")
        triggers.append("Mobilize National Guard USAR Task Force 3 for structural collapse shoring")

        strain = "CRITICAL" if (len(active_ambs) <= 5 or open_icu_beds <= 4) else "ELEVATED"

        summary = (
            f"{len(active_ambs)} active transport units deployed under {strain.lower()} strain. "
            f"Casualty demand exceeds immediate regional capacity by factor of {round(total_casualties / max(1, len(active_ambs)), 1)}x."
        )

        return ResourceAgentOutput(
            resource_strain_level=strain,
            active_fleet_summary=summary,
            critical_deficits=deficits,
            mutual_aid_triggers=triggers,
            asset_warnings=warnings,
            confidence=0.91,
            fallback_used=True,
        )


resource_agent = ResourceAgent()

