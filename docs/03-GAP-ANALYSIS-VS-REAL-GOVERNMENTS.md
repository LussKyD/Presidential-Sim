# Gap Analysis: Presidential Sim vs Real-Life Governments

**Purpose:** Compare the current simulation to how real governments work (executive, legislature, judiciary, civil service, security, media, subnational, international) and list what’s missing or underdeveloped.

---

## 1. What the Sim Currently Has

| Domain | Current implementation |
|--------|------------------------|
| **Executive** | President at desk; one activity with full flow (State of the Nation). Policies as sliders (no cabinet, no formal “decisions”). |
| **Economy** | GDP, growth, inflation, unemployment; driven by policy sliders (infrastructure, education, defense, police, corruption, money printing, interest rate, press freedom, foreign investment). No budget process, no treasury/cabinet trade-offs. |
| **Population** | Single aggregate: public approval. Drivers: economy, ideology (placeholder), media, corruption. No regions with different moods, no demographics, no parties or coalitions. |
| **Politics** | Coup risk + drivers (military, elite, unrest, foreign). Elections every 4 years (approval → win/lose). No parliament, no opposition, no coalition, no impeachment. |
| **Crises / events** | Protest (by region), economic anxiety, scandal, diplomatic incident, coup, election. Events are probabilistic; no player “response” (e.g. crackdown vs dialogue). |
| **Security** | Policy only: defense spending, police funding → affect coup risk and protest chance. No security council, no briefing, no “deploy” or “restrain” choices. |
| **Media** | Press freedom slider → affects approval. No headlines, no TV content, no spin or narrative. |
| **3D / activities** | Office (first-person), palace exterior, motorcade, parliament (building + chamber), State of the Nation flow. Other activities (cabinet, foreign leader, infrastructure launch, security briefing, press conference) are placeholders. |
| **Geography** | Country name + capital + 5 regions (used only for protest messages). No subnational government, no regional approval or loyalty. |
| **International** | Foreign investment slider; diplomatic incidents (random, small approval hit). No allies, no treaties, no state visits, no UN/regional bodies. |
| **Law / judiciary** | None. No courts, no constitutional review, no election disputes. |
| **Budget** | No explicit budget. Sliders are “policy levels,” not allocation of a finite budget (e.g. 100% shared across ministries). |
| **Time** | 1 tick = 1 month. No “day” or “agenda”; no cabinet calendar or scheduled events. |

---

## 2. What Real Governments Have (Reference)

### 2.1 Executive

- **Head of state / government** with a **cabinet** (ministers with portfolios).
- **Daily/weekly agenda**: briefings, cabinet meetings, bilateral meetings, ceremonies, travel.
- **Decision types**: policy directives, appointments, pardons, decrees, signing/vetoing bills.
- **State House / PMO**: chief of staff, advisors, communications, legal, protocol.
- **Set-piece events**: state of the nation, budget speech, opening of parliament, national day, funerals, summits.

### 2.2 Legislature

- **Parliament / congress**: two chambers in many countries (e.g. National Assembly + Senate).
- **Roles**: pass laws, approve budget, confirm appointments, oversight (question time, committees, inquiries).
- **Majority vs opposition**: government needs majority or coalition; opposition can block, amend, expose.
- **Legislative cycle**: bill tabled → committee → debate → vote → assent/veto. Budget: treasury tables → committees → vote.
- **Your relationship**: you propose; they approve or reject. No current sim of “parliament blocks your bill” or “opposition tables motion of no confidence.”

### 2.3 Judiciary

- **Courts**: constitutional review, election petitions, criminal trials of officials, human-rights cases.
- **Effects**: rulings can void your policy, order compensation, or validate/invalidate elections.
- **No representation in sim**: no courts, no judges, no legal challenges.

### 2.4 Civil Service / Bureaucracy

- **Ministries and agencies**: implement policy, run programs, procure, hire.
- **Budget execution**: annual budget → allocations → spending. Overspend/underspend, reallocations, supplementary budgets.
- **Corruption / leakage**: procurement scandals, ghost workers, kickbacks (you have “corruption level” but not as a process).
- **Capacity**: weak institutions = poor implementation even if policy is good. Not modeled.

### 2.5 Security Apparatus

- **Police, military, intelligence**: separate institutions with different mandates.
- **Security council / NSC**: president + defense, interior, intelligence, foreign — crisis decisions (deploy, negotiate, declare emergency).
- **Use of force**: protests → choice of restraint vs crackdown; each has political cost. Not in sim (protests just lower approval).
- **Loyalty**: military/party loyalty over time (you have shocks: commanderLoyalty, ethnicAlignment) but no explicit “briefing” or “purge” actions.

### 2.6 Media and Public Narrative

