import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

const LAST_UPDATED = "1 September 2026"

export default function Terms() {
  const nav = useNav()
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-14 sm:py-20">
        <h1 className="text-[32px] font-bold sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>Terms of Service</h1>
        <p className="text-[13px] text-charcoal/50">Last updated: {LAST_UPDATED}</p>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          <b>Legal review required.</b> This draft is not legal advice. Placeholders below must be completed by the product owner and qualified counsel before launch.
        </p>
        <div className="flex flex-col gap-4 text-[14.5px] leading-relaxed text-charcoal/75">
          <p>By using HueSet you agree to these terms during early access.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Fair use</h2>
          <p>Use HueSet for design exploration, testing colour palettes, and creating your own products. Do not abuse the service, attempt to break it, or upload assets you do not have the right to use.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Your content</h2>
          <p>Anything you upload (logos, symbols) stays on your device unless you choose to export or share it elsewhere. You retain rights to your work. HueSet does not claim ownership of your palettes or uploads.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>No warranty</h2>
          <p>HueSet is provided <b>as-is</b> during early access. We work to keep it reliable, but we do not guarantee uninterrupted availability or that every feature will work without bugs. Do not rely on it as your only source of truth for production design systems.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Review points (owner + counsel)</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <b>Billing &amp; subscriptions:</b>{" "}
              <span className="rounded border border-dashed border-charcoal/20 bg-offwhite px-2 py-0.5 text-[13px]">
                Add terms for planned First Export ($0.99 one-time) and Pro ($14.99/month) when Stripe checkout is enabled.
              </span>
            </li>
            <li>
              <b>Cancellation:</b>{" "}
              <span className="rounded border border-dashed border-charcoal/20 bg-offwhite px-2 py-0.5 text-[13px]">
                Define how users cancel Pro and when access ends.
              </span>
            </li>
            <li>
              <b>Refunds:</b>{" "}
              <span className="rounded border border-dashed border-charcoal/20 bg-offwhite px-2 py-0.5 text-[13px]">
                Define refund eligibility for First Export and Pro — not specified here.
              </span>
            </li>
            <li>
              <b>Limitation of liability:</b>{" "}
              <span className="rounded border border-dashed border-charcoal/20 bg-offwhite px-2 py-0.5 text-[13px]">
                Add liability cap and excluded damages with legal review.
              </span>
            </li>
            <li>
              <b>Governing law &amp; disputes:</b>{" "}
              <span className="rounded border border-dashed border-charcoal/20 bg-offwhite px-2 py-0.5 text-[13px]">
                Specify jurisdiction and dispute process — not specified here.
              </span>
            </li>
            <li>
              <b>Contact entity:</b>{" "}
              <span className="rounded border border-dashed border-charcoal/20 bg-offwhite px-2 py-0.5 text-[13px]">
                Add legal entity name, postal address, and support contact when available. General contact: <a href="/contact" onClick={nav("/contact")} className="underline">Contact page</a>.
              </span>
            </li>
          </ul>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Changes</h2>
          <p>These terms may change as the product evolves. Material changes will be reflected on this page with an updated &ldquo;Last updated&rdquo; date.</p>

          <p className="mt-4">Questions? Please use the <a href="/contact" onClick={nav("/contact")} className="font-semibold underline">Contact</a> page.</p>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
