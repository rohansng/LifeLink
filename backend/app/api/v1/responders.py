"""Responders REST endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.data.repository import db
from backend.app.models import Responder, ResponderUpdate

router = APIRouter(prefix="/responders", tags=["Responders"])


@router.get("", response_model=List[Responder])
def list_responders():
    """Returns active first responders, roles, and radio channels."""
    return db.get_responders()


@router.get("/{responder_id}", response_model=Responder)
def get_responder(responder_id: str):
    resp = db.get_responder(responder_id)
    if not resp:
        raise HTTPException(status_code=404, detail=f"Responder {responder_id} not found")
    return resp
