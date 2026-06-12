import type { Aisle, ID } from '../types'

export const DEFAULT_SUPERMARKET_NAME = 'My supermarket'

/**
 * Order the aisle catalogue by a profile's aisleIds, healing drift: dangling ids
 * are dropped, duplicates collapse, and aisles missing from the profile are
 * appended at the end (catalogue array order). Healing is read-time only —
 * nothing is persisted here.
 */
export function orderAisles(aisles: Aisle[], aisleIds: ID[]): Aisle[] {
  const byId = new Map(aisles.map((a) => [a.id, a]))
  const seen = new Set<ID>()
  const ordered: Aisle[] = []
  for (const id of aisleIds) {
    const aisle = byId.get(id)
    if (aisle && !seen.has(id)) {
      ordered.push(aisle)
      seen.add(id)
    }
  }
  for (const aisle of aisles) {
    if (!seen.has(aisle.id)) ordered.push(aisle)
  }
  return ordered
}
