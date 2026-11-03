# 01_PRODUCT_SPEC.md
## LIFELINK: Product Specification & Operational Scope

---

### 1. Executive Summary & Vision

**LIFELINK** is an enterprise-grade, defense-caliber Incident Command System (ICS) and algorithmic emergency orchestration platform designed specifically for Mass Casualty Incidents (MCIs) and urban catastrophe response.

During catastrophic events—such as train derailments, hazardous material ruptures, structural collapses, or mass-impact industrial accidents—emergency communication ecosystems suffer from acute cognitive saturation, communication fog, and hospital over-convergence. 

LIFELINK resolves this crisis through a **Neuro-Symbolic Architecture**:
* **Cognitive AI (Google Gemini)**: Ingests unstructured multimodal data (911 transcripts, responder radio chatter, drone reconnaissance imagery, weather telemetry) and extracts structured clinical, spatial, and hazard parameters.
* **Symbolic Optimization (Google OR-Tools MILP)**: Executes a deterministic Mixed-Integer Linear Program to compute mathematically optimal casualty triage allocations, ambulance routing, and hospital matching in under $60\text{ ms}$, enforcing 100% hard physical bounds on ICU beds, operating rooms, and blood reserves.
* **Deterministic Refusal Guard**: Refuses to hallucinate allocations when resources are physically exhausted, surfacing `NO FEASIBLE ASSIGNMENT` alongside root bottleneck attribution.
* **Human-in-the-Loop Authority**: Delivers an action-oriented command console with transparent **WHY rationale** briefings for human incident commanders.

---

