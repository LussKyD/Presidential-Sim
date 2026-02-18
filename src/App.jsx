import { useState, useEffect } from 'react'
import MainLayout from './ui/layout/MainLayout'
import Dashboard from './ui/components/Dashboard'
import PolicyPanel from './ui/components/PolicyPanel'
import TermSummary from './ui/components/TermSummary'
import WorldView from './ui/components/WorldView'
import DeskPanel from './ui/components/DeskPanel'
import CrisisResponsePanel from './ui/components/CrisisResponsePanel'
import { useSimulation, SAVE_KEY } from './ui/hooks/useSimulation'
import { POLICY_PRESETS, BUDGET_PIE_IDS } from './core/constants/policyEffects'
import { STATE_ADDRESS_PHASES } from './core/constants/activities'

const SPEEDS = [
  { value: 0.5, label: '0.5×' },
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
]

const STATE_ADDRESS_COOLDOWN_MONTHS = 12

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
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  const { state, engine, applyPolicy, setBudgetPie, applyStateAddressOutcome, tableBudget, respondToCrisis, applyCabinetMeetingOutcome, isRunning, toggleRunning, tick } = useSimulation({
    tickMs: 2000 / speed,
    seed,
    gameKey,
    initialSave,
  })

  const [view, setView] = useState('office')
  const [stateAddressPhase, setStateAddressPhase] = useState(null)

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
    const vals = BUDGET_PIE_IDS.map((id) => preset.policies[id] ?? 0)
    setBudgetPie(...vals)
  }

  const regime = state?.regime
  const outOfPower = regime && regime.status !== 'in_power'

  const lastStateAddressTick = state?.meta?.lastStateAddressTick ?? -999
  const currentTick = state?.time?.tick ?? 0
  const stateAddressCooldown = (() => {
    const elapsed = currentTick - lastStateAddressTick
    if (elapsed >= STATE_ADDRESS_COOLDOWN_MONTHS) return 0
    return STATE_ADDRESS_COOLDOWN_MONTHS - elapsed
  })()

  function startStateAddress() {
    if (outOfPower || stateAddressCooldown > 0 || stateAddressPhase) return
    setStateAddressPhase(STATE_ADDRESS_PHASES.PLANNING)
  }

  useEffect(() => {
    if (stateAddressPhase !== STATE_ADDRESS_PHASES.PLANNING) return
    const t = window.setTimeout(() => setStateAddressPhase(STATE_ADDRESS_PHASES.SECURITY), 1500)
    return () => clearTimeout(t)
  }, [stateAddressPhase])

  useEffect(() => {
    if (stateAddressPhase !== STATE_ADDRESS_PHASES.SECURITY) return
    const t = window.setTimeout(() => setStateAddressPhase(STATE_ADDRESS_PHASES.WALK_TO_CARS), 1500)
    return () => clearTimeout(t)
  }, [stateAddressPhase])

  function handlePhaseComplete(phase) {
    if (phase === STATE_ADDRESS_PHASES.WALK_TO_CARS) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.AT_CARS)
      window.setTimeout(() => setStateAddressPhase(STATE_ADDRESS_PHASES.MOTORCADE_TO_PARLIAMENT), 800)
    } else if (phase === STATE_ADDRESS_PHASES.MOTORCADE_TO_PARLIAMENT) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.AT_PARLIAMENT)
      window.setTimeout(() => setStateAddressPhase(STATE_ADDRESS_PHASES.ENTER_PARLIAMENT), 600)
    } else if (phase === STATE_ADDRESS_PHASES.ENTER_PARLIAMENT) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.SPEECH)
    } else if (phase === STATE_ADDRESS_PHASES.EXIT_PARLIAMENT) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.MOTORCADE_TO_PALACE)
    } else if (phase === STATE_ADDRESS_PHASES.MOTORCADE_TO_PALACE) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.AT_PALACE)
      window.setTimeout(() => setStateAddressPhase(STATE_ADDRESS_PHASES.WALK_TO_OFFICE), 600)
    } else if (phase === STATE_ADDRESS_PHASES.WALK_TO_OFFICE) {
      setStateAddressPhase(null)
    }
  }

  function handleSpeechDone() {
    const positive = (state?.population?.publicApproval ?? 0.5) >= 0.45
    applyStateAddressOutcome(positive)
    setStateAddressPhase(STATE_ADDRESS_PHASES.EXIT_PARLIAMENT)
  }

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== 'Space' || e.target?.closest('input, button, [contenteditable]')) return
      e.preventDefault()
      if (!outOfPower) toggleRunning()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [outOfPower, toggleRunning])

  const isWorldView = view === 'office' || view === 'map'
  const pendingCrisis = state?.crisis?.pendingResponse

  return (
    <MainLayout view={view} onViewChange={setView}>
      {pendingCrisis && <CrisisResponsePanel pending={pendingCrisis} onRespond={respondToCrisis} />}
      {outOfPower && (
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
      )}
      {outOfPower && <TermSummary state={state} />}
      {outOfPower && (
        <button onClick={startNewGame} style={{ ...buttonStyle, marginTop: 8 }}>
          New game
        </button>
      )}

      {isWorldView ? (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 2rem)', margin: '-1.5rem', marginTop: outOfPower ? 12 : undefined, opacity: outOfPower ? 0.6 : 1 }}>
          <div style={{ flex: 1, minHeight: 380 }}>
            <WorldView
              state={state}
              viewMode={view}
              activityPhase={stateAddressPhase}
              onPhaseComplete={handlePhaseComplete}
              onSpeechDone={handleSpeechDone}
            />
          </div>
          <DeskPanel
            state={state}
            isRunning={isRunning}
            toggleRunning={toggleRunning}
            tick={tick}
            speed={speed}
            setSpeed={setSpeed}
            startNewGame={startNewGame}
            applyPolicy={applyPolicy}
            applyPreset={applyPreset}
            policyDefs={engine?.policyDefs ?? []}
            presets={POLICY_PRESETS}
            outOfPower={outOfPower}
            onStateAddress={startStateAddress}
            stateAddressPhase={stateAddressPhase}
            stateAddressCooldown={stateAddressCooldown}
            speeds={SPEEDS}
            tableBudget={tableBudget}
            budgetDue={state?.calendar?.budgetDue}
            parliamentSupport={state?.parliament?.support}
            onCabinetMeeting={applyCabinetMeetingOutcome}
            cabinetCooldown={state?.meta?.lastCabinetTick != null && (state?.time?.tick ?? 0) - state.meta.lastCabinetTick < 6}
          />
        </div>
      ) : (
        <>
          <h1>Presidential Sim — Alpha</h1>
          <p style={{ color: '#8b98a5', marginTop: 0 }}>
            One tick = one month. Adjust policies and watch the country react. Systemic consequences, not scripted story.
          </p>
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setShowHowToPlay((v) => !v)}
              style={{
                background: 'none',
                border: 'none',
                color: '#8b98a5',
                cursor: 'pointer',
                fontSize: 12,
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              {showHowToPlay ? 'Hide' : 'How to play'}
            </button>
            {showHowToPlay && (
              <p style={{ color: '#6e767d', fontSize: 12, marginTop: 6, maxWidth: 560 }}>
                Set policies with the sliders (or use Liberal / Conservative / Authoritarian presets). Keep approval up and coup risk down. Elections run every 4 years — low approval makes losing likely. Avoid coups by keeping military and elites satisfied. Use <kbd style={{ background: '#2f3336', padding: '2px 6px', borderRadius: 4 }}>Space</kbd> to pause. Office view: you in the president&apos;s seat; deliver a state address to move to Parliament. Progress is saved automatically; New game starts fresh.
              </p>
            )}
          </div>

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
        </>
      )}
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
