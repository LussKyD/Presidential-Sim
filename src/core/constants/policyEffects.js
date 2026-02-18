/** Four spending categories form a single pie (must sum to 1). */
export const BUDGET_PIE_IDS = ['infrastructureSpending', 'educationSpending', 'defenseSpending', 'policeFunding']

/** Policy levers and UI metadata (MVP). */
export const POLICY_DEFS = [
  { id: 'infrastructureSpending', label: 'Infrastructure Spending', min: 0, max: 1, step: 0.01, default: 0.4, affects: 'GDP growth' },
  { id: 'educationSpending', label: 'Education Spending', min: 0, max: 1, step: 0.01, default: 0.35, affects: 'GDP growth' },
  { id: 'defenseSpending', label: 'Defense Spending', min: 0, max: 1, step: 0.01, default: 0.4, affects: 'Military loyalty, coup risk' },
  { id: 'policeFunding', label: 'Police Funding', min: 0, max: 1, step: 0.01, default: 0.35, affects: 'Protest chance' },
  { id: 'corruptionLevel', label: 'Corruption Level', min: 0, max: 1, step: 0.01, default: 0.25, affects: 'Approval, coup risk, protests' },
  { id: 'moneyPrinting', label: 'Money Printing', min: 0, max: 1, step: 0.01, default: 0.2, affects: 'Inflation' },
  { id: 'interestRate', label: 'Interest Rate', min: 0, max: 0.2, step: 0.001, default: 0.05, affects: 'Inflation' },
  { id: 'pressFreedom', label: 'Press Freedom', min: 0, max: 1, step: 0.01, default: 0.6, affects: 'Approval (media)' },
  { id: 'foreignInvestment', label: 'Foreign Investment', min: 0, max: 1, step: 0.01, default: 0.45, affects: 'GDP growth' },
]

export const POLICY_DEFAULTS = Object.fromEntries(
  POLICY_DEFS.map((p) => [p.id, p.default]),
)

/** Presets: Liberal, Conservative, Authoritarian (slider values). */
export const POLICY_PRESETS = {
  liberal: {
    label: 'Liberal',
    policies: {
      infrastructureSpending: 0.55,
      educationSpending: 0.5,
      defenseSpending: 0.3,
      policeFunding: 0.3,
      corruptionLevel: 0.15,
      moneyPrinting: 0.15,
      interestRate: 0.04,
      pressFreedom: 0.85,
      foreignInvestment: 0.6,
    },
  },
  conservative: {
    label: 'Conservative',
    policies: {
      infrastructureSpending: 0.35,
      educationSpending: 0.3,
      defenseSpending: 0.55,
      policeFunding: 0.5,
      corruptionLevel: 0.2,
      moneyPrinting: 0.1,
      interestRate: 0.06,
      pressFreedom: 0.5,
      foreignInvestment: 0.5,
    },
  },
  authoritarian: {
    label: 'Authoritarian',
    policies: {
      infrastructureSpending: 0.4,
      educationSpending: 0.25,
      defenseSpending: 0.65,
      policeFunding: 0.7,
      corruptionLevel: 0.5,
      moneyPrinting: 0.35,
      interestRate: 0.03,
      pressFreedom: 0.2,
      foreignInvestment: 0.35,
    },
  },
}
