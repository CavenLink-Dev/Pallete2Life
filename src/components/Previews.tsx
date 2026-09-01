import { readableOn, shade, withAlpha, type Theme } from "../lib/color"
import { BrandLogo, BrandSymbol, Editable, PreviewButton, usePreview } from "./PreviewCtx"
import { forwardRef, lazy, Suspense, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"
import TemplatePreview, { type TemplatePreviewHandle } from "./TemplatePreview"
import { templateAssetById, templateGroups, type TemplateGroupKey, type TemplateLayout } from "../lib/templateAssets"
import { clampPreviewZoom, computeFitZoom, PREVIEW_FIT_INSET, PREVIEW_FIT_MAX_ZOOM, PREVIEW_FIT_MIN_ZOOM } from "../lib/previewFit"

/**
 * A failed dynamic import rejects inside Suspense, which React re-throws during
 * render. With no boundary that blanked the entire app, and this is the only
 * chunk /app loads — which is why "/app is blank" was reproducible on a stale
 * deploy while every other route still worked.
 *
 * One retry covers the transient network case. If it still fails (usually a
 * genuinely missing chunk after a redeploy), we resolve to an inline notice
 * rather than rejecting, so the workspace around the canvas stays usable.
 */
const BuiltInTemplatePreview = lazy(() =>
  import("./BuiltInTemplatePreview").catch(() =>
    new Promise((resolve) => setTimeout(resolve, 400))
      .then(() => import("./BuiltInTemplatePreview"))
      .catch((error) => {
        console.error("[HueSet] Template preview chunk failed to load:", error)
        return {
          default: () => (
            <div className="grid h-full min-h-96 place-items-center bg-white px-6 text-center">
              <div>
                <p className="text-sm font-semibold text-charcoal/70">This preview couldn't be loaded</p>
                <p className="mt-1 text-[12px] text-charcoal/45">
                  The app may have been updated. Reload the page to get the latest version.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-charcoal px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Reload
                </button>
              </div>
            </div>
          ),
        }
      }),
  ),
)

/* ------------------------------------------------------------------ */
/* shared primitives                                                   */
/* ------------------------------------------------------------------ */
const Dot = ({ c }: { c: string }) => <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />

/* Cross-platform SVG icons (replaces Apple-only SF Symbol glyphs) */
const ICON_PATHS: Record<string, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></>,
  activity: <path d="M4 12h3l2.5-6 4 12 2.5-6h4" />,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.5-3.5 4.2-5 7.5-5s6 1.5 7.5 5" /></>,
  create: <path d="M12 5v14M5 12h14" />,
  inbox: <path d="M3 13h5l1.5 3h5L16 13h5M3 13 5 5h14l2 8v6H3v-6Z" />,
  battery: <><rect x="2" y="8" width="17" height="8" rx="2" /><path d="M21.5 11v2" /><rect x="4" y="10" width="10" height="4" rx="1" fill="currentColor" stroke="none" /></>,
  wifi: <path d="M4 10.5a12 12 0 0 1 16 0M7 14a8 8 0 0 1 10 0M10.5 17.3a3.5 3.5 0 0 1 3 0M12 18.5h.01" />,
  signal: <path d="M5 18v-3M9.5 18v-6M14 18v-9M18.5 18V6" />,
}
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name] ?? ICON_PATHS.home}
    </svg>
  )
}
function Star({ c }: { c: string }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8Z" /></svg>
}
function Ghost({ theme, children }: { theme: Theme; children: ReactNode }) {
  return <span className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold" style={{ border: `1.5px solid ${theme.border}`, color: theme.ink, fontFamily: "var(--font-display)" }}>{children}</span>
}
function Field({ theme, label, value, underline }: { theme: Theme; label: string; value: string; underline?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold" style={{ color: theme.inkSoft }}>{label}</label>
      {underline ? <div className="border-b pb-2 text-sm" style={{ borderColor: theme.border }}>{value}</div>
        : <div className="rounded-xl border px-3.5 py-2.5 text-sm" style={{ borderColor: theme.border, background: theme.surface }}>{value}</div>}
    </div>
  )
}

/* ================================================================== */
/* WEBSITE                                                             */
/* ================================================================== */
function SiteNav({ theme }: { theme: Theme }) {
  return (
    <nav className="flex items-center justify-between border-b px-8 py-4" style={{ borderColor: theme.border, background: withAlpha(theme.paper, 0.9) }}>
      <BrandLogo color={theme.ink} size={17} />
      <div className="hidden items-center gap-7 text-sm md:flex">
        {["Product", "Solutions", "Pricing", "Docs"].map((t) => (
          <Editable key={t} id={`nav-${t}`} label={`Nav link · ${t}`} as="span" color={theme.inkSoft}>{t}</Editable>
        ))}
      </div>
      <PreviewButton id="nav-cta" label="Nav button" text="Sign up" size="sm" />
    </nav>
  )
}

