# 03_UI_DESIGN_SYSTEM.md
## LIFELINK: Defense-Grade Operations Console Design System

---

### 1. Design Philosophy & Aesthetic Directives

LIFELINK is intentionally styled as a **utilitarian defense-grade emergency operations console**, drawing structural inspiration from:
* **Palantir Gotham / Foundry** (Relational intelligence, entity tracking, defense clarity)
* **NATO C2 & MIL-STD-2525 Common Operational Picture** (Tactical symbology, zero eye fatigue)
* **Bloomberg Terminal & Flightradar24** (Micro-data density, real-time tabular telemetry, zero ornamental waste)

#### Explicit Anti-Patterns (Forbidden UI Elements)
* ❌ **NO AI Glow / Neon Gradients**: Zero purple/cyan hyper-gradients, zero decorative glowing blurs.
* ❌ **NO Sci-Fi Glassmorphism**: No excessive translucent frosted backdrops that impair readability under low-light EOC environments.
* ❌ **NO Decorative Charts**: No decorative circular progress bars or decorative waves without clinical meaning.
* ✅ **Muted, Low-Glare Matte Surfaces**: Flat, ultra-dark slate containers with crisp 1px hairline borders.
* ✅ **High Data Density**: Maximum situational intelligence per square inch of screen real estate.

---

### 2. Color Palette & Semantic Coding

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SEMANTIC COLOR PALETTE                             │
├─────────────────────┬───────────┬───────────────────────────────────────────┤
│ Token Name          │ Hex Value │ Purpose / Usage                           │
├─────────────────────┼───────────┼───────────────────────────────────────────┤
│ `--canvas-dark`     │ `#0B0E13` │ Deepest baseline application background   │
│ `--canvas-elevated` │ `#12171F` │ Secondary background / table alternating  │
│ `--panel-bg`        │ `#1A202C` │ Primary container / card background       │
│ `--panel-dark`      │ `#111418` │ Matte dark sub-panel / telemetry shell    │
│ `--border-hairline` │ `#2B323D` │ 1px structural container separation       │
│ `--border-subtle`   │ `#2D3748` │ Secondary border & dividers               │
│ `--text-primary`    │ `#E2E8F0` │ Crisp white/gray for headlines & values   │
│ `--text-secondary`  │ `#94A3B8` │ Supporting labels, metadata, and tables   │
│ `--text-muted`      │ `#64748B` │ Micro-captions, timestamps, disabled keys │
└─────────────────────┴───────────┴───────────────────────────────────────────┘
```

#### Functional Triage Signals (Strictly Reserved for Clinical & Tactical Status)
Color is never used decoratively. Colored fills are strictly restricted to clinical triage acuity and threat conditions:

| Triage Status | Hex Code | Visual Swatch | Clinical Definition |
| :--- | :--- | :--- | :--- |
| **Code Black (Deceased)** | `#4A5568` | `[████]` | Non-salvageable, zero respiration after airway repositioning |
| **Immediate / Red (P1)** | `#DC2626` | `[████]` | Critical arterial bleed, tension pneumothorax, severe pelvic crush |
| **Delayed / Yellow (P2)**| `#D97706` | `[████]` | Open fracture, serious surgical candidate, stable hemodynamics |
| **Minor / Green (P3)**   | `#15803D` | `[████]` | Ambulatory "walking wounded", minor lacerations, contusions |
| **Active Unit / Tactical**| `#2563EB` | `[████]` | Dispatched ambulance, selected corridor, active command route |

---

### 3. Typography Hierarchy

The typographic system pairs an ultra-legible utilitarian sans-serif for civilian names and narrative briefings with an authentic monospace font for telemetry, coordinates, and solver outputs:

* **Primary Sans-Serif**: `Inter`, `DIN 1451`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
* **Telemetry Monospace**: `JetBrains Mono`, `IBM Plex Mono`, `SF Mono`, `Consolas`, `monospace`

```css
/* Typography Scale */
--text-display:   18px / 1.2  var(--font-mono); /* MCI Header & Hero Action */
--text-title:     14px / 1.3  var(--font-sans); /* Panel Headers (Uppercase) */
--text-body:      12px / 1.4  var(--font-sans); /* Narrative briefings & notes */
--text-table:     11px / 1.3  var(--font-mono); /* Casualty Queue & Fleet Rows */
--text-micro:     10px / 1.2  var(--font-mono); /* Coordinates, timestamps, tags */
```

