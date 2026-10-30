"""Routing Agent for LifeLink Phase 8.

Interprets road disruption advisories, traffic feeds, and physical obstacle reports
to generate clear detour directives for dispatchers without altering deterministic graph calculations.
"""

from typing import List, Optional
from backend.app.agents.gemini_client import GeminiClient, gemini_client
from backend.app.agents.schemas import RoutingAgentOutput
from backend.app.models.road import Road, RoadStatus


class RoutingAgent:
    """Specialist agent for evaluating road corridor closures and synthesizing detour directives."""

    def __init__(self, client: Optional[GeminiClient] = None):
        self.client = client or gemini_client

    def evaluate_routes(
        self,
        roads: List[Road],
        unstructured_traffic_report: Optional[str] = None,
    ) -> RoutingAgentOutput:
        """Analyzes corridor status and generates human-readable detour guidance."""
        closed_roads = [r for r in roads if r.status == RoadStatus.CLOSED]
        context = (
            f"Total Monitored Roads: {len(roads)}\n"
            f"Closed Corridors: {len(closed_roads)} ({', '.join(r.name for r in closed_roads) if closed_roads else 'None'})\n"
            f"Traffic Report: {unstructured_traffic_report or 'Road conditions updating dynamically'}"
        )

        # 1. Attempt Gemini Structured Output
        if self.client.is_configured:
            system_instruction = (
                "You are the LifeLink Routing Agent (Emergency Transit Logistics & Corridor Management). "
                "Analyze road blockage reports, detour delays, and hazardous corridor zones. "
                "Output strictly valid JSON matching the schema."
            )
            prompt = (
                f"Analyze the following road and traffic conditions and output structured JSON:\n\n"
                f"CORRIDOR CONTEXT:\n{context}\n\n"
                "JSON Schema fields: corridor_evaluations (list of strings), active_road_blocks (list of strings), "
                "detour_recommendation (string), transit_delay_minutes (float), "
                "hazard_zone_affected (bool), confidence (float 0.0-1.0)."
            )

            ai_result = self.client.generate_structured_json(
                prompt=prompt,
                system_instruction=system_instruction,
                schema_class=RoutingAgentOutput,
            )
            if ai_result:
                ai_result["fallback_used"] = False
                return RoutingAgentOutput(**ai_result)

        # 2. Deterministic Fallback Parser
        return self._deterministic_fallback(roads, unstructured_traffic_report)

    def _deterministic_fallback(self, roads: List[Road], report: Optional[str] = None) -> RoutingAgentOutput:
        """Deterministic rule-based corridor analysis."""
        closed = [r for r in roads if r.status == RoadStatus.CLOSED]
        evaluations: List[str] = []
        blocks: List[str] = []
        total_delay = 0.0

        for r in roads:
            if r.status == RoadStatus.CLOSED:
                evaluations.append(f"{r.name} (ID: {r.id}): CLOSED - {r.reason or 'Physical Obstacle'}")
                blocks.append(f"{r.name}: Impassable due to {r.reason or 'structural collapse'}")
                total_delay += 14.0
            else:
                evaluations.append(f"{r.name} (ID: {r.id}): OPEN - Transit Nominal (Delay penalty: +{r.detour_penalty_minutes}m)")

        if closed:
            recommendation = (
                f"PRIMARY CORRIDOR BLOCKED: {closed[0].name} impassable. "
                "Reroute all emergency transports via secondary corridor Route B (Detour penalty: +14.0 min)."
            )
            hazard_affected = True
        else:
            recommendation = "All primary transit corridors open and operating under normal emergency speeds."
            hazard_affected = False

        return RoutingAgentOutput(
            corridor_evaluations=evaluations,
            active_road_blocks=blocks,
            detour_recommendation=recommendation,
            transit_delay_minutes=total_delay,
            hazard_zone_affected=hazard_affected,
            confidence=0.95,
            fallback_used=True,
        )


routing_agent = RoutingAgent()
