import { BRAND } from "../lib/color"
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
            Your first design is free to generate, edit, and preview. Export it for a one-time fee, then go Pro for unlimited access.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-3">
          {/* Free */}
          <div className="flex flex-col gap-4 rounded-2xl border border-softgrey bg-white p-6">
            <div>
              <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Free</h2>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-[36px] font-bold" style={{ fontFamily: "var(--font-display)" }}>$0</span>
              </p>
              <p className="mt-1 text-[13px] text-charcoal/55">A useful palette tool, not a trial.</p>
            </div>
            <ul className="flex flex-col gap-2 text-[14px] text-charcoal/75">
              <Feat>Generate your first full design</Feat>
              <Feat>Unlimited palette editing and randomisation</Feat>
              <Feat>Copy HEX, RGB and HSL values</Feat>
              <Feat>Unlimited template previews (first design)</Feat>
              <Feat>Quick Design access</Feat>
            </ul>
            <a
              href="/app"
              onClick={nav("/app")}
              className="mt-auto inline-flex items-center justify-center rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13.5px] font-semibold text-charcoal transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
            >
              Open HueSet
            </a>
          </div>

          {/* First Export */}
          <div className="flex flex-col gap-4 rounded-2xl border border-softgrey bg-white p-6">
            <div>
              <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>First Export</h2>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-[36px] font-bold" style={{ fontFamily: "var(--font-display)" }}>$0.99</span>
                <span className="text-[14px] font-semibold text-charcoal/60">USD &middot; one-time</span>
              </p>
              <p className="mt-1 text-[13px] text-charcoal/55">Export your first design, no subscription.</p>
            </div>
            <ul className="flex flex-col gap-2 text-[14px] text-charcoal/75">
              <Feat>Download palette (HEX, RGB, HSL)</Feat>
              <Feat>Visual swatch sheets (PNG, JPEG, SVG)</Feat>
              <Feat>Save a reopenable project file</Feat>
              <Feat>Unlocks export for your first design only</Feat>
              <Feat>Does not subscribe you to Pro</Feat>
            </ul>
            <a
              href="/app"
              onClick={nav("/app")}
              className="mt-auto inline-flex items-center justify-center rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13.5px] font-semibold text-charcoal transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
            >
              Start designing
            </a>
          </div>

          {/* Pro */}
          <div
            className="relative flex flex-col gap-4 rounded-2xl border-2 bg-white p-6"
            style={{ borderColor: BRAND.brand, boxShadow: `0 12px 34px ${BRAND.brand}25` }}
          >
            <span
              className="absolute right-5 top-5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ background: BRAND.brand }}
            >
              Recommended
            </span>
            <div>
              <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Pro</h2>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-[36px] font-bold" style={{ fontFamily: "var(--font-display)" }}>$14.99</span>
                <span className="text-[14px] font-semibold text-charcoal/60">USD / month &middot; recurring</span>
              </p>
              <p className="mt-1 text-[13px] text-charcoal/55">Unlimited access and advanced tools.</p>
            </div>
            <ul className="flex flex-col gap-2 text-[14px] text-charcoal/85">
              <Feat><b>Unlimited Generate Design and Quick Design</b></Feat>
              <Feat>Unlimited exports (CSS, JSON, design tokens, project files)</Feat>
              <Feat>Typography export</Feat>
              <Feat>Saved projects and all editing tools</Feat>
              <Feat>Premium and future templates</Feat>
              <Feat>Second Opinion (accessibility and contrast analysis)</Feat>
              <Feat>Company logo and app icon upload</Feat>
              <Feat>Full Screen Preview</Feat>
              <Feat>All future Pro features</Feat>
            </ul>
            <a
              href="/app"
              onClick={nav("/app")}
              className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
              style={{ background: BRAND.brand }}
            >
              Open HueSet
            </a>
            <p className="text-center text-[11px] text-charcoal/45">
              Accounts and payments coming soon.
            </p>
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
      <span aria-hidden style={{ color: BRAND.brand }}>&#10003;</span>
      <span>{children}</span>
    </li>
  )
}
