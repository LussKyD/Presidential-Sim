import { useState } from 'react'
import PolicyPanel from './PolicyPanel'
import { STATE_ADDRESS_PHASES, ACTIVITY_IDS, ACTIVITY_LABELS } from '../../core/constants/activities'

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
}) {
  const [policiesOpen, setPoliciesOpen] = useState(false)
  const approval = state?.population?.publicApproval
  const approvalPct = typeof approval === 'number' ? Math.round(approval * 100) : '—'
  const coupPct = state?.politics?.coupRisk != null ? Math.round(state.politics.coupRisk * 100) : '—'
  const parliamentPct = parliamentSupport != null ? Math.round(parliamentSupport * 100) : null
  const oppositionPct = oppositionStrength != null ? Math.round(oppositionStrength * 100) : null
  const date = state?.time ? `${state.time.month}/${state.time.year}` : '—'

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
          disabled={outOfPower || stateAddressCooldown || !!stateAddressPhase}
          style={{
            background: stateAddressCooldown ? '#2f3336' : '#1d9bf0',
            color: '#0f1419',
            border: 'none',
            padding: '0.5rem 0.75rem',
            borderRadius: 8,
            fontWeight: 700,
            cursor: stateAddressCooldown || stateAddressPhase ? 'not-allowed' : 'pointer',
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
          disabled={outOfPower || foreignLeaderCooldown}
          style={{
            ...btn,
            background: foreignLeaderCooldown ? '#2f3336' : '#1d9bf0',
            opacity: foreignLeaderCooldown ? 0.8 : 1,
            textAlign: 'left',
          }}
          title={foreignLeaderCooldown ? 'Meet foreign leader cooldown 6 months' : 'Hold bilateral meeting (pick country)'}
        >
          {ACTIVITY_LABELS[ACTIVITY_IDS.MEET_FOREIGN_LEADER]}{foreignLeaderCooldown ? ' (cooldown)' : ''}
        </button>
        {[ACTIVITY_IDS.LAUNCH_INFRASTRUCTURE, ACTIVITY_IDS.SECURITY_BRIEFING].map((id) => (
          <button
            key={id}
            type="button"
            disabled
            style={{
              background: '#2f3336',
              color: '#6e767d',
              border: 'none',
              padding: '0.45rem 0.75rem',
              borderRadius: 8,
              fontSize: 12,
              textAlign: 'left',
              cursor: 'not-allowed',
            }}
            title="Coming soon"
          >
            {ACTIVITY_LABELS[id]} <span style={{ fontSize: 10 }}>(soon)</span>
          </button>
        ))}
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
