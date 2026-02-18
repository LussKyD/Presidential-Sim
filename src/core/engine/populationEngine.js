/** Aggregate approval from economy, ideology, media, corruption. */
import { clamp } from '../../utils/mathHelpers'

export function updatePopulation(state) {
  const { inflation, unemployment } = state.economy
  const p = state.government.policies
  const shocks = state.shocks

  // Aggregate satisfaction proxy: punishes inflation + unemployment.
  const economicSatisfaction = clamp(1 - inflation * 1.8 - unemployment * 2.2, 0, 1)

  // Placeholder until ideology system lands.
  const ideologicalAlignment = 0.5

  // Media influence proxy from freedom + scandals.
  const stateControl = clamp(1 - p.pressFreedom, 0, 1)
  const mediaTone = clamp(
    p.pressFreedom * 0.5 - stateControl * 0.4 + shocks.scandalLevel * 0.3,
    -1,
    1,
  )
  const mediaInfluence = clamp(0.5 + mediaTone * 0.5, 0, 1)

  const corruptionPerception = clamp(p.corruptionLevel, 0, 1)

  const approval = clamp(
    economicSatisfaction * 0.4 +
      ideologicalAlignment * 0.3 +
      mediaInfluence * 0.2 -
      corruptionPerception * 0.3,
    0,
    1,
  )

  state.population.publicApproval = approval
  // Cause-effect transparency (vs spreadsheet sims): what’s moving the number
  state.population.approvalDrivers = [
    { id: 'economy', label: 'Economy (inflation & jobs)', effect: economicSatisfaction * 0.4 },
    { id: 'ideology', label: 'Ideological fit', effect: ideologicalAlignment * 0.3 },
    { id: 'media', label: 'Media & trust', effect: mediaInfluence * 0.2 },
    { id: 'corruption', label: 'Corruption perception', effect: -corruptionPerception * 0.3 },
  ]
  return state
}
