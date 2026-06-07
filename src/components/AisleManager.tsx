import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePantry } from '../state/usePantry'
import { pluralize } from '../lib/format'
import { ErrorMessage } from './ErrorMessage'
import { btnDanger, btnPrimary, btnSecondary, card, input } from './ui'

export function AisleManager() {
  const { sortedAisles, data, createAisle, renameAisle, deleteAisle, moveAisle } = usePantry()
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const itemCount = (aisleId: string) =>
    data.groceryItems.filter((i) => i.aisleId === aisleId).length

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    createAisle(name)
    setNewName('')
  }

  function handleDelete(id: string) {
    const res = deleteAisle(id)
    if (!res.ok) {
      setError(res.reason)
    } else {
      setError(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Aisles</h1>
      <p className="mb-4 text-sm text-gray-500">
        Ordered the way you walk the store. Reorder them to match your route.
      </p>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          className={input}
          placeholder="New aisle name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className={btnPrimary}>
          Add aisle
        </button>
      </form>

      <ErrorMessage message={error} className="mb-3" />

      <ul className="space-y-2">
        {sortedAisles.map((aisle, idx) => (
          <li key={aisle.id} className={`${card} flex items-center gap-2`}>
            <div className="flex flex-col">
              <button
                aria-label="Move up"
                className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                disabled={idx === 0}
                onClick={() => moveAisle(aisle.id, 'up')}
              >
                ▲
              </button>
              <button
                aria-label="Move down"
                className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                disabled={idx === sortedAisles.length - 1}
                onClick={() => moveAisle(aisle.id, 'down')}
              >
                ▼
              </button>
            </div>

            <input
              className={`${input} flex-1`}
              value={aisle.name}
              onChange={(e) => renameAisle(aisle.id, e.target.value)}
            />

            <span className="w-20 text-right text-xs text-gray-400">
              {itemCount(aisle.id)} {pluralize('item', itemCount(aisle.id))}
            </span>

            <button className={btnDanger} onClick={() => handleDelete(aisle.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {sortedAisles.length === 0 && (
        <p className="text-sm text-gray-500">No aisles yet — add one above.</p>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Tip: an aisle can only be deleted once it has no grocery items.
      </p>

      <div className="mt-6">
        <Link to="/catalogue" className={btnSecondary}>
          Manage grocery items →
        </Link>
      </div>
    </div>
  )
}
