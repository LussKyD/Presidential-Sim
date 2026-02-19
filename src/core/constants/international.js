/** Bilateral relations for international diplomacy. */
export const COUNTRY_IDS = ['norden', 'sudland', 'eastalia']

export const COUNTRIES = [
  { id: 'norden', name: 'Norden', leader: 'PM Helga Voss' },
  { id: 'sudland', name: 'Sudland', leader: 'President Carlos Mbeki' },
  { id: 'eastalia', name: 'Eastalia', leader: 'Chairman Wei Lin' },
]

export function getDefaultRelations() {
  return COUNTRY_IDS.reduce((acc, id) => ({ ...acc, [id]: 0.5 }), {})
}

export function getCountry(id) {
  return COUNTRIES.find((c) => c.id === id)
}
