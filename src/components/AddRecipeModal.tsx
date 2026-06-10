import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DayOfWeek } from '../types'
import { usePantry } from '../state/usePantry'
import { allTags, emptyRecipeFilters, filterRecipes, type RecipeFilters } from '../lib/recipeSearch'
import { recipeHasExcludedItem, suggestedRecipes } from '../lib/suggest'
import { RecipeFilterBar } from './RecipeFilterBar'
import { AllergyBadge } from './AllergyBadge'
import { Modal } from './Modal'
import { btnPrimary, tagBadge } from './ui'

interface Props {
  day: DayOfWeek
  title: string
  onClose: () => void
}

const MAX_SUGGESTIONS = 6

/** Pick recipes (search/filtered) to add to a given day of the week. */
export function AddRecipeModal({ day, title, onClose }: Props) {
  const { data, getItem, excludedItemIds, addMeal } = usePantry()
  const [filters, setFilters] = useState<RecipeFilters>(emptyRecipeFilters)
  const [added, setAdded] = useState<string[]>([])

  const tags = useMemo(() => allTags(data.recipes), [data.recipes])
  const recipes = useMemo(
    () => filterRecipes(data.recipes, getItem, filters),
    [data.recipes, getItem, filters],
  )

  // Allergy-safe recipes not already in the plan — favourites first. (Plan-as-proxy recency.)
  const suggestions = useMemo(() => {
    const planned = new Set(data.plan.meals.map((m) => m.recipeId))
    return suggestedRecipes(data.recipes, excludedItemIds, planned).slice(0, MAX_SUGGESTIONS)
  }, [data.recipes, data.plan.meals, excludedItemIds])

  function add(recipeId: string, name: string) {
    addMeal(recipeId, day)
    setAdded((a) => [...a, name])
  }

  return (
    <Modal onClose={onClose}>
      <div className="border-b border-gray-200 p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Add to {title}</h2>
        <RecipeFilterBar
          filters={filters}
          onChange={setFilters}
          allTags={tags}
          placeholder="Search recipes…"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`${tagBadge} hover:bg-gray-200`}
                onClick={() => add(r.id, r.name)}
              >
                {r.favourite && <span className="mr-1 text-amber-500">★</span>}
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {data.recipes.length === 0 ? (
          <p className="p-2 text-sm text-gray-500">
            No recipes yet —{' '}
            <Link to="/recipes/new" className="text-green-700 underline">
              create one
            </Link>{' '}
            first.
          </p>
        ) : recipes.length === 0 ? (
          <p className="p-2 text-sm text-gray-400">No recipes match your filters.</p>
        ) : (
          <ul className="space-y-1">
            {recipes.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => add(r.id, r.name)}
                >
                  <span className="flex items-center gap-2">
                    <span>
                      {r.favourite && <span className="mr-1 text-amber-500">★</span>}
                      {r.name}
                    </span>
                    {recipeHasExcludedItem(r, excludedItemIds) && <AllergyBadge />}
                  </span>
                  <span className="text-xs text-gray-400">+ add</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-gray-200 p-3">
        <span className="text-xs text-gray-500">
          {added.length > 0 ? `Added: ${added.join(', ')}` : 'Click a recipe to add it'}
        </span>
        <button type="button" className={btnPrimary} onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  )
}
