import { Link } from 'react-router-dom'
import { usePantry } from '../state/usePantry'
import { btnPrimary, card } from './ui'

export function RecipeList() {
  const { data } = usePantry()
  const recipes = [...data.recipes].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
        <Link to="/recipes/new" className={btnPrimary}>
          + New recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className={`${card} text-center text-gray-500`}>
          <p className="mb-3">No recipes yet.</p>
          <Link to="/recipes/new" className={btnPrimary}>
            Create your first recipe
          </Link>
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
                      <span
                        key={t}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
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
    </div>
  )
}
