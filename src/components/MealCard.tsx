import { Link } from 'react-router-dom'
import type { PlannedMeal } from '../types'
import { usePantry } from '../state/usePantry'
import { setDragPayload } from '../lib/dnd'
import { recipeHasExcludedItem } from '../lib/suggest'
import { AllergyBadge } from './AllergyBadge'
import { btnDanger, dragTile, stepBtn } from './ui'

/** A planned meal in the week grid: recipe link, remove, and a servings stepper. Draggable onto another day. */
export function MealCard({ meal }: { meal: PlannedMeal }) {
  const { getRecipe, excludedItemIds, setMealServings, removeMeal } = usePantry()
  const recipe = getRecipe(meal.recipeId)
  if (!recipe) return null

  // Effective servings: the per-meal override, or the recipe default when unset.
  const serves = meal.servings ?? recipe.servings

  return (
    <li
      draggable
      onDragStart={(e) => setDragPayload(e, { type: 'meal', id: meal.id })}
      className={`${dragTile} flex flex-col gap-2 border-gray-200`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/recipes/${recipe.id}`}
          draggable={false}
          className="text-sm font-medium text-green-700 hover:underline"
        >
          {recipe.name}
        </Link>
        <button
          type="button"
          className={`${btnDanger} shrink-0 px-2 py-0.5`}
          aria-label="Remove from plan"
          title="Remove from plan"
          onClick={() => removeMeal(meal.id)}
        >
          🗑
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        Serves
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={stepBtn}
            disabled={serves <= 1}
            aria-label="Fewer servings"
            onClick={() => setMealServings(meal.id, serves - 1)}
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-medium text-gray-800">{serves}</span>
          <button
            type="button"
            className={stepBtn}
            aria-label="More servings"
            onClick={() => setMealServings(meal.id, serves + 1)}
          >
            +
          </button>
        </div>
        {recipeHasExcludedItem(recipe, excludedItemIds) && (
          <span className="ml-auto whitespace-nowrap">
            <AllergyBadge />
          </span>
        )}
      </div>
    </li>
  )
}
