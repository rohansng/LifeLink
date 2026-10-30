"""API endpoints for Phase 14 Evaluation Metrics & Simulation Benchmark.

GET /api/v1/evaluation/benchmark
POST /api/v1/evaluation/run
"""

from fastapi import APIRouter
from backend.app.evaluation import evaluation_engine, SimulationBenchmarkReport

router = APIRouter(prefix="/evaluation", tags=["Evaluation Metrics"])


@router.get("/benchmark", response_model=SimulationBenchmarkReport)
def get_evaluation_benchmark():
    """Returns deterministic simulation comparison report between Baseline/Manual vs LIFELINK."""
    return evaluation_engine.run_benchmark()


@router.post("/run", response_model=SimulationBenchmarkReport)
def run_evaluation_benchmark():
    """Runs a fresh benchmark computation and returns the evaluation results."""
    return evaluation_engine.run_benchmark()

