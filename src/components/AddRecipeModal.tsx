import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DayOfWeek } from '../types'
import { usePantry } from '../state/usePantry'
import { allTags, emptyRecipeFilters, filterRecipes, type RecipeFilters } from '../lib/recipeSearch'
import { RecipeFilterBar } from './RecipeFilterBar'
import { Modal } from './Modal'
import { btnPrimary } from './ui'

interface Props {
  day: DayOfWeek
  title: string
  onClose: () => void
}

/** Pick recipes (search/filtered) to add to a given day of the week. */
export function AddRecipeModal({ day, title, onClose }: Props) {
  const { data, getItem, addMeal } = usePantry()
  const [filters, setFilters] = useState<RecipeFilters>(emptyRecipeFilters)
  const [added, setAdded] = useState<string[]>([])

  const tags = useMemo(() => allTags(data.recipes), [data.recipes])
  const recipes = useMemo(
    () => filterRecipes(data.recipes, getItem, filters),
    [data.recipes, getItem, filters],
  )

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
                  onClick={() => {
                    addMeal(r.id, day)
                    setAdded((a) => [...a, r.name])
                  }}
                >
                  <span>
                    {r.favourite && <span className="mr-1 text-amber-500">★</span>}
                    {r.name}
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
