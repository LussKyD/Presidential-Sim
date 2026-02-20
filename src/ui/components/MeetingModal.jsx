/** Shown when a scheduled meeting is due: person comes to office for dialogue. */
import { useEffect } from 'react'
import { getContact } from '../../core/constants/contacts'

const DIALOGUE_LINES = [
  'We’ve reviewed the brief. Here’s what we recommend.',
  'Good to see you. I’ve prepared a short update.',
  'Thank you for making time. A few points to discuss.',
]

export default function MeetingModal({ meeting, onDismiss }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onDismiss?.(meeting?.id) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [meeting?.id, onDismiss])

  if (!meeting) return null
  const contact = getContact(meeting.contactId)
  const name = contact?.name ?? meeting.contactId
  const role = contact?.role ?? ''
  const line = DIALOGUE_LINES[Math.abs(meeting.id?.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % DIALOGUE_LINES.length]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
      }}
      onClick={(e) => e.target === e.currentTarget && onDismiss?.(meeting.id)}
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
        <div style={{ fontSize: 11, color: '#1d9bf0', marginBottom: 4 }}>OFFICE MEETING</div>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#e7e9ea', marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: 12, color: '#8b98a5', marginBottom: 16 }}>{role}</div>
        <p style={{ color: '#e7e9ea', fontSize: 14, lineHeight: 1.5, margin: '0 0 20px 0' }}>{line}</p>
        <button
          type="button"
          onClick={() => onDismiss?.(meeting.id)}
          title="End meeting (Esc)"
          style={{ width: '100%', padding: '12px 16px', background: '#059669', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
        >
          End meeting
        </button>
      </div>
    </div>
  )
}
