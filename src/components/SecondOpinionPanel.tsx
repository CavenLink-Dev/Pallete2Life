import { BRAND } from "../lib/color"
import { buildNotifyMeMailto } from "../lib/contactSupport"
import { PAYMENTS_ENABLED, PRICING } from "../lib/entitlement"
import { ACCESSIBILITY_STATUS_LABEL, accessibilityCheckLabel, type AccessibilityCheck } from "../lib/accessibility"
import DialogShell from "./DialogShell"

type Props = {
  open: boolean
  onClose: () => void
  checks: AccessibilityCheck[]
  unlocked: boolean
  onUpgrade: () => void
}

export default function SecondOpinionPanel({ open, onClose, checks, unlocked, onUpgrade }: Props) {
  const poor = checks.filter((c) => c.status === "poor")
  const review = checks.filter((c) => c.status === "review")
  const good = checks.filter((c) => c.status === "good")

  return (
    <DialogShell open={open} onClose={onClose} labelledBy="second-opinion-title" panelClassName="max-w-[480px] p-0 overflow-hidden" zClassName="z-[70]">
      <header className="flex items-start justify-between gap-3 border-b border-softgrey px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.cta }}>Pro feature</p>
          <h2 id="second-opinion-title" className="text-[22px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>Second Opinion</h2>
          <p className="mt-1 text-[12px] text-charcoal/55">Accessibility and contrast analysis for your palette.</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-softgrey text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta" aria-label="Close Second Opinion" title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {!unlocked ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-offwhite">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BRAND.cta} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div>
              <p className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Unlock Second Opinion with Pro</p>
              <p className="mt-2 text-[13px] leading-relaxed text-charcoal/60">
                Get detailed WCAG contrast analysis, focus visibility checks, and touch target recommendations for every palette you create.
              </p>
            </div>
            {PAYMENTS_ENABLED ? (
              <button
                type="button"
                data-dialog-initial-focus
                onClick={onUpgrade}
                className="min-h-11 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                style={{ background: BRAND.cta }}
              >
                Upgrade to Pro · {PRICING.pro.label}/mo
              </button>
            ) : (
              <a
                href={buildNotifyMeMailto("pro")}
                data-dialog-initial-focus
                className="inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                style={{ background: BRAND.cta }}
              >
                Notify me
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {poor.length > 0 && <CheckGroup label="Needs attention" checks={poor} />}
            {review.length > 0 && <CheckGroup label="Needs review" checks={review} />}
            {good.length > 0 && <CheckGroup label="Passing" checks={good} />}
            {checks.length === 0 && <p className="py-4 text-center text-[13px] text-charcoal/50">No checks available for this palette.</p>}
          </div>
        )}
      </div>
    </DialogShell>
  )
}

function CheckGroup({ label, checks }: { label: string; checks: AccessibilityCheck[] }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase text-charcoal/45">{label}</p>
      <ul className="grid gap-2">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`rounded-lg border px-3 py-2.5 ${
              check.status === "good" ? "border-[#b7e4ca] bg-[#ecfdf3]"
              : check.status === "review" ? "border-[#fed7aa] bg-[#fff7ed]"
              : "border-[#fecaca] bg-[#fef2f2]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] font-semibold text-[#374151]">{check.label}</span>
              <span className={`text-[10px] font-bold ${
                check.status === "good" ? "text-[#067647]"
                : check.status === "review" ? "text-[#9a3412]"
                : "text-[#b42318]"
              }`}>{accessibilityCheckLabel(check)}</span>
            </div>
            <p className="mt-0.5 text-[10.5px] text-[#6b7280]">
              {check.value}{check.status !== "good" ? ` \u00b7 ${check.suggestion}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
