import { useState } from 'react'
import type { GroceryItem } from '../types'
import { usePantry } from '../state/usePantry'
import { UNITS } from '../lib/units'
import { btnPrimary, btnSecondary, input, label } from './ui'

interface Props {
  /** Pre-fill the name (e.g. what the user typed into the picker). */
  initialName?: string
  onAdded: (item: GroceryItem) => void
  onCancel: () => void
}

/**
 * Inline quick-add for a new grocery item, used from the ingredient picker so
 * authoring a recipe never has to leave for the catalogue. Shares createItem with
 * CatalogueManager so write logic isn't duplicated.
 */
export function GroceryItemQuickAdd({ initialName = '', onAdded, onCancel }: Props) {
  const { sortedAisles, createItem } = usePantry()
  const [name, setName] = useState(initialName)
  const [aisleId, setAisleId] = useState(sortedAisles[0]?.id ?? '')
  const [unit, setUnit] = useState<string>(UNITS[0])

  const canSave = name.trim() !== '' && aisleId !== ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    const item = createItem({ name: name.trim(), aisleId, defaultUnit: unit })
    onAdded(item)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-md border border-green-200 bg-green-50/50 p-3"
    >
      <p className="text-sm font-medium text-gray-700">Quick-add grocery item</p>
      <div>
        <label className={label}>Name</label>
        <input
          autoFocus
          className={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Smoked paprika"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
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
      </div>
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary} disabled={!canSave}>
          Add &amp; use
        </button>
        <button type="button" className={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
