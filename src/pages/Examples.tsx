import { useState } from "react"
import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

const BRAND_INK = "#0A6288"

type ExamplePalette = {
  id: string
  name: string
  description: string
  category: "website" | "app" | "component"
  colours: { hex: string; role: string }[]
}

const EXAMPLES: ExamplePalette[] = [
  {
    id: "ocean-saas",
    name: "Ocean SaaS",
    description: "A calm, professional palette for software dashboards and B2B landing pages.",
    category: "website",
    colours: [
      { hex: "#F7F9FC", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#0B7BAA", role: "Primary" },
      { hex: "#1A2332", role: "Heading" },
      { hex: "#5A6978", role: "Body" },
      { hex: "#E2E8F0", role: "Border" },
    ],
  },
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    description: "Rich, warm tones for content-heavy sites, blogs, and magazine layouts.",
    category: "website",
    colours: [
      { hex: "#FDF8F3", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#C4572A", role: "Primary" },
      { hex: "#2C1810", role: "Heading" },
      { hex: "#6B5244", role: "Body" },
      { hex: "#E8DDD4", role: "Border" },
    ],
  },
  {
    id: "mint-ecommerce",
    name: "Mint Commerce",
    description: "Fresh, trustworthy colours for e-commerce product pages and checkout flows.",
    category: "website",
    colours: [
      { hex: "#F4FAF7", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#0D8A5E", role: "Primary" },
      { hex: "#1B2E28", role: "Heading" },
      { hex: "#4A6B5F", role: "Body" },
      { hex: "#D4E5DD", role: "Border" },
    ],
  },
  {
    id: "dark-dashboard",
    name: "Dark Dashboard",
    description: "A dark theme for analytics dashboards, dev tools, and monitoring interfaces.",
    category: "app",
    colours: [
      { hex: "#0F1419", role: "Background" },
      { hex: "#1A2332", role: "Surface" },
      { hex: "#3B9EDB", role: "Primary" },
      { hex: "#E8EDF2", role: "Heading" },
      { hex: "#8899AA", role: "Body" },
      { hex: "#2A3544", role: "Border" },
    ],
  },
  {
    id: "coral-wellness",
    name: "Coral Wellness",
    description: "Soft, inviting colours for health apps, fitness trackers, and wellbeing platforms.",
    category: "app",
    colours: [
      { hex: "#FFF5F3", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#E06B52", role: "Primary" },
      { hex: "#2D1F1A", role: "Heading" },
      { hex: "#7A5E55", role: "Body" },
      { hex: "#F0DDD8", role: "Border" },
    ],
  },
  {
    id: "indigo-productivity",
    name: "Indigo Productivity",
    description: "Focused, distraction-free colours for task managers, notes, and productivity tools.",
    category: "app",
    colours: [
      { hex: "#F5F3FF", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#5B4FC7", role: "Primary" },
      { hex: "#1E1935", role: "Heading" },
      { hex: "#5C5680", role: "Body" },
      { hex: "#DDD8F0", role: "Border" },
    ],
  },
  {
    id: "slate-components",
    name: "Slate Neutral",
    description: "A versatile neutral set for buttons, forms, cards, and navigation components.",
    category: "component",
    colours: [
      { hex: "#F8FAFC", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#334155", role: "Primary" },
      { hex: "#0F172A", role: "Heading" },
      { hex: "#64748B", role: "Body" },
      { hex: "#E2E8F0", role: "Border" },
    ],
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    description: "Bold, expressive colours for creative portfolios, landing heroes, and marketing components.",
    category: "component",
    colours: [
      { hex: "#FFFAF5", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#E25822", role: "Primary" },
      { hex: "#1C0F05", role: "Heading" },
      { hex: "#7A5438", role: "Body" },
      { hex: "#F0D9C8", role: "Border" },
    ],
  },
  {
    id: "forest-components",
    name: "Forest UI",
    description: "Earthy greens and warm greys for nature-inspired interfaces and environmental dashboards.",
    category: "component",
    colours: [
      { hex: "#F5F7F4", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#3A7D44", role: "Primary" },
      { hex: "#1A2E1C", role: "Heading" },
      { hex: "#5A7060", role: "Body" },
      { hex: "#D5E0D7", role: "Border" },
    ],
  },
]

const CATEGORIES = [
  { id: "all" as const, label: "All" },
  { id: "website" as const, label: "Websites" },
  { id: "app" as const, label: "Apps" },
  { id: "component" as const, label: "Components" },
]

export default function Examples() {
  const nav = useNav()
  const [filter, setFilter] = useState<"all" | "website" | "app" | "component">("all")

  const filtered = filter === "all" ? EXAMPLES : EXAMPLES.filter((e) => e.category === filter)

  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-14 sm:py-20">
        {/* Hero */}
        <div>
          <h1
            className="text-[32px] font-bold text-charcoal sm:text-[42px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Examples
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-charcoal/65">
            Colour palettes designed for real interfaces. Browse them for inspiration,
            then open Quick Design to build your own.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by category">
          {CATEGORIES.map((cat) => {
            const on = filter === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setFilter(cat.id)}
                className="min-h-11 rounded-lg border px-4 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                style={
                  on
                    ? { background: BRAND_INK, color: "#fff", borderColor: BRAND_INK }
                    : { background: "#fff", color: BRAND.charcoal, borderColor: BRAND.softgrey }
                }
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Gallery grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((example) => (
            <ExampleCard key={example.id} example={example} />
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-softgrey bg-white px-6 py-8 text-center">
          <h2
            className="text-[20px] font-bold text-charcoal sm:text-[24px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Build your own
          </h2>
          <p className="max-w-md text-[15px] text-charcoal/60">
            These examples are starting points. Open Quick Design to create a palette that fits your project.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/quick-design"
              onClick={nav("/quick-design")}
              className="inline-flex min-h-11 items-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
              style={{ background: "#0A6288" }}
            >
              Open Quick Design
            </a>
            <a
              href="/learn"
              onClick={nav("/learn")}
              className="inline-flex min-h-11 items-center rounded-lg border border-softgrey bg-white px-5 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
            >
              Learn about colour
            </a>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}

/* ---------- Card with mini-preview ---------- */

function ExampleCard({ example }: { example: ExamplePalette }) {
  const bg = example.colours.find((c) => c.role === "Background")?.hex ?? "#FFFFFF"
  const surface = example.colours.find((c) => c.role === "Surface")?.hex ?? "#FFFFFF"
  const primary = example.colours.find((c) => c.role === "Primary")?.hex ?? BRAND.cta
  const heading = example.colours.find((c) => c.role === "Heading")?.hex ?? "#000000"
  const body = example.colours.find((c) => c.role === "Body")?.hex ?? "#666666"
  const border = example.colours.find((c) => c.role === "Border")?.hex ?? "#E0E0E0"

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-softgrey bg-white">
      {/* Mini preview */}
      <div
        className="relative flex flex-col gap-2 px-4 pb-3 pt-4"
        style={{ background: bg }}
        aria-hidden
      >
        {/* Mini card */}
        <div
          className="rounded-lg px-3 py-2.5"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          <div
            className="h-2 w-16 rounded-full"
            style={{ background: heading }}
          />
          <div
            className="mt-1.5 h-1.5 w-24 rounded-full"
            style={{ background: body, opacity: 0.6 }}
          />
          <div
            className="mt-1.5 h-1.5 w-20 rounded-full"
            style={{ background: body, opacity: 0.4 }}
          />
        </div>
        {/* Mini button row */}
        <div className="flex gap-2">
          <div
            className="h-6 w-16 rounded-md"
            style={{ background: primary }}
          />
          <div
            className="h-6 w-14 rounded-md"
            style={{ background: surface, border: `1px solid ${border}` }}
          />
        </div>
      </div>

      {/* Info + swatches */}
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/40">
            {example.category}
          </span>
          <h3
            className="mt-0.5 text-[16px] font-bold text-charcoal"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {example.name}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-charcoal/60">
            {example.description}
          </p>
        </div>

        {/* Colour swatches */}
        <div className="flex flex-wrap gap-1.5">
          {example.colours.map((c) => (
            <div
              key={c.role}
              className="group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-black/8"
              style={{ background: c.hex }}
              title={`${c.role}: ${c.hex}`}
            >
              <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-charcoal/90 px-1.5 py-0.5 text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {c.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
