# Vision List — Real-Life Scenarios & Implementation Checklist

**Purpose:** One place for what we have done and what we will implement later, aligned with real-life government practice and the research in **03-GAP-ANALYSIS-VS-REAL-GOVERNMENTS.md** (executive, legislature, security, international, media, etc.). Use this as the “implement later” checklist.

**Principle:** Deep immersion = we *see* and *do* (3D/camera, interactable steps), not just read popups. Reference: real heads of state from ~1800s onward — palaces, motorcades, protocol, set-piece events, travel, security.

---

## 1. What We Have Done (Current State)

| Done | Real-life alignment |
|------|---------------------|
| **State of the Nation** — Full 3D flow: office → walk to cars → motorcade → Parliament (stop in front) → enter chamber → speech → leave → motorcade back → office | Set-piece event: head of state addresses legislature (budget speech, opening of parliament, state of the nation). Real governments: fixed calendar, motorcade, chamber, speech, return. |
| **State visit (foreign trip)** — Multi-phase flow: handover → motorcade to airport → flight → arrival → motorcade to foreign palace → meeting → return flight → office. Narrative cards + Continue; outcome (relations) at meeting. | Bilateral state visits: handover to deputy, travel, arrival ceremony, meeting at host palace, return. Real life: red carpet, honor guard, plane stairs, in-flight briefings. We have the *sequence*; 3D scenes to be added. |
| **Parliament as actor** — Support, table budget, vote (accept/amend/reject), opposition strength | Legislature passes/amends/rejects budget and laws; majority vs opposition (gap analysis 2.2, 3.1). |
| **Budget as pie** — Single allocation across Infrastructure, Education, Defense, Police | Finite budget, trade-offs across ministries (gap 2.9, 3.1). |
| **Crisis response** — Player chooses: dialogue / crackdown / ignore / address nation (protest); deny / investigate / ignore (scandal) | Real governments choose how to respond to protests and scandals; different political costs (gap 2.5, 3.1). |
| **Calendar** — Budget month, Opening of Parliament, elections every 4 years | Fixed calendar events (gap 2.11, 3.1). |
| **Cabinet meeting** — Desk activity, cooldown, outcome (unity vs disagreement) | Cabinet with portfolios; you chair; set-piece meeting (gap 2.1, 3.1). |
| **International relations** — Three countries (Norden, Sudland, Eastalia), relations drift, diplomatic incidents, “Meet foreign leader” (state visit flow above) | Bilateral relations, state visits, summits (gap 2.10, 3.2). |
| **Opposition** — Strength drifts; elections = you vs opposition | Parties, opposition, coalition math (gap 2.8, 3.2). |
| **Regional approval** — Five regions, per-region approval; protests hit region; crisis response affects region | Subnational variation; regional loyalty (gap 2.7, 3.2). |
| **Visit region** — Desk activity: pick region → multi-phase flow (depart → motorcade → in region rally → return). Narrative cards + Continue; outcome: regional approval +6%, small national approval nudge; 6‑month cooldown. | Heads of state visit regions for rallies, meetings; “go to North” style (gap 2.7, 3.2, 2.4). Flow first; 3D motorcade to region later. |
| **Security briefing** — Desk activity: multi-phase flow (enter briefing room → review intel → decision). Narrative cards + Continue; outcome: coup risk −2%, event; 6‑month cooldown. | Security council / NSC; intel and threat posture (gap 2.5, 3.2). Flow first; 3D briefing room later. |
| **Press conference** — Desk activity: multi-phase flow (prep → podium → Q&A → headline). Narrative cards + Continue; outcome: approval +2% if approval ≥ 45% else −1%, event; 6‑month cooldown. | Shape narrative; same event framed differently (gap 2.6, 3.2). Flow first; 3D podium later. |
| **Launch infrastructure** — Desk activity: pick region → multi-phase flow (depart → motorcade → at site → ribbon-cutting → return). Narrative cards + Continue; outcome: regional +5%, national +1.5%, event; 6‑month cooldown. | Set-piece: opening of project, regional approval (gap 3.2, 2.4). Flow first; 3D site visit later. |
| **Media as headlines** — Event feed as “front page”; quad-panel TV in office (TV4, NATV, DEFENCE TV, INI TV) | News cycle, framing (gap 2.6, 3.2). |
| **Office + palace exterior + motorcade (3 cars) + Parliament building + chamber** | Residence + motorcade + legislature as physical spaces. Real life: larger palace, full motorcade composition, security. |
| **Time: 7 days per month** — One tick = one day; each month has 7 substantial days. UI shows month name + day (e.g. "January, Day 1, 2026"). **Date display:** Month names (January–December), Day 1–7, year; `formatGameDate()` in `utils/dateFormat.js`. **Deputy in charge:** On return from state visit, one event: "While you were away, your deputy handled a minor domestic issue. Calm maintained." | “Day X · M/Y”. | Day-level granularity; date as month name + Day 1–7 + year; deputy handles one event on return from state visit (gap 2.1, 2.3). |

