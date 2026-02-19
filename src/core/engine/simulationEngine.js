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
import { COUNTRY_IDS, getDefaultRelations, getCountry } from '../constants/international'

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
/** Each month has 7 substantial days; one tick = one day. */
const DAYS_PER_MONTH = 7
const COOLDOWN_MONTHS_TO_TICKS = (months) => months * DAYS_PER_MONTH

function getDefaultState(seed = 1) {
  return {
    meta: { seed, lastVisitRegionTick: -999, lastSecurityBriefingTick: -999, lastPressConferenceTick: -999, lastLaunchInfrastructureTick: -999 },
    time: { year: 2026, month: 1, day: 1, tick: 0 },
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
    desk: { meetings: [], callLog: [], diary: [], proposedEvents: [], dossiers: [] },
    international: { relations: getDefaultRelations(), lastMeetForeignTick: -999 },
    events: [],
  }
}

export function createSimulationEngine({ seed = 1, initialState } = {}) {
  const rng = createSeededRandom(seed)
  const state = initialState ? clone(initialState) : getDefaultState(seed)
  // Migrate old saves: 1 tick used to mean 1 month; now 1 tick = 1 day, 7 days = 1 month.
  if (state.time && state.time.day == null) {
    const oldTicks = state.time.tick ?? 0
    state.time.tick = oldTicks * DAYS_PER_MONTH
    state.time.day = 1
    state.time.month = oldTicks === 0 ? 1 : (oldTicks % 12 || 12)
    state.time.year = 2026 + (oldTicks === 0 ? 0 : Math.floor((oldTicks - 1) / 12))
    // Convert last-activity ticks from month-ticks to day-ticks so cooldowns are correct.
    if (state.meta && typeof state.meta.lastStateAddressTick === 'number') {
      state.meta.lastStateAddressTick = state.meta.lastStateAddressTick * DAYS_PER_MONTH
    }
  }
  if (state.time && state.time.day == null) state.time.day = 1
  if (state.meta) {
    state.meta.seed = seed
    if (typeof state.meta.lastStateAddressTick !== 'number') state.meta.lastStateAddressTick = -999
    if (typeof state.meta.lastVisitRegionTick !== 'number') state.meta.lastVisitRegionTick = -999
    if (typeof state.meta.lastSecurityBriefingTick !== 'number') state.meta.lastSecurityBriefingTick = -999
    if (typeof state.meta.lastPressConferenceTick !== 'number') state.meta.lastPressConferenceTick = -999
    if (typeof state.meta.lastLaunchInfrastructureTick !== 'number') state.meta.lastLaunchInfrastructureTick = -999
  }
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
  if (!state.desk || !Array.isArray(state.desk.meetings)) state.desk = { meetings: state.desk?.meetings ?? [], callLog: state.desk?.callLog ?? [], diary: state.desk?.diary ?? [], proposedEvents: state.desk?.proposedEvents ?? [], dossiers: state.desk?.dossiers ?? [] }
  if (!Array.isArray(state.desk.dossiers)) state.desk.dossiers = []
  if (!state.international?.relations) state.international = { relations: { ...getDefaultRelations(), ...state.international?.relations }, lastMeetForeignTick: state.international?.lastMeetForeignTick ?? -999 }
  COUNTRY_IDS.forEach((id) => { if (typeof state.international.relations[id] !== 'number') state.international.relations[id] = 0.5 })

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
    state.time.day += 1
    if (state.time.day > DAYS_PER_MONTH) {
      state.time.day = 1
      state.time.month += 1
      if (state.time.month > 12) {
        state.time.month = 1
        state.time.year += 1
      }
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
    if (state.calendar && state.time.day === 1) {
      if (state.time.month === 1) {
        state.calendar.budgetTabledThisYear = false
        state.calendar.budgetDue = false
      }
      if (state.time.month === state.calendar.budgetMonth && !state.calendar.budgetTabledThisYear) {
        state.calendar.budgetDue = true
        state.events.push({ id: `budget-due-${state.time.tick}`, at: { ...state.time }, type: 'calendar', message: 'Budget day — table your budget in Parliament.' })
      }
      if (state.time.month === state.calendar.openingMonth) {
        const openDossier = addDossier({ countryId: null, type: 'calendar', title: 'Opening of Parliament brief', summary: 'Opening of Parliament. Session begins.', details: 'New session convened. Legislative agenda set.', at: state.time })
        state.events.push({ id: `opening-${state.time.tick}`, at: { ...state.time }, type: 'calendar', message: 'Opening of Parliament. Session begins.', dossierId: openDossier?.id })
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

    if (state.regime?.status === 'in_power' && state.desk?.meetings?.length) {
      const due = state.desk.meetings.find((m) => !m.done && m.month === state.time.month && m.year === state.time.year)
      if (due) state.pendingMeeting = due
    }

    if (state.international?.relations) {
      const avg = COUNTRY_IDS.reduce((s, id) => s + (state.international.relations[id] ?? 0.5), 0) / COUNTRY_IDS.length
      state.shocks.foreignInterference = clamp(
        (state.shocks.foreignInterference ?? 0.1) * 0.99 + (1 - avg) * 0.02,
        0.05,
        0.95
      )
      COUNTRY_IDS.forEach((id) => {
        const r = state.international.relations[id] ?? 0.5
        const noise = (rng() - 0.5) * 0.01
        state.international.relations[id] = clamp(r + noise, 0.2, 0.85)
      })
    }

    // One event per year so the feed isn’t flooded; crises add their own.
    if (state.time.day === 1 && state.time.month === 1) {
      const yearDossier = addDossier({ countryId: null, type: 'calendar', title: `Year ${state.time.year} brief`, summary: `Year ${state.time.year} begins.`, details: 'New year. Legislative and calendar reset.', at: state.time })
      state.events.push({
        id: `year-${state.time.year}-${state.time.tick}`,
        at: { ...state.time },
        type: 'tick',
        message: `Year ${state.time.year} begins.`,
        dossierId: yearDossier?.id,
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
    let summary, details, dossier
    if (roll < support) {
      state.population.publicApproval = clamp(state.population.publicApproval + 0.02, 0, 1)
      if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) - 0.02, 0.1, 0.9)
      summary = 'Parliament passes your budget. Government wins vote.'
      details = 'Full budget passed. Opposition outvoted.'
      dossier = addDossier({ countryId: null, type: 'parliament', title: 'Budget vote brief', summary, details, at: state.time })
      state.events.push({ id: `budget-${state.time.tick}`, at: { ...state.time }, type: 'parliament', message: summary, dossierId: dossier?.id })
    } else if (roll < support + 0.2) {
      state.population.publicApproval = clamp(state.population.publicApproval - 0.01, 0, 1)
      summary = 'Parliament amends budget. Compromise reached.'
      details = 'Amendments adopted. Revised budget passed.'
      dossier = addDossier({ countryId: null, type: 'parliament', title: 'Budget vote brief', summary, details, at: state.time })
      state.events.push({ id: `budget-${state.time.tick}`, at: { ...state.time }, type: 'parliament', message: summary, dossierId: dossier?.id })
    } else {
      state.population.publicApproval = clamp(state.population.publicApproval - 0.05, 0, 1)
      state.politics.coupRisk = clamp(state.politics.coupRisk + 0.03, 0, 1)
      if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.03, 0.1, 0.9)
      summary = 'Parliament rejects budget. Opposition blocks government.'
      details = 'Budget vote lost. Opposition majority. Government weakened.'
      dossier = addDossier({ countryId: null, type: 'parliament', title: 'Budget vote brief', summary, details, at: state.time })
      state.events.push({ id: `budget-${state.time.tick}`, at: { ...state.time }, type: 'parliament', message: summary, dossierId: dossier?.id })
    }
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  function respondToCrisis(response) {
    const pending = state.crisis?.pendingResponse
    if (!pending || state.regime?.status !== 'in_power') return
    state.crisis = null
    const { population, politics } = state
    const pushCrisisEvent = (message, summary, details) => {
      const dossier = addDossier({ countryId: null, type: 'crisis_response', title: 'Crisis response brief', summary, details, at: state.time })
      state.events.push({ id: `response-${state.time.tick}`, at: { ...state.time }, type: 'crisis_response', message, dossierId: dossier?.id })
    }
    if (pending.type === 'protest') {
      const regionId = pending.region
      const bumpRegion = (delta) => {
        if (state.regions && regionId && state.regions[regionId] != null) state.regions[regionId] = clamp((state.regions[regionId] ?? 0.5) + delta, 0.05, 0.95)
      }
      if (response === 'dialogue') {
        state.population.publicApproval = clamp(population.publicApproval + 0.02, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) - 0.01, 0.1, 0.9)
        bumpRegion(0.04)
        pushCrisisEvent('You ordered dialogue with protesters. Approval rises slightly.', 'Dialogue with protesters. Approval rises slightly.', 'Talks held. Tensions eased.')
      } else if (response === 'crackdown') {
        state.population.publicApproval = clamp(population.publicApproval - 0.06, 0, 1)
        state.politics.coupRisk = clamp(politics.coupRisk + 0.04, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.03, 0.1, 0.9)
        bumpRegion(-0.1)
        pushCrisisEvent('Security crackdown on protesters. Approval drops; unrest grows.', 'Security crackdown on protesters. Approval drops; unrest grows.', 'Force used. Regional support fell.')
      } else if (response === 'ignore') {
        state.population.publicApproval = clamp(population.publicApproval - 0.03, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.02, 0.1, 0.9)
        bumpRegion(-0.05)
        pushCrisisEvent('No formal response. Protest fades but some lose faith.', 'No formal response. Protest fades but some lose faith.', 'Issue faded. Some approval lost.')
      } else if (response === 'address_nation') {
        state.population.publicApproval = clamp(population.publicApproval + 0.01, 0, 1)
        bumpRegion(0.02)
        pushCrisisEvent('You addressed the nation. Calm restored for now.', 'You addressed the nation. Calm restored for now.', 'National address. Calm restored.')
      }
    } else if (pending.type === 'scandal') {
      if (response === 'deny') {
        state.population.publicApproval = clamp(population.publicApproval - 0.02, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.02, 0.1, 0.9)
        pushCrisisEvent('You denied the allegations. Media skeptical.', 'You denied the allegations. Media skeptical.', 'Denial issued. Coverage mixed.')
      } else if (response === 'investigate') {
        state.population.publicApproval = clamp(population.publicApproval + 0.01, 0, 1)
        state.shocks.scandalLevel = clamp((state.shocks.scandalLevel || 0) - 0.1, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) - 0.01, 0.1, 0.9)
        pushCrisisEvent('You ordered an inquiry. Public sees accountability.', 'You ordered an inquiry. Public sees accountability.', 'Inquiry announced. Scandal level reduced.')
      } else if (response === 'ignore') {
        state.population.publicApproval = clamp(population.publicApproval - 0.04, 0, 1)
        if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + 0.03, 0.1, 0.9)
        pushCrisisEvent('No comment. Scandal drags on; approval falls.', 'No comment. Scandal drags on; approval falls.', 'No response. Story continued.')
      }
    }
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  function applyCabinetMeetingOutcome(success) {
    if (state.regime?.status !== 'in_power') return
    const last = state.meta?.lastCabinetTick ?? -999
    if (state.time.tick - last < COOLDOWN_MONTHS_TO_TICKS(6)) return
    state.meta.lastCabinetTick = state.time.tick
    const delta = success ? 0.02 : -0.01
    state.population.publicApproval = clamp(state.population.publicApproval + delta, 0, 1)
    const summary = success ? 'Cabinet meeting: unity behind your agenda.' : 'Cabinet meeting: ministers disagree on priorities.'
    const details = success ? 'Ministers aligned behind your priorities. Coordination strengthened.' : 'Some ministers raised concerns. Follow-up required.'
    const dossier = addDossier({ countryId: null, type: 'cabinet', title: 'Cabinet meeting brief', summary, details, at: state.time })
    state.events.push({
      id: `cabinet-${state.time.tick}`,
      at: { ...state.time },
      type: 'cabinet',
      message: summary,
      dossierId: dossier?.id,
    })
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  /** State address delivered: apply approval effect and push event. Cooldown 12 months. */
  function applyStateAddressOutcome(positive) {
    if (state.regime?.status !== 'in_power') return
    const last = state.meta?.lastStateAddressTick ?? -999
    if (state.time.tick - last < COOLDOWN_MONTHS_TO_TICKS(12)) return
    state.meta.lastStateAddressTick = state.time.tick
    const delta = positive ? 0.03 : -0.02
    state.population.publicApproval = clamp(state.population.publicApproval + delta, 0, 1)
    if (state.opposition) state.opposition.strength = clamp((state.opposition.strength || 0.35) + (positive ? -0.02 : 0.02), 0.1, 0.9)
    const summary = positive ? 'State address to Parliament: strong reception. Approval rises.' : 'State address to Parliament: lukewarm reception. Approval dips.'
    const details = positive ? 'Parliament and public responded well. Agenda reinforced.' : 'Mixed reception. Opposition critical.'
    const dossier = addDossier({ countryId: null, type: 'state_address', title: 'State of the Nation brief', summary, details, at: state.time })
    state.events.push({
      id: `state-address-${state.time.tick}`,
      at: { ...state.time },
      type: 'state_address',
      message: summary,
      dossierId: dossier?.id,
    })
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  const VISIT_REGION_COOLDOWN_TICKS = COOLDOWN_MONTHS_TO_TICKS(6)
  function applyVisitRegion(regionId) {
    if (state.regime?.status !== 'in_power' || !REGION_IDS.includes(regionId)) return
    const last = state.meta?.lastVisitRegionTick ?? -999
    if (state.time.tick - last < VISIT_REGION_COOLDOWN_TICKS) return
    state.meta.lastVisitRegionTick = state.time.tick
    const current = state.regions?.[regionId] ?? 0.5
    state.regions[regionId] = clamp(current + 0.06, 0.05, 0.95)
    state.population.publicApproval = clamp((state.population.publicApproval ?? 0.5) + 0.01, 0, 1)
    const summary = `President visited ${regionId}. Regional support strengthened.`
    const dossier = addDossier({ countryId: null, type: 'visit_region', title: `Visit brief — ${regionId}`, summary, details: `Regional rally and meetings in ${regionId}. Local approval increased. National approval nudged up.`, at: state.time })
    state.events.push({
      id: `visit-region-${state.time.tick}-${regionId}`,
      at: { ...state.time },
      type: 'visit_region',
      message: summary,
      dossierId: dossier?.id,
    })
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  const SECURITY_BRIEFING_COOLDOWN_TICKS = COOLDOWN_MONTHS_TO_TICKS(6)
  function applySecurityBriefingOutcome() {
    if (state.regime?.status !== 'in_power') return
    const last = state.meta?.lastSecurityBriefingTick ?? -999
    if (state.time.tick - last < SECURITY_BRIEFING_COOLDOWN_TICKS) return
    state.meta.lastSecurityBriefingTick = state.time.tick
    state.politics.coupRisk = clamp((state.politics.coupRisk ?? 0.2) - 0.02, 0.05, 0.95)
    const summary = 'Security briefing concluded. Threat assessment updated; coup risk slightly reduced.'
    const dossier = addDossier({ countryId: null, type: 'security_briefing', title: 'Security briefing brief', summary, details: 'Intel reviewed. No imminent threats. Coup risk assessment adjusted downward. Recommend continued monitoring.', at: state.time })
    state.events.push({
      id: `security-briefing-${state.time.tick}`,
      at: { ...state.time },
      type: 'security_briefing',
      message: summary,
      dossierId: dossier?.id,
    })
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  const PRESS_CONFERENCE_COOLDOWN_TICKS = COOLDOWN_MONTHS_TO_TICKS(6)
  function applyPressConferenceOutcome() {
    if (state.regime?.status !== 'in_power') return
    const last = state.meta?.lastPressConferenceTick ?? -999
    if (state.time.tick - last < PRESS_CONFERENCE_COOLDOWN_TICKS) return
    state.meta.lastPressConferenceTick = state.time.tick
    const approval = state.population?.publicApproval ?? 0.5
    const positive = approval >= 0.45
    const delta = positive ? 0.02 : -0.01
    state.population.publicApproval = clamp(approval + delta, 0, 1)
    const summary = positive ? 'Press conference: message landed well. Approval rises.' : 'Press conference: tough questions; approval dips.'
    const details = positive ? 'Key points well received. Headlines favourable.' : 'Some hostile questions. Coverage mixed.'
    const dossier = addDossier({ countryId: null, type: 'press_conference', title: 'Press conference brief', summary, details, at: state.time })
    state.events.push({
      id: `press-conference-${state.time.tick}`,
      at: { ...state.time },
      type: 'press_conference',
      message: summary,
      dossierId: dossier?.id,
    })
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  const LAUNCH_INFRASTRUCTURE_COOLDOWN_TICKS = COOLDOWN_MONTHS_TO_TICKS(6)
  function applyLaunchInfrastructure(regionId) {
    if (state.regime?.status !== 'in_power' || !REGION_IDS.includes(regionId)) return
    const last = state.meta?.lastLaunchInfrastructureTick ?? -999
    if (state.time.tick - last < LAUNCH_INFRASTRUCTURE_COOLDOWN_TICKS) return
    state.meta.lastLaunchInfrastructureTick = state.time.tick
    const current = state.regions?.[regionId] ?? 0.5
    state.regions[regionId] = clamp(current + 0.05, 0.05, 0.95)
    state.population.publicApproval = clamp((state.population.publicApproval ?? 0.5) + 0.015, 0, 1)
    const summary = `Infrastructure project launched in ${regionId}. Regional support and approval rise.`
    const dossier = addDossier({ countryId: null, type: 'launch_infrastructure', title: `Infrastructure launch — ${regionId}`, summary, details: `Ribbon-cutting and opening ceremony in ${regionId}. Regional and national approval increased.`, at: state.time })
    state.events.push({
      id: `launch-infra-${state.time.tick}-${regionId}`,
      at: { ...state.time },
      type: 'launch_infrastructure',
      message: summary,
      dossierId: dossier?.id,
    })
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  function addEvent(message, type = 'news', opts = {}) {
    if (!state.events) state.events = []
    const msg = String(message).trim()
    if (!msg) return
    const ev = {
      id: `event-${state.time.tick}-${Date.now()}`,
      at: { ...state.time },
      type: type || 'news',
      message: msg,
    }
    if (opts.dossierId) ev.dossierId = opts.dossierId
    state.events.push(ev)
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  function addDossier({ countryId, type = 'brief', title, summary, details, at }) {
    if (!state.desk) state.desk = { meetings: [], callLog: [], diary: [], proposedEvents: [], dossiers: [] }
    if (!Array.isArray(state.desk.dossiers)) state.desk.dossiers = []
    const id = `dossier-${state.time.tick}-${Date.now()}`
    const dossier = {
      id,
      countryId: countryId || null,
      type: type || 'brief',
      title: String(title || 'Brief').trim(),
      summary: String(summary || '').trim(),
      details: String(details || '').trim(),
      at: at ? { ...at } : { ...state.time },
    }
    state.desk.dossiers.push(dossier)
    if (state.desk.dossiers.length > 30) state.desk.dossiers.shift()
    return dossier
  }

  function getState() {
    return clone(state)
  }

  function scheduleMeeting(contactId, month, year) {
    if (!state.desk) state.desk = { meetings: [], callLog: [], diary: [], proposedEvents: [] }
    const id = `meeting-${state.time.tick}-${Math.random().toString(36).slice(2, 8)}`
    state.desk.meetings.push({ id, contactId, month: Number(month), year: Number(year), done: false })
  }

  function logCall(contactId) {
    if (!state.desk) state.desk = { meetings: [], callLog: [], diary: [], proposedEvents: [] }
    state.desk.callLog.push({ contactId, month: state.time.month, year: state.time.year, tick: state.time.tick })
    if (state.desk.callLog.length > 50) state.desk.callLog.shift()
  }

  function addDiaryEntry(text) {
    if (!state.desk) state.desk = { meetings: [], callLog: [], diary: [], proposedEvents: [] }
    const t = String(text).trim()
    if (!t) return
    state.desk.diary.push({ tick: state.time.tick, month: state.time.month, year: state.time.year, text: t })
    if (state.desk.diary.length > 100) state.desk.diary.shift()
  }

  function addProposedEvent(month, year, title) {
    if (!state.desk) state.desk = { meetings: [], callLog: [], diary: [], proposedEvents: [] }
    state.desk.proposedEvents.push({ month: Number(month), year: Number(year), title: String(title).trim() || 'Event' })
  }

  function dismissMeeting(meetingId) {
    const m = state.desk?.meetings?.find((x) => x.id === meetingId)
    if (m) m.done = true
    state.pendingMeeting = null
  }

  const MEET_FOREIGN_COOLDOWN_TICKS = COOLDOWN_MONTHS_TO_TICKS(6)
  function applyMeetForeignLeader(countryId) {
    if (state.regime?.status !== 'in_power' || !COUNTRY_IDS.includes(countryId)) return
    const last = state.international?.lastMeetForeignTick ?? -999
    if (state.time.tick - last < MEET_FOREIGN_COOLDOWN_TICKS) return
    state.international.lastMeetForeignTick = state.time.tick
    const r = state.international.relations[countryId] ?? 0.5
    state.international.relations[countryId] = clamp(r + 0.08, 0.2, 0.9)
    const countryName = getCountry(countryId)?.name ?? countryId
    const summary = `Bilateral meeting with ${countryName} concluded. Relations improved.`
    const dossier = addDossier({ countryId, type: 'state_visit', title: `Bilateral meeting brief — ${countryName}`, summary, details: `Meeting at palace. Relations strengthened. Follow-up agreed.`, at: state.time })
    state.events.push({
      id: `meet-foreign-${state.time.tick}-${countryId}`,
      at: { ...state.time },
      type: 'state_address',
      message: summary,
      dossierId: dossier?.id,
    })
    if (state.events.length > 60) state.events.splice(0, state.events.length - 60)
  }

  return {
    getState,
    tick,
    addEvent,
    addDossier,
    applyPolicy,
    setBudgetPie,
    applyStateAddressOutcome,
    tableBudget,
    respondToCrisis,
    applyCabinetMeetingOutcome,
    scheduleMeeting,
    logCall,
    addDiaryEntry,
    addProposedEvent,
    dismissMeeting,
    applyMeetForeignLeader,
    applyVisitRegion,
    applySecurityBriefingOutcome,
    applyPressConferenceOutcome,
    applyLaunchInfrastructure,
    policyDefs: POLICY_DEFS,
  }
}
