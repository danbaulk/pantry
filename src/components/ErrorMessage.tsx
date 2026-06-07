interface Props {
  message: string | null | undefined
  /** Extra classes (e.g. spacing) merged onto the banner. */
  className?: string
}

/** Inline red error banner; renders nothing when there's no message. */
export function ErrorMessage({ message, className }: Props) {
  if (!message) return null
  return (
    <p
      className={`rounded-md bg-red-50 px-3 py-2 text-sm text-red-700${
        className ? ` ${className}` : ''
      }`}
    >
      {message}
    </p>
  )
}
