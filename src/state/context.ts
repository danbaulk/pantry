import { createContext } from 'react'
import type { Aisle, DayOfWeek, GroceryItem, ID, PantryData, Recipe } from '../types'

export type RecipeInput = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
export type GroceryItemInput = Omit<GroceryItem, 'id'>

export type DeleteResult = { ok: true } | { ok: false; reason: string }

export interface PantryContextValue {
  data: PantryData

  // Lookups
  getRecipe: (id: ID) => Recipe | undefined
  getItem: (id: ID) => GroceryItem | undefined
  getAisle: (id: ID) => Aisle | undefined
  /** Aisles sorted by walk-order. */
  sortedAisles: Aisle[]
  /** `settings.excludedItemIds` as a Set — pass to the `suggest.ts` allergy helpers. */
  excludedItemIds: Set<ID>

  // Recipes
  createRecipe: (input: RecipeInput) => ID
  updateRecipe: (id: ID, input: RecipeInput) => void
  deleteRecipe: (id: ID) => void

  // Grocery items
  createItem: (input: GroceryItemInput) => GroceryItem
  updateItem: (id: ID, input: GroceryItemInput) => void
  deleteItem: (id: ID) => DeleteResult

  // Aisles
  createAisle: (name: string) => Aisle
  renameAisle: (id: ID, name: string) => void
  deleteAisle: (id: ID) => DeleteResult
  moveAisle: (id: ID, direction: 'up' | 'down') => void

  // Weekly plan
  addMeal: (recipeId: ID, day?: DayOfWeek) => void
  removeMeal: (mealId: ID) => void
  setMealDay: (mealId: ID, day?: DayOfWeek) => void
  setMealServings: (mealId: ID, servings?: number) => void
  clearPlan: () => void

  // Shopping list (derived from the plan; user records what they already have)
  setHave: (lineKey: string, quantity: number) => void
  clearHave: () => void

  // Settings (allergy / excluded grocery items)
  toggleExcludedItem: (itemId: ID) => void
  clearExcludedItems: () => void
}

export const PantryContext = createContext<PantryContextValue | null>(null)
