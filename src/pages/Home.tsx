import { useEffect, useState, type CSSProperties } from "react"
import { useNav } from "../lib/router"
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

const STATE_OPTIONS: { value: DemoState; label: string; colour: string }[] = [
  { value: "pressed", label: "Pressed", colour: "#2FB5ED" },
  { value: "hovered", label: "Hovered", colour: "#75D6FF" },
  { value: "disabled", label: "Disabled", colour: "#1093CA" },
]

export default function Home() {
  const nav = useNav()
  const [menuOpen, setMenuOpen] = useState(false)
  const [demoStyle, setDemoStyle] = useState<DemoStyle>("simple")
  const [animation, setAnimation] = useState<DemoAnimation>("depth")
  const [previewState, setPreviewState] = useState<DemoState>("pressed")
  const [animationRun, setAnimationRun] = useState(0)
  const [colours, setColours] = useState<Record<DemoColour, string>>({
    primary: "#13A8E7",
    secondary: "#13A8E7",
    text: "#FFFFFF",
  })

  useEffect(() => {
    if (!menuOpen) return
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [menuOpen])

  const previewStyle = demoStyle === "simple"
    ? { "--face": colours.primary, "--txt": colours.text }
    : demoStyle === "3d"
      ? { "--face": colours.primary, "--edge": colours.secondary, "--txt": colours.text }
      : { "--face": "transparent", "--border": colours.secondary, "--txt": colours.primary }

  const activeState = STATE_OPTIONS.find((option) => option.value === previewState) ?? STATE_OPTIONS[0]
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

  return (
    <div className="hueset-home-shell">
      <div className="hueset-home" id="top">
        <header className="home-nav">
          <div className="home-wrap home-nav-inner">
            <a href="#top" className="home-brand" aria-label="HueSet home">
              <img className="home-brand-icon" src="/hueset-icon.svg" alt="" />
              <img className="home-brand-wordmark" src="/hueset-wordmark.svg" alt="HueSet" />
            </a>

            <nav className="home-nav-links" aria-label="Primary navigation">
              <a href="#offer-learn">Learn</a>
              <a href="#offer-examples">Example</a>
              <button
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
              <nav id="home-menu" className="home-menu" aria-label="HueSet menu">
                <a href="/generate" onClick={(event) => { openGenerate(event); setMenuOpen(false) }}>Generate a Design</a>
                <a href="/quick-design" onClick={(event) => { openQuickDesign(event); setMenuOpen(false) }}>Quick Design</a>
                <a href="/pricing" onClick={(event) => { nav("/pricing")(event); setMenuOpen(false) }}>Pricing</a>
                <a href="/help" onClick={(event) => { nav("/help")(event); setMenuOpen(false) }}>Help</a>
                <a href="/contact" onClick={(event) => { nav("/contact")(event); setMenuOpen(false) }}>Contact</a>
              </nav>
            )}
          </div>
        </header>

        <main>
          <section className="home-hero" aria-labelledby="home-title">
            <div className="home-wrap home-hero-grid">
              <div className="home-hero-copy">
                <h1 id="home-title">From <span>palette</span> to<br />design tool.</h1>
                <p>
                  Choose a palette. Preview, test, edit and create variables. Learn from expert designers &amp; research,
                  explore website and app inspiration, then output to any design project.
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
                <div className="home-promo-palette" aria-label="Example palette">
                  <PromoSwatch label="Background Primary" colour="#2E333A" />
                  <PromoSwatch label="Primary" colour="#13A8E7" />
                  <PromoSwatch label="Secondary" colour="#168EB8" />
                  <PromoSwatch label="Primary Text" colour="#FFFFFF" />
                  <PromoSwatch label="Secondary Text" colour="#D9D9D9" />
                  <span className="home-promo-add" aria-hidden>+</span>
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
                            onChange={(value) => setColours((current) => ({ ...current, [role]: value.toUpperCase() }))}
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
                    <button
                      key={`${animation}-${previewState}-${animationRun}`}
                      type="button"
                      className="home-demo-button home-state-button"
                      data-animation={animation}
                      data-state={previewState}
                      style={stateStyle as CSSProperties}
                      disabled={previewState === "disabled"}
                      onClick={runAnimation}
                    >
                      Example
                    </button>
                  </div>
                  <div className="home-lab-controls">
                    <ControlGroup label="Animation">
                      <SegmentedControl options={ANIMATION_OPTIONS} value={animation} onChange={chooseAnimation} label="Button animation" />
                    </ControlGroup>
                    <ControlGroup label="States">
                      <div className="home-state-grid" aria-label="Button state">
                        {STATE_OPTIONS.map((option) => (
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
                <HelpCard title="Pick your colours">Choose the colours you want to use.</HelpCard>
                <HelpCard title="See them live">Watch them on a real button and design.</HelpCard>
                <HelpCard title="Export">Save your palette when it looks right.</HelpCard>
              </div>
            </div>
          </section>

          <section className="home-offer-section" id="what-we-offer" aria-labelledby="offer-title">
            <div className="home-wrap">
              <div className="home-section-heading">
                <h2 id="offer-title">What We Offer</h2>
                <p>Two simple ways to begin.</p>
              </div>
              <div className="home-offer-grid">
                <OfferCard
                  title="Build a Full Design System"
                  description="Choose a template, customise typography and components, then export tokens."
                  href="/generate"
                  onClick={openGenerate}
                  action="Full Design System"
                  detail="How It Works?"
                />
                <OfferCard
                  title="Preview My Palette"
                  description="Pick colours and see them on live previews in about 30 seconds."
                  href="/quick-design"
                  onClick={openQuickDesign}
                  action="Quick Design"
                  detail="How It Works?"
                />
                <OfferCard
                  id="offer-learn"
                  title="Free Designing Lessons"
                  description="Learn how experienced designers make good decisions about colour, type, layout, accessibility and design systems."
                  href="/help"
                  onClick={nav("/help")}
                  action="Start Learning"
                  detail="What To Expect?"
                />
                <OfferCard
                  id="offer-examples"
                  title="Get Inspired With Examples"
                  description="Browse original HueSet examples for websites, apps, dashboards, pricing, authentication and components."
                  href="/app"
                  onClick={nav("/app")}
                  action="View Examples"
                  detail="What's this for?"
                />
              </div>
            </div>
          </section>
        </main>

        <footer className="home-footer">
          <div className="home-wrap home-footer-inner">
            <a href="#top" className="home-footer-brand" aria-label="HueSet home">
              <img src="/hueset-icon.svg" alt="" />
              <img src="/hueset-wordmark.svg" alt="HueSet" />
            </a>
            <nav aria-label="Footer navigation">
              <a href="/pricing" onClick={nav("/pricing")}>Pricing</a>
              <a href="/privacy" onClick={nav("/privacy")}>Privacy</a>
              <a href="/terms" onClick={nav("/terms")}>Terms and Conditions</a>
              <a href="/contact" onClick={nav("/contact")}>Contact</a>
              <a href="/help" onClick={nav("/help")}>Help</a>
              <a href="#what-we-offer">About Us</a>
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

function ColourControl({ label, value, muted, onChange }: {
  label: string
  value: string
  muted?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className={`home-colour-control ${muted ? "muted" : ""}`}>
      <strong>{label}{label === "Text" && <span aria-hidden>⌄</span>}</strong>
      <span>
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} aria-label={`${label} colour`} />
        <b>{value.toUpperCase()}</b>
      </span>
    </label>
  )
}

function HelpCard({ title, children }: { title: string; children: string }) {
  return (
    <article className="home-help-card">
      <span aria-hidden />
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  )
}

function OfferCard({ id, title, description, href, onClick, action, detail }: {
  id?: string
  title: string
  description: string
  href: string
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
  action: string
  detail: string
}) {
  return (
    <article className="home-offer-card" id={id}>
      <h3>{title}</h3>
      <p>{description}</p>
      <a href={href} onClick={onClick}>{action}</a>
      <small>{detail}</small>
    </article>
  )
}
