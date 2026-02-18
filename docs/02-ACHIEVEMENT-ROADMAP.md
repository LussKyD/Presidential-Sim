# Presidential Sim — Achievement Roadmap

**How we will achieve the web-based political simulation alpha.**

This roadmap assumes the analysis in **01-PROJECT-ANALYSIS.md** and the target folder structure and math model from the game blueprint.

---

## 1. Principles

- **Gameplay first:** Simulation and policy loop must feel meaningful before we invest in 3D or polish.
- **One source of truth:** All simulation state lives in a single engine; UI only reads and dispatches actions.
- **Data-driven:** Constants and config in JSON/JS modules so we can tune and mod without refactors.
- **Static-first:** No backend required for MVP; architecture allows adding an API later.

---

## 2. Phase Overview

| Phase | Goal | Duration (estimate) | Outcome |
|-------|------|--------------------|---------|
| **0** | Repo, tooling, skeleton | 1–2 days | Vite + React app, folder structure, deploy to GitHub Pages |
| **1** | Simulation engine core | 1–2 weeks | Economy, population, politics, time tick, event bus |
| **2** | Policy layer + state wiring | ~1 week | Sliders → engine; state → UI; approval & coup risk |
| **3** | Dashboard UI | ~1 week | Charts, meters, event feed, policy panel |
| **4** | Events & crises | ~1 week | Protest/crisis triggers, event feed, simple consequences |
| **5** | Balance, polish, deploy | ~1 week | Tuning, UX pass, GitHub Pages + README |
| **6** | 3D lite (optional) | 2–3 weeks | Three.js scene, simple city, clickable buildings / motorcade feel |

Phases 0–5 deliver the **core alpha**. Phase 6 is the first “immersion” upgrade.

---

## 3. Phase 0 — Foundation

**Objective:** Run the app locally and on GitHub Pages with the intended structure.

**Tasks:**

1. Initialize Vite + React (e.g. `npm create vite@latest . -- --template react`).
2. Create folder structure:
   - `src/core/engine/` — simulationEngine, economyEngine, populationEngine, politicsEngine, crisisEngine, eventBus
   - `src/core/models/` — Citizen, Government, Economy, Military, Media (as needed for MVP)
   - `src/core/constants/` — baseValues, ideologyTypes, policyEffects
   - `src/data/` — countryConfig.json, initialPopulation.json, eventTemplates.json
   - `src/ui/components/` — Dashboard, PolicyPanel, EconomyChart, ApprovalMeter, CoupRiskMeter, EventFeed
   - `src/ui/layout/` — MainLayout, Sidebar
   - `src/utils/` — random (seeded), mathHelpers, timeManager
3. Configure Vite for static export and base path for GitHub Pages if using a project site (`/Presidential-Sim/` or repo name).
4. Add `package.json` script for build and a simple GitHub Actions workflow (or manual push) to deploy to GitHub Pages.
5. Add minimal `App.jsx` that renders a placeholder layout and a single component (e.g. “Presidential Sim – Alpha”).

**Deliverable:** Empty shells for all engine and UI modules; app builds and deploys; no simulation logic yet.

---

## 4. Phase 1 — Simulation Engine Core

**Objective:** The “brain” runs in isolation: economy, population, politics, time, and a single place that holds state.

**Tasks:**

1. **Time manager**
   - One “month” per tick; configurable tick interval (e.g. 2–3 seconds).
   - Expose: `currentMonth`, `year`, `tick()`.

2. **Constants**
   - `baseValues.js`: initial GDP, inflation, unemployment, approval, coup risk.
   - `ideologyTypes.js`: list of ideologies and weights.
   - `policyEffects.js`: how policy levers map to engine inputs (e.g. tax rate, defense budget, healthcare).

3. **Economy engine**
   - Implement the blueprint formulas:
     - GDP growth → new GDP.
     - Inflation from money printing, supply shock, interest rate.
     - Unemployment from GDP growth and policy.
   - Inputs: policy levers (from Government/player); optional “shocks” from events.
   - Outputs: GDP, inflation, unemployment (stored in state).

