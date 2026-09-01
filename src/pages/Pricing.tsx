import { BRAND } from "../lib/color"
import { buildNotifyMeMailto } from "../lib/contactSupport"
import { FEATURE_LABELS, PAYMENTS_ENABLED, PLAN_FEATURES, PRICING } from "../lib/entitlement"
import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Pricing() {
  const nav = useNav()

  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-14 sm:py-20">
        <div className="text-center">
          <h1 className="text-[32px] font-bold sm:text-[46px]" style={{ fontFamily: "var(--font-display)" }}>
            Simple pricing
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-charcoal/65">
            Your first design is free to generate, edit, and preview. Export and Pro are clearly labelled below.
          </p>
          {!PAYMENTS_ENABLED && (
            <p className="mx-auto mt-2 max-w-xl rounded-lg bg-white px-4 py-2 text-[13px] text-charcoal/65 ring-1 ring-softgrey">
              <b>Early access:</b> checkout is not live yet. Planned prices are shown for transparency — nothing is billed until payments launch.
            </p>
          )}
        </div>

        <div className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-2xl border border-softgrey bg-white p-6">
            <div>
              <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Free</h2>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-[36px] font-bold" style={{ fontFamily: "var(--font-display)" }}>$0</span>
              </p>
              <p className="mt-1 text-[13px] text-charcoal/55">Available now during early access.</p>
            </div>
            <ul className="flex flex-col gap-2 text-[14px] text-charcoal/75">
              {PLAN_FEATURES.free.map((id) => (
                <Feat key={id}>{FEATURE_LABELS[id]}</Feat>
              ))}
            </ul>
            <a
              href="/app"
              onClick={nav("/app")}
              className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13.5px] font-semibold text-charcoal transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
            >
              Open HueSet
            </a>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-softgrey bg-white p-6">
            <div>
              <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>First Export</h2>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-[36px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{PRICING.firstExport.label}</span>
                <span className="text-[14px] font-semibold text-charcoal/60">USD &middot; one-time{!PAYMENTS_ENABLED ? " · planned" : ""}</span>
              </p>
              <p className="mt-1 text-[13px] text-charcoal/55">
                {PAYMENTS_ENABLED ? "Export your first design, no subscription." : "Planned one-time export unlock when checkout launches."}
              </p>
            </div>
            <ul className="flex flex-col gap-2 text-[14px] text-charcoal/75">
              <Feat>Download palette (HEX, RGB, HSL)</Feat>
              <Feat>Visual swatch sheets (PNG, JPEG, SVG)</Feat>
              <Feat>Save a reopenable project file</Feat>
              <Feat>Unlocks export for your first design only</Feat>
              <Feat>Does not subscribe you to Pro</Feat>
            </ul>
            {PAYMENTS_ENABLED ? (
              <a
                href="/app"
                onClick={nav("/app")}
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13.5px] font-semibold text-charcoal transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
              >
                Start designing
              </a>
            ) : (
              <a
                href={buildNotifyMeMailto("export")}
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13.5px] font-semibold text-charcoal transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
              >
                Notify me
              </a>
            )}
          </div>

          <div
            className="relative flex flex-col gap-4 rounded-2xl border-2 bg-white p-6"
            style={{ borderColor: BRAND.cta, boxShadow: `0 12px 34px ${BRAND.cta}25` }}
          >
            <span
              className="absolute right-5 top-5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ background: BRAND.cta }}
            >
              Recommended
            </span>
            <div>
              <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Pro</h2>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-[36px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{PRICING.pro.label}</span>
                <span className="text-[14px] font-semibold text-charcoal/60">USD / month{!PAYMENTS_ENABLED ? " · planned" : " · recurring"}</span>
              </p>
              <p className="mt-1 text-[13px] text-charcoal/55">
                {PAYMENTS_ENABLED ? "Unlimited access and advanced tools." : "Planned subscription when checkout launches."}
              </p>
            </div>
            <ul className="flex flex-col gap-2 text-[14px] text-charcoal/85">
              {PLAN_FEATURES.pro.map((id) => (
                <Feat key={id}>{FEATURE_LABELS[id]}</Feat>
              ))}
            </ul>
            {PAYMENTS_ENABLED ? (
              <a
                href="/app"
                onClick={nav("/app")}
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                style={{ background: BRAND.cta }}
              >
                Open HueSet
              </a>
            ) : (
              <a
                href={buildNotifyMeMailto("pro")}
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                style={{ background: BRAND.cta }}
              >
                Notify me
              </a>
            )}
          </div>
        </div>

        <p className="text-center text-[13px] text-charcoal/55">
          Not sure yet? <a href="/help" onClick={nav("/help")} className="font-semibold underline">See how HueSet works</a>.
        </p>
      </main>
      <PublicFooter />
    </div>
  )
}

function Feat({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden style={{ color: BRAND.cta }}>&#10003;</span>
      <span>{children}</span>
    </li>
  )
}
