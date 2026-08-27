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
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 pb-16 pt-14 sm:pt-20 lg:flex-row lg:items-center lg:gap-12 lg:pb-24 lg:pt-24">
          <div className="flex-1">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-softgrey bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-charcoal/60"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND.brand }} />
              No account needed to try
            </span>
            <h1
              className="mt-5 text-[38px] font-bold leading-[1.05] tracking-tight sm:text-[52px] lg:text-[60px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              See your colours on a <span style={{ color: BRAND.brand }}>real</span> website, app and buttons.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-charcoal/65 sm:text-[17px]">
              Pallet Preview lets you build a colour palette and instantly test it on landing pages, mobile apps, buttons, cards and forms. Change a colour and every design updates the moment you touch it — no design experience needed.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/builder"
                onClick={nav("/builder")}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[#20B9FA]/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
                style={{ background: BRAND.brand }}
              >
                Try for Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="/pricing"
                onClick={nav("/pricing")}
                className="inline-flex items-center gap-2 rounded-xl border-2 bg-white px-5 py-3 text-[15px] font-semibold transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
                style={{ borderColor: BRAND.brand, color: BRAND.brandDark }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                Unlock Pro
              </a>
            </div>
            <p className="mt-4 text-[13px] text-charcoal/45">5 free previews · no card needed to start · your palette stays on your device.</p>
          </div>

          {/* Hero mock */}
          <div className="w-full max-w-xl flex-1 lg:max-w-none">
            <HeroMock />
          </div>
        </section>

        {/* Steps */}
        <section className="border-y border-softgrey bg-white px-6 py-14 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
            <Step n={1} title="Choose your colours" body="Pick a palette or randomise one. Lock the colours you love and keep exploring the rest." />
            <Step n={2} title="Choose what to preview" body="Landing pages, mobile app screens, buttons, cards, forms — one click swaps the whole preview." />
            <Step n={3} title="Click elements to customise" body="Turn on Edit Mode and click any button, heading or background to reassign its colour." />
          </div>
        </section>

        {/* What you can preview */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <h2 className="text-[26px] font-bold sm:text-[32px]" style={{ fontFamily: "var(--font-display)" }}>
            One palette, tested across everything you build
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-charcoal/65">
            Real, interactive previews of the surfaces your users actually see — not swatches on a card.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Tile label="Websites" desc="Landing pages, SaaS, e-commerce, sign-in, paywall." />
            <Tile label="Mobile apps" desc="Dashboards, feeds, profile screens, sign-up flows." />
            <Tile label="Buttons" desc="Flat, 3D, Elevated, Outline, Glass and Gradient styles." />
            <Tile label="Cards & lists" desc="Product tiles, pricing tables, invoice rows." />
            <Tile label="Forms" desc="Inputs, selects, validation and empty states." />
            <Tile label="Navigation & type" desc="Menus, tab bars and readable text hierarchies." />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-softgrey bg-white px-6 py-14 text-center sm:py-16">
          <h2 className="text-[26px] font-bold sm:text-[32px]" style={{ fontFamily: "var(--font-display)" }}>
            Ready to see your colours in action?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-charcoal/65">
            No account. No install. Just paint your ideas and watch them come to life.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/builder"
              onClick={nav("/builder")}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[#20B9FA]/25 transition-transform hover:-translate-y-0.5"
              style={{ background: BRAND.brand }}
            >
              Try for Free
            </a>
            <a
              href="/pricing"
              onClick={nav("/pricing")}
              className="inline-flex items-center gap-2 rounded-xl border-2 bg-white px-5 py-3 text-[15px] font-semibold transition-colors hover:bg-offwhite"
              style={{ borderColor: BRAND.brand, color: BRAND.brandDark }}
            >
              Unlock Pro
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
          Design with confidence.
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
