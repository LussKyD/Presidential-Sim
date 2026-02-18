import { useEffect, useMemo, useRef, useState } from 'react'
import { createSimulationEngine } from '../../core/engine/simulationEngine'

export function useSimulation({ tickMs = 2000, seed = 1 } = {}) {
  const engineRef = useRef(null)
  const [state, setState] = useState(null)
  const [isRunning, setIsRunning] = useState(true)
  const runningRef = useRef(true)

  const api = useMemo(() => {
    return {
      applyPolicy(policyId, value) {
        if (!engineRef.current) return
        engineRef.current.applyPolicy(policyId, value)
        setState(engineRef.current.getState())
      },
      tick() {
        if (!engineRef.current) return
        engineRef.current.tick()
        setState(engineRef.current.getState())
      },
      toggleRunning() {
        setIsRunning((v) => {
          const next = !v
          runningRef.current = next
          return next
        })
      },
    }
  }, [])

  useEffect(() => {
    const engine = createSimulationEngine({ seed })
    engineRef.current = engine
    setState(engine.getState())

    const id = setInterval(() => {
      if (!runningRef.current) return
      engine.tick()
      setState(engine.getState())
    }, tickMs)

    return () => clearInterval(id)
  }, [tickMs, seed])

  return {
    engine: engineRef.current,
    state,
    isRunning,
    ...api,
  }
}

