import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Help() {
  const nav = useNav()
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-14 sm:py-20">
        <div>
          <h1 className="text-[32px] font-bold sm:text-[42px]" style={{ fontFamily: "var(--font-display)" }}>Help & guide</h1>
          <p className="mt-3 text-[15px] text-charcoal/65">
            Everything you need to know about Palette Preview, in plain language.
          </p>
        </div>

        <Section title="How Palette Preview works">
          <p>Palette Preview gives you two clear starting points. Quick Palette keeps the familiar colour columns and export tools, while Generate A Design applies your saved palette to a real interface.</p>
          <ol className="mt-3 flex flex-col gap-2 pl-5" style={{ listStyle: "decimal" }}>
            <li><b>Create your colours.</b> Click any large colour column to edit HEX, RGB or HSL. Lock colours you want Randomise to keep.</li>
            <li><b>Export for free.</b> Copy your HEX, RGB or HSL values, or download a basic palette file.</li>
            <li><b>Generate a design.</b> Choose <b>Create A Design System</b> to apply the current palette to website, application, and component previews.</li>
          </ol>
        </Section>

        <Section title="Quick Palette">
          <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: "disc" }}>
            <li><b>Click a colour</b> to open its HEX, RGB and HSL editor.</li>
            <li><b>Lock a colour</b> so Randomise keeps it while the others change.</li>
            <li><b>Randomise</b> generates new colours for anything not locked.</li>
            <li><b>Add colour</b> adds another column. Remove a colour from inside its editor.</li>
            <li><b>Export</b> copies or downloads your real colour values without using a preview.</li>
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
          <p>Palette Preview keeps a history of your palette changes. Use <b>Undo</b> and <b>Redo</b> to walk back and forth. <b>Reset palette</b> starts over — it asks for confirmation because your work would be lost.</p>
        </Section>

        <Section title="Accessibility">
          <p>Every important action has a text label and a keyboard shortcut. Tab through the interface, Enter to activate, and Escape to close dialogs. Text meets WCAG AA contrast by default. If a chosen palette colour doesn't reach AA contrast against typical text, the colour editor tells you.</p>
        </Section>

        <Section title="Where your work is saved">
          <p>Your palette, brand assets and preview choices live in your browser (localStorage). Nothing is uploaded to a server. If you clear your browser data or switch device you'll start fresh. Accounts and cross-device sync are on the roadmap.</p>
        </Section>

        <Section title="Still stuck?">
          <p>
            The homepage has short step-by-step instructions. If something's not working the way this page says it should,{" "}
            <a href="/contact" onClick={nav("/contact")} className="font-semibold underline" style={{ color: BRAND.brand }}>let us know</a>.
          </p>
        </Section>
      </main>
      <PublicFooter />
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