export function WebsitePreview({ theme, tpl }: { theme: Theme; tpl: string }) {
  if (tpl === "saas-centered" || tpl === "saas-classic") {
    const centered = tpl === "saas-centered"
    return (
      <Editable id="bg" label="Background" prop="background" color={theme.paper} className="h-full w-full overflow-auto rounded-2xl" style={{ color: theme.ink }}>
        <SiteNav theme={theme} />
        <div className={"px-8 pb-10 pt-12 " + (centered ? "text-center" : "")}>
          <Editable id="caption" label="Eyebrow" as="span" color={theme.accent} className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: withAlpha(theme.accent, 0.12) }}>Trusted by 12,000 teams</Editable>
          <Editable id="heading" label="Heading" as="h1" color={theme.ink} className={"mt-4 text-[38px] font-bold leading-[1.05] tracking-tight " + (centered ? "mx-auto max-w-2xl" : "max-w-xl")} style={{ fontFamily: "var(--font-display)" }}>Analytics that actually ship.</Editable>
          <div className={"mt-5 flex gap-3 " + (centered ? "justify-center" : "")}><PreviewButton id="cta" text="Start free trial" /><Ghost theme={theme}>See docs</Ghost></div>
          <Editable id="card" label="Card" prop="background" color={theme.surface} className="mx-auto mt-10 max-w-3xl rounded-2xl border p-5 text-left" style={{ borderColor: theme.border, boxShadow: `0 20px 50px ${withAlpha(theme.ink, 0.12)}` }}>
            <div className="grid grid-cols-3 gap-3">
              {[["MRR", "$84.2k"], ["Users", "12,904"], ["Churn", "1.2%"]].map(([l, v]) => (
                <div key={l} className="rounded-xl p-3" style={{ background: theme.paper }}><p className="text-xs" style={{ color: theme.inkSoft }}>{l}</p><p className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{v}</p></div>
              ))}
            </div>
            <div className="mt-3 flex h-24 items-end gap-1.5 rounded-xl p-3" style={{ background: theme.paper }}>
              {[40, 65, 45, 80, 55, 95, 70, 88].map((h, i) => <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i % 2 ? theme.accent : withAlpha(theme.accent, 0.45) }} />)}
            </div>
          </Editable>
        </div>
      </Editable>
    )
  }

  if (tpl === "ecom-grid" || tpl === "ecom-featured") {
    const items = [["Aurora Lamp", "$120"], ["Linen Throw", "$68"], ["Ceramic Vase", "$42"], ["Oak Stool", "$155"]]
    return (
      <Editable id="bg" label="Background" prop="background" color={theme.paper} className="h-full w-full overflow-auto rounded-2xl" style={{ color: theme.ink }}>
        <SiteNav theme={theme} />
        {tpl === "ecom-featured" && (
          <div className="mx-8 mt-5 flex items-center justify-between overflow-hidden rounded-2xl p-6" style={{ background: `linear-gradient(120deg, ${theme.accent}, ${shade(theme.secondary, 0.1)})`, color: readableOn(theme.accent) }}>
            <div><p className="text-xs font-semibold uppercase tracking-widest opacity-80">Summer sale</p><Editable id="heading" label="Heading" as="p" color={readableOn(theme.accent)} className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Up to 40% off homeware</Editable></div>
            <PreviewButton id="cta" text="Shop now" size="sm" />
          </div>
        )}
        <div className="flex items-center gap-2 px-8 pt-5 text-xs" style={{ color: theme.inkSoft }}>
          {["All", "New", "Home", "Lighting", "Textiles"].map((c, i) => <span key={c} className="rounded-full px-3 py-1 font-medium" style={i === 0 ? { background: theme.accent, color: theme.onBrand } : { background: theme.surface }}>{c}</span>)}
        </div>
        <div className="grid grid-cols-2 gap-4 px-8 py-6 md:grid-cols-4">
          {items.map(([n, p], i) => (
            <Editable key={n} id={`card-${i}`} label={`Product card · ${n}`} prop="background" color={theme.paper} className="overflow-hidden rounded-2xl border" style={{ borderColor: theme.border }}>
              <div className="aspect-square" style={{ background: `linear-gradient(145deg, ${withAlpha(theme.accent, 0.2 + i * 0.06)}, ${withAlpha(theme.secondary, 0.14)})` }} />
              <div className="p-3"><p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{n}</p><div className="mt-2 flex items-center justify-between"><span className="text-sm font-bold">{p}</span><span className="rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ background: theme.accent, color: theme.onBrand }}>Add</span></div></div>
            </Editable>
          ))}
        </div>
      </Editable>
    )
  }

  if (tpl?.startsWith("signin")) {
    const split = tpl === "signin-split"
    const form = (
      <div className="w-full max-w-sm">
        <div className="mb-5"><BrandSymbol color={theme.accent} size={40} rounded={12} /></div>
        <Editable id="heading" label="Heading" as="h1" color={theme.ink} className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Welcome back</Editable>
        <Editable id="caption" label="Caption" as="p" color={theme.inkSoft} className="mt-1 text-sm">Sign in to your account.</Editable>
        <div className="mt-6 space-y-3"><Field theme={theme} label="Email" value="alex@studio.com" /><Field theme={theme} label="Password" value="••••••••••" /></div>
        <div className="mt-5"><PreviewButton id="cta" text="Sign in" /></div>
        <button className="mt-3 w-full rounded-xl border py-3 text-sm font-semibold" style={{ borderColor: theme.border, color: theme.ink }}>Continue with Google</button>
      </div>
    )
    if (split) return (
      <Editable id="bg" label="Background" prop="background" color={theme.paper} className="grid h-full w-full overflow-auto rounded-2xl md:grid-cols-2" style={{ color: theme.ink }}>
        <div className="hidden flex-col justify-between p-10 md:flex" style={{ background: `linear-gradient(160deg, ${theme.accent}, ${shade(theme.secondary, -0.1)})`, color: readableOn(theme.accent) }}>
          <BrandLogo color={readableOn(theme.accent)} size={18} />
          <p className="text-2xl font-semibold leading-snug" style={{ fontFamily: "var(--font-display)" }}>“It replaced five tools and made our team twice as fast.”</p>
        </div>
        <div className="flex items-center justify-center p-10">{form}</div>
      </Editable>
    )
    return (
      <Editable id="bg" label="Background" prop="background" color={theme.paper} className="flex h-full w-full items-center justify-center overflow-auto rounded-2xl p-8" style={{ color: theme.ink }}>
        <Editable id="card" label="Card" prop="background" color={theme.surface} className="w-full max-w-sm rounded-3xl p-8" style={{ boxShadow: `0 24px 60px ${withAlpha(theme.ink, 0.14)}` }}>{form}</Editable>
      </Editable>
    )
  }

  if (tpl?.startsWith("paywall")) {
    if (tpl === "paywall-comparison") {
      const rows = [["Projects", "3", "Unlimited", "Unlimited"], ["Analytics", "—", "Basic", "Advanced"], ["Team seats", "1", "5", "Unlimited"], ["Priority support", "—", "—", "✓"]]
      const plans = ["Free", "Pro", "Team"]
      return (
        <Editable id="bg" label="Background" prop="background" color={theme.paper} className="flex h-full w-full items-center justify-center overflow-auto rounded-2xl p-6" style={{ color: theme.ink }}>
          <Editable id="card" label="Card" prop="background" color={theme.surface} className="w-full max-w-2xl rounded-3xl p-7" style={{ boxShadow: `0 24px 60px ${withAlpha(theme.ink, 0.14)}` }}>
            <Editable id="heading" label="Heading" as="h1" color={theme.ink} className="text-center text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Compare plans</Editable>
            <div className="mt-6 overflow-hidden rounded-2xl border" style={{ borderColor: theme.border }}>
              <div className="grid grid-cols-4 text-sm font-semibold" style={{ background: theme.surface }}><span className="px-4 py-3" />{plans.map((p, i) => <span key={p} className="px-4 py-3 text-center" style={i === 1 ? { color: theme.accent } : {}}>{p}{i === 1 && " ★"}</span>)}</div>
              {rows.map((r, ri) => <div key={ri} className="grid grid-cols-4 border-t text-sm" style={{ borderColor: theme.border }}><span className="px-4 py-3 font-medium" style={{ color: theme.inkSoft }}>{r[0]}</span>{r.slice(1).map((c, ci) => <span key={ci} className="px-4 py-3 text-center" style={ci === 1 ? { background: withAlpha(theme.accent, 0.06), fontWeight: 600 } : {}}>{c}</span>)}</div>)}
            </div>
            <div className="mt-5 flex justify-center"><PreviewButton id="cta" text="Choose Pro" /></div>
          </Editable>
        </Editable>
      )
    }
    const plans = [{ n: "Monthly", p: "$12", per: "/mo", f: false }, { n: "Yearly", p: "$96", per: "/yr", f: true }]
    return (
      <Editable id="bg" label="Background" prop="background" color={theme.paper} className="flex h-full w-full items-center justify-center overflow-auto rounded-2xl p-6" style={{ color: theme.ink }}>
        <Editable id="card" label="Card" prop="background" color={theme.surface} className="w-full max-w-md rounded-3xl p-8" style={{ boxShadow: `0 24px 60px ${withAlpha(theme.ink, 0.14)}` }}>
          <div className="text-center">
            <Editable id="caption" label="Badge" as="span" color={theme.accent} className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: withAlpha(theme.accent, 0.14) }}>Pro</Editable>
            <Editable id="heading" label="Heading" as="h1" color={theme.ink} className="mt-3 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Unlock everything</Editable>
          </div>
          <ul className="mt-6 space-y-2.5 text-sm">{["Unlimited projects", "Advanced analytics", "Priority support"].map((f) => <li key={f} className="flex items-center gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px]" style={{ background: theme.accent, color: theme.onBrand }}>✓</span>{f}</li>)}</ul>
          <div className="mt-6 grid grid-cols-2 gap-3">{plans.map((p) => <div key={p.n} className="relative rounded-2xl border p-4 text-center" style={{ borderColor: p.f ? theme.accent : theme.border, background: p.f ? withAlpha(theme.accent, 0.08) : "transparent" }}><p className="text-xs font-semibold" style={{ color: theme.inkSoft }}>{p.n}</p><p className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{p.p}<span className="text-sm" style={{ color: theme.inkSoft }}>{p.per}</span></p></div>)}</div>
          <div className="mt-5"><PreviewButton id="cta" text="Start free trial" /></div>
        </Editable>
      </Editable>
    )
  }

  // landing: minimal / product / bold
  if (tpl === "landing-minimal") {
    return (
      <Editable id="bg" label="Background" prop="background" color={theme.paper} className="flex h-full w-full flex-col overflow-auto rounded-2xl" style={{ color: theme.ink }}>
        <nav className="flex items-center justify-between px-8 py-6"><BrandLogo color={theme.ink} size={16} /><Editable id="nav" label="Nav link" as="span" color={theme.accent} className="text-sm font-semibold">Try it →</Editable></nav>
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
          <Editable id="heading" label="Heading" as="h1" color={theme.ink} className="max-w-xl text-[46px] font-bold leading-[1.05] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Less interface. More flow.</Editable>
          <Editable id="caption" label="Caption" as="p" color={theme.inkSoft} className="mt-5 max-w-md text-base">A quiet tool that gets out of your way so the work can speak.</Editable>
          <div className="mt-8"><PreviewButton id="cta" text="Get started" /></div>
        </div>
      </Editable>
    )
  }
  if (tpl === "landing-product") {
    return (
      <Editable id="bg" label="Background" prop="background" color={theme.paper} className="h-full w-full overflow-auto rounded-2xl" style={{ color: theme.ink }}>
        <SiteNav theme={theme} />
        <div className="grid gap-8 px-8 py-12 md:grid-cols-2 md:items-center">
          <div className="aspect-square rounded-3xl" style={{ background: `linear-gradient(150deg, ${theme.accent}, ${shade(theme.secondary, 0.1)})` }} />
          <div>
            <Editable id="caption" label="Eyebrow" as="p" color={theme.accent} className="text-sm font-semibold uppercase tracking-[0.18em]">New release</Editable>
            <Editable id="heading" label="Heading" as="h1" color={theme.ink} className="mt-3 text-4xl font-bold leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>The everyday carry, reimagined.</Editable>
            <ul className="mt-5 space-y-2 text-sm">{["Aircraft-grade aluminium", "40-hour battery", "2-year warranty"].map((f) => <li key={f} className="flex items-center gap-2"><span style={{ color: theme.accent }}>✓</span>{f}</li>)}</ul>
            <div className="mt-6"><PreviewButton id="cta" text="Add to cart · $249" /></div>
          </div>
        </div>
      </Editable>
    )
  }
  // bold hero
  return (
    <Editable id="bg" label="Background" prop="background" color={theme.paper} className="h-full w-full overflow-auto rounded-2xl" style={{ color: theme.ink }}>
      <nav className="flex items-center justify-between px-8 py-5"><BrandLogo color={theme.ink} size={18} /><PreviewButton id="cta" text="Try it" size="sm" /></nav>
      <div className="px-8 py-16 text-center">
        <Editable id="caption" label="Eyebrow" as="p" color={theme.accent} className="text-sm font-semibold uppercase tracking-[0.2em]">Design faster</Editable>
        <Editable id="heading" label="Heading" as="h1" color={theme.ink} className="mx-auto mt-4 max-w-2xl text-[52px] font-bold leading-[1.02] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Ship beautiful products at the speed of thought.</Editable>
        <Editable id="subcaption" label="Sub-caption" as="p" color={theme.inkSoft} className="mx-auto mt-5 max-w-lg text-base">One canvas for your whole team to design, prototype and hand off.</Editable>
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-3">{[["10×", "faster handoff"], ["99.9%", "uptime"], ["4.9★", "avg rating"]].map(([a, b]) => <div key={b} className="rounded-2xl p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}><p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: theme.accent }}>{a}</p><p className="mt-1 text-sm" style={{ color: theme.inkSoft }}>{b}</p></div>)}</div>
      </div>
    </Editable>
  )
}

