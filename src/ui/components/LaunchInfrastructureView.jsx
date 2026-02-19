/** Launch infrastructure: depart → motorcade → at site → ribbon-cutting → return. */
import { LAUNCH_INFRASTRUCTURE_PHASES } from '../../core/constants/activities'

const PHASE_CONTENT = {
  [LAUNCH_INFRASTRUCTURE_PHASES.DEPART]: (regionName) => ({
    title: 'Departure',
    body: `You leave the palace for the infrastructure launch in ${regionName}. Motorcade to the project site.`,
  }),
  [LAUNCH_INFRASTRUCTURE_PHASES.MOTORCADE]: (regionName) => ({
    title: 'Motorcade to site',
    body: `The convoy heads to the project site in ${regionName}. Officials and press follow.`,
  }),
  [LAUNCH_INFRASTRUCTURE_PHASES.AT_SITE]: (regionName) => ({
    title: 'At the site',
    body: `You arrive at the project site in ${regionName}. Crowd and media await the ribbon-cutting.`,
  }),
  [LAUNCH_INFRASTRUCTURE_PHASES.RIBBON_CUTTING]: (regionName) => ({
    title: 'Ribbon-cutting',
    body: `You cut the ribbon and give a short speech. The infrastructure project in ${regionName} is officially launched. Regional support and approval rise.`,
  }),
  [LAUNCH_INFRASTRUCTURE_PHASES.RETURN]: () => ({
    title: 'Return to the palace',
    body: 'Motorcade back to the capital. The launch is complete.',
  }),
}

export default function LaunchInfrastructureView({ phase, regionName = '', onAdvance }) {
  const content = PHASE_CONTENT[phase]
    ? PHASE_CONTENT[phase](regionName)
    : { title: 'Launch infrastructure', body: '' }

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
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b98a5', marginBottom: 8 }}>
          Infrastructure launch
        </div>
        <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: '#e7e9ea' }}>{content.title}</h2>
        <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.5, color: '#8b98a5' }}>{content.body}</p>
        <button
          type="button"
          onClick={onAdvance}
          style={{ padding: '12px 24px', background: '#1d9bf0', color: '#0f1419', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
