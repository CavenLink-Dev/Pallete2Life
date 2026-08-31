import { useEffect, type ReactNode } from "react"

type Props = {
  children: ReactNode
  onClose?: () => void
  wide?: boolean
  labelId?: string
}

export default function FlowShell({ children, onClose, wide, labelId }: Props) {
  useEffect(() => {
    if (!onClose) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-charcoal/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
    >
      <div className={`animate-pop-in w-full rounded-2xl bg-white p-6 shadow-2xl ${wide ? "max-w-[680px]" : "max-w-[520px]"}`}>
        {children}
      </div>
    </div>
  )
}

export function FlowButton({ children, onClick, primary, disabled, autoFocus, className = "" }: {
  children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean; autoFocus?: boolean; className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      autoFocus={autoFocus}
      className={`rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${primary ? "bg-[#20B9FA] text-white hover:opacity-90" : "border border-softgrey bg-white text-charcoal/70 hover:text-charcoal"} ${className}`}
    >
      {children}
    </button>
  )
}

export function FlowProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-1" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={steps.length}>
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          {i > 0 && <span className="text-[10px] text-charcoal/25" aria-hidden>→</span>}
          <span className={`text-[11px] font-semibold ${i === current ? "text-[#20B9FA]" : i < current ? "text-charcoal/50" : "text-charcoal/30"}`}>{label}</span>
        </div>
      ))}
    </div>
  )
}
