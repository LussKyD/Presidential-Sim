/** Presidential activities: each has a flow (locations, NPCs, outcome). */

export const ACTIVITY_IDS = {
  STATE_OF_NATION: 'state_of_nation',
  CABINET_MEETING: 'cabinet_meeting',
  MEET_FOREIGN_LEADER: 'meet_foreign_leader',
  VISIT_REGION: 'visit_region',
  LAUNCH_INFRASTRUCTURE: 'launch_infrastructure',
  SECURITY_BRIEFING: 'security_briefing',
  PRESS_CONFERENCE: 'press_conference',
}

/** State-of-the-Nation flow phases (GTA-style: office → cars → parliament → speech → return). */
export const STATE_ADDRESS_PHASES = {
  PLANNING: 'planning',
  SECURITY: 'security',
  WALK_TO_CARS: 'walk_to_cars',
  AT_CARS: 'at_cars',
  MOTORCADE_TO_PARLIAMENT: 'motorcade_to_parliament',
  AT_PARLIAMENT: 'at_parliament',
  ENTER_PARLIAMENT: 'enter_parliament',
  SPEECH: 'speech',
  EXIT_PARLIAMENT: 'exit_parliament',
  MOTORCADE_TO_PALACE: 'motorcade_to_palace',
  AT_PALACE: 'at_palace',
  WALK_TO_OFFICE: 'walk_to_office',
}

export const ACTIVITY_LABELS = {
  [ACTIVITY_IDS.STATE_OF_NATION]: 'State of the Nation Address',
  [ACTIVITY_IDS.CABINET_MEETING]: 'Cabinet meeting',
  [ACTIVITY_IDS.MEET_FOREIGN_LEADER]: 'Meet foreign leader',
  [ACTIVITY_IDS.VISIT_REGION]: 'Visit region',
  [ACTIVITY_IDS.LAUNCH_INFRASTRUCTURE]: 'Launch infrastructure project',
  [ACTIVITY_IDS.SECURITY_BRIEFING]: 'Security briefing',
  [ACTIVITY_IDS.PRESS_CONFERENCE]: 'Press conference',
}

/** State visit flow: handover → travel → arrival → meeting at foreign palace → return. */
export const STATE_VISIT_PHASES = {
  HANDOVER: 'handover',
  MOTORCADE_TO_AIRPORT: 'motorcade_to_airport',
  FLIGHT: 'flight',
  ARRIVAL: 'arrival',
  MOTORCADE_TO_PALACE: 'motorcade_to_palace',
  MEETING_AT_PALACE: 'meeting_at_palace',
  RETURN_FLIGHT: 'return_flight',
  RETURN_TO_OFFICE: 'return_to_office',
}

/** Ordered list for state visit progression (next = same index + 1). */
export const STATE_VISIT_PHASE_ORDER = [
  STATE_VISIT_PHASES.HANDOVER,
  STATE_VISIT_PHASES.MOTORCADE_TO_AIRPORT,
  STATE_VISIT_PHASES.FLIGHT,
  STATE_VISIT_PHASES.ARRIVAL,
  STATE_VISIT_PHASES.MOTORCADE_TO_PALACE,
  STATE_VISIT_PHASES.MEETING_AT_PALACE,
  STATE_VISIT_PHASES.RETURN_FLIGHT,
  STATE_VISIT_PHASES.RETURN_TO_OFFICE,
]

/** Visit region flow: depart → motorcade → in region (rally) → return. */
export const VISIT_REGION_PHASES = {
  DEPART: 'depart',
  MOTORCADE: 'motorcade',
  IN_REGION: 'in_region',
  RETURN: 'return',
}

export const VISIT_REGION_PHASE_ORDER = [
  VISIT_REGION_PHASES.DEPART,
  VISIT_REGION_PHASES.MOTORCADE,
  VISIT_REGION_PHASES.IN_REGION,
  VISIT_REGION_PHASES.RETURN,
]

/** Security briefing flow: enter room → review intel → decision. */
export const SECURITY_BRIEFING_PHASES = {
  ENTER: 'enter',
  REVIEW: 'review',
  DECISION: 'decision',
}

export const SECURITY_BRIEFING_PHASE_ORDER = [
  SECURITY_BRIEFING_PHASES.ENTER,
  SECURITY_BRIEFING_PHASES.REVIEW,
  SECURITY_BRIEFING_PHASES.DECISION,
]

/** Press conference flow: prep → podium → Q&A → headline. */
export const PRESS_CONFERENCE_PHASES = {
  PREP: 'prep',
  PODIUM: 'podium',
  Q_AND_A: 'q_and_a',
  HEADLINE: 'headline',
}

export const PRESS_CONFERENCE_PHASE_ORDER = [
  PRESS_CONFERENCE_PHASES.PREP,
  PRESS_CONFERENCE_PHASES.PODIUM,
  PRESS_CONFERENCE_PHASES.Q_AND_A,
  PRESS_CONFERENCE_PHASES.HEADLINE,
]

/** Launch infrastructure flow: depart → motorcade → at site → ribbon-cutting → return. */
export const LAUNCH_INFRASTRUCTURE_PHASES = {
  DEPART: 'depart',
  MOTORCADE: 'motorcade',
  AT_SITE: 'at_site',
  RIBBON_CUTTING: 'ribbon_cutting',
  RETURN: 'return',
}

export const LAUNCH_INFRASTRUCTURE_PHASE_ORDER = [
  LAUNCH_INFRASTRUCTURE_PHASES.DEPART,
  LAUNCH_INFRASTRUCTURE_PHASES.MOTORCADE,
  LAUNCH_INFRASTRUCTURE_PHASES.AT_SITE,
  LAUNCH_INFRASTRUCTURE_PHASES.RIBBON_CUTTING,
  LAUNCH_INFRASTRUCTURE_PHASES.RETURN,
]

/** Which activities are implemented with full 3D flow (rest show "Coming soon"). */
export const ACTIVITIES_WITH_FLOW = [ACTIVITY_IDS.STATE_OF_NATION]