4. **Population engine (aggregate)**
   - No 10k individual objects yet; use distributions.
   - Compute **national approval** from:
     - Economic satisfaction (from economy engine),
     - Ideological alignment (player vs population mix),
     - Media influence,
     - Corruption perception.
   - Output: single `publicApproval` (0–1 or 0–100).

5. **Politics engine**
   - **Coup risk** formula: military disloyalty, elite dissatisfaction, public unrest, foreign interference.
   - Military disloyalty as function of budget satisfaction, “commander loyalty” placeholder, ethnic alignment placeholder.
   - Output: `coupRisk` (0–1).

6. **Event bus**
   - Simple pub/sub: `emit(eventType, payload)` and `on(eventType, handler)`.
   - Used so UI and crisis engine can react to “month advanced”, “event fired”, “crisis started”.

7. **Simulation engine (orchestrator)**
   - Holds single state object: `{ economy, population, government, military, media, time, events }`.
   - Each tick: `updateEconomy()` → `updatePopulation()` → `updatePolitics()` → `updateCrisisCheck()` (stub).
   - Emit `tick` on event bus after each tick.
   - Expose: `getState()`, `tick()`, and (later) `applyPolicy(name, value)`.

**Deliverable:** Running simulation that advances month-by-month and produces GDP, inflation, unemployment, approval, coup risk. No UI yet; test via console or a minimal debug panel.

---

## 5. Phase 2 — Policy Layer and State Wiring

**Objective:** Player actions (policy sliders) drive the engine; React reads from one source of truth.

**Tasks:**

1. **Policy application**
   - In simulation engine: `applyPolicy(policyId, value)`.
   - Update government/policy state; next tick uses new values in economy/population/politics formulas.

2. **State → React**
   - Use React context or a small store (e.g. Zustand or plain context + useState) that holds `state` and `dispatch`.
   - Engine runs in a `useEffect` + interval (or requestAnimationFrame with throttling); each tick updates the store/context so components re-render.

3. **Seeded RNG**
   - Replace raw `Math.random()` in engine and events with a seeded generator (e.g. in `utils/random.js`) so we can reproduce runs for balance and bugs.

**Deliverable:** Changing a policy (e.g. tax rate) in code or a temporary control updates the next tick’s economy and approval. UI can be minimal (single page with numbers).

---

## 6. Phase 3 — Dashboard UI

**Objective:** Full 2D dashboard that makes the simulation readable and engaging.

**Tasks:**

1. **Layout**
   - MainLayout: header (“President Sim – Alpha”), main content area, optional sidebar.
   - Sidebar: links or sections for Dashboard, Policies (later: Map, Events).

2. **Policy panel**
   - Sliders (or inputs) for: tax rate, defense budget, healthcare, education, infrastructure, corruption tolerance, press freedom, etc., as defined in constants.
   - Labels and short descriptions; values sent to engine via `applyPolicy`.

3. **Economy chart**
   - Line or area chart: GDP, inflation, unemployment over time (last N months).
   - Use Chart.js or a lightweight alternative; data from `state.economy` and `state.time`.

4. **Approval meter**
   - Single prominent gauge or bar: `publicApproval` (e.g. 0–100%).

5. **Coup risk meter**
   - Same idea: `coupRisk` (0–100%); color coding (green → yellow → red).

6. **Event feed**
   - List or log of recent events (e.g. “Month 12: Inflation rose to 8%”; “Protest in Capital”). Data from `state.events` or event bus history.

**Deliverable:** One dashboard screen where the player adjusts policies and watches economy, approval, coup risk, and a simple event feed over time.

---

## 7. Phase 4 — Events and Crises

**Objective:** Emergent events (e.g. protests, economic crisis) that fire from simulation state and feed back into the engine.

**Tasks:**

1. **Event templates**
   - `eventTemplates.json`: e.g. protest, bank run, minor crisis, coup attempt.
   - Each: condition (e.g. inflation > 20%, approval < 30%), weight, message, and effect (e.g. approval -5%, coup risk +10%).

2. **Crisis / event engine**
   - Each tick (or every N ticks): evaluate conditions; compute probability from weights and instability; if triggered, push event to state and apply effects.
   - Emit on event bus so UI can show toasts or highlight event feed.

