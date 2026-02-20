# Final Mission — Dev Plan: Fully Functional & Immersive

**Goal:** Make Presidential Sim **fully functional** (no gaps in core loops, clear cause-effect, balanced) and **immersive** (you *see* and *do* set-piece events — motorcades, rooms, travel — not just popups). This doc is the single roadmap for that “final mission.”

---

## 1. What “Fully Functional” Means

| Area | Target state |
|------|-----------------------------|
| **Core loop** | Policies → economy/approval/coup → events → player response → consequences. No dead ends; every lever has visible effect. |
| **Balance** | Reasonable play survives 1–2 terms; extreme policies (max corruption, zero police) lead to coup/protest within a few years. Presets (Liberal/Conservative/Authoritarian) feel distinct. |
| **Save/load** | Robust. No broken state after load; cooldowns and calendar correct; no “tick = month” vs “tick = day” drift. |
| **Calendar & time** | Budget day, Opening of Parliament, elections, cooldowns all correct. Date (month name + day 1–7 + year) consistent everywhere. |
| **Crises** | Protest + scandal both have player response (dialogue/crackdown/ignore/address; deny/investigate/ignore). Outcomes feed back into approval, regions, opposition. |
| **Parliament** | Table budget → vote (pass/amend/reject) with clear consequences. Opposition strength affects election. |
| **International** | Three countries; relations drift; state visit improves relations. Diplomatic incidents hurt a random relation. |
| **Regions** | Five regions; approval per region; visit region / launch infra target one region; protests hit a region. |

**Gaps to close for “fully functional”:**

- **Balance pass** — Tune constants (protest chance, coup threshold, approval drivers) so the game is challenging but not instant death; document “intended feel” per difficulty if we add it.
- **Edge cases** — Load during state visit / security briefing / etc.; ensure phase state is restored or cleanly reset.
- **Copy consistency** — All UI says “day” not “month” where we mean one tick; README and How to play stay in sync.

---

## 2. What “Immersive” Means

From **04-IMMERSION-VISION.md** and **05-VISION-LIST-REAL-LIFE.md**:

- **Activities = multi-step flows**, not one click. Each major activity has phases (narrative cards and/or 3D) with **Continue**.
- **3D where it matters:** office, motorcade, Parliament, chamber. Later: airport, plane, foreign palace, cabinet room, briefing room, podium, regional site.
- **You are in the world:** camera in office, in motorcade, in chamber; optional “walk to cabinet room,” “security opens door.”

**Already done:**

- State of the Nation: full 3D (office → cars → motorcade → Parliament → chamber → speech → back).
- State visit: multi-phase **narrative** flow (handover → motorcade to airport → flight → arrival → meeting → return).
- Visit region, security briefing, press conference, launch infrastructure: **narrative** flows (phases + Continue).
- Office + palace exterior + 3 cars + Parliament + chamber; Map view; TV headlines; dossiers.

**Immersive upgrades (in order of impact vs effort):**

1. **State visit: 3D to airport + plane beat** — Replace “motorcade to airport” and “in flight” narrative cards with 3D: same motorcade scene to a new “airport” destination; then a simple plane interior or window view + “Continue.” Unlocks “you see the trip” without building a full foreign capital yet.
2. **Airport as 3D location** — One new location: tarmac or VIP lounge, red carpet optional. Used for state visit departure and return. Optional: plane stairs + wave (camera beat).
3. **Cabinet / Security / Press as 3D rooms** — One “briefing room” or “cabinet room” and one “podium” scene. Reuse for cabinet meeting, security briefing, press conference (different labels/copy). Player “in” the room; outcome as now.
4. **Visit region & Launch infra: 3D motorcade to “region”** — Reuse motorcade; destination = “North” or site (simple landmark). One beat at site (rally / ribbon-cutting), then return. No need for full regional map.
5. **Foreign palace meeting: 3D room** — One generic “palace room” for the bilateral meeting. Host leader name/country; outcome (relations) as now.
6. **Polish** — News events during state visit (“President departs for X,” “Summit in Y”); deputy-in-charge: one random event while away; “headlines per activity” in event feed.

---

## 3. Phased Dev Plan

### Phase F1 — Fully Functional (stability & balance) ✅ Done

**Goal:** No broken states; clear, consistent UX; balanced difficulty.

| # | Task | Notes |
|---|------|--------|
| F1.1 | **Balance tuning** | Adjust protest chance, coup threshold, approval/coup drivers so “normal” play can last 1–2 terms; document target numbers. |
| F1.2 | **Save/load edge cases** | Done: save = engine state only; activity phases not persisted; on load player is at desk (useSimulation comment). |
| F1.3 | **Copy & UX pass** | All “Step day,” “one tick = one day”; tooltips consistent; How to play and README aligned. |
| F1.4 | **Optional: difficulty or presets** | “Normal” vs “Hard” (stricter thresholds) or rely on presets only; keep scope small. |

**Outcome:** Game is stable, understandable, and winnable/loseable in an intentional way.

---

### Phase I1 — Immersive: State visit 3D (travel & airport)

**Goal:** State visit feels like a trip: you see motorcade to airport and a plane beat.

