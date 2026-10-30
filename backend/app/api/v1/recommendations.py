"""Tactical Recommendations REST endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.data.repository import db
from backend.app.models import (
    Recommendation,
    RecommendationStatus,
    RecommendationUpdate,
)

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", response_model=List[Recommendation])
def list_recommendations():
    """Returns tactical recommendations with required clinical and logistical explanations."""
    return db.get_recommendations()


@router.get("/{recommendation_id}", response_model=Recommendation)
def get_recommendation(recommendation_id: str):
    rec = db.get_recommendation(recommendation_id)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Recommendation {recommendation_id} not found")
    return rec


@router.post("/{recommendation_id}/execute", response_model=Recommendation)
def execute_recommendation(recommendation_id: str):
    """Marks a priority recommendation as approved and executed by the Incident Commander."""
    rec = db.update_recommendation(recommendation_id, status=RecommendationStatus.EXECUTED)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Recommendation {recommendation_id} not found")
    return rec
