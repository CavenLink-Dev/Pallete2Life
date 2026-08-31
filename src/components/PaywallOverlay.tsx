import { useEffect } from "react"
import { BRAND } from "../lib/color"

type Props = {
  open: boolean
  onUnlock: () => void
  onLater: () => void
  /** Optional extra line explaining what triggered the paywall */
  reason?: string
}

/**
 * Full-screen paywall that sits over the Builder. Preserves the underlying
 * preview and palette (they stay behind the dim). Non-destructive: "Maybe
 * later" simply closes the overlay — nothing about the user's work is lost.
 */
export default function PaywallOverlay({ open, onUnlock, onLater, reason }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onLater() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onLater])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div className="animate-pop-in w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.brand }}>
          HueSet Pro
        </p>
        <h2 id="paywall-title" className="mt-1 text-[26px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          Unlock HueSet Pro
        </h2>
        <p className="mt-2 flex items-baseline gap-1">
          <span className="text-[28px] font-bold" style={{ fontFamily: "var(--font-display)" }}>$14.99</span>
          <span className="text-[14px] font-semibold text-charcoal/60">USD / month</span>
        </p>
        <p className="mt-0.5 text-[11px] text-charcoal/45">Billed monthly · recurring</p>
        <p className="mt-3 text-[14px] leading-relaxed text-charcoal/70">
          Keep creating palettes for free, or unlock unlimited previews (free includes 5 a day) and the full HueSet toolkit. Your current work stays exactly where it is.
        </p>
        {reason && (
          <p className="mt-3 rounded-lg bg-offwhite px-3 py-2 text-[12.5px] text-charcoal/60">{reason}</p>
        )}

        <ul className="mt-5 flex flex-col gap-2 text-[13.5px] text-charcoal/75">
          {[
            "Unlimited previews",
            "Every website, mobile app and component preview",
            "All templates and every button style",
            "Full Edit Mode and custom colour roles",
            "Company logo and app icon upload",
            "Full Screen Preview",
            "Advanced accessibility tools + exports (coming)",
          ].map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden style={{ color: BRAND.brand }}>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onLater}
            className="rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13px] font-semibold text-charcoal/70 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={onUnlock}
            autoFocus
            className="rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
            style={{ background: BRAND.brand }}
          >
            Go Pro + · $14.99/mo
          </button>
        </div>
        <p className="mt-3 text-[11px] text-charcoal/45">Your palette is saved in your browser and won't be lost.</p>
      </div>
    </div>
  )
}
