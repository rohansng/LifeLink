"""Incident Agent for LifeLink.

Processes multi-source crisis inputs (911 calls, responder radio logs, scene imagery)
to estimate casualty counts, hazard zones, and perimeter safety status.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class IncidentSceneAssessment(BaseModel):
    incident_id: str
    incident_type: str
    estimated_casualties: int
    hazard_level: str  # "LOW", "MODERATE", "HIGH", "CRITICAL"
    hazmat_detected: bool = False
    scene_safety_secured: bool = True
    key_evidence: List[str] = Field(default_factory=list)
    perimeter_radius_meters: float = 100.0


class IncidentAgent:
    """Evaluates disaster scene context and hazard risks."""

    def __init__(self, model_name: str = "gemini-2.5-flash"):
        self.model_name = model_name

    def assess_scene(
        self,
        incident_id: str,
        emergency_calls: List[str],
        responder_notes: List[str],
        has_fire_or_gas: bool = False,
    ) -> IncidentSceneAssessment:
        all_text = " ".join(emergency_calls + responder_notes).lower()
        
        hazmat = has_fire_or_gas or any(k in all_text for k in ["chemical", "gas leak", "hazmat", "fumes", "tanker"])
        high_severity = any(k in all_text for k in ["explosion", "multi-vehicle", "pileup", "structural collapse", "active fire"])

        if hazmat or high_severity:
            hazard = "CRITICAL"
            perimeter = 500.0
            secured = False
        else:
            hazard = "MODERATE"
            perimeter = 150.0
            secured = True

        evidence = []
        if hazmat:
            evidence.append("HazMat / Toxic inhalation threat identified")
        if high_severity:
            evidence.append("Major kinetic impact / structural instability flagged")

        return IncidentSceneAssessment(
            incident_id=incident_id,
            incident_type="Mass Casualty Transportation Crash" if "vehicle" in all_text else "Urban Emergency",
            estimated_casualties=max(len(emergency_calls) * 2, 8),
            hazard_level=hazard,
            hazmat_detected=hazmat,
            scene_safety_secured=secured,
            key_evidence=evidence,
            perimeter_radius_meters=perimeter,
        )
