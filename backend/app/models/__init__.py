"""LifeLink Domain Data Models."""

from .ambulance import Ambulance, AmbulanceStatus, AmbulanceType, AmbulanceUpdate
from .event import EventCategory, EventSeverity, IncidentEvent, IncidentEventCreate
from .hospital import Hospital, HospitalBloodInventory, HospitalUpdate
from .incident import Incident, IncidentSector, IncidentStatistics, IncidentUpdate
from .location import Location
from .recommendation import Recommendation, RecommendationSeverity, RecommendationStatus, RecommendationUpdate
from .resource import Resource, ResourceCategory, ResourceStatus, ResourceUpdate
from .responder import Responder, ResponderRole, ResponderStatus, ResponderUpdate
from .road import Road, RoadStatus, RoadUpdate
from .victim import Victim, VictimSeverity, VictimStatus, VictimUpdate

__all__ = [
    "Location",
    "Incident",
    "IncidentSector",
    "IncidentStatistics",
    "IncidentUpdate",
    "Victim",
    "VictimSeverity",
    "VictimStatus",
    "VictimUpdate",
    "Ambulance",
    "AmbulanceType",
    "AmbulanceStatus",
    "AmbulanceUpdate",
    "Hospital",
    "HospitalBloodInventory",
    "HospitalUpdate",
    "Resource",
    "ResourceCategory",
    "ResourceStatus",
    "ResourceUpdate",
    "Road",
    "RoadStatus",
    "RoadUpdate",
    "Responder",
    "ResponderRole",
    "ResponderStatus",
    "ResponderUpdate",
    "IncidentEvent",
    "IncidentEventCreate",
    "EventCategory",
    "EventSeverity",
    "Recommendation",
    "RecommendationStatus",
    "RecommendationSeverity",
    "RecommendationUpdate",
]
