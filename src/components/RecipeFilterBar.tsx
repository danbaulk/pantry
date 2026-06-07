import { emptyRecipeFilters, hasActiveFilters, type RecipeFilters } from '../lib/recipeSearch'
import { input } from './ui'

const chip = (active: boolean) =>
  `rounded-full px-3 py-1 text-xs font-medium transition-colors ${
    active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  }`

interface Props {
  filters: RecipeFilters
  onChange: (filters: RecipeFilters) => void
  allTags: string[]
  placeholder?: string
}

/** Search box + favourites/tag chips, shared by the recipe list and the planner. */
export function RecipeFilterBar({ filters, onChange, allTags, placeholder }: Props) {
  function toggleTag(tag: string) {
    onChange({
      ...filters,
      selectedTags: filters.selectedTags.includes(tag)
        ? filters.selectedTags.filter((t) => t !== tag)
        : [...filters.selectedTags, tag],
    })
  }

  return (
    <div className="space-y-3">
      <input
        className={input}
        placeholder={placeholder ?? 'Search name, tag, or ingredient…'}
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...filters, favOnly: !filters.favOnly })}
          className={chip(filters.favOnly)}
        >
          ⭐ Favourites
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={chip(filters.selectedTags.includes(tag))}
          >
            {tag}
          </button>
        ))}
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(emptyRecipeFilters)}
            className="px-2 py-1 text-xs font-medium text-gray-500 underline hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
