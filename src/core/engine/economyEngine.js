/** GDP, inflation, unemployment from policy and shocks. */
import { clamp } from '../../utils/mathHelpers'

const DEFAULTS = {
  baseGrowth: 0.015,
  baseUnemployment: 0.06,
}

export function updateEconomy(state) {
  const p = state.government.policies
  const shocks = state.shocks

  const gdpGrowth =
    DEFAULTS.baseGrowth +
    p.infrastructureSpending * 0.02 +
    p.educationSpending * 0.015 -
    p.corruptionLevel * 0.03 -
    shocks.politicalInstability * 0.02 +
    p.foreignInvestment * 0.025

  const nextGdp = Math.max(0, state.economy.gdp * (1 + gdpGrowth))

  const inflation = clamp(
    p.moneyPrinting * 0.05 + shocks.supplyShock * 0.03 - p.interestRate * 0.04,
    0,
    0.4,
  )

  const unemployment = clamp(
    DEFAULTS.baseUnemployment - gdpGrowth * 0.5 + shocks.automationPolicy * 0.02,
    0,
    0.35,
  )

  state.economy.gdp = nextGdp
  state.economy.gdpGrowth = gdpGrowth
  state.economy.inflation = inflation
  state.economy.unemployment = unemployment

  if (state.time.day === 1) {
    state.economy.history.push({
      year: state.time.year,
      month: state.time.month,
      gdp: nextGdp,
      inflation,
      unemployment,
    })
  }

  return state
}
