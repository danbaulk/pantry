import { Link } from 'react-router-dom'

/** Shared "couldn't resolve this id" view: a grey message and an optional green back link. */
export function NotFound({
  message,
  backTo,
  backLabel,
}: {
  message: string
  backTo?: string
  backLabel?: string
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-gray-500">{message}</p>
      {backTo && backLabel && (
        <Link to={backTo} className="text-green-600 hover:underline">
          ← {backLabel}
        </Link>
      )}
    </div>
  )
}
