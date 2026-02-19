/** Immersive state visit: narrative step-by-step (handover → travel → arrival → meeting → return). */
import { STATE_VISIT_PHASES } from '../../core/constants/activities'

const PHASE_CONTENT = {
  [STATE_VISIT_PHASES.HANDOVER]: (countryName) => ({
    title: 'Handover to deputy',
    body: `You brief the deputy on key dossiers and leave the capital for the state visit to ${countryName}. News headlines: "President departs for ${countryName} summit."`,
  }),
  [STATE_VISIT_PHASES.MOTORCADE_TO_AIRPORT]: () => ({
    title: 'Motorcade to the airport',
    body: 'The motorcade leaves the palace. Security clears the route. You pass crowds and press vans on the way to the airport.',
  }),
  [STATE_VISIT_PHASES.FLIGHT]: (countryName) => ({
    title: 'In flight',
    body: `Air Force One is en route to ${countryName}. Briefings, rest, and preparation for the meeting fill the hours until landing.`,
  }),
  [STATE_VISIT_PHASES.ARRIVAL]: (countryName) => ({
    title: 'Arrival',
    body: `You land in ${countryName}. Honour guard and officials receive you at the airport. The host leader sends warm greetings.`,
  }),
  [STATE_VISIT_PHASES.MOTORCADE_TO_PALACE]: (countryName) => ({
    title: 'To the palace',
    body: `Motorcade to the seat of government in ${countryName}. Streets are lined; the formal meeting awaits at the palace.`,
  }),
  [STATE_VISIT_PHASES.MEETING_AT_PALACE]: (countryName, leaderName) => ({
    title: 'Meeting at the palace',
    body: `You meet ${leaderName} at the palace. Bilateral talks, handshakes, and a joint statement. Relations with ${countryName} are strengthened.`,
  }),
  [STATE_VISIT_PHASES.RETURN_FLIGHT]: () => ({
    title: 'Return flight',
    body: 'You board for the return flight. The delegation reviews outcomes; soon you will be back in the capital.',
  }),
  [STATE_VISIT_PHASES.RETURN_TO_OFFICE]: () => ({
    title: 'Back at the office',
    body: 'You land, motorcade to the palace, and return to the office. The state visit is complete.',
  }),
}

export default function StateVisitView({ phase, countryName = '', leaderName = '', onAdvance }) {
  const content = PHASE_CONTENT[phase]
    ? PHASE_CONTENT[phase](countryName, leaderName)
    : { title: 'State visit', body: '' }

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
          State visit
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
