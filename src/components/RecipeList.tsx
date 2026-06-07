import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePantry } from '../state/usePantry'
import { btnPrimary, btnSecondary, card, input } from './ui'

export function RecipeList() {
  const { data, getItem } = usePantry()
  const [search, setSearch] = useState('')
  const [favOnly, setFavOnly] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Unique tag set across the library, for the filter chips.
  const allTags = useMemo(
    () => [...new Set(data.recipes.flatMap((r) => r.tags))].sort((a, b) => a.localeCompare(b)),
    [data.recipes],
  )

  const hasFilters = search.trim() !== '' || favOnly || selectedTags.length > 0

  function toggleTag(tag: string) {
    setSelectedTags((tags) =>
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
    )
  }

  function clearFilters() {
    setSearch('')
    setFavOnly(false)
    setSelectedTags([])
  }

  const recipes = useMemo(() => {
    const term = search.trim().toLowerCase()
    return data.recipes
      .filter((r) => {
        if (favOnly && !r.favourite) return false
        // Tag chips: match any selected tag (OR).
        if (selectedTags.length > 0 && !r.tags.some((t) => selectedTags.includes(t))) {
          return false
        }
        if (term) {
          // Search name, tags, and resolved ingredient item names.
          const haystack = [
            r.name,
            ...r.tags,
            ...r.ingredients.map((ing) => getItem(ing.itemId)?.name ?? ''),
          ]
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(term)) return false
        }
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data.recipes, search, favOnly, selectedTags, getItem])

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
          <div className="mb-4 space-y-3">
            <input
              className={input}
              placeholder="Search name, tag, or ingredient…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFavOnly((v) => !v)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  favOnly
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ⭐ Favourites
              </button>
              {allTags.map((tag) => {
                const active = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-2 py-1 text-xs font-medium text-gray-500 underline hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
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
        </>
      )}
    </div>
  )
}
