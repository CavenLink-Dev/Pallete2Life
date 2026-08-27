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
        className="animate-pop-in relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-xl font-light text-charcoal/45 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
          aria-label="Dismiss help"
          title="Dismiss help"
        >
          ×
        </button>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.brand }}>Welcome</p>
        <h2 id="intro-title" className="mt-1 text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Preview workspace
        </h2>
        <ol className="mt-5 flex flex-col gap-3.5">
          {[
            { t: "Browse previews below", b: "Use the arrow buttons under the canvas to move through websites, mobile apps and components." },
            { t: "Choose a template", b: "The template row appears below the preview browser with options for the current design." },
            { t: "Edit Elements", b: "Turn on Edit Elements, then click a heading, button or surface to assign a palette colour." },
            { t: "Return to your palette", b: "Click the Palette Preview logo whenever you want to keep creating or export your colours for free." },
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
