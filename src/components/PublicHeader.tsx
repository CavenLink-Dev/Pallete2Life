import { useState } from "react"
import { BRAND } from "../lib/color"
import { useNav, useRoute, type Route } from "../lib/router"

const NAV: { to: Route; label: string }[] = [
  { to: "/builder", label: "Palette Generator" },
  { to: "/pricing", label: "Pricing" },
  { to: "/help", label: "Help" },
]

type Props = {
  /** true → header is used inside the Builder (compact, no wordmark subtitle) */
  compact?: boolean
  /** slot rendered on the right; usually Builder actions (Brand / Edit / Full screen) */
  rightSlot?: React.ReactNode
}

/**
 * Shared header used on every page. The logo/name on the left is always clickable and
 * returns the user to the homepage. Navigation names/positions never change.
 */
export default function PublicHeader({ compact, rightSlot }: Props) {
  const [route] = useRoute()
  const nav = useNav()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative flex shrink-0 items-center justify-between gap-2 border-b border-softgrey/70 bg-white/90 px-3 py-1.5 backdrop-blur sm:px-5">
      <a
        href="/"
        onClick={nav("/")}
        className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
        aria-label="Palette Preview — home"
      >
        <img
          src="/app-icon-64.png"
          alt=""
          width={compact ? 26 : 28}
          height={compact ? 26 : 28}
          className={compact ? "h-[26px] w-[26px] rounded-md" : "h-7 w-7 rounded-md"}
        />
        <span className="text-[13px] font-bold tracking-tight sm:text-[14px]" style={{ fontFamily: "var(--font-display)" }}>
          Palette <span style={{ color: BRAND.brand }}>Preview</span>
        </span>
      </a>

      {/* Desktop nav */}
      {!compact && (
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => {
            const on = route === n.to
            return (
              <a
                key={n.to}
                href={n.to}
                onClick={nav(n.to)}
                className="rounded-lg px-3 py-1.5 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
                style={on ? { color: BRAND.brandDark, background: "rgba(32,185,250,0.10)" } : { color: BRAND.medgrey }}
                aria-current={on ? "page" : undefined}
              >
                {n.label}
              </a>
            )
          })}
        </nav>
      )}

      {/* Right slot (either compact builder controls, or CTA on public pages) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {compact ? (
          rightSlot
        ) : (
          <>
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="rounded-lg border border-softgrey bg-white px-2.5 py-1.5 text-[12px] font-semibold text-charcoal/75 md:hidden"
            >
              Menu
            </button>
            <a
              href="/builder"
              onClick={nav("/builder")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#20B9FA]"
              style={{ background: BRAND.brand }}
            >
              Try for Free
            </a>
          </>
        )}
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && !compact && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-full z-30 border-b border-softgrey bg-white shadow-md md:hidden"
        >
          <nav className="flex flex-col gap-0.5 p-2" aria-label="Primary mobile">
            {NAV.map((n) => (
              <a
                key={n.to}
                href={n.to}
                onClick={(e) => {
                  nav(n.to)(e)
                  setMenuOpen(false)
                }}
                className="rounded-md px-3 py-2 text-sm font-semibold text-charcoal/80 hover:bg-offwhite"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
