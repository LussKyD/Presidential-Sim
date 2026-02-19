/** Month names for game calendar (1–12). */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Format game time as "January, Day 1, 2026" (month name, day 1–7, year).
 * Falls back to "M/Y" or "M/Y (Day N)" if time has no day.
 * @param {{ day?: number, month: number, year: number }} time
 * @returns {string}
 */
export function formatGameDate(time) {
  if (!time) return '—'
  const monthName = MONTH_NAMES[(time.month ?? 1) - 1] ?? String(time.month)
  if (time.day != null) {
    return `${monthName}, Day ${time.day}, ${time.year}`
  }
  return `${time.month}/${time.year}`
}
