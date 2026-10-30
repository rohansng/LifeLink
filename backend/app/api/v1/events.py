"""Timeline Events REST endpoints."""

from typing import List
from fastapi import APIRouter
from backend.app.data.repository import db
from backend.app.models import IncidentEvent, IncidentEventCreate

router = APIRouter(prefix="/events", tags=["Events & Timeline"])


@router.get("", response_model=List[IncidentEvent])
def list_events():
    """Returns chronological timeline of disaster log events."""
    return db.get_events()


@router.post("", response_model=IncidentEvent, status_code=201)
def create_event(event_in: IncidentEventCreate):
    """Appends a new chronological event to the incident log."""
    new_id = f"EVT-{len(db.events) + 1:02d}"
    event = IncidentEvent(
        id=new_id,
        timestamp=event_in.timestamp,
        category=event_in.category,
        title=event_in.title,
        detail=event_in.detail,
        severity=event_in.severity,
    )
    return db.add_event(event)
