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

### What makes this different

- **vs spreadsheet sims** (e.g. Power & Revolution, SuperPower 2): Transparent cause-effect — you see *what* moves approval and coup risk, not just numbers. No “pointless hand-waving”; every lever has visible consequences.
- **vs narrative-heavy games** (e.g. This Is The President): Emergent story from systems — protests, elections, coups and headlines arise from your policies and the model, not one scripted plot. Replayable; each run has a “Your term” summary.
- **vs dry government sims:** Event variety (multiple phrasings for protests, headlines, coups), tick speed control for tension, and a path to 3D immersion later.

---

## Status

- **Current:** Phase 0 complete — Vite + React, full folder structure, placeholder engine/UI, GitHub Actions deploy.
- **Next:** Phase 1 — Simulation engine core (economy, population, politics, time, event bus).

---

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. For correct asset paths when testing the built site locally, run `npm run build` then `npm run preview` (serves with base `/Presidential-Sim/`).

---

## Deploy (GitHub Pages)

1. In repo **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Push to `main`; the workflow builds and deploys. Live site: `https://lusskyd.github.io/Presidential-Sim/`.

---

## Tech (planned)

- **Stack:** React, Vite, static export
- **Simulation:** Pure JS (economy, population, politics, crisis, event bus)
- **Charts:** Chart.js or lightweight alternative
- **Optional 3D:** Three.js
- **Hosting:** GitHub Pages
