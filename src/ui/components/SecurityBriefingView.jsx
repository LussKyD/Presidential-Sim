/** Security briefing flow: enter room → review intel → decision. */
import { SECURITY_BRIEFING_PHASES } from '../../core/constants/activities'

const PHASE_CONTENT = {
  [SECURITY_BRIEFING_PHASES.ENTER]: () => ({
    title: 'Enter the briefing room',
    body: 'You enter the secure briefing room. Defense, intelligence, and interior are present. Classified materials are on the table.',
  }),
  [SECURITY_BRIEFING_PHASES.REVIEW]: () => ({
    title: 'Review intel',
    body: 'You review the latest threat assessment: border stability, military morale, and domestic unrest indicators. The picture is clear enough to act on.',
  }),
  [SECURITY_BRIEFING_PHASES.DECISION]: () => ({
    title: 'Conclusion',
    body: 'You align priorities with the security council. The briefing concludes; threat posture is updated. Coup risk is slightly reduced.',
  }),
}

export default function SecurityBriefingView({ phase, onAdvance }) {
  const content = PHASE_CONTENT[phase] ? PHASE_CONTENT[phase]() : { title: 'Security briefing', body: '' }

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
          Security briefing
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
