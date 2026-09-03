import { useEffect, useRef, useState, type CSSProperties } from "react"
import { useNav, type Route } from "../lib/router"
import { BRAND, shade } from "../lib/color"
import "./Home.css"

type DemoStyle = "simple" | "3d" | "outline"
type DemoColour = "primary" | "secondary" | "text"
type DemoAnimation = "depth" | "scale" | "bounce"
type DemoState = "pressed" | "hovered" | "disabled"

const STYLE_OPTIONS: { value: DemoStyle; label: string }[] = [
  { value: "simple", label: "Simple" },
  { value: "3d", label: "3D" },
  { value: "outline", label: "Outline" },
]

const ANIMATION_OPTIONS: { value: DemoAnimation; label: string }[] = [
  { value: "depth", label: "Depth Press" },
  { value: "scale", label: "Scale Down" },
  { value: "bounce", label: "Bounce" },
]

/** Derive preview state colours from the user's primary colour instead of hardcoding. */
function deriveStateColours(primary: string) {
  return [
    { value: "pressed" as DemoState, label: "Pressed", colour: shade(primary, -0.15) },
    { value: "hovered" as DemoState, label: "Hovered", colour: shade(primary, 0.3) },
    { value: "disabled" as DemoState, label: "Disabled", colour: shade(primary, -0.1) },
  ]
}