| # | Task | Notes |
|---|------|--------|
| I1.1 | **Motorcade to airport (3D)** | Reuse motorcade path; new destination “airport” (position + label). State visit phase “Motorcade to airport” drives camera along this path; then “At airport” or “Board plane.” |
| I1.2 | **Airport as 3D location** | Simple block or plane + tarmac; camera at “airport” for departure and return. Optional: plane stairs (camera moves to stairs, short beat, “Continue”). |
| I1.3 | **Plane beat** | Either (a) simple 3D plane interior (desk, window) or (b) narrative card with “In flight — brief meeting” and window/placeholder art. “Continue” → next phase. |
| I1.4 | **Return: airport → palace** | Motorcade from airport back to palace (reuse path reverse); then walk to office. |

**Outcome:** State visit has 3D travel to/from airport and a clear “in flight” beat; foreign meeting can stay narrative for now.

---

### Phase I2 — Immersive: Domestic activities in 3D rooms

**Goal:** Cabinet, security briefing, press conference happen in visible rooms.

| # | Task | Notes |
|---|------|--------|
| I2.1 | **One “briefing/cabinet” room** | Single 3D room (table + chairs or intel screen). Used for: cabinet meeting, security briefing. Camera in room; phase labels and outcome text as now. |
| I2.2 | **One “podium” room** | Press conference: camera at podium, “Q&A” and headline outcome. |
| I2.3 | **Flow: desk → room → outcome** | From office, “Walk to briefing room” (or short cut) → room view → outcome card → back to office. Same pattern for podium. |

**Outcome:** No popup-only activities; player is “in” the room for each.

---

### Phase I3 — Immersive: Visit region & Launch infra 3D

**Goal:** Regional visit and infrastructure launch use 3D motorcade to a “site.”

| # | Task | Notes |
|---|------|--------|
| I3.1 | **Motorcade to region/site** | Reuse motorcade; destination = “North” / “Site” (one generic landmark or label). Visit region and Launch infra share this. |
| I3.2 | **One “site” beat** | At destination: rally (visit region) or ribbon-cutting (launch infra). Simple 3D or narrative card with backdrop. |
| I3.3 | **Return motorcade** | Back to palace → office. |

**Outcome:** Visit region and Launch infrastructure use 3D motorcade to/from site; site beat remains narrative. ✅

---

### Phase I4 — Immersive: Foreign meeting & polish

**Goal:** Bilateral meeting in a “foreign palace” room; news and deputy during trip.

| # | Task | Notes |
|---|------|--------|
| I4.1 | **Foreign palace meeting room** | One 3D room (different tone: flag, style). State visit “Meeting” phase shows this room; host country name; outcome (relations) as now. |
| I4.2 | **News during state visit** | Event feed entries: “President departs for Norden,” “Arrival in Sudland,” “Summit concludes.” Optional: TV ticker. |
| I4.3 | **Deputy-in-charge** | While abroad, one random event “deputy handled X”; small outcome (already partially done per vision doc). |

**Outcome:** State visit end-to-end immersive; foreign palace 3D room + news events (depart, arrival, summit concludes). Done.

---

### Phase I5 (optional) — Deeper immersion

**Goal:** Extra realism; lower priority.

| # | Task | Notes |
|---|------|--------|
| I5.1 | **Full motorcade** | Done: lead security car + 2 motorcycle outriders; follow path in all motorcade phases. |
| I5.2 | **Palace: multiple rooms** | Done: residence wing 3D room (bed, table, lamp); Sidebar "Residence" view. Briefing/cabinet and podium already separate rooms. |
| I5.3 | **Opening of Parliament / Budget day** | Optional short 3D beat in chamber (speech or ceremony). |
| I5.4 | **Opposition motion / judiciary** | Optional events (motion of no confidence; court challenge); see vision list. |

---

## 4. Implementation Order (Summary)

1. **F1** — Fully functional: balance, save/load, copy/UX.
2. **I1** — State visit 3D: motorcade to airport, airport, plane beat, return.
3. **I2** — Domestic 3D rooms: briefing/cabinet, podium.
4. **I3** — Visit region & Launch infra: 3D motorcade to site, site beat, return.
5. **I4** — Foreign meeting room, news during trip, deputy-in-charge.
6. **I5** (optional) — Motorcade detail, palace rooms, calendar 3D beats, opposition/judiciary.

---

## 5. Success Criteria for “Final Mission”

- **Functional:** A new player can play 30–60 minutes, understand policies and approval/coup, survive or lose for clear reasons, and save/load without bugs.
- **Immersive:** State of the Nation, state visit, visit region, launch infra, security briefing, press conference, and cabinet all have either 3D or clear multi-step narrative; no “one click = done” for major activities.
- **Documentation:** README and vision docs reflect current state; this plan is the single “final mission” roadmap and is updated as items are completed.

---

## 6. References

- **01-PROJECT-ANALYSIS.md** — Scope, risks, success criteria.
- **02-ACHIEVEMENT-ROADMAP.md** — Phases 0–6 (done).
- **03-GAP-ANALYSIS-VS-REAL-GOVERNMENTS.md** — What real governments have vs sim.
- **04-IMMERSION-VISION.md** — Activities as experiences, not popups; state visit phases.
- **05-VISION-LIST-REAL-LIFE.md** — Done vs “to implement later” by category; suggested order.

Update this doc as phases are completed or priorities change.
