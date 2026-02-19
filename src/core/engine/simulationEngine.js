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
import { POLICY_DEFAULTS, POLICY_DEFS, BUDGET_PIE_IDS } from '../constants/policyEffects'
import { REGION_IDS, getDefaultRegionalApproval } from '../constants/regions'

function normalizeBudgetPie(policies) {
  const sum = BUDGET_PIE_IDS.reduce((s, id) => s + (policies[id] ?? 0), 0)
  if (sum <= 0) return
  BUDGET_PIE_IDS.forEach((id) => {
    policies[id] = clamp((policies[id] ?? 0) / sum, 0, 1)
  })
}

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

const BUDGET_MONTH = 3
const OPENING_OF_PARLIAMENT_MONTH = 6

function getDefaultState(seed = 1) {
  return {
    meta: { seed },
    time: { year: 2026, month: 1, tick: 0 },
    economy: {
      gdp: INITIAL_GDP,
      gdpGrowth: 0,
      inflation: INITIAL_INFLATION,
      unemployment: INITIAL_UNEMPLOYMENT,
      history: [],
    },
    population: { publicApproval: INITIAL_APPROVAL },
    politics: { coupRisk: INITIAL_COUP_RISK },
    government: { policies: clone(POLICY_DEFAULTS) },
    parliament: { support: 0.55 },
    crisis: null,
    calendar: { budgetMonth: BUDGET_MONTH, openingMonth: OPENING_OF_PARLIAMENT_MONTH, budgetTabledThisYear: false, budgetDue: false },
    shocks: {
      supplyShock: 0,
      politicalInstability: 0,
      automationPolicy: 0,
      scandalLevel: 0,
      foreignInterference: 0.1,
      commanderLoyalty: 0.7,
      ethnicAlignment: 0.65,
    },
    regime: { status: 'in_power', endReason: null },
    opposition: { strength: 0.35 },
    regions: getDefaultRegionalApproval(INITIAL_APPROVAL),
    events: [],
  }
}

