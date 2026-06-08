import { Link } from 'react-router-dom'
import type { PlannedMeal } from '../types'
import { usePantry } from '../state/usePantry'
import { btnDanger } from './ui'

const stepBtn =
  'flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'

/** A planned meal in the week grid: recipe link, remove, and a servings stepper. */
export function MealCard({ meal }: { meal: PlannedMeal }) {
  const { getRecipe, setMealServings, removeMeal } = usePantry()
  const recipe = getRecipe(meal.recipeId)
  if (!recipe) return null

  // Effective servings: the per-meal override, or the recipe default when unset.
  const serves = meal.servings ?? recipe.servings

  return (
    <li className="flex w-56 flex-col gap-2 rounded-md border border-gray-200 p-2">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/recipes/${recipe.id}`}
          className="text-sm font-medium text-green-700 hover:underline"
        >
          {recipe.name}
        </Link>
        <button
          type="button"
          className={`${btnDanger} px-2 py-0.5`}
          onClick={() => removeMeal(meal.id)}
        >
          Remove
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
      </div>
    </li>
  )
}
