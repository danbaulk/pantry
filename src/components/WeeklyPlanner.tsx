import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DayOfWeek, PlannedMeal } from '../types'
import { usePantry } from '../state/usePantry'
import { DAYS, currentWeekDates, dayKey } from '../lib/days'
import { allTags, emptyRecipeFilters, filterRecipes, type RecipeFilters } from '../lib/recipeSearch'
import { RecipeFilterBar } from './RecipeFilterBar'
import { btnDanger, btnPrimary, btnSecondary, card } from './ui'

const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

const stepBtn =
  'flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'

export function WeeklyPlanner() {
  const { data, getRecipe, clearPlan } = usePantry()
  const meals = data.plan.meals
  const [addingDay, setAddingDay] = useState<DayOfWeek | null>(null)

  const weekDates = useMemo(() => currentWeekDates(), [])
  const todayKey = dayKey(new Date())

  // Only meals whose recipe still exists.
  const livingMeals = meals.filter((m) => getRecipe(m.recipeId))
  const mealsForDay = (day?: DayOfWeek) => livingMeals.filter((m) => m.day === day)
  const unassigned = mealsForDay(undefined)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">This week</h1>
        {meals.length > 0 && (
          <button
            type="button"
            className={btnSecondary}
            onClick={() => {
              if (confirm('Clear all meals from this week?')) clearPlan()
            }}
          >
            Clear week
          </button>
        )}
      </div>

      <div className="space-y-3">
        {DAYS.map((d) => (
          <DayRow
            key={d.key}
            label={d.label}
            date={fmtDate(weekDates[d.key])}
            isToday={d.key === todayKey}
            meals={mealsForDay(d.key)}
            onAdd={() => setAddingDay(d.key)}
          />
        ))}

        {unassigned.length > 0 && (
          <DayRow label="Unassigned" date="" isToday={false} meals={unassigned} onAdd={null} />
        )}
      </div>

      {addingDay && (
        <AddRecipeModal
          day={addingDay}
          title={`${DAYS.find((d) => d.key === addingDay)!.label} · ${fmtDate(weekDates[addingDay])}`}
          onClose={() => setAddingDay(null)}
        />
      )}
    </div>
  )
}

function DayRow({
  label,
  date,
  isToday,
  meals,
  onAdd,
}: {
  label: string
  date: string
  isToday: boolean
  meals: PlannedMeal[]
  onAdd: (() => void) | null
}) {
  return (
    <div className={`${card} ${isToday ? 'border-green-300 ring-1 ring-green-200' : ''}`}>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">
        {label}
        {date && <span className="ml-2 font-normal text-gray-400">{date}</span>}
        {isToday && <span className="ml-2 text-xs font-medium text-green-700">Today</span>}
      </h2>

      {meals.length === 0 && !onAdd ? (
        <p className="text-sm text-gray-400">No meals.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} />
          ))}
          {onAdd && (
            <li>
              <button
                type="button"
                onClick={onAdd}
                className="h-full w-56 rounded-md border border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500"
              >
                {meals.length === 0 ? 'No meals — click to add' : '+ Add recipe'}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function MealCard({ meal }: { meal: PlannedMeal }) {
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

function AddRecipeModal({
  day,
  title,
  onClose,
}: {
  day: DayOfWeek
  title: string
  onClose: () => void
}) {
  const { data, getItem, addMeal } = usePantry()
  const [filters, setFilters] = useState<RecipeFilters>(emptyRecipeFilters)
  const [added, setAdded] = useState<string[]>([])

  const tags = useMemo(() => allTags(data.recipes), [data.recipes])
  const recipes = useMemo(
    () => filterRecipes(data.recipes, getItem, filters),
    [data.recipes, getItem, filters],
  )

  return (
    <div
      className="fixed inset-0 z-10 flex items-start justify-center bg-black/30 p-4 pt-20"
      onClick={onClose}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-md flex-col rounded-lg bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
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
      </div>
    </div>
  )
}
