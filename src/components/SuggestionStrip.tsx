import { Link } from 'react-router-dom'
import type { Recipe } from '../types'
import { setDragPayload } from '../lib/dnd'
import { btnSecondary, card, dragTile } from './ui'

/**
 * The planner's randomiser: a strip of random allergy-safe suggestions that the user
 * drags onto a day to plan. The parent owns which recipes are shown (so it can refill a
 * slot once a suggestion lands in the plan); this component just renders them.
 */
export function SuggestionStrip({
  suggestions,
  onShuffle,
}: {
  suggestions: Recipe[]
  onShuffle: () => void
}) {
  if (suggestions.length === 0) return null

  return (
    <div className={card}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Suggestions
          <span className="ml-2 text-xs font-normal text-gray-400">
            Drag a suggestion onto a day
          </span>
        </h2>
        <button type="button" className={btnSecondary} onClick={onShuffle}>
          🎲 Shuffle
        </button>
      </div>

      <ul className="flex flex-wrap gap-2">
        {suggestions.map((r) => (
          <li
            key={r.id}
            draggable
            onDragStart={(e) => setDragPayload(e, { type: 'recipe', id: r.id })}
            className={`${dragTile} border-dashed border-green-300 bg-green-50`}
          >
            <Link
              to={`/recipes/${r.id}`}
              draggable={false}
              className="text-sm font-medium text-green-700 hover:underline"
            >
              {r.favourite && <span className="mr-1 text-amber-500">★</span>}
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
