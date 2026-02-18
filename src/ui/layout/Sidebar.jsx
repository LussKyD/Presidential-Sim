export default function Sidebar({ view = 'office', onViewChange }) {
  const linkStyle = (v) => ({
    color: view === v ? '#e7e9ea' : '#8b98a5',
    cursor: 'pointer',
    textDecoration: 'none',
  })
  return (
    <aside style={{
      width: 200,
      padding: '1rem',
      borderRight: '1px solid #2f3336',
      background: '#16181c',
    }}>
      <nav>
        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Presidential Sim</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>
            <button type="button" onClick={() => onViewChange?.('office')} style={{ ...linkStyle('office'), background: 'none', border: 'none', fontSize: 'inherit' }}>
              Office
            </button>
          </li>
          <li>
            <button type="button" onClick={() => onViewChange?.('map')} style={{ ...linkStyle('map'), background: 'none', border: 'none', fontSize: 'inherit' }}>
              Map
            </button>
          </li>
          <li>
            <button type="button" onClick={() => onViewChange?.('dashboard')} style={{ ...linkStyle('dashboard'), background: 'none', border: 'none', fontSize: 'inherit' }}>
              Dashboard
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