export function createSimulationEngine({ seed = 1, initialState } = {}) {
  const rng = createSeededRandom(seed)
  const state = initialState ? clone(initialState) : getDefaultState(seed)
  if (state.meta) state.meta.seed = seed
  const def = getDefaultState()
  if (!Array.isArray(state.economy?.history)) state.economy = { ...def.economy, ...state.economy, history: state.economy?.history || [] }
  if (!state.regime) state.regime = { ...def.regime }
  if (!state.government?.policies) {
    state.government = { policies: clone(POLICY_DEFAULTS) }
    normalizeBudgetPie(state.government.policies)
  }
  if (!state.parliament) state.parliament = { support: def.parliament?.support ?? 0.55 }
  if (!state.calendar) state.calendar = { ...def.calendar, budgetTabledThisYear: state.calendar?.budgetTabledThisYear ?? false, budgetDue: state.calendar?.budgetDue ?? false }
  if (!state.opposition) state.opposition = { strength: def.opposition?.strength ?? 0.35 }
  if (!state.regions || typeof state.regions !== 'object') state.regions = { ...getDefaultRegionalApproval(def.population?.publicApproval ?? 0.5) }
  REGION_IDS.forEach((id) => { if (typeof state.regions[id] !== 'number') state.regions[id] = def.regions?.[id] ?? 0.5 })

  function applyPolicy(policyId, value) {
    const def = POLICY_DEFS.find((d) => d.id === policyId)
    if (!def) return
    const num = clamp(Number(value), def.min, def.max)
    state.government.policies[policyId] = num
    if (BUDGET_PIE_IDS.includes(policyId)) {
      const others = BUDGET_PIE_IDS.filter((id) => id !== policyId)
      const sumOthers = others.reduce((s, id) => s + (state.government.policies[id] ?? 0), 0)
      const remaining = 1 - num
      if (sumOthers > 0 && remaining >= 0) {
        others.forEach((id) => {
          state.government.policies[id] = clamp((state.government.policies[id] / sumOthers) * remaining, 0, 1)
        })
      }
    }
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

    if (state.parliament) {
      const target = state.population.publicApproval * 0.7 + 0.2
      state.parliament.support = clamp(state.parliament.support * 0.97 + target * 0.03, 0.1, 0.95)
    }
    if (state.opposition) {
      const approval = state.population.publicApproval
      const target = clamp(0.2 + (1 - approval) * 0.65, 0.15, 0.9)
      state.opposition.strength = clamp(state.opposition.strength * 0.97 + target * 0.03, 0.1, 0.9)
    }
    if (state.calendar) {
      if (state.time.month === 1) {
        state.calendar.budgetTabledThisYear = false
        state.calendar.budgetDue = false
      }
      if (state.time.month === state.calendar.budgetMonth && !state.calendar.budgetTabledThisYear) {
        state.calendar.budgetDue = true
        state.events.push({ id: `budget-due-${state.time.tick}`, at: { ...state.time }, type: 'calendar', message: 'Budget day — table your budget in Parliament.' })
      }
      if (state.time.month === state.calendar.openingMonth) {
        state.events.push({ id: `opening-${state.time.tick}`, at: { ...state.time }, type: 'calendar', message: 'Opening of Parliament. Session begins.' })
      }
    }

    updateEconomy(state)
    updatePopulation(state)
    if (state.regions) {
      const national = state.population.publicApproval
      REGION_IDS.forEach((id) => {
        const current = state.regions[id] ?? 0.5
        const drift = current * 0.95 + national * 0.05
        const noise = (rng() - 0.5) * 0.02
        state.regions[id] = clamp(drift + noise, 0.05, 0.95)
      })
    }
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

  function setBudgetPie(inf, edu, def, pol) {
    const arr = [Number(inf), Number(edu), Number(def), Number(pol)]
    const sum = arr.reduce((s, v) => s + Math.max(0, v), 0)
    if (sum <= 0) return
    BUDGET_PIE_IDS.forEach((id, i) => {
      state.government.policies[id] = clamp(arr[i] / sum, 0, 1)
    })
  }

  function tableBudget() {
    if (state.regime?.status !== 'in_power' || !state.parliament) return
    if (state.calendar?.budgetTabledThisYear) return
    state.calendar.budgetTabledThisYear = true
    state.calendar.budgetDue = false
    const support = state.parliament.support
    const roll = rng()
    if (roll < support) {
      state.population.publicApproval = clamp(state.population.publicApproval + 0.02, 0, 1)
      if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) - 0.02, 0.1, 0.9)
      state.events.push({ id: `budget-${state.time.tick}`, at: { ...state.time }, type: 'parliament', message: 'Parliament passes your budget. Government wins vote.' })
    } else if (roll < support + 0.2) {
      state.population.publicApproval = clamp(state.population.publicApproval - 0.01, 0, 1)
      state.events.push({ id: `budget-${state.time.tick}`, at: { ...state.time }, type: 'parliament', message: 'Parliament amends budget. Compromise reached.' })
    } else {
      state.population.publicApproval = clamp(state.population.publicApproval - 0.05, 0, 1)
      state.politics.coupRisk = clamp(state.politics.coupRisk + 0.03, 0, 1)
      if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.03, 0.1, 0.9)
      state.events.push({ id: `budget-${state.time.tick}`, at: { ...state.time }, type: 'parliament', message: 'Parliament rejects budget. Opposition blocks government.' })
    }
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  function respondToCrisis(response) {
    const pending = state.crisis?.pendingResponse
    if (!pending || state.regime?.status !== 'in_power') return
    state.crisis = null
    const { population, politics } = state
    if (pending.type === 'protest') {
      const regionId = pending.region
      const bumpRegion = (delta) => {
        if (state.regions && regionId && state.regions[regionId] != null) state.regions[regionId] = clamp((state.regions[regionId] ?? 0.5) + delta, 0.05, 0.95)
      }
      if (response === 'dialogue') {
        state.population.publicApproval = clamp(population.publicApproval + 0.02, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) - 0.01, 0.1, 0.9)
        bumpRegion(0.04)
        state.events.push({ id: `response-${state.time.tick}`, at: { ...state.time }, type: 'crisis_response', message: 'You ordered dialogue with protesters. Approval rises slightly.' })
      } else if (response === 'crackdown') {
        state.population.publicApproval = clamp(population.publicApproval - 0.06, 0, 1)
        state.politics.coupRisk = clamp(politics.coupRisk + 0.04, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.03, 0.1, 0.9)
        bumpRegion(-0.1)
        state.events.push({ id: `response-${state.time.tick}`, at: { ...state.time }, type: 'crisis_response', message: 'Security crackdown on protesters. Approval drops; unrest grows.' })
      } else if (response === 'ignore') {
        state.population.publicApproval = clamp(population.publicApproval - 0.03, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.02, 0.1, 0.9)
        bumpRegion(-0.05)
        state.events.push({ id: `response-${state.time.tick}`, at: { ...state.time }, type: 'crisis_response', message: 'No formal response. Protest fades but some lose faith.' })
      } else if (response === 'address_nation') {
        state.population.publicApproval = clamp(population.publicApproval + 0.01, 0, 1)
        bumpRegion(0.02)
        state.events.push({ id: `response-${state.time.tick}`, at: { ...state.time }, type: 'crisis_response', message: 'You addressed the nation. Calm restored for now.' })
      }
    } else if (pending.type === 'scandal') {
      if (response === 'deny') {
        state.population.publicApproval = clamp(population.publicApproval - 0.02, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.02, 0.1, 0.9)
        state.events.push({ id: `response-${state.time.tick}`, at: { ...state.time }, type: 'crisis_response', message: 'You denied the allegations. Media skeptical.' })
      } else if (response === 'investigate') {
        state.population.publicApproval = clamp(population.publicApproval + 0.01, 0, 1)
        state.shocks.scandalLevel = clamp((state.shocks.scandalLevel || 0) - 0.1, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) - 0.01, 0.1, 0.9)
        state.events.push({ id: `response-${state.time.tick}`, at: { ...state.time }, type: 'crisis_response', message: 'You ordered an inquiry. Public sees accountability.' })
      } else if (response === 'ignore') {
        state.population.publicApproval = clamp(population.publicApproval - 0.04, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.03, 0.1, 0.9)
        state.events.push({ id: `response-${state.time.tick}`, at: { ...state.time }, type: 'crisis_response', message: 'No comment. Scandal drags on; approval falls.' })
      }
    }
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  function applyCabinetMeetingOutcome(success) {
    if (state.regime?.status !== 'in_power') return
    const last = state.meta?.lastCabinetTick ?? -999
    if (state.time.tick - last < 6) return
    state.meta.lastCabinetTick = state.time.tick
    const delta = success ? 0.02 : -0.01
    state.population.publicApproval = clamp(state.population.publicApproval + delta, 0, 1)
    state.events.push({
      id: `cabinet-${state.time.tick}`,
      at: { ...state.time },
      type: 'cabinet',
      message: success ? 'Cabinet meeting: unity behind your agenda.' : 'Cabinet meeting: ministers disagree on priorities.',
    })
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  /** State address delivered: apply approval effect and push event. Cooldown 12 months. */
  function applyStateAddressOutcome(positive) {
    if (state.regime?.status !== 'in_power') return
    const last = state.meta?.lastStateAddressTick ?? -999
    if (state.time.tick - last < 12) return
    state.meta.lastStateAddressTick = state.time.tick
    const delta = positive ? 0.03 : -0.02
    state.population.publicApproval = clamp(state.population.publicApproval + delta, 0, 1)
    if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + (positive ? -0.02 : 0.02), 0.1, 0.9)
    state.events.push({
      id: `state-address-${state.time.tick}`,
      at: { ...state.time },
      type: 'state_address',
      message: positive
        ? 'State address to Parliament: strong reception. Approval rises.'
        : 'State address to Parliament: lukewarm reception. Approval dips.',
    })
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  function getState() {
    return clone(state)
  }

  return {
    getState,
    tick,
    applyPolicy,
    setBudgetPie,
    applyStateAddressOutcome,
    tableBudget,
    respondToCrisis,
    applyCabinetMeetingOutcome,
    policyDefs: POLICY_DEFS,
  }
}
