import { BUDGET_PIE_IDS } from '../../core/constants/policyEffects'

function formatValue(def, value) {
  if (typeof value !== 'number') return '—'
  if (def.id === 'interestRate') return `${(value * 100).toFixed(1)}%`
  return `${Math.round(value * 100)}%`
}

export default function PolicyPanel({ policies, values, onChange, presets, onPresetSelect, disabled }) {
  const spendingPie = policies?.filter((p) => BUDGET_PIE_IDS.includes(p.id)).length === BUDGET_PIE_IDS.length
  return (
    <section data-component="PolicyPanel" style={panelStyle}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Policies</div>
      {spendingPie && (
        <div style={{ fontSize: 11, color: '#6e767d', marginBottom: 8 }}>Infrastructure, Education, Defense, Police share one budget (100%).</div>
      )}
      {presets && Object.keys(presets).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {Object.entries(presets).map(([id, { label }]) => (
            <button
              key={id}
              type="button"
              onClick={() => onPresetSelect?.(id)}
              disabled={disabled}
              style={{
                padding: '0.35rem 0.6rem',
                fontSize: 11,
                fontWeight: 600,
                background: '#2f3336',
                color: '#e7e9ea',
                border: 'none',
                borderRadius: 6,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {policies.map((p) => {
          const v = Number(values?.[p.id] ?? p.default ?? 0)
          return (
            <label key={p.id} style={{ display: 'block' }} title={p.affects ? `${p.label} — ${p.affects}` : p.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: '#e7e9ea', fontWeight: 600 }}>{p.label}</span>
                <span style={{ color: '#8b98a5', fontVariantNumeric: 'tabular-nums' }}>
                  {formatValue(p, v)}
                </span>
              </div>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={v}
                onChange={(e) => onChange?.(p.id, e.target.value)}
                style={{ width: '100%', marginTop: 6 }}
              />
              {p.affects && (
                <div style={{ fontSize: 11, color: '#6e767d', marginTop: 2 }}>Affects: {p.affects}</div>
              )}
            </label>
          )
        })}
      </div>
      <div style={{ marginTop: 12, color: '#8b98a5', fontSize: 12 }}>
        Tip: pause the sim to step month-by-month.
      </div>
    </section>
  )
}

const panelStyle = {
  background: '#16181c',
  border: '1px solid #2f3336',
  borderRadius: 12,
  padding: '0.9rem 1rem',
}
