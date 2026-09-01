import { useState } from "react"
import { BRAND } from "../lib/color"
import { PAYMENTS_ENABLED } from "../lib/entitlement"
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
            Everything you need to know about HueSet, in plain language. Labels match the current interface.
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
            <li><b>Create your colours.</b> Open the palette panel, choose a swatch and edit its HEX, RGB or HSL values. Lock colours you want Randomise to keep.</li>
            <li><b>Try a template.</b> In the design workspace (<b>/app</b>), use <b>Change template</b> in the toolbar to see the palette on a real interface.</li>
            <li><b>Customise elements.</b> Click anything in the preview to open the <b>Customise</b> panel and adjust typography, button styles, and colour roles.</li>
            <li><b>Export your work.</b> Use <b>Export</b> to copy or download palette values and design tokens when checkout is available. See <a href="/pricing" onClick={nav("/pricing")} className="font-semibold underline" style={{ color: BRAND.cta }}>Pricing</a> for current availability.</li>
          </ol>
        </Section>

        <Section title="Design workspace (/app)">
          <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: "disc" }}>
            <li><b>Undo</b> and <b>Redo</b> walk through palette and workspace history. Keyboard shortcuts are shown on those toolbar buttons where supported.</li>
            <li><b>Randomise</b> generates new colours for anything not locked.</li>
            <li><b>Reset</b> replaces your palette with defaults and asks for confirmation first.</li>
            <li><b>Change template</b>, <b>Export</b>, and <b>Second Opinion</b> are toolbar actions. Second Opinion is a Pro feature.</li>
            <li><b>Brand assets</b> and <b>Full screen</b> are in the toolbar on wide screens, or under <b>More tools</b> on smaller screens.</li>
            <li><b>Customise</b> opens the right-side panel for element-level edits.</li>
          </ul>
        </Section>

        <Section title="Quick Design (/quick-design)">
          <p>Quick Design is a lighter workspace for testing colours on three basic previews (Basic Website, Basic App, Basic Components). It includes palette editing, Undo/Redo, Reset, and a <b>Brand</b> section for logo uploads. It does not include Change template, Export, Full screen, Customise, or Second Opinion.</p>
        </Section>

        <Section title="Palette tools">
          <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: "disc" }}>
            <li><b>Click a colour</b> to open its HEX, RGB and HSL editor.</li>
            <li><b>Lock a colour</b> so Randomise keeps it while the others change.</li>
            <li><b>Add colour</b> adds another column.</li>
            <li><b>Remove</b> on a swatch row deletes that colour (with confirmation when needed).</li>
          </ul>
        </Section>

        <Section title="Full screen">
          <p>Click <b>Full screen</b> to fill the browser with the preview and a compact palette bar. In full screen you can open the palette panel and press <b>Exit Full Screen</b> to return. Press <kbd className="rounded border border-softgrey bg-white px-1.5 py-0.5 text-[11px] font-mono">Esc</kbd> when your browser supports exiting full-screen mode.</p>
        </Section>

        <Section title="Brand assets">
          <p>In the design workspace, open <b>Brand assets</b> to upload your logo and app icon. In Quick Design, use the <b>Brand</b> section. Supported formats: SVG, PNG, JPG/JPEG, WebP · up to 5 MB. If your upload is refused, the reason (file type or size) is shown in the dialog.</p>
        </Section>

        <Section title="Accessibility">
          <p>Important controls have text labels. Tab through the interface, Enter to activate, and Escape to close dialogs. Primary buttons use a darker brand fill so white text meets WCAG 2.2 AA contrast.</p>
          <p className="mt-2">Palette contrast is <b>not</b> checked automatically in the colour editor. Use <b>Second Opinion</b> (Pro) for WCAG contrast analysis when Pro checkout is available.</p>
        </Section>

        <Section title="Where your work is saved">
          <p>Your palette, brand assets, template choices, and workspace preferences are stored in your browser (<code>localStorage</code> under keys such as <code>hueframe:v1</code>). Nothing is uploaded to a HueSet server.</p>
          <p className="mt-2">Data persists across refreshes on the same browser and device. Clearing browser data or switching devices starts fresh. Cross-device sync is not available yet.</p>
          {!PAYMENTS_ENABLED && (
            <p className="mt-2">Export checkout is not live during early access. See <a href="/pricing" onClick={nav("/pricing")} className="font-semibold underline" style={{ color: BRAND.cta }}>Pricing</a> for planned export and Pro tiers.</p>
          )}
        </Section>

        <Section title="Still stuck?">
          <p>
            If something is not working the way this page describes,{" "}
            <a href="/contact" onClick={nav("/contact")} className="font-semibold underline" style={{ color: BRAND.cta }}>send us a bug report</a>.
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
