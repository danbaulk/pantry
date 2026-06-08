import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePantry } from '../state/usePantry'
import { allTags, emptyRecipeFilters, filterRecipes, type RecipeFilters } from '../lib/recipeSearch'
import { RecipeFilterBar } from './RecipeFilterBar'
import { btnPrimary, btnSecondary, card, tagBadge } from './ui'

export function RecipeList() {
  const { data, getItem } = usePantry()
  const [filters, setFilters] = useState<RecipeFilters>(emptyRecipeFilters)

  const tags = useMemo(() => allTags(data.recipes), [data.recipes])
  const recipes = useMemo(
    () => filterRecipes(data.recipes, getItem, filters),
    [data.recipes, getItem, filters],
  )

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
        <div className="flex gap-2">
          <Link to="/recipes/import" className={btnSecondary}>
            Paste / import
          </Link>
          <Link to="/recipes/new" className={btnPrimary}>
            + New recipe
          </Link>
        </div>
      </div>

      {data.recipes.length === 0 ? (
        <div className={`${card} text-center text-gray-500`}>
          <p className="mb-3">No recipes yet.</p>
          <Link to="/recipes/new" className={btnPrimary}>
            Create your first recipe
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <RecipeFilterBar filters={filters} onChange={setFilters} allTags={tags} />
          </div>

          {recipes.length === 0 ? (
            <div className={`${card} text-center text-gray-500`}>
              No recipes match your filters.
            </div>
          ) : (
            <ul className="space-y-2">
              {recipes.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/recipes/${r.id}`}
                    className={`${card} flex items-center gap-3 hover:border-green-300`}
                  >
                    {r.favourite && <span title="Favourite">⭐</span>}
                    <span className="flex-1 font-medium text-gray-800">{r.name}</span>
                    {r.tags.length > 0 && (
                      <span className="flex flex-wrap gap-1">
                        {r.tags.map((t) => (
                          <span key={t} className={tagBadge}>
                            {t}
                          </span>
                        ))}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{r.servings} servings</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
