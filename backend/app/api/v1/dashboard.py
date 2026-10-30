"""Consolidated Dashboard API endpoint for high-speed frontend synchronization."""

from typing import Dict
from fastapi import APIRouter
from backend.app.data.repository import db
from backend.app.routing.routing_engine import routing_engine
from backend.app.triage.scoring_engine import triage_engine

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard_state() -> Dict:
    """Returns the unified disaster state across all entities for immediate dashboard hydration."""
    incident = db.get_incident()
    victims = list(db.victims.values())
    hospitals = list(db.hospitals.values())
    ambulances = list(db.ambulances.values())
    roads = list(db.roads.values())

    # Deterministic Triage Priority Evaluation
    triage_assessments = triage_engine.evaluate_queue(
        victims=victims,
        hospitals=hospitals,
        ambulances=ambulances,
        roads=roads,
    )

    p1_count = sum(1 for a in triage_assessments if a.priority.value == "P1")
    p2_count = sum(1 for a in triage_assessments if a.priority.value == "P2")
    p3_count = sum(1 for a in triage_assessments if a.priority.value == "P3")
    p4_count = sum(1 for a in triage_assessments if a.priority.value == "P4")

    return {
        "incident": incident.model_dump(),
        "statistics": incident.statistics.model_dump(),
        "sectors": [s.model_dump() for s in incident.sectors],
        "hospitals": [h.model_dump() for h in hospitals],
        "ambulances": [a.model_dump() for a in ambulances],
        "resources": [r.model_dump() for r in db.get_resources()],
        "roads": [rd.model_dump() for rd in roads],
        "responders": [rp.model_dump() for rp in db.get_responders()],
        "events": [e.model_dump() for e in db.get_events()],
        "recommendations": [rec.model_dump() for rec in db.get_recommendations()],
        "triage_summary": {
            "total_assessed": len(triage_assessments),
            "formula": "Priority Score = severity + urgency + capability - transport time + resource availability",
            "counts": {
                "P1": p1_count,
                "P2": p2_count,
                "P3": p3_count,
                "P4": p4_count,
            },
            "showcase": [a.model_dump(mode="json") for a in triage_assessments if a.victim_id in ["V083", "V041", "V112"]],
            # Top 50 priority queue items for immediate tactical display
            "priority_queue": [a.model_dump(mode="json") for a in triage_assessments[:50]],
        },
        "routing_summary": {
            "exemplar_chain": routing_engine.build_dispatch_chain(db.get_victim("V083"), ambulances, hospitals, roads).model_dump(mode="json") if db.get_victim("V083") else None,
            "chains": [
                routing_engine.build_dispatch_chain(v, ambulances, hospitals, roads).model_dump(mode="json")
                for v in [db.get_victim("V083"), db.get_victim("V041"), db.get_victim("V112")]
                if v
            ],
        },
        "optimization_summary": {
            "solver": "Google OR-Tools MILP (SCIP/CBC)",
            "objective_formula": "MAX (critical_patients + resource_utilization + expected_benefit - transit_penalty)",
            "tracked_resources": {
                "icu_beds": sum(h.icu for h in hospitals),
                "blood_units_o_neg": sum(h.blood.O_negative for h in hospitals if h.blood),
                "ventilators": sum(getattr(h, "ventilators_available", 2) for h in hospitals),
                "doctors": sum(getattr(h, "doctors_available", 4) for h in hospitals),
                "trauma_teams": sum(getattr(h, "trauma_teams_available", 1) for h in hospitals),
                "ambulances": len([a for a in ambulances if a.status.value != "maintenance"]),
                "rescue_teams": 2,
            },
        },
    }


@router.post("/reset")
def reset_to_seed():
    """Resets all in-memory entities to initial train derailment synthetic seed data."""
    db.reset()
    return {"status": "SUCCESS", "message": "State reset to initial train derailment synthetic scenario."}
