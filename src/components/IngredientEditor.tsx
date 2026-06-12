import { useState } from 'react'
import type { GroceryItem, Ingredient } from '../types'
import { usePantry } from '../state/usePantry'
import { buildItemsByAisle } from '../lib/itemsByAisle'
import { NEW_ITEM } from '../lib/constants'
import { pluralize } from '../lib/format'
import { GroceryItemQuickAdd } from './GroceryItemQuickAdd'
import { ItemSelect } from './ItemSelect'
import { UnitSelect } from './UnitSelect'
import { btnDanger, btnSecondary, ingredientRow, input, label, labelSmall } from './ui'

interface Props {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
  /** Parsed names by row index (import flow), used to label unmatched rows. */
  hints?: string[]
}

export function IngredientEditor({ ingredients, onChange, hints: initialHints }: Props) {
  const { data, sortedAisles, getItem } = usePantry()
  // Which row index is currently showing the quick-add form.
  const [quickAddRow, setQuickAddRow] = useState<number | null>(null)
  // Parsed-name hints kept in lockstep with rows (add/remove) so they never drift.
  const [hints, setHints] = useState<(string | undefined)[]>(() =>
    ingredients.map((_, i) => initialHints?.[i]),
  )

  // Grocery items grouped by aisle for the dropdown.
  const itemsByAisle = buildItemsByAisle(sortedAisles, data.groceryItems)

  // Rows with no catalogue item picked yet — flagged so they can't be missed.
  const unresolved = ingredients.filter((ing) => !ing.itemId).length

  function updateRow(idx: number, patch: Partial<Ingredient>) {
    onChange(ingredients.map((ing, i) => (i === idx ? { ...ing, ...patch } : ing)))
  }

  function removeRow(idx: number) {
    onChange(ingredients.filter((_, i) => i !== idx))
    setHints((h) => h.filter((_, i) => i !== idx))
  }

  function addRow() {
    onChange([...ingredients, { itemId: '', quantity: 1, unit: '' }])
    setHints((h) => [...h, undefined])
  }

  function handleSelect(idx: number, value: string) {
    if (value === NEW_ITEM) {
      setQuickAddRow(idx)
      return
    }
    const item = getItem(value)
    // Prefill the unit from the item's default when the row has no unit yet.
    const patch: Partial<Ingredient> = { itemId: value }
    if (item && !ingredients[idx].unit) patch.unit = item.defaultUnit
    updateRow(idx, patch)
  }

  function handleQuickAdded(idx: number, item: GroceryItem) {
    updateRow(idx, { itemId: item.id, unit: ingredients[idx].unit || item.defaultUnit })
    setQuickAddRow(null)
  }

  return (
    <div>
      <label className={label}>Ingredients</label>

      {ingredients.length === 0 && (
        <p className="mb-2 text-sm text-gray-400">
          No ingredients yet — add one below. Each picks a catalogue item so it carries an aisle
          and unit.
        </p>
      )}

      {unresolved > 0 && (
        <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          ⚠ {unresolved} {pluralize('ingredient', unresolved)} still{' '}
          {unresolved === 1 ? 'needs' : 'need'} a catalogue item — pick one or add it below.
        </p>
      )}

      <ul className="space-y-3">
        {ingredients.map((ing, idx) => {
          const hint = !ing.itemId ? hints[idx] : undefined
          return (
          <li
            key={idx}
            className={`${ingredientRow}${ing.itemId ? '' : ' bg-amber-50/40 ring-1 ring-amber-300'}`}
          >
            {hint && (
              <p className="text-xs text-amber-700">Unmatched: “{hint}” — pick or add it.</p>
            )}
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <span className={labelSmall}>Item</span>
                <ItemSelect
                  value={ing.itemId}
                  invalid={!ing.itemId}
                  itemsByAisle={itemsByAisle}
                  onChange={(value) => handleSelect(idx, value)}
                />
              </div>

              <div className="w-24">
                <span className={labelSmall}>Qty</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className={input}
                  value={ing.quantity}
                  onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                />
              </div>

              <div className="w-28">
                <span className={labelSmall}>Unit</span>
                <UnitSelect value={ing.unit} onChange={(unit) => updateRow(idx, { unit })} />
              </div>

              <button type="button" className={btnDanger} onClick={() => removeRow(idx)}>
                Remove
              </button>
            </div>

            {quickAddRow === idx && (
              <GroceryItemQuickAdd
                initialName={hints[idx]}
                initialUnit={ing.unit || undefined}
                onAdded={(item) => handleQuickAdded(idx, item)}
                onCancel={() => setQuickAddRow(null)}
              />
            )}
          </li>
          )
        })}
      </ul>

      <button type="button" className={`${btnSecondary} mt-3`} onClick={addRow}>
        + Add ingredient
      </button>
    </div>
  )
}
