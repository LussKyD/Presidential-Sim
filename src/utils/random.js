/** Seeded RNG for reproducible simulation. TODO Phase 2. */
export function createSeededRandom(seed) {
  return () => Math.random()
}
