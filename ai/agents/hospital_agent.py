"""Hospital Capability Agent for LifeLink.

Monitors real-time hospital bed capacity, surgical team availability,
and blood bank reserves to prevent medical facility saturation.
"""

from typing import Dict, List
from optimization.schemas import Hospital, MedicalSpecialty


class HospitalAgent:
    """Manages hospital state and checks capability matches."""

    def verify_hospital_capability(
        self,
        hospital: Hospital,
        required_specialties: List[MedicalSpecialty],
    ) -> bool:
        """Verifies if a facility has the surgical capability and free capacity."""
        if hospital.icu_capacity <= 0:
            return False
        return set(required_specialties).issubset(set(hospital.supported_specialties))

    def update_icu_capacity(self, hospital: Hospital, delta: int) -> Hospital:
        """Applies real-time capacity change (e.g. from live simulation or hospital EMR update)."""
        hospital.icu_capacity = max(0, hospital.icu_capacity + delta)
        return hospital
