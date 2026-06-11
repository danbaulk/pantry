import { useEffect, useMemo, useState } from 'react'
import type { DayOfWeek, ID, PlannedMeal, Recipe } from '../types'
import { usePantry } from '../state/usePantry'
import { DAYS, currentWeekDates, dayKey } from '../lib/days'
import { pickRandomSuggestions, refillSuggestions } from '../lib/suggest'
import { getDragPayload, hasDragPayload, type DragPayload } from '../lib/dnd'
import { MealCard } from './MealCard'
import { AddRecipeModal } from './AddRecipeModal'
import { SuggestionStrip } from './SuggestionStrip'
import { card } from './ui'

const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

const SUGGESTION_COUNT = 3

export function WeeklyPlanner() {
  const { data, getRecipe, excludedItemIds, addMeal, setMealDay } = usePantry()
  const meals = data.plan.meals
  const [addingDay, setAddingDay] = useState<DayOfWeek | null>(null)

  const weekDates = useMemo(() => currentWeekDates(), [])
  const todayKey = dayKey(new Date())

  // Only meals whose recipe still exists.
  const livingMeals = meals.filter((m) => getRecipe(m.recipeId))
  const mealsForDay = (day?: DayOfWeek) => livingMeals.filter((m) => m.day === day)
  const unassigned = mealsForDay(undefined)

  const plannedRecipeIds = useMemo(() => new Set(meals.map((m) => m.recipeId)), [meals])

  // The suggestion strip: random allergy-safe recipes not in the plan, draggable onto days.
  const [suggestionIds, setSuggestionIds] = useState<ID[]>(() =>
    refillSuggestions([], data.recipes, excludedItemIds, plannedRecipeIds, SUGGESTION_COUNT),
  )

  // Heal the strip whenever the world changes: drop suggestions that were deleted,
  // planned (e.g. just dragged onto a day), or newly flagged, then top up the gaps.
  useEffect(() => {
    setSuggestionIds((ids) =>
      refillSuggestions(ids, data.recipes, excludedItemIds, plannedRecipeIds, SUGGESTION_COUNT),
    )
  }, [data.recipes, excludedItemIds, plannedRecipeIds])

  const suggestions = suggestionIds
    .map((id) => getRecipe(id))
    .filter((r): r is Recipe => r !== undefined)

  function handleShuffle() {
    setSuggestionIds(
      pickRandomSuggestions(
        data.recipes,
        excludedItemIds,
        plannedRecipeIds,
        SUGGESTION_COUNT,
        new Set(suggestionIds),
      ).map((r) => r.id),
    )
  }

  // A drop on a day: a suggestion becomes a planned meal (the healing effect then refills
  // its slot), an existing meal moves to that day. Aisle payloads belong to the Aisles
  // page — a cross-page drag can't happen, but never let one fall through to setMealDay.
  function handleDrop(payload: DragPayload, day?: DayOfWeek) {
    if (payload.type === 'recipe') addMeal(payload.id, day)
    else if (payload.type === 'meal') setMealDay(payload.id, day)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">This week</h1>

      <SuggestionStrip suggestions={suggestions} onShuffle={handleShuffle} />

      <div className="space-y-3">
        {DAYS.map((d) => (
          <DayRow
            key={d.key}
            label={d.label}
            date={fmtDate(weekDates[d.key])}
            isToday={d.key === todayKey}
            meals={mealsForDay(d.key)}
            onAdd={() => setAddingDay(d.key)}
            onDrop={(payload) => handleDrop(payload, d.key)}
          />
        ))}

        {unassigned.length > 0 && (
          <DayRow
            label="Unassigned"
            date=""
            isToday={false}
            meals={unassigned}
            onAdd={null}
            onDrop={handleDrop}
          />
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
  onDrop,
}: {
  label: string
  date: string
  isToday: boolean
  meals: PlannedMeal[]
  onAdd: (() => void) | null
  onDrop: (payload: DragPayload) => void
}) {
  const [dragOver, setDragOver] = useState(false)

  const highlight = dragOver
    ? 'border-green-400 ring-2 ring-green-300'
    : isToday
      ? 'border-green-300 ring-1 ring-green-200'
      : ''

  return (
    <div
      className={`${card} ${highlight}`}
      onDragOver={(e) => {
        if (!hasDragPayload(e)) return
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={(e) => {
        // dragleave also fires when moving onto a child — only clear on a real exit.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const payload = getDragPayload(e)
        if (payload) onDrop(payload)
      }}
    >
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
