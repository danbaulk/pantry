import type { Aisle, GroceryItem } from '../types'

export interface ItemsByAisle {
  aisle: Aisle
  items: GroceryItem[]
}

/**
 * Group grocery items under their aisle, each group sorted by name and empty
 * aisles dropped. Pass `sortedAisles` so groups follow store walk-order. Shared
 * by the ingredient pickers and the catalogue view.
 */
export function buildItemsByAisle(
  sortedAisles: Aisle[],
  groceryItems: GroceryItem[],
): ItemsByAisle[] {
  return sortedAisles
    .map((aisle) => ({
      aisle,
      items: groceryItems
        .filter((i) => i.aisleId === aisle.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((g) => g.items.length > 0)
}
