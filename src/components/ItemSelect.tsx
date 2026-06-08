import type { ItemsByAisle } from '../lib/itemsByAisle'
import { NEW_ITEM } from '../lib/constants'
import { input } from './ui'

interface Props {
  value: string
  /** Receives the chosen item id, or NEW_ITEM when the quick-add option is picked. */
  onChange: (value: string) => void
  itemsByAisle: ItemsByAisle[]
  /** Flag an unmatched/required row with an amber border. */
  invalid?: boolean
}

/** Catalogue-item picker: aisle-grouped options plus a "+ add new" sentinel. */
export function ItemSelect({ value, onChange, itemsByAisle, invalid }: Props) {
  return (
    <select
      className={`${input}${invalid ? ' border-amber-400' : ''}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
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
  )
}
