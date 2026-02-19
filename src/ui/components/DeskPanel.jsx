import { useState } from 'react'
import PolicyPanel from './PolicyPanel'
import { STATE_ADDRESS_PHASES, ACTIVITY_IDS, ACTIVITY_LABELS } from '../../core/constants/activities'
import { getCountry } from '../../core/constants/international'
import { formatGameDate } from '../../utils/dateFormat'
import { getCountry } from '../../core/constants/international'

const COOLDOWN_MONTHS = 12

const PHASE_LABELS = {
  [STATE_ADDRESS_PHASES.PLANNING]: 'Planning route & agenda…',
  [STATE_ADDRESS_PHASES.SECURITY]: 'Security securing route…',
  [STATE_ADDRESS_PHASES.WALK_TO_CARS]: 'Walking to motorcade…',
  [STATE_ADDRESS_PHASES.AT_CARS]: 'At motorcade',
  [STATE_ADDRESS_PHASES.MOTORCADE_TO_PARLIAMENT]: 'Motorcade to Parliament…',
  [STATE_ADDRESS_PHASES.AT_PARLIAMENT]: 'At Parliament',
  [STATE_ADDRESS_PHASES.ENTER_PARLIAMENT]: 'Entering chamber…',
  [STATE_ADDRESS_PHASES.SPEECH]: 'Addressing Parliament…',
  [STATE_ADDRESS_PHASES.EXIT_PARLIAMENT]: 'Leaving chamber…',
  [STATE_ADDRESS_PHASES.MOTORCADE_TO_PALACE]: 'Motorcade back to Palace…',
  [STATE_ADDRESS_PHASES.AT_PALACE]: 'At Palace',
  [STATE_ADDRESS_PHASES.WALK_TO_OFFICE]: 'Returning to office…',
}

const ADVANCE_BUTTON_LABELS = {
  [STATE_ADDRESS_PHASES.AT_CARS]: 'Board motorcade',
  [STATE_ADDRESS_PHASES.AT_PARLIAMENT]: 'Enter Parliament',
  [STATE_ADDRESS_PHASES.AT_PALACE]: 'Return to office',
  [STATE_ADDRESS_PHASES.SPEECH]: 'Leave chamber',
}

