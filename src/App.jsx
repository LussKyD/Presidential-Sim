import { useState, useEffect, useRef } from 'react'
import MainLayout from './ui/layout/MainLayout'
import Dashboard from './ui/components/Dashboard'
import PolicyPanel from './ui/components/PolicyPanel'
import TermSummary from './ui/components/TermSummary'
import WorldView from './ui/components/WorldView'
import DeskPanel from './ui/components/DeskPanel'
import CrisisResponsePanel from './ui/components/CrisisResponsePanel'
import TabletPanel from './ui/components/TabletPanel'
import MeetingModal from './ui/components/MeetingModal'
import MeetForeignModal from './ui/components/MeetForeignModal'
import StateVisitView from './ui/components/StateVisitView'
import VisitRegionModal from './ui/components/VisitRegionModal'
import VisitRegionView from './ui/components/VisitRegionView'
import SecurityBriefingView from './ui/components/SecurityBriefingView'
import PressConferenceView from './ui/components/PressConferenceView'
import LaunchInfrastructureModal from './ui/components/LaunchInfrastructureModal'
import LaunchInfrastructureView from './ui/components/LaunchInfrastructureView'
import CabinetMeetingView from './ui/components/CabinetMeetingView'
import DossierModal from './ui/components/DossierModal'
import { useSimulation, SAVE_KEY } from './ui/hooks/useSimulation'
import { POLICY_PRESETS, BUDGET_PIE_IDS } from './core/constants/policyEffects'
import { STATE_ADDRESS_PHASES, STATE_VISIT_PHASES, STATE_VISIT_PHASE_ORDER, VISIT_REGION_PHASES, VISIT_REGION_PHASE_ORDER, SECURITY_BRIEFING_PHASES, SECURITY_BRIEFING_PHASE_ORDER, PRESS_CONFERENCE_PHASES, PRESS_CONFERENCE_PHASE_ORDER, LAUNCH_INFRASTRUCTURE_PHASES, LAUNCH_INFRASTRUCTURE_PHASE_ORDER } from './core/constants/activities'
import { getCountry } from './core/constants/international'

const SPEEDS = [
  { value: 0.5, label: '0.5×' },
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
]

