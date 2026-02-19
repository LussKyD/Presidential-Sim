/** Pick a country to hold a bilateral meeting (Meet foreign leader). */
import { COUNTRIES } from '../../core/constants/international'

export default function MeetForeignModal({ state, onPick, onClose }) {
  const relations = state?.international?.relations ?? {}

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1002,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          width: 'min(360px, 92vw)',
          background: '#16181c',
          border: '1px solid #2f3336',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: '#e7e9ea' }}>Meet foreign leader</div>
        <div style={{ fontSize: 12, color: '#8b98a5', marginBottom: 16 }}>Choose a country for a bilateral meeting. Improves relations (6‑month cooldown).</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {COUNTRIES.map((c) => {
            const rel = relations[c.id] ?? 0.5
            const pct = Math.round(rel * 100)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick?.(c.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0f1419',
                  border: '1px solid #2f3336',
                  borderRadius: 10,
                  color: '#e7e9ea',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#8b98a5', marginTop: 2 }}>{c.leader}</div>
                <div style={{ marginTop: 6, fontSize: 11, color: '#6e767d' }}>Relations: {pct}%</div>
              </button>
            )
          })}
        </div>
        <button type="button" onClick={onClose} style={{ marginTop: 16, padding: '8px 16px', background: '#2f3336', border: 'none', borderRadius: 8, color: '#e7e9ea', cursor: 'pointer', fontSize: 12 }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
