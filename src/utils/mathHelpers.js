/** Clamp and other math helpers. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
