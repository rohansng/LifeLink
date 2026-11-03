# 12_BUILD_RULES.md
## LIFELINK: AI Agent Coding Instructions & Development Directives

---

> ### ⚠️ AGENT ENFORCEMENT NOTICE
> **Every autonomous AI coding agent, pair programmer, or developer modifying the LIFELINK codebase MUST strictly adhere to the following directives.**  
> Deviations from these rules will be rejected during automated verification and review.

---

### 1. Architecture Rules

* **Follow `TECH_ARCHITECTURE.md`**: All backend routing, solver logic, and state management must align with the neuro-symbolic framework.
* **No Unapproved Frameworks**: Do not introduce new backend frameworks (e.g. Django, Flask) or frontend state libraries (e.g. Redux, MobX, Zustand) without explicit user approval.
* **Monolithic Clean Modular Design**: Do not introduce microservices, distributed queues (e.g. Kafka, RabbitMQ), or external database servers. The architecture relies on an in-memory high-throughput event repository.
* **Prefer Existing Utilities**: Always reuse existing engines in `backend/app/` (`triage/`, `matching/`, `resource_optimization/`, `routing/`, `replanning/`, `command_center/`).

---

### 2. UI & Design System Rules

* **Follow `UI_DESIGN_SYSTEM.md`**: Strictly adhere to the defense-grade operations console aesthetic (matte slate-gray `#111418`/`#1A202C`, 1px borders `#2B323D`, monospace metrics, zero AI glow).
* **No One-Off Styling**: Do not create arbitrary inline colors or inconsistent button designs. Always use defined CSS variables or design tokens:
  * Backgrounds: `var(--bg-primary)`, `var(--bg-card)`
  * Triage Red: `#DC2626` / `var(--triage-red)`
  * Triage Yellow: `#D97706` / `var(--triage-yellow)`
  * Triage Green: `#15803D` / `var(--triage-green)`
  * Muted Monospace: `font-family: var(--font-mono)`
* **Mandatory UI States**: Every component, modal, and table MUST explicitly handle:
  1. **Loading State**: Subtle pulsing skeleton wireframe in `#1E2530`.
  2. **Empty State**: Clear icon, concise status label, zero broken tables.
  3. **Error / Refusal State**: High-contrast refusal banner with causal bottleneck attribution (`NO FEASIBLE ASSIGNMENT`).
* **Component Reuse**: Check existing components in `frontend/src/components/` before creating new ones.

---

### 3. Security & Access Rules

* **Never Expose Secrets in Client-Side Code**: Private keys (`GEMINI_API_KEY`) must never be placed in frontend code, `.env.local` frontend bundles, or client-accessible variables.
* **Never Trust Client-Provided Authorization**: All allocation constraints, priority overrides, and execution directives must be verified and enforced server-side.
* **Validate All Server Inputs**: Every FastAPI route must validate incoming payloads via strict Pydantic v2 schemas with explicit types, regex patterns, and range bounds.
* **Never Disable Security Controls**: Never disable CORS validation, bypass auth guards, or turn off schema validation to "make a feature work".
* **Never Store Passwords Directly**: Always use salted cryptographic hashing (e.g. Argon2id / bcrypt).
* **Never Log Tokens or Secrets**: Ensure console logs, uvicorn outputs, and error stack traces do not emit raw bearer tokens, API keys, or private civilian credentials.

---

### 4. Code Quality & Modularity Rules

* **TypeScript / Strict Type Hints**: Use strict typing on frontend and full Python type annotations (`Pydantic`, `typing.Optional`, `typing.List`) on backend.
* **Small Reusable Functions**: Functions should have a single responsibility and be under 50 lines where practical.
* **Zero Duplicate Components**: Consolidate redundant cards, modals, and badge components into reusable primitives.
* **Zero Unnecessary Abstractions**: Do not create abstract factory wrappers or over-engineered design patterns where a direct Python class or React component suffices.
* **Zero Dead Code**: Remove all unused imports, abandoned test scripts, deprecated endpoints, and commented-out code blocks.
* **Zero Unused Dependencies**: Clean up `package.json` and `backend/requirements.txt`. Do not leave unreferenced libraries in the repository.

---

### 5. Database & State Management Rules

* **Follow `DATA_MODEL.md`**: Domain schemas in `backend/app/models/` and `backend/app/*/schemas.py` must match the documented relational structure.
* **Documentation Sync on Schema Changes**: If you add or modify a field in any entity (`Victim`, `Hospital`, `Ambulance`, `ActionDirective`), you MUST update `DATA_MODEL.md` and `API.md` in the same commit.
* **Resource Ownership & Immutability**: All timeline event records are append-only. Never mutate past history.

---

### 6. Pre-Implementation Checklists

#### Before Adding a Dependency, Ask:
1. *Can existing native code or standard libraries solve this?* (e.g. `math`, `heapq`, `dataclasses`, `fetch`).
2. *Can a small, well-tested 20-line utility function solve this?*
3. *Is the dependency strictly necessary for production or judging?*
*(If the answer to 1 or 2 is yes, DO NOT add the dependency.)*

#### Before Creating a New Component, Ask:
1. *Does a similar component already exist in `frontend/src/components/`?*
2. *Can an existing component (`CommandCenterHero`, `VictimZonesPanel`, `HospitalsPanel`) be extended with a prop?*
3. *Does this new component strictly conform to the 4-column defense-grade layout in `UI_DESIGN_SYSTEM.md`?*
