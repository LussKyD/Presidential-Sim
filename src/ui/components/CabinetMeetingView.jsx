/** Cabinet meeting in 3D briefing room: choose outcome (unity or disagreement). */
export default function CabinetMeetingView({ onChoose }) {
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
          maxWidth: 440,
          width: '100%',
          background: '#16181c',
          border: '1px solid #2f3336',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b98a5', marginBottom: 8 }}>
          Cabinet meeting
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800, color: '#e7e9ea' }}>
          Chair the meeting
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.5, color: '#8b98a5' }}>
          Ministers are present. How does the meeting conclude?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => onChoose?.(true)}
            style={{
              padding: '12px 20px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Unity behind your agenda
          </button>
          <button
            type="button"
            onClick={() => onChoose?.(false)}
            style={{
              padding: '12px 20px',
              background: '#2f3336',
              color: '#e7e9ea',
              border: '1px solid #536471',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Ministers disagree on priorities
          </button>
        </div>
      </div>
    </div>
  )
}
