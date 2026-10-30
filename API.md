# LIFELINK REST API Documentation

The **LIFELINK API** is a high-performance RESTful API built on **FastAPI**. It delivers deterministic crisis triage, constrained resource optimization (Google OR-Tools MILP), multi-agent cognitive reasoning (Google Gemini), continuous closed-loop replanning, and simulation evaluation benchmarks.

- **Base URL**: `http://localhost:8000/api/v1`
- **Interactive OpenAPI Documentation**: `http://localhost:8000/docs`
- **Alternative ReDoc**: `http://localhost:8000/redoc`

---

## 📑 API Endpoint Index

| Tag / Subsystem | Method | Path | Description |
|---|:---:|---|---|
| **System** | `GET` | `/` | Health check, phase status, and regulatory notice |
| **Command Center** | `GET` | `/api/v1/command-center/queue` | Master prioritized action queue with Hero showcase |
| **Command Center** | `GET` | `/api/v1/command-center/actions/{id}/why` | Transparent "WHY?" clinical & logistical justification |
| **Command Center** | `POST` | `/api/v1/command-center/actions/{id}/execute` | Authorize and execute a tactical directive |
| **Command Center** | `POST` | `/api/v1/command-center/actions/execute-all` | Batch execute all pending directives |
| **Triage** | `GET` | `/api/v1/triage/queue` | Ranked multi-factor triage priority queue |
| **Triage** | `GET` | `/api/v1/triage/victims/{id}` | Detailed triage score breakdown for a casualty |
| **Hospital Matching** | `POST` | `/api/v1/matching/match` | Match casualty to optimal facility or flag refusal |
| **Hospital Matching** | `GET` | `/api/v1/matching/victim/{id}/evaluate` | Evaluate all receiving hospitals for a casualty |
| **Routing** | `GET` | `/api/v1/routing/routes` | Active route options factoring in road closures |
| **Routing** | `POST` | `/api/v1/routing/dispatch-chain` | Build concrete 5-step dispatch chain |
| **Routing** | `POST` | `/api/v1/routing/road-block` | Report road closure and recalculate detours |
| **Optimization** | `GET/POST`| `/api/v1/optimization/solve` | Execute Google OR-Tools MILP multi-resource solver |
| **AI Agents** | `POST` | `/api/v1/agents/incident/process` | Incident Agent unstructured text parser |
| **AI Agents** | `POST` | `/api/v1/agents/triage/reason` | Triage Reasoning Agent anatomical extractor |
| **AI Agents** | `POST` | `/api/v1/agents/pipeline/run` | Execute full 7-agent cognitive orchestration pipeline |
| **Replanning** | `GET` | `/api/v1/replanning/current` | Active plan snapshot (version, timestamp, diffs) |
| **Replanning** | `POST` | `/api/v1/replanning/trigger` | Trigger continuous replanning loop on state shift |
| **Simulation** | `GET` | `/api/v1/simulation/status` | Current step of 5-event killer demo simulation |
| **Simulation** | `POST` | `/api/v1/simulation/next` | Advance simulation to next crisis disruption event |
| **Simulation** | `POST` | `/api/v1/simulation/reset` | Reset simulation and database to baseline state |
| **Evaluation** | `GET` | `/api/v1/evaluation/benchmark` | Retrieve deterministic 8-metric benchmark report |
| **Evaluation** | `POST` | `/api/v1/evaluation/run` | Re-run live simulation evaluation benchmark |
| **Dashboard** | `GET` | `/api/v1/dashboard` | Consolidated real-time incident state bundle |
| **Dashboard** | `POST` | `/api/v1/dashboard/reset` | Restore initial train derailment seed scenario |

---

## 🔍 Detailed Endpoint Reference

### 1. System Health Check

#### `GET /`
Returns system status, active version, operational phase, and regulatory safety notice.

**Response `200 OK`**:
```json
{
  "system": "LIFELINK",
  "phase": "PHASE 14 - Autonomous Optimization & Evaluation Metrics Active",
  "status": "OPERATIONAL",
  "version": "2.0.0",
  "notice": "DEMO / SIMULATION: LIFELINK provides decision-support recommendations using synthetic data. It does not provide medical diagnosis, replace emergency professionals, or autonomously make clinical decisions."
}
```

---

### 2. Command Center & Tactical Action Queue (Phase 9 & Execution)

