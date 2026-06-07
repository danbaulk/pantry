import type { ID } from '../types'

/** Generate a unique id. Thin wrapper so the source is swappable later. */
export function newId(): ID {
  return crypto.randomUUID()
}
