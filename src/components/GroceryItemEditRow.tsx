import { useState } from 'react'
import type { Aisle, GroceryItem } from '../types'
import type { GroceryItemInput } from '../state/context'
import { UnitSelect } from './UnitSelect'
import { AisleSelect } from './AisleSelect'
import { btnPrimary, btnSecondary, card, input } from './ui'

interface Props {
  item: GroceryItem
  aisleOptions: Aisle[]
  onSave: (input: GroceryItemInput) => void
  onCancel: () => void
}

/** Inline edit form for a single catalogue item (name / aisle / default unit). */
export function GroceryItemEditRow({ item, aisleOptions, onSave, onCancel }: Props) {
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
      <AisleSelect value={aisleId} onChange={setAisleId} aisles={aisleOptions} />
      <UnitSelect value={unit} onChange={setUnit} />
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
