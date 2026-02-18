/** Central pub/sub for simulation and UI. */
const listeners = new Map()

export function on(eventType, handler) {
  if (!listeners.has(eventType)) listeners.set(eventType, [])
  listeners.get(eventType).push(handler)
}

export function emit(eventType, payload) {
  (listeners.get(eventType) || []).forEach((fn) => fn(payload))
}

export function off(eventType, handler) {
  const list = listeners.get(eventType) || []
  const i = list.indexOf(handler)
  if (i !== -1) list.splice(i, 1)
}
