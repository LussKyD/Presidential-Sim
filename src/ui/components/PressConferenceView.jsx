/** Press conference flow: prep → podium → Q&A → headline. */
import { PRESS_CONFERENCE_PHASES } from '../../core/constants/activities'

const PHASE_CONTENT = {
  [PRESS_CONFERENCE_PHASES.PREP]: () => ({
    title: 'Preparation',
    body: 'You review talking points with the communications team. The press corps is waiting in the briefing room.',
  }),
  [PRESS_CONFERENCE_PHASES.PODIUM]: () => ({
    title: 'At the podium',
    body: 'You take the podium. Cameras and microphones; the room goes quiet. You open with a short statement.',
  }),
  [PRESS_CONFERENCE_PHASES.Q_AND_A]: () => ({
    title: 'Questions',
    body: 'Reporters fire questions on the economy, security, and recent events. You answer as best you can.',
  }),
  [PRESS_CONFERENCE_PHASES.HEADLINE]: () => ({
    title: 'Headlines',
    body: 'The conference ends. How your message landed will shape the next news cycle—and approval.',
  }),
}

export default function PressConferenceView({ phase, onAdvance }) {
  const content = PHASE_CONTENT[phase] ? PHASE_CONTENT[phase]() : { title: 'Press conference', body: '' }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
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
          Press conference
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
