/** Pick a region to visit (regional approval boost, 6‑month cooldown). */
import { useEffect } from 'react'
import { REGION_IDS } from '../../core/constants/regions'

export default function VisitRegionModal({ state, onPick, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const regions = state?.regions ?? {}

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
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: '#e7e9ea' }}>Visit region</div>
        <div style={{ fontSize: 12, color: '#8b98a5', marginBottom: 16 }}>Choose a region for a presidential visit. Boosts regional approval (6‑month cooldown).</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REGION_IDS.map((id) => {
            const approval = regions[id] ?? 0.5
            const pct = Math.round(approval * 100)
            return (
              <button
                key={id}
                type="button"
                onClick={() => onPick?.(id)}
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
                <div style={{ fontWeight: 700 }}>{id}</div>
                <div style={{ marginTop: 6, fontSize: 11, color: '#6e767d' }}>Approval: {pct}%</div>
              </button>
            )
          })}
        </div>
        <button type="button" onClick={onClose} title="Close (Esc)" style={{ marginTop: 16, padding: '8px 16px', background: '#2f3336', border: 'none', borderRadius: 8, color: '#e7e9ea', cursor: 'pointer', fontSize: 12 }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
