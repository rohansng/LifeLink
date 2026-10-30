"""Resource Agent for LifeLink.

Tracks real-time ambulance telemetry, ALS/BLS paramedic capabilities,
and crew readiness to dispatch suitable units.
"""

from typing import List, Optional
from optimization.schemas import Ambulance, AmbulanceType


class ResourceAgent:
    """Manages emergency vehicle fleet state and equipment verification."""

    def filter_available_units(
        self,
        ambulances: List[Ambulance],
        require_als: bool = False,
    ) -> List[Ambulance]:
        """Returns active, ready ambulances meeting clinical criteria."""
        units = [a for a in ambulances if a.is_available]
        if require_als:
            units = [a for a in units if a.ambulance_type == AmbulanceType.ALS]
        return units

    def mark_dispatched(self, ambulance: Ambulance, patient_id: str) -> Ambulance:
        ambulance.is_available = False
        ambulance.current_assigned_patient_id = patient_id
        return ambulance