---

### 4. Modular 4-Column Layout (Desktop 16:9 Standard)

As codified in the system design brief, the dashboard adheres to a rigid 4-column operational layout designed for 1080p, 1440p, and 4K command room projectors:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  LIFELINK - MASS CASUALTY INCIDENT COMMAND   • LEVEL 1 MCI ACTIVE - METRO AREA   01:35 AM UTC   [NAV]  │
├───────────────┬───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ COLUMN 1      │ COLUMN 2                      │ COLUMN 3                      │ COLUMN 4               │
│ Left Rail     │ Center-Left                   │ Center-Right                  │ Right Rail             │
│               │                               │                               │                        │
│ • Incident    │ • Tactical GIS Map            │ • Casualty Queue              │ • Hospital Capacity    │
│   Brief       │   - High-Res Satellite Base   │   - START Status Tags         │   - Metro Trauma (0)   │
│ • HazMat NH3  │   - Zone Alpha/Bravo Clusters │   - Search & Filter Chips     │   - St. Jude (1 ICU)   │
│   Plume Cordon│   - Hwy 101 Severed Route     │   - Transport ETAs            │   - Harborview (3 ICU) │
│ • Active Radio│   - Ambulance GPS Markers     │   - Matched Receiving Hosp    │ • Transport Fleet      │
│   Audio Wire  │   - Tactical Map Legend       │   - One-Click Dispatch        │   - Medics 1 to 5      │
│ • Timers      │   - Satellite / Street Toggle │   - Bottleneck Attribution    │   - Queued Queues      │
└───────────────┴───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

#### Detailed Column Specifications:
1. **Column 1 — Left Rail (Incident Brief & HazMat Telemetry)**:
   * Width: 22% of viewport.
   * Components: Active audio telemetry waveform, countdown timers, anhydrous ammonia $NH_3$ plume dispersion vector, weather sensors ($14\text{ kts WNW}$ wind), live dispatch radio wire transcripts.
2. **Column 2 — Center-Left (Tactical GIS Map)**:
   * Width: 32% of viewport.
   * Components: Satellite imagery base layer with boundary overlay, polygon casualty impact zones (Sector Alpha, Bravo, Charlie), ambulance GPS pins, hospital locations, and dashed red Highway 101 road severance.
3. **Column 3 — Center-Right (Casualty Acuity Queue)**:
   * Width: 26% of viewport.
   * Components: High-density tabular casualty queue, searchable by patient ID, filterable by START tags, displaying transport ETA and OR-Tools matched destination.
4. **Column 4 — Right Rail (Hospital Status & Transport Fleet)**:
   * Width: 20% of viewport.
   * Components: Regional hospital capacity grid (ICU beds, OR status, O- blood supply), ambulance fleet status, and active queuing queues.

---

### 5. Tactical Component Library & UI States

#### 5.1 Tactical Badges & Chips
```css
/* Immediate Red Badge */
.badge-immediate {
  background: #3B1214;
  color: #F87171;
  border: 1px solid #7F1D1D;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

/* Delayed Yellow Badge */
.badge-delayed {
  background: #382405;
  color: #FBBF24;
  border: 1px solid #78350F;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

/* Minor Green Badge */
.badge-minor {
  background: #0B291B;
  color: #34D399;
  border: 1px solid #065F46;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

/* Deceased Black Badge */
.badge-deceased {
  background: #1E2530;
  color: #94A3B8;
  border: 1px solid #334155;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}
```

#### 5.2 Mandatory UI States
Every view, table, and panel must explicitly support three states:
1. **Loading State**: Subtle pulsing skeleton wireframe in `#1E2530` with monochromatic spinner (`Lucide.RotateCcw`). Zero full-screen jarring layout shifts.
2. **Empty State**: Clear monochromatic icon (`Lucide.Inbox` or `Lucide.ShieldCheck`), concise caption (e.g. *"Zero unassigned critical casualties in queue"*), and optional reset action.
3. **Error / Refusal State**: High-contrast slate-crimson banner (`#3B1214`), warning icon (`Lucide.AlertTriangle`), explicit error description, and a deterministic refusal breakdown (`NO FEASIBLE ASSIGNMENT`).
