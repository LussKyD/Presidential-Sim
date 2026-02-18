/** Orchestrates economy, population, politics, crisis. Single source of truth for state. */
import { updateEconomy } from './economyEngine'
import { updatePopulation } from './populationEngine'
import { updatePolitics } from './politicsEngine'
import { updateCrisisCheck } from './crisisEngine'
import { createSeededRandom } from '../../utils/random'
import { clamp } from '../../utils/mathHelpers'
import {
  INITIAL_APPROVAL,
  INITIAL_COUP_RISK,
  INITIAL_GDP,
  INITIAL_INFLATION,
  INITIAL_UNEMPLOYMENT,
} from '../constants/baseValues'
import { POLICY_DEFAULTS, POLICY_DEFS } from '../constants/policyEffects'

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

export function createSimulationEngine({ seed = 1 } = {}) {
  const rng = createSeededRandom(seed)

  const state = {
    meta: { seed },
    time: { year: 2026, month: 1, tick: 0 },
    economy: {
      gdp: INITIAL_GDP,
      gdpGrowth: 0,
      inflation: INITIAL_INFLATION,
      unemployment: INITIAL_UNEMPLOYMENT,
      history: [],
    },
    population: {
      publicApproval: INITIAL_APPROVAL,
    },
    politics: {
      coupRisk: INITIAL_COUP_RISK,
    },
    government: {
      policies: clone(POLICY_DEFAULTS),
    },
    shocks: {
      supplyShock: 0,
      politicalInstability: 0,
      automationPolicy: 0,
      scandalLevel: 0,
      foreignInterference: 0.1,
      commanderLoyalty: 0.7,
      ethnicAlignment: 0.65,
    },
    regime: {
      status: 'in_power', // 'in_power' | 'coup' | 'voted_out'
      endReason: null,
    },
    events: [],
  }

  function applyPolicy(policyId, value) {
    const def = POLICY_DEFS.find((d) => d.id === policyId)
    if (!def) return
    state.government.policies[policyId] = clamp(Number(value), def.min, def.max)
  }

  function tick() {
    state.time.tick += 1
    state.time.month += 1
    if (state.time.month > 12) {
      state.time.month = 1
      state.time.year += 1
    }

    // Instability rises when approval is low and coup risk is high.
    state.shocks.politicalInstability = clamp(
      (1 - state.population.publicApproval) * 0.6 + state.politics.coupRisk * 0.4,
      0,
      1,
    )

    // Tiny random supply shock drift.
    state.shocks.supplyShock = clamp(state.shocks.supplyShock * 0.85 + (rng() - 0.5) * 0.05, 0, 1)

    updateEconomy(state)
    updatePopulation(state)
    updatePolitics(state)
    updateCrisisCheck(state, rng)

    // One event per year so the feed isn’t flooded; crises add their own.
    if (state.time.month === 1) {
      state.events.push({
        id: `year-${state.time.year}-${state.time.tick}`,
        at: { ...state.time },
        type: 'tick',
        message: `Year ${state.time.year} begins.`,
      })
    }
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  function getState() {
    return clone(state)
  }

  return {
    getState,
    tick,
    applyPolicy,
    policyDefs: POLICY_DEFS,
  }
}
