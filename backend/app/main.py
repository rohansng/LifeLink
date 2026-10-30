"""Main FastAPI Application Entrypoint for LifeLink.

Phase 2: Full Entity REST API & Data Model.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.dispatch import router as dispatch_router
from backend.app.api.simulation import router as simulation_router
from backend.app.api.v1 import api_v1_router

app = FastAPI(
    title="LIFELINK API",
    description="Autonomous Emergency Response Orchestration & Algorithmic Dispatch System",
    version="2.0.0",
)

# CORS middleware for frontend dashboard connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(api_v1_router)
app.include_router(dispatch_router)
app.include_router(simulation_router)


@app.get("/")
@app.get("/health")
def health_check():
    return {
        "system": "LIFELINK",
        "phase": "PHASE 14 - Autonomous Optimization & Evaluation Metrics Active",
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "notice": "DEMO / SIMULATION: LIFELINK provides decision-support recommendations using synthetic data. It does not provide medical diagnosis, replace emergency professionals, or autonomously make clinical decisions.",
        "endpoints": {
            "incidents": "/api/v1/incidents",
            "victims": "/api/v1/victims",
            "ambulances": "/api/v1/ambulances",
            "hospitals": "/api/v1/hospitals",
            "resources": "/api/v1/resources",
            "roads": "/api/v1/roads",
            "responders": "/api/v1/responders",
            "events": "/api/v1/events",
            "recommendations": "/api/v1/recommendations",
            "dashboard": "/api/v1/dashboard",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
