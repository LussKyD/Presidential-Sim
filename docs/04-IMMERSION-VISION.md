# Immersion Vision — Activities Are Experiences, Not Popups

**Principle:** The game should feel like *you are in power* — motorcades, meetings, state visits — not like clicking through spreadsheets. Activities that are only a single popup (e.g. “Meet foreign leader” → pick country → done) go against this.

---

## 1. Target: What “Immersive” Means

For **State of the Nation** we already do it right: you walk to the cars, board the motorcade, drive to Parliament, enter, give the speech, leave, drive back, return to the office. Each step is a phase with camera/view and player control.

For **Meet foreign leader / state visit**, the same idea:

1. **Handover** — You brief the deputy; news: “President leaves capital for [Country].”
2. **Travel** — Motorcade to airport; board; flight (or time-skip with news ticker).
3. **Arrival** — Landing; reception at airport; motorcade to host capital.
4. **Meeting** — At the foreign palace/office: greeting, meeting, outcome.
5. **Optional** — Side beat: visit their embassy in your capital, or a cultural stop.
6. **Return** — Flight back; land; motorcade to palace; resume office.

So: **multi-step flows with clear story beats**, and where we can reuse or add 3D (motorcade, office, “foreign palace” as a simple set), we do. When we can’t yet, we use **narrative screens** (text + mood image or placeholder) and a **Continue** button so the player advances step by step — not one click = done.

---

## 2. Plan: When We Implement

| Approach | Pros | Cons |
|----------|------|------|
| **Later** | Ship other features first | “Meet foreign leader” stays a popup for a long time; contradicts “immersive”. |
| **Now (phased)** | Align with your vision immediately; same pattern as State of the Nation | Some work up front. |

**Decision:** Implement the **immersive state-visit flow now** in a first pass:

- **Phase A (this pass):** Multi-step state visit: pick country → handover → travel (narrative or reuse motorcade) → arrival → meeting (one narrative screen with outcome) → return → back to office. Each step is a **phase** with a **narrative card** (title + 1–2 sentences) and **Continue**. No new 3D yet for the foreign country; we reuse “you’re in the world” where we can (e.g. motorcade to airport = same motorcade view, different label).
- **Phase B (later):** Add 3D or illustrated scenes for “foreign capital”, “palace”, “embassy” where it makes sense; optional side beat (embassy visit).
- **Phase C (later):** News events during the trip; “leaving power to deputy” as a small mechanic (e.g. deputy handles one random event); more variety in outcomes.

So we **don’t** leave it as “update later” with no plan — we **do** the immersive flow now in a phased way, then deepen (3D, embassy, news) later.

---

## 3. Other Activities — Same Principle

- **Cabinet meeting** — Can stay lighter (one modal with outcome) *or* become a short flow: walk to cabinet room, sit, agenda items, outcome. We can upgrade later.
- **Launch infrastructure** — Should be a flow: site visit, speech, ribbon-cutting, not one popup.
- **Security briefing** — Flow: briefing room, intel, decision, not one popup.
- **Press conference** — Flow: walk to podium, Q&A beats, headline result.
- **Visit region** — Flow: travel to region, rally or meeting, return.

So the **vision** is: every major activity is a **sequence of steps** (phases) the player moves through, with narrative and (where we have it) 3D or art — not “click once, see result”.

---

## 4. Implemented (Phase A)

- **State visit flow** — “Meet foreign leader” now starts an **immersive multi-phase flow**:
  1. Handover to deputy (news: leaving for X)
  2. Motorcade to airport
  3. In flight
  4. Arrival & reception
  5. Motorcade to foreign palace
  6. Meeting at the palace (outcome applied here; relations +8%)
  7. Return flight
  8. Back at the office
- Each step is a **narrative card** (StateVisitView) with title, short copy, and **Continue**. The modal is only for **picking the country**; the rest is step-by-step, not one click.
- Desk shows “State visit to [Country]…” and disables the button while the visit is in progress. State of the Nation is disabled during a state visit.

## 5. What’s Next (Phase B/C)

- **Phase B:** 3D or illustrated scenes for foreign capital, palace, embassy; optional **embassy visit** side beat.
- **Phase C:** News events during the trip; “leaving power to deputy” as a small mechanic; more outcome variety.

This doc will be updated as we add those phases.
