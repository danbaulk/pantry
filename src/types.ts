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

export interface PantryData {
  version: 1
  aisles: Aisle[]
  groceryItems: GroceryItem[]
  recipes: Recipe[]
}
