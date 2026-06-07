import { useState } from 'react'
import type { GroceryItem, Ingredient } from '../types'
import { usePantry } from '../state/usePantry'
import { GroceryItemQuickAdd } from './GroceryItemQuickAdd'
import { btnDanger, btnSecondary, input, label } from './ui'

interface Props {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

const NEW_ITEM = '__new__'

export function IngredientEditor({ ingredients, onChange }: Props) {
  const { data, sortedAisles, getItem } = usePantry()
  // Which row index is currently showing the quick-add form.
  const [quickAddRow, setQuickAddRow] = useState<number | null>(null)

  // Grocery items grouped by aisle for the dropdown.
  const itemsByAisle = sortedAisles
    .map((aisle) => ({
      aisle,
      items: data.groceryItems
        .filter((i) => i.aisleId === aisle.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((g) => g.items.length > 0)

  function updateRow(idx: number, patch: Partial<Ingredient>) {
    onChange(ingredients.map((ing, i) => (i === idx ? { ...ing, ...patch } : ing)))
  }

  function removeRow(idx: number) {
    onChange(ingredients.filter((_, i) => i !== idx))
  }

  function addRow() {
    onChange([...ingredients, { itemId: '', quantity: 1, unit: '' }])
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

      <ul className="space-y-3">
        {ingredients.map((ing, idx) => (
          <li key={idx} className="space-y-2 rounded-md border border-gray-200 p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <span className="mb-1 block text-xs text-gray-500">Item</span>
                <select
                  className={input}
                  value={ing.itemId || ''}
                  onChange={(e) => handleSelect(idx, e.target.value)}
                >
                  <option value="" disabled>
                    Pick a grocery item…
                  </option>
                  {itemsByAisle.map(({ aisle, items }) => (
                    <optgroup key={aisle.id} label={aisle.name}>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value={NEW_ITEM}>+ Add new grocery item…</option>
                </select>
              </div>

              <div className="w-24">
                <span className="mb-1 block text-xs text-gray-500">Qty</span>
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
                <span className="mb-1 block text-xs text-gray-500">Unit</span>
                <input
                  className={input}
                  list="unit-options"
                  value={ing.unit}
                  onChange={(e) => updateRow(idx, { unit: e.target.value })}
                />
              </div>

              <button type="button" className={btnDanger} onClick={() => removeRow(idx)}>
                Remove
              </button>
            </div>

            {quickAddRow === idx && (
              <GroceryItemQuickAdd
                onAdded={(item) => handleQuickAdded(idx, item)}
                onCancel={() => setQuickAddRow(null)}
              />
            )}
          </li>
        ))}
      </ul>

      <button type="button" className={`${btnSecondary} mt-3`} onClick={addRow}>
        + Add ingredient
      </button>
    </div>
  )
}
