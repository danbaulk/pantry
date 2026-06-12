import { createContext } from 'react'
import type { Aisle, DayOfWeek, GroceryItem, ID, PantryData, Recipe, SupermarketProfile } from '../types'

export type RecipeInput = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
export type GroceryItemInput = Omit<GroceryItem, 'id'>

export type DeleteResult = { ok: true } | { ok: false; reason: string }

export interface PantryContextValue {
  data: PantryData

  // Lookups
  getRecipe: (id: ID) => Recipe | undefined
  getItem: (id: ID) => GroceryItem | undefined
  getAisle: (id: ID) => Aisle | undefined
  /**
   * Aisles in the ACTIVE supermarket's walk-order (dangling ids dropped, aisles
   * missing from the profile appended at the end).
   */
  sortedAisles: Aisle[]
  /** All supermarket profiles — each is its own ordering of the shared aisles. */
  supermarkets: SupermarketProfile[]
  /**
   * The active profile; heals a stale stored id to the first profile. Never
   * undefined (storage guarantees at least one profile).
   */
  activeSupermarket: SupermarketProfile
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
  /**
   * Move an aisle so it sits before the aisle currently at `toIndex` in walk-order
   * (pass `sortedAisles.length` to move it to the end). No-op when the position
   * wouldn't change.
   */
  moveAisle: (id: ID, toIndex: number) => void

  // Supermarket profiles
  /** Creates a profile copying the active profile's (healed) ordering; returns its id. */
  createSupermarket: (name: string) => ID
  renameSupermarket: (id: ID, name: string) => void
  /** Guarded: refuses to delete the last remaining profile. */
  deleteSupermarket: (id: ID) => DeleteResult
  setActiveSupermarket: (id: ID) => void

  // Weekly plan
  addMeal: (recipeId: ID, day?: DayOfWeek) => void
  removeMeal: (mealId: ID) => void
  setMealDay: (mealId: ID, day?: DayOfWeek) => void
  setMealServings: (mealId: ID, servings?: number) => void

  // Shopping list (derived from the plan; user records what they already have)
  setHave: (lineKey: string, quantity: number) => void
  clearHave: () => void

  // Settings (allergy / excluded grocery items)
  toggleExcludedItem: (itemId: ID) => void
}

export const PantryContext = createContext<PantryContextValue | null>(null)
