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
            Create and export palettes for free. Preview 15 designs, then unlock the full workspace.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-3xl gap-4 md:grid-cols-2">
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
              <Feat>Unlimited palette generation and editing</Feat>
              <Feat>Randomise, lock, add and remove colours</Feat>
              <Feat>Copy HEX, RGB and HSL</Feat>
              <Feat>Download your palette</Feat>
              <Feat>15 preview uses across websites, apps and components</Feat>
            </ul>
            <a
              href="/app"
              onClick={nav("/app")}
              className="mt-auto inline-flex items-center justify-center rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13.5px] font-semibold text-charcoal transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
            >
              Open Palette Preview
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
                <span className="text-[36px] font-bold" style={{ fontFamily: "var(--font-display)" }}>$9.99</span>
                <span className="text-[14px] font-semibold text-charcoal/60">USD / month</span>
              </p>
              <p className="mt-1 text-[13px] text-charcoal/55">Unlimited previews and advanced tools.</p>
            </div>
            <ul className="flex flex-col gap-2 text-[14px] text-charcoal/85">
              <Feat><b>Unlimited previews</b></Feat>
              <Feat>Every website, mobile app and component preview</Feat>
              <Feat>All button styles (Flat, 3D, Elevated, Outline, Glass, Gradient)</Feat>
              <Feat>Full Edit Mode with custom colour roles</Feat>
              <Feat>Company logo and app icon upload</Feat>
              <Feat>Advanced accessibility and export tools</Feat>
              <Feat>Full Screen Preview</Feat>
            </ul>
            <a
              href="/app"
              onClick={nav("/app")}
              className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
              style={{ background: BRAND.brand }}
            >
              Open Palette Preview
            </a>
            <p className="text-center text-[11px] text-charcoal/45">
              Accounts and payments coming soon.
            </p>
          </div>
        </div>

        <p className="text-center text-[13px] text-charcoal/55">
          Not sure yet? <a href="/help" onClick={nav("/help")} className="font-semibold underline">See how Palette Preview works</a>.
        </p>
      </main>
      <PublicFooter />
    </div>
  )
}

function Feat({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden style={{ color: BRAND.brand }}>✓</span>
      <span>{children}</span>
    </li>
  )
}
