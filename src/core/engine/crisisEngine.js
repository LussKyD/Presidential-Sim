/** Event/crisis triggers and effects. */
import { clamp } from '../../utils/mathHelpers'

const REGIONS = ['Capital', 'North', 'South', 'East', 'West']

function pickRegion(rng) {
  return REGIONS[Math.floor(rng() * REGIONS.length)]
}

/**
 * Protest chance from blueprint: unemployment, inflation, corruption, police funding.
 * If triggered: push event, apply approval/coup risk effects.
 */
export function updateCrisisCheck(state, rng) {
  const { economy, government, population, politics } = state
  const p = government.policies

  const protestChance =
    economy.unemployment * 0.02 +
    economy.inflation * 0.03 +
    p.corruptionLevel * 0.05 -
    p.policeFunding * 0.02

  if (rng && protestChance > 0 && rng() < Math.min(protestChance, 0.4)) {
    const region = pickRegion(rng)
    state.events.push({
      id: `protest-${state.time.tick}-${rng().toString(36).slice(2, 6)}`,
      at: { ...state.time },
      type: 'protest',
      message: `Protest in ${region}: unrest over economy and corruption.`,
    })
    state.population.publicApproval = clamp(population.publicApproval - 0.04, 0, 1)
    state.politics.coupRisk = clamp(politics.coupRisk + 0.02, 0, 1)
  }

  // Economic anxiety headline when inflation is high
  if (rng && economy.inflation >= 0.15 && rng() < 0.25) {
    state.events.push({
      id: `anxiety-${state.time.tick}-${rng().toString(36).slice(2, 6)}`,
      at: { ...state.time },
      type: 'economic',
      message: `Media: "Cost of living crisis" as inflation hits ${(economy.inflation * 100).toFixed(0)}%.`,
    })
    state.population.publicApproval = clamp(population.publicApproval - 0.02, 0, 1)
  }

  // Cap event log length
  if (state.events.length > 60) state.events.splice(0, state.events.length - 60)

  return state
}
