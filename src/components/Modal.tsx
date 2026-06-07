import type { ReactNode } from 'react'

interface Props {
  onClose: () => void
  children: ReactNode
  /** Override the panel classes; defaults to a medium, scrollable centred card. */
  panelClassName?: string
}

/** Overlay with click-outside-to-close; the caller supplies the panel content. */
export function Modal({ onClose, children, panelClassName }: Props) {
  return (
    <div
      className="fixed inset-0 z-10 flex items-start justify-center bg-black/30 p-4 pt-20"
      onClick={onClose}
    >
      <div
        className={
          panelClassName ??
          'flex max-h-[70vh] w-full max-w-md flex-col rounded-lg bg-white shadow-lg'
        }
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
