"""Triage Agent for LifeLink.

Translates qualitative patient reports, vital signs, and paramedic field notes
into clinical triage classifications (START protocol) and numerical urgency weights.
"""

from typing import Dict, List, Optional
from optimization.schemas import MedicalSpecialty, Patient, TriageCategory


class TriageAgent:
    """Evaluates casualty condition and outputs standardized urgency parameters."""

    def __init__(self, model_name: str = "gemini-2.5-flash"):
        self.model_name = model_name

    def evaluate_casualty(
        self,
        patient_id: str,
        latitude: float,
        longitude: float,
        raw_text_report: str,
        respiratory_rate: Optional[int] = None,
        has_radial_pulse: Optional[bool] = None,
        can_follow_commands: Optional[bool] = None,
        is_ambulatory: Optional[bool] = None,
    ) -> Patient:
        """Determines START triage category and mathematical urgency weight."""
        # 1. Ambulatory check
        if is_ambulatory:
            category = TriageCategory.GREEN
            urgency_weight = 20.0
            specialties = []
            stabilization_time = 2.0
        # 2. Respiration check
        elif respiratory_rate is not None and (respiratory_rate < 10 or respiratory_rate > 30):
            category = TriageCategory.RED
            urgency_weight = 90.0
            specialties = [MedicalSpecialty.GENERAL_TRAUMA]
            stabilization_time = 8.0
        # 3. Perfusion check
        elif has_radial_pulse is False:
            category = TriageCategory.RED
            urgency_weight = 95.0
            specialties = [MedicalSpecialty.GENERAL_TRAUMA, MedicalSpecialty.CARDIOTHORACIC]
            stabilization_time = 10.0
        # 4. Mental status check
        elif can_follow_commands is False:
            category = TriageCategory.RED
            urgency_weight = 85.0
            specialties = [MedicalSpecialty.NEUROSURGERY]
            stabilization_time = 7.0
        else:
            # Delayed or keyword analysis
            lower_report = raw_text_report.lower()
            if any(term in lower_report for term in ["crush", "arterial", "tension pneumo", "gcs < 8", "unconscious"]):
                category = TriageCategory.RED
                urgency_weight = 92.0
                specialties = [MedicalSpecialty.GENERAL_TRAUMA]
                if "head" in lower_report or "brain" in lower_report:
                    specialties.append(MedicalSpecialty.NEUROSURGERY)
                stabilization_time = 8.0
            elif any(term in lower_report for term in ["fracture", "stable", "conscious", "moderate"]):
                category = TriageCategory.YELLOW
                urgency_weight = 55.0
                specialties = [MedicalSpecialty.ORTHOPEDIC]
                stabilization_time = 4.0
            elif "deceased" in lower_report or "apnea" in lower_report:
                category = TriageCategory.BLACK
                urgency_weight = 0.0
                specialties = []
                stabilization_time = 0.0
            else:
                category = TriageCategory.YELLOW
                urgency_weight = 50.0
                specialties = [MedicalSpecialty.GENERAL_TRAUMA]
                stabilization_time = 5.0

        return Patient(
            id=patient_id,
            latitude=latitude,
            longitude=longitude,
            triage_category=category,
            urgency_weight=urgency_weight,
            required_specialties=specialties,
            stabilization_time_minutes=stabilization_time,
            golden_hour_deadline_minutes=45.0 if category == TriageCategory.RED else 120.0,
        )
