import { useState, type ReactNode } from "react"

export type StripItem = { key: string; label: string; thumb: ReactNode }

export default function StyleStrip({
  title,
  items,
  active,
  onSelect,
}: {
  title: string
  items: StripItem[]
  active: string
  onSelect: (key: string) => void
}) {
  const [open, setOpen] = useState(true)
  const activeLabel = items.find((i) => i.key === active)?.label ?? ""

  return (
    <div className="rounded-xl border border-softgrey bg-white/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5"
      >
        <span className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-charcoal" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
          <span className="text-xs text-charcoal/45">{activeLabel}</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-charcoal/50">
          {open ? "Hide" : "Change"}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="flex gap-2.5 overflow-x-auto px-4 pb-3.5 pt-1">
          {items.map((it) => {
            const on = active === it.key
            return (
              <button
                key={it.key}
                type="button"
                onClick={() => onSelect(it.key)}
                className="flex shrink-0 flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5"
              >
                <div
                  className="h-11 w-[68px] overflow-hidden rounded-lg border transition-all"
                  style={{
                    borderColor: on ? "#20B9FA" : "#E7E9ED",
                    boxShadow: on ? "0 4px 12px rgba(32,185,250,0.25)" : "none",
                  }}
                >
                  {it.thumb}
                </div>
                <span className="text-[11px] font-medium" style={{ color: on ? "#05A9F0" : "#7A818B" }}>
                  {it.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
