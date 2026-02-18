import Sidebar from './Sidebar'

export default function MainLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        {children}
      </main>
    </div>
  )
}
