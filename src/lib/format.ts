import type { GroceryItem, Ingredient } from '../types'

/** Render an ingredient as a single line, e.g. "2 can — Chopped tomatoes". */
export function formatIngredient(ing: Ingredient, item: GroceryItem | undefined): string {
  const name = item?.name ?? '(unknown item)'
  const qty = Number.isFinite(ing.quantity) ? ing.quantity : 0
  return `${qty} ${ing.unit} — ${name}`
}
