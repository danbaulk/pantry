import type { Aisle, GroceryItem, ID, PantryData, Recipe, SupermarketProfile } from '../types'
import { newId } from './ids'
import { UNITS } from './units'
import { DEFAULT_SUPERMARKET_NAME, orderAisles } from './supermarkets'

/**
 * A portable, human-authorable bundle of catalogue + recipes. Everything is keyed by
 * **name** (not id): aisles by name, items reference their aisle by name, recipe ingredients
 * reference their item by name. `buildDataFromPack` mints the ids and wires it all up at load
 * time — the same name→id resolution the old hardcoded seed did, generalised so any pack (the
 * bundled starter set today; a supermarket's catalogue later) can become a `PantryData`.
 */
export interface PackIngredient {
  item: string
  quantity: number
  unit: string
}

export interface PackRecipe {
  name: string
  servings: number
  tags?: string[]
  favourite?: boolean
  source?: string
  description?: string
  instructions?: string
  notes?: string
  ingredients: PackIngredient[]
}

export interface PackItem {
  name: string
  aisle: string
  defaultUnit: string
}

export interface PackSupermarket {
  name: string
  /** Aisle names in this store's walk-order. Healed like any profile (see orderAisles). */
  aisleOrder: string[]
}

export interface DataPack {
  /** Aisle names in walk-order. */
  aisles: string[]
  items: PackItem[]
  recipes: PackRecipe[]
  /** Optional named walk-orders; defaults to one profile mirroring `aisles`. */
  supermarkets?: PackSupermarket[]
}

const UNIT_SET = new Set<string>(UNITS)
const norm = (s: string) => s.trim().toLowerCase()

/**
 * Resolve a name-keyed DataPack into a fully-wired PantryData with freshly minted ids.
 *
 * Referential integrity is validated up front: an item that names an unknown aisle, a recipe
 * ingredient that names an unknown item, or any off-list unit throws — so a built pack can
 * never carry a dangling ref or a unit outside UNITS (the same invariants the app enforces on
 * delete). This makes the function safe to reuse for untrusted packs later (import UI).
 */
export function buildDataFromPack(pack: DataPack): PantryData {
  // Aisles.
  const aisles: Aisle[] = pack.aisles.map((name) => ({ id: newId(), name }))
  const aisleByName = new Map(aisles.map((a) => [norm(a.name), a]))

  // Grocery items (each resolves its aisle by name).
  const groceryItems: GroceryItem[] = pack.items.map((it) => {
    const aisle = aisleByName.get(norm(it.aisle))
    if (!aisle) throw new Error(`Pack item "${it.name}" references unknown aisle "${it.aisle}"`)
    if (!UNIT_SET.has(it.defaultUnit))
      throw new Error(`Pack item "${it.name}" has off-list unit "${it.defaultUnit}"`)
    return { id: newId(), name: it.name, aisleId: aisle.id, defaultUnit: it.defaultUnit }
  })
  const itemByName = new Map(groceryItems.map((i) => [norm(i.name), i]))

  // Recipes (each ingredient resolves its item by name).
  const ts = new Date().toISOString()
  const recipes: Recipe[] = pack.recipes.map((r) => {
    const ingredients = r.ingredients.map((ing) => {
      const item = itemByName.get(norm(ing.item))
      if (!item) throw new Error(`Recipe "${r.name}" references unknown item "${ing.item}"`)
      if (!UNIT_SET.has(ing.unit))
        throw new Error(`Recipe "${r.name}" ingredient "${ing.item}" has off-list unit "${ing.unit}"`)
      return { itemId: item.id, quantity: ing.quantity, unit: ing.unit }
    })
    return {
      id: newId(),
      name: r.name,
      description: r.description,
      servings: r.servings,
      instructions: r.instructions,
      tags: r.tags ?? [],
      favourite: r.favourite ?? false,
      notes: r.notes,
      source: r.source,
      ingredients,
      createdAt: ts,
      updatedAt: ts,
    }
  })

  // Supermarket profiles. Default to one profile mirroring the aisle walk-order.
  const packProfiles: PackSupermarket[] =
    pack.supermarkets && pack.supermarkets.length > 0
      ? pack.supermarkets
      : [{ name: DEFAULT_SUPERMARKET_NAME, aisleOrder: pack.aisles }]
  const supermarkets: SupermarketProfile[] = packProfiles.map((sm) => {
    const ids = sm.aisleOrder
      .map((name) => aisleByName.get(norm(name))?.id)
      .filter((id): id is ID => !!id)
    // Heal drift exactly like a stored profile: drop dangling, collapse dupes, append missing.
    const aisleIds = orderAisles(aisles, ids).map((a) => a.id)
    return { id: newId(), name: sm.name, aisleIds }
  })

  return {
    version: 5,
    aisles,
    supermarkets,
    activeSupermarketId: supermarkets[0].id,
    groceryItems,
    recipes,
    plan: { meals: [] },
    shopping: { have: {} },
    settings: { excludedItemIds: [] },
  }
}