- **News cycle**: headlines, breaking news, investigative stories, leaks.
- **Framing**: same event can be “firm hand” vs “brutality” depending on press freedom and your relationship with media.
- **Press conferences, interviews, social media**: you try to shape narrative. Sim has no “address the nation” or “press conference” outcome beyond State of the Nation.

### 2.7 Subnational Government

- **Provinces / counties / states**: own budgets, own elections, own parties.
- **Intergovernmental relations**: transfers, disputes, coalition-building (e.g. opposition governor vs you).
- **Regional variation**: approval, unrest, and loyalty can differ by region. Sim has regions only for protest text.

### 2.8 Political Parties and Coalitions

- **Party structure**: ruling party, opposition parties, factions within party.
- **Coalitions**: need X% to govern; trade cabinet seats, budgets, or policy for support.
- **Party discipline**: backbenchers revolt, leadership challenges. Not in sim.
- **Elections**: you have “election every 4 years, approval → win/lose.” Real life: campaigns, swing regions, rigging allegations, court challenges.

### 2.9 Budget and Fiscal Process

- **Annual budget**: revenue (tax, aid, debt) and expenditure (ministries, debt service, contingency).
- **Trade-offs**: more defense → less health, or more debt. You have sliders but not a single pie (e.g. 100% to split).
- **Parliament approves**: budget can be amended or rejected. Not modeled.

### 2.10 International

- **Bilateral relations**: allies, rivals, neutrals; state visits, aid, sanctions.
- **Multilateral**: UN, regional bodies, climate, trade agreements.
- **Crises**: border incident, refugee flow, trade war, sanctions on you. You have “diplomatic incident” as a random event only.

### 2.11 Time and Calendar

- **Calendar**: fixed events (e.g. budget day, opening of parliament, elections). Ad hoc: crises, summits, scandals.
- **Agenda**: what you do this “week” or “month” (briefing, cabinet, travel, speech). Sim: only State of the Nation is a scheduled activity; rest is passive tick.

---

## 3. Gaps (What We Are Missing vs Real Life)

### 3.1 High impact (core to “government feel”)

| Gap | Real life | Sim now | Suggestion |
|-----|-----------|---------|------------|
| **Legislature as actor** | Parliament passes/amends/rejects laws and budget | Parliament is a building; you only give a speech | Add “parliament support” or “majority”; bills/budget can be rejected or amended; opposition can table motions. |
| **Budget as a pie** | Finite revenue; allocation across ministries | Independent sliders per policy | Single “budget” (e.g. 100%) split across categories; or revenue vs expenditure so debt is explicit. |
| **Cabinet / ministers** | Ministers with portfolios; you chair cabinet | No cabinet; you are the only decision-maker | Cabinet meeting activity; “assign minister” or “policy area” so some decisions feel delegated or contested. |
| **Crisis response** | You choose: negotiate, crack down, reshuffle, address nation | Events happen; you only watch approval change | When protest/crisis fires: modal or activity “How do you respond?” (e.g. dialogue / deploy / ignore) with different approval/coup effects. |
| **Scheduled calendar** | Budget day, opening of parliament, elections on fixed dates | Only elections at 4-year mark; State of the Nation on demand | Calendar: e.g. Month 3 = budget tabled; Month 6 = opening; Month 12 = year-end. Optional “must do” activities. |

### 3.2 Medium impact (depth and variety)

| Gap | Real life | Sim now | Suggestion |
|-----|-----------|---------|------------|
| **Opposition / parties** | Named opposition; polls; coalition math | None | Opposition “strength” or “leader”; election uses approval vs opposition; optional coalition threshold. |
| **Regional variation** | Approval and unrest differ by region | Regions only in protest text | Per-region approval or loyalty; some events only in certain regions; “go to North” style visits. |
| **Media as content** | Headlines, TV segments, leaks | Press freedom affects number only | Event feed as “headlines”; TV in office shows top story; optional “press conference” activity that sets next headline. |
| **Judiciary** | Courts rule on laws, elections, rights | None | Optional: “court challenge” event; ruling can delay a policy or trigger re-vote; low frequency. |
| **International relations** | Allies, summits, state visits, sanctions | Diplomatic incident only | “Relations” with 2–3 blocs or countries; “Meet foreign leader” improves relation; sanctions/ally support affect economy or coup risk. |
| **More activities with outcomes** | Many set-pieces (summit, ribbon-cutting, funeral) | Only State of the Nation has flow + outcome | Implement 2–3 more: Cabinet meeting (policy trade-off or unity), Launch infrastructure (approval in region), Press conference (narrative/approval). |

### 3.3 Lower impact (polish and realism)

