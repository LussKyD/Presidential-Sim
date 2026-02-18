/** Time: 1 tick = 1 month. */
export function createTimeManager() {
  let month = 1
  let year = 2026

  function tick() {
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return {
    get currentMonth() {
      return month
    },
    get year() {
      return year
    },
    tick,
  }
}
