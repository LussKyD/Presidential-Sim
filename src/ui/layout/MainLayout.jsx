import Sidebar from './Sidebar'

export default function MainLayout({ children, view, onViewChange }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} onViewChange={onViewChange} />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        {children}
      </main>
    </div>
  )
}