| Gap | Real life | Sim now | Suggestion |
|-----|-----------|---------|------------|
| **Subnational government** | Governors, mayors, local councils | None | Optional “governors” per region; loyalty or alignment; they can support or undermine you. |
| **Appointments** | You appoint ministers, judges, envoys | None | Optional: appoint “defense minister” (affects military loyalty), “central bank governor” (affects inflation credibility). |
| **Debt and revenue** | Explicit debt, tax base, aid | Only GDP; no debt | Optional: debt ratio; interest; “austerity vs stimulus” as a trade-off. |
| **Election campaign** | Campaigning, swing regions, rigging claims | Single roll vs approval | Optional: campaign “spend” or “events”; regional swings; post-election dispute (court or protest). |
| **Narrative / ideology** | “Left/right,” “strongman,” “reformer” | Ideology placeholder (0.5) | Optional: player “stance” or chosen narrative; affects which groups approve and what media says. |

---

## 4. Prioritized Roadmap (Suggested Order)

1. **Parliament as actor** — Parliament support / majority; “table budget” or “table bill” can be accepted/amended/rejected; affects approval and stability.
2. **Budget as allocation** — Single budget pie or revenue vs expenditure so choices are explicit trade-offs.
3. **Crisis response** — When protest/crisis triggers, player chooses response (dialogue / crackdown / reshuffle / address nation) with different outcomes.
4. **Cabinet meeting activity** — 3D flow + outcome: e.g. agree on policy direction, or “minister disagrees” with small approval/coup effect.
5. **Calendar** — Fixed dates for budget, opening of parliament, elections; optional “due” activities.
6. **Opposition / parties** — Opposition strength; election = you vs opposition (and maybe coalition math).
7. **Regional approval / unrest** — Per-region stats; some events regional; optional “visit region” activity.
8. **Media as headlines** — Event feed as “front page”; TV in office shows current headline; optional press conference to try to set narrative.
9. **International** — 2–3 “relations”; “Meet foreign leader” and diplomatic incidents change them; relations affect economy or coup risk.
10. **More activities** — Launch infrastructure, Press conference, Security briefing with simple flows and outcomes.

---

## 5. Summary Table

| Real-life pillar | In sim? | Priority to add |
|------------------|---------|------------------|
| Executive (you at desk, activities) | Partial (1 activity) | More activities; cabinet |
| Legislature (parliament as actor) | Building only | High — support, bills, budget vote |
| Judiciary | No | Low — optional court events |
| Civil service / bureaucracy | Implicit in “policy” | Low — optional capacity/corruption process |
| Security (council, use of force) | Policy only | Medium — crisis response; security briefing |
| Media (headlines, narrative) | Slider only | Medium — headlines; press conference |
| Subnational (regions, governors) | Regions in text only | Medium — regional approval; optional governors |
| Parties / opposition / coalition | No | Medium — opposition; election depth |
| Budget (finite pie, process) | No | High — allocation or revenue/expenditure |
| International (allies, visits) | Random incident | Medium — relations; state visit |
| Calendar (fixed events) | Elections only | Medium — budget day, opening, etc. |
| Crisis response (your choice) | No | High — respond to protests/crises |

---

## 6. Implemented (post–gap analysis)

| Feature | Status |
|--------|--------|
| **Parliament as actor** | Parliament support (0–1) drifts with approval. "Table budget" triggers a vote: accept / amend / reject with different approval and coup effects. |
| **Budget as allocation** | Infrastructure, Education, Defense, Police form one pie (sum = 1). Sliders renormalize; presets use `setBudgetPie`. |
| **Crisis response** | Protest and scandal can set `crisis.pendingResponse`. Modal: player chooses (e.g. dialogue / crackdown / ignore / address nation for protest; deny / investigate / ignore for scandal). Outcomes affect approval and coup risk. |
| **Calendar** | Budget month (3) and Opening of Parliament (6). In budget month, "Budget day" event and "Table budget in Parliament" button until tabled. Opening event in month 6. |
| **Cabinet meeting** | Desk activity: "Cabinet meeting" with 6‑month cooldown. Outcome (unity vs disagreement) based on approval; small approval change and event. |
| **State address flow** | Motorcade stops in front of Parliament (not inside). Player advances each step: walk to cars → board motorcade → at Parliament → enter → speech → leave chamber → motorcade back → return to office. |

### 6.1 Still missing (next priorities)

- **Opposition / parties** — Named opposition strength; election vs opposition; coalition threshold.
- **Regional variation** — Per-region approval or loyalty; regional events; optional "visit region" activity.
- **Media as headlines** — Event feed as front page; TV in office shows headline; press conference to set narrative.
- **International** — 2–3 relations; "Meet foreign leader" flow; relations affect economy/coup.
- **Judiciary** — Optional court events (e.g. election dispute, constitutional challenge).
- **More activities** — Full 3D flows for: Launch infrastructure, Security briefing, Press conference.

This doc can be updated as features are added or scope is re-prioritized.