export default function Home() {
  const nav = useNav()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const [demoStyle, setDemoStyle] = useState<DemoStyle>("simple")
  const [animation, setAnimation] = useState<DemoAnimation>("depth")
  const [previewState, setPreviewState] = useState<DemoState>("pressed")
  const [animationRun, setAnimationRun] = useState(0)
  const [colours, setColours] = useState<Record<DemoColour, string>>({
    primary: BRAND.cta,
    secondary: BRAND.secondary,
    text: BRAND.white,
  })

  const stateOptions = deriveStateColours(colours.primary)

  // Escape key and click-outside to close burger menu
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false)
        menuBtnRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [menuOpen])

  // Focus trap inside burger menu
  useEffect(() => {
    if (!menuOpen || !menuRef.current) return
    const menu = menuRef.current
    const focusable = menu.querySelectorAll<HTMLElement>("a, button, input, [tabindex]")
    if (focusable.length) focusable[0].focus()

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    menu.addEventListener("keydown", onKeydown)
    return () => menu.removeEventListener("keydown", onKeydown)
  }, [menuOpen])

  const previewStyle = demoStyle === "simple"
    ? { "--face": colours.primary, "--txt": colours.text }
    : demoStyle === "3d"
      ? { "--face": colours.primary, "--edge": colours.secondary, "--txt": colours.text }
      : { "--face": "transparent", "--border": colours.secondary, "--txt": colours.primary }

  const activeState = stateOptions.find((option) => option.value === previewState) ?? stateOptions[0]
  const stateStyle = {
    "--face": activeState.colour,
    "--edge": colours.secondary,
    "--txt": colours.text,
  }

  const runAnimation = () => setAnimationRun((value) => value + 1)
  const chooseAnimation = (value: DemoAnimation) => {
    setAnimation(value)
    runAnimation()
  }
  const chooseState = (value: DemoState) => {
    setPreviewState(value)
    runAnimation()
  }

  const openGenerate = nav("/generate")
  const openQuickDesign = nav("/quick-design")

  const updateColour = (role: DemoColour, value: string) => {
    setColours((current) => ({ ...current, [role]: value.toUpperCase() }))
  }

  /** Parse typed hex input, accepting with or without # */
  const handleHexInput = (role: DemoColour, raw: string) => {
    let h = raw.trim().replace(/^#/, "")
    if (/^[0-9a-fA-F]{6}$/.test(h)) {
      updateColour(role, "#" + h)
    } else if (/^[0-9a-fA-F]{3}$/.test(h)) {
      h = h.split("").map((c) => c + c).join("")
      updateColour(role, "#" + h)
    }
  }

  return (
    <div className="hueset-home-shell">
      <a href="#main-content" className="home-skip-link">Skip to main content</a>
      <div className="hueset-home" id="top">
        <header className="home-nav">
          <div className="home-wrap home-nav-inner">
            <a href="#top" className="home-brand" aria-label="HueSet home">
              <img className="home-brand-icon" src="/hueset-icon.svg" alt="" />
              <img className="home-brand-wordmark" src="/hueset-wordmark.svg" alt="HueSet" />
            </a>

            <nav className="home-nav-links" aria-label="Primary navigation">
              <a href="/learn" onClick={nav("/learn")}>Learn</a>
              <a href="/examples" onClick={nav("/examples")}>Examples</a>
              <button
                ref={menuBtnRef}
                type="button"
                className="home-menu-button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="home-menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <img src="/hueset-menu.svg" alt="" />
              </button>
            </nav>

            {menuOpen && (
              <>
                <div className="home-menu-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <nav id="home-menu" className="home-menu" ref={menuRef} aria-label="HueSet menu">
                  <a href="/learn" onClick={(e) => { nav("/learn")(e); setMenuOpen(false) }}>Learn</a>
                  <a href="/examples" onClick={(e) => { nav("/examples")(e); setMenuOpen(false) }}>Examples</a>
                  <a href="/generate" onClick={(e) => { openGenerate(e); setMenuOpen(false) }}>Generate a Design</a>
                  <a href="/quick-design" onClick={(e) => { openQuickDesign(e); setMenuOpen(false) }}>Quick Design</a>
                  <a href="/pricing" onClick={(e) => { nav("/pricing")(e); setMenuOpen(false) }}>Pricing</a>
                  <a href="/help" onClick={(e) => { nav("/help")(e); setMenuOpen(false) }}>Help</a>
                  <a href="/contact" onClick={(e) => { nav("/contact")(e); setMenuOpen(false) }}>Contact</a>
                </nav>
              </>
            )}
          </div>
        </header>

        <main id="main-content">
          <section className="home-hero" aria-labelledby="home-title">
            <div className="home-wrap home-hero-grid">
              <div className="home-hero-copy">
                <h1 id="home-title">From <span>palette</span> to<br />preview.</h1>
                <p>
                  Choose colours, preview them on real website, app, and component layouts, then fine-tune until
                  everything looks right. Export is coming soon.
                </p>
                <div className="home-hero-actions">
                  <a href="/generate" onClick={openGenerate} className="home-button home-button-primary">Generate a Design <span aria-hidden>→</span></a>
                  <a href="/quick-design" onClick={openQuickDesign} className="home-button home-button-secondary">Quick Design</a>
                </div>
              </div>

              <div className="home-promo" aria-label="HueSet live preview example">
                <div className="home-promo-chrome" aria-hidden="true"><i /><i /><i /></div>
                <div className="home-promo-main">
                  <p>Live Preview</p>
                  <h2>Generate a design with<br />confidence.</h2>
                  <div>
                    <a href="#create-button">Try it</a>
                    <a href="/quick-design" onClick={openQuickDesign}>Quick Design</a>
                  </div>
                </div>
                <div className="home-promo-palette" aria-label="Example palette swatches">
                  <PromoSwatch label="Background" colour="#2E333A" />
                  <PromoSwatch label="Primary" colour={BRAND.cta} />
                  <PromoSwatch label="Secondary" colour={BRAND.secondary} />
                  <PromoSwatch label="Text" colour="#FFFFFF" />
                  <PromoSwatch label="Muted" colour="#D9D9D9" />
                </div>
              </div>
            </div>
          </section>

          <section className="home-demo-section" aria-label="Interactive design controls">
            <div className="home-wrap home-demo-grid">
              <div className="home-demo-column" id="create-button">
                <div className="home-section-heading">
                  <h2>Create Button</h2>
                  <p>Pick a colour, choose a style, and press the button.</p>
                </div>
                <div className="home-lab">
                  <div className="home-lab-stage">
                    <button
                      type="button"
                      className="home-demo-button"
                      data-style={demoStyle}
                      style={previewStyle as CSSProperties}
                    >
                      Example
                    </button>
                  </div>
                  <div className="home-lab-controls">
                    <ControlGroup label="Style">
                      <SegmentedControl options={STYLE_OPTIONS} value={demoStyle} onChange={setDemoStyle} label="Button style" />
                    </ControlGroup>
                    <ControlGroup label="Colours">
                      <div className="home-colour-grid">
                        {(["primary", "secondary", "text"] as DemoColour[]).map((role) => (
                          <ColourControl
                            key={role}
                            label={role === "text" ? "Text" : `${role.charAt(0).toUpperCase()}${role.slice(1)}`}
                            value={colours[role]}
                            muted={role === "secondary" && demoStyle === "simple"}
                            onChange={(value) => updateColour(role, value)}
                            onHexInput={(raw) => handleHexInput(role, raw)}
                          />
                        ))}
                      </div>
                    </ControlGroup>
                  </div>
                </div>
              </div>

              <div className="home-demo-column">
                <div className="home-section-heading">
                  <h2>Preview State</h2>
                  <p>Choose a state and see it come to life.</p>
                </div>
                <div className="home-lab">
                  <div className="home-lab-stage">
                    {previewState === "disabled" ? (
                      <div
                        key={`${animation}-${previewState}-${animationRun}`}
                        className="home-demo-button home-state-button"
                        data-animation={animation}
                        data-state="disabled"
                        style={stateStyle as CSSProperties}
                        role="img"
                        aria-label="Disabled button preview"
                      >
                        Example
                      </div>
                    ) : (
                      <button
                        key={`${animation}-${previewState}-${animationRun}`}
                        type="button"
                        className="home-demo-button home-state-button"
                        data-animation={animation}
                        data-state={previewState}
                        style={stateStyle as CSSProperties}
                        onClick={runAnimation}
                      >
                        Example
                      </button>
                    )}
                  </div>
                  <div className="home-lab-controls">
                    <ControlGroup label="Animation">
                      <SegmentedControl options={ANIMATION_OPTIONS} value={animation} onChange={chooseAnimation} label="Button animation" />
                    </ControlGroup>
                    <ControlGroup label="States">
                      <div className="home-state-grid" aria-label="Button state">
                        {stateOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={previewState === option.value ? "active" : ""}
                            aria-pressed={previewState === option.value}
                            onClick={() => chooseState(option.value)}
                          >
                            <strong>{option.label}</strong>
                            <span><i style={{ background: option.colour }} />{option.colour}</span>
                          </button>
                        ))}
                      </div>
                    </ControlGroup>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="home-help-section" aria-labelledby="help-title">
            <div className="home-wrap">
              <div className="home-section-heading">
                <h2 id="help-title">What We Do To Help</h2>
                <p>Three steps from an idea to colours you can trust.</p>
              </div>
              <div className="home-help-grid">
                <HelpCard title="Pick your colours" icon="palette">Choose the colours you want to use.</HelpCard>
                <HelpCard title="See them live" icon="preview">Watch them on a real button and design.</HelpCard>
                <HelpCard title="Save your work" icon="save">Keep your palette when it looks right. Export is coming soon.</HelpCard>
              </div>
            </div>
          </section>

          <section className="home-offer-section" id="what-we-offer" aria-labelledby="offer-title">
            <div className="home-wrap">
              <div className="home-section-heading">
                <h2 id="offer-title">What We Offer</h2>
                <p>Four ways to get started.</p>
              </div>
              <div className="home-offer-grid">
                <OfferCard
                  title="Build a Full Design System"
                  description="Choose a template, customise typography and components, then export tokens."
                  href="/generate"
                  onClick={openGenerate}
                  action="Full Design System"
                  detailLabel="How It Works"
                  detailHref="/generate"
                  detailClick={openGenerate}
                />
                <OfferCard
                  title="Preview My Palette"
                  description="Pick colours and see them on live previews in about 30 seconds."
                  href="/quick-design"
                  onClick={openQuickDesign}
                  action="Quick Design"
                  detailLabel="How It Works"
                  detailHref="/help"
                  detailClick={nav("/help")}
                />
                <OfferCard
                  id="offer-learn"
                  title="Free Designing Lessons"
                  description="Learn how experienced designers make good decisions about colour, type, layout, accessibility and design systems."
                  href="/learn"
                  onClick={nav("/learn")}
                  action="Start Learning"
                  detailLabel="What To Expect"
                  detailHref="/learn"
                  detailClick={nav("/learn")}
                />
                <OfferCard
                  id="offer-examples"
                  title="Get Inspired With Examples"
                  description="Browse original HueSet examples for websites, apps, dashboards, pricing, authentication and components."
                  href="/examples"
                  onClick={nav("/examples")}
                  action="View Examples"
                  detailLabel="Browse Examples"
                  detailHref="/examples"
                  detailClick={nav("/examples")}
                />
              </div>
            </div>
          </section>
        </main>

        <footer className="home-footer">
          <div className="home-wrap home-footer-inner">
            <a href="#top" className="home-brand home-footer-brand" aria-label="HueSet home">
              <img className="home-brand-icon" src="/hueset-icon.svg" alt="" />
              <img className="home-brand-wordmark" src="/hueset-wordmark.svg" alt="HueSet" />
            </a>
            <nav aria-label="Footer navigation">
              <a href="/pricing" onClick={nav("/pricing")}>Pricing</a>
              <a href="/privacy" onClick={nav("/privacy")}>Privacy</a>
              <a href="/terms" onClick={nav("/terms")}>Terms and Conditions</a>
              <a href="/contact" onClick={nav("/contact")}>Contact</a>
              <a href="/help" onClick={nav("/help")}>Help</a>
              <a href="/about" onClick={nav("/about")}>About</a>
            </nav>
            <small>© 2026 HueSet</small>
          </div>
        </footer>
      </div>
    </div>
  )
}