3. **Protest logic**
   - Use blueprint formula: unemployment, inflation, corruption, police funding → protest chance.
   - When triggered, add “Protest in [Region]” and apply approval/coup risk modifiers.

4. **Coup attempt (optional for MVP)**
   - If coup risk > threshold (e.g. 0.75), roll for coup attempt; if success, game state shifts (e.g. “Coup – game over” or “Coup failed – loyalty increased”). Can be simplified to a single outcome for alpha.

**Deliverable:** Protests and at least one other event type fire when conditions are met; event feed and meters reflect consequences.

---

## 8. Phase 5 — Balance, Polish, Deploy

**Objective:** Alpha is playable, understandable, and live on GitHub Pages.

**Tasks:**

1. **Balance pass**
   - Tune constants so that “reasonable” play doesn’t collapse in 5 minutes; extreme policies still have visible consequences.
   - Optional: add “presets” (e.g. liberal, conservative, authoritarian) that set initial sliders.

2. **UX polish**
   - Tooltips, short onboarding (e.g. “Adjust policies and watch approval and economy”), clear labels.
   - Responsive layout for desktop and tablet.

3. **Persistence (optional)**
   - Save state to `localStorage` (e.g. once per tick or on demand); load on refresh. Enables “continue” and sharing seeds.

4. **README and deploy**
   - README: project name, one-line pitch, how to run locally, how to build, link to GitHub Pages.
   - Ensure GitHub Actions (or manual) deploy `dist` to GitHub Pages; test from live URL.

**Deliverable:** Deployable alpha with a clear gameplay loop, basic balance, and documentation.

---

## 9. Phase 6 — 3D Lite (Optional)

**Objective:** Prove “you are in the world” with a simple 3D scene, without building full open world.

**Tasks:**

1. **Three.js setup**
   - Single scene: camera, lights, ground plane or simple city block.

2. **Simple city**
   - Low-poly buildings (parliament, palace, media HQ, a few generic blocks); clickable or hover labels.

3. **“Motorcade” or presence**
   - Camera or simple vehicle moving along a path; or click-to-move. Goal: feeling of moving through the capital, not just menus.

4. **Integration**
   - Dashboard can be an overlay or a separate view; 3D scene reads same state (e.g. approval) to change ambiance (e.g. crowd density, protest signs) if we add those assets.

**Deliverable:** Optional 3D view that reinforces the fantasy and can be used in a future pitch for a full 3D slice.

---

## 10. Implementation Order (Checklist)

Use this as a sequential checklist; dependencies are respected.

- [ ] **0.1** Vite + React init; folder structure; GitHub Pages deploy
- [ ] **1.1** Time manager + constants
- [ ] **1.2** Economy engine (GDP, inflation, unemployment)
- [ ] **1.3** Population engine (approval aggregate)
- [ ] **1.4** Politics engine (coup risk)
- [ ] **1.5** Event bus + simulation orchestrator
- [ ] **2.1** applyPolicy + state store/context
- [ ] **2.2** Seeded RNG
- [ ] **3.1** MainLayout + Sidebar
- [ ] **3.2** PolicyPanel
- [ ] **3.3** EconomyChart, ApprovalMeter, CoupRiskMeter
- [ ] **3.4** EventFeed
- [ ] **4.1** Event templates + crisis/event engine
- [ ] **4.2** Protest and one more event type; coup attempt (simplified)
- [ ] **5.1** Balance + UX pass
- [ ] **5.2** README + deploy
- [ ] **6.x** 3D lite (after 5 is done and validated)

---

## 11. How We Achieve the Full Vision (Later)

This repo achieves the **web-based alpha**. The full “Head of State” vision (open-world 3D, motorcades, face-to-face meetings, real-time crises in 3D) would be achieved by:

1. **Using this alpha** as the design and balance reference for a 3D client (Unreal/Unity or advanced WebGL).
2. **Extracting the simulation math** into a shared spec or API so a backend (e.g. Go/Node) can run the same formulas for multiplayer or persistence.
3. **Treating this codebase** as the “Governance Simulation Platform” core: open-source engine, moddable countries, community content.

So: we achieve the **immediate** goal (playable, deployable web alpha) by following Phases 0–5; we set up **long-term** achievement by keeping the architecture clean and the simulation logic centralized and data-driven.