export default function DeskPanel({
  state,
  isRunning,
  toggleRunning,
  tick,
  speed,
  setSpeed,
  startNewGame,
  applyPolicy,
  applyPreset,
  policyDefs,
  presets,
  outOfPower,
  onStateAddress,
  stateAddressPhase,
  stateAddressCooldown,
  onAdvanceStateAddress,
  speechReady,
  speeds,
  tableBudget,
  budgetDue,
  parliamentSupport,
  oppositionStrength,
  onCabinetMeeting,
  cabinetCooldown,
  onMeetForeignLeader,
  foreignLeaderCooldown,
  stateVisitPhase,
  stateVisitCountry,
  onVisitRegion,
  visitRegionCooldown,
  visitRegionPhase,
  visitRegionId,
  onSecurityBriefing,
  securityBriefingCooldown,
  securityBriefingPhase,
  onPressConference,
  pressConferenceCooldown,
  pressConferencePhase,
  onLaunchInfrastructure,
  launchInfrastructureCooldown,
  launchInfrastructurePhase,
  launchInfrastructureRegion,
  onOpenDossier,
}) {
  const stateVisitActive = !!stateVisitPhase
  const visitRegionActive = !!visitRegionPhase
  const securityBriefingActive = !!securityBriefingPhase
  const pressConferenceActive = !!pressConferencePhase
  const launchInfrastructureActive = !!launchInfrastructurePhase
  const [policiesOpen, setPoliciesOpen] = useState(false)
  const approval = state?.population?.publicApproval
  const approvalPct = typeof approval === 'number' ? Math.round(approval * 100) : '—'
  const coupPct = state?.politics?.coupRisk != null ? Math.round(state.politics.coupRisk * 100) : '—'
  const parliamentPct = parliamentSupport != null ? Math.round(parliamentSupport * 100) : null
  const oppositionPct = oppositionStrength != null ? Math.round(oppositionStrength * 100) : null
  const date = state?.time ? formatGameDate(state.time) : '—'
  const recentDossiers = (state?.desk?.dossiers ?? []).slice(-5).reverse()

  const phaseLabel = stateAddressPhase ? PHASE_LABELS[stateAddressPhase] : null
  const showAdvanceButton =
    stateAddressPhase &&
    (stateAddressPhase === STATE_ADDRESS_PHASES.AT_CARS ||
      stateAddressPhase === STATE_ADDRESS_PHASES.AT_PARLIAMENT ||
      stateAddressPhase === STATE_ADDRESS_PHASES.AT_PALACE ||
      (stateAddressPhase === STATE_ADDRESS_PHASES.SPEECH && speechReady))
  const advanceLabel =
    stateAddressPhase === STATE_ADDRESS_PHASES.SPEECH && speechReady
      ? ADVANCE_BUTTON_LABELS[STATE_ADDRESS_PHASES.SPEECH]
      : stateAddressPhase
        ? ADVANCE_BUTTON_LABELS[stateAddressPhase]
        : null

  return (
    <aside
      style={{
        width: 320,
        minWidth: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '1rem',
        background: '#16181c',
        borderLeft: '1px solid #2f3336',
        overflowY: 'auto',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: '#e7e9ea' }}>Desk</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b98a5', flexWrap: 'wrap', gap: 4 }}>
        <span>{date}</span>
        <span>Approval: {approvalPct}% · Coup: {coupPct}%{parliamentPct != null ? ` · Parliament: ${parliamentPct}%` : ''}{oppositionPct != null ? ` · Opposition: ${oppositionPct}%` : ''}</span>
      </div>

      {budgetDue && (
        <button
          type="button"
          onClick={tableBudget}
          disabled={outOfPower}
          style={{ ...btn, background: '#059669', width: '100%' }}
        >
          Table budget in Parliament
        </button>
      )}

      <div style={{ fontSize: 11, color: '#6e767d', marginTop: -4 }}>Presidential activities</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          type="button"
          onClick={onStateAddress}
          disabled={outOfPower || stateAddressCooldown || !!stateAddressPhase || !!stateVisitActive || !!visitRegionActive || !!securityBriefingActive || !!pressConferenceActive || !!launchInfrastructureActive}
          style={{
            background: stateAddressCooldown ? '#2f3336' : '#1d9bf0',
            color: '#0f1419',
            border: 'none',
            padding: '0.5rem 0.75rem',
            borderRadius: 8,
            fontWeight: 700,
            cursor: stateAddressCooldown || stateAddressPhase || stateVisitActive || visitRegionActive || securityBriefingActive || pressConferenceActive || launchInfrastructureActive ? 'not-allowed' : 'pointer',
            fontSize: 12,
            textAlign: 'left',
          }}
        >
          {stateAddressCooldown ? `State of the Nation (${stateAddressCooldown} mo)` : 'State of the Nation Address'}
        </button>
        <button
          type="button"
          onClick={() => onCabinetMeeting?.(approval >= 0.45)}
          disabled={outOfPower || cabinetCooldown}
          style={{
            ...btn,
            background: cabinetCooldown ? '#2f3336' : '#1d9bf0',
            opacity: cabinetCooldown ? 0.8 : 1,
            textAlign: 'left',
          }}
          title={cabinetCooldown ? 'Cabinet cooldown 6 months' : 'Hold cabinet meeting'}
        >
          {ACTIVITY_LABELS[ACTIVITY_IDS.CABINET_MEETING]}{cabinetCooldown ? ' (cooldown)' : ''}
        </button>
        <button
          type="button"
          onClick={onMeetForeignLeader}
          disabled={outOfPower || foreignLeaderCooldown || !!stateVisitPhase || !!visitRegionPhase || !!securityBriefingPhase || !!pressConferencePhase || !!launchInfrastructurePhase}
          style={{
            ...btn,
            background: foreignLeaderCooldown || stateVisitPhase ? '#2f3336' : '#1d9bf0',
            opacity: foreignLeaderCooldown || stateVisitPhase ? 0.8 : 1,
            textAlign: 'left',
          }}
          title={stateVisitPhase ? 'State visit in progress' : foreignLeaderCooldown ? 'Meet foreign leader cooldown 6 months' : 'Hold bilateral meeting (pick country)'}
        >
          {stateVisitPhase ? `State visit to ${getCountry(stateVisitCountry)?.name ?? '…'}…` : ACTIVITY_LABELS[ACTIVITY_IDS.MEET_FOREIGN_LEADER]}{!stateVisitPhase && foreignLeaderCooldown ? ' (cooldown)' : ''}
        </button>
        <button
          type="button"
          onClick={onVisitRegion}
          disabled={outOfPower || visitRegionCooldown || !!visitRegionPhase || !!securityBriefingPhase || !!pressConferencePhase || !!launchInfrastructurePhase}
          style={{
            ...btn,
            background: visitRegionCooldown || visitRegionPhase ? '#2f3336' : '#1d9bf0',
            opacity: visitRegionCooldown || visitRegionPhase ? 0.8 : 1,
            textAlign: 'left',
          }}
          title={visitRegionPhase ? 'Regional visit in progress' : visitRegionCooldown ? 'Visit region cooldown 6 months' : 'Visit a region to boost local approval'}
        >
          {visitRegionPhase ? `Visit to ${visitRegionId ?? '…'}…` : ACTIVITY_LABELS[ACTIVITY_IDS.VISIT_REGION]}{!visitRegionPhase && visitRegionCooldown ? ' (cooldown)' : ''}
        </button>
        <button
          type="button"
          onClick={onSecurityBriefing}
          disabled={outOfPower || securityBriefingCooldown || !!securityBriefingPhase || !!pressConferencePhase || !!launchInfrastructurePhase}
          style={{
            ...btn,
            background: securityBriefingCooldown || securityBriefingPhase ? '#2f3336' : '#1d9bf0',
            opacity: securityBriefingCooldown || securityBriefingPhase ? 0.8 : 1,
            textAlign: 'left',
          }}
          title={securityBriefingPhase ? 'Security briefing in progress' : securityBriefingCooldown ? 'Security briefing cooldown 6 months' : 'Receive intel and align threat posture'}
        >
          {securityBriefingPhase ? 'Security briefing…' : ACTIVITY_LABELS[ACTIVITY_IDS.SECURITY_BRIEFING]}{!securityBriefingPhase && securityBriefingCooldown ? ' (cooldown)' : ''}
        </button>
        <button
          type="button"
          onClick={onPressConference}
          disabled={outOfPower || pressConferenceCooldown || !!pressConferencePhase || !!launchInfrastructurePhase}
          style={{
            ...btn,
            background: pressConferenceCooldown || pressConferencePhase ? '#2f3336' : '#1d9bf0',
            opacity: pressConferenceCooldown || pressConferencePhase ? 0.8 : 1,
            textAlign: 'left',
          }}
          title={pressConferencePhase ? 'Press conference in progress' : pressConferenceCooldown ? 'Press conference cooldown 6 months' : 'Address the press and shape the narrative'}
        >
          {pressConferencePhase ? 'Press conference…' : ACTIVITY_LABELS[ACTIVITY_IDS.PRESS_CONFERENCE]}{!pressConferencePhase && pressConferenceCooldown ? ' (cooldown)' : ''}
        </button>
        <button
          type="button"
          onClick={onLaunchInfrastructure}
          disabled={outOfPower || launchInfrastructureCooldown || !!launchInfrastructurePhase}
          style={{
            ...btn,
            background: launchInfrastructureCooldown || launchInfrastructurePhase ? '#2f3336' : '#1d9bf0',
            opacity: launchInfrastructureCooldown || launchInfrastructurePhase ? 0.8 : 1,
            textAlign: 'left',
          }}
          title={launchInfrastructurePhase ? 'Infrastructure launch in progress' : launchInfrastructureCooldown ? 'Launch infrastructure cooldown 6 months' : 'Site visit and ribbon-cutting in a region'}
        >
          {launchInfrastructurePhase ? `Launch in ${launchInfrastructureRegion ?? '…'}…` : ACTIVITY_LABELS[ACTIVITY_IDS.LAUNCH_INFRASTRUCTURE]}{!launchInfrastructurePhase && launchInfrastructureCooldown ? ' (cooldown)' : ''}
        </button>
      </div>

      {phaseLabel && (
        <div
          style={{
            padding: '0.5rem 0.75rem',
            background: '#1c3a5e',
            borderRadius: 8,
            fontSize: 12,
            color: '#8b98a5',
          }}
        >
          {phaseLabel}
        </div>
      )}

      {showAdvanceButton && advanceLabel && (
        <button
          type="button"
          onClick={onAdvanceStateAddress}
          style={{
            ...btn,
            background: '#059669',
            width: '100%',
            fontWeight: 700,
          }}
        >
          {advanceLabel}
        </button>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={toggleRunning} style={btn} disabled={outOfPower}>
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button type="button" onClick={tick} style={btn} disabled={isRunning || outOfPower}>
          Step
        </button>
        <button type="button" onClick={startNewGame} style={{ ...btn, background: '#2f3336', color: '#e7e9ea' }} disabled={outOfPower}>
          New game
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#8b98a5' }}>
        Speed:
        {(speeds || [{ value: 0.5, label: '0.5×' }, { value: 1, label: '1×' }, { value: 2, label: '2×' }]).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSpeed?.(value)}
            style={{
              ...btn,
              padding: '0.25rem 0.5rem',
              fontSize: 11,
              background: speed === value ? '#2f3336' : 'transparent',
              color: speed === value ? '#e7e9ea' : '#8b98a5',
            }}
            disabled={outOfPower}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setPoliciesOpen((o) => !o)}
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
          {policiesOpen ? 'Hide policies' : 'Policies'}
        </button>
        {recentDossiers.length > 0 && onOpenDossier && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2f3336' }}>
            <div style={{ fontSize: 10, color: '#8b98a5', letterSpacing: '0.05em', marginBottom: 8 }}>RECENT DOSSIERS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentDossiers.map((d) => {
                const country = d.countryId ? getCountry(d.countryId) : null
                const name = country?.name ?? d.countryId ?? '—'
                const initial = name[0]?.toUpperCase() ?? '?'
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onOpenDossier(d.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      background: '#0f1419',
                      border: '1px solid #2f3336',
                      borderRadius: 8,
                      color: '#e7e9ea',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2f3336', border: '2px solid #8b98a5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                      {initial}
                    </div>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {policiesOpen && (
          <div style={{ marginTop: 8 }}>
            <PolicyPanel
              policies={policyDefs ?? []}
              values={state?.government?.policies}
              onChange={outOfPower ? undefined : applyPolicy}
              presets={presets}
              onPresetSelect={outOfPower ? undefined : applyPreset}
              disabled={outOfPower}
            />
          </div>
        )}
      </div>
    </aside>
  )
}

const btn = {
  background: '#1d9bf0',
  color: '#0f1419',
  border: 'none',
  padding: '0.4rem 0.6rem',
  borderRadius: 8,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 12,
}
