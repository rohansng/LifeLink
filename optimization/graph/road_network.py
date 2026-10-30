"""Geospatial distance and travel time calculation with dynamic road blockage support."""

import math
from typing import Dict, Set, Tuple


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth in km."""
    r = 6371.0  # Earth radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


class DynamicRoadNetwork:
    """Dynamic travel time matrix calculator supporting road blockages and traffic delays."""

    def __init__(self, default_urban_speed_kmh: float = 45.0):
        self.default_speed = default_urban_speed_kmh
        self.blocked_segments: Set[str] = set()
        self.congestion_multipliers: Dict[str, float] = {}

    def block_road_segment(self, segment_id: str):
        """Simulate a road closure (bridge down, chemical spill, rubble)."""
        self.blocked_segments.add(segment_id)

    def unblock_road_segment(self, segment_id: str):
        self.blocked_segments.discard(segment_id)

    def set_congestion(self, segment_id: str, multiplier: float):
        self.congestion_multipliers[segment_id] = multiplier

    def estimate_travel_time_minutes(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float,
        segment_id: str = "default",
    ) -> float:
        """Estimate travel time in minutes based on distance and dynamic conditions."""
        if segment_id in self.blocked_segments:
            # Heavily penalize or treat as severed detour (e.g. 5x detour penalty)
            detour_penalty = 5.0
        else:
            detour_penalty = 1.0

        multiplier = self.congestion_multipliers.get(segment_id, 1.0)
        dist_km = haversine_distance_km(lat1, lon1, lat2, lon2)

        # Urban circuity factor: real road networks are ~1.25 to 1.35x haversine distance
        circuity = 1.3
        effective_km = dist_km * circuity * detour_penalty
        effective_speed = max(10.0, self.default_speed / multiplier)

        travel_hours = effective_km / effective_speed
        return max(1.0, travel_hours * 60.0)
