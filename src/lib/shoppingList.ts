import type { Aisle, GroceryItem, ID, Recipe, ShoppingState, WeeklyPlan } from '../types'
import { roundQuantity } from './format'

/** Synthetic bucket id for a line whose linked item can't be resolved. */
const OTHER_ID = '__other__'

/** Key identifying a mergeable line: same item + unit combine, units stay split. */
export function lineKey(itemId: ID, unit: string): string {
  return `${itemId}::${unit}`
}

export interface Requirement {
  itemId: ID
  unit: string
  quantity: number
}

/**
 * The scaled recipe base: how much of each (item, unit) the week's plan needs,
 * before any "already have" is subtracted. Each meal's ingredients are scaled by
 * its effective servings and summed per (item, unit) — mismatched units stay split.
 */
export function buildRequirements(plan: WeeklyPlan, recipes: Recipe[]): Map<string, Requirement> {
  const recipeById = new Map(recipes.map((r) => [r.id, r]))
  const totals = new Map<string, Requirement>()
  for (const meal of plan.meals) {
    const recipe = recipeById.get(meal.recipeId)
    if (!recipe) continue // recipe deleted — skip defensively, like the planner
    const servings = meal.servings ?? recipe.servings
    const scale = recipe.servings > 0 ? servings / recipe.servings : 1
    for (const ing of recipe.ingredients) {
      const key = lineKey(ing.itemId, ing.unit)
      const add = (Number.isFinite(ing.quantity) ? ing.quantity : 0) * scale
      const existing = totals.get(key)
      if (existing) existing.quantity += add
      else totals.set(key, { itemId: ing.itemId, unit: ing.unit, quantity: add })
    }
  }
  return totals
}

export interface ShoppingLine {
  key: string
  name: string
  itemId: ID
  unit: string
  quantity: number
  /** Provenance for the UI: the recipe need and how much is already had. */
  need: number
  have: number
}

export interface ShoppingGroup {
  id: string
  name: string
  lines: ShoppingLine[]
}

/**
 * The final, aisle-grouped buy list: recipe requirements minus what the user
 * already has, per (item, unit). Lines that net to ≤ 0 (you have enough) drop off.
 */
export function buildShoppingList(
  plan: WeeklyPlan,
  recipes: Recipe[],
  shopping: ShoppingState,
  getItem: (id: ID) => GroceryItem | undefined,
  sortedAisles: Aisle[],
): ShoppingGroup[] {
  const byBucket = new Map<string, ShoppingLine[]>()

  for (const req of buildRequirements(plan, recipes).values()) {
    const key = lineKey(req.itemId, req.unit)
    const have = shopping.have[key] ?? 0
    const quantity = roundQuantity(req.quantity - have)
    if (quantity <= 0) continue
    const item = getItem(req.itemId)
    const bucket = item ? item.aisleId : OTHER_ID
    const line: ShoppingLine = {
      key,
      name: item?.name ?? '(unknown item)',
      itemId: req.itemId,
      unit: req.unit,
      quantity,
      need: roundQuantity(req.quantity),
      have,
    }
    const arr = byBucket.get(bucket)
    if (arr) arr.push(line)
    else byBucket.set(bucket, [line])
  }

  const byName = (x: ShoppingLine, y: ShoppingLine) => x.name.localeCompare(y.name)
  const groups: ShoppingGroup[] = []
  for (const aisle of sortedAisles) {
    const lines = byBucket.get(aisle.id)
    if (lines?.length) groups.push({ id: aisle.id, name: aisle.name, lines: lines.sort(byName) })
  }
  const other = byBucket.get(OTHER_ID)
  if (other?.length) groups.push({ id: OTHER_ID, name: 'Other', lines: other.sort(byName) })

  return groups
}

export interface HaveRow {
  key: string
  name: string
  unit: string
  /** How much the recipes need (the ceiling for "already have"). */
  need: number
  have: number
}

/**
 * Rows for the "Already have" column: one per recipe requirement (item + unit),
 * carrying the current have amount and the need it offsets. Ordered to parallel the
 * buy list (aisle walk-order, then name).
 */
export function buildHaveRows(
  plan: WeeklyPlan,
  recipes: Recipe[],
  shopping: ShoppingState,
  getItem: (id: ID) => GroceryItem | undefined,
  sortedAisles: Aisle[],
): HaveRow[] {
  const aisleOrder = new Map(sortedAisles.map((a, i) => [a.id, i]))
  const rows = [...buildRequirements(plan, recipes).values()].map((req) => {
    const item = getItem(req.itemId)
    const key = lineKey(req.itemId, req.unit)
    const order = item ? aisleOrder.get(item.aisleId) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
    const row: HaveRow = {
      key,
      name: item?.name ?? '(unknown item)',
      unit: req.unit,
      need: roundQuantity(req.quantity),
      have: shopping.have[key] ?? 0,
    }
    return { row, order }
  })
  rows.sort((a, b) => a.order - b.order || a.row.name.localeCompare(b.row.name))
  return rows.map((r) => r.row)
}