#### `GET /api/v1/command-center/queue`
Synthesizes all intelligence layers into a prioritized tactical action queue, led by the Hero Showcase (`V083 -> AMB-04 -> Hospital B -> Route B -> 13 min`).

**Response `200 OK`**:
```json
{
  "timestamp": "2026-10-30T14:20:00Z",
  "headline": "METROPOLITAN CRISIS COMMAND CENTER: ACTIVE ACTION QUEUE",
  "threat_level": "CRITICAL",
  "total_actions": 7,
  "p1_count": 3,
  "p2_count": 4,
  "p3_count": 0,
  "hero_showcase": {
    "id": "CMD-ACT-HERO-083",
    "priority": "P1",
    "action": "ASSIGN AMBULANCE-04 to VICTIM-083 destination HOSPITAL-B via ROUTE-B ETA 13 minutes",
    "affected_entity": "VICTIM-083 | AMBULANCE-04 | HOSPITAL-B",
    "reason": "critical victim + trauma capability + ICU availability + feasible ETA.",
    "evidence": [
      "✓ ICU available (2 beds open at Hospital B)",
      "✓ Trauma available (Staffed Level 2 surgical resuscitation team on duty)",
      "✓ Required blood available (3 units universal donor O- reserved)",
      "✓ Shortest feasible ETA (13 min via Route B; Route A blocked by overturned fuel tanker)"
    ],
    "confidence": 0.99,
    "timestamp": "2026-10-30T14:20:00Z",
    "status": "PENDING",
    "victim_id": "V083",
    "victim_condition": "Critical bleeding (Femoral arterial laceration & pelvic fracture)",
    "why_breakdown": {
      "chosen_entity_name": "St. Jude Regional Hospital (Hospital B)",
      "selection_criteria": [
        "✓ ICU available (2 licensed critical care beds open)",
        "✓ Trauma available (Level 2 surgical trauma team on duty & OR prepared)",
        "✓ Required blood available (3 units universal donor O- reserved)",
        "✓ Shortest feasible ETA (13 minutes via Route B detour corridor)"
      ],
      "rejected_alternatives": [
        {
          "name": "Metro Trauma Center (Hospital A)",
          "status": "REJECTED",
          "reasons": [
            "✗ ICU unavailable (0 open beds; 100% occupied by first wave)",
            "✗ Trauma occupied (all 3 operating rooms actively in surgical procedures)"
          ]
        }
      ],
      "allocated_resources": [
        "1x Regional ICU Critical Care Bed",
        "1x Staffed Surgical Trauma Team",
        "3x Units Universal Donor O- Negative Blood",
        "1x Advanced Life Support (ALS) Transport Unit (AMB-04)"
      ],
      "clinical_tradeoff_summary": "Nearest facility (Hospital A, 8.2m) is medically incapable due to 100% ICU/OR saturation. Hospital B is the globally optimal receiving trauma center satisfying all 4 clinical capabilities within the 30-minute critical trauma window."
    }
  },
  "action_queue": [...]
}
```

#### `POST /api/v1/command-center/actions/{action_id}/execute`
Authorizes and executes a specific tactical command directive, triggering physical state transitions across vehicles, casualties, and receiving facilities, while logging an audit event.

**Response `200 OK`**:
```json
{
  "status": "EXECUTED",
  "action_id": "CMD-ACT-HERO-083",
  "message": "Action CMD-ACT-HERO-083 authorized and dispatched to operational units.",
  "execution_details": {
    "action_id": "CMD-ACT-HERO-083",
    "status": "EXECUTED",
    "executed_at": "2026-10-30T14:21:05Z",
    "dispatched_entities": ["AMB-04 (Medic 4 ALS Unit)", "V083 (Priority 1 Casualty)"],
    "affected_resources": ["Hospital B ICU Bed (1 committed)", "Hospital B O- Blood (3 units reserved)"],
    "timeline_event_id": "EVT-CMD-EXE-1761834065000",
    "summary": "Ambulance AMB-04 en route to Victim V083 with St. Jude Regional Hospital destination via Route B."
  }
}
```

#### `POST /api/v1/command-center/actions/execute-all`
Authorizes and executes all queued pending directives in deterministic sequence.

---

### 3. Resource Optimization Engine (Phase 7 - Google OR-Tools MILP)

#### `GET /api/v1/optimization/solve`
Solves the constrained mixed-integer linear programming (MILP) model over all current casualties, physical bed capacities, ambulance capacities, blood stocks, and road constraints.

