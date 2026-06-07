import type { GroceryItem, ID, Recipe } from '../types'

/** Shared recipe search/filter state used by the recipe list and the planner. */
export interface RecipeFilters {
  search: string
  favOnly: boolean
  selectedTags: string[]
}

export const emptyRecipeFilters: RecipeFilters = { search: '', favOnly: false, selectedTags: [] }

export function hasActiveFilters(f: RecipeFilters): boolean {
  return f.search.trim() !== '' || f.favOnly || f.selectedTags.length > 0
}

/** Unique tag set across the library, sorted — for the filter chips. */
export function allTags(recipes: Recipe[]): string[] {
  return [...new Set(recipes.flatMap((r) => r.tags))].sort((a, b) => a.localeCompare(b))
}

/**
 * Filter + sort recipes by the shared rules: favourites toggle, tag chips (match any),
 * and a free-text term matched against name, tags, and resolved ingredient item names.
 */
export function filterRecipes(
  recipes: Recipe[],
  getItem: (id: ID) => GroceryItem | undefined,
  filters: RecipeFilters,
): Recipe[] {
  const term = filters.search.trim().toLowerCase()
  return recipes
    .filter((r) => {
      if (filters.favOnly && !r.favourite) return false
      // Tag chips: match any selected tag (OR).
      if (filters.selectedTags.length > 0 && !r.tags.some((t) => filters.selectedTags.includes(t))) {
        return false
      }
      if (term) {
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
}
