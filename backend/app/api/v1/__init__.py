"""API v1 router bundle for LifeLink."""

from fastapi import APIRouter
from backend.app.api.v1.agent_routes import router as agent_router
from backend.app.api.v1.ambulances import router as ambulances_router
from backend.app.api.v1.command_center_routes import router as command_center_router
from backend.app.api.v1.dashboard import router as dashboard_router
from backend.app.api.v1.evaluation_routes import router as evaluation_router
from backend.app.api.v1.events import router as events_router
from backend.app.api.v1.hospitals import router as hospitals_router
from backend.app.api.v1.incidents import router as incidents_router
from backend.app.api.v1.matching_routes import router as matching_router
from backend.app.api.v1.optimization_routes import router as optimization_router
from backend.app.api.v1.recommendations import router as recommendations_router
from backend.app.api.v1.replanning_routes import router as replanning_router
from backend.app.api.v1.resources import router as resources_router
from backend.app.api.v1.responders import router as responders_router
from backend.app.api.v1.roads import router as roads_router
from backend.app.api.v1.routing_routes import router as routing_router
from backend.app.api.v1.simulation_events import router as simulation_events_router
from backend.app.api.v1.triage_routes import router as triage_router
from backend.app.api.v1.victims import router as victims_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(incidents_router)
api_v1_router.include_router(command_center_router)
api_v1_router.include_router(agent_router)
api_v1_router.include_router(victims_router)
api_v1_router.include_router(triage_router)
api_v1_router.include_router(matching_router)
api_v1_router.include_router(optimization_router)
api_v1_router.include_router(replanning_router)
api_v1_router.include_router(ambulances_router)
api_v1_router.include_router(hospitals_router)
api_v1_router.include_router(resources_router)
api_v1_router.include_router(roads_router)
api_v1_router.include_router(routing_router)
api_v1_router.include_router(responders_router)
api_v1_router.include_router(events_router)
api_v1_router.include_router(recommendations_router)
api_v1_router.include_router(simulation_events_router)
api_v1_router.include_router(evaluation_router)
api_v1_router.include_router(dashboard_router)
