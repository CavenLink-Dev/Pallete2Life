import { useEffect } from "react"
import { BRAND } from "../lib/color"
import { useDialogFocus } from "../lib/useDialogFocus"

const STORAGE_KEY = "pallet-preview:intro-seen"

export function markIntroSeen() {
  try { localStorage.setItem(STORAGE_KEY, "1") } catch { /* ignore */ }
}
export function shouldShowIntro(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) !== "1" } catch { return false }
}

/** First-visit tour. Three short steps. Fully skippable. */
export default function IntroTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useDialogFocus<HTMLDivElement>(open)
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
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in relative w-full max-w-md rounded-[8px] bg-white p-6 shadow-2xl"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.brand }}>Welcome</p>
        <h2 id="intro-title" className="mt-1 text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Preview workspace
        </h2>
        <ol className="mt-5 flex flex-col gap-3.5">
          {[
            { t: "Build your palette", b: "Edit, lock, add or safely randomise colours from the palette and inspector." },
            { t: "Choose a template", b: "Use Change template above the preview to browse website and application designs." },
            { t: "Edit elements", b: "Turn on Edit elements, then select a heading, button, card or navigation item to adjust its tokens." },
            { t: "Build and export", b: "Use the workflow steps for shared tokens, reusable components and final exports." },
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
            className="h-11 rounded-[7px] px-4 text-[12.5px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#20B9FA]"
            style={{ background: BRAND.brand }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  )
}
