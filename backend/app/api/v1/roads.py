"""Roads and Corridors REST endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.data.repository import db
from backend.app.models import Road, RoadUpdate

router = APIRouter(prefix="/roads", tags=["Roads"])


@router.get("", response_model=List[Road])
def list_roads():
    """Returns transit status and delay penalties for key road network corridors."""
    return db.get_roads()


@router.patch("/{road_id}", response_model=Road)
def update_road(road_id: str, update: RoadUpdate):
    """Updates road obstruction status (open, congested, closed)."""
    road = db.update_road(road_id, **update.model_dump(exclude_unset=True))
    if not road:
        raise HTTPException(status_code=404, detail=f"Road corridor {road_id} not found")
    return road