---

## 2. To Implement Later — By Category

### 2.1 Palace & residence (real life: bigger than one office)

| Item | Real-life / research alignment | Notes |
|------|-------------------------------|--------|
| **Multiple rooms** — Cabinet room, briefing room, residence wing, reception halls | Executive: “State House / PMO,” daily agenda, briefings, ceremonies (gap 2.1). | Player walks between rooms; security opens doors. |
| **Security opening doors** — Building and car doors opened by security | Protocol: security detail, access control. | Interactable: door opens as you approach or on cue. |
| **Staff / protocol** — Chief of staff, advisors, visible (or named) in palace | “Chief of staff, advisors, communications, legal, protocol” (gap 2.1). | Optional: NPCs in corridors or briefing room. |
| **TV / press in residence** — News on screens in different rooms | Media as content (gap 2.6). | Reuse or extend current TV headline idea. |

### 2.2 Motorcade & transport (real life: not just 3 cars)

| Item | Real-life / research alignment | Notes |
|------|-------------------------------|--------|
| **Full motorcade composition** — Lead bikes, ambulances, special forces / security vehicles, main limo, follow cars | Real motorcades: outriders, medical, counter-assault, decoys. | 3D: more vehicles in convoy; variety in models/labels. |
| **Motorcade to airport** — Same 3D standard as motorcade to Parliament | State visit: travel from palace to airport. | Reuse motorcade scene; destination = airport instead of Parliament. |
| **Airport as location** — Tarmac, terminal or VIP lounge, red carpet, honor guard | Arrival/departure ceremonies: red carpet, guard of honour. | New 3D scene or extended “city” with airport. |
| **Plane stairs — climb and wave** — President climbs stairs to plane, turns and waves at top before entering | Standard photo-op at every state departure/arrival. | Interactable animation or camera beat. |
| **Plane interior** — Office on plane, brief meeting in flight | “Air Force One” style: working space, briefings en route. | New interior scene; optional “briefing” or “rest” beat. |
| **Takeoff / landing** — Visible or implied (e.g. window view, time-skip with caption) | Travel is a real phase of state visit. | Can be short 3D or narrative + time skip. |

### 2.3 State visit / foreign trip (full immersion)

| Item | Real-life / research alignment | Notes |
|------|-------------------------------|--------|
| **See president go to airport** — Same as “see president go to Parliament” (3D walk, motorcade) | State visit starts at palace, ends at airport. | Replace narrative card with 3D motorcade to airport. |
| **Government lounge at airport** — Meet domestic leaders/officials before departure | Protocol: send-off, last-minute briefings. | 3D: lounge scene; optional dialogue or headline. |
| **Red carpet / walk of honour** — At airport (departure and return) and at host country | Honour guard, red carpet at every official arrival/departure. | 3D: carpet, guard, walk toward plane or toward host. |
| **Greeting leaders at stairs** — Host or officials greet at foot of stairs or on tarmac | Bilateral protocol. | Interactable: handshake, then climb. |
| **Climb plane stairs, wave at top** — Before entering plane | Standard imagery for state travel. | Single clear beat; then enter plane. |
| **In-plane: office, takeoff, brief meeting** | Working in flight; briefings; rest. | Interactable beats inside plane. |
| **Arrival abroad** — Landing, reception at airport, honour guard, motorcade to host palace | Same as 2.2 but at foreign capital. | New or variant 3D for “foreign” airport/palace. |
| **Meeting at foreign palace** — Room, host leader, outcome (already in logic) | Bilateral meeting at seat of government (gap 2.10). | 3D: palace room, seated meeting, then outcome. |
| **Optional: embassy visit** — Side beat in host country or at their embassy at home | Cultural/diplomatic side programmes. | Phase + narrative or simple 3D. |
| **News events during trip** — Headlines: “President in X,” “Summit concludes” | Media cycle (gap 2.6). | Event feed + optional TV ticker. |
| **Deputy in charge** — Small mechanic: deputy handles one event while you’re away | Handover of power during travel (gap 2.1). | Optional: one random event “deputy decides” with simple outcome. |

### 2.4 Domestic activities (flows, not popups)

