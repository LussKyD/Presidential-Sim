/** Presidential activities: each has a flow (locations, NPCs, outcome). */

export const ACTIVITY_IDS = {
  STATE_OF_NATION: 'state_of_nation',
  CABINET_MEETING: 'cabinet_meeting',
  MEET_FOREIGN_LEADER: 'meet_foreign_leader',
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
  [ACTIVITY_IDS.LAUNCH_INFRASTRUCTURE]: 'Launch infrastructure project',
  [ACTIVITY_IDS.SECURITY_BRIEFING]: 'Security briefing',
  [ACTIVITY_IDS.PRESS_CONFERENCE]: 'Press conference',
}

/** Which activities are implemented with full 3D flow (rest show "Coming soon"). */
export const ACTIVITIES_WITH_FLOW = [ACTIVITY_IDS.STATE_OF_NATION]
