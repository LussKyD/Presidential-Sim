/** Dossier modal: country seal, handover title, what deputy did while away. */
import { getCountry } from '../../core/constants/international'
import { formatGameDate } from '../../utils/dateFormat'

const SEAL_COLORS = { norden: '#1e3a5f', sudland: '#0d5c2e', eastalia: '#8b2500', valdris: '#1a365d' }

function CountrySeal({ countryId, name }) {
  const initial = name ? name[0].toUpperCase() : '?'
  const fill = SEAL_COLORS[countryId] ?? (countryId == null ? SEAL_COLORS.valdris : '#2f3336')
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: fill,
        border: '4px solid #8b98a5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e7e9ea',
        fontSize: 28,
        fontWeight: 800,
        fontFamily: 'Georgia, serif',
        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.4)',
      }}
      title={`${name || countryId} seal`}
    >
      {initial}
    </div>
  )
}

export default function DossierModal({ dossier, onClose }) {
  if (!dossier) return null
  const country = dossier.countryId ? getCountry(dossier.countryId) : null
  const countryName = country?.name ?? dossier.countryId ?? 'Republic of Valdris'
  const atStr = dossier.at ? formatGameDate(dossier.at) : ''

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1003,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          width: 'min(420px, 94vw)',
          maxHeight: '85vh',
          overflow: 'auto',
          background: '#16181c',
          border: '2px solid #2f3336',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <CountrySeal countryId={dossier.countryId} name={countryName} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#8b98a5', letterSpacing: '0.06em', marginBottom: 2 }}>OFFICIAL BRIEF</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#e7e9ea' }}>{dossier.title}</div>
            {atStr && <div style={{ fontSize: 11, color: '#6e767d', marginTop: 4 }}>{atStr}</div>}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2f3336', paddingTop: 16 }}>
          {dossier.type === 'deputy_handover' ? (
            <>
              <div style={{ fontSize: 11, color: '#8b98a5', marginBottom: 6 }}>Deputy handed over</div>
              <div style={{ fontSize: 13, color: '#e7e9ea', lineHeight: 1.5, marginBottom: 12 }}>{dossier.summary}</div>
              <div style={{ fontSize: 11, color: '#8b98a5', marginBottom: 6 }}>While you were away</div>
              <div style={{ fontSize: 13, color: '#cfd9de', lineHeight: 1.55 }}>{dossier.details}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, color: '#8b98a5', marginBottom: 6 }}>Summary</div>
              <div style={{ fontSize: 13, color: '#e7e9ea', lineHeight: 1.5, marginBottom: 12 }}>{dossier.summary}</div>
              {dossier.details && (
                <>
                  <div style={{ fontSize: 11, color: '#8b98a5', marginBottom: 6 }}>Details</div>
                  <div style={{ fontSize: 13, color: '#cfd9de', lineHeight: 1.55 }}>{dossier.details}</div>
                </>
              )}
            </>
          )}
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#1d9bf0',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
