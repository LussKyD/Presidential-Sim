import { useState, useEffect } from 'react'
import MainLayout from './ui/layout/MainLayout'
import Dashboard from './ui/components/Dashboard'
import PolicyPanel from './ui/components/PolicyPanel'
import TermSummary from './ui/components/TermSummary'
import WorldView from './ui/components/WorldView'
import { useSimulation, SAVE_KEY } from './ui/hooks/useSimulation'
import { POLICY_PRESETS } from './core/constants/policyEffects'

const SPEEDS = [
  { value: 0.5, label: '0.5×' },
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
]

function getStoredSave() {
  try {
    const s = localStorage.getItem(SAVE_KEY)
    const data = s ? JSON.parse(s) : null
    return data?.regime?.status === 'in_power' ? data : null
  } catch {
    return null
  }
}

function App() {
  const [speed, setSpeed] = useState(1)
  const [gameKey, setGameKey] = useState(0)
  const [seed, setSeed] = useState(1)
  const [initialSave, setInitialSave] = useState(() => getStoredSave())
  const [view, setView] = useState('dashboard')

  const { state, engine, applyPolicy, isRunning, toggleRunning, tick } = useSimulation({
    tickMs: 2000 / speed,
    seed,
    gameKey,
    initialSave,
  })

  function startNewGame() {
    try { localStorage.removeItem(SAVE_KEY) } catch (_) {}
    setInitialSave(null)
    setGameKey((k) => k + 1)
    setSeed(Math.floor(Date.now() % 1e9))
  }

  function applyPreset(presetId) {
    const preset = POLICY_PRESETS[presetId]
    if (!preset?.policies) return
    Object.entries(preset.policies).forEach(([policyId, value]) => applyPolicy(policyId, value))
  }

  const regime = state?.regime
  const outOfPower = regime && regime.status !== 'in_power'

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== 'Space' || e.target?.closest('input, button, [contenteditable]')) return
      e.preventDefault()
      if (!outOfPower) toggleRunning()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [outOfPower, toggleRunning])

  return (
    <MainLayout view={view} onViewChange={setView}>
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
          <button onClick={startNewGame} style={{ ...buttonStyle, marginTop: 8 }}>
            New game
          </button>
        </>
      )}

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap', opacity: outOfPower ? 0.6 : 1 }}>
        <div style={{ flex: '2 1 520px', minWidth: 320 }}>
          {view === 'map' ? (
            <WorldView state={state} />
          ) : (
            <Dashboard state={state} />
          )}
        </div>
        <div style={{ flex: '1 1 340px', minWidth: 280 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={toggleRunning} style={buttonStyle} disabled={outOfPower}>
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={tick} style={buttonStyle} disabled={isRunning || outOfPower}>
              Step month
            </button>
            <button onClick={startNewGame} style={{ ...buttonStyle, background: '#2f3336', color: '#e7e9ea' }} disabled={outOfPower}>
              New game
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
            presets={POLICY_PRESETS}
            onPresetSelect={outOfPower ? undefined : applyPreset}
            disabled={outOfPower}
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
