import { useState } from 'react'

/**
 * A single-text-field "add" form: holds the input value and a submit handler that
 * trims, ignores empty input, calls `onAdd`, then resets the field. Used by the
 * add-aisle and add-supermarket forms.
 */
export function useAddForm(onAdd: (name: string) => void) {
  const [value, setValue] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = value.trim()
    if (!name) return
    onAdd(name)
    setValue('')
  }
  return { value, setValue, submit }
}
