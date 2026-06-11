import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Aisle } from '../types'
import { usePantry } from '../state/usePantry'
import { pluralize } from '../lib/format'
import { getDragPayload, hasDragPayload, setDragPayload } from '../lib/dnd'
import { btnPrimary, card, input } from './ui'

/**
 * The supermarket: every aisle in store walk-order. Rows drag to reorder the walk;
 * clicking an aisle opens it (`AisleDetail`) to manage the items it contains.
 */
export function Supermarket() {
  const { sortedAisles, data, createAisle, moveAisle } = usePantry()
  const [newName, setNewName] = useState('')
  // An aisle drag is in flight — show the move-to-end drop zone.
  const [dragging, setDragging] = useState(false)

  const itemCount = (aisleId: string) =>
    data.groceryItems.filter((i) => i.aisleId === aisleId).length

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    createAisle(name)
    setNewName('')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Supermarket</h1>
      <p className="mb-4 text-sm text-gray-500">
        Aisles ordered the way you walk the store. Drag a row to match your route; click an
        aisle to manage the items in it.
      </p>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          className={input}
          placeholder="New aisle name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className={btnPrimary}>
          Add aisle
        </button>
      </form>

      <ul className="space-y-2">
        {sortedAisles.map((aisle, idx) => (
          <AisleRow
            key={aisle.id}
            aisle={aisle}
            itemCount={itemCount(aisle.id)}
            onDropBefore={(draggedId) => moveAisle(draggedId, idx)}
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setDragging(false)}
          />
        ))}

        {dragging && (
          <EndDropZone onDropEnd={(draggedId) => moveAisle(draggedId, sortedAisles.length)} />
        )}
      </ul>

      {sortedAisles.length === 0 && (
        <p className="text-sm text-gray-500">No aisles yet — add one above.</p>
      )}
    </div>
  )
}

/**
 * One aisle row: a drag handle (handle-only so the click-through link doesn't start
 * drags) and a link into the aisle. The whole row is a drop target — dropping
 * another aisle on it inserts that aisle before this one.
 */
function AisleRow({
  aisle,
  itemCount,
  onDropBefore,
  onDragStart,
  onDragEnd,
}: {
  aisle: Aisle
  itemCount: number
  onDropBefore: (draggedId: string) => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <li
      className={`${card} flex items-center gap-2 ${
        dragOver ? 'border-green-400 ring-2 ring-green-300' : ''
      }`}
      onDragOver={(e) => {
        if (!hasDragPayload(e)) return
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={(e) => {
        // dragleave also fires when moving onto a child — only clear on a real exit.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const payload = getDragPayload(e)
        if (payload?.type === 'aisle') onDropBefore(payload.id)
      }}
    >
      <span
        draggable
        title="Drag to reorder"
        className="cursor-grab px-1 text-gray-400 select-none active:cursor-grabbing"
        onDragStart={(e) => {
          setDragPayload(e, { type: 'aisle', id: aisle.id })
          // Ghost the whole row, not just the handle glyph.
          e.dataTransfer.setDragImage(e.currentTarget.closest('li')!, 20, 20)
          onDragStart()
        }}
        // dragend fires on the source even for cancelled drags, so the end zone always clears.
        onDragEnd={onDragEnd}
      >
        ⠿
      </span>

      <Link
        to={`/supermarket/${aisle.id}`}
        draggable={false}
        className="flex flex-1 items-center justify-between gap-2"
      >
        <span className="font-medium text-green-700 hover:underline">{aisle.name}</span>
        <span className="text-xs text-gray-400">
          {itemCount} {pluralize('item', itemCount)} ›
        </span>
      </Link>
    </li>
  )
}

/** Drop target for "make it last" — insert-before on rows can't reach the end slot. */
function EndDropZone({ onDropEnd }: { onDropEnd: (draggedId: string) => void }) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <li
      className={`rounded-md border border-dashed py-2 text-center text-sm ${
        dragOver ? 'border-green-400 text-green-600 ring-2 ring-green-300' : 'border-gray-300 text-gray-400'
      }`}
      onDragOver={(e) => {
        if (!hasDragPayload(e)) return
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const payload = getDragPayload(e)
        if (payload?.type === 'aisle') onDropEnd(payload.id)
      }}
    >
      Drop here to move to the end
    </li>
  )
}
