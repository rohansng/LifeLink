# LIFELINK System Screenshots & Visual Tour

This directory documents the core user interfaces, tactical displays, and intelligence dashboards of the **LIFELINK** platform.

---

## 📸 Key Visual Interfaces

### 1. The Command Center & Hero Action Directive (`01_command_center_hero.png`)
*The visual and operational centerpiece of the LIFELINK Command Center.*
- **Top Directive Banner**: Displays high-threat level status and Priority 1 casualty designation.
- **Concrete 5-Step Dispatch Chain**:
  $$\text{Casualty (V083)} \longrightarrow \text{Ambulance (AMB-04)} \longrightarrow \text{Destination (Hospital B)} \longrightarrow \text{Corridor (Route B)} \longrightarrow \text{ETA (13 min)}$$
- **Confidence & Status**: Enforces `PENDING COMMANDER AUTHORIZATION` until formally dispatched by human authority.
- **WHY? Fast-Inspect Checkmarks**:
  - `✓ ICU available (2 beds open at Hospital B)`
  - `✓ Trauma available (Level 2 surgical resuscitation ready)`
  - `✓ Blood available (3 units universal donor O- reserved)`
  - `✓ Shortest feasible ETA (13 min via Route B contraflow)`

---

### 2. Transparent "WHY?" Inspection Modal (`02_why_inspection_modal.png`)
*Eliminates black-box AI by providing deterministic justification and rejected alternatives.*
- **Selected Destination Evaluation**: Detailed scores across clinical capability match, ICU headroom, blood inventory, and travel penalty.
- **Rejected Alternatives with Explicit Failure Criteria**:
  - *Metro Trauma Center (Hospital A)*: **REJECTED** — ✗ 0 ICU beds open (100% saturated), ✗ all operating rooms in active surgery.
  - *Harborview Memorial (Hospital C)*: **REJECTED** — ✗ ETA 28.1 min exceeds golden-hour threshold due to blocked overpass.
  - *Highway 101 South (Route A)*: **REJECTED** — ✗ Blocked by overturned chemical tanker & hazardous vapor cloud.
- **Allocated Resource Bundle**: Explicit itemization of physical assets committed (ICU bed, trauma team, 3 units O- blood, ventilator, ALS crew).

---

### 3. One-Click Killer Demo Simulation Ribbon (`03_killer_demo_simulation_bar.png`)
*Automated 5-event mass-casualty crisis injection sequence for hackathon judging.*
- Controls: `[▶ START MASS-CASUALTY SIMULATION]`, `[STEP NEXT EVENT]`, `[↺ RESET SCENARIO]`.
- Live event progress indicator: Event 1 through 5 with active state delta badges.
- Dynamic disruption notifications:
  1. *Event 1*: Responder Recon (+17 victims, +5 critical)
  2. *Event 2*: Hospital B ICU capacity drop (2 → 1 beds)
  3. *Event 3*: Highway 101 severed (Route A 11 min → 27 min)
  4. *Event 4*: Regional O- blood reserve depleted (18 → 3 units)
  5. *Event 5*: Hospital C trauma surgical team available (+2 ICU beds)

---

### 4. Continuous Closed-Loop Replanning Banner (`04_continuous_replanning_loop.png`)
*The operational heartbeat separating LIFELINK from static dashboards.*
- Displays active plan version (e.g., `PLAN v12 Established`).
- Explicit reason for replan: `Hospital B ICU capacity decreased from 2 to 1.`
- Assignment diff breakdown:
  - Casualty **V129**: Hospital B $\longrightarrow$ **Hospital C**
  - Reason: `Hospital C now provides feasible ICU capacity.`

---

### 5. Deterministic Simulation Evaluation Benchmark (`07_evaluation_benchmark_metrics.png`)
*Head-to-head comparison between traditional manual dispatch and LIFELINK.*
- **Time to Feasible Plan**: 14.5 minutes (870,000 ms) manual baseline vs. **~30 ms** LIFELINK (29,000x speedup).
- **Critical Casualties Assigned**: 16/31 (51.6%) manual vs. **31/31 (100.0%)** LIFELINK.
- **ICU Diversion Conflicts**: 4 diversions manual vs. **0 conflicts** LIFELINK (100% eliminated).
- **Ambulance Utilization**: 52.4% manual vs. **96.2%** LIFELINK (+43.8 percentage points).
- **Dynamic Replans**: 0 static vs. **5 automated continuous replans**.
- **Per-Event Replan Latency**: 8.2 minutes manual vs. **~18 ms** LIFELINK.

---

### 6. Interactive Spatial GIS Incident Map (`08_incident_map_spatial_view.png`)
- Real-time map displaying 3 crisis impact zones (Alpha, Bravo, Charlie).
- Color-coded casualty density circles (Red = Critical, Yellow = Serious, Green = Moderate).
- Receiving trauma centers with real-time bed badges.
- Moving ambulance GPS markers with active callsign tags.
- Dynamic road segments showing active contraflow corridors vs. blocked hazard segments.

