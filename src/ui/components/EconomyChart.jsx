/** GDP / inflation / unemployment over time (SVG). */
const MAX_POINTS = 36
const W = 520
const H = 180
const PAD = { top: 12, right: 12, bottom: 24, left: 48 }

function scaleY(min, max, value) {
  if (max === min) return H - PAD.bottom - PAD.top
  const range = max - min
  const v = (value - min) / range
  return PAD.top + (1 - v) * (H - PAD.top - PAD.bottom)
}

function scaleX(i, n) {
  if (n <= 1) return PAD.left
  const t = n <= MAX_POINTS ? i / (n - 1) : (i - (n - MAX_POINTS)) / (MAX_POINTS - 1)
  return PAD.left + t * (W - PAD.left - PAD.right)
}

function buildPath(history, key, minV, maxV) {
  const slice = history.length <= MAX_POINTS ? history : history.slice(-MAX_POINTS)
  if (slice.length === 0) return ''
  const pts = slice.map((h, i) => {
    const x = scaleX(i, history.length)
    const y = scaleY(minV, maxV, h[key] ?? 0)
    return `${x},${y}`
  })
  return `M ${pts.join(' L ')}`
}

export default function EconomyChart({ state }) {
  const history = state?.economy?.history ?? []
  if (history.length === 0) {
    return (
      <div style={chartPanel}>
        <div style={{ color: '#8b98a5', fontSize: 12, fontWeight: 700 }}>GDP & economy over time</div>
        <div style={{ color: '#6e767d', fontSize: 12, marginTop: 8 }}>Run the sim to see history.</div>
      </div>
    )
  }

  const gdps = history.map((h) => h.gdp)
  const infl = history.map((h) => h.inflation)
  const unem = history.map((h) => h.unemployment)
  const gdpMin = Math.min(...gdps)
  const gdpMax = Math.max(...gdps)
  const gdpRange = gdpMax - gdpMin || 1
  const inflMax = Math.max(0.01, ...infl)
  const unemMax = Math.max(0.01, ...unem)

  const gdpPath = buildPath(history, 'gdp', gdpMin, gdpMax)
  const inflPath = buildPath(history, 'inflation', 0, inflMax)
  const unemPath = buildPath(history, 'unemployment', 0, unemMax)

  return (
    <div style={chartPanel}>
      <div style={{ color: '#8b98a5', fontSize: 12, marginBottom: 8, fontWeight: 700 }}>GDP & economy over time</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ maxHeight: 200 }}>
        <defs>
          <linearGradient id="gdpGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#1d9bf0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1d9bf0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#2f3336" strokeWidth="1" />
        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#2f3336" strokeWidth="1" />
        {/* GDP fill + line */}
        {gdpPath && (
          <>
            <path fill="url(#gdpGrad)" d={`${gdpPath} L ${scaleX(history.length <= MAX_POINTS ? history.length - 1 : MAX_POINTS - 1, history.length)},${H - PAD.bottom} L ${PAD.left},${H - PAD.bottom} Z`} />
            <path d={gdpPath} fill="none" stroke="#1d9bf0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {/* Inflation (orange) */}
        {inflPath && (
          <path d={inflPath} fill="none" stroke="#f7931a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
        )}
        {/* Unemployment (red) */}
        {unemPath && (
          <path d={unemPath} fill="none" stroke="#f4212e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 4" />
        )}
      </svg>
      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11, color: '#8b98a5' }}>
        <span><span style={{ color: '#1d9bf0' }}>—</span> GDP</span>
        <span><span style={{ color: '#f7931a' }}>···</span> Inflation</span>
        <span><span style={{ color: '#f4212e' }}>···</span> Unemployment</span>
      </div>
    </div>
  )
}

const chartPanel = {
  background: '#16181c',
  border: '1px solid #2f3336',
  borderRadius: 12,
  padding: '0.9rem 1rem',
}
