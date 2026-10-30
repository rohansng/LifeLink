"""In-memory Data Repository for LifeLink Entities."""

from typing import Dict, List, Optional
from backend.app.data.seed_data import (
    get_seed_ambulances,
    get_seed_events,
    get_seed_hospitals,
    get_seed_incident,
    get_seed_recommendations,
    get_seed_resources,
    get_seed_responders,
    get_seed_roads,
    get_seed_victims,
)
from backend.app.models import (
    Ambulance,
    Hospital,
    Incident,
    IncidentEvent,
    Recommendation,
    Resource,
    Responder,
    Road,
    Victim,
    VictimSeverity,
    VictimStatus,
)


class DataRepository:
    """Manages synthetic state for all 9 core entities."""

    def __init__(self):
        self.reset()

    def reset(self):
        """Re-initializes state from seed data."""
        self.incident: Incident = get_seed_incident()
        self.victims: Dict[str, Victim] = {v.id: v for v in get_seed_victims()}
        self.ambulances: Dict[str, Ambulance] = {a.id: a for a in get_seed_ambulances()}
        self.hospitals: Dict[str, Hospital] = {h.id: h for h in get_seed_hospitals()}
        self.resources: Dict[str, Resource] = {r.id: r for r in get_seed_resources()}
        self.roads: Dict[str, Road] = {rd.id: rd for rd in get_seed_roads()}
        self.responders: Dict[str, Responder] = {rp.id: rp for rp in get_seed_responders()}
        self.events: List[IncidentEvent] = get_seed_events()
        self.recommendations: Dict[str, Recommendation] = {rec.id: rec for rec in get_seed_recommendations()}

    # Incident
    def get_incident(self) -> Incident:
        # Dynamically recalculate statistics based on victims
        v_list = list(self.victims.values())
        crit = sum(1 for v in v_list if v.severity == VictimSeverity.CRITICAL)
        ser = sum(1 for v in v_list if v.severity == VictimSeverity.SERIOUS)
        mod = sum(1 for v in v_list if v.severity == VictimSeverity.MODERATE)
        unk = sum(1 for v in v_list if v.severity == VictimSeverity.UNKNOWN)
        unassigned_crit = sum(1 for v in v_list if v.severity == VictimSeverity.CRITICAL and v.status == VictimStatus.UNASSIGNED)
        total_icu = sum(h.icu for h in self.hospitals.values())

        self.incident.statistics.total_victims = len(v_list)
        self.incident.statistics.critical = crit
        self.incident.statistics.serious = ser
        self.incident.statistics.moderate = mod
        self.incident.statistics.unknown = unk
        self.incident.statistics.unassigned_critical = unassigned_crit
        self.incident.statistics.total_icu_beds = total_icu
        self.incident.statistics.total_ambulances = len(self.ambulances)
        self.incident.statistics.active_ambulances = len(self.ambulances)
        self.incident.statistics.total_hospitals = len(self.hospitals)

        return self.incident

    # Victims
    def get_victims(
        self,
        severity: Optional[VictimSeverity] = None,
        status: Optional[VictimStatus] = None,
        limit: int = 250,
    ) -> List[Victim]:
        items = list(self.victims.values())
        if severity:
            items = [v for v in items if v.severity == severity]
        if status:
            items = [v for v in items if v.status == status]
        return items[:limit]

    def get_victim(self, victim_id: str) -> Optional[Victim]:
        return self.victims.get(victim_id)

    def update_victim(self, victim_id: str, **kwargs) -> Optional[Victim]:
        victim = self.victims.get(victim_id)
        if not victim:
            return None
        for k, v in kwargs.items():
            if v is not None and hasattr(victim, k):
                setattr(victim, k, v)
        return victim

    # Ambulances
    def get_ambulances(self) -> List[Ambulance]:
        return list(self.ambulances.values())

    def get_ambulance(self, ambulance_id: str) -> Optional[Ambulance]:
        return self.ambulances.get(ambulance_id)

    def update_ambulance(self, ambulance_id: str, **kwargs) -> Optional[Ambulance]:
        amb = self.ambulances.get(ambulance_id)
        if not amb:
            return None
        for k, v in kwargs.items():
            if v is not None and hasattr(amb, k):
                setattr(amb, k, v)
        return amb

    # Hospitals
    def get_hospitals(self) -> List[Hospital]:
        return list(self.hospitals.values())

    def get_hospital(self, hospital_id: str) -> Optional[Hospital]:
        return self.hospitals.get(hospital_id)

    def update_hospital(self, hospital_id: str, **kwargs) -> Optional[Hospital]:
        hosp = self.hospitals.get(hospital_id)
        if not hosp:
            return None
        for k, v in kwargs.items():
            if v is not None and hasattr(hosp, k):
                setattr(hosp, k, v)
        return hosp

    # Resources
    def get_resources(self) -> List[Resource]:
        return list(self.resources.values())

    def get_resource(self, resource_id: str) -> Optional[Resource]:
        return self.resources.get(resource_id)

    # Roads
    def get_roads(self) -> List[Road]:
        return list(self.roads.values())

    def get_road(self, road_id: str) -> Optional[Road]:
        return self.roads.get(road_id)

    def update_road(self, road_id: str, **kwargs) -> Optional[Road]:
        road = self.roads.get(road_id)
        if not road:
            return None
        for k, v in kwargs.items():
            if v is not None and hasattr(road, k):
                setattr(road, k, v)
        return road

    # Responders
    def get_responders(self) -> List[Responder]:
        return list(self.responders.values())

    def get_responder(self, responder_id: str) -> Optional[Responder]:
        return self.responders.get(responder_id)

    # Events
    def get_events(self) -> List[IncidentEvent]:
        return sorted(self.events, key=lambda e: e.timestamp)

    def add_event(self, event: IncidentEvent) -> IncidentEvent:
        self.events.append(event)
        return event

    # Recommendations
    def get_recommendations(self) -> List[Recommendation]:
        return list(self.recommendations.values())

    def get_recommendation(self, rec_id: str) -> Optional[Recommendation]:
        return self.recommendations.get(rec_id)

    def update_recommendation(self, rec_id: str, **kwargs) -> Optional[Recommendation]:
        rec = self.recommendations.get(rec_id)
        if not rec:
            return None
        for k, v in kwargs.items():
            if v is not None and hasattr(rec, k):
                setattr(rec, k, v)
        return rec


db = DataRepository()
