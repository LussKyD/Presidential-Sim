/** Policy levers and UI metadata (MVP). */
export const POLICY_DEFS = [
  {
    id: 'infrastructureSpending',
    label: 'Infrastructure Spending',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.4,
  },
  {
    id: 'educationSpending',
    label: 'Education Spending',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.35,
  },
  {
    id: 'defenseSpending',
    label: 'Defense Spending',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.4,
  },
  {
    id: 'policeFunding',
    label: 'Police Funding',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.35,
  },
  {
    id: 'corruptionLevel',
    label: 'Corruption Level',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.25,
  },
  {
    id: 'moneyPrinting',
    label: 'Money Printing',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.2,
  },
  {
    id: 'interestRate',
    label: 'Interest Rate',
    min: 0,
    max: 0.2,
    step: 0.001,
    default: 0.05,
  },
  {
    id: 'pressFreedom',
    label: 'Press Freedom',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.6,
  },
  {
    id: 'foreignInvestment',
    label: 'Foreign Investment',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.45,
  },
]

export const POLICY_DEFAULTS = Object.fromEntries(
  POLICY_DEFS.map((p) => [p.id, p.default]),
)
