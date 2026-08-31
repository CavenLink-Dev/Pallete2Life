import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Home() {
  const nav = useNav()
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-20 sm:pt-28 lg:flex-row lg:items-center lg:gap-16 lg:pb-28 lg:pt-32">
          <div className="flex-1">
            <h1
              className="text-[38px] font-bold leading-[1.05] tracking-tight sm:text-[52px] lg:text-[60px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Preview your website or app style before you build.
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-charcoal/65 sm:text-[17px]">
              Explore colour, typography and interface direction on real templates, then carry clearer visual decisions into Figma or development.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="/app"
                onClick={nav("/app")}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[#20B9FA]/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
                style={{ background: BRAND.brand }}
              >
                Open HueSet
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Hero mock */}
          <div className="w-full max-w-xl flex-1 lg:max-w-none">
            <HeroMock />
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-softgrey bg-white px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
            <Step n={1} title="Set your visual direction" body="Choose colour roles and shape the essential style decisions for your product." />
            <Step n={2} title="Preview real interfaces" body="See that direction across website pages, app screens and reusable UI components." />
            <Step n={3} title="Move forward clearly" body="Export practical values and tokens when you are ready to continue in Figma or code." />
          </div>
        </section>

        {/* What you can preview */}
        <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <h2 className="text-[26px] font-bold sm:text-[32px]" style={{ fontFamily: "var(--font-display)" }}>
            Make visual decisions in context
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-charcoal/65">
            Test how your style behaves across the surfaces people will actually use before committing to the build.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Tile label="Websites" desc="Landing pages, SaaS, e-commerce, sign-in, paywall." />
            <Tile label="Mobile apps" desc="Dashboards, feeds, profile screens, sign-up flows." />
            <Tile label="Buttons" desc="Flat, 3D, Elevated, Outline, Glass and Gradient styles." />
            <Tile label="Navigation" desc="Top bars, sidebars and mobile tab bars." />
            <Tile label="Status states" desc="Success, warning, error, empty and loading treatments." />
            <Tile label="Forms" desc="Inputs, selects, validation and focus states." />
            <Tile label="Charts & data" desc="Bars, legends, counters and dashboard summaries." />
            <Tile label="Typography" desc="Readable heading, body, caption and label systems." />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-softgrey bg-white px-6 py-20 text-center sm:py-24">
          <h2 className="text-[26px] font-bold sm:text-[32px]" style={{ fontFamily: "var(--font-display)" }}>
            See the direction before you commit to the build.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/app"
              onClick={nav("/app")}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[#20B9FA]/25 transition-transform hover:-translate-y-0.5"
              style={{ background: BRAND.brand }}
            >
              Open HueSet
            </a>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold text-white"
        style={{ background: BRAND.brand, fontFamily: "var(--font-display)" }}
        aria-hidden
      >
        {n}
      </span>
      <h3 className="text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      <p className="text-[14px] leading-relaxed text-charcoal/65">{body}</p>
    </div>
  )
}

function Tile({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-softgrey bg-offwhite p-5 transition-colors hover:border-charcoal/25">
      <p className="text-[15px] font-bold text-charcoal" style={{ fontFamily: "var(--font-display)" }}>{label}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-charcoal/60">{desc}</p>
    </div>
  )
}

function HeroMock() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-softgrey bg-charcoal shadow-2xl shadow-[#0E1821]/25">
      {/* fake browser bar */}
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
      </div>
      {/* content */}
      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-6 pb-16 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: BRAND.brand }}>Live preview</span>
        <h4 className="text-[24px] font-bold leading-tight text-white sm:text-[32px]" style={{ fontFamily: "var(--font-display)" }}>
          See your style in context.
        </h4>
        <div className="flex gap-2">
          <button className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-lg" style={{ background: BRAND.brand }}>
            Try it
          </button>
          <button className="rounded-lg border border-white/25 px-4 py-2 text-[13px] font-semibold text-white/85">
            Learn more
          </button>
        </div>
      </div>
      {/* palette bar */}
      <div className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-white/10 bg-charcoal/70 px-3 py-2 backdrop-blur">
        {["#20B9FA", "#0E1821", "#F8F8F6", "#FFB86B", "#F26D6D"].map((c, i) => (
          <span
            key={i}
            className="h-6 flex-1 rounded-md"
            style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)" }}
          />
        ))}
      </div>
    </div>
  )
}
