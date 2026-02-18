export default function Sidebar() {
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
          <li><a href="#dashboard" style={{ color: '#8b98a5' }}>Dashboard</a></li>
          <li><a href="#policies" style={{ color: '#8b98a5' }}>Policies</a></li>
        </ul>
      </nav>
    </aside>
  )
}
