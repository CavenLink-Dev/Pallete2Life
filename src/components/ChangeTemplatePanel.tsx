import { useEffect, useRef } from "react"

/* Change Template — collapsed by default so it does not steal vertical
 * space. Renders as a small pill showing the current selection; click
 * opens a floating popover with the three tiers (Template / Layout /
 * Variant). Click outside or Escape closes. */

type Props = {
  open: boolean
  onToggle: () => void
  onClose: () => void

  template: string
  templates: string[]
  onTemplate: (v: string) => void

  variant: string
  variants: string[]
  onVariant: (v: string) => void

  layout: string
  layouts: string[]
  onLayout: (v: string) => void

  compact?: boolean
}

const UI_FONT = { fontFamily: `Geist, "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif` } as const
const DISPLAY_FONT = { fontFamily: `"Inter", Geist, ui-sans-serif, system-ui, sans-serif` } as const

export default function ChangeTemplatePanel(p: Props) {
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!p.open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") p.onClose() }
    const onDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) p.onClose()
    }
    window.addEventListener("keydown", onKey)
    const t = setTimeout(() => document.addEventListener("mousedown", onDown), 0)
    return () => {
      window.removeEventListener("keydown", onKey)
      clearTimeout(t)
      document.removeEventListener("mousedown", onDown)
    }
  }, [p.open, p])

  return (
    <div className="relative shrink-0" style={UI_FONT}>
      {p.compact ? (
        <button
          type="button"
          onClick={p.onToggle}
          aria-expanded={p.open}
          aria-haspopup="dialog"
          className="flex h-[32px] items-center gap-1.5 rounded-[8px] border border-[#e5e7eb] bg-white px-3 text-[12px] font-semibold text-[#111827] transition-colors hover:border-[#cecfd0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
          title="Change template, layout and variant"
        >
          <LayersIcon />
          <span className="hidden sm:inline">Change template</span>
          <ChevronDown className={`text-[#6b7280] transition-transform ${p.open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={p.onToggle}
          aria-expanded={p.open}
          aria-haspopup="dialog"
          className="flex h-[113px] w-[240px] flex-col justify-between rounded-[12px] border border-[#e5e7eb] bg-white p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:border-[#cecfd0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
          title="Change template, layout and variant"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24px] text-[#6b7280]">
              <LayersIcon /> Change Format
            </span>
            <ChevronDown className={`text-[#6b7280] transition-transform ${p.open ? "rotate-180" : ""}`} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24px] text-[#9ca3af]">Current</span>
            <span className="truncate text-[15px] font-bold text-[#111827]" style={DISPLAY_FONT}>{p.template}</span>
            <span className="truncate text-[11px] font-semibold text-[#6b7280]">{p.layout} · {p.variant}</span>
          </div>
        </button>
      )}

      {p.open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Change Template"
          className="absolute right-0 top-full z-40 mt-2 flex w-[320px] flex-col gap-3 rounded-[12px] border border-[#e5e7eb] bg-white p-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-extrabold tracking-tight text-[#111827]" style={DISPLAY_FONT}>CHANGE TEMPLATE</p>
            <button
              type="button"
              onClick={p.onClose}
              className="grid h-6 w-6 place-items-center rounded-md text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <SegmentedGroup label="Template" value={p.template} options={p.templates} onChange={p.onTemplate} />

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24px] text-[#9ca3af]">Design Layout</span>
            <div className="grid grid-cols-3 gap-1.5">
              {p.layouts.map((l) => {
                const active = l === p.layout
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => p.onLayout(l)}
                    className={`flex h-[30px] items-center justify-center rounded-[7px] border text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] ${
                      active
                        ? "border-[#cecfd0] bg-white text-[#111827]"
                        : "border-[#e5e7eb] bg-[#f3f4f6] text-[#7b7b7b] hover:text-[#111827]"
                    }`}
                    aria-pressed={active}
                  >{l}</button>
                )
              })}
            </div>
          </div>

          <SegmentedGroup label="Design Variant" value={p.variant} options={p.variants} onChange={p.onVariant} />
        </div>
      )}
    </div>
  )
}

function SegmentedGroup({
  label, value, options, onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.24px] text-[#9ca3af]">{label}</span>
      <div className="flex h-[32px] w-full rounded-[9px] border border-[#e5e7eb] bg-[#f3f4f6] p-[2px]">
        {options.map((v) => {
          const active = v === value
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex flex-1 items-center justify-center rounded-[7px] text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] ${
                active
                  ? "border border-[#cecfd0] bg-white font-bold text-[#111827] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                  : "font-semibold text-[#7b7b7b] hover:text-[#111827]"
              }`}
              aria-pressed={active}
            >{v}</button>
          )
        })}
      </div>
    </div>
  )
}

const LayersIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 6-10 6L2 8Z"/><path d="M2 16l10 6 10-6"/><path d="M2 12l10 6 10-6"/></svg>)
const ChevronDown = ({ className }: { className?: string }) => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>)
