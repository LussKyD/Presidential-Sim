import EconomyChart from './EconomyChart'
import { REGION_IDS } from '../../core/constants/regions'

function formatPct(x) {
  if (typeof x !== 'number') return '—'
  return `${(x * 100).toFixed(1)}%`
}

function formatNum(x) {
  if (typeof x !== 'number') return '—'
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function Card({ title, value, sub }) {
  return (
    <div style={cardStyle}>
      <div style={{ color: '#8b98a5', fontSize: 12, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      {sub ? <div style={{ color: '#8b98a5', fontSize: 12, marginTop: 6 }}>{sub}</div> : null}
    </div>
  )
}

function eventColor(type) {
  switch (type) {
    case 'protest': return '#f4212e'
    case 'economic': return '#f7931a'
    case 'scandal': return '#a855f7'
    case 'diplomatic': return '#0ea5e9'
    case 'coup': return '#8b0000'
    case 'election': return '#1d9bf0'
    case 'parliament': return '#059669'
    case 'calendar': return '#6366f1'
    case 'crisis_response': return '#0ea5e9'
    case 'cabinet': return '#8b5cf6'
    default: return '#8b98a5'
  }
}

function DriversPanel({ approvalDrivers, coupDrivers }) {
  const formatEffect = (e) => (e >= 0 ? `+${(e * 100).toFixed(0)}%` : `${(e * 100).toFixed(0)}%`)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
      <div style={{ ...panelStyle, minWidth: 220, flex: '1 1 240px' }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: '#8b98a5' }}>What moves approval</div>
        {(approvalDrivers ?? []).map((d) => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: '#e7e9ea' }}>{d.label}</span>
            <span style={{ color: d.effect >= 0 ? '#00ba7c' : '#f4212e', fontVariantNumeric: 'tabular-nums' }}>
              {formatEffect(d.effect)}
            </span>
          </div>
        ))}
      </div>
      <div style={{ ...panelStyle, minWidth: 220, flex: '1 1 240px' }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: '#8b98a5' }}>What drives coup risk</div>
        {(coupDrivers ?? []).map((d) => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: '#e7e9ea' }}>{d.label}</span>
            <span style={{ color: '#f7931a', fontVariantNumeric: 'tabular-nums' }}>{(d.effect * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ state }) {
  const time = state?.time
  const econ = state?.economy
  const pop = state?.population
  const pol = state?.politics

  const lastEvents = (state?.events ?? []).slice(-8).reverse()

  return (
    <section data-component="Dashboard">
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Card title="Date" value={time ? `${time.month}/${time.year}` : '—'} sub={time ? `Tick ${time.tick}` : ''} />
        <Card title="GDP" value={formatNum(econ?.gdp)} sub={econ ? `Growth: ${formatPct(econ.gdpGrowth)}` : ''} />
        <Card title="Inflation" value={formatPct(econ?.inflation)} />
        <Card title="Unemployment" value={formatPct(econ?.unemployment)} />
        <Card title="Approval" value={formatPct(pop?.publicApproval)} />
        <Card title="Coup risk" value={formatPct(pol?.coupRisk)} />
        <Card title="Opposition" value={formatPct(state?.opposition?.strength)} sub="Election threat" />
      </div>

      {state?.regions && (
        <div style={{ marginTop: 16, ...panelStyle }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: '#8b98a5' }}>Regional approval</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {REGION_IDS.map((id) => {
              const pct = state.regions[id]
              const v = typeof pct === 'number' ? Math.round(pct * 100) : '—'
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 100 }}>
                  <span style={{ fontSize: 12, color: '#e7e9ea', width: 52 }}>{id}</span>
                  <div style={{ flex: 1, height: 8, background: '#2f3336', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${typeof v === 'number' ? v : 0}%`, height: '100%', background: v >= 50 ? '#00ba7c' : v >= 35 ? '#f7931a' : '#f4212e', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#8b98a5', width: 28, fontVariantNumeric: 'tabular-nums' }}>{typeof v === 'number' ? `${v}%` : v}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <EconomyChart state={state} />
      </div>

      <DriversPanel approvalDrivers={pop?.approvalDrivers} coupDrivers={pol?.coupDrivers} />

      <div style={{ marginTop: 16, ...panelStyle }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Event feed</div>
        {lastEvents.length === 0 ? (
          <div style={{ color: '#8b98a5' }}>No events yet.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {lastEvents.map((e) => (
              <li key={e.id} style={{ color: eventColor(e.type), marginBottom: 4 }}>
                {e.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

const cardStyle = {
  background: '#16181c',
  border: '1px solid #2f3336',
  borderRadius: 12,
  padding: '0.9rem 1rem',
  minWidth: 170,
}

const panelStyle = {
  background: '#16181c',
  border: '1px solid #2f3336',
  borderRadius: 12,
  padding: '0.9rem 1rem',
}
