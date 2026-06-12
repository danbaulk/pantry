import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Aisle } from '../types'
import { usePantry } from '../state/usePantry'
import { useAddForm } from '../hooks/useAddForm'
import { pluralize } from '../lib/format'
import { getItemsInAisle } from '../lib/itemsByAisle'
import { getDragPayload, hasDragPayload, setDragPayload } from '../lib/dnd'
import { SupermarketTabs } from './SupermarketTabs'
import { btnPrimary, card, input } from './ui'

/**
 * The supermarket: every aisle in store walk-order. Rows drag to reorder the walk;
 * clicking an aisle opens it (`AisleDetail`) to manage the items it contains.
 */
export function Supermarket() {
  const { sortedAisles, data, createAisle, moveAisle } = usePantry()
  const addForm = useAddForm(createAisle)
  // The aisle drag in flight. dataTransfer is unreadable during dragover, so rows
  // need this to dim the source and hide no-op insertion points.
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const draggedIdx = draggingId ? sortedAisles.findIndex((a) => a.id === draggingId) : -1

  const itemCount = (aisleId: string) => getItemsInAisle(data.groceryItems, aisleId).length

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Supermarket</h1>
      <SupermarketTabs />
      <p className="mb-4 text-sm text-gray-500">
        Aisles ordered the way you walk this store — each supermarket tab keeps its own
        order. Drag a row to match your route; click an aisle to manage the items in it.
      </p>

      <form onSubmit={addForm.submit} className="mb-4 flex gap-2">
        <input
          className={input}
          placeholder="New aisle name…"
          value={addForm.value}
          onChange={(e) => addForm.setValue(e.target.value)}
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
            idx={idx}
            draggedIdx={draggedIdx}
            onDropAt={(draggedId, toIndex) => moveAisle(draggedId, toIndex)}
            onDragStart={() => setDraggingId(aisle.id)}
            onDragEnd={() => setDraggingId(null)}
          />
        ))}
      </ul>

      {sortedAisles.length === 0 && (
        <p className="text-sm text-gray-500">No aisles yet — add one above.</p>
      )}
    </div>
  )
}

type DropPos = 'before' | 'after'

/** Which side of the row the cursor is on — top half inserts before it, bottom half after. */
function dropPosFromEvent(e: React.DragEvent<HTMLLIElement>): DropPos {
  const rect = e.currentTarget.getBoundingClientRect()
  return e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}

/**
 * One aisle row: a drag handle (handle-only so the click-through link doesn't start
 * drags) and a link into the aisle. The whole row is a drop target: a green bar in
 * the gap above or below shows where the dragged aisle will land.
 */
function AisleRow({
  aisle,
  itemCount,
  idx,
  draggedIdx,
  onDropAt,
  onDragStart,
  onDragEnd,
}: {
  aisle: Aisle
  itemCount: number
  idx: number
  draggedIdx: number
  onDropAt: (draggedId: string, toIndex: number) => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const [dropPos, setDropPos] = useState<DropPos | null>(null)

  const targetIdx = (pos: DropPos) => (pos === 'before' ? idx : idx + 1)
  // Inserting back where the dragged row already sits (its own two gaps) moves nothing.
  const isNoOp = (pos: DropPos) =>
    targetIdx(pos) === draggedIdx || targetIdx(pos) === draggedIdx + 1

  return (
    <li
      className={`${card} relative flex items-center gap-2 ${
        idx === draggedIdx ? 'opacity-50' : ''
      }`}
      onDragOver={(e) => {
        if (!hasDragPayload(e)) return
        e.preventDefault()
        const pos = dropPosFromEvent(e)
        setDropPos(isNoOp(pos) ? null : pos)
      }}
      onDragLeave={(e) => {
        // dragleave also fires when moving onto a child — only clear on a real exit.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropPos(null)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDropPos(null)
        const payload = getDragPayload(e)
        if (payload?.type === 'aisle') onDropAt(payload.id, targetIdx(dropPosFromEvent(e)))
      }}
    >
      {dropPos && (
        <span
          className={`pointer-events-none absolute inset-x-0 h-0.5 rounded bg-green-500 ${
            dropPos === 'before' ? '-top-[5px]' : '-bottom-[5px]'
          }`}
        />
      )}

      <span
        draggable
        title="Drag to reorder"
        className="-my-1 cursor-grab px-2 py-1 text-lg leading-none text-gray-400 select-none active:cursor-grabbing"
        onDragStart={(e) => {
          setDragPayload(e, { type: 'aisle', id: aisle.id })
          // Ghost the whole row, not just the handle glyph.
          e.dataTransfer.setDragImage(e.currentTarget.closest('li')!, 20, 20)
          onDragStart()
        }}
        // dragend fires on the source even for cancelled drags, so the dimming always clears.
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
