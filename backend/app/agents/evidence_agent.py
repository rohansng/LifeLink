"""Evidence Agent (Vision & Multimodal) for LifeLink Phase 8.

Interprets responder scene imagery, drone recon feeds, and visual evidence descriptions
to detect physical hazards, victim entrapments, and required protective gear.
"""

import re
from typing import List, Optional
from backend.app.agents.gemini_client import GeminiClient, gemini_client
from backend.app.agents.schemas import EvidenceAgentOutput


class EvidenceAgent:
    """Specialist agent for interpreting photographic, drone, and visual evidence."""

    def __init__(self, client: Optional[GeminiClient] = None):
        self.client = client or gemini_client

    def interpret_evidence(
        self,
        image_description: str,
        image_metadata: Optional[str] = None,
    ) -> EvidenceAgentOutput:
        """Processes visual evidence text/metadata into structured forensic assessment."""
        combined_text = f"{image_description} {image_metadata or ''}".strip()
        if not combined_text:
            combined_text = "Standard scene photograph"

        # 1. Attempt Gemini Structured Output
        if self.client.is_configured:
            system_instruction = (
                "You are the LifeLink Evidence Agent (Computer Vision & Forensic Intelligence). "
                "Your role is to interpret field photos, drone footage descriptions, and visual evidence "
                "from disaster zones. Detect hazards (chemical, structural, fire), count entrapped casualties, "
                "evaluate structural stability, and specify mandatory PPE for responders. "
                "Output strictly valid JSON matching the schema."
            )
            prompt = (
                f"Analyze the following photographic evidence description and output structured JSON:\n\n"
                f"VISUAL EVIDENCE: \"{combined_text}\"\n\n"
                "JSON Schema fields: scene_summary (string), detected_hazards (list of strings), "
                "entrapped_count (int), structural_stability ('STABLE'|'COMPROMISED'|'UNSTABLE'), "
                "ppe_required (list of strings), thermal_hotspots_detected (bool), "
                "evidence_tags (list of strings), confidence (float 0.0-1.0)."
            )

            ai_result = self.client.generate_structured_json(
                prompt=prompt,
                system_instruction=system_instruction,
                schema_class=EvidenceAgentOutput,
            )
            if ai_result:
                ai_result["fallback_used"] = False
                return EvidenceAgentOutput(**ai_result)

        # 2. Deterministic Fallback Parser
        return self._deterministic_fallback(combined_text)

    def _deterministic_fallback(self, text: str) -> EvidenceAgentOutput:
        """Deterministic rule-based visual reasoning fallback."""
        lower = text.lower()
        hazards: List[str] = []
        ppe: List[str] = ["Standard Level B Turnout Gear", "Heavy Rescue Helmets & Gloves"]
        tags: List[str] = []

        # 1. Chemical & HazMat Detection
        if any(w in lower for w in ["vapor", "cloud", "chemical", "leak", "spill", "tanker", "ammonia", "fumes"]):
            hazards.append("Toxic Inhalation & Chemical Vapor Hazard")
            ppe = ["Level A Fully Encapsulated HazMat Suit", "Self-Contained Breathing Apparatus (SCBA)"]
            tags.append("Chemical Tanker Rupture")

        # 2. Structural & Crush Hazards
        if any(w in lower for w in ["crush", "collapse", "bent frame", "twisted", "derailed", "rubble"]):
            hazards.append("Heavy Structural Collapse / Pinned Debris")
            tags.append("Crushed Passenger Carriage")

        # 3. Fire / Thermal
        thermal = any(w in lower for w in ["fire", "flames", "smoke", "hotspot", "thermal", "burn"])
        if thermal:
            hazards.append("Thermal Radiation & Active Combustion")
            tags.append("Thermal Hotspot")

        # 4. Entrapment Counting
        trap_match = re.search(r"(\d+)\s*(?:trapped|pinned|entrapped|inside carriage|heat signatures)", lower)
        if trap_match:
            entrapped = int(trap_match.group(1))
            tags.append(f"{entrapped} Mechanically Trapped Casualties")
        elif "trapped" in lower or "pinned" in lower or "crushed" in lower:
            entrapped = 2
            tags.append("Entrapped Casualties Present")
        else:
            entrapped = 0

        # 5. Structural Stability
        if "collapse" in lower or "twisted" in lower or "unstable" in lower or "derailed" in lower:
            stability = "UNSTABLE"
        elif "compromised" in lower or "damage" in lower:
            stability = "COMPROMISED"
        else:
            stability = "STABLE"

        if not hazards:
            hazards = ["Kinetic Trauma & Sharp Debris"]

        summary = (
            f"Visual inspection reveals {stability.lower()} disaster sector with {len(hazards)} primary hazards. "
            f"{entrapped} casualties identified as mechanically entrapped requiring technical extrication."
        )

        return EvidenceAgentOutput(
            scene_summary=summary,
            detected_hazards=hazards,
            entrapped_count=entrapped,
            structural_stability=stability,
            ppe_required=ppe,
            thermal_hotspots_detected=thermal,
            evidence_tags=tags,
            confidence=0.82,
            fallback_used=True,
        )


evidence_agent = EvidenceAgent()

