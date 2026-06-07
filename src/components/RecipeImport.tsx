import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GroceryItem } from '../types'
import { usePantry } from '../state/usePantry'
import type { RecipeInput } from '../state/context'
import { parseRecipe } from '../lib/parseRecipe'
import { matchItem } from '../lib/matchItem'
import { GroceryItemQuickAdd } from './GroceryItemQuickAdd'
import { btnDanger, btnPrimary, btnSecondary, card, input, label } from './ui'

const NEW_ITEM = '__new__'

/** One parsed ingredient as the user resolves it against the catalogue. */
interface Row {
  raw: string
  quantity: number
  unit: string
  /** Parsed name, kept to pre-fill quick-add and show what was matched against. */
  parsedName: string
  /** Resolved catalogue item, or '' until matched/quick-added. */
  itemId: string
}

/**
 * Paste a recipe and turn it into a structured draft. Parsing is offline and
 * best-effort (src/lib/parseRecipe); the user resolves each ingredient to a
 * catalogue item here, then the draft opens in the normal RecipeEditor for a
 * final review and save — so there's one save path for manual and imported recipes.
 */
export function RecipeImport() {
  const navigate = useNavigate()
  const { data, sortedAisles } = usePantry()

  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(false)
  const [name, setName] = useState('')
  const [servings, setServings] = useState(2)
  const [tagsText, setTagsText] = useState('')
  const [instructions, setInstructions] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [quickAddRow, setQuickAddRow] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Grocery items grouped by aisle for the picker (mirrors IngredientEditor).
  const itemsByAisle = sortedAisles
    .map((aisle) => ({
      aisle,
      items: data.groceryItems
        .filter((i) => i.aisleId === aisle.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((g) => g.items.length > 0)

  function handleParse() {
    const result = parseRecipe(text)
    setName(result.name)
    setServings(result.servings)
    setInstructions(result.instructions)
    setTagsText('')
    setRows(
      result.ingredients.map((ing) => ({
        raw: ing.raw,
        quantity: ing.quantity,
        unit: ing.unit,
        parsedName: ing.name,
        itemId: matchItem(ing.name, data.groceryItems)?.id ?? '',
      })),
    )
    setError(null)
    setParsed(true)
  }

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  function removeRow(idx: number) {
    setRows((rs) => rs.filter((_, i) => i !== idx))
    if (quickAddRow === idx) setQuickAddRow(null)
  }

  function handleSelect(idx: number, value: string) {
    if (value === NEW_ITEM) {
      setQuickAddRow(idx)
      return
    }
    updateRow(idx, { itemId: value })
  }

  function handleQuickAdded(idx: number, item: GroceryItem) {
    updateRow(idx, { itemId: item.id })
    setQuickAddRow(null)
  }

  function handleOpenInEditor() {
    if (!name.trim()) {
      setError('Give the recipe a name before continuing.')
      return
    }
    if (rows.some((r) => !r.itemId)) {
      setError('Match every ingredient to a catalogue item (or remove the row) first.')
      return
    }
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const draft: RecipeInput = {
      name: name.trim(),
      servings: Number(servings) || 1,
      instructions: instructions.trim() || undefined,
      tags,
      favourite: false,
      ingredients: rows.map((r) => ({ itemId: r.itemId, quantity: r.quantity, unit: r.unit })),
    }
    navigate('/recipes/new', { state: { draft } })
  }

  if (!parsed) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Paste / import a recipe</h1>
        <p className="text-sm text-gray-500">
          Paste recipe text below (title, servings, an ingredient list, and method). We'll
          turn it into a structured draft you can review before saving.
        </p>
        <textarea
          className={`${input} min-h-64 font-mono`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            'Spaghetti Bolognese\nServes 4\n\nIngredients\n400g spaghetti\n2 cans chopped tomatoes\n1 onion, diced\n\nMethod\nFry the onion, add everything else, simmer.'
          }
        />
        <div className="flex gap-2">
          <button type="button" className={btnPrimary} disabled={!text.trim()} onClick={handleParse}>
            Parse
          </button>
          <button type="button" className={btnSecondary} onClick={() => navigate('/recipes')}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Review imported recipe</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className={`${card} space-y-4`}>
        <div>
          <label className={label}>Name</label>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Servings</label>
            <input
              type="number"
              min="1"
              className={input}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={label}>Tags</label>
            <input
              className={input}
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="comma, separated, tags"
            />
          </div>
        </div>
      </div>

      <div className={card}>
        <label className={label}>Ingredients</label>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">
            No ingredients were detected — you can add them in the editor after continuing.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row, idx) => (
              <li key={idx} className="space-y-2 rounded-md border border-gray-200 p-3">
                <p className="text-xs text-gray-400">From: “{row.raw}”</p>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="w-20">
                    <span className="mb-1 block text-xs text-gray-500">Qty</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={input}
                      value={row.quantity}
                      onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="w-24">
                    <span className="mb-1 block text-xs text-gray-500">Unit</span>
                    <input
                      className={input}
                      list="unit-options"
                      value={row.unit}
                      onChange={(e) => updateRow(idx, { unit: e.target.value })}
                    />
                  </div>
                  <div className="min-w-[12rem] flex-1">
                    <span className="mb-1 block text-xs text-gray-500">Catalogue item</span>
                    <select
                      className={`${input} ${row.itemId ? '' : 'border-amber-400'}`}
                      value={row.itemId || ''}
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
                  <button type="button" className={btnDanger} onClick={() => removeRow(idx)}>
                    Remove
                  </button>
                </div>

                {quickAddRow === idx && (
                  <GroceryItemQuickAdd
                    initialName={row.parsedName}
                    onAdded={(item) => handleQuickAdded(idx, item)}
                    onCancel={() => setQuickAddRow(null)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={card}>
        <label className={label}>Instructions</label>
        <textarea
          className={`${input} min-h-32`}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button type="button" className={btnPrimary} onClick={handleOpenInEditor}>
          Open in editor
        </button>
        <button type="button" className={btnSecondary} onClick={() => setParsed(false)}>
          Back to paste
        </button>
      </div>
    </div>
  )
}
