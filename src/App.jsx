import MainLayout from './ui/layout/MainLayout'
import Dashboard from './ui/components/Dashboard'
import PolicyPanel from './ui/components/PolicyPanel'
import { useSimulation } from './ui/hooks/useSimulation'

function App() {
  const { state, engine, applyPolicy, isRunning, toggleRunning, tick } = useSimulation({
    tickMs: 2000,
    seed: 1,
  })

  return (
    <MainLayout>
      <h1>Presidential Sim — Alpha</h1>
      <p style={{ color: '#8b98a5', marginTop: 0 }}>
        One tick = one month. Adjust policies and watch the country react.
      </p>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 520px', minWidth: 320 }}>
          <Dashboard state={state} />
        </div>
        <div style={{ flex: '1 1 340px', minWidth: 280 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={toggleRunning} style={buttonStyle}>
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={tick} style={buttonStyle} disabled={isRunning}>
              Step month
            </button>
          </div>
          <PolicyPanel policies={engine?.policyDefs ?? []} values={state?.government?.policies} onChange={applyPolicy} />
        </div>
      </div>
    </MainLayout>
  )
}

const buttonStyle = {
  background: '#1d9bf0',
  color: '#0f1419',
  border: 'none',
  padding: '0.55rem 0.75rem',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
}

export default App
