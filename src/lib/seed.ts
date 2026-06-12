import type { Aisle, GroceryItem, PantryData, SupermarketProfile } from '../types'
import { newId } from './ids'
import { DEFAULT_SUPERMARKET_NAME } from './supermarkets'

/** Starter aisles in a sensible store walk-order. */
const SEED_AISLES = [
  'Produce',
  'Bakery',
  'Dairy & Eggs',
  'Meat & Fish',
  'Tinned & Jars',
  'Dry Goods & Pasta',
  'Frozen',
  'Snacks',
  'Drinks',
  'Household',
]

/** Common grocery items: [name, aisle name, default unit]. */
const SEED_ITEMS: Array<[string, string, string]> = [
  // Produce
  ['Onion', 'Produce', 'each'],
  ['Garlic', 'Produce', 'clove'],
  ['Carrot', 'Produce', 'each'],
  ['Potato', 'Produce', 'g'],
  ['Tomato', 'Produce', 'each'],
  ['Spinach', 'Produce', 'g'],
  ['Lemon', 'Produce', 'each'],
  ['Mushroom', 'Produce', 'g'],
  // Bakery
  ['Bread', 'Bakery', 'each'],
  ['Tortilla wraps', 'Bakery', 'pack'],
  // Dairy & Eggs
  ['Milk', 'Dairy & Eggs', 'ml'],
  ['Butter', 'Dairy & Eggs', 'g'],
  ['Cheddar cheese', 'Dairy & Eggs', 'g'],
  ['Eggs', 'Dairy & Eggs', 'each'],
  ['Greek yoghurt', 'Dairy & Eggs', 'g'],
  ['Parmesan', 'Dairy & Eggs', 'g'],
  // Meat & Fish
  ['Chicken breast', 'Meat & Fish', 'g'],
  ['Beef mince', 'Meat & Fish', 'g'],
  ['Bacon', 'Meat & Fish', 'pack'],
  ['Salmon fillet', 'Meat & Fish', 'each'],
  // Tinned & Jars
  ['Chopped tomatoes', 'Tinned & Jars', 'can'],
  ['Chickpeas', 'Tinned & Jars', 'can'],
  ['Coconut milk', 'Tinned & Jars', 'can'],
  ['Tomato puree', 'Tinned & Jars', 'tbsp'],
  ['Olive oil', 'Tinned & Jars', 'ml'],
  // Dry Goods & Pasta
  ['Pasta', 'Dry Goods & Pasta', 'g'],
  ['Rice', 'Dry Goods & Pasta', 'g'],
  ['Plain flour', 'Dry Goods & Pasta', 'g'],
  ['Sugar', 'Dry Goods & Pasta', 'g'],
  ['Salt', 'Dry Goods & Pasta', 'tsp'],
  ['Black pepper', 'Dry Goods & Pasta', 'tsp'],
  ['Stock cube', 'Dry Goods & Pasta', 'each'],
  ['Lentils', 'Dry Goods & Pasta', 'g'],
  // Frozen
  ['Frozen peas', 'Frozen', 'g'],
  ['Frozen sweetcorn', 'Frozen', 'g'],
  // Drinks
  ['Orange juice', 'Drinks', 'ml'],
]

/** Build a fresh seeded dataset with freshly minted ids. */
export function buildSeedData(): PantryData {
  const aisles: Aisle[] = SEED_AISLES.map((name) => ({
    id: newId(),
    name,
  }))

  // SEED_AISLES are already in walk-order, so the default profile mirrors them.
  const supermarket: SupermarketProfile = {
    id: newId(),
    name: DEFAULT_SUPERMARKET_NAME,
    aisleIds: aisles.map((a) => a.id),
  }

  const aisleByName = new Map(aisles.map((a) => [a.name, a]))

  const groceryItems: GroceryItem[] = SEED_ITEMS.map(([name, aisleName, defaultUnit]) => {
    const aisle = aisleByName.get(aisleName)
    if (!aisle) throw new Error(`Seed item "${name}" references unknown aisle "${aisleName}"`)
    return { id: newId(), name, aisleId: aisle.id, defaultUnit }
  })

  return {
    version: 5,
    aisles,
    supermarkets: [supermarket],
    activeSupermarketId: supermarket.id,
    groceryItems,
    recipes: [],
    plan: { meals: [] },
    shopping: { have: {} },
    settings: { excludedItemIds: [] },
  }
}
