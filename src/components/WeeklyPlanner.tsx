import { useMemo, useState } from 'react'
import type { DayOfWeek, PlannedMeal } from '../types'
import { usePantry } from '../state/usePantry'
import { DAYS, currentWeekDates, dayKey } from '../lib/days'
import { MealCard } from './MealCard'
import { AddRecipeModal } from './AddRecipeModal'
import { btnSecondary, card } from './ui'

const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

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
