import type { GroceryItem, Ingredient } from '../types'

/** Round a (possibly scaled) quantity to at most 2 decimal places. */
export function roundQuantity(n: number): number {
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

/** Format a quantity for display: rounded to ≤2 dp with trailing zeros stripped. */
export function formatQuantity(n: number): string {
  return String(roundQuantity(n))
}

/** Render an ingredient as a single line, e.g. "2 can — Chopped tomatoes". */
export function formatIngredient(ing: Ingredient, item: GroceryItem | undefined): string {
  const name = item?.name ?? '(unknown item)'
  const qty = Number.isFinite(ing.quantity) ? ing.quantity : 0
  return `${formatQuantity(qty)} ${ing.unit} — ${name}`
}

/** Pluralise a word by count, e.g. pluralize('item', 2) => 'items'. */
export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`
}
