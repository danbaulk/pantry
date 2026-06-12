import { useState } from 'react'
import type { GroceryItem } from '../types'
import { usePantry } from '../state/usePantry'
import { isKnownUnit, UNITS } from '../lib/units'
import { UnitSelect } from './UnitSelect'
import { AisleSelect } from './AisleSelect'
import { btnPrimary, btnSecondary, input, label } from './ui'

interface Props {
  /** Pre-fill the name (e.g. what the user typed into the picker). */
  initialName?: string
  /** Pre-fill the default unit (e.g. the ingredient row's parsed unit). */
  initialUnit?: string
  onAdded: (item: GroceryItem) => void
  onCancel: () => void
}

/**
 * Inline quick-add for a new grocery item, used from the ingredient picker so
 * authoring a recipe never has to leave for the catalogue. Shares createItem with
 * CatalogueManager so write logic isn't duplicated. It's a plain <div>, not a
 * <form> — it renders inside the recipe editor's form, and a nested form would
 * bubble its submit (and steal Enter) up to that outer form. Enter is handled
 * locally instead.
 */
export function GroceryItemQuickAdd({ initialName = '', initialUnit, onAdded, onCancel }: Props) {
  const { sortedAisles, createItem } = usePantry()
  const [name, setName] = useState(initialName)
  const [aisleId, setAisleId] = useState(sortedAisles[0]?.id ?? '')
  const [unit, setUnit] = useState<string>(
    initialUnit && isKnownUnit(initialUnit) ? initialUnit : UNITS[0],
  )

  const canSave = name.trim() !== '' && aisleId !== ''

  function handleAdd() {
    if (!canSave) return
    const item = createItem({ name: name.trim(), aisleId, defaultUnit: unit })
    onAdded(item)
  }

  return (
    <div className="space-y-3 rounded-md border border-green-200 bg-green-50/50 p-3">
      <p className="text-sm font-medium text-gray-700">Quick-add grocery item</p>
      <div>
        <label className={label}>Name</label>
        <input
          autoFocus
          className={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            // Enter adds the item without submitting the surrounding recipe form.
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="e.g. Smoked paprika"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Aisle</label>
          <AisleSelect value={aisleId} onChange={setAisleId} aisles={sortedAisles} />
        </div>
        <div>
          <label className={label}>Default unit</label>
          <UnitSelect value={unit} onChange={setUnit} />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" className={btnPrimary} disabled={!canSave} onClick={handleAdd}>
          Add &amp; use
        </button>
        <button type="button" className={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
