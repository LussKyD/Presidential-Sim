/** Desk tablet: Diary, Calendar (events + propose), Call log (contacts, call, schedule meeting). */
import { useState } from 'react'
import { CONTACTS, getContact } from '../../core/constants/contacts'

const TABS = { DIARY: 'diary', CALENDAR: 'calendar', CALLS: 'calls' }

export default function TabletPanel({
  state,
  onClose,
  onAddDiaryEntry,
  onAddProposedEvent,
  onLogCall,
  onScheduleMeeting,
}) {
  const [tab, setTab] = useState(TABS.CALENDAR)
  const [diaryInput, setDiaryInput] = useState('')
  const [proposeMonth, setProposeMonth] = useState(state?.time?.month ?? 1)
  const [proposeYear, setProposeYear] = useState(state?.time?.year ?? 2026)
  const [proposeTitle, setProposeTitle] = useState('')
  const [scheduleFor, setScheduleFor] = useState(null)
  const [scheduleMonth, setScheduleMonth] = useState(state?.time?.month ?? 1)
  const [scheduleYear, setScheduleYear] = useState(state?.time?.year ?? 2026)

  const time = state?.time
  const desk = state?.desk
  const meetings = desk?.meetings ?? []
  const callLog = desk?.callLog ?? []
  const diary = desk?.diary ?? []
  const proposedEvents = desk?.proposedEvents ?? []
  const events = state?.events ?? []
  const calendar = state?.calendar

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const calendarEntries = []
  if (calendar?.budgetDue) calendarEntries.push({ month: calendar.budgetMonth, year: time?.year, title: 'Budget day — table in Parliament', type: 'calendar' })
  if (calendar?.openingMonth) calendarEntries.push({ month: calendar.openingMonth, year: time?.year, title: 'Opening of Parliament', type: 'calendar' })
  meetings.filter((m) => !m.done).forEach((m) => {
    const c = getContact(m.contactId)
    calendarEntries.push({ month: m.month, year: m.year, title: `Meeting: ${c?.name ?? m.contactId}`, type: 'meeting', id: m.id })
  })
  proposedEvents.forEach((e) => calendarEntries.push({ month: e.month, year: e.year, title: e.title, type: 'proposed' }))
  const recentEvents = events.slice(-12).reverse()

  function handleAddDiary() {
    const t = diaryInput.trim()
    if (t) {
      onAddDiaryEntry?.(t)
      setDiaryInput('')
    }
  }

  function handleProposeEvent() {
    onAddProposedEvent?.(proposeMonth, proposeYear, proposeTitle || 'Event')
    setProposeTitle('')
  }

  function confirmSchedule(contactId) {
    onScheduleMeeting?.(contactId, scheduleMonth, scheduleYear)
    setScheduleFor(null)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          width: 'min(420px, 96vw)',
          maxHeight: '85vh',
          background: '#16181c',
          border: '1px solid #2f3336',
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #2f3336', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: '#e7e9ea' }}>Desk tablet</span>
          <button type="button" onClick={onClose} style={{ background: '#2f3336', border: 'none', color: '#e7e9ea', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
            Close
          </button>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #2f3336' }}>
          {[TABS.DIARY, TABS.CALENDAR, TABS.CALLS].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: 'none',
                background: tab === t ? '#1d9bf0' : 'transparent',
                color: tab === t ? '#0f1419' : '#8b98a5',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {tab === TABS.DIARY && (
            <>
              <div style={{ marginBottom: 12 }}>
                <textarea
                  value={diaryInput}
                  onChange={(e) => setDiaryInput(e.target.value)}
                  placeholder="Add diary entry..."
                  rows={2}
                  style={{ width: '100%', padding: 8, background: '#0f1419', border: '1px solid #2f3336', borderRadius: 8, color: '#e7e9ea', fontSize: 12, resize: 'vertical' }}
                />
                <button type="button" onClick={handleAddDiary} style={{ marginTop: 6, padding: '6px 12px', background: '#1d9bf0', border: 'none', borderRadius: 8, color: '#0f1419', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
                  Add entry
                </button>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#8b98a5', fontSize: 12 }}>
                {diary.slice().reverse().slice(0, 20).map((entry, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    <span style={{ color: '#6e767d' }}>{entry.month}/{entry.year}</span> — {entry.text}
                  </li>
                ))}
                {diary.length === 0 && <li>No entries yet.</li>}
              </ul>
            </>
          )}
          {tab === TABS.CALENDAR && (
            <>
              <div style={{ marginBottom: 10, padding: '6px 10px', background: '#0f1419', borderRadius: 6, fontSize: 11, color: '#8b98a5', display: 'flex', gap: 12 }}>
                <span>Approval: <strong style={{ color: '#e7e9ea' }}>{typeof state?.population?.publicApproval === 'number' ? Math.round(state.population.publicApproval * 100) : '—'}%</strong></span>
                <span>Coup risk: <strong style={{ color: '#e7e9ea' }}>{typeof state?.politics?.coupRisk === 'number' ? Math.round(state.politics.coupRisk * 100) : '—'}%</strong></span>
              </div>
              {(() => {
                const curM = time?.month ?? 1
                const curY = time?.year ?? 2026
                const budgetM = calendar?.budgetMonth ?? 3
                const openM = calendar?.openingMonth ?? 6
                const nextBudget = curM < budgetM ? { month: budgetM, year: curY, label: 'Budget day' } : { month: budgetM, year: curY + 1, label: 'Budget day' }
                const nextOpen = curM < openM ? { month: openM, year: curY, label: 'Opening of Parliament' } : { month: openM, year: curY + 1, label: 'Opening of Parliament' }
                const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const first = (nextBudget.year < nextOpen.year || (nextBudget.year === nextOpen.year && nextBudget.month < nextOpen.month))
                  ? nextBudget
                  : nextOpen
                return (
                  <div style={{ marginBottom: 12, padding: 8, background: '#0f1419', borderRadius: 8, border: '1px solid #2f3336', fontSize: 12, color: '#e7e9ea' }}>
                    <span style={{ color: '#6e767d' }}>Next: </span>{first.label} — {monthNames[first.month]} {first.year}
                  </div>
                )
              })()}
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#8b98a5', fontSize: 12 }}>Upcoming &amp; scheduled</div>
              <ul style={{ margin: 0, paddingLeft: 18, marginBottom: 16, fontSize: 12, color: '#e7e9ea' }}>
                {calendarEntries.length === 0 && <li style={{ color: '#8b98a5' }}>No scheduled events.</li>}
                {calendarEntries.slice().sort((a, b) => (a.year - b.year) || (a.month - b.month)).slice(0, 15).map((e, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {e.month}/{e.year} — {e.title}
                  </li>
                ))}
              </ul>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#8b98a5', fontSize: 12 }}>Propose event</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                <select value={proposeMonth} onChange={(e) => setProposeMonth(Number(e.target.value))} style={{ padding: '6px 8px', background: '#0f1419', border: '1px solid #2f3336', borderRadius: 6, color: '#e7e9ea', fontSize: 12 }}>
                  {monthNames.slice(1).map((name, i) => (
                    <option key={i} value={i + 1}>{name}</option>
                  ))}
                </select>
                <input type="number" value={proposeYear} onChange={(e) => setProposeYear(Number(e.target.value) || 2026)} min={2026} max={2040} style={{ width: 64, padding: '6px 8px', background: '#0f1419', border: '1px solid #2f3336', borderRadius: 6, color: '#e7e9ea', fontSize: 12 }} />
                <input type="text" value={proposeTitle} onChange={(e) => setProposeTitle(e.target.value)} placeholder="Event title" style={{ flex: 1, minWidth: 120, padding: '6px 8px', background: '#0f1419', border: '1px solid #2f3336', borderRadius: 6, color: '#e7e9ea', fontSize: 12 }} />
                <button type="button" onClick={handleProposeEvent} style={{ padding: '6px 12px', background: '#059669', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
                  Add
                </button>
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#8b98a5', fontSize: 12 }}>Recent events</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: '#8b98a5' }}>
                {recentEvents.slice(0, 8).map((e) => (
                  <li key={e.id} style={{ marginBottom: 2 }}>{e.at?.month}/{e.at?.year} — {e.message}</li>
                ))}
              </ul>
            </>
          )}
          {tab === TABS.CALLS && (
            <>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#8b98a5', fontSize: 12 }}>Contacts</div>
              {CONTACTS.map((c) => (
                <div key={c.id} style={{ marginBottom: 12, padding: 10, background: '#0f1419', borderRadius: 8, border: '1px solid #2f3336' }}>
                  <div style={{ fontWeight: 600, color: '#e7e9ea', fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#8b98a5', marginBottom: 8 }}>{c.role}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => onLogCall?.(c.id)} style={{ padding: '6px 12px', background: '#1d9bf0', border: 'none', borderRadius: 6, color: '#0f1419', fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>
                      Call
                    </button>
                    <button type="button" onClick={() => setScheduleFor(scheduleFor === c.id ? null : c.id)} style={{ padding: '6px 12px', background: scheduleFor === c.id ? '#059669' : '#2f3336', border: 'none', borderRadius: 6, color: '#e7e9ea', fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>
                      {scheduleFor === c.id ? 'Pick date below' : 'Schedule meeting'}
                    </button>
                    {scheduleFor === c.id && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                        <select value={scheduleMonth} onChange={(e) => setScheduleMonth(Number(e.target.value))} style={{ padding: '4px 6px', background: '#0f1419', border: '1px solid #2f3336', borderRadius: 4, color: '#e7e9ea', fontSize: 11 }}>
                          {monthNames.slice(1).map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
                        </select>
                        <input type="number" value={scheduleYear} onChange={(e) => setScheduleYear(Number(e.target.value) || 2026)} min={2026} max={2040} style={{ width: 52, padding: '4px 6px', background: '#0f1419', border: '1px solid #2f3336', borderRadius: 4, color: '#e7e9ea', fontSize: 11 }} />
                        <button type="button" onClick={() => confirmSchedule(c.id)} style={{ padding: '4px 10px', background: '#059669', border: 'none', borderRadius: 4, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>Confirm</button>
                        <button type="button" onClick={() => setScheduleFor(null)} style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #2f3336', borderRadius: 4, color: '#8b98a5', cursor: 'pointer', fontSize: 11 }}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ fontWeight: 700, marginTop: 16, marginBottom: 8, color: '#8b98a5', fontSize: 12 }}>Call log</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: '#8b98a5' }}>
                {callLog.slice().reverse().slice(0, 15).map((log, i) => {
                  const contact = getContact(log.contactId)
                  return <li key={i} style={{ marginBottom: 2 }}>{log.month}/{log.year} — {contact?.name ?? log.contactId}</li>
                })}
                {callLog.length === 0 && <li>No calls yet.</li>}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
