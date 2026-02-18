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
