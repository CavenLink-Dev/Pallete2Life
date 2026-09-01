import { useState } from "react"
import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"
import { GuideWalkthrough } from "../components/generate-design/GuideStep"

export default function Help() {
  const nav = useNav()
  const [guideOpen, setGuideOpen] = useState(false)
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-14 sm:py-20">
        <div>
          <h1 className="text-[32px] font-bold sm:text-[42px]" style={{ fontFamily: "var(--font-display)" }}>Help & guide</h1>
          <p className="mt-3 text-[15px] text-charcoal/65">
            Everything you need to know about HueSet, in plain language.
          </p>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="mt-4 min-h-11 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
            style={{ background: BRAND.cta }}
          >
            Replay the HueSet guide
          </button>
        </div>

        <Section title="How HueSet works">
          <p>HueSet keeps your colours, templates and export tools together in one workspace so you can decide on a visual direction before moving into Figma or development.</p>
          <ol className="mt-3 flex flex-col gap-2 pl-5" style={{ listStyle: "decimal" }}>
            <li><b>Create your colours.</b> Open Palette, choose a swatch and edit its HEX, RGB or HSL values. Lock colours you want Randomise to keep.</li>
            <li><b>Try a template.</b> Use <b>Change template</b> in the toolbar to see the palette on a real interface.</li>
            <li><b>Export your work.</b> Copy or download palette values and design tokens from <b>Export</b>.</li>
          </ol>
        </Section>

        <Section title="Palette tools">
          <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: "disc" }}>
            <li><b>Click a colour</b> to open its HEX, RGB and HSL editor.</li>
            <li><b>Lock a colour</b> so Randomise keeps it while the others change.</li>
            <li><b>Randomise</b> generates new colours for anything not locked.</li>
            <li><b>Add colour</b> adds another column. Remove a colour from inside its editor.</li>
            <li><b>Export</b> copies or downloads your real colour values and available design tokens.</li>
          </ul>
        </Section>

        <Section title="Edit Mode">
          <p>Edit Mode is how you tell a specific element ("this button", "that heading") to use a specific colour from your palette. Turn it on with the Edit button in the header, then click anything in the preview. A small dialog appears with your palette — pick a colour and it applies. Turn Edit off when you're done exploring.</p>
        </Section>

        <Section title="Full Screen preview">
          <p>Click the Full screen button to fill the whole browser with just the preview and a compact palette bar. Press <kbd className="rounded border border-softgrey bg-white px-1.5 py-0.5 text-[11px] font-mono">Esc</kbd> or the Exit button to return to normal.</p>
        </Section>

        <Section title="Brand assets">
          <p>Click Brand to upload your own logo and app icon. Supported: SVG, PNG, JPG/JPEG, WebP · up to 5 MB. Transparent PNGs and SVGs work best. If your upload is refused, the reason (file type or size) is shown right there.</p>
        </Section>

        <Section title="Undo, Redo and Reset">
          <p>HueSet keeps a history of your palette changes. Use <b>Undo</b> and <b>Redo</b> to walk back and forth. <b>Reset palette</b> starts over — it asks for confirmation because your work would be lost.</p>
        </Section>

        <Section title="Accessibility">
          <p>Every important action has a text label. Tab through the interface, Enter to activate, and Escape to close dialogs. Primary buttons use a darker brand fill so white text meets WCAG 2.2 AA contrast. Palette colours you choose are checked in the colour editor and Second Opinion.</p>
        </Section>

        <Section title="Where your work is saved">
          <p>Your palette, brand assets and preview choices live in your browser (localStorage). Nothing is uploaded to a server. If you clear your browser data or switch device you'll start fresh. Accounts and cross-device sync are on the roadmap.</p>
        </Section>

        <Section title="Still stuck?">
          <p>
            The homepage has short instructions. If something's not working the way this page says it should,{" "}
            <a href="/contact" onClick={nav("/contact")} className="font-semibold underline" style={{ color: BRAND.cta }}>let us know</a>.
          </p>
        </Section>
      </main>
      <PublicFooter />
      <GuideWalkthrough open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[19px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <div className="text-[14.5px] leading-relaxed text-charcoal/75">{children}</div>
    </section>
  )
}
