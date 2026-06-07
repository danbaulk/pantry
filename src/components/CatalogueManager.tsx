import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GroceryItem } from '../types'
import { usePantry } from '../state/usePantry'
import { UNITS } from '../lib/units'
import { btnDanger, btnPrimary, btnSecondary, card, input, label } from './ui'

export function CatalogueManager() {
  const { data, sortedAisles, createItem, updateItem, deleteItem } = usePantry()
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // New-item form state
  const [name, setName] = useState('')
  const [aisleId, setAisleId] = useState(sortedAisles[0]?.id ?? '')
  const [unit, setUnit] = useState<string>(UNITS[0])

  const itemsByAisle = useMemo(() => {
    const groups = sortedAisles.map((aisle) => ({
      aisle,
      items: data.groceryItems
        .filter((i) => i.aisleId === aisle.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    return groups.filter((g) => g.items.length > 0)
  }, [data.groceryItems, sortedAisles])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !aisleId) return
    createItem({ name: name.trim(), aisleId, defaultUnit: unit })
    setName('')
  }

  function handleDelete(item: GroceryItem) {
    const res = deleteItem(item.id)
    setError(res.ok ? null : `Can't delete "${item.name}": ${res.reason}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grocery catalogue</h1>
          <p className="text-sm text-gray-500">
            The canonical things you buy. Each has an aisle and a default unit.
          </p>
        </div>
        <Link to="/aisles" className={btnSecondary}>
          Edit aisles →
        </Link>
      </div>

      <form onSubmit={handleAdd} className={`${card} mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4`}>
        <div className="sm:col-span-2">
          <label className={label}>Name</label>
          <input
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Basmati rice"
          />
        </div>
        <div>
          <label className={label}>Aisle</label>
          <select className={input} value={aisleId} onChange={(e) => setAisleId(e.target.value)}>
            {sortedAisles.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Default unit</label>
          <input
            className={input}
            list="unit-options"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <div className="sm:col-span-4">
          <button type="submit" className={btnPrimary} disabled={!name.trim() || !aisleId}>
            Add item
          </button>
        </div>
      </form>

      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {itemsByAisle.length === 0 && (
        <p className="text-sm text-gray-500">No grocery items yet — add one above.</p>
      )}

      <div className="space-y-6">
        {itemsByAisle.map(({ aisle, items }) => (
          <section key={aisle.id}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {aisle.name}
            </h2>
            <ul className="space-y-2">
              {items.map((item) =>
                editingId === item.id ? (
                  <EditRow
                    key={item.id}
                    item={item}
                    aisleOptions={sortedAisles}
                    onSave={(input) => {
                      updateItem(item.id, input)
                      setEditingId(null)
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <li key={item.id} className={`${card} flex items-center gap-3`}>
                    <span className="flex-1 font-medium text-gray-800">{item.name}</span>
                    <span className="text-sm text-gray-400">{item.defaultUnit}</span>
                    <button className={btnSecondary} onClick={() => setEditingId(item.id)}>
                      Edit
                    </button>
                    <button className={btnDanger} onClick={() => handleDelete(item)}>
                      Delete
                    </button>
                  </li>
                ),
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function EditRow({
  item,
  aisleOptions,
  onSave,
  onCancel,
}: {
  item: GroceryItem
  aisleOptions: { id: string; name: string }[]
  onSave: (input: { name: string; aisleId: string; defaultUnit: string }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item.name)
  const [aisleId, setAisleId] = useState(item.aisleId)
  const [unit, setUnit] = useState(item.defaultUnit)

  return (
    <li className={`${card} grid grid-cols-1 gap-3 sm:grid-cols-4`}>
      <input
        className={`${input} sm:col-span-2`}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select className={input} value={aisleId} onChange={(e) => setAisleId(e.target.value)}>
        {aisleOptions.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <input
        className={input}
        list="unit-options"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
      />
      <div className="flex gap-2 sm:col-span-4">
        <button
          className={btnPrimary}
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), aisleId, defaultUnit: unit })}
        >
          Save
        </button>
        <button className={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </li>
  )
}
