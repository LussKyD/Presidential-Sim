/** Coup risk from military loyalty, elite satisfaction, unrest. */
import { clamp } from '../../utils/mathHelpers'

export function updatePolitics(state) {
  const p = state.government.policies
  const shocks = state.shocks

  const militaryBudgetSatisfaction = clamp(p.defenseSpending, 0, 1)
  const commanderLoyalty = clamp(shocks.commanderLoyalty, 0, 1)
  const ethnicAlignment = clamp(shocks.ethnicAlignment, 0, 1)

  const militaryDisloyalty = clamp(
    1 - (militaryBudgetSatisfaction + commanderLoyalty + ethnicAlignment) / 3,
    0,
    1,
  )

  const publicUnrest = clamp(
    state.economy.unemployment * 2 + state.economy.inflation * 2.5 + p.corruptionLevel * 1.2,
    0,
    1,
  )

  const eliteDissatisfaction = clamp(
    (1 - state.population.publicApproval) * 0.7 + p.corruptionLevel * 0.3,
    0,
    1,
  )

  const foreignInterference = clamp(shocks.foreignInterference, 0, 1)

  const coupRisk = clamp(
    militaryDisloyalty * 0.4 +
      eliteDissatisfaction * 0.3 +
      publicUnrest * 0.2 +
      foreignInterference * 0.1,
    0,
    1,
  )

  state.politics.coupRisk = coupRisk
  // Transparency: what’s driving coup risk
  state.politics.coupDrivers = [
    { id: 'military', label: 'Military disloyalty', effect: militaryDisloyalty * 0.4 },
    { id: 'elite', label: 'Elite dissatisfaction', effect: eliteDissatisfaction * 0.3 },
    { id: 'unrest', label: 'Public unrest', effect: publicUnrest * 0.2 },
    { id: 'foreign', label: 'Foreign interference', effect: foreignInterference * 0.1 },
  ]
  return state
}
