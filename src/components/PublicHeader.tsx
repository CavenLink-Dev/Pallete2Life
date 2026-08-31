import { useState } from "react"
import { BRAND } from "../lib/color"
import { useNav, useRoute, type Route } from "../lib/router"

const NAV: { to: Route; label: string }[] = [
  { to: "/app", label: "Open HueSet" },
  { to: "/live-changes", label: "Live Changes" },
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
    <header className="relative flex shrink-0 items-center justify-between gap-3 border-b border-softgrey/70 bg-white/90 px-3 py-2.5 backdrop-blur sm:px-5">
      <a
        href="/"
        onClick={nav("/")}
        className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
        aria-label="HueSet home"
      >
        <img
          src="/logo-64.png"
          alt=""
          width={compact ? 30 : 42}
          height={compact ? 30 : 42}
          className={compact ? "h-[30px] w-[30px] object-contain" : "h-[38px] w-[38px] object-contain sm:h-[42px] sm:w-[42px]"}
        />
        <span className={compact ? "text-[15px] font-bold" : "text-[20px] font-bold sm:text-[24px]"} style={{ fontFamily: "var(--font-display)" }}>
          Hue<span style={{ color: BRAND.brand }}>Set</span>
        </span>
      </a>

      {/* Desktop nav */}
      {!compact && (
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {NAV.map((n) => {
            const on = route === n.to
            return (
              <a
                key={n.to}
                href={n.to}
                onClick={nav(n.to)}
                className="rounded-lg px-2.5 py-2 text-[12.5px] font-semibold outline-none transition-colors hover:bg-offwhite hover:text-charcoal focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2 xl:px-3"
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
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              className="rounded-lg border border-softgrey bg-white px-2.5 py-2 text-[12px] font-semibold text-charcoal/75 transition-colors hover:border-charcoal/30 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] lg:hidden"
            >
              Menu
            </button>
            <a
              href="/pricing"
              onClick={nav("/pricing")}
              className="hidden items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-bold text-white shadow-md transition-[opacity,transform] hover:-translate-y-0.5 hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#20B9FA] sm:flex"
              style={{ background: BRAND.brandDark, boxShadow: `0 6px 18px ${BRAND.brand}30` }}
            >
              Go Pro +
            </a>
          </>
        )}
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && !compact && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-full z-30 border-b border-softgrey bg-white shadow-md lg:hidden"
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
            <a
              href="/pricing"
              onClick={(e) => {
                nav("/pricing")(e)
                setMenuOpen(false)
              }}
              className="mt-1 rounded-md px-3 py-2 text-sm font-bold text-white"
              style={{ background: BRAND.brandDark }}
            >
              Go Pro +
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
