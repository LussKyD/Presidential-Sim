/** Event/crisis triggers and effects. */
import { clamp } from '../../utils/mathHelpers'

const REGIONS = ['Capital', 'North', 'South', 'East', 'West']

const PROTEST_MESSAGES = [
  (r) => `Protest in ${r}: unrest over economy and corruption.`,
  (r) => `${r} rallies against cost of living and graft.`,
  (r) => `Street protests in ${r} — "Jobs and accountability now."`,
  (r) => `Demonstrations in ${r}; police contain crowds.`,
]

const ECONOMIC_MESSAGES = [
  (inf) => `Media: "Cost of living crisis" as inflation hits ${(inf * 100).toFixed(0)}%.`,
  (inf) => `Opposition: "People can't afford basics" — inflation ${(inf * 100).toFixed(0)}%.`,
  (inf) => `Headlines: soaring prices erode wages; inflation at ${(inf * 100).toFixed(0)}%.`,
]

const COUP_MESSAGES = [
  'Coup attempt succeeds. You are removed from power.',
  'Military declares you unfit; tanks secure the palace.',
  'Generals seize control. Your term ends tonight.',
]

const ELECTION_WIN_MESSAGES = [
  'Election: you narrowly win another term.',
  'Election: victory, but opposition gains ground.',
  'Election: you hold power; coalition talks ahead.',
]

const ELECTION_LOSE_MESSAGES = [
  'Election: you lose power after a disappointing result.',
  'Election: voters choose change. You concede.',
  'Election: defeat at the polls. Handover begins.',
]

const SCANDAL_MESSAGES = [
  'Scandal: leak implicates officials in kickbacks.',
  'Media: "Corruption at the top" — approval drops.',
  'Opposition demands inquiry into government contracts.',
]

const DIPLOMATIC_MESSAGES = [
  'Diplomatic incident: ally condemns policy shift.',
  'Foreign press: relations strained over recent decisions.',
  'Embassy row: international standing takes a hit.',
]

function pickRegion(rng) {
  return REGIONS[Math.floor(rng() * REGIONS.length)]
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)]
}

export function updateCrisisCheck(state, rng) {
  if (state.regime?.status !== 'in_power') {
    return state
  }

  const { economy, government, population, politics } = state
  const p = government.policies

  // ----- Coup attempt -----
  if (politics.coupRisk >= 0.75 && rng && rng() < (politics.coupRisk - 0.75) * 1.5) {
    state.regime.status = 'coup'
    state.regime.endReason = 'Removed from power by a military coup.'
    state.events.push({
      id: `coup-${state.time.tick}-${rng().toString(36).slice(2, 6)}`,
      at: { ...state.time },
      type: 'coup',
      message: pick(COUP_MESSAGES, rng),
    })
    state.politics.coupRisk = 1
    return state
  }

  // ----- Elections every 4 years -----
  const monthsInOffice = (state.time.year - 2026) * 12 + (state.time.month - 1)
  if (monthsInOffice > 0 && monthsInOffice % 48 === 0 && rng) {
    const loseChance = clamp(0.6 - population.publicApproval, 0.05, 0.9)
    const lost = rng() < loseChance
    state.events.push({
      id: `election-${state.time.tick}-${rng().toString(36).slice(2, 6)}`,
      at: { ...state.time },
      type: 'election',
      message: lost ? pick(ELECTION_LOSE_MESSAGES, rng) : pick(ELECTION_WIN_MESSAGES, rng),
    })
    if (lost) {
      state.regime.status = 'voted_out'
      state.regime.endReason = 'Lost national election.'
      return state
    }
  }

  /**
   * Protest: if no pending crisis response, either set pending (player chooses) or apply immediately at low chance.
   */
  const protestChance =
    economy.unemployment * 0.02 +
    economy.inflation * 0.03 +
    p.corruptionLevel * 0.05 -
    p.policeFunding * 0.02

  if (rng && protestChance > 0 && rng() < Math.min(protestChance, 0.4)) {
    const region = pickRegion(rng)
    const eventId = `protest-${state.time.tick}-${rng().toString(36).slice(2, 6)}`
    const message = pick(PROTEST_MESSAGES, rng)(region)
    if (!state.crisis?.pendingResponse) {
      state.crisis = {
        pendingResponse: {
          type: 'protest',
          eventId,
          message,
          region,
        },
      }
      state.events.push({ id: eventId, at: { ...state.time }, type: 'protest', message })
    } else {
      state.events.push({ id: eventId, at: { ...state.time }, type: 'protest', message })
      state.population.publicApproval = clamp(population.publicApproval - 0.04, 0, 1)
      state.politics.coupRisk = clamp(politics.coupRisk + 0.02, 0, 1)
    }
  }

  // Economic anxiety headline when inflation is high
  if (rng && economy.inflation >= 0.15 && rng() < 0.25) {
    state.events.push({
      id: `anxiety-${state.time.tick}-${rng().toString(36).slice(2, 6)}`,
      at: { ...state.time },
      type: 'economic',
      message: pick(ECONOMIC_MESSAGES, rng)(economy.inflation),
    })
    state.population.publicApproval = clamp(population.publicApproval - 0.02, 0, 1)
  }

  // Scandal when corruption is high — can demand a response
  if (rng && p.corruptionLevel >= 0.35 && rng() < 0.12) {
    const eventId = `scandal-${state.time.tick}-${rng().toString(36).slice(2, 6)}`
    const message = pick(SCANDAL_MESSAGES, rng)
    if (!state.crisis?.pendingResponse) {
      state.crisis = {
        pendingResponse: { type: 'scandal', eventId, message },
      }
      state.events.push({ id: eventId, at: { ...state.time }, type: 'scandal', message })
    } else {
      state.events.push({ id: eventId, at: { ...state.time }, type: 'scandal', message })
      state.population.publicApproval = clamp(population.publicApproval - 0.03, 0, 1)
      state.shocks.scandalLevel = clamp((state.shocks.scandalLevel || 0) + 0.15, 0, 1)
    }
  }

  // Diplomatic incident (low chance)
  if (rng && rng() < 0.06) {
    state.events.push({
      id: `diplomatic-${state.time.tick}-${rng().toString(36).slice(2, 6)}`,
      at: { ...state.time },
      type: 'diplomatic',
      message: pick(DIPLOMATIC_MESSAGES, rng),
    })
    state.population.publicApproval = clamp(population.publicApproval - 0.015, 0, 1)
    state.shocks.foreignInterference = clamp((state.shocks.foreignInterference || 0.1) + 0.05, 0, 1)
  }

  // Cap event log length
  if (state.events.length > 60) state.events.splice(0, state.events.length - 60)

  return state
}
