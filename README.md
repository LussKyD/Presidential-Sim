# Presidential Sim — Web Alpha

**Open-world political power sandbox (web-based alpha).**  
You run policies, the simulation runs the country. Economy, approval, coup risk, and events react in real time. Deployable on GitHub Pages; no backend required.

---

## Docs (start here)

| Document | Purpose |
|----------|---------|
| [**01-PROJECT-ANALYSIS.md**](docs/01-PROJECT-ANALYSIS.md) | Scope, feasibility, risks, success criteria |
| [**02-ACHIEVEMENT-ROADMAP.md**](docs/02-ACHIEVEMENT-ROADMAP.md) | Phases, deliverables, implementation order |
| [**06-FINAL-MISSION-DEV-PLAN.md**](docs/06-FINAL-MISSION-DEV-PLAN.md) | **Final mission:** fully functional + immersive roadmap |
| [**FRAGILE-AREAS.md**](docs/FRAGILE-AREAS.md) | **Do not break:** return-to-office, view transitions (Security/Cabinet/Press, state visit, etc.) |

---

## Vision (summary)

- **Core fantasy:** You are inside power — policies, rallies, motorcades, crises — not managing from a menu.
- **This repo:** Web-based alpha: simulation engine, policy sliders, dashboard, events, 3D Map view, save/load, policy presets.
- **Later:** Full 3D/open world would be a separate client (e.g. Unreal) using the same design.

### What makes this different

- **vs spreadsheet sims** (e.g. Power & Revolution, SuperPower 2): Transparent cause-effect — you see *what* moves approval and coup risk, not just numbers. No “pointless hand-waving”; every lever has visible consequences.
- **vs narrative-heavy games** (e.g. This Is The President): Emergent story from systems — protests, elections, coups and headlines arise from your policies and the model, not one scripted plot. Replayable; each run has a “Your term” summary.
- **vs dry government sims:** Event variety (multiple phrasings for protests, headlines, coups), tick speed control for tension, and a path to 3D immersion later.

---

## Status

- **Current:** **Final mission complete** (see [06-FINAL-MISSION-DEV-PLAN.md](docs/06-FINAL-MISSION-DEV-PLAN.md)). Fully functional: balance pass, save/load, calendar, crises, parliament (table budget), international (state visit), regions. Immersive: State of the Nation 3D (office → motorcade → Parliament chamber → speech → return); state visit 3D (motorcade to airport, return); visit region & launch infra 3D (motorcade to site, return); briefing room (security/cabinet), podium room (press), foreign palace meeting room, residence wing; Budget day 3D chamber beat; full motorcade (lead car, outriders); opposition motion of no confidence & court challenge events. Office, Map, Residence views; event feed, dossiers, term summary.
- **Next:** Polish (UX, copy), balance tuning, more event variety, or optional I5 extras.
- **Safeguards:** Return-to-office (Security Briefing, Cabinet Meeting, Press Conference) and other view transitions are documented in [FRAGILE-AREAS.md](docs/FRAGILE-AREAS.md) and enforced via `.cursor/rules`; avoid changing that behavior without updating both.

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

## Tech

- **Stack:** React, Vite, static export
- **Time:** One tick = one day; 7 days = one month (calendar months).
- **Simulation:** Pure JS (economy, population, politics, crisis, event bus)
- **Charts:** In-app SVG (economy over time)
- **3D:** Three.js — office, palace exterior, Parliament chamber, motorcade (limo, escorts, lead car, bikes), airport, regional site, briefing room, podium room, foreign meeting room, residence wing; Map view (capital); Budget day chamber view.
- **Hosting:** GitHub Pages
