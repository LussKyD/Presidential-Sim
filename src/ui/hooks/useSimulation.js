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
      applyStateAddressOutcome(positive) {
        if (!engineRef.current) return
        engineRef.current.applyStateAddressOutcome(positive)
        const nextState = engineRef.current.getState()
        setState(nextState)
        if (nextState?.regime?.status === 'in_power') {
          try { localStorage.setItem(SAVE_KEY, JSON.stringify(nextState)) } catch (_) {}
        }
      },
      tableBudget() {
        if (!engineRef.current) return
        engineRef.current.tableBudget()
        setState(engineRef.current.getState())
      },
      respondToCrisis(response) {
        if (!engineRef.current) return
        engineRef.current.respondToCrisis(response)
        setState(engineRef.current.getState())
      },
      applyCabinetMeetingOutcome(success) {
        if (!engineRef.current) return
        engineRef.current.applyCabinetMeetingOutcome(success)
        setState(engineRef.current.getState())
      },
      scheduleMeeting(contactId, month, year) {
        if (!engineRef.current) return
        engineRef.current.scheduleMeeting(contactId, month, year)
        const next = engineRef.current.getState()
        setState(next)
        if (next?.regime?.status === 'in_power') try { localStorage.setItem(SAVE_KEY, JSON.stringify(next)) } catch (_) {}
      },
      logCall(contactId) {
        if (!engineRef.current) return
        engineRef.current.logCall(contactId)
        const next = engineRef.current.getState()
        setState(next)
        if (next?.regime?.status === 'in_power') try { localStorage.setItem(SAVE_KEY, JSON.stringify(next)) } catch (_) {}
      },
      addDiaryEntry(text) {
        if (!engineRef.current) return
        engineRef.current.addDiaryEntry(text)
        const next = engineRef.current.getState()
        setState(next)
        if (next?.regime?.status === 'in_power') try { localStorage.setItem(SAVE_KEY, JSON.stringify(next)) } catch (_) {}
      },
      addProposedEvent(month, year, title) {
        if (!engineRef.current) return
        engineRef.current.addProposedEvent(month, year, title)
        const next = engineRef.current.getState()
        setState(next)
        if (next?.regime?.status === 'in_power') try { localStorage.setItem(SAVE_KEY, JSON.stringify(next)) } catch (_) {}
      },
      dismissMeeting(meetingId) {
        if (!engineRef.current) return
        engineRef.current.dismissMeeting(meetingId)
        const next = engineRef.current.getState()
        setState(next)
        if (next?.regime?.status === 'in_power') try { localStorage.setItem(SAVE_KEY, JSON.stringify(next)) } catch (_) {}
      },
      setBudgetPie(...vals) {
        if (!engineRef.current?.setBudgetPie) return
        engineRef.current.setBudgetPie(...vals)
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