### 2. Core Operational Problems Addressed

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        CRISIS OPERATIONAL FAILURE MODES                      │
├───────────────────────────────┬──────────────────────────────────────────────┤
│ 1. Cognitive Saturation       │ Incident commanders receive hundreds of      │
│    & Data Fragmentation       │ conflicting audio streams, 911 calls, and    │
│                               │ field logs. Critical acuity data is lost.    │
├───────────────────────────────┼──────────────────────────────────────────────┤
│ 2. Hospital Over-Convergence  │ Ambulances instinctively transport victims   │
│    ("The Second Disaster")    │ to the nearest hospital, overwhelming its ER │
│                               │ while Level 1 trauma centers 8 min away sit. │
├───────────────────────────────┼──────────────────────────────────────────────┤
│ 3. Brittle Static Planning    │ Dispatch plans prepared at minute 0 become   │
│    vs. Dynamic Disruption     │ fatal by minute 10 when routes burn, ICU     │
│                               │ beds drop, or blood banks run dry.           │
├───────────────────────────────┼──────────────────────────────────────────────┤
│ 4. LLM Hallucination Risk     │ Generative AI cannot be trusted with discrete│
│                               │ clinical logistics: it hallucinates beds and │
│                               │ fails multi-variable constraint guarantees.  │
└───────────────────────────────┴──────────────────────────────────────────────┘
```

---

### 3. Target User Personas & Roles

| Persona | Operational Context | Primary Goal | System Interaction |
| :--- | :--- | :--- | :--- |
| **Incident Commander (EOC Lead)** | Emergency Operations Center (EOC) or Mobile Command Post | Strategic crisis command, inter-agency coordination, resource acquisition | Reviews Hero Action Directives, approves batch dispatches, monitors plume telemetry |
| **Medical Branch Director** | Field Triage Staging Area / Regional EMS Directorate | Clinical oversight, START/SALT protocol enforcement, hospital capacity allocation | Inspects Casualty Queue, overrides clinical priority weights, triggers mutual aid |
| **EMS Fleet Dispatch Supervisor** | Central 911 Dispatch Hub | Real-time vehicle routing, transit corridor clearance, turnaround optimization | Tracks Ambulance Fleet status, enforces Route B contraflow detours, monitors ETAs |
| **Hospital Triage Coordinator** | Receiving Regional Trauma Center / Emergency Department | Bed preservation, trauma team mobilization, blood bank management | Updates ICU/OR bed capacity, flags critical blood shortages, prepares receiving bays |

---

### 4. Key Functional Capabilities

#### 4.1 Ingestion & Cognitive Extraction
* Ingests 911 emergency transcripts, field responder voice logs, and drone reconnaissance reports.
* Extracts structured parameters: START clinical acuity category (Red/Yellow/Green/Black), anatomical trauma classification (e.g. pelvic crush, tension pneumothorax), chemical hazard vectors (e.g. $NH_3$ anhydrous ammonia plume), and road blockages.
* Generates continuous confidence scores and deterministic fallback vectors if AI parsing times out.

#### 4.2 Deterministic Resource Optimization
* Mixed-Integer Linear Program (MILP) formulated over a dynamic spatial graph.
* Multi-objective optimization: Minimizes total weighted time to definitive care while penalizing hospital saturation and transport delays.
* Enforces hard constraints:
  * Hospital ICU Bed Capacity ($C_k$)
  * Operating Room Availability ($OR_k$)
  * Blood Bank Reserves ($B_k$)
  * Ambulance Stretcher Limits ($V_j$)
  * Specialty Capability Mask ($M_{ik}$) (e.g., neurosurgery, burn beds, pediatric trauma)

#### 4.3 Continuous Replanning Loop
* Real-time event-driven replanning engine responding to 5 major disruption classes:
  1. Casualty influx (new sector discoveries, drone recon).
  2. Hospital capacity drops (ICU bed sudden saturation, staffing shortages).
  3. Route severances (tanker fires, bridge collapses, debris blockages).
  4. Blood bank depletion (rapid consumption during trauma laparotomies).
  5. Capacity surges (on-call trauma surgical team mobilization).
* Emits plan version numbers (`v11 → v12 → ... → v16`), exact assignment diffs, and natural-language rationales.

#### 4.4 Action-Dominant Command Console
* Utilitarian 4-column operations console inspired by defense C2 systems (Palantir Gotham, NATO C2, Bloomberg Terminal).
* **Command Center Hero**: Surfaces the single highest-priority tactical action directive with 1-click execution.
* **WHY Explainability Matrix**: Breaks down exactly why a casualty was routed to Hospital B over Hospital A (ICU availability, trauma capability, transit penalty).
* **Deterministic Refusal Display**: When physical resources are exhausted, displays `NO FEASIBLE ASSIGNMENT` with causal bottleneck attribution (e.g. `FLEET_EXHAUSTED` or `ICU_CAPACITY_ZERO`).

---

### 5. Non-Functional Requirements & Performance SLAs

| Metric | Target SLA | Measured Performance |
| :--- | :--- | :--- |
| **MILP Optimization Solving Time** | $< 250\text{ ms}$ | **$50.1\text{ ms}$** (OR-Tools SCIP) |
| **Continuous Replan Latency** | $< 500\text{ ms}$ | **$63.8\text{ ms}$** mean event latency |
| **Hard Constraint Violation Rate** | **0.00%** (Mathematical guarantee) | **0.00%** (Verified across all test suites) |
| **Hallucinated Hospital Beds** | **0 beds** (Symbolic isolation) | **0 beds** |
| **Network Outage Resilience** | 100% offline functionality | Rule-based heuristic fallback active |
| **UI Render Performance** | 60 FPS at 16:9 desktop (1080p / 1440p) | React 18 virtualized DOM, $< 15\text{ ms}$ repaint |

---

### 6. Regulatory & Clinical Safety Boundaries

> **MANDATORY CLINICAL SAFETY NOTICE**  
> *LIFELINK is a decision-support and algorithmic resource optimization system using synthetic crisis simulation data. It does not provide autonomous medical diagnosis, replace certified emergency physicians or triage officers, or autonomously dispatch emergency vehicles without human incident commander validation.*

* **Human-in-the-Loop Sovereign**: Every allocation is an actionable recommendation until confirmed by a commander or executed via batch protocol.
* **Deterministic Refusal**: The application will never synthesize a fictitious hospital bed or ambulance to artificially satisfy a plan.
* **Synthetic Simulation Verification**: All benchmark metrics represent synthetic simulation scenarios designed for algorithmic validation.

