import { useState } from 'react'

/**
 * Live-edited name field that reverts to its prior value if left blank. Edits are
 * applied immediately by `commit`; call `begin` when editing starts (focus / open) to
 * snapshot the current value, and `finish` when it ends (blur / close) to restore the
 * snapshot if the field was cleared. Used by the aisle and supermarket rename inputs.
 */
export function useEditableField(value: string, commit: (v: string) => void) {
  const [original, setOriginal] = useState('')
  const begin = () => setOriginal(value)
  const finish = () => {
    if (!value.trim()) commit(original)
  }
  return { begin, finish }
}
