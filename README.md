# LIFELINK ⚡
### Autonomous Emergency Response Orchestration & Algorithmic Dispatch System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-brightgreen.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![Optimization](https://img.shields.io/badge/Optimization-Google%20OR--Tools-orange.svg)](https://developers.google.com/optimization)

> **LifeLink** is a hybrid neuro-symbolic emergency response platform. It bridges **multimodal cognitive AI reasoning** with **deterministic mathematical optimization**, delivering provably optimal, hallucination-free dispatch and routing recommendations for mass casualty incidents (MCIs) and high-stress urban crises.

---

## 🎯 The Core Philosophy: AI Reasoning vs. Algorithmic Optimization

> **"Cognition for Understanding, Mathematics for Decision Guarantee, Humans for Authority."**

```
                    LIFELINK
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
  INCIDENT INPUTS                LIVE SIMULATION
        │                             │
        ├─ Emergency reports          ├─ Road blockage
        ├─ Responder reports          ├─ ICU change
        ├─ Images                     ├─ Blood shortage
        ├─ Ambulance GPS              └─ New hospital
        ├─ Hospital capacity
        └─ Road conditions
                       │
                       ↓
                AI ORCHESTRATOR
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
   Incident         Triage          Hospital
     Agent           Agent            Agent
       ↓               ↓                ↓
   Evidence        Priority        Capability
                       │
       ┌───────────────┼────────────────┐
       ↓                                ↓
 Resource Agent                    Routing Agent
       │                                │
       └───────────────┬────────────────┘
                       ↓
                 OPTIMIZATION (OR-Tools / MILP)
                       ↓
                COMMAND AGENT
                       ↓
              ACTION RECOMMENDATIONS
                       ↓
                 HUMAN COMMANDER
                       ↓
                    REPLAN
```

### Why Raw LLMs Cannot Dispatch Ambulances
- **Combinatorial Complexity**: Dispatching $N$ patients across $M$ ambulances and $K$ trauma centers subject to transit times, Golden Hour deadlines, and bed capacities is an NP-hard problem.
- **Zero Tolerance for Hallucinations**: An LLM cannot be trusted to enforce strict capacity limits (e.g. allocating 10 burn victims to a hospital with 2 burn beds).
- **Non-Determinism**: Clinical triage and life-or-death decisions require deterministic, mathematically proven bounds.

### LifeLink's Hybrid Solution
1. **Perception & Cognitive AI**: Multi-agent LLMs process unstructured 911 calls, paramedic voice notes, and scene photos into standardized clinical vectors (START triage scores, urgency weights $w_i$, capability masks $M_{ik}$).
2. **Mathematical Optimization Engine**: A deterministic solver (**Google OR-Tools MILP / VRPTW**) guarantees the mathematically optimal allocation that minimizes time to definitive care while enforcing hard constraints.
3. **Command Agent**: Translates the mathematical solution into actionable, explainable commander briefings with transparent trade-offs.
4. **Human-in-the-Loop**: Incident commanders review recommendations with 1-click approvals or manual overrides.
5. **Live Crisis Simulation & Dynamic Replanning**: Injects real-time disruptions (road blockages, ICU drops, casualty surges) and recalculates optimal solutions in $< 500\text{ ms}$.

---

## 🗂️ Repository Structure

```
lifelink/
├── frontend/                     # Interactive Command Center (Mapbox / Deck.gl + React)
│   ├── src/
│   │   ├── components/          # Map, Triage Board, Hospital Monitor, Simulation Panel
│   │   ├── hooks/               # Live WebSocket hooks
│   │   └── App.jsx
│   └── package.json
│
├── backend/                      # High-performance FastAPI server
│   ├── app/
│   │   ├── api/                 # REST & WebSocket endpoints (incidents, dispatch, telemetry)
│   │   ├── core/                # State manager & event bus
│   │   ├── models/              # Pydantic domain models
│   │   └── main.py
│   └── requirements.txt
│
├── ai/                           # Cognitive Multi-Agent Framework
│   ├── orchestrator.py          # Master supervisor & parameter aggregator
│   ├── agents/
│   │   ├── incident_agent.py    # Unstructured text & hazard scene reasoning
│   │   ├── triage_agent.py      # START / SALT clinical priority scoring
│   │   ├── hospital_agent.py    # Facility capability & surgical team matching
│   │   ├── resource_agent.py    # Fleet readiness & paramedic equipment
│   │   ├── routing_agent.py     # Graph traversal & detour advice
│   │   └── command_agent.py     # Tactical natural-language briefing generator
│   └── prompts/                 # Standardized clinical & operational prompts
│
├── optimization/                 # Deterministic Optimization Engine
│   ├── solvers/
│   │   ├── milp_allocator.py    # Mixed-Integer Linear Program (Google OR-Tools)
│   │   └── vrptw_router.py      # Vehicle Routing with Time Windows
│   ├── graph/
│   │   └── road_network.py      # Graph traversal & dynamic travel-time cost matrix
│   └── schemas.py               # Pure mathematical & solver data schemas
│
├── simulation/                   # Crisis Stress-Testing & Disruption Engine
│   ├── engine.py                # Discrete-event simulation runner
│   ├── events.py                # Road blocks, ICU capacity drops, blood shortages
│   └── scenarios.py             # Pre-configured crisis scenarios
│
├── data/                         # GeoJSON, road networks & synthetic MCI scenarios
├── docs/                         # Technical specifications & mathematical proofs
│   ├── architecture.md
│   ├── execution_roadmap.md
│   └── math_formulation.md
└── README.md
```

---

## 📐 Mathematical Formulation

Let $I$ be the set of patients, $J$ be the set of ambulances, and $K$ be the set of hospitals:

$$\min \sum_{i \in I} w_i \left( \sum_{j \in J} t_{ij} x_{ij} + s_i + \sum_{k \in K} t_{ik} y_{ik} \right) + \lambda \sum_{k \in K} \text{Overload}(k)$$

**Subject to:**
- **Patient Coverage**: $\sum_{j \in J} x_{ij} = 1, \quad \forall i \in I_{\text{critical}}$
- **Ambulance Capacity**: $\sum_{i \in I} x_{ij} \le V_j, \quad \forall j \in J$
- **Hospital Capacity**: $\sum_{i \in I} y_{ik} \le C_k, \quad \forall k \in K$
- **Specialty Matching**: $y_{ik} \le M_{ik}, \quad \forall i \in I, k \in K$
- **Coupling Integrity**: $\sum_{j \in J} x_{ij} = \sum_{k \in K} y_{ik}, \quad \forall i \in I$

Where:
- $w_i$: Triage priority weight determined by the **Triage Agent** (START protocol).
- $M_{ik} \in \{0, 1\}$: Binary capability mask formulated by the **Hospital Agent**.
- $t_{ij}, t_{ik}$: Dynamic transit times computed by the **Routing Agent**.
- $x_{ij}, y_{ik} \in \{0, 1\}$: Deterministic decision variables solved by **Google OR-Tools**.

---

## ⚡ Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone & Setup Environment
```bash
git clone https://github.com/rohansng/LifeLink.git
cd LifeLink

# Create Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Run the Optimization Benchmark
```bash
python -m optimization.solvers.milp_allocator
```

### 3. Start the Backend & WebSocket Server
```bash
uvicorn backend.app.main:app --reload --port 8000
```

### 4. Start the Frontend Command Center
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ License
Licensed under the [MIT License](LICENSE).
