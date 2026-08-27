import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Pricing() {
  const nav = useNav()
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 sm:py-20">
        <div>
          <h1 className="text-[32px] font-bold sm:text-[42px]" style={{ fontFamily: "var(--font-display)" }}>Simple, honest pricing</h1>
          <p className="mt-3 max-w-2xl text-[15px] text-charcoal/65">
            Pallet Preview is free while in beta. When paid tiers arrive, everything you can do today will still be free.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Plan
            title="Free"
            price="$0"
            note="forever · no card"
            featured
            features={[
              "Full colour palette editor with WCAG contrast checks",
              "All live previews (websites, mobile apps, components)",
              "Six button styles including 3D, Glass and Gradient",
              "Edit Mode to reassign colours element-by-element",
              "Upload your own logo and app icon",
              "Local browser saves — no account required",
            ]}
            cta={{ label: "Start Creating", to: "/builder" }}
            nav={nav}
          />
          <Plan
            title="Pro"
            price="Coming soon"
            note="lifetime option planned"
            features={[
              "Export palettes as CSS, SCSS, JSON, Tailwind",
              "Save unlimited named palettes to your account",
              "Custom font uploads",
              "Higher-resolution export of previews",
              "Priority support",
            ]}
          />
          <Plan
            title="Teams"
            price="Talk to us"
            note="for design systems teams"
            features={[
              "Shared team palettes and roles",
              "Design token sync (Figma, Tailwind, style-dictionary)",
              "Seat-based billing",
              "SSO / SAML on request",
            ]}
            cta={{ label: "Contact us", to: "/contact" }}
            nav={nav}
          />
        </div>

        <p className="text-[13px] text-charcoal/50">
          We'll never charge for something you already use for free today. If pricing ever changes, existing users are grandfathered.
        </p>
      </main>
      <PublicFooter />
    </div>
  )
}

function Plan({
  title,
  price,
  note,
  features,
  featured,
  cta,
  nav,
}: {
  title: string
  price: string
  note: string
  features: string[]
  featured?: boolean
  cta?: { label: string; to: "/builder" | "/contact" }
  nav?: ReturnType<typeof useNav>
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border bg-white p-5"
      style={{ borderColor: featured ? BRAND.brand : "#E7E9ED", boxShadow: featured ? `0 10px 26px ${BRAND.brand}25` : "none" }}
    >
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[19px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
          {featured && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: `${BRAND.brand}22`, color: BRAND.brandDark }}>
              Available now
            </span>
          )}
        </div>
        <p className="mt-1 text-[24px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{price}</p>
        <p className="text-[12px] text-charcoal/55">{note}</p>
      </div>
      <ul className="flex flex-col gap-2 text-[13.5px] text-charcoal/75">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span aria-hidden style={{ color: BRAND.brand }}>✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {cta && nav && (
        <a
          href={cta.to}
          onClick={nav(cta.to)}
          className="mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90"
          style={featured
            ? { background: BRAND.brand, color: "#fff" }
            : { background: "#fff", color: BRAND.charcoal, border: `1px solid ${BRAND.softgrey}` }}
        >
          {cta.label}
        </a>
      )}
    </div>
  )
}
