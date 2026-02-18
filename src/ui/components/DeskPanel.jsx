import { useState } from 'react'
import PolicyPanel from './PolicyPanel'

const COOLDOWN_MONTHS = 12

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
  speeds,
}) {
  const [policiesOpen, setPoliciesOpen] = useState(false)
  const approval = state?.population?.publicApproval
  const approvalPct = typeof approval === 'number' ? Math.round(approval * 100) : '—'
  const coupPct = state?.politics?.coupRisk != null ? Math.round(state.politics.coupRisk * 100) : '—'
  const date = state?.time ? `${state.time.month}/${state.time.year}` : '—'

  const phaseLabel =
    stateAddressPhase === 'planning'
      ? 'Planning route & agenda…'
      : stateAddressPhase === 'security'
        ? 'Security securing route…'
        : stateAddressPhase === 'motorcade'
          ? 'Motorcade to Parliament…'
          : stateAddressPhase === 'speech'
            ? 'Addressing Parliament…'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b98a5' }}>
        <span>{date}</span>
        <span>Approval: {approvalPct}% · Coup risk: {coupPct}%</span>
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
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
          }}
        >
          {stateAddressCooldown ? `State address (${stateAddressCooldown} mo left)` : 'Deliver state address'}
        </button>
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
