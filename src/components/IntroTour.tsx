import { useEffect } from "react"
import { BRAND } from "../lib/color"

const STORAGE_KEY = "pallet-preview:intro-seen"

export function markIntroSeen() {
  try { localStorage.setItem(STORAGE_KEY, "1") } catch { /* ignore */ }
}
export function shouldShowIntro(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) !== "1" } catch { return false }
}

/** First-visit tour. Three short steps. Fully skippable. */
export default function IntroTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-charcoal/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.brand }}>Welcome</p>
        <h2 id="intro-title" className="mt-1 text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Four quick steps
        </h2>
        <ol className="mt-5 flex flex-col gap-3.5">
          {[
            { t: "Choose your colours", b: "Click any swatch in the palette to edit its HEX, RGB or HSL — or use Randomise beside the palette." },
            { t: "Choose your preview", b: "Use the Preview and Templates buttons in the main tools row to switch between websites, mobile apps and components." },
            { t: "Edit Elements", b: "Turn on Edit Elements, then click any button or heading in the preview to reassign its colour to a role from your palette." },
            { t: "Export your palette", b: "Open Export to copy HEX/RGB/HSL, grab CSS or Tailwind, or download a project file to reopen later." },
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold text-white"
                style={{ background: BRAND.brand, fontFamily: "var(--font-display)" }}
                aria-hidden
              >
                {i + 1}
              </span>
              <span>
                <span className="block text-[14px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{s.t}</span>
                <span className="block text-[13px] leading-relaxed text-charcoal/65">{s.b}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-[11px] text-charcoal/45">You can reopen this from Help anytime.</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[12.5px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#20B9FA]"
            style={{ background: BRAND.brand }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  )
}
