import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePantry } from '../state/usePantry'
import {
  buildHaveRows,
  buildRequirements,
  buildShoppingList,
  formatShoppingListText,
  type HaveRow,
} from '../lib/shoppingList'
import { formatQuantity } from '../lib/format'
import { btnSecondary, card, stepBtn } from './ui'

export function ShoppingList() {
  const { data, getItem, sortedAisles, clearHave } = usePantry()

  const requirements = useMemo(
    () => buildRequirements(data.plan, data.recipes),
    [data.plan, data.recipes],
  )
  const groups = useMemo(
    () => buildShoppingList(requirements, data.shopping, getItem, sortedAisles),
    [requirements, data.shopping, getItem, sortedAisles],
  )
  const haveRows = useMemo(
    () => buildHaveRows(requirements, data.shopping, getItem, sortedAisles),
    [requirements, data.shopping, getItem, sortedAisles],
  )

  const anyHave = Object.keys(data.shopping.have).length > 0
  const [copied, setCopied] = useState(false)

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(formatShoppingListText(groups))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable/denied — leave the label unchanged
    }
  }

  if (haveRows.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Shopping list</h1>
        <div className={card}>
          <p className="text-sm text-gray-500">
            Nothing to buy yet — plan some meals on the{' '}
            <Link to="/planner" className="text-green-700 underline">
              planner
            </Link>{' '}
            and the list builds itself.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Shopping list</h1>
        <div className="flex items-center gap-2">
          {groups.length > 0 && (
            <button type="button" className={btnSecondary} onClick={copyList}>
              {copied ? 'Copied!' : 'Copy list'}
            </button>
          )}
          {anyHave && (
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                if (confirm('Reset everything you have marked as already have?')) clearHave()
              }}
            >
              Reset already have
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Buy list */}
        <div className="space-y-3">
          {groups.length === 0 ? (
            <div className={card}>
              <p className="text-sm text-gray-500">
                Everything's covered by what you already have. 🎉
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className={card}>
                <h2 className="mb-2 text-sm font-semibold text-gray-700">{group.name}</h2>
                <ul className="divide-y divide-gray-100">
                  {group.lines.map((line) => (
                    <li key={line.key} className="py-2 text-sm text-gray-800">
                      <span className="font-medium">
                        {formatQuantity(line.quantity)} {line.unit}
                      </span>{' '}
                      — {line.name}
                      {line.have > 0 && (
                        <span className="ml-2 text-xs text-gray-400">
                          (need {formatQuantity(line.need)}, have {formatQuantity(line.have)})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Already have */}
        <div>
          <div className={card}>
            <h2 className="mb-1 text-sm font-semibold text-gray-700">Already have</h2>
            <p className="mb-2 text-xs text-gray-400">
              Use −/+ for how much you have, or ✓ to mark you have it all (drops it from the list).
            </p>
            <ul className="divide-y divide-gray-100">
              {haveRows.map((row) => (
                <HaveStepperRow key={row.key} row={row} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function HaveStepperRow({ row }: { row: HaveRow }) {
  const { setHave } = usePantry()
  const done = row.need > 0 && row.have >= row.need
  return (
    <li className="flex items-center gap-2 py-2 text-sm">
      <span className={`flex-1 ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {row.name}
        <span className="ml-1 text-xs text-gray-400 no-underline">
          (need {formatQuantity(row.need)}
          {row.unit === 'each' ? '' : ` ${row.unit}`})
        </span>
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={stepBtn}
          disabled={row.have <= 0}
          aria-label={`Less ${row.name}`}
          onClick={() => setHave(row.key, Math.max(0, row.have - 1))}
        >
          −
        </button>
        <span className="w-8 text-center font-medium text-gray-800">{formatQuantity(row.have)}</span>
        <button
          type="button"
          className={stepBtn}
          disabled={done}
          aria-label={`More ${row.name}`}
          onClick={() => setHave(row.key, Math.min(row.need, row.have + 1))}
        >
          +
        </button>
        <button
          type="button"
          className={`${stepBtn} ${done ? 'border-green-500 bg-green-500 text-white hover:bg-green-600' : 'text-green-600 hover:bg-green-50'}`}
          disabled={row.need <= 0}
          aria-label={`Have all ${row.name}`}
          onClick={() => setHave(row.key, row.need)}
        >
          ✓
        </button>
      </div>
    </li>
  )
}
