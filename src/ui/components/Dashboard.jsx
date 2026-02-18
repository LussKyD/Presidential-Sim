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

export default function Dashboard({ state }) {
  const time = state?.time
  const econ = state?.economy
  const pop = state?.population
  const pol = state?.politics

  const lastEvents = (state?.events ?? []).slice(-6).reverse()

  return (
    <section data-component="Dashboard">
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Card title="Date" value={time ? `${time.month}/${time.year}` : '—'} sub={time ? `Tick ${time.tick}` : ''} />
        <Card title="GDP" value={formatNum(econ?.gdp)} sub={econ ? `Growth: ${formatPct(econ.gdpGrowth)}` : ''} />
        <Card title="Inflation" value={formatPct(econ?.inflation)} />
        <Card title="Unemployment" value={formatPct(econ?.unemployment)} />
        <Card title="Approval" value={formatPct(pop?.publicApproval)} />
        <Card title="Coup risk" value={formatPct(pol?.coupRisk)} />
      </div>

      <div style={{ marginTop: 16, ...panelStyle }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent updates</div>
        {lastEvents.length === 0 ? (
          <div style={{ color: '#8b98a5' }}>No events yet.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, color: '#8b98a5' }}>
            {lastEvents.map((e) => (
              <li key={e.id}>{e.message}</li>
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
