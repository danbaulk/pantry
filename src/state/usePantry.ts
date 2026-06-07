import { useContext } from 'react'
import { PantryContext, type PantryContextValue } from './context'

export function usePantry(): PantryContextValue {
  const ctx = useContext(PantryContext)
  if (!ctx) throw new Error('usePantry must be used within a PantryProvider')
  return ctx
}