**Response `200 OK`**:
```json
{
  "solver_status": "OPTIMAL",
  "solve_time_ms": 32.4,
  "objective_value": 384.2,
  "total_high_priority_victims": 45,
  "served_victims_count": 5,
  "unassigned_victims_count": 40,
  "tracked_resources": {
    "icu_beds_open": 4,
    "ventilators_available": 6,
    "blood_units_o_neg": 21,
    "trauma_teams_active": 2,
    "ambulances_available": 5,
    "heavy_rescue_squads": 2
  },
  "assignments": [
    {
      "victim_id": "V083",
      "victim_priority": "P1",
      "ambulance_id": "AMB-04",
      "ambulance_callsign": "Medic 4",
      "hospital_id": "H-B",
      "hospital_name": "St. Jude Regional Hospital",
      "eta_minutes": 13.0,
      "allocated_resources": [
        "1x Regional ICU Bed",
        "1x Staffed Trauma Team",
        "3x Units O- Blood",
        "1x ALS Transport (Medic 4)"
      ],
      "expected_benefit_score": 145.5
    }
  ],
  "unassigned_victims": [
    {
      "victim_id": "V018",
      "victim_priority": "P1",
      "primary_bottleneck": "ICU_DEFICIT",
      "reason": "NO FEASIBLE ASSIGNMENT: Regional ICU capacity exhausted (4/4 beds committed)"
    }
  ],
  "resource_conflicts": [...],
  "recommended_reallocations": [...]
}
```

---

### 4. Continuous Replanning Engine (Phase 10)

#### `GET /api/v1/replanning/current`
Returns the active plan version snapshot.

**Response `200 OK`**:
```json
{
  "plan_version": 12,
  "plan_version_label": "PLAN v12",
  "timestamp": "2026-10-30T14:22:15Z",
  "trigger_event": "HOSPITAL_CAPACITY_CHANGE",
  "reason_for_replan": "Hospital B ICU capacity decreased from 2 to 1.",
  "affected_victims": ["V129"],
  "affected_resources": ["Hospital B ICU Beds (2 -> 1)", "Hospital C ICU Beds (2 open)"],
  "changed_assignments": [
    {
      "victim_id": "V129",
      "previous_destination": "Hospital B (St. Jude Regional)",
      "new_destination": "Hospital C (Harborview Memorial Medical)",
      "previous_ambulance": "AMB-05",
      "new_ambulance": "AMB-05",
      "change_reason": "Hospital C now provides feasible ICU capacity."
    }
  ]
}
```

---

### 5. Deterministic Simulation Evaluation Benchmark (Phase 14)

#### `GET /api/v1/evaluation/benchmark`
Returns the head-to-head operational and algorithmic comparison between Baseline/Manual EMS dispatch and LIFELINK.

**Response `200 OK`**:
```json
{
  "scenario_id": "INC-2026-OMEGA-04",
  "scenario_name": "Train Derailment & Chemical Tanker Rupture (214 Casualties, 5 Disruption Events)",
  "evaluation_timestamp": "2026-10-30T14:25:00Z",
  "simulation_label": "SYNTHETIC SIMULATION BENCHMARK RESULTS ONLY",
  "disclaimer": "CRITICAL NOTICE: All metrics represent simulated algorithmic and logistical throughput within a deterministic mathematical model. No real-world medical outcomes, clinical survival rates, or physiological end-points are claimed or evaluated.",
  "baseline_profile": {
    "strategy_name": "Baseline / Manual EMS Allocation",
    "time_to_produce_feasible_plan_seconds": 870.0,
    "critical_patients_assigned": 16,
    "icu_conflicts": 4,
    "ambulance_utilization_pct": 52.4,
    "number_of_replans": 0,
    "mean_planning_latency_ms": 492000.0
  },
  "lifelink_profile": {
    "strategy_name": "LIFELINK Autonomous Optimization",
    "time_to_produce_feasible_plan_seconds": 0.032,
    "critical_patients_assigned": 31,
    "icu_conflicts": 0,
    "ambulance_utilization_pct": 96.2,
    "number_of_replans": 5,
    "mean_planning_latency_ms": 18.2
  },
  "metrics_comparison": [...],
  "per_event_replans": [...],
  "algorithmic_speedup_factor": "27,180x"
}
```

