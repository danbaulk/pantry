import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Ingredient } from '../types'
import { usePantry } from '../state/usePantry'
import type { RecipeInput } from '../state/context'
import { IngredientEditor } from './IngredientEditor'
import { btnPrimary, btnSecondary, card, input, label } from './ui'

export function RecipeEditor() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { getRecipe, createRecipe, updateRecipe } = usePantry()

  const existing = id ? getRecipe(id) : undefined
  const isEdit = Boolean(existing)

  // When creating, an imported draft can seed the form (see RecipeImport).
  const draft = existing
    ? undefined
    : (location.state as { draft?: RecipeInput } | null)?.draft
  const initial = existing ?? draft

  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [servings, setServings] = useState(initial?.servings ?? 2)
  const [instructions, setInstructions] = useState(initial?.instructions ?? '')
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '))
  const [favourite, setFavourite] = useState(initial?.favourite ?? false)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [source, setSource] = useState(initial?.source ?? '')
  const [ingredients, setIngredients] = useState<Ingredient[]>(initial?.ingredients ?? [])
  const [error, setError] = useState<string | null>(null)

  // Editing a route id that doesn't resolve to a recipe.
  if (id && !existing) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-gray-500">Recipe not found.</p>
      </div>
    )
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please give the recipe a name.')
      return
    }
    if (ingredients.some((ing) => !ing.itemId)) {
      setError('Every ingredient needs a grocery item selected (or remove the empty row).')
      return
    }

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload: RecipeInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      servings: Number(servings) || 1,
      instructions: instructions.trim() || undefined,
      tags,
      favourite,
      notes: notes.trim() || undefined,
      source: source.trim() || undefined,
      ingredients,
    }

    if (existing) {
      updateRecipe(existing.id, payload)
      navigate(`/recipes/${existing.id}`)
    } else {
      const newRecipeId = createRecipe(payload)
      navigate(`/recipes/${newRecipeId}`)
    }
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit recipe' : 'New recipe'}
      </h1>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className={`${card} space-y-4`}>
        <div>
          <label className={label}>Name</label>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className={label}>Description</label>
          <input
            className={input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short one-liner (optional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Servings</label>
            <input
              type="number"
              min="1"
              className={input}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={favourite}
                onChange={(e) => setFavourite(e.target.checked)}
              />
              Favourite ⭐
            </label>
          </div>
        </div>

        <div>
          <label className={label}>Tags</label>
          <input
            className={input}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="comma, separated, tags"
          />
        </div>
      </div>

      <div className={card}>
        <IngredientEditor ingredients={ingredients} onChange={setIngredients} />
      </div>

      <div className={`${card} space-y-4`}>
        <div>
          <label className={label}>Instructions</label>
          <textarea
            className={`${input} min-h-32`}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Step-by-step method (optional)"
          />
        </div>
        <div>
          <label className={label}>Notes</label>
          <textarea
            className={`${input} min-h-20`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else (optional)"
          />
        </div>
        <div>
          <label className={label}>Source</label>
          <input
            className={input}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Where it came from (optional)"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>
          {isEdit ? 'Save changes' : 'Create recipe'}
        </button>
        <button
          type="button"
          className={btnSecondary}
          onClick={() => navigate(existing ? `/recipes/${existing.id}` : '/recipes')}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
