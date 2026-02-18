# Presidential Sim — Project Analysis

**Document:** Lead analysis and feasibility  
**Status:** Living document  
**Constraint:** Web-based alpha, GitHub Pages (static), 100% frontend

---

## 1. Executive Summary

We are building a **web-based political power sandbox** that validates the core fantasy—“you are inside power, not managing from a menu”—using a **client-side simulation engine** and a **modular architecture** that can later scale to a backend or a 3D/Unreal slice.

**Verdict:** The described MVP is **achievable** within the stated constraints. The full open-world 3D vision is out of scope for this repo; this project is the **validation layer** for that vision.

---

## 2. Scope Definition

### 2.1 In scope (this repo)

| Layer | What we build | Why |
|-------|----------------|-----|
| **Political simulation engine** | Economy, population, politics, crisis, event bus — all in JS, client-side | Core “brain”; must feel responsive and deterministic for tuning |
| **Policy decision layer** | Sliders/inputs → real-time effect on GDP, inflation, approval, coup risk | Core gameplay loop |
| **Population model** | Statistical/aggregate citizen model (e.g. 10k “citizens” as distributions), not full agent-based | Balances depth vs. performance in browser |
| **UI dashboard** | Charts, approval meter, coup risk, event feed, policy panel | Makes the simulation readable and engaging |
| **Event system** | Probabilistic events (protests, crises) driven by instability and config | Emergent feel without scripted story |
| **Data-driven design** | Country config, initial population, event templates as JSON | Enables modding and balance without code changes |
| **Optional 3D lite** | Simple Three.js scene (city map, clickable buildings, motorcade-style movement) | Proof of “you are in the world” without full open world |

### 2.2 Out of scope (for this phase)

- Persistent multiplayer, authoritative server, databases
- Full agent-based AI (each citizen as independent agent with memory)
- AAA 3D open world, Unreal/Unity build
- Real-time global economy across multiple countries
- VR, native mobile clients

---

## 3. Technical Feasibility

### 3.1 Hosting (GitHub Pages)

- **Reality:** Static assets only. No server-side code, no WebSockets from our host.
- **Implication:** All simulation state and logic live in the browser. We can still use external services (e.g. server elsewhere) later without changing the UI contract.

### 3.2 Simulation in the browser

- **CPU:** One main thread. Heavy per-tick work can cause jank.
- **Mitigation:**
  - Keep tick work small: aggregate population math, not 10k individual agent steps per tick.
  - Use worker threads for heavy batches if we add more complex population logic later.
  - Throttle tick rate (e.g. 1 tick = 1 month, run every 2–3 seconds).
- **Verdict:** Feasible for the MVP formulas (GDP, inflation, approval, coup risk, protest/crisis checks).

### 3.3 3D lite (Three.js / WebGL)

- **Reality:** WebGL is widely supported. Three.js keeps scene complexity manageable.
- **Risk:** One detailed city + many entities could hurt performance on low-end devices.
- **Mitigation:** Start with a single simplified city, low poly, minimal draw calls. 3D is an optional “Stage 2” enhancement after the 2D loop is fun.

### 3.4 State and determinism

- **Need:** Reproducibility for balance and debugging (e.g. same seed → same outcomes).
- **Approach:** Centralized state object, pure functions for all simulation math, seeded RNG for events. No reliance on `Math.random()` without a wrapper we control.

---

## 4. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Simulation too slow in browser | Medium | High | Aggregate population model; throttle tick; optional Web Worker |
| Gameplay feels like “spreadsheet” | High | High | Strong UI (charts, events, narrative); optional 3D layer; clear cause→effect feedback |
| Scope creep toward full 3D | High | High | Strict phase gates; 3D only after 2D loop is validated |
| Balance is boring or broken | Medium | Medium | Data-driven constants, easy tuning, optional save/load state |
| No one plays / no feedback | Medium | Medium | Deploy early (GitHub Pages), simple onboarding, shareable links |

---

## 5. Dependencies and Assumptions

- **Dependencies:** React + Vite (or similar) for fast static build; charting library (e.g. Chart.js or lightweight alternative); optional Three.js for 3D.
- **Assumptions:**
  - Single fictional country and one “capital” is enough for MVP.
  - “Month” as the base time unit is sufficient (no need for real-time seconds).
  - We can approximate “citizen” behavior with distributions and sampling (e.g. approval = f(economy, ideology, media)) without full agent simulation.
  - GitHub Pages and static export are the only deployment target for this phase.

---

## 6. Success Criteria (MVP)

1. **Playable loop:** Change policies → see economy and approval react within a few ticks.
2. **Readable state:** GDP, inflation, unemployment, approval, coup risk visible and understandable.
3. **Events:** At least one class of emergent event (e.g. protests) that fires based on simulation state.
4. **Stable:** No crashes; runs on modern browsers; deployable as static site.
5. **Extensible:** Clear separation between engine, models, constants, and UI so we can swap or extend parts later.

---

## 7. What “Achievement” Means Here

We achieve the vision in **stages**:

1. **Stage 1:** Prove the **simulation + policy + UI** loop on GitHub Pages (no 3D).
2. **Stage 2:** Add **3D lite** (simple world, one city, basic “presence”) if Stage 1 is engaging.
3. **Stage 3+:** Use this as a **pitch and design reference** for a future backend or Unreal vertical slice.

The next document (**02-ACHIEVEMENT-ROADMAP.md**) turns this into a concrete phase-by-phase plan and implementation order.
