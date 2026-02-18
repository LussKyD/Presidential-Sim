# Presidential Sim — Web Alpha

**Open-world political power sandbox (web-based alpha).**  
You run policies, the simulation runs the country. Economy, approval, coup risk, and events react in real time. Deployable on GitHub Pages; no backend required.

---

## Docs (start here)

| Document | Purpose |
|----------|---------|
| [**01-PROJECT-ANALYSIS.md**](docs/01-PROJECT-ANALYSIS.md) | Scope, feasibility, risks, success criteria |
| [**02-ACHIEVEMENT-ROADMAP.md**](docs/02-ACHIEVEMENT-ROADMAP.md) | Phases, deliverables, implementation order |

---

## Vision (summary)

- **Core fantasy:** You are inside power — policies, rallies, motorcades, crises — not managing from a menu.
- **This repo:** Web-based alpha: simulation engine + policy sliders + dashboard + events. Optional 3D lite later.
- **Later:** This validates the loop; full 3D/open world would be a separate client (e.g. Unreal) using the same design.

---

## Status

- **Current:** Analysis and roadmap complete; implementation not started.
- **Next:** Phase 0 — Vite + React, folder structure, GitHub Pages deploy.

---

## Tech (planned)

- **Stack:** React, Vite, static export
- **Simulation:** Pure JS (economy, population, politics, crisis, event bus)
- **Charts:** Chart.js or lightweight alternative
- **Optional 3D:** Three.js
- **Hosting:** GitHub Pages
