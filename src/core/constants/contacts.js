/** Contacts for desk tablet: call log and schedule meetings. */
export const CONTACT_CATEGORIES = {
  MINISTER: 'minister',
  MILITARY: 'military',
  AIDE: 'aide',
  FRIEND: 'friend',
}

export const CONTACTS = [
  { id: 'defense', name: 'Gen. Mara Okello', role: 'Defence Minister', category: CONTACT_CATEGORIES.MINISTER },
  { id: 'finance', name: 'Dr. James Wanjala', role: 'Finance Minister', category: CONTACT_CATEGORIES.MINISTER },
  { id: 'interior', name: 'Hon. Grace Mbeki', role: 'Interior Minister', category: CONTACT_CATEGORIES.MINISTER },
  { id: 'foreign', name: 'Amb. David Chen', role: 'Foreign Minister', category: CONTACT_CATEGORIES.MINISTER },
  { id: 'justice', name: 'Min. Sarah Odhiambo', role: 'Justice Minister', category: CONTACT_CATEGORIES.MINISTER },
  { id: 'cofs', name: 'Gen. William Kato', role: 'Chief of Defence Staff', category: CONTACT_CATEGORIES.MILITARY },
  { id: 'chief', name: 'Elena Mwangi', role: 'Chief of Staff', category: CONTACT_CATEGORIES.AIDE },
  { id: 'press', name: 'Tom Ochieng', role: 'Press Secretary', category: CONTACT_CATEGORIES.AIDE },
  { id: 'friend1', name: 'Michael Adoyo', role: 'Close friend', category: CONTACT_CATEGORIES.FRIEND },
  { id: 'friend2', name: 'Rebecca Nkrumah', role: 'Close friend', category: CONTACT_CATEGORIES.FRIEND },
]

export function getContact(id) {
  return CONTACTS.find((c) => c.id === id)
}
