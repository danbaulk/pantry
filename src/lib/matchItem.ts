/**
 * Best-effort match of a free-text ingredient name (e.g. from the paste/import
 * parser) to an existing catalogue grocery item. Intentionally simple — the
 * import UI lets the user correct or quick-add when this misses.
 */
import type { GroceryItem } from '../types'

/** Lowercase, collapse whitespace, and naively singularise for loose comparison. */
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/s$/, '') // naive plural strip; applied to both sides consistently
}

export function matchItem(
  name: string,
  items: GroceryItem[],
): GroceryItem | undefined {
  const target = normalise(name)
  if (!target) return undefined

  const normalised = items.map((item) => ({ item, key: normalise(item.name) }))

  // Exact, then prefix, then substring (either direction) — first hit wins.
  return (
    normalised.find((n) => n.key === target)?.item ??
    normalised.find((n) => n.key.startsWith(target) || target.startsWith(n.key))?.item ??
    normalised.find((n) => n.key.includes(target) || target.includes(n.key))?.item
  )
}
