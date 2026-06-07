import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GroceryItem } from '../types'
import { usePantry } from '../state/usePantry'
import { UNITS } from '../lib/units'
import { buildItemsByAisle } from '../lib/itemsByAisle'
import { GroceryItemEditRow } from './GroceryItemEditRow'
import { ErrorMessage } from './ErrorMessage'
import { UnitSelect } from './UnitSelect'
import { AisleSelect } from './AisleSelect'
import { btnDanger, btnPrimary, btnSecondary, card, input, label } from './ui'

export function CatalogueManager() {
  const { data, sortedAisles, createItem, updateItem, deleteItem } = usePantry()
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // New-item form state
  const [name, setName] = useState('')
  const [aisleId, setAisleId] = useState(sortedAisles[0]?.id ?? '')
  const [unit, setUnit] = useState<string>(UNITS[0])

  const itemsByAisle = useMemo(
    () => buildItemsByAisle(sortedAisles, data.groceryItems),
    [data.groceryItems, sortedAisles],
  )

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
          <AisleSelect value={aisleId} onChange={setAisleId} aisles={sortedAisles} />
        </div>
        <div>
          <label className={label}>Default unit</label>
          <UnitSelect value={unit} onChange={setUnit} />
        </div>
        <div className="sm:col-span-4">
          <button type="submit" className={btnPrimary} disabled={!name.trim() || !aisleId}>
            Add item
          </button>
        </div>
      </form>

      <ErrorMessage message={error} className="mb-3" />

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
                  <GroceryItemEditRow
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
