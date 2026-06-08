import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Aisle, DayOfWeek, GroceryItem, ID, PantryData, PlannedMeal, Recipe } from '../types'
import { load, save } from '../lib/storage'
import { newId } from '../lib/ids'
import { pluralize } from '../lib/format'
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
  const sortedAisles = useMemo(
    () => [...data.aisles].sort((a, b) => a.order - b.order),
    [data.aisles],
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
      setData((d) => ({ ...d, groceryItems: d.groceryItems.filter((i) => i.id !== id) }))
      return { ok: true }
    },
    [data.recipes],
  )

  // --- Aisles ---
  const createAisle = useCallback((name: string): Aisle => {
    const aisle: Aisle = { id: newId(), name, order: Number.MAX_SAFE_INTEGER }
    setData((d) => {
      const maxOrder = d.aisles.reduce((m, a) => Math.max(m, a.order), -1)
      return { ...d, aisles: [...d.aisles, { ...aisle, order: maxOrder + 1 }] }
    })
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
      setData((d) => ({ ...d, aisles: d.aisles.filter((a) => a.id !== id) }))
      return { ok: true }
    },
    [data.groceryItems],
  )

  const moveAisle = useCallback((id: ID, direction: 'up' | 'down') => {
    setData((d) => {
      const sorted = [...d.aisles].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((a) => a.id === id)
      if (idx === -1) return d
      const swapWith = direction === 'up' ? idx - 1 : idx + 1
      if (swapWith < 0 || swapWith >= sorted.length) return d
      ;[sorted[idx], sorted[swapWith]] = [sorted[swapWith], sorted[idx]]
      // Reassign contiguous order values to reflect new sequence.
      const reordered = sorted.map((a, i) => ({ ...a, order: i }))
      return { ...d, aisles: reordered }
    })
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

  const clearPlan = useCallback(() => {
    setData((d) => ({ ...d, plan: { ...d.plan, meals: [] } }))
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

  const value: PantryContextValue = useMemo(
    () => ({
      data,
      getRecipe,
      getItem,
      getAisle,
      sortedAisles,
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
      addMeal,
      removeMeal,
      setMealDay,
      setMealServings,
      clearPlan,
      setHave,
      clearHave,
    }),
    [
      data,
      getRecipe,
      getItem,
      getAisle,
      sortedAisles,
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
      addMeal,
      removeMeal,
      setMealDay,
      setMealServings,
      clearPlan,
      setHave,
      clearHave,
    ],
  )

  return <PantryContext value={value}>{children}</PantryContext>
}
