import { BRAND } from "../lib/color"
import DialogShell from "./DialogShell"

type Props = {
  open: boolean
  onPay: () => void
  onLater: () => void
}

export default function ExportPaywallOverlay({ open, onPay, onLater }: Props) {
  return (
    <DialogShell open={open} onClose={onLater} labelledBy="export-paywall-title" panelClassName="max-w-[420px]" zClassName="z-[60]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.cta }}>
        Export your design
      </p>
      <h2 id="export-paywall-title" className="mt-1 text-[26px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
        Unlock export
      </h2>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-[28px] font-bold" style={{ fontFamily: "var(--font-display)" }}>$0.99</span>
        <span className="text-[14px] font-semibold text-charcoal/60">USD · one-time</span>
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-charcoal/70">
        This is a <b>one-time payment</b> that unlocks export for your first design. It does not start a subscription or sign you up for HueSet Pro.
      </p>

      <ul className="mt-5 flex flex-col gap-2 text-[13.5px] text-charcoal/75">
        {[
          "Download palette colours (HEX, RGB, HSL)",
          "Export visual swatch sheets (PNG, JPEG, SVG)",
          "Save a reopenable project file",
        ].map((f) => (
          <li key={f} className="flex gap-2">
            <span aria-hidden style={{ color: BRAND.cta }}>&#10003;</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-lg bg-offwhite px-3 py-2 text-[12px] text-charcoal/55">
        Want unlimited exports and the full toolkit? <b>HueSet Pro</b> is a separate subscription at <b>$14.99 USD/month</b>.
      </p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onLater}
          className="min-h-11 rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13px] font-semibold text-charcoal/70 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
        >
          Keep Editing
        </button>
        <button
          type="button"
          data-dialog-initial-focus
          onClick={onPay}
          className="min-h-11 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
          style={{ background: BRAND.cta }}
        >
          Unlock Export &mdash; $0.99
        </button>
      </div>
      <p className="mt-3 text-center text-[11px] text-charcoal/40">Powered by Stripe &middot; coming soon</p>
    </DialogShell>
  )
}
