"""Routing Agent for LifeLink.

Evaluates road network topology, incorporates real-time road closures,
and produces accurate transit cost matrices.
"""

from typing import List, Set
from optimization.graph.road_network import DynamicRoadNetwork


class RoutingAgent:
    """Manages road network state, obstacle detection, and rerouting penalties."""

    def __init__(self, road_network: DynamicRoadNetwork):
        self.road_network = road_network

    def handle_road_blockage(self, segment_id: str, reason: str) -> str:
        """Blocks road corridor and updates routing graph."""
        self.road_network.block_road_segment(segment_id)
        return f"Road corridor '{segment_id}' closed. Reason: {reason}. Transit penalty applied."

    def clear_road_blockage(self, segment_id: str) -> str:
        self.road_network.unblock_road_segment(segment_id)
        return f"Road corridor '{segment_id}' reopened. Normal transit speeds restored."
