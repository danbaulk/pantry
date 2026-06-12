import type { Aisle, GroceryItem, ID } from '../types'

export interface ItemsByAisle {
  aisle: Aisle
  items: GroceryItem[]
}

/** Grocery items in one aisle, sorted by name. */
export function getItemsInAisle(groceryItems: GroceryItem[], aisleId: ID): GroceryItem[] {
  return groceryItems
    .filter((i) => i.aisleId === aisleId)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Group grocery items under their aisle, each group sorted by name and empty
 * aisles dropped. Pass `sortedAisles` so groups follow store walk-order. Used
 * by the ingredient pickers.
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
