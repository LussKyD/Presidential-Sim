/** Shown when state.crisis.pendingResponse exists — player chooses how to respond. */
export default function CrisisResponsePanel({ pending, onRespond }) {
  if (!pending) return null

  const isProtest = pending.type === 'protest'
  const options = isProtest
    ? [
        { id: 'dialogue', label: 'Dialogue with protesters' },
        { id: 'crackdown', label: 'Security crackdown' },
        { id: 'ignore', label: 'Ignore' },
        { id: 'address_nation', label: 'Address the nation' },
      ]
    : [
        { id: 'deny', label: 'Deny allegations' },
        { id: 'investigate', label: 'Order inquiry' },
        { id: 'ignore', label: 'No comment' },
      ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#16181c',
          border: '1px solid #2f3336',
          borderRadius: 12,
          padding: '1.25rem 1.5rem',
          maxWidth: 420,
          width: '90%',
        }}
      >
        <div style={{ fontSize: 10, color: '#f4212e', letterSpacing: '0.08em', marginBottom: 6 }}>REQUIRES DECISION</div>
        <div style={{ fontWeight: 700, marginBottom: 8, color: '#e7e9ea' }}>
          {isProtest ? 'Protest' : 'Scandal'} — Your response?
        </div>
        <p style={{ color: '#8b98a5', fontSize: 14, marginBottom: 16 }}>{pending.message}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onRespond(opt.id)}
              style={{
                background: opt.id === 'crackdown' || opt.id === 'ignore' ? '#2f3336' : '#1d9bf0',
                color: opt.id === 'crackdown' || opt.id === 'ignore' ? '#e7e9ea' : '#0f1419',
                border: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
