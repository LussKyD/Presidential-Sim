export default function Sidebar({ view = 'office', onViewChange }) {
  const linkStyle = (v) => ({
    color: view === v ? '#e7e9ea' : '#8b98a5',
    cursor: 'pointer',
    textDecoration: 'none',
    background: view === v ? '#2f3336' : 'none',
    border: 'none',
    fontSize: 'inherit',
    padding: '6px 10px',
    borderRadius: 6,
    width: '100%',
    textAlign: 'left',
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
          <li style={{ marginBottom: 4 }}>
            <button type="button" onClick={() => onViewChange?.('office')} style={linkStyle('office')} title="Desk view and 3D office">
              Office
            </button>
          </li>
          <li style={{ marginBottom: 4 }}>
            <button type="button" onClick={() => onViewChange?.('map')} style={linkStyle('map')} title="Map and regional approval">
              Map
            </button>
          </li>
          <li style={{ marginBottom: 4 }}>
            <button type="button" onClick={() => onViewChange?.('dashboard')} style={linkStyle('dashboard')} title="Stats, economy, headlines">
              Dashboard
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
