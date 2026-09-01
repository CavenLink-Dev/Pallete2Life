import type { ReactNode } from "react"
import { useDialogFocus } from "../lib/useDialogFocus"

type Props = {
  open: boolean
  onClose: () => void
  labelledBy: string
  describedBy?: string
  children: ReactNode
  className?: string
  panelClassName?: string
  zClassName?: string
}

export default function DialogShell({
  open,
  onClose,
  labelledBy,
  describedBy,
  children,
  className = "",
  panelClassName = "",
  zClassName = "z-[70]",
}: Props) {
  const dialogRef = useDialogFocus<HTMLDivElement>(open, onClose)

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center overflow-y-auto bg-charcoal/55 p-4 backdrop-blur-sm ${zClassName} ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        className={`animate-pop-in w-full max-h-[92vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl ${panelClassName}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