/* ================================================================== */
/* MOBILE APP                                                          */
/* ================================================================== */
function Phone({ theme, children }: { theme: Theme; children: ReactNode }) {
  const tabs = [["Home", "home"], ["Search", "search"], ["Activity", "activity"], ["Profile", "profile"]]
  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto rounded-2xl p-6" style={{ background: theme.surface }}>
      <div className="flex w-[300px] flex-col overflow-hidden rounded-[2.4rem] border-[6px] shadow-2xl" style={{ borderColor: theme.ink }}>
        <Editable id="bg" label="App background" prop="background" color={theme.paper} className="flex flex-1 flex-col" style={{ color: theme.ink }}>
          <div className="flex items-center justify-between px-5 pt-3 text-[11px] font-semibold" style={{ color: theme.inkSoft }}><span>9:41</span><span className="flex items-center gap-1"><Icon name="signal" size={12} /><Icon name="wifi" size={12} /><Icon name="battery" size={14} /></span></div>
          <div className="min-h-[420px] flex-1 px-5 pb-3 pt-3">{children}</div>
          <Editable id="navbg" label="Nav bar" prop="background" color={theme.paper} className="flex items-center justify-around border-t px-3 py-2.5" style={{ borderColor: theme.border }}>
            {tabs.map(([t, g], i) => (
              <Editable key={t} id={`nav-${t}`} label={`Tab · ${t}`} as="div" color={i === 0 ? theme.accent : theme.inkSoft} className="flex flex-col items-center gap-0.5">
                <Icon name={g} size={17} /><span className="text-[9px] font-semibold">{t}</span>
              </Editable>
            ))}
          </Editable>
        </Editable>
      </div>
    </div>
  )
}

