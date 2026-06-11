import type { ID } from '../types'

/**
 * Native HTML5 drag-and-drop payloads. Three draggables exist: a suggested recipe
 * (dropped on a day to plan it), an existing planned meal (dropped on a day to move
 * it), and an aisle row (dropped on another row to reorder the store walk). One JSON
 * payload under a custom MIME type keeps the format in one place — the type also
 * stops unrelated drops (text, files) from being accepted.
 */

export type DragPayload =
  | { type: 'recipe'; id: ID }
  | { type: 'meal'; id: ID }
  | { type: 'aisle'; id: ID }

const MIME = 'application/x-pantry'

export function setDragPayload(e: React.DragEvent, payload: DragPayload) {
  e.dataTransfer.setData(MIME, JSON.stringify(payload))
  e.dataTransfer.effectAllowed = 'move'
}

/** True while dragging over a target, when the drag carries a pantry payload. */
export function hasDragPayload(e: React.DragEvent): boolean {
  return e.dataTransfer.types.includes(MIME)
}

/** The payload on drop, or undefined for foreign drags. */
export function getDragPayload(e: React.DragEvent): DragPayload | undefined {
  const raw = e.dataTransfer.getData(MIME)
  if (!raw) return undefined
  return JSON.parse(raw) as DragPayload
}
