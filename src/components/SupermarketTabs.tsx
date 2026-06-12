import { useState } from 'react'
import { usePantry } from '../state/usePantry'
import { ErrorMessage } from './ErrorMessage'
import { btnPrimary, btnSecondary, input } from './ui'

/**
 * The supermarket profile switcher: one tab per profile, the active one carrying
 * the rename (✎) and delete (✕) affordances, plus a "+" that expands into an
 * inline add form. Selecting a tab sets the active profile, which reorders
 * aisles app-wide (supermarket page, pickers, shopping list).
 */
export function SupermarketTabs() {
  const {
    supermarkets,
    activeSupermarket,
    createSupermarket,
    renameSupermarket,
    deleteSupermarket,
    setActiveSupermarket,
  } = usePantry()
  const [renaming, setRenaming] = useState(false)
  // The name when the rename started — restored if the field is left blank.
  const [nameBeforeRename, setNameBeforeRename] = useState('')
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function startRename() {
    setNameBeforeRename(activeSupermarket.name)
    setRenaming(true)
  }

  function endRename() {
    // Live edits are already applied; a blank name reverts to what it was.
    if (!activeSupermarket.name.trim()) {
      renameSupermarket(activeSupermarket.id, nameBeforeRename)
    }
    setRenaming(false)
  }

  function selectTab(id: string) {
    if (renaming) endRename()
    setError(null)
    setActiveSupermarket(id)
  }

  function handleDelete() {
    if (!confirm(`Delete "${activeSupermarket.name}"? Your aisles are kept — only this store's ordering is removed.`)) {
      return
    }
    const result = deleteSupermarket(activeSupermarket.id)
    setError(result.ok ? null : result.reason)
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const id = createSupermarket(name)
    setActiveSupermarket(id)
    setNewName('')
    setAdding(false)
  }

  return (
    <div className="mb-4">
      <div role="tablist" className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        {supermarkets.map((s) => {
          const isActive = s.id === activeSupermarket.id
          return (
            <span key={s.id} className="inline-flex items-center gap-1">
              {isActive && renaming ? (
                <input
                  className={`${input} w-40`}
                  value={s.name}
                  autoFocus
                  onChange={(e) => renameSupermarket(s.id, e.target.value)}
                  onBlur={endRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') endRename()
                  }}
                />
              ) : (
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={isActive ? btnPrimary : btnSecondary}
                  onClick={() => !isActive && selectTab(s.id)}
                >
                  {s.name}
                </button>
              )}
              {isActive && !renaming && (
                <>
                  <button
                    type="button"
                    aria-label="Rename supermarket"
                    title="Rename"
                    className="px-1 text-gray-400 hover:text-gray-600"
                    onClick={startRename}
                  >
                    ✎
                  </button>
                  {supermarkets.length > 1 && (
                    <button
                      type="button"
                      aria-label="Delete supermarket"
                      title="Delete"
                      className="px-1 text-gray-400 hover:text-red-600"
                      onClick={handleDelete}
                    >
                      ✕
                    </button>
                  )}
                </>
              )}
            </span>
          )
        })}

        {adding ? (
          <form onSubmit={handleAdd} className="inline-flex items-center gap-1">
            <input
              className={`${input} w-40`}
              placeholder="Supermarket name…"
              value={newName}
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => {
                setAdding(false)
                setNewName('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setAdding(false)
                  setNewName('')
                }
              }}
            />
            <button type="submit" className={btnSecondary} onMouseDown={(e) => e.preventDefault()}>
              Add
            </button>
          </form>
        ) : (
          <button
            type="button"
            aria-label="Add supermarket"
            title="Add a supermarket"
            className={btnSecondary}
            onClick={() => setAdding(true)}
          >
            +
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} className="mt-2" />}
    </div>
  )
}
