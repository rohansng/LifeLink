"""Live Crisis Simulation & Stress Engine for LifeLink.

Simulates real-world crisis disruptions:
  - Road blockages
  - Sudden hospital ICU capacity shifts
  - Blood/specialty shortages
  - Casualty surges
Triggers instant Dynamic Replanning and measures adaptation latency.
"""

import time
from typing import Callable, Dict, List, Optional

from ai.orchestrator import LifeLinkOrchestrator
from optimization.graph.road_network import DynamicRoadNetwork
from optimization.schemas import Ambulance, Hospital, Patient
from simulation.events import DisruptionType, SimulationEvent


class CrisisSimulationEngine:
    """Discrete-event simulation engine with dynamic closed-loop replanning."""

    def __init__(
        self,
        orchestrator: Optional[LifeLinkOrchestrator] = None,
        road_network: Optional[DynamicRoadNetwork] = None,
    ):
        self.road_network = road_network or DynamicRoadNetwork()
        self.orchestrator = orchestrator or LifeLinkOrchestrator(self.road_network)
        self.event_queue: List[SimulationEvent] = []
        self.history: List[Dict] = []
        self.on_replan_callbacks: List[Callable[[Dict], None]] = []

    def register_replan_callback(self, callback: Callable[[Dict], None]):
        self.on_replan_callbacks.append(callback)

    def queue_event(self, event: SimulationEvent):
        self.event_queue.append(event)
        self.event_queue.sort(key=lambda e: e.timestamp_seconds)

    def apply_event_and_replan(
        self,
        event: SimulationEvent,
        incident_id: str,
        patients: List[Patient],
        ambulances: List[Ambulance],
        hospitals: List[Hospital],
    ) -> Dict:
        """Applies a real-time crisis disruption and triggers immediate replanning."""
        replan_start = time.perf_counter()

        # 1. Apply mutation based on disruption type
        mutation_summary = ""
        if event.event_type == DisruptionType.ROAD_BLOCKAGE:
            seg_id = event.payload.get("segment_id", "corridor_1")
            self.road_network.block_road_segment(seg_id)
            mutation_summary = f"Blocked road corridor '{seg_id}'. Rerouting traffic."

        elif event.event_type == DisruptionType.ROAD_REOPEN:
            seg_id = event.payload.get("segment_id", "corridor_1")
            self.road_network.unblock_road_segment(seg_id)
            mutation_summary = f"Reopened road corridor '{seg_id}'."

        elif event.event_type == DisruptionType.ICU_CAPACITY_CHANGE:
            hosp_id = event.payload.get("hospital_id")
            delta = event.payload.get("delta", -1)
            for h in hospitals:
                if h.id == hosp_id:
                    h.icu_capacity = max(0, h.icu_capacity + delta)
                    mutation_summary = f"Hospital {h.name} ICU capacity shifted by {delta} (Now: {h.icu_capacity} beds)."
                    break

        elif event.event_type == DisruptionType.AMBULANCE_BREAKDOWN:
            amb_id = event.payload.get("ambulance_id")
            for a in ambulances:
                if a.id == amb_id:
                    a.is_available = False
                    mutation_summary = f"Ambulance {a.callsign} suffered mechanical failure/breakdown. Removed from fleet."
                    break

        # 2. Trigger re-optimization loop
        replan_result = self.orchestrator.process_and_optimize(
            incident_id=incident_id,
            patients=patients,
            ambulances=ambulances,
            hospitals=hospitals,
            emergency_calls=[f"SIMULATION ALERT: {event.description}"],
        )

        replan_latency_ms = (time.perf_counter() - replan_start) * 1000.0

        output = {
            "event_applied": event.model_dump(),
            "mutation_summary": mutation_summary,
            "replan_latency_ms": round(replan_latency_ms, 2),
            "updated_briefing": replan_result["briefing"],
        }

        self.history.append(output)

        for cb in self.on_replan_callbacks:
            cb(output)

        return output
