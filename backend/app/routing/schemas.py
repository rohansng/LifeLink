"""Schemas for LifeLink Ambulance Assignment and Simulated Routing Engine."""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class RouteStatus(str, Enum):
    OPTIMAL = "OPTIMAL"
    VIABLE = "VIABLE"
    CONGESTED = "CONGESTED"
    BLOCKED = "BLOCKED"


class RouteOption(BaseModel):
    route_id: str = Field(..., description="Corridor identifier, e.g. ROUTE-A, ROUTE-B")
    name: str = Field(..., description="Route name, e.g. Route A (Highway 101 Expressway)")
    status: RouteStatus = Field(..., description="OPTIMAL, VIABLE, CONGESTED, or BLOCKED")
    is_blocked: bool = Field(default=False, description="True if corridor is severed")
    status_icon: str = Field(..., description="'✓' or '❌' or '⚠'")
    eta_minutes: float = Field(..., description="Calculated transit time in minutes")
    distance_km: float = Field(..., description="Route distance in kilometers")
    description: str = Field(..., description="Corridor waypoints and conditions")
    corridor_road_ids: List[str] = Field(default_factory=list, description="IDs of physical roads comprising this route")
    blockage_reason: Optional[str] = Field(None, description="Cause of blockage if severed")


class DispatchChain(BaseModel):
    victim_id: str = Field(..., description="Victim ID, e.g. V083")
    victim_priority: str = Field(..., description="P1, P2, P3, P4")
    victim_condition: str = Field(..., description="Clinical reason / summary")
    ambulance_id: str = Field(..., description="Assigned transport unit, e.g. AMB-04 or NONE")
    ambulance_callsign: str = Field(..., description="Unit callsign, e.g. Medic 4 or UNASSIGNED")
    ambulance_type: str = Field(..., description="ALS or BLS or NONE")
    hospital_id: str = Field(..., description="Receiving hospital ID, e.g. H-B")
    hospital_name: str = Field(..., description="Hospital B (St. Jude Regional)")
    active_route_id: str = Field(..., description="Currently selected route ID, e.g. ROUTE-B")
    active_route_name: str = Field(..., description="Route B")
    eta_minutes: Optional[float] = Field(default=None, description="Simulated ETA in minutes, e.g. 13.0")
    route_options: List[RouteOption] = Field(default_factory=list, description="Available and evaluated routes")
    chain_summary: str = Field(..., description="Arrow chain: V083 → AMB-04 → Hospital B → Route B → 13 min")
    reroute_status: str = Field(default="NORMAL", description="NORMAL, REROUTED, or ALERT")
    reroute_note: Optional[str] = Field(None, description="Note on route change or detour")
    is_feasible: bool = Field(default=True, description="True if assignment and transit are feasible")


class RoadBlockEventRequest(BaseModel):
    road_id: str = Field(default="ROAD-01", description="Road corridor ID to toggle or block")
    status: str = Field(default="closed", description="open, closed, or congested")
    reason: Optional[str] = Field(default="Tanker explosion & concrete overpass structural compromise")
    detour_penalty_minutes: Optional[float] = Field(default=14.0)


class RoadBlockEventResult(BaseModel):
    road_id: str
    road_name: str
    new_status: str
    affected_ambulance_ids: List[str]
    rerouted_chains: List[DispatchChain]
    generated_recommendations: List[Dict]
    summary_message: str

