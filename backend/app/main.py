"""Main FastAPI Application Entrypoint for LifeLink."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.dispatch import router as dispatch_router
from backend.app.api.simulation import router as simulation_router

app = FastAPI(
    title="LifeLink API",
    description="Autonomous Emergency Response Orchestration & Algorithmic Dispatch System",
    version="1.0.0",
)

# CORS middleware for frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dispatch_router)
app.include_router(simulation_router)


@app.get("/")
def health_check():
    return {
        "system": "LifeLink",
        "status": "OPERATIONAL",
        "philosophy": "Cognitive AI for Understanding, Mathematical Optimization for Decisions",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
