import { BRAND } from "../lib/color"
import DialogShell from "./DialogShell"

type Props = {
  open: boolean
  onUnlock: () => void
  onLater: () => void
  reason?: string
}

export default function PaywallOverlay({ open, onUnlock, onLater, reason }: Props) {
  return (
    <DialogShell open={open} onClose={onLater} labelledBy="paywall-title" panelClassName="max-w-[440px]" zClassName="z-[60]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.cta }}>
        HueSet Pro
      </p>
      <h2 id="paywall-title" className="mt-1 text-[26px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
        Unlock HueSet Pro
      </h2>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-[28px] font-bold" style={{ fontFamily: "var(--font-display)" }}>$14.99</span>
        <span className="text-[14px] font-semibold text-charcoal/60">USD / month</span>
      </p>
      <p className="mt-0.5 text-[11px] text-charcoal/45">Billed monthly &middot; recurring</p>
      <p className="mt-3 text-[14px] leading-relaxed text-charcoal/70">
        Subscribe to Pro for unlimited Generate Design and Quick Design access, full exports, and the complete HueSet toolkit. Your current work stays exactly where it is.
      </p>
      {reason && (
        <p className="mt-3 rounded-lg bg-offwhite px-3 py-2 text-[12.5px] text-charcoal/60">{reason}</p>
      )}

      <ul className="mt-5 flex flex-col gap-2 text-[13.5px] text-charcoal/75">
        {[
          "Unlimited Generate Design and Quick Design",
          "Unlimited exports (CSS, JSON, design tokens, project files)",
          "Typography export",
          "Saved projects, premium and future templates",
          "All editing tools and Full Screen Preview",
          "Second Opinion (accessibility and contrast analysis)",
          "Company logo and app icon upload",
          "All future Pro features",
        ].map((f) => (
          <li key={f} className="flex gap-2">
            <span aria-hidden style={{ color: BRAND.cta }}>&#10003;</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onLater}
          className="min-h-11 rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13px] font-semibold text-charcoal/70 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
        >
          Maybe later
        </button>
        <button
          type="button"
          data-dialog-initial-focus
          onClick={onUnlock}
          className="min-h-11 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
          style={{ background: BRAND.cta }}
        >
          Go Pro &middot; $14.99/mo
        </button>
      </div>
      <p className="mt-3 text-center text-[11px] text-charcoal/40">Powered by Stripe &middot; coming soon</p>
    </DialogShell>
  )
}
