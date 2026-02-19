/** Region IDs used for regional approval and events (e.g. protests). */
export const REGION_IDS = ['Capital', 'North', 'South', 'East', 'West']

export function getDefaultRegionalApproval(initialApproval = 0.5) {
  return REGION_IDS.reduce((acc, id) => ({ ...acc, [id]: initialApproval }), {})
}
