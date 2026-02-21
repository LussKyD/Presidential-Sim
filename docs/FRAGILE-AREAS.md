# Fragile Areas — Do Not Break

These behaviors have been fixed after regressions. When changing the listed files or flows, preserve them.

---

## 1. Return to Palace Office (blank view)

**Symptom if broken:** After Security Briefing, Cabinet Meeting, or Press Conference, clicking "Return to office" shows a blank/dark main view instead of the office.

**Location:** `src/ui/components/WorldView.jsx`

**What to preserve:**

- **`prevInBriefingOrPodiumRef`** — Updated once per frame at the **end** of the animation loop:  
  `prevInBriefingOrPodiumRef.current = inBriefingRoom || inPodiumRoom`
- **`justLeftBriefingOrPodium` block** — When transitioning from briefing or podium back to the default view, the code must in the same frame:
  - Set `officeGroup.visible = true`
  - Set `briefingRoomGroup.visible = false`, `podiumRoomGroup.visible = false`
  - Set camera position/target to office (OFFICE_EYE / OFFICE_LOOK)
  - Set `officeCameraSettledRef.current = true`

**Why:** Without this, the camera stays at the briefing/podium position while those groups are hidden, so the player sees nothing.

**See also:** `.cursor/rules/worldview-transitions.mdc`

---

## 2. State Visit — Return to office and FLIGHT

**Symptom if broken:** After state visit (e.g. return from trip or during flight), office view doesn’t show or phase gets stuck.

**Location:** `src/App.jsx` (state visit phase handling), `src/ui/components/WorldView.jsx` (state visit exterior + plane interior)

**What to preserve:**

- State visit phases `MOTORCADE_TO_AIRPORT`, `RETURN_TO_OFFICE`, and `FLIGHT` drive the correct 3D view (exterior motorcade, plane interior).
- When `RETURN_TO_OFFICE` completes, `setStateVisitPhase(null)` (and related state) so the default office view is shown.

---

## 3. Visit Region / Launch Infrastructure — Return

**Symptom if broken:** After motorcade to site and return, office doesn’t show or phase sticks.

**Location:** `src/App.jsx` (visit region / launch infra phase completion), `src/ui/components/WorldView.jsx` (site exterior and return walk)

**What to preserve:**

- When return phase completes, clear the phase so the default office view and camera are restored.
- WorldView already handles "return walk" and calls the completion callback; don’t remove that path.

---

## 4. General principle

**Any activity that takes the player to a different 3D view (room, motorcade, plane, chamber) must have a clear “return to office” path that:**

1. Clears the activity phase (or sets the next phase to “done”).
2. Lets WorldView fall into the default branch where `officeGroup.visible = true` and the camera is at the office (or explicitly resets visibility and camera when leaving that view, as for briefing/podium).

When adding **new** activities with their own 3D views, follow the same pattern: on exit, either use the same “just left” ref + reset, or explicitly show office and reset camera.