const STATE_ADDRESS_COOLDOWN_MONTHS = 12
const SIX_MONTHS_IN_DAYS = 42 // 6 months × 7 days per month

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
  const [openDossierId, setOpenDossierId] = useState(null)

  const { state, engine, applyPolicy, setBudgetPie, applyStateAddressOutcome, tableBudget, respondToCrisis, applyCabinetMeetingOutcome, scheduleMeeting, logCall, addDiaryEntry, addProposedEvent, dismissMeeting, applyMeetForeignLeader, applyVisitRegion, applySecurityBriefingOutcome, applyPressConferenceOutcome, applyLaunchInfrastructure, addEvent, addDossier, isRunning, toggleRunning, tick } = useSimulation({
    tickMs: 2000 / speed,
    seed,
    gameKey,
    initialSave,
  })

  const [view, setView] = useState('office')
  const [stateAddressPhase, setStateAddressPhase] = useState(null)
  const [speechReady, setSpeechReady] = useState(false)
  const [tabletOpen, setTabletOpen] = useState(false)
  const [showMeetForeignModal, setShowMeetForeignModal] = useState(false)
  const [stateVisitPhase, setStateVisitPhase] = useState(null)
  const [stateVisitCountry, setStateVisitCountry] = useState(null)
  const [showVisitRegionModal, setShowVisitRegionModal] = useState(false)
  const [visitRegionPhase, setVisitRegionPhase] = useState(null)
  const [visitRegionId, setVisitRegionId] = useState(null)
  const [securityBriefingPhase, setSecurityBriefingPhase] = useState(null)
  const [pressConferencePhase, setPressConferencePhase] = useState(null)
  const [cabinetMeetingActive, setCabinetMeetingActive] = useState(false)
  const [showLaunchInfrastructureModal, setShowLaunchInfrastructureModal] = useState(false)
  const [launchInfrastructurePhase, setLaunchInfrastructurePhase] = useState(null)
  const [launchInfrastructureRegion, setLaunchInfrastructureRegion] = useState(null)
  const worldViewRef = useRef(null)

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
    const elapsedDays = currentTick - lastStateAddressTick
    const elapsedMonths = Math.floor(elapsedDays / 7)
    if (elapsedMonths >= STATE_ADDRESS_COOLDOWN_MONTHS) return 0
    const remaining = STATE_ADDRESS_COOLDOWN_MONTHS - elapsedMonths
    return Math.min(STATE_ADDRESS_COOLDOWN_MONTHS, Math.max(0, remaining))
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
    } else if (phase === STATE_ADDRESS_PHASES.MOTORCADE_TO_PARLIAMENT) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.AT_PARLIAMENT)
    } else if (phase === STATE_ADDRESS_PHASES.ENTER_PARLIAMENT) {
      setSpeechReady(false)
      setStateAddressPhase(STATE_ADDRESS_PHASES.SPEECH)
    } else if (phase === STATE_ADDRESS_PHASES.EXIT_PARLIAMENT) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.MOTORCADE_TO_PALACE)
    } else if (phase === STATE_ADDRESS_PHASES.MOTORCADE_TO_PALACE) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.AT_PALACE)
    } else if (phase === STATE_ADDRESS_PHASES.WALK_TO_OFFICE) {
      setStateAddressPhase(null)
    }
  }

  function advanceStateAddress() {
    if (!stateAddressPhase) return
    if (stateAddressPhase === STATE_ADDRESS_PHASES.AT_CARS) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.MOTORCADE_TO_PARLIAMENT)
    } else if (stateAddressPhase === STATE_ADDRESS_PHASES.AT_PARLIAMENT) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.ENTER_PARLIAMENT)
    } else if (stateAddressPhase === STATE_ADDRESS_PHASES.AT_PALACE) {
      setStateAddressPhase(STATE_ADDRESS_PHASES.WALK_TO_OFFICE)
    } else if (stateAddressPhase === STATE_ADDRESS_PHASES.SPEECH && speechReady) {
      const positive = (state?.population?.publicApproval ?? 0.5) >= 0.45
      applyStateAddressOutcome(positive)
      setSpeechReady(false)
      setStateAddressPhase(STATE_ADDRESS_PHASES.EXIT_PARLIAMENT)
    }
  }

  // Speech outcome is applied when user clicks "Leave chamber" in advanceStateAddress

  // Safety: if any non-speech state-address phase hangs (e.g. tab switch stops 3D animation),
  // clear it after a grace period so the desk can't stay blocked forever.
  useEffect(() => {
    if (!stateAddressPhase || stateAddressPhase === STATE_ADDRESS_PHASES.SPEECH) return
    const t = window.setTimeout(
      () => setStateAddressPhase((p) => (p === stateAddressPhase ? null : p)),
      20000,
    )
    return () => clearTimeout(t)
  }, [stateAddressPhase])

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
    <>
      {tabletOpen && (
        <TabletPanel
          state={state}
          onClose={() => setTabletOpen(false)}
          onAddDiaryEntry={addDiaryEntry}
          onAddProposedEvent={addProposedEvent}
          onLogCall={logCall}
          onScheduleMeeting={scheduleMeeting}
        />
      )}
      {state?.pendingMeeting && (
        <MeetingModal meeting={state.pendingMeeting} onDismiss={dismissMeeting} />
      )}
      {showMeetForeignModal && (
        <MeetForeignModal
          state={state}
          onPick={(id) => {
            setStateVisitCountry(id)
            setShowMeetForeignModal(false)
            setStateVisitPhase(STATE_VISIT_PHASES.HANDOVER)
            addEvent(`President departs for ${getCountry(id)?.name ?? id}.`, 'state_visit')
          }}
          onClose={() => setShowMeetForeignModal(false)}
        />
      )}
      {stateVisitPhase && stateVisitPhase !== STATE_VISIT_PHASES.MOTORCADE_TO_AIRPORT && stateVisitPhase !== STATE_VISIT_PHASES.RETURN_TO_OFFICE && (
        <StateVisitView
          phase={stateVisitPhase}
          countryName={getCountry(stateVisitCountry)?.name ?? ''}
          leaderName={getCountry(stateVisitCountry)?.leader ?? ''}
          onAdvance={() => {
            const idx = STATE_VISIT_PHASE_ORDER.indexOf(stateVisitPhase)
            if (stateVisitPhase === STATE_VISIT_PHASES.ARRIVAL) addEvent(`President arrives in ${getCountry(stateVisitCountry)?.name ?? stateVisitCountry}.`, 'state_visit')
            if (stateVisitPhase === STATE_VISIT_PHASES.MEETING_AT_PALACE) applyMeetForeignLeader(stateVisitCountry)
            if (idx < 0 || idx >= STATE_VISIT_PHASE_ORDER.length - 1) {
              setStateVisitPhase(null)
              setStateVisitCountry(null)
            } else {
              setStateVisitPhase(STATE_VISIT_PHASE_ORDER[idx + 1])
            }
          }}
        />
      )}
      {showVisitRegionModal && (
        <VisitRegionModal
          state={state}
          onPick={(id) => {
            setVisitRegionId(id)
            setShowVisitRegionModal(false)
            setVisitRegionPhase(VISIT_REGION_PHASES.DEPART)
            addEvent(`President leaves for visit to ${id}.`, 'news')
          }}
          onClose={() => setShowVisitRegionModal(false)}
        />
      )}
      {visitRegionPhase && visitRegionPhase !== VISIT_REGION_PHASES.MOTORCADE && visitRegionPhase !== VISIT_REGION_PHASES.RETURN && (
        <VisitRegionView
          phase={visitRegionPhase}
          regionName={visitRegionId ?? ''}
          onAdvance={() => {
            const idx = VISIT_REGION_PHASE_ORDER.indexOf(visitRegionPhase)
            if (visitRegionPhase === VISIT_REGION_PHASES.IN_REGION) applyVisitRegion(visitRegionId)
            if (visitRegionPhase === VISIT_REGION_PHASES.RETURN) addEvent('President returns to palace.', 'news')
            if (idx < 0 || idx >= VISIT_REGION_PHASE_ORDER.length - 1) {
              setVisitRegionPhase(null)
              setVisitRegionId(null)
            } else {
              setVisitRegionPhase(VISIT_REGION_PHASE_ORDER[idx + 1])
            }
          }}
        />
      )}
      {securityBriefingPhase && (
        <SecurityBriefingView
          phase={securityBriefingPhase}
          onAdvance={() => {
            const idx = SECURITY_BRIEFING_PHASE_ORDER.indexOf(securityBriefingPhase)
            if (securityBriefingPhase === SECURITY_BRIEFING_PHASES.DECISION) applySecurityBriefingOutcome()
            if (idx < 0 || idx >= SECURITY_BRIEFING_PHASE_ORDER.length - 1) {
              setSecurityBriefingPhase(null)
            } else {
              setSecurityBriefingPhase(SECURITY_BRIEFING_PHASE_ORDER[idx + 1])
            }
          }}
        />
      )}
      {cabinetMeetingActive && (
        <CabinetMeetingView
          onChoose={(success) => {
            applyCabinetMeetingOutcome(success)
            setCabinetMeetingActive(false)
          }}
        />
      )}
      {pressConferencePhase && (
        <PressConferenceView
          phase={pressConferencePhase}
          onAdvance={() => {
            const idx = PRESS_CONFERENCE_PHASE_ORDER.indexOf(pressConferencePhase)
            if (pressConferencePhase === PRESS_CONFERENCE_PHASES.HEADLINE) applyPressConferenceOutcome()
            if (idx < 0 || idx >= PRESS_CONFERENCE_PHASE_ORDER.length - 1) {
              setPressConferencePhase(null)
            } else {
              setPressConferencePhase(PRESS_CONFERENCE_PHASE_ORDER[idx + 1])
            }
          }}
        />
      )}
      {showLaunchInfrastructureModal && (
        <LaunchInfrastructureModal
          state={state}
          onPick={(id) => {
            setLaunchInfrastructureRegion(id)
            setShowLaunchInfrastructureModal(false)
            setLaunchInfrastructurePhase(LAUNCH_INFRASTRUCTURE_PHASES.DEPART)
            addEvent(`President leaves for infrastructure launch in ${id}.`, 'news')
          }}
          onClose={() => setShowLaunchInfrastructureModal(false)}
        />
      )}
      {launchInfrastructurePhase && launchInfrastructurePhase !== LAUNCH_INFRASTRUCTURE_PHASES.MOTORCADE && launchInfrastructurePhase !== LAUNCH_INFRASTRUCTURE_PHASES.RETURN && (
        <LaunchInfrastructureView
          phase={launchInfrastructurePhase}
          regionName={launchInfrastructureRegion ?? ''}
          onAdvance={() => {
            const idx = LAUNCH_INFRASTRUCTURE_PHASE_ORDER.indexOf(launchInfrastructurePhase)
            if (launchInfrastructurePhase === LAUNCH_INFRASTRUCTURE_PHASES.RIBBON_CUTTING) applyLaunchInfrastructure(launchInfrastructureRegion)
            if (launchInfrastructurePhase === LAUNCH_INFRASTRUCTURE_PHASES.RETURN) addEvent('President returns to palace.', 'news')
            if (idx < 0 || idx >= LAUNCH_INFRASTRUCTURE_PHASE_ORDER.length - 1) {
              setLaunchInfrastructurePhase(null)
              setLaunchInfrastructureRegion(null)
            } else {
              setLaunchInfrastructurePhase(LAUNCH_INFRASTRUCTURE_PHASE_ORDER[idx + 1])
            }
          }}
        />
      )}
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
              ref={worldViewRef}
              state={state}
              viewMode={view}
              activityPhase={stateAddressPhase}
              onPhaseComplete={handlePhaseComplete}
              onSpeechReady={() => setSpeechReady(true)}
              onTabletClick={() => setTabletOpen(true)}
              onResetView={view === 'map' ? () => worldViewRef.current?.resetMapView() : undefined}
              stateVisitPhase={stateVisitPhase}
              onStateVisitPhaseComplete={() => {
                if (stateVisitPhase === STATE_VISIT_PHASES.MOTORCADE_TO_AIRPORT) {
                  const idx = STATE_VISIT_PHASE_ORDER.indexOf(stateVisitPhase)
                  if (idx >= 0 && idx < STATE_VISIT_PHASE_ORDER.length - 1) setStateVisitPhase(STATE_VISIT_PHASE_ORDER[idx + 1])
                } else if (stateVisitPhase === STATE_VISIT_PHASES.RETURN_TO_OFFICE) {
                  const countryName = getCountry(stateVisitCountry)?.name ?? stateVisitCountry
                  addEvent(`President back from ${countryName}.`, 'state_visit')
                  const dossier = addDossier({
                    countryId: stateVisitCountry,
                    type: 'deputy_handover',
                    title: `Handover brief — ${countryName}`,
                    summary: 'Deputy handed over. While you were away, your deputy handled a minor domestic issue. Calm maintained.',
                    details: 'Your deputy convened a brief inter-ministerial meeting on a minor labour dispute. No escalation. Calm maintained. You resume with full authority.',
                    at: state?.time,
                  })
                  addEvent('While you were away, your deputy handled a minor domestic issue. Calm maintained.', 'deputy', dossier ? { dossierId: dossier.id } : {})
                  setStateVisitPhase(null)
                  setStateVisitCountry(null)
                }
              }}
              securityBriefingPhase={securityBriefingPhase}
              pressConferencePhase={pressConferencePhase}
              cabinetMeetingActive={cabinetMeetingActive}
              visitRegionPhase={visitRegionPhase}
              launchInfrastructurePhase={launchInfrastructurePhase}
              onVisitRegionPhaseComplete={() => {
                if (visitRegionPhase === VISIT_REGION_PHASES.MOTORCADE) {
                  setVisitRegionPhase(VISIT_REGION_PHASE_ORDER[VISIT_REGION_PHASE_ORDER.indexOf(VISIT_REGION_PHASES.MOTORCADE) + 1])
                } else if (visitRegionPhase === VISIT_REGION_PHASES.RETURN) {
                  addEvent('President returns to palace.', 'news')
                  setVisitRegionPhase(null)
                  setVisitRegionId(null)
                }
              }}
              onLaunchInfrastructurePhaseComplete={() => {
                if (launchInfrastructurePhase === LAUNCH_INFRASTRUCTURE_PHASES.MOTORCADE) {
                  setLaunchInfrastructurePhase(LAUNCH_INFRASTRUCTURE_PHASE_ORDER[LAUNCH_INFRASTRUCTURE_PHASE_ORDER.indexOf(LAUNCH_INFRASTRUCTURE_PHASES.MOTORCADE) + 1])
                } else if (launchInfrastructurePhase === LAUNCH_INFRASTRUCTURE_PHASES.RETURN) {
                  addEvent('President returns to palace.', 'news')
                  setLaunchInfrastructurePhase(null)
                  setLaunchInfrastructureRegion(null)
                }
              }}
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
            onAdvanceStateAddress={advanceStateAddress}
            speechReady={speechReady}
            speeds={SPEEDS}
            tableBudget={tableBudget}
            budgetDue={state?.calendar?.budgetDue}
            parliamentSupport={state?.parliament?.support}
            oppositionStrength={state?.opposition?.strength}
            onStartCabinetMeeting={() => setCabinetMeetingActive(true)}
            cabinetCooldown={state?.meta?.lastCabinetTick != null && (state?.time?.tick ?? 0) - state.meta.lastCabinetTick < SIX_MONTHS_IN_DAYS}
            cabinetMeetingActive={cabinetMeetingActive}
            onMeetForeignLeader={() => setShowMeetForeignModal(true)}
            foreignLeaderCooldown={(state?.time?.tick ?? 0) - (state?.international?.lastMeetForeignTick ?? -999) < SIX_MONTHS_IN_DAYS}
            stateVisitPhase={stateVisitPhase}
            stateVisitCountry={stateVisitCountry}
            onVisitRegion={() => setShowVisitRegionModal(true)}
            visitRegionCooldown={(state?.time?.tick ?? 0) - (state?.meta?.lastVisitRegionTick ?? -999) < SIX_MONTHS_IN_DAYS}
            visitRegionPhase={visitRegionPhase}
            visitRegionId={visitRegionId}
            onSecurityBriefing={() => setSecurityBriefingPhase(SECURITY_BRIEFING_PHASES.ENTER)}
            securityBriefingCooldown={(state?.time?.tick ?? 0) - (state?.meta?.lastSecurityBriefingTick ?? -999) < SIX_MONTHS_IN_DAYS}
            securityBriefingPhase={securityBriefingPhase}
            onPressConference={() => setPressConferencePhase(PRESS_CONFERENCE_PHASES.PREP)}
            pressConferenceCooldown={(state?.time?.tick ?? 0) - (state?.meta?.lastPressConferenceTick ?? -999) < SIX_MONTHS_IN_DAYS}
            pressConferencePhase={pressConferencePhase}
            onLaunchInfrastructure={() => setShowLaunchInfrastructureModal(true)}
            launchInfrastructureCooldown={(state?.time?.tick ?? 0) - (state?.meta?.lastLaunchInfrastructureTick ?? -999) < SIX_MONTHS_IN_DAYS}
            launchInfrastructurePhase={launchInfrastructurePhase}
            launchInfrastructureRegion={launchInfrastructureRegion}
            onOpenDossier={setOpenDossierId}
          />
        </div>
      ) : (
        <>
          <h1>Presidential Sim — Alpha</h1>
          <p style={{ color: '#8b98a5', marginTop: 0 }}>
            One tick = one day (7 days per month). Adjust policies and watch the country react. Systemic consequences, not scripted story.
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
                Set policies with the sliders (or use Liberal / Conservative / Authoritarian presets). Keep approval up and coup risk down. Elections run every 4 years — low approval makes losing likely. Avoid coups by keeping military and elites satisfied. Use <kbd style={{ background: '#2f3336', padding: '2px 6px', borderRadius: 4 }}>Space</kbd> to pause. <strong>Office view:</strong> you at the desk; click the tablet for diary, calendar, and calls; use desk activities (State of the Nation, cabinet, visit region, etc.) and check recent dossiers. <strong>Map view:</strong> regional approval and capital overview; drag to orbit, scroll to zoom, “Reset view” to recenter. Progress is saved automatically; New game starts fresh.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap', opacity: outOfPower ? 0.6 : 1 }}>
            <div style={{ flex: '2 1 520px', minWidth: 320 }}>
              <Dashboard state={state} onOpenDossier={setOpenDossierId} />
            </div>
            <div style={{ flex: '1 1 340px', minWidth: 280 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={toggleRunning} style={buttonStyle} disabled={outOfPower}>
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button onClick={tick} style={buttonStyle} disabled={isRunning || outOfPower} title="Advance one day">
                  Step day
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
      {openDossierId && (
        <DossierModal
          dossier={state?.desk?.dossiers?.find((d) => d.id === openDossierId)}
          onClose={() => setOpenDossierId(null)}
        />
      )}
    </>
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
