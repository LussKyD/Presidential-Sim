import { useEffect, useMemo, useRef, useState } from 'react'
import { createSimulationEngine } from '../../core/engine/simulationEngine'

export const SAVE_KEY = 'presidential-sim-save'
const SAVE_EVERY_TICKS = 5
export function useSimulation({ tickMs = 2000, seed = 1, gameKey = 0, initialSave = null } = {}) {
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
        const nextState = engineRef.current.getState()
        setState(nextState)
        if (nextState?.regime?.status === 'in_power' && nextState?.time?.tick % SAVE_EVERY_TICKS === 0) {
          try { localStorage.setItem(SAVE_KEY, JSON.stringify(nextState)) } catch (_) {}
        }
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
    const useSave = gameKey === 0 && initialSave && initialSave?.regime?.status === 'in_power'
    const engine = createSimulationEngine({
      seed,
      initialState: useSave ? initialSave : undefined,
    })
    engineRef.current = engine
    setState(engine.getState())

    const id = setInterval(() => {
      if (!runningRef.current) return
      engine.tick()
      const nextState = engine.getState()
      setState(nextState)
      if (nextState?.regime?.status === 'in_power' && nextState?.time?.tick % SAVE_EVERY_TICKS === 0) {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(nextState)) } catch (_) {}
      }
    }, tickMs)

    return () => clearInterval(id)
  }, [tickMs, seed, gameKey, initialSave])

  // Auto-pause if regime falls.
  useEffect(() => {
    const status = state?.regime?.status
    if (status && status !== 'in_power') {
      runningRef.current = false
      if (isRunning) setIsRunning(false)
    }
  }, [state?.regime?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    engine: engineRef.current,
    state,
    isRunning,
    ...api,
  }
}

