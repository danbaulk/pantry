import type { ID, Recipe } from '../types'

/**
 * Randomiser + suggestion logic, kept pure (no React/context) so it's easy to reason
 * about and reuse — mirrors `shoppingList.ts`. Allergy handling lives here: a recipe is
 * "flagged" when it uses any excluded grocery item, and flagged recipes are kept out of
 * both the randomiser and suggestions (but still appear, badged, in the manual lists).
 */

/** Fisher–Yates shuffle returning a new array. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** True if the recipe uses any excluded (allergen) grocery item. */
export function recipeHasExcludedItem(recipe: Recipe, excludedIds: Set<ID>): boolean {
  if (excludedIds.size === 0) return false
  return recipe.ingredients.some((ing) => excludedIds.has(ing.itemId))
}

/**
 * The single definition of "suggestible": allergy-safe and not already in the plan.
 * Every suggestion surface (strip, refill, modal list) filters through here.
 */
function candidateRecipes(
  recipes: Recipe[],
  excludedIds: Set<ID>,
  plannedRecipeIds: Set<ID>,
): Recipe[] {
  return recipes.filter(
    (r) => !recipeHasExcludedItem(r, excludedIds) && !plannedRecipeIds.has(r.id),
  )
}

/**
 * Random recipes for the planner's suggestion strip: allergy-safe and not already in the
 * plan, picked uniformly at random (favourites get no priority), up to `count`.
 * `avoidIds` (the recipes currently on display) is filtered out first so a re-shuffle
 * visibly changes the strip — unless avoiding them would leave fewer than `count`
 * candidates, in which case the full pool is used.
 */
export function pickRandomSuggestions(
  recipes: Recipe[],
  excludedIds: Set<ID>,
  plannedRecipeIds: Set<ID>,
  count: number,
  avoidIds: Set<ID> = new Set(),
): Recipe[] {
  const candidates = candidateRecipes(recipes, excludedIds, plannedRecipeIds)
  const fresh = candidates.filter((r) => !avoidIds.has(r.id))
  const pool = fresh.length >= count ? fresh : candidates
  return shuffle(pool).slice(0, count)
}

/**
 * Reconcile the suggestion strip with the world: keep the ids that are still suggestible
 * (recipe exists, allergy-safe, not planned), then top back up to `count` with fresh
 * random picks. Returns `currentIds` itself when nothing changes, so a state setter can
 * bail out of the update.
 */
export function refillSuggestions(
  currentIds: ID[],
  recipes: Recipe[],
  excludedIds: Set<ID>,
  plannedRecipeIds: Set<ID>,
  count: number,
): ID[] {
  const candidateIds = new Set(
    candidateRecipes(recipes, excludedIds, plannedRecipeIds).map((r) => r.id),
  )
  const valid = currentIds.filter((id) => candidateIds.has(id))
  if (valid.length === currentIds.length && valid.length >= count) return currentIds

  // Hard-exclude what's already on display by treating it as planned for the pick.
  const topUp = pickRandomSuggestions(
    recipes,
    excludedIds,
    new Set([...plannedRecipeIds, ...valid]),
    count - valid.length,
  ).map((r) => r.id)
  if (valid.length === currentIds.length && topUp.length === 0) return currentIds
  return [...valid, ...topUp]
}

/**
 * Recipes worth suggesting in the manual add list: allergy-safe and not already in the
 * plan, favourites first then the rest, each group sorted by name. (Recency is
 * plan-as-proxy — the app keeps only one rolling week, so "not recently cooked" means
 * "not currently planned".)
 */
export function suggestedRecipes(
  recipes: Recipe[],
  excludedIds: Set<ID>,
  plannedRecipeIds: Set<ID>,
): Recipe[] {
  return candidateRecipes(recipes, excludedIds, plannedRecipeIds).sort(
    (a, b) => Number(b.favourite) - Number(a.favourite) || a.name.localeCompare(b.name),
  )
}
