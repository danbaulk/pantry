export type ID = string

export interface Aisle {
  id: ID
  name: string
}

/**
 * A supermarket profile: one user-named ordering of the shared aisle catalogue.
 * All profiles reference the same aisles; only the walk-order differs.
 */
export interface SupermarketProfile {
  id: ID
  name: string
  /**
   * Aisle ids in this store's walk-order. May drift (deleted/missing aisles) —
   * order via `orderAisles()` (src/lib/supermarkets.ts), which heals at read time.
   */
  aisleIds: ID[]
}

export interface GroceryItem {
  id: ID
  name: string
  aisleId: ID
  defaultUnit: string
}

export interface Ingredient {
  itemId: ID
  quantity: number
  /** Defaults to the item's defaultUnit, but can be overridden per recipe. */
  unit: string
}

export interface Recipe {
  id: ID
  name: string
  description?: string
  servings: number
  instructions?: string
  tags: string[]
  favourite: boolean
  notes?: string
  source?: string
  ingredients: Ingredient[]
  createdAt: string
  updatedAt: string
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface PlannedMeal {
  id: ID
  recipeId: ID
  /** Undefined means the meal sits in the unassigned bucket. */
  day?: DayOfWeek
  /** Per-meal serving override; undefined falls back to the recipe default. */
  servings?: number
}

export interface WeeklyPlan {
  meals: PlannedMeal[]
}

/**
 * Persisted shopping state. The list itself is always derived from the plan; this
 * only stores the user's reconciliation input: `have` records how much of each
 * recipe requirement the user already has, keyed by `itemId::unit`, and is
 * subtracted from what the plan needs. Maxing an item out (have = need) is how a
 * line is "ticked off" — it nets to zero and drops from the buy list.
 */
export interface ShoppingState {
  have: Record<string, number>
}

/**
 * User settings. `excludedItemIds` are grocery items flagged as allergens / to
 * avoid: recipes using any of them are badged across the library and kept out of
 * the randomiser and suggestions.
 */
export interface Settings {
  excludedItemIds: ID[]
}

export interface PantryData {
  version: 5
  aisles: Aisle[]
  /** Never empty — storage guarantees at least one profile on load. */
  supermarkets: SupermarketProfile[]
  activeSupermarketId: ID
  groceryItems: GroceryItem[]
  recipes: Recipe[]
  plan: WeeklyPlan
  shopping: ShoppingState
  settings: Settings
}
