import { useState } from 'react'
import MainLayout from './ui/layout/MainLayout'
import Dashboard from './ui/components/Dashboard'
import PolicyPanel from './ui/components/PolicyPanel'
import TermSummary from './ui/components/TermSummary'
import { useSimulation } from './ui/hooks/useSimulation'

const SPEEDS = [
  { value: 0.5, label: '0.5×' },
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
]

function App() {
  const [speed, setSpeed] = useState(1)
  const { state, engine, applyPolicy, isRunning, toggleRunning, tick } = useSimulation({
    tickMs: 2000 / speed,
    seed: 1,
  })

  const regime = state?.regime
  const outOfPower = regime && regime.status !== 'in_power'

  return (
    <MainLayout>
      <h1>Presidential Sim — Alpha</h1>
      <p style={{ color: '#8b98a5', marginTop: 0 }}>
        One tick = one month. Adjust policies and watch the country react. Systemic consequences, not scripted story.
      </p>

      {outOfPower && (
        <>
          <div
            style={{
              marginBottom: 12,
              padding: '0.6rem 0.9rem',
              borderRadius: 10,
              border: '1px solid #f4212e',
              background: '#1c0f10',
              color: '#ffd2d2',
              fontSize: 13,
            }}
          >
            <strong>Out of power:</strong> {regime.endReason}
          </div>
          <TermSummary state={state} />
        </>
      )}

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap', opacity: outOfPower ? 0.6 : 1 }}>
        <div style={{ flex: '2 1 520px', minWidth: 320 }}>
          <Dashboard state={state} />
        </div>
        <div style={{ flex: '1 1 340px', minWidth: 280 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={toggleRunning} style={buttonStyle} disabled={outOfPower}>
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={tick} style={buttonStyle} disabled={isRunning || outOfPower}>
              Step month
            </button>
            <span style={{ color: '#8b98a5', fontSize: 12 }}>Speed:</span>
            {SPEEDS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSpeed(value)}
                style={{
                  ...buttonStyle,
                  background: speed === value ? '#2f3336' : 'transparent',
                  color: speed === value ? '#e7e9ea' : '#8b98a5',
                  padding: '0.35rem 0.5rem',
                  fontSize: 12,
                }}
                disabled={outOfPower}
              >
                {label}
              </button>
            ))}
          </div>
          <PolicyPanel
            policies={engine?.policyDefs ?? []}
            values={state?.government?.policies}
            onChange={outOfPower ? undefined : applyPolicy}
          />
        </div>
      </div>
    </MainLayout>
  )
}

const buttonStyle = {
  background: '#1d9bf0',
  color: '#0f1419',
  border: 'none',
  padding: '0.55rem 0.75rem',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
}

export default App
