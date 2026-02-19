/** Immersive region visit: narrative step-by-step (depart → motorcade → in region → return). */
import { VISIT_REGION_PHASES } from '../../core/constants/activities'

const PHASE_CONTENT = {
  [VISIT_REGION_PHASES.DEPART]: (regionName) => ({
    title: 'Departure',
    body: `You leave the palace for a visit to ${regionName}. The motorcade is ready; local leaders and press await your arrival.`,
  }),
  [VISIT_REGION_PHASES.MOTORCADE]: (regionName) => ({
    title: 'Motorcade to the region',
    body: `The convoy heads to ${regionName}. Crowds line the route; security clears the way.`,
  }),
  [VISIT_REGION_PHASES.IN_REGION]: (regionName) => ({
    title: 'In ' + regionName,
    body: `You meet local officials and address the crowd in ${regionName}. Your presence strengthens support in the region.`,
  }),
  [VISIT_REGION_PHASES.RETURN]: () => ({
    title: 'Return to the palace',
    body: 'Motorcade back to the capital. The regional visit is complete.',
  }),
}

export default function VisitRegionView({ phase, regionName = '', onAdvance }) {
  const content = PHASE_CONTENT[phase]
    ? PHASE_CONTENT[phase](regionName)
    : { title: 'Regional visit', body: '' }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, #0f1419 0%, #1a1f26 50%, #0f1419 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          background: '#16181c',
          border: '1px solid #2f3336',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#8b98a5',
            marginBottom: 8,
          }}
        >
          Regional visit
        </div>
        <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: '#e7e9ea' }}>
          {content.title}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.5, color: '#8b98a5' }}>
          {content.body}
        </p>
        <button
          type="button"
          onClick={onAdvance}
          style={{
            padding: '12px 24px',
            background: '#1d9bf0',
            color: '#0f1419',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
