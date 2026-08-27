import { useEffect, useState } from "react"
import { BRAND, aaCheck, readableOn, type Swatch } from "../lib/color"

export type ColourblindMode = "off" | "protanopia" | "deuteranopia" | "tritanopia"

type Props = {
  open: boolean
  onClose: () => void
  palette: Swatch[]
  mode: ColourblindMode
  setMode: (m: ColourblindMode) => void
}

/**
 * Accessibility overlay: shows contrast between every pair of colours in the
 * palette against a black/white body, flags AA / AA Fail, and lets the viewer
 * simulate common types of colour blindness on the entire preview.
 */
export default function AccessibilityPanel({ open, onClose, palette, mode, setMode }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const [tab, setTab] = useState<"contrast" | "colourblind">("contrast")
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-charcoal/40 p-4 pt-[6vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-title"
    >
      <div onClick={(e) => e.stopPropagation()} className="animate-pop-in flex w-full max-w-3xl flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 id="a11y-title" className="text-[16px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Accessibility</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-softgrey px-2.5 py-1.5 text-[11px] font-semibold text-charcoal/60 hover:text-charcoal">Close</button>
        </div>

        <div className="flex gap-1 rounded-lg bg-offwhite p-1 text-[12.5px] font-semibold">
          <TabButton on={tab === "contrast"} onClick={() => setTab("contrast")}>Contrast</TabButton>
          <TabButton on={tab === "colourblind"} onClick={() => setTab("colourblind")}>Colour blindness</TabButton>
        </div>

        {tab === "contrast" ? (
          <ContrastReport palette={palette} />
        ) : (
          <ColourblindPicker mode={mode} setMode={setMode} />
        )}
      </div>
    </div>
  )
}

function TabButton({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-md px-3 py-1.5 transition-colors"
      style={on ? { background: "#fff", color: BRAND.brandDark, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" } : { color: BRAND.medgrey }}
    >
      {children}
    </button>
  )
}

function ContrastReport({ palette }: { palette: Swatch[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-charcoal/65">
        WCAG 2.1 contrast for every colour against typical body text. AA needs 4.5:1 (3:1 for large or bold text ≥ 18pt).
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {palette.map((s) => {
          const light = aaCheck("#FFFFFF", s.hex)
          const dark = aaCheck("#0E1821", s.hex)
          const bestLight = light.ratio >= dark.ratio
          const best = bestLight ? light : dark
          return (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-softgrey p-3">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                style={{ background: s.hex, color: readableOn(s.hex), boxShadow: `inset 0 0 0 1px rgba(14,24,33,0.08)` }}
              >
                Aa
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-charcoal">{s.name}</p>
                <p className="text-[11px] text-charcoal/50" style={{ fontFamily: "var(--font-mono)" }}>{s.hex}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Verdict label="On white" check={light} />
                  <Verdict label="On dark" check={dark} />
                </div>
                <p className="mt-1 text-[11px] text-charcoal/55">Best pair: {bestLight ? "white text" : "dark text"} · {best.ratio}:1 ({best.aa ? "AA" : best.aaLarge ? "AA Large only" : "Fails AA"})</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Verdict({ label, check }: { label: string; check: { ratio: number; aa: boolean; aaLarge: boolean } }) {
  const ok = check.aa
  const large = !ok && check.aaLarge
  const color = ok ? "#0E8A4E" : large ? "#9A6B00" : "#C22F2F"
  const tint = ok ? "rgba(14,138,78,0.12)" : large ? "rgba(154,107,0,0.14)" : "rgba(194,47,47,0.12)"
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: tint, color }}>
      {label} · {check.ratio}:1 · {ok ? "AA" : large ? "Large only" : "Fail"}
    </span>
  )
}

const MODES: { key: ColourblindMode; label: string; note: string }[] = [
  { key: "off", label: "None", note: "Normal vision" },
  { key: "protanopia", label: "Protanopia", note: "Red-blind (~1% of men)" },
  { key: "deuteranopia", label: "Deuteranopia", note: "Green-blind (~5% of men)" },
  { key: "tritanopia", label: "Tritanopia", note: "Blue-blind (rare)" },
]

function ColourblindPicker({ mode, setMode }: { mode: ColourblindMode; setMode: (m: ColourblindMode) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-charcoal/65">
        Simulate how your preview looks to viewers with common types of colour blindness. The simulation applies to the whole preview until you turn it off.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {MODES.map((m) => {
          const on = mode === m.key
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className="flex flex-col rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
              style={on ? { borderColor: BRAND.brand, background: `${BRAND.brand}0f` } : { borderColor: "#E7E9ED", background: "#fff" }}
              aria-pressed={on}
            >
              <span className="text-[13px] font-bold" style={{ fontFamily: "var(--font-display)", color: on ? BRAND.brandDark : "#0E1821" }}>{m.label}</span>
              <span className="text-[11.5px] text-charcoal/60">{m.note}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-1 text-[11px] text-charcoal/45">
        Approximations based on standard channel-swap filters. Use as a guide, not a clinical simulation.
      </p>
    </div>
  )
}

/**
 * SVG filters used by the preview area to simulate common colour vision types.
 * Render this once inside the app; then apply `filter: url(#cb-<mode>)`.
 */
export function ColourblindFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden>
      <defs>
        <filter id="cb-protanopia">
          <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
        </filter>
        <filter id="cb-deuteranopia">
          <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
        </filter>
        <filter id="cb-tritanopia">
          <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
  )
}