function PromoSwatch({ label, colour }: { label: string; colour: string }) {
  return <span className="home-promo-swatch"><i style={{ background: colour }} /><small>{label}</small></span>
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <fieldset className="home-control-group"><legend>{label}</legend>{children}</fieldset>
}

function SegmentedControl<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div className="home-segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function ColourControl({ label, value, muted, onChange, onHexInput }: {
  label: string
  value: string
  muted?: boolean
  onChange: (value: string) => void
  onHexInput: (raw: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const beginEdit = () => { setDraft(value); setEditing(true) }
  const commitEdit = () => { onHexInput(draft); setEditing(false) }

  return (
    <label className={`home-colour-control ${muted ? "muted" : ""}`}>
      <strong>{label}</strong>
      <span>
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} aria-label={`${label} colour`} />
        {editing ? (
          <input
            type="text"
            className="home-hex-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === "Enter") commitEdit() }}
            aria-label={`${label} hex value`}
            autoFocus
            maxLength={7}
          />
        ) : (
          <b
            onClick={beginEdit}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") beginEdit() }}
            role="button"
            tabIndex={0}
            aria-label={`Edit ${label} hex value`}
          >
            {value.toUpperCase()}
          </b>
        )}
      </span>
    </label>
  )
}

const HELP_ICONS = {
  palette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="2" /><circle cx="17.5" cy="10.5" r="2" /><circle cx="8.5" cy="7.5" r="2" />
      <circle cx="6.5" cy="12.5" r="2" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.7 1.5-1.5 0-.39-.15-.74-.39-1.04-.23-.29-.38-.63-.38-1.04 0-.81.68-1.42 1.5-1.42H16c3.31 0 6-2.69 6-6 0-5.17-4.49-9-10-9z" />
    </svg>
  ),
  preview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  ),
} as const

function HelpCard({ title, icon, children }: { title: string; icon: keyof typeof HELP_ICONS; children: string }) {
  return (
    <article className="home-help-card">
      <span aria-hidden="true">{HELP_ICONS[icon]}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  )
}

function OfferCard({ id, title, description, href, onClick, action, detailLabel, detailHref, detailClick }: {
  id?: string
  title: string
  description: string
  href: string
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
  action: string
  detailLabel: string
  detailHref: string
  detailClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <article className="home-offer-card" id={id}>
      <h3>{title}</h3>
      <p>{description}</p>
      <a href={href} onClick={onClick}>{action}</a>
      <small><a href={detailHref} onClick={detailClick}>{detailLabel}</a></small>
    </article>
  )
}
