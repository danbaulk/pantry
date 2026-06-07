export type ID = string

export interface Aisle {
  id: ID
  name: string
  /** Walk-order position; lower comes first in a store pass. */
  order: number
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

export interface PantryData {
  version: 2
  aisles: Aisle[]
  groceryItems: GroceryItem[]
  recipes: Recipe[]
  plan: WeeklyPlan
}
