import { readableOn, shade, withAlpha, type Theme } from "../lib/color"
import { BrandLogo, BrandSymbol, Editable, PreviewButton, usePreview } from "./PreviewCtx"
import type { CSSProperties, ReactNode } from "react"

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
export type GroupKey = "website" | "mobile" | "components"
export type Sub = { key: string; label: string; templates: { key: string; label: string; layout: string }[] }
export type Group = { key: GroupKey; label: string; subs: Sub[] }

export const GROUPS: Group[] = [
  {
    key: "website", label: "Website", subs: [
      { key: "landing", label: "Landing Page", templates: [{ key: "landing-bold", label: "Bold Hero", layout: "hero-dark" }, { key: "landing-minimal", label: "Minimal", layout: "centered" }, { key: "landing-product", label: "Product", layout: "split" }] },
      { key: "saas", label: "SaaS", templates: [{ key: "saas-classic", label: "Classic", layout: "hero" }, { key: "saas-centered", label: "Centered", layout: "centered" }] },
      { key: "ecom", label: "E-commerce", templates: [{ key: "ecom-grid", label: "Grid", layout: "grid" }, { key: "ecom-featured", label: "Featured", layout: "hero" }] },
      { key: "signin", label: "Sign-In", templates: [{ key: "signin-split", label: "Split Screen", layout: "split" }, { key: "signin-centered", label: "Centered", layout: "card" }] },
      { key: "paywall", label: "Paywall", templates: [{ key: "paywall-simple", label: "Simple Plan", layout: "card" }, { key: "paywall-comparison", label: "Comparison", layout: "table" }] },
    ],
  },
  {
    key: "mobile", label: "Mobile App", subs: [
      { key: "standard", label: "Standard", templates: [{ key: "app-standard", label: "Wallet", layout: "phone" }] },
      { key: "dashboard", label: "Dashboard", templates: [{ key: "app-dashboard", label: "Metrics", layout: "phone" }] },
      { key: "cards", label: "Cards", templates: [{ key: "app-cards", label: "Feed", layout: "phone" }] },
      { key: "profile", label: "Profile", templates: [{ key: "app-profile", label: "Profile", layout: "phone" }] },
    ],
  },
  {
    key: "components", label: "Components", subs: [
      { key: "button", label: "Button", templates: [] }, // styles handled by ButtonLab
      { key: "cards", label: "Cards", templates: [{ key: "elevated", label: "Elevated", layout: "cards" }, { key: "simple", label: "Simple", layout: "cards" }, { key: "outlined", label: "Outlined", layout: "cards" }] },
      { key: "forms", label: "Forms", templates: [{ key: "card", label: "Card Form", layout: "card" }, { key: "minimal", label: "Minimal", layout: "form" }] },
      { key: "nav", label: "Navigation", templates: [{ key: "topbar", label: "Top Bar", layout: "topbar" }, { key: "sidebar", label: "Sidebar", layout: "sidebar" }, { key: "bottom", label: "Bottom Nav", layout: "phone" }] },
      { key: "typography", label: "Typography", templates: [{ key: "modern", label: "Modern", layout: "type" }, { key: "friendly", label: "Friendly", layout: "type" }, { key: "professional", label: "Professional", layout: "type" }, { key: "editorial", label: "Editorial", layout: "type" }] },
    ],
  },
]

export function renderComponentPreview(group: GroupKey, sub: string, tpl: string, theme: Theme): ReactNode {
  if (group === "website") return <WebsitePreview theme={theme} tpl={tpl} />
  if (group === "mobile") return <AppPreview theme={theme} tpl={tpl} />
  // components
  if (sub === "cards") return <CardsPreview theme={theme} tpl={tpl} />
  if (sub === "forms") return <FormsPreview theme={theme} tpl={tpl} />
  if (sub === "nav") return <NavPreview theme={theme} tpl={tpl} />
  if (sub === "typography") return <TypographyPreview theme={theme} tpl={tpl} />
  return null
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
    case "type": return wrap(theme.paper, <div className="flex flex-1 flex-col justify-center"><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: theme.ink }}>Aa</span>{b(theme.inkFaint, "70%", 3)}</div>)
    default: return wrap(theme.paper, <div className="flex-1" />)
  }
}

// avoid unused import warning
void usePreview