| Item | Real-life / research alignment | Notes |
|------|-------------------------------|--------|
| **Cabinet meeting** — Walk to cabinet room, sit, agenda items, outcome | Cabinet with portfolios; you chair (gap 2.1, 3.1). | Upgrade from one modal to short 3D flow. |
| **Launch infrastructure (3D site)** — Currently narrative flow; upgrade to 3D motorcade to site, ribbon-cutting | Set-piece (gap 3.2). | Replace narrative with 3D site visit. |
| **Security briefing (3D room)** — Currently narrative flow; upgrade to 3D briefing room, intel screen, decision | Security council (gap 2.5). | Replace narrative with 3D briefing room scene. |
| **Press conference (3D podium)** — Currently narrative flow; upgrade to 3D podium, Q&A beats | Shape narrative (gap 2.6). | Replace narrative with 3D briefing room / podium scene. |
| **Visit region (3D motorcade)** — Currently narrative flow; upgrade to 3D motorcade to region, rally beat, return | Regional approval (done as narrative flow); real life: motorcade to region. | Replace narrative “motorcade” step with actual 3D motorcade to region location. |
| **Opening of Parliament** — Calendar event; optional flow: attend, speech | Fixed calendar (gap 2.11). | Can reuse Parliament chamber + short speech. |
| **Budget day** — Calendar; table budget (already in logic); optional ceremony | Budget process (gap 2.9, 3.1). | Optional: short beat in Parliament or office. |

### 2.5 Security & protocol

| Item | Real-life / research alignment | Notes |
|------|-------------------------------|--------|
| **Security opening doors** — Buildings, cars | Protocol and access control. | See 2.1. |
| **Visible security detail** — In motorcade, at palace, at airport | Real heads of state have visible protection. | NPCs or vehicles in scenes. |
| **Use of force in crisis** — Already have crisis response; optional “security council” room | NSC-style decisions (gap 2.5). | Optional: dedicated briefing room for crisis. |

### 2.6 Media & narrative

| Item | Real-life / research alignment | Notes |
|------|-------------------------------|--------|
| **Headlines per activity** — State visit, speech, crisis each generate headlines | News cycle (gap 2.6). | Extend event feed; optional “today’s headline” per activity. |
| **TV in multiple rooms** — Same headline system in office, lounge, plane | Media as content. | Reuse TV component in new scenes. |

### 2.7 Legislature & calendar

| Item | Real-life / research alignment | Notes |
|------|-------------------------------|--------|
| **Parliament calendar** — Opening, budget vote, question time (optional) | Legislative cycle (gap 2.2, 2.11). | Already have budget and opening; optional question time event. |
| **Opposition tables motion** — Optional event: motion of no confidence, you respond | Majority vs opposition (gap 2.2, 6.1). | Event + response choice. |

### 2.8 International (depth)

| Item | Real-life / research alignment | Notes |
|------|-------------------------------|--------|
| **Treaties / sanctions** — Optional: sign treaty, impose sanctions (affects relations and economy) | Bilateral and multilateral (gap 2.10). | Engine: new state; UI: choice in meeting or desk. |
| **Multilateral** — UN or regional body (optional, low priority) | Gap 2.10. | Optional later. |

### 2.9 Judiciary & appointments (optional, lower priority)

| Item | Real-life / research alignment | Notes |
|------|-------------------------------|--------|
| **Court challenge** — Event: law or election challenged; ruling affects policy or re-vote | Judiciary (gap 2.3, 3.2). | Rare event + outcome. |
| **Appointments** — Appoint minister, central bank governor (affects loyalty or credibility) | Gap 3.3. | Optional: pick from list; small stat effect. |

---

## 3. Implementation Order (Suggested)

1. **Motorcade & airport** — Full motorcade composition (bikes, ambulance, etc.); motorcade to airport; airport as 3D location; plane stairs + wave; plane interior (office, takeoff, brief meeting). Unlocks full state-visit 3D.
2. **Palace** — Multiple rooms (cabinet, briefing), security opening doors.
3. **State visit abroad** — Arrival at foreign airport, red carpet, motorcade to foreign palace, meeting room 3D; optional embassy beat.
4. **Domestic activities** — Cabinet (done), Security briefing (narrative flow done), Launch infrastructure, Press conference as flows (3D or narrative steps).
5. **Visit region 3D** — Motorcade to region in 3D (narrative flow done), one beat, return.
6. **Polish** — News during trip, deputy-in-charge mechanic, headlines per activity.
7. **Optional depth** — Opposition motion, judiciary, appointments, treaties.

---

## 4. Summary

- **Done:** State of the Nation (full 3D), state visit (phase sequence + narrative cards), parliament as actor, budget pie, crisis response, calendar, cabinet meeting, international relations, opposition, regional approval, visit region, security briefing, press conference, **launch infrastructure** (pick region → narrative flow, regional +5%, national +1.5%, 6‑month cooldown), media headlines (quad-panel TV in office), office + palace + motorcade (3 cars) + Parliament. All desk activities now have flows.
- **Implement later:** Palace (multiple rooms, security, doors), full motorcade (bikes, ambulance, special forces), airport, state visit 3D abroad, launch infrastructure 3D (site visit), visit region 3D, security briefing 3D, press conference 3D, deputy-in-charge, and optional judiciary/opposition/appointments/treaties. **News during state visit:** departure and arrival events now push to the feed/TV (engine `addEvent`); optional: more beats during trip.

This doc is the **vision list** for real-life-aligned, deep immersion; update it as we implement each item.
