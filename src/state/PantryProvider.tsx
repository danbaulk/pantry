import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Aisle, DayOfWeek, GroceryItem, ID, PantryData, PlannedMeal, Recipe } from '../types'
import { load, save } from '../lib/storage'
import { newId } from '../lib/ids'
import { pluralize } from '../lib/format'
import { orderAisles } from '../lib/supermarkets'
import {
  PantryContext,
  type DeleteResult,
  type GroceryItemInput,
  type PantryContextValue,
  type RecipeInput,
} from './context'

export function PantryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PantryData>(() => load())

  // Persist on every change, but skip the very first run (we just loaded it).
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    save(data)
  }, [data])

  const now = () => new Date().toISOString()

  // --- Lookups ---
  const getRecipe = useCallback((id: ID) => data.recipes.find((r) => r.id === id), [data.recipes])
  const getItem = useCallback((id: ID) => data.groceryItems.find((i) => i.id === id), [data.groceryItems])
  const getAisle = useCallback((id: ID) => data.aisles.find((a) => a.id === id), [data.aisles])
  const activeSupermarket = useMemo(
    () => data.supermarkets.find((s) => s.id === data.activeSupermarketId) ?? data.supermarkets[0],
    [data.supermarkets, data.activeSupermarketId],
  )
  const sortedAisles = useMemo(
    () => orderAisles(data.aisles, activeSupermarket.aisleIds),
    [data.aisles, activeSupermarket],
  )
  const excludedItemIds = useMemo(
    () => new Set(data.settings.excludedItemIds),
    [data.settings.excludedItemIds],
  )

  // --- Recipes ---
  const createRecipe = useCallback((input: RecipeInput): ID => {
    const id = newId()
    const ts = now()
    const recipe: Recipe = { ...input, id, createdAt: ts, updatedAt: ts }
    setData((d) => ({ ...d, recipes: [...d.recipes, recipe] }))
    return id
  }, [])

  const updateRecipe = useCallback((id: ID, input: RecipeInput) => {
    setData((d) => ({
      ...d,
      recipes: d.recipes.map((r) =>
        r.id === id ? { ...r, ...input, id: r.id, createdAt: r.createdAt, updatedAt: now() } : r,
      ),
    }))
  }, [])

  const deleteRecipe = useCallback((id: ID) => {
    // Cascade: drop any planned meals for this recipe so the plan keeps no dangling refs.
    setData((d) => ({
      ...d,
      recipes: d.recipes.filter((r) => r.id !== id),
      plan: { ...d.plan, meals: d.plan.meals.filter((m) => m.recipeId !== id) },
    }))
  }, [])

  // --- Grocery items ---
  const createItem = useCallback((input: GroceryItemInput): GroceryItem => {
    const item: GroceryItem = { ...input, id: newId() }
    setData((d) => ({ ...d, groceryItems: [...d.groceryItems, item] }))
    return item
  }, [])

  const updateItem = useCallback((id: ID, input: GroceryItemInput) => {
    setData((d) => ({
      ...d,
      groceryItems: d.groceryItems.map((i) => (i.id === id ? { ...input, id } : i)),
    }))
  }, [])

  const deleteItem = useCallback(
    (id: ID): DeleteResult => {
      const usedBy = data.recipes.filter((r) => r.ingredients.some((ing) => ing.itemId === id))
      if (usedBy.length > 0) {
        return {
          ok: false,
          reason: `Used by ${usedBy.length} ${pluralize('recipe', usedBy.length)}: ${usedBy
            .map((r) => r.name)
            .join(', ')}`,
        }
      }
      // Cascade: also drop the item from the excluded (allergy) list so settings keep
      // no dangling refs — mirrors deleteRecipe's plan cascade.
      setData((d) => ({
        ...d,
        groceryItems: d.groceryItems.filter((i) => i.id !== id),
        settings: {
          ...d.settings,
          excludedItemIds: d.settings.excludedItemIds.filter((x) => x !== id),
        },
      }))
      return { ok: true }
    },
    [data.recipes],
  )

  // --- Aisles ---
  const createAisle = useCallback((name: string): Aisle => {
    const aisle: Aisle = { id: newId(), name }
    setData((d) => ({
      ...d,
      aisles: [...d.aisles, aisle],
      // Every profile gets the new aisle at the end of its walk.
      supermarkets: d.supermarkets.map((s) => ({ ...s, aisleIds: [...s.aisleIds, aisle.id] })),
    }))
    return aisle
  }, [])

  const renameAisle = useCallback((id: ID, name: string) => {
    setData((d) => ({ ...d, aisles: d.aisles.map((a) => (a.id === id ? { ...a, name } : a)) }))
  }, [])

  const deleteAisle = useCallback(
    (id: ID): DeleteResult => {
      const usedBy = data.groceryItems.filter((i) => i.aisleId === id)
      if (usedBy.length > 0) {
        return {
          ok: false,
          reason: `${usedBy.length} ${pluralize('grocery item', usedBy.length)} still in this aisle`,
        }
      }
      // Cascade: drop the aisle from every profile's walk-order so no profile keeps
      // a dangling ref — mirrors deleteItem's excludedItemIds cascade.
      setData((d) => ({
        ...d,
        aisles: d.aisles.filter((a) => a.id !== id),
        supermarkets: d.supermarkets.map((s) => ({
          ...s,
          aisleIds: s.aisleIds.filter((x) => x !== id),
        })),
      }))
      return { ok: true }
    },
    [data.groceryItems],
  )

  const moveAisle = useCallback((id: ID, toIndex: number) => {
    setData((d) => {
      const active = d.supermarkets.find((s) => s.id === d.activeSupermarketId) ?? d.supermarkets[0]
      // Heal first so indices match the rendered rows (and the healed order persists).
      const ids = orderAisles(d.aisles, active.aisleIds).map((a) => a.id)
      const fromIdx = ids.indexOf(id)
      if (fromIdx === -1) return d
      // `toIndex` is pre-removal ("insert before the row currently there"); taking the
      // dragged aisle out first shifts later targets left by one. Clamp stray indices.
      const insertAt = Math.max(
        0,
        Math.min(fromIdx < toIndex ? toIndex - 1 : toIndex, ids.length - 1),
      )
      if (insertAt === fromIdx) return d
      ids.splice(fromIdx, 1)
      ids.splice(insertAt, 0, id)
      return {
        ...d,
        supermarkets: d.supermarkets.map((s) => (s.id === active.id ? { ...s, aisleIds: ids } : s)),
      }
    })
  }, [])

  // --- Supermarket profiles ---
  const createSupermarket = useCallback((name: string): ID => {
    const id = newId()
    setData((d) => {
      const active = d.supermarkets.find((s) => s.id === d.activeSupermarketId) ?? d.supermarkets[0]
      // Copy the active profile's healed ordering so the new store starts complete.
      const aisleIds = orderAisles(d.aisles, active.aisleIds).map((a) => a.id)
      return { ...d, supermarkets: [...d.supermarkets, { id, name, aisleIds }] }
    })
    return id
  }, [])

  const renameSupermarket = useCallback((id: ID, name: string) => {
    setData((d) => ({
      ...d,
      supermarkets: d.supermarkets.map((s) => (s.id === id ? { ...s, name } : s)),
    }))
  }, [])

  const deleteSupermarket = useCallback(
    (id: ID): DeleteResult => {
      if (data.supermarkets.length <= 1) {
        return { ok: false, reason: 'You need at least one supermarket' }
      }
      setData((d) => {
        const remaining = d.supermarkets.filter((s) => s.id !== id)
        return {
          ...d,
          supermarkets: remaining,
          // Deleting the active store hands the baton to the first remaining one.
          activeSupermarketId:
            d.activeSupermarketId === id ? remaining[0].id : d.activeSupermarketId,
        }
      })
      return { ok: true }
    },
    [data.supermarkets],
  )

  const setActiveSupermarket = useCallback((id: ID) => {
    setData((d) => ({ ...d, activeSupermarketId: id }))
  }, [])

  // --- Weekly plan ---
  const addMeal = useCallback((recipeId: ID, day?: DayOfWeek) => {
    const meal: PlannedMeal = { id: newId(), recipeId, day }
    setData((d) => ({ ...d, plan: { ...d.plan, meals: [...d.plan.meals, meal] } }))
  }, [])

  const removeMeal = useCallback((mealId: ID) => {
    setData((d) => ({
      ...d,
      plan: { ...d.plan, meals: d.plan.meals.filter((m) => m.id !== mealId) },
    }))
  }, [])

  const setMealDay = useCallback((mealId: ID, day?: DayOfWeek) => {
    setData((d) => ({
      ...d,
      plan: {
        ...d.plan,
        meals: d.plan.meals.map((m) => (m.id === mealId ? { ...m, day } : m)),
      },
    }))
  }, [])

  const setMealServings = useCallback((mealId: ID, servings?: number) => {
    setData((d) => ({
      ...d,
      plan: {
        ...d.plan,
        meals: d.plan.meals.map((m) => (m.id === mealId ? { ...m, servings } : m)),
      },
    }))
  }, [])

  // --- Shopping list (derived from the plan; reconciled via "already have") ---
  // Record how much of a requirement line (`itemId::unit`) the user already has.
  // A quantity of 0 (or less) drops the key so the blob stays tidy.
  const setHave = useCallback((lineKey: string, quantity: number) => {
    setData((d) => {
      const have = { ...d.shopping.have }
      if (quantity > 0) have[lineKey] = quantity
      else delete have[lineKey]
      return { ...d, shopping: { ...d.shopping, have } }
    })
  }, [])

  const clearHave = useCallback(() => {
    setData((d) => ({ ...d, shopping: { ...d.shopping, have: {} } }))
  }, [])

  // --- Settings (allergy / excluded grocery items) ---
  const toggleExcludedItem = useCallback((itemId: ID) => {
    setData((d) => {
      const excluded = d.settings.excludedItemIds
      const next = excluded.includes(itemId)
        ? excluded.filter((id) => id !== itemId)
        : [...excluded, itemId]
      return { ...d, settings: { ...d.settings, excludedItemIds: next } }
    })
  }, [])

  const value: PantryContextValue = useMemo(
    () => ({
      data,
      getRecipe,
      getItem,
      getAisle,
      sortedAisles,
      supermarkets: data.supermarkets,
      activeSupermarket,
      excludedItemIds,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      createItem,
      updateItem,
      deleteItem,
      createAisle,
      renameAisle,
      deleteAisle,
      moveAisle,
      createSupermarket,
      renameSupermarket,
      deleteSupermarket,
      setActiveSupermarket,
      addMeal,
      removeMeal,
      setMealDay,
      setMealServings,
      setHave,
      clearHave,
      toggleExcludedItem,
    }),
    [
      data,
      getRecipe,
      getItem,
      getAisle,
      sortedAisles,
      activeSupermarket,
      excludedItemIds,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      createItem,
      updateItem,
      deleteItem,
      createAisle,
      renameAisle,
      deleteAisle,
      moveAisle,
      createSupermarket,
      renameSupermarket,
      deleteSupermarket,
      setActiveSupermarket,
      addMeal,
      removeMeal,
      setMealDay,
      setMealServings,
      setHave,
      clearHave,
      toggleExcludedItem,
    ],
  )

  return <PantryContext value={value}>{children}</PantryContext>
}
