# LIFELINK — Hackathon Demo & Judging Guide ⚡

> **3-Minute High-Impact Walkthrough & Deterministic Simulation Sequence**

---

## 🎯 1. The 30-Second Elevator Pitch for Judges

> *"In a mass-casualty crisis, emergency dispatchers face combinatorial chaos: 200+ casualties, finite ambulances, saturated ICUs, and severed roads. Today, this is coordinated manually over chaotic radio channels. Paramedics rush victims to the nearest trauma center only to be turned away at the bay doors because the ICU is full.*
>
> ***LIFELINK is the world's first hybrid neuro-symbolic crisis orchestration engine.***
> *We combine **multimodal Gemini AI agents** for unstructured 911 calls, drone photos, and paramedic audio with **Google OR-Tools MILP optimization** to mathematically guarantee zero hospital diversions, optimal resource utilization, and continuous sub-second replanning as conditions change."*

---

## 🕹️ 2. Live Demo Architecture: Two Ways to Run

| Mode | Command / URL | Target Audience |
|---|---|---|
| **A. Interactive Web UI (Local)** | `http://localhost:3000` | Hackathon live presentation, visual UI walkthrough |
| **B. Cloud Deployment (Netlify)** | [https://legendary-sprite-e5cbb1.netlify.app/](https://legendary-sprite-e5cbb1.netlify.app/) | Remote judges, zero-install instant evaluation |
| **C. Terminal Automation** | `python demo/run_demo.py` | 100% offline, guaranteed zero-latency terminal run |

---

## 📋 3. Step-by-Step 3-Minute Presentation Script

### Part 1: The Command Center (0:00 - 0:45)
1. **Open the Dashboard**: Navigate to [http://localhost:3000](http://localhost:3000).
2. **Point out the Visual Hierarchy**:
   - Show how the **Command Center Hero Directive** dominates the interface (no decorative clutter).
   - Point out the concrete dispatch directive:
     $$\text{Casualty } \mathbf{V083} \longrightarrow \mathbf{AMB\text{-}04} \longrightarrow \mathbf{Hospital\ B} \longrightarrow \mathbf{Route\ B} \longrightarrow \mathbf{ETA\ 13\ min}$$
3. **Click the `[WHY? (Inspect Justification)]` Button**:
   - Show the judge that LIFELINK is **not a black box**.
   - Show the 4 passing criteria (`✓ ICU available`, `✓ Trauma available`, `✓ Blood available`, `✓ Shortest feasible ETA`).
   - Show the **Rejected Alternatives**:
     - *Hospital A rejected*: 100% ICU/OR saturated.
     - *Highway 101 rejected*: Severed by an overturned tanker fire.
   - Show the allocated clinical bundle (ICU bed, trauma team, 3 units O- blood, ALS unit).
4. **Click `[⚡ AUTHORIZE & DISPATCH]`**:
   - Demonstrate **Human-in-the-Loop Authority**: The AI recommends, but the Incident Commander authorizes.
   - Status updates to `✓ EXECUTED & EN ROUTE`.
   - AMB-04 transitions to `TRANSPORTING`; an audit event is injected into the incident timeline.

---

### Part 2: The One-Click Killer Demo Simulation (0:45 - 2:00)
Look at the **One-Click Simulation Ribbon** at the top (`SimulationEngineBar.jsx`).

Click **`[▶ START MASS-CASUALTY SIMULATION]`** (or advance step-by-step):

#### 🔴 Event 1: Responder Recon Evidence (+17 victims, +5 critical)
- **What happens**: Thermal drone recon discovers 17 new victims trapped in Sector Alpha machinery.
- **System reaction**: Total casualties rise from 214 to 231; OR-Tools immediately recalculates; critical casualties are queued.

#### 🔴 Event 2: Hospital B ICU Capacity Shock (2 → 1 beds)
- **What happens**: St. Jude Regional's ICU beds drop from 2 to 1 due to post-operative intake.
- **Continuous Replanning in Action**:
  - A glowing banner appears: **`PLAN v12 Established`**.
  - Reason: `Hospital B ICU capacity decreased from 2 to 1.`
  - Changed assignment: **V129** rerouted from Hospital B $\longrightarrow$ **Hospital C**.
  - Reason: `Hospital C now provides feasible ICU capacity.`
- *Key Pitch Point to Judges*: *"A traditional manual dispatcher wouldn't learn this until the ambulance arrived at the emergency bay. LIFELINK rerouted the patient before the wheels even turned."*

#### 🔴 Event 3: Highway 101 Severed (Route A 11 min → 27 min)
- **What happens**: Fuel tanker explodes on Overpass 4; Highway 101 is closed.
- **System reaction**: Route A marked blocked with ❌; all units automatically rerouted via the Route B contraflow corridor (13 min).

#### 🔴 Event 4: Regional O- Blood Reserve Drops (18 → 3 units)
- **What happens**: Trauma center blood inventory plummets to 3 units.
- **System reaction**: Matcher reserves remaining units strictly for hemorrhagic casualty V083; creates an actionable recommendation: `DEPLOY STATE BLOOD BANK EMERGENCY CONVOY (+40 Units O-)`.

#### 🔴 Event 5: Hospital C Trauma Team Mobilized (+2 ICU beds)
- **What happens**: Hospital C mobilizes an on-call surgical trauma team and opens 2 ICU beds.
- **System reaction**: LIFELINK instantly re-solves, filling the newly opened capacity with deferred critical casualties.

---

### Part 3: The Evaluation Benchmark (2:00 - 2:45)
1. In the header bar, click **`[📊 BENCHMARK METRICS (PHASE 14)]`**.
2. Show the judge the deterministic comparison table:
   - **Plan Feasibility Time**: 14.5 minutes manual vs. **~30 ms** LIFELINK (**29,000x faster**).
   - **ICU Diversions**: 4 in manual baseline vs. **0 in LIFELINK** (**100% eliminated**).
   - **Ambulance Utilization**: 52.4% manual vs. **96.2%** LIFELINK (+43.8 percentage points).
   - **Dynamic Replans**: 0 static vs. **5 automated closed-loop replans**.
3. Point out the **Disclaimer**:
   - *"All metrics evaluate computational and logistical throughput under synthetic disaster constraints. We do not invent real-world medical outcomes."*

---

### Part 4: Technical Rigor & Automated Tests (2:45 - 3:00)
Switch to the terminal and run:
```bash
python tests/run_tests.py
```
Show the judge:
```
Ran 68 tests in 2.210s
OK
[✓] ALL 68 TESTS PASSED SUCCESSFULLY!
```
- 10 test modules covering mathematical triage scoring, OR-Tools MILP optimization, Gemini agent fallbacks, 10-point failure modes, and continuous replanning.

---

## 🛡️ 4. What If the Wi-Fi Fails During the Presentation?

LIFELINK was built from Day 1 to be **100% resilient and offline-capable**:
1. All seed data and road networks are stored locally in-memory.
2. The OR-Tools MILP solver executes entirely locally on CPU.
3. AI agents feature automatic deterministic regex/NLP fallbacks if Gemini API is unreachable.
4. You can run the entire presentation in terminal with:
   ```bash
   python demo/run_demo.py --delay 0.5
   ```

