"""In-memory Crisis State Manager for LifeLink."""

from typing import Dict, List, Optional
from optimization.graph.road_network import DynamicRoadNetwork
from optimization.schemas import Ambulance, Hospital, Patient
from simulation.scenarios import load_highway_101_mci_scenario
from simulation.engine import CrisisSimulationEngine


class CrisisStateManager:
    """Maintains active incident state, resources, and live simulation runner."""

    def __init__(self):
        self.road_network = DynamicRoadNetwork()
        self.engine = CrisisSimulationEngine(road_network=self.road_network)
        self.active_incident_id = "MCI-SF-2026-01"
        self.patients: List[Patient] = []
        self.ambulances: List[Ambulance] = []
        self.hospitals: List[Hospital] = []
        self.latest_briefing: Optional[Dict] = None
        self.approved_assignments: List[Dict] = []
        self.reset_to_default_scenario()

    def reset_to_default_scenario(self):
        pts, ambs, hosps, _ = load_highway_101_mci_scenario()
        self.patients = pts
        self.ambulances = ambs
        self.hospitals = hosps
        self.latest_briefing = None
        self.approved_assignments = []
        self.road_network.blocked_segments.clear()


state_manager = CrisisStateManager()
