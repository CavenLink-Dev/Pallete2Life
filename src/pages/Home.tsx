import type { MouseEventHandler } from "react"
import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

/* #LandingPage / - introduces the two Palette Preview workflows. */
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
              From palette to design system.
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-charcoal/65 sm:text-[17px]">
              Generate design easily with a palette, live preview, token tools, and a customization bar.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="/preview"
                onClick={nav("/preview")}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[#20B9FA]/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
                style={{ background: BRAND.brand }}
              >
                Generate Design System
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="/builder"
                onClick={nav("/builder")}
                className="inline-flex items-center gap-2 rounded-xl border-2 bg-white px-5 py-3 text-[15px] font-semibold transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
                style={{ borderColor: BRAND.brand, color: BRAND.brandDark }}
              >
                Quick Palette
              </a>
            </div>
          </div>

          {/* Hero mock */}
          <div className="w-full max-w-xl flex-1 lg:max-w-none">
            <HeroMock />
          </div>
        </section>

        {/* Two workflow paths */}
        <section className="border-y border-softgrey bg-white px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-[26px] font-bold sm:text-[32px]" style={{ fontFamily: "var(--font-display)" }}>
              Choose how you want to start
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] text-charcoal/65">
              Build a complete design direction or move straight into the palette tools you already know.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Path
                eyebrow="Guided workflow"
                title="Generate Design System"
                body="Turn your palette into a design direction with live previews, templates, and the foundation for reusable tokens and customization controls."
                href="/preview"
                onClick={nav("/preview")}
                action="Generate A Design"
                colours={[BRAND.brand, BRAND.charcoal, "#FFB86B"]}
              />
              <Path
                eyebrow="Fast colour tools"
                title="Quick Palette"
                body="Create, edit, randomise, lock, and export colours without opening the full design workflow."
                href="/builder"
                onClick={nav("/builder")}
                action="Open Quick Palette"
                colours={["#F26D6D", "#F8D56B", "#57C785"]}
              />
            </div>
          </div>
        </section>

        {/* What you can preview */}
        <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <h2 className="text-[26px] font-bold sm:text-[32px]" style={{ fontFamily: "var(--font-display)" }}>
            One palette, a practical design foundation
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-charcoal/65">
            See how the same colour roles behave across the surfaces that make up a real interface.
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
            Start with the path that fits your project.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/preview"
              onClick={nav("/preview")}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[#20B9FA]/25 transition-transform hover:-translate-y-0.5"
              style={{ background: BRAND.brand }}
            >
              Generate Design System
            </a>
            <a
              href="/builder"
              onClick={nav("/builder")}
              className="inline-flex items-center gap-2 rounded-xl border-2 bg-white px-5 py-3 text-[15px] font-semibold transition-colors hover:bg-offwhite"
              style={{ borderColor: BRAND.brand, color: BRAND.brandDark }}
            >
              Quick Palette
            </a>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

function Path({
  eyebrow,
  title,
  body,
  href,
  onClick,
  action,
  colours,
}: {
  eyebrow: string
  title: string
  body: string
  href: string
  onClick: MouseEventHandler<HTMLAnchorElement>
  action: string
  colours: string[]
}) {
  return (
    <div className="flex min-h-64 flex-col rounded-lg border border-softgrey bg-offwhite p-6">
      <div className="flex gap-2" aria-hidden>
        {colours.map((colour) => <span key={colour} className="h-8 w-8 rounded-md" style={{ background: colour }} />)}
      </div>
      <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-charcoal/50">{eyebrow}</p>
      <h3 className="mt-1 text-[20px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-charcoal/65">{body}</p>
      <a
        href={href}
        onClick={onClick}
        className="mt-auto inline-flex items-center gap-2 self-start pt-6 text-[14px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
        style={{ color: BRAND.brandDark }}
      >
        {action}
        <svg aria-hidden width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </a>
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
