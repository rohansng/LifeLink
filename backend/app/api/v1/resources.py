"""Resources REST endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.data.repository import db
from backend.app.models import Resource

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=List[Resource])
def list_resources():
    """Returns deployment status of all specialized emergency equipment and supply caches."""
    return db.get_resources()


@router.get("/{resource_id}", response_model=Resource)
def get_resource(resource_id: str):
    res = db.get_resource(resource_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Resource {resource_id} not found")
    return res
