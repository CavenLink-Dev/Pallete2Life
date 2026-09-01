import { BRAND } from "../lib/color"
import { useDialogFocus } from "../lib/useDialogFocus"

type Props = {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Small accessible confirmation dialog. Escape cancels, Enter confirms. */
export default function ConfirmDialog({
  open, title, body, confirmLabel, cancelLabel = "Cancel", destructive, onConfirm, onCancel,
}: Props) {
  const dialogRef = useDialogFocus<HTMLDivElement>(open, onCancel)

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-body"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in w-full max-w-sm rounded-[8px] bg-white p-5 shadow-2xl"
      >
        <h2 id="confirm-title" className="text-[16px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
        <p id="confirm-body" className="mt-2 text-[13.5px] leading-relaxed text-charcoal/70">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-[7px] border border-softgrey bg-white px-4 text-[12.5px] font-semibold text-charcoal/70 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-dialog-initial-focus
            onClick={onConfirm}
            className="h-11 rounded-[7px] px-4 text-[12.5px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-cta"
            style={{ background: destructive ? "#C22F2F" : BRAND.cta }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