export function AppPreview({ theme, tpl }: { theme: Theme; tpl: string }) {
  if (tpl === "app-dashboard") {
    return (
      <Phone theme={theme}>
        <Editable id="caption" label="Caption" as="p" color={theme.inkSoft} className="text-xs">This month</Editable>
        <Editable id="heading" label="Heading" as="p" color={theme.ink} className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Overview</Editable>
        <div className="mt-3 grid grid-cols-2 gap-2.5">{[["Steps", "8,240"], ["Sleep", "7h 20m"], ["Calories", "1,980"], ["Water", "1.8 L"]].map(([l, v]) => <Editable key={l} id={`card-${l}`} label={`Stat card · ${l}`} prop="background" color={theme.surface} className="rounded-2xl p-3"><p className="text-[11px]" style={{ color: theme.inkSoft }}>{l}</p><p className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>{v}</p></Editable>)}</div>
        <div className="mt-3 rounded-2xl p-3" style={{ background: theme.accent, color: theme.onBrand }}><p className="text-xs opacity-80">Weekly activity</p><div className="mt-2 flex h-16 items-end gap-1">{[50, 70, 40, 85, 60, 95, 75].map((h, i) => <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: withAlpha("#fff", 0.85) }} />)}</div></div>
      </Phone>
    )
  }
  if (tpl === "app-cards") {
    return (
      <Phone theme={theme}>
        <Editable id="heading" label="Heading" as="p" color={theme.ink} className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Discover</Editable>
        <div className="mt-3 space-y-3">{[["Design trends 2026", "5 min read"], ["Colour in motion", "3 min read"], ["Systems that scale", "8 min read"]].map(([t, m], i) => (
          <Editable key={t} id={`card-${i}`} label={`Card · ${t}`} prop="background" color={theme.surface} className="overflow-hidden rounded-2xl">
            <div className="h-20" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${shade(theme.secondary, i % 2 ? -0.1 : 0.1)})` }} />
            <div className="p-3"><p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{t}</p><div className="mt-1 flex items-center justify-between"><Editable id={`caption-${i}`} label="Caption" as="span" color={theme.inkSoft} className="text-[11px]">{m}</Editable><span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: theme.accent, color: theme.onBrand }}>Read</span></div></div>
          </Editable>
        ))}</div>
      </Phone>
    )
  }
  if (tpl === "app-profile") {
    return (
      <Phone theme={theme}>
        <div className="flex flex-col items-center pt-3 text-center">
          <BrandSymbol color={theme.accent} size={64} rounded={999} />
          <Editable id="heading" label="Name" as="p" color={theme.ink} className="mt-3 text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Alex Rivera</Editable>
          <Editable id="caption" label="Caption" as="p" color={theme.inkSoft} className="text-sm">Product Designer · San Francisco</Editable>
          <div className="mt-3 w-full"><PreviewButton id="cta" text="Edit profile" size="sm" /></div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">{[["248", "Posts"], ["12k", "Followers"], ["318", "Following"]].map(([v, l]) => <Editable key={l} id={`card-${l}`} label={`Stat · ${l}`} prop="background" color={theme.surface} className="rounded-xl py-3"><p className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>{v}</p><p className="text-[10px]" style={{ color: theme.inkSoft }}>{l}</p></Editable>)}</div>
        <div className="mt-3 space-y-2">{["Account", "Notifications", "Privacy"].map((s) => <Editable key={s} id={`card-${s}`} label={`Row · ${s}`} prop="background" color={theme.surface} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium"><span>{s}</span><span style={{ color: theme.inkSoft }}>›</span></Editable>)}</div>
      </Phone>
    )
  }
  // standard (wallet)
  return (
    <Phone theme={theme}>
      <div className="flex items-center justify-between">
        <div><Editable id="caption" label="Caption" as="p" color={theme.inkSoft} className="text-xs">Good morning</Editable><Editable id="heading" label="Name" as="p" color={theme.ink} className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Alex Rivera</Editable></div>
        <BrandSymbol color={theme.accent} size={44} rounded={999} />
      </div>
      <Editable id="card" label="Balance card" prop="background" color={theme.accent} className="mt-4 rounded-2xl p-4" style={{ color: theme.onBrand }}>
        <p className="text-xs opacity-80">Total balance</p><p className="mt-1 text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>$8,420.50</p>
        <div className="mt-4 flex gap-2"><span className="flex-1 rounded-lg py-2 text-center text-xs font-semibold" style={{ background: withAlpha("#fff", 0.2) }}>Send</span><span className="flex-1 rounded-lg py-2 text-center text-xs font-semibold" style={{ background: withAlpha("#fff", 0.2) }}>Request</span></div>
      </Editable>
      <Editable id="heading-section" label="Section heading" as="p" color={theme.ink} className="mt-4 text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Transactions</Editable>
      <div className="mt-2 space-y-2.5">{[["Spotify", "-$9.99"], ["Grocery", "-$42.10"], ["Salary", "+$3,200"]].map(([n, v]) => <Editable key={n} id={`card-${n}`} label={`Row · ${n}`} prop="background" color={theme.surface} className="flex items-center gap-3 rounded-xl p-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold" style={{ background: withAlpha(theme.accent, 0.14), color: theme.accent }}>{n[0]}</div><div className="flex-1"><p className="text-sm font-medium">{n}</p></div><span className="text-sm font-semibold" style={{ color: v[0] === "+" ? theme.accent : theme.ink }}>{v}</span></Editable>)}</div>
    </Phone>
  )
}

/* ================================================================== */
/* COMPONENTS: Cards / Forms / Navigation / Typography                 */
/* ================================================================== */
export function CardsPreview({ theme, tpl }: { theme: Theme; tpl: string }) {
  const cardStyle = (): CSSProperties => tpl === "outlined" ? { background: theme.paper, border: `1.5px solid ${theme.border}` } : tpl === "simple" ? { background: theme.paper, border: `1px solid ${withAlpha(theme.ink, 0.06)}` } : { background: theme.paper, boxShadow: `0 10px 28px ${withAlpha(theme.ink, 0.1)}` }
  return (
    <div className="h-full w-full overflow-auto rounded-2xl p-8" style={{ background: theme.surface, color: theme.ink }}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl p-5" style={cardStyle()}>
          <div className="h-16 rounded-xl" style={{ background: `linear-gradient(120deg, ${theme.accent}, ${theme.secondary})` }} />
          <div className="-mt-8 h-16 w-16 rounded-full border-4" style={{ borderColor: theme.paper, background: theme.accent }} />
          <h3 className="mt-3 text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Mira Chen</h3>
          <p className="text-sm" style={{ color: theme.inkSoft }}>Product Designer</p>
        </div>
        {[["Revenue", "$48.2k", "+12.4%"], ["Active users", "2,981", "+3.1%"]].map(([l, v, d]) => (
          <div key={l} className="rounded-2xl p-5" style={cardStyle()}><p className="text-sm" style={{ color: theme.inkSoft }}>{l}</p><p className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{v}</p><span className="mt-1 inline-block text-xs font-semibold" style={{ color: theme.accent }}>{d}</span></div>
        ))}
        <div className="rounded-2xl p-5" style={tpl === "outlined" ? { border: `1.5px solid ${theme.accent}`, background: theme.paper } : { background: theme.ink, color: theme.onInk }}>
          <div className="flex items-center gap-1">{[0, 1, 2, 3, 4].map((i) => <Star key={i} c={theme.accent} />)}</div>
          <h3 className="mt-3 text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: tpl === "outlined" ? theme.ink : theme.onInk }}>Aurora Headphones</h3>
          <div className="mt-4 flex items-center justify-between"><span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: tpl === "outlined" ? theme.ink : theme.onInk }}>$249</span><span className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: theme.accent, color: theme.onBrand }}>Add</span></div>
        </div>
      </div>
    </div>
  )
}

export function FormsPreview({ theme, tpl }: { theme: Theme; tpl: string }) {
  const minimal = tpl === "minimal"
  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto rounded-2xl p-8" style={{ background: theme.paper }}>
      <div className={minimal ? "w-full max-w-md" : "w-full max-w-lg rounded-2xl p-8"} style={minimal ? { color: theme.ink } : { background: theme.paper, color: theme.ink, boxShadow: `0 16px 40px ${withAlpha(theme.ink, 0.1)}` }}>
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Create your account</h1>
        <p className="mt-1 text-sm" style={{ color: theme.inkSoft }}>It only takes a minute.</p>
        <div className="mt-6 grid grid-cols-2 gap-4"><Field theme={theme} label="First name" value="Alex" underline={minimal} /><Field theme={theme} label="Last name" value="Rivera" underline={minimal} /></div>
        <div className="mt-4"><Field theme={theme} label="Email" value="alex@studio.com" underline={minimal} /></div>
        <div className="mt-4"><label className="mb-1.5 block text-xs font-semibold" style={{ color: theme.inkSoft }}>Plan</label><div className="flex gap-2">{["Starter", "Pro", "Team"].map((p, i) => <span key={p} className="flex-1 rounded-xl border py-2 text-center text-sm font-medium" style={i === 1 ? { borderColor: theme.accent, background: withAlpha(theme.accent, 0.1), color: theme.accent } : { borderColor: theme.border, color: theme.inkSoft }}>{p}</span>)}</div></div>
        <label className="mt-4 flex items-center gap-2.5 text-sm" style={{ color: theme.inkSoft }}><span className="flex h-5 w-9 items-center rounded-full p-0.5" style={{ background: theme.accent }}><span className="h-4 w-4 translate-x-4 rounded-full bg-white" /></span>Email me updates</label>
        <button className="mt-6 w-full rounded-xl py-3 text-sm font-semibold" style={{ background: theme.accent, color: theme.onBrand, fontFamily: "var(--font-display)" }}>Create account</button>
      </div>
    </div>
  )
}

export function StatesPreview({ theme, tpl }: { theme: Theme; tpl: string }) {
  const compact = tpl === "compact"
  const states = [
    { label: "Success", title: "Saved and synced", body: "Your palette is ready to use.", color: theme.secondary },
    { label: "Warning", title: "Contrast needs review", body: "Try a darker text colour here.", color: theme.accent },
    { label: "Error", title: "Export failed", body: "Check the file format and try again.", color: theme.border },
  ]

  return (
    <div className="h-full w-full overflow-auto rounded-2xl p-8" style={{ background: theme.paper, color: theme.ink }}>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Status system</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>See how support colours behave.</h1>
          </div>
          <PreviewButton id="cta" text="Resolve all" size="sm" />
        </div>
        <div className={compact ? "mt-7 grid gap-3" : "mt-7 grid gap-4 md:grid-cols-3"}>
          {states.map((state) => (
            <Editable
              key={state.label}
              id={`state-${state.label}`}
              label={`${state.label} state`}
              prop="background"
              color={theme.surface}
              className="rounded-2xl border p-4"
              style={{ borderColor: withAlpha(state.color, 0.35), boxShadow: `inset 4px 0 0 ${state.color}` }}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style={{ background: state.color, color: readableOn(state.color) }}>
                {state.label[0]}
              </span>
              <h2 className="mt-4 text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>{state.title}</h2>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: theme.inkSoft }}>{state.body}</p>
            </Editable>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: theme.border, background: theme.surface }}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Empty state</p>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: withAlpha(theme.accent, 0.12), color: theme.accent }}>Accessible</span>
          </div>
          <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: theme.border }}>
            <BrandSymbol color={theme.accent} size={42} rounded={12} />
            <p className="mt-3 text-sm font-semibold">No saved palettes yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed" style={{ color: theme.inkSoft }}>Create a palette, test the roles, then save the combination that still reads clearly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChartsPreview({ theme, tpl }: { theme: Theme; tpl: string }) {
  const rows = [
    ["Website UI", "92", theme.accent],
    ["Mobile app", "78", theme.secondary],
    ["Navigation", "64", theme.inkSoft],
    ["Buttons", "86", theme.accent],
  ]

  if (tpl === "summary") {
    return (
      <div className="h-full w-full overflow-auto rounded-2xl p-8" style={{ background: theme.surface, color: theme.ink }}>
        <div className="grid gap-4 md:grid-cols-3">
          {[["Contrast score", "94%"], ["Roles used", "6"], ["Ready views", "12"]].map(([label, value], index) => (
            <Editable key={label} id={`metric-${label}`} label={label} prop="background" color={theme.paper} className="rounded-2xl p-5" style={{ boxShadow: `0 8px 24px ${withAlpha(theme.ink, 0.08)}` }}>
              <p className="text-xs" style={{ color: theme.inkSoft }}>{label}</p>
              <p className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: index === 1 ? theme.secondary : theme.accent }}>{value}</p>
            </Editable>
          ))}
        </div>
        <Editable id="chart-card" label="Chart card" prop="background" color={theme.paper} className="mt-4 rounded-2xl p-6" style={{ boxShadow: `0 8px 24px ${withAlpha(theme.ink, 0.08)}` }}>
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Palette fit by surface</h2>
          <div className="mt-5 space-y-4">
            {rows.map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs font-semibold" style={{ color: theme.inkSoft }}><span>{label}</span><span>{value}%</span></div>
                <div className="h-3 rounded-full" style={{ background: withAlpha(theme.ink, 0.08) }}>
                  <div className="h-3 rounded-full" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </Editable>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto rounded-2xl p-8" style={{ background: theme.paper, color: theme.ink }}>
      <div className="mx-auto max-w-3xl rounded-2xl p-6" style={{ background: theme.surface }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Usage by preview type</h1>
            <p className="text-sm" style={{ color: theme.inkSoft }}>Check data colours, grid lines and labels together.</p>
          </div>
          <div className="flex gap-2 text-xs font-semibold" style={{ color: theme.inkSoft }}>
            <span><Dot c={theme.accent} /> Primary</span>
            <span><Dot c={theme.secondary} /> Secondary</span>
          </div>
        </div>
        <div className="mt-8 grid h-56 grid-cols-4 items-end gap-5 border-b border-l px-5 pb-0" style={{ borderColor: theme.border }}>
          {[70, 44, 88, 62].map((height, index) => (
            <div key={index} className="flex h-full items-end gap-1.5">
              <span className="flex-1 rounded-t-lg" style={{ height: `${height}%`, background: index % 2 ? theme.secondary : theme.accent }} />
              <span className="flex-1 rounded-t-lg" style={{ height: `${Math.max(24, height - 22)}%`, background: withAlpha(index % 2 ? theme.accent : theme.secondary, 0.45) }} />
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-5 px-5 text-center text-[11px] font-semibold" style={{ color: theme.inkSoft }}>
          {["Web", "App", "Nav", "Data"].map((label) => <span key={label}>{label}</span>)}
        </div>
      </div>
    </div>
  )
}

export function NavPreview({ theme, tpl }: { theme: Theme; tpl: string }) {
  if (tpl === "sidebar") {
    const items = ["Dashboard", "Projects", "Messages", "Reports", "Settings"]
    return (
      <div className="flex h-full w-full overflow-hidden rounded-2xl" style={{ background: theme.surface, color: theme.ink }}>
        <div className="flex w-56 flex-col p-4" style={{ background: theme.ink, color: theme.onInk }}>
          <span className="mb-6 text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>◆ Vertex</span>
          <div className="space-y-1">{items.map((t, i) => <div key={t} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium" style={i === 1 ? { background: theme.accent, color: theme.onBrand } : { color: withAlpha(theme.onInk, 0.7) }}><Dot c={i === 1 ? theme.onBrand : withAlpha(theme.onInk, 0.4)} /> {t}</div>)}</div>
        </div>
        <div className="flex-1 p-8"><h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Projects</h3><div className="mt-5 grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((n) => <div key={n} className="rounded-2xl p-4" style={{ background: theme.paper, boxShadow: `0 6px 18px ${withAlpha(theme.ink, 0.06)}` }}><div className="mb-2 h-1.5 w-10 rounded-full" style={{ background: theme.accent }} /><p className="text-sm font-semibold">Project {n}</p></div>)}</div></div>
      </div>
    )
  }
  if (tpl === "bottom") {
    const tabs = [["Home", "home"], ["Search", "search"], ["Create", "create"], ["Inbox", "inbox"], ["Profile", "profile"]]
    return (
      <div className="flex h-full w-full items-center justify-center overflow-auto rounded-2xl p-6" style={{ background: theme.surface }}>
        <div className="flex w-[300px] flex-col overflow-hidden rounded-[2.4rem] border-[6px] shadow-2xl" style={{ borderColor: theme.ink, background: theme.paper, color: theme.ink }}>
          <div className="min-h-[360px] flex-1 p-5"><p className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Home</p><div className="mt-3 space-y-3">{[1, 2, 3].map((n) => <div key={n} className="rounded-2xl p-4" style={{ background: theme.surface }}><div className="mb-2 h-1.5 w-16 rounded-full" style={{ background: theme.accent }} /><div className="h-2 w-full rounded-full" style={{ background: withAlpha(theme.ink, 0.1) }} /></div>)}</div></div>
          <div className="flex items-center justify-around border-t px-3 py-3" style={{ borderColor: theme.border }}>{tabs.map(([t, g], i) => <div key={t} className="flex flex-col items-center gap-0.5" style={{ color: i === 0 ? theme.accent : theme.inkSoft }}>{i === 2 ? <span className="flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full" style={{ background: theme.accent, color: theme.onBrand }}><Icon name={g} size={18} /></span> : <><Icon name={g} size={17} /><span className="text-[9px] font-semibold">{t}</span></>}</div>)}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="h-full w-full space-y-6 overflow-auto rounded-2xl p-8" style={{ background: theme.surface, color: theme.ink }}>
      <div className="flex items-center justify-between rounded-2xl px-6 py-4" style={{ background: theme.paper, boxShadow: `0 6px 18px ${withAlpha(theme.ink, 0.08)}` }}><div className="flex items-center gap-6"><span className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>◆ Vertex</span>{["Overview", "Reports", "Team"].map((t, i) => <span key={t} className="text-sm font-medium" style={{ color: i === 0 ? theme.accent : theme.inkSoft }}>{t}</span>)}</div><div className="h-8 w-8 rounded-full" style={{ background: theme.accent }} /></div>
      <div className="flex flex-wrap gap-2">{["All", "Active", "Draft", "Archived"].map((t, i) => <span key={t} className="rounded-full px-4 py-1.5 text-sm font-semibold" style={i === 0 ? { background: theme.accent, color: theme.onBrand } : { background: theme.paper, color: theme.inkSoft, border: `1px solid ${theme.border}` }}>{t}</span>)}</div>
      <div className="rounded-2xl p-6" style={{ background: theme.paper, boxShadow: `0 6px 18px ${withAlpha(theme.ink, 0.06)}` }}><div className="flex items-center gap-2 text-xs" style={{ color: theme.inkSoft, fontFamily: "var(--font-mono)" }}>Home <span>/</span> Projects <span style={{ color: theme.accent }}>/ Vertex</span></div><h3 className="mt-3 text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Projects</h3></div>
    </div>
  )
}

const TYPE_CONFIG: Record<string, { head: string; kicker: string; tracking: string; upper: boolean; label: string; italic?: boolean }> = {
  modern: { head: "var(--font-display)", kicker: "Type scale", tracking: "-0.02em", upper: false, label: "Clean geometric sans" },
  friendly: { head: "'Poppins', var(--font-display)", kicker: "Say hello", tracking: "0em", upper: false, label: "Rounded & approachable" },
  professional: { head: "var(--font-display)", kicker: "Corporate", tracking: "0.14em", upper: true, label: "Structured & precise" },
  editorial: { head: "'Instrument Serif', serif", kicker: "The Feature", tracking: "0em", upper: false, italic: true, label: "Serif with character" },
}
export function TypographyPreview({ theme, tpl }: { theme: Theme; tpl: string }) {
  const cfg = TYPE_CONFIG[tpl] ?? TYPE_CONFIG.modern
  return (
    <div className="h-full w-full overflow-auto rounded-2xl px-10 py-10" style={{ background: theme.paper, color: theme.ink }}>
      <p className="text-sm font-semibold" style={{ color: theme.accent, textTransform: cfg.upper ? "uppercase" : "none", letterSpacing: cfg.upper ? "0.2em" : cfg.tracking }}>{cfg.kicker}</p>
      <h1 className="mt-2 text-[64px] font-bold leading-none" style={{ fontFamily: cfg.head, letterSpacing: cfg.tracking, fontStyle: cfg.italic ? "italic" : "normal" }}>Aa</h1>
      <div className="mt-8 space-y-5 border-t pt-8" style={{ borderColor: theme.border }}>
        <div><span className="text-xs" style={{ color: theme.inkSoft, fontFamily: "var(--font-mono)" }}>Display · {cfg.label}</span><h2 className="text-4xl font-bold" style={{ fontFamily: cfg.head, letterSpacing: cfg.tracking, textTransform: cfg.upper ? "uppercase" : "none", fontStyle: cfg.italic ? "italic" : "normal" }}>Colour builds clarity</h2></div>
        <div><span className="text-xs" style={{ color: theme.inkSoft, fontFamily: "var(--font-mono)" }}>Body</span><p className="max-w-xl text-base leading-relaxed">A palette only proves itself in use. Here is running text in your chosen colours. <span style={{ color: theme.accent, fontWeight: 600 }}>Links glow in your accent.</span></p></div>
        <div className="flex flex-wrap gap-2 pt-2">{["Primary", "Tag", "Badge", "Label"].map((t, i) => <span key={t} className="rounded-full px-3 py-1 text-xs font-semibold" style={i === 0 ? { background: theme.accent, color: theme.onBrand } : { background: withAlpha(theme.ink, 0.06), color: theme.inkSoft }}>{t}</span>)}</div>
      </div>
    </div>
  )
}

/* ================================================================== */
/* Registry                                                            */
/* ================================================================== */
export type GroupKey = TemplateGroupKey
export type Sub = { key: string; label: string; templates: { key: string; label: string; layout: TemplateLayout; thumbnail: string; source: string | null }[] }
export type Group = { key: GroupKey; label: string; subs: Sub[] }

export const GROUPS: Group[] = templateGroups

export type PreviewRendererHandle = { fitToScreen: () => void }

export const PreviewRenderer = forwardRef<PreviewRendererHandle, { group: GroupKey; sub: string; templateId: string; theme: Theme }>(function PreviewRenderer({ group, sub, templateId, theme }, ref) {
  const importedRef = useRef<TemplatePreviewHandle | null>(null)
  const builtInRef = useRef<PreviewRendererHandle | null>(null)
  const asset = templateAssetById.get(templateId)
  useImperativeHandle(ref, () => ({ fitToScreen: () => (asset?.renderer === "built-in" ? builtInRef.current : importedRef.current)?.fitToScreen() }), [asset])

  if (!asset) return <div className="grid h-full min-h-96 place-items-center bg-white text-sm font-semibold text-charcoal/50">Template not found</div>
  if (asset.renderer === "built-in") {
    const baseWidth = group === "application" ? 390 : 1440
    return (
      <BuiltInPreviewFrame ref={builtInRef} baseWidth={baseWidth}>
        <Suspense fallback={<div className="grid h-full min-h-96 place-items-center bg-white text-sm font-semibold text-charcoal/50">Loading template...</div>}>
          <BuiltInTemplatePreview key={`${group}/${sub}/${templateId}`} asset={asset} theme={theme} />
        </Suspense>
      </BuiltInPreviewFrame>
    )
  }
  return <TemplatePreview key={`${group}/${sub}/${templateId}`} ref={importedRef} templateId={templateId} />
})

const BUILT_IN_DEFAULT_ZOOM = 1
const ZOOM_STEP = 0.1

const BuiltInPreviewFrame = forwardRef<PreviewRendererHandle, { children: ReactNode; baseWidth: number }>(function BuiltInPreviewFrame({ children, baseWidth }, ref) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [zoom, setZoom] = useState(BUILT_IN_DEFAULT_ZOOM)
  const [contentHeight, setContentHeight] = useState(0)

  const fit = useCallback(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return
    const height = content.scrollHeight
    setContentHeight(height)
    setZoom(computeFitZoom(viewport.clientWidth, viewport.clientHeight, baseWidth, height))
    viewport.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [baseWidth])

  useImperativeHandle(ref, () => ({ fitToScreen: fit }), [fit])

  useLayoutEffect(() => { fit() }, [baseWidth, fit])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(() => fit())
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [fit])

  const changeZoom = (direction: -1 | 1) => setZoom((current) => clampPreviewZoom(Math.round((current + direction * ZOOM_STEP) * 10) / 10))
  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    if (!viewport || event.button !== 0) return
    dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop }
    viewport.setPointerCapture(event.pointerId)
    setDragging(true)
  }
  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    const drag = dragRef.current
    if (!viewport || !drag) return
    viewport.scrollLeft = drag.left - (event.clientX - drag.x)
    viewport.scrollTop = drag.top - (event.clientY - drag.y)
  }
  const endPan = () => { dragRef.current = null; setDragging(false) }

  return (
    <div className="relative h-full w-full bg-[#eceef1]">
      <div className="absolute bottom-3 right-3 z-20 flex h-12 items-center rounded-[8px] border border-[#d7d9dd] bg-white/95 p-0.5 shadow-sm backdrop-blur" role="group" aria-label="Preview zoom controls">
        <PreviewZoomButton label="Zoom out" onClick={() => changeZoom(-1)} disabled={zoom <= PREVIEW_FIT_MIN_ZOOM}><ZoomOutIcon /></PreviewZoomButton>
        <span className="w-12 text-center text-[11px] font-bold tabular-nums text-charcoal/65" aria-live="polite">{Math.round(zoom * 100)}%</span>
        <PreviewZoomButton label="Zoom in" onClick={() => changeZoom(1)} disabled={zoom >= PREVIEW_FIT_MAX_ZOOM}><ZoomInIcon /></PreviewZoomButton>
      </div>
      <div ref={viewportRef} className={`h-full w-full overflow-auto ${dragging ? "cursor-grabbing touch-none select-none" : "cursor-grab"}`} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan}>
        <div className="flex min-h-full w-full justify-center" style={{ padding: PREVIEW_FIT_INSET / 2 }}>
          <div
            className="shrink-0"
            style={{
              width: baseWidth * zoom,
              height: contentHeight ? contentHeight * zoom : undefined,
            }}
          >
            <div
              ref={contentRef}
              style={{
                width: baseWidth,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

function PreviewZoomButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className="grid h-11 w-11 place-items-center rounded-[7px] text-charcoal/60 transition-colors hover:bg-[#f3f4f6] hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-30">{children}</button>
}

const ZoomOutIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4 4M7.5 10.5h6" /></svg>
const ZoomInIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4 4M7.5 10.5h6M10.5 7.5v6" /></svg>

export function renderComponentPreview(group: GroupKey, sub: string, tpl: string, theme: Theme): ReactNode {
  return <PreviewRenderer key={`${group}/${sub}/${tpl}`} group={group} sub={sub} templateId={tpl} theme={theme} />
}

/* small schematic thumbnail for the template strip */
export function TemplateThumb({ theme, layout }: { theme: Theme; layout: string }) {
  const b = (c: string, w: number | string, h: number, r = 2): ReactNode => <div style={{ background: c, width: w, height: h, borderRadius: r }} />
  const wrap = (bg: string, kids: ReactNode) => <div className="flex h-full w-full flex-col gap-1 overflow-hidden rounded-md p-1.5" style={{ background: bg }}>{kids}</div>
  switch (layout) {
    case "hero": case "split": return wrap(theme.paper, <div className="flex flex-1 gap-1"><div className="flex flex-1 flex-col justify-center gap-1">{b(theme.ink, "80%", 4)}{b(theme.accent, 20, 6, 3)}</div><div className="flex-1 rounded" style={{ background: withAlpha(theme.accent, 0.25) }} /></div>)
    case "hero-dark": return wrap(theme.paper, <div className="flex flex-1 flex-col items-center justify-center gap-1">{b(theme.ink, "60%", 6)}{b(theme.accent, "30%", 4)}</div>)
    case "centered": return wrap(theme.paper, <div className="flex flex-1 flex-col items-center justify-center gap-1">{b(theme.ink, "55%", 5)}{b(theme.accent, 20, 6, 3)}</div>)
    case "grid": return wrap(theme.paper, <div className="grid flex-1 grid-cols-2 gap-1">{[0, 1, 2, 3].map((i) => <div key={i} className="rounded" style={{ background: withAlpha(theme.accent, 0.2 + i * 0.08) }} />)}</div>)
    case "card": return wrap(theme.surface, <div className="m-auto flex w-3/4 flex-col gap-1 rounded p-1" style={{ background: theme.paper }}>{b(theme.ink, "60%", 3)}{b(theme.inkFaint, "100%", 4)}{b(theme.accent, "100%", 4)}</div>)
    case "table": return wrap(theme.paper, <div className="grid flex-1 grid-cols-3 gap-0.5">{Array.from({ length: 9 }).map((_, i) => <span key={i} style={{ background: i % 3 === 1 ? withAlpha(theme.accent, 0.3) : theme.inkFaint, borderRadius: 1 }} />)}</div>)
    case "phone": return wrap(theme.surface, <div className="mx-auto flex h-full w-8 flex-col gap-1 rounded" style={{ background: theme.paper, padding: 3 }}><div className="rounded" style={{ background: theme.accent, height: 10 }} />{b(theme.inkFaint, "100%", 3)}<div className="mt-auto flex justify-around">{[0, 1, 2].map((i) => <span key={i} style={{ width: 3, height: 3, borderRadius: 3, background: i === 0 ? theme.accent : theme.inkSoft }} />)}</div></div>)
    case "sidebar": return wrap(theme.surface, <div className="flex h-full gap-1"><div className="flex w-1/3 flex-col gap-1 rounded p-1" style={{ background: theme.ink }}>{b(theme.accent, "100%", 4)}{b(withAlpha(theme.onInk, 0.4), "100%", 3)}</div><div className="flex-1" /></div>)
    case "topbar": return wrap(theme.surface, <><div className="flex items-center gap-1 rounded p-1" style={{ background: theme.paper }}>{b(theme.ink, 10, 3)}{b(theme.accent, 8, 3)}</div><div className="flex-1" /></>)
    case "cards": return wrap(theme.surface, <div className="grid flex-1 grid-cols-2 gap-1">{[0, 1].map((i) => <div key={i} className="rounded p-1" style={{ background: theme.paper }}>{b(theme.accent, "60%", 3)}</div>)}</div>)
    case "form": return wrap(theme.surface, <div className="m-auto flex w-3/4 flex-col gap-1.5">{b(theme.inkFaint, "100%", 4)}{b(theme.inkFaint, "100%", 4)}{b(theme.accent, "100%", 4)}</div>)
    case "states": return wrap(theme.paper, <div className="grid flex-1 grid-cols-2 gap-1">{[theme.secondary, theme.accent, theme.border, theme.surface].map((c, i) => <div key={i} className="rounded p-1" style={{ background: theme.surface, boxShadow: `inset 2px 0 0 ${c}` }}>{b(c, 6, 6, 999)}</div>)}</div>)
    case "chart": return wrap(theme.surface, <div className="flex flex-1 items-end gap-1 border-b border-l p-1" style={{ borderColor: theme.border }}>{[55, 80, 45, 70].map((h, i) => <span key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i % 2 ? theme.secondary : theme.accent }} />)}</div>)
    case "type": return wrap(theme.paper, <div className="flex flex-1 flex-col justify-center"><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: theme.ink }}>Aa</span>{b(theme.inkFaint, "70%", 3)}</div>)
    default: return wrap(theme.paper, <div className="flex-1" />)
  }
}

// avoid unused import warning
void usePreview
