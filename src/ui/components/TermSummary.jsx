/** "Your term" summary when game over — replayability, beats narrative-only games. */
function formatPct(x) {
  if (typeof x !== 'number') return '—'
  return `${(x * 100).toFixed(0)}%`
}

function formatNum(x) {
  if (typeof x !== 'number') return '—'
  return x.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export default function TermSummary({ state }) {
  if (!state?.regime || state.regime.status === 'in_power') return null

  const { time, economy, population, regime, events } = state
  const startYear = 2026
  const yearsInPower = time.year - startYear + (time.month >= 1 ? 0 : -1)
  const monthsTotal = Math.max(0, (time.year - startYear) * 12 + (time.month - 1))

  const headlineTypes = ['protest', 'economic', 'scandal', 'diplomatic', 'election', 'coup', 'approval_bounce', 'economic_praise', 'opposition_motion', 'judiciary']
  const headlines = []
  const seen = new Set()
  for (const e of events) {
    if (headlineTypes.includes(e.type) && !seen.has(e.type)) {
      seen.add(e.type)
      headlines.push(e)
    }
  }
  const lastHeadlines = events.filter((e) => headlineTypes.includes(e.type)).slice(-4).reverse()

  return (
    <div
      role="region"
      aria-label="Your term summary"
      style={{
        marginTop: 16,
        padding: '1rem 1.2rem',
        background: '#16181c',
        border: '1px solid #2f3336',
        borderRadius: 12,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 15 }}>Your term</div>
      <div style={{ color: '#8b98a5', fontSize: 13, marginBottom: 12 }}>
        {yearsInPower <= 0 ? 'Less than a year' : `${yearsInPower} year${yearsInPower !== 1 ? 's' : ''} in power`}
        {monthsTotal > 0 && ` (${monthsTotal} months)`} · Ended {time.month}/{time.year}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, fontSize: 12 }}>
        <span>Final GDP: <strong style={{ color: '#e7e9ea' }}>{formatNum(economy?.gdp)}</strong></span>
        <span>Final approval: <strong style={{ color: population?.publicApproval >= 0.5 ? '#00ba7c' : '#f4212e' }}>{formatPct(population?.publicApproval)}</strong></span>
      </div>
      <div style={{ fontSize: 12, color: '#8b98a5' }}>
        <div style={{ marginBottom: 4 }}>Headlines from your term:</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(lastHeadlines.length ? lastHeadlines : headlines).slice(0, 5).map((e) => (
            <li key={e.id} style={{ marginBottom: 2 }}>{e.message}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
