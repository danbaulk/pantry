import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { GroceryItem } from '../types'
import { usePantry } from '../state/usePantry'
import { useEditableField } from '../hooks/useEditableField'
import { getItemsInAisle } from '../lib/itemsByAisle'
import { UNITS } from '../lib/units'
import { GroceryItemEditRow } from './GroceryItemEditRow'
import { ErrorMessage } from './ErrorMessage'
import { NotFound } from './NotFound'
import { UnitSelect } from './UnitSelect'
import { btn, btnDanger, btnPrimary, btnSecondary, card, input, label } from './ui'

/**
 * One aisle of the supermarket: rename it, delete it (guarded — only once empty),
 * and manage the grocery items it contains. Editing an item can move it to another
 * aisle (the edit row keeps its aisle select), at which point it leaves this page.
 */
export function AisleDetail() {
  const { aisleId } = useParams<{ aisleId: string }>()
  const navigate = useNavigate()
  const {
    data,
    getAisle,
    sortedAisles,
    excludedItemIds,
    renameAisle,
    deleteAisle,
    createItem,
    updateItem,
    deleteItem,
    toggleExcludedItem,
  } = usePantry()

  const aisle = aisleId ? getAisle(aisleId) : undefined
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  // Reverts the rename input to its prior value if left blank.
  const rename = useEditableField(aisle?.name ?? '', (v) => aisle && renameAisle(aisle.id, v))

  // New-item form state (the aisle is implied by the page).
  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState<string>(UNITS[0])

  if (!aisle) {
    return (
      <NotFound message="Aisle not found." backTo="/supermarket" backLabel="Back to the supermarket" />
    )
  }

  const items = getItemsInAisle(data.groceryItems, aisle.id)

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    createItem({ name: newName.trim(), aisleId: aisle!.id, defaultUnit: newUnit })
    setNewName('')
  }

  function handleDeleteAisle() {
    const res = deleteAisle(aisle!.id)
    if (res.ok) navigate('/supermarket')
    else setError(res.reason)
  }

  function handleDeleteItem(item: GroceryItem) {
    const res = deleteItem(item.id)
    setError(res.ok ? null : `Can't delete "${item.name}": ${res.reason}`)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/supermarket" className="text-sm text-green-600 hover:underline">
        ← Back to the supermarket
      </Link>

      <div className="mt-2 mb-1 flex items-center gap-2">
        <input
          className={`${input} flex-1 text-lg font-bold`}
          value={aisle.name}
          onChange={(e) => renameAisle(aisle.id, e.target.value)}
          onFocus={rename.begin}
          onBlur={rename.finish}
        />
        <button className={btnDanger} onClick={handleDeleteAisle}>
          Delete aisle
        </button>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        "Avoid" marks allergies — recipes using an avoided item are flagged and kept out of
        suggestions. An aisle can only be deleted once it has no items.
      </p>

      <ErrorMessage message={error} className="mb-3" />

      <form onSubmit={handleAddItem} className={`${card} mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3`}>
        <div className="sm:col-span-2">
          <label className={label}>Name</label>
          <input
            className={input}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Basmati rice"
          />
        </div>
        <div>
          <label className={label}>Default unit</label>
          <UnitSelect value={newUnit} onChange={setNewUnit} />
        </div>
        <div className="sm:col-span-3">
          <button type="submit" className={btnPrimary} disabled={!newName.trim()}>
            Add item
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No items in this aisle yet — add one above.</p>
      ) : (
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
                <AvoidToggle
                  avoided={excludedItemIds.has(item.id)}
                  onToggle={() => toggleExcludedItem(item.id)}
                />
                <button className={btnSecondary} onClick={() => setEditingId(item.id)}>
                  Edit
                </button>
                <button className={btnDanger} onClick={() => handleDeleteItem(item)}>
                  Delete
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}

/** Per-item allergy flag: red-tinted while active. */
function AvoidToggle({ avoided, onToggle }: { avoided: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={avoided}
      title={
        avoided
          ? 'Avoided — recipes using this are flagged and kept out of suggestions. Click to allow.'
          : 'Avoid this item (allergies / dislikes)'
      }
      className={`${btn} border ${
        avoided
          ? 'border-red-300 bg-red-50 text-red-700'
          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
      }`}
      onClick={onToggle}
    >
      Avoid
    </button>
  )
}
