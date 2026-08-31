import { useState, type CSSProperties } from "react"
import { useNav } from "../lib/router"
import "./Home.css"

type DemoStyle = "simple" | "3d" | "outline"
type DemoColour = "primary" | "secondary" | "text"

const USES: Record<DemoStyle, DemoColour[]> = {
  simple: ["primary", "text"],
  "3d": ["primary", "secondary", "text"],
  outline: ["primary", "secondary"],
}

export default function Home() {
  const nav = useNav()
  const [demoStyle, setDemoStyle] = useState<DemoStyle>("simple")
  const [colours, setColours] = useState<Record<DemoColour, string>>({
    primary: "#2AB0E4",
    secondary: "#0E6E86",
    text: "#FFFFFF",
  })

  const previewStyle = demoStyle === "simple"
    ? { "--face": colours.primary, "--txt": colours.text }
    : demoStyle === "3d"
      ? { "--face": colours.primary, "--edge": colours.secondary, "--txt": colours.text }
      : { "--txt": colours.primary, "--border": colours.secondary }

  const openApp = nav("/app")
  const openQuickDesign = nav("/quick-design")

  return (
    <div className="hueset-home" id="top">
      <header className="home-nav">
        <div className="home-wrap home-nav-inner">
          <a href="#top" className="home-brand"><img src="/logo-64.png" alt="" />HueSet</a>
          <nav className="home-nav-links" aria-label="Primary">
            <a href="#try">Try it</a>
            <a href="#how">How it works</a>
            <a href="#start">Get started</a>
          </nav>
          <a href="/app" onClick={openApp} className="home-btn home-btn-primary">Generate Design</a>
        </div>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-wrap home-hero-grid">
            <div>
              <h1>
                From <span className="home-hero-palette">palette</span> to design system.
              </h1>
              <p className="home-lead">Generate variables, preview, test, edit and create tokens. Then output to any design project.</p>
              <div className="home-hero-cta">
                <a href="/app" onClick={openApp} className="home-btn home-btn-primary">Generate Design <span aria-hidden>→</span></a>
                <a href="/quick-design" onClick={openQuickDesign} className="home-btn home-btn-secondary">Quick Design</a>
              </div>
            </div>

            <div className="home-promo" aria-hidden="true">
              <div className="home-chrome"><b className="red" /><b className="yellow" /><b className="green" /></div>
              <div className="home-promo-panel">
                <span className="home-promo-label">Live Preview</span>
                <div className="home-promo-title">Generate a design with confidence.</div>
                <div className="home-promo-buttons"><span className="home-promo-button solid">Try it</span><span className="home-promo-button ghost">Learn more</span></div>
              </div>
              <div className="home-promo-swatches">
                <i style={{ background: "#2CD1C0" }} /><i style={{ background: "#2AB0E4" }} /><i style={{ background: "#0E6E86" }} /><span className="plus">+</span>
              </div>
            </div>
          </div>
        </section>

        <section id="try" className="home-section">
          <div className="home-wrap">
            <div className="home-center">
              <h2>Try it live</h2>
              <p className="home-lead-secondary">Pick a colour, choose a style, and press the button.</p>
            </div>
            <div className="home-lab">
              <div className="home-stage">
                <button id="previewBtn" type="button" data-var={demoStyle} style={previewStyle as CSSProperties}>Get Started</button>
              </div>
              <div className="home-controls">
                <div className="home-field">
                  <span className="home-field-label">Style</span>
                  <div className="home-segmented" role="radiogroup" aria-label="Button style">
                    {(["simple", "3d", "outline"] as DemoStyle[]).map((style) => (
                      <label key={style}>
                        <input type="radio" name="style" value={style} checked={demoStyle === style} onChange={() => setDemoStyle(style)} />
                        <span>{style === "simple" ? "Simple" : style === "3d" ? "3D" : "Outline"}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="home-field">
                  <span className="home-field-label">Colours</span>
                  <div className="home-roles">
                    {(["primary", "secondary", "text"] as DemoColour[]).map((role) => {
                      const used = USES[demoStyle].includes(role)
                      const label = role[0].toUpperCase() + role.slice(1)
                      return (
                        <div key={role} className={`home-role ${used ? "" : "dim"}`}>
                          <div className="home-role-label"><span>{label}</span><span className="not-used">not used</span></div>
                          <div className="home-colour-pick">
                            <input
                              type="color"
                              value={colours[role]}
                              aria-label={`${label} colour`}
                              onChange={(event) => setColours((current) => ({ ...current, [role]: event.target.value.toUpperCase() }))}
                            />
                            <span className="home-hex">{colours[role].toUpperCase()}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section home-grey" id="how">
          <div className="home-wrap">
            <div className="home-center">
              <h2>How it works</h2>
              <p className="home-lead-secondary">Three steps from an idea to colours you can trust.</p>
            </div>
            <div className="home-steps">
              <HomeStep title="Pick your colours">Choose the colours you want to use.</HomeStep>
              <HomeStep title="See them live">Watch them on a real button and design.</HomeStep>
              <HomeStep title="Export">Save your palette when it looks right.</HomeStep>
            </div>
          </div>
        </section>

        <section className="home-section" id="start">
          <div className="home-wrap">
            <div className="home-center">
              <h2>Start with the path that fits you.</h2>
              <p className="home-lead-secondary">Two simple ways to begin.</p>
            </div>
            <div className="home-paths">
              <div className="home-path main">
                <h3>Generate Design</h3>
                <p>Build a full design with saved colours you can reuse. More control, still simple.</p>
                <a href="/app" onClick={openApp} className="home-btn home-btn-primary">Generate Design</a>
                <details><summary>What are tokens and variables?</summary><p>Just saved colours. Change one and it updates everywhere you used it, so your design stays in sync.</p></details>
              </div>
              <div className="home-path">
                <h3>Quick Design</h3>
                <p>Pick colours and see them on a ready-made template right away. Fast and simple.</p>
                <a href="/quick-design" onClick={openQuickDesign} className="home-btn home-btn-secondary">Quick Design</a>
                <details><summary>What's this for?</summary><p>Best if you want to play with colours quickly and get an instant live preview.</p></details>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-wrap home-footer-inner">
          <a href="#top" className="home-brand"><img src="/logo-64.png" alt="" />HueSet</a>
          <nav aria-label="Footer"><a href="#try">Try it</a><a href="#start">Get started</a></nav>
          <small>© 2026 HueSet</small>
        </div>
      </footer>
    </div>
  )
}

function HomeStep({ title, children }: { title: string; children: string }) {
  return <div className="home-step"><div className="number" /><h3>{title}</h3><p>{children}</p></div>
}
