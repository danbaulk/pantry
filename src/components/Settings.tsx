import { useMemo } from 'react'
import { usePantry } from '../state/usePantry'
import { buildItemsByAisle } from '../lib/itemsByAisle'
import { pluralize } from '../lib/format'
import { aisleHeading, btnSecondary, card, label } from './ui'

/**
 * Allergy / excluded-item settings. Tick the grocery items you want to avoid: recipes
 * using any of them get an "allergen" badge across the library and are kept out of the
 * randomiser and suggestions.
 */
export function Settings() {
  const { data, sortedAisles, excludedItemIds, toggleExcludedItem, clearExcludedItems } =
    usePantry()

  const groups = useMemo(
    () => buildItemsByAisle(sortedAisles, data.groceryItems),
    [sortedAisles, data.groceryItems],
  )

  const excludedCount = excludedItemIds.size

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        {excludedCount > 0 && (
          <button type="button" className={btnSecondary} onClick={clearExcludedItems}>
            Clear all
          </button>
        )}
      </div>

      <section className={card}>
        <h2 className={label}>Excluded items (allergies / avoid)</h2>
        <p className="mb-3 text-sm text-gray-500">
          {excludedCount === 0
            ? 'Tick items to exclude. Recipes using them are flagged and left out of the randomiser and suggestions.'
            : `${excludedCount} ${pluralize('item', excludedCount)} excluded.`}
        </p>

        {data.groceryItems.length === 0 ? (
          <p className="text-sm text-gray-400">No grocery items in the catalogue yet.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.aisle.id}>
                <h3 className={`mb-1 ${aisleHeading}`}>
                  {group.aisle.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const on = excludedItemIds.has(item.id)
                    return (
                      <label
                        key={item.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                          on
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-red-600"
                          checked={on}
                          onChange={() => toggleExcludedItem(item.id)}
                        />
                        {item.name}
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
