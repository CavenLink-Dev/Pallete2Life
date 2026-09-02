import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

const LAST_UPDATED = "1 September 2026"

export default function Privacy() {
  const nav = useNav()
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-14 sm:py-20">
        <h1 className="text-[32px] font-bold sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>Privacy Policy</h1>
        <p className="text-[13px] text-charcoal/50">Last updated: {LAST_UPDATED}</p>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          <b>Legal review required.</b> This draft describes current product behaviour. A qualified lawyer should review before publication.
        </p>
        <div className="flex flex-col gap-4 text-[14.5px] leading-relaxed text-charcoal/75">
          <p><b>Short version.</b> HueSet is a browser tool. Your palettes, brand uploads, template choices, and workspace preferences are stored on your device. We do not operate a HueSet backend that stores your design data.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>What is stored on your device</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Palette colours, locks, and role bindings — in <code>localStorage</code> (workspace key <code>hueframe:v1</code> and related palette keys).</li>
            <li>Brand asset uploads (logo and app icon as data URLs), template selections, element customisations, and panel preferences — same workspace storage.</li>
            <li>Onboarding progress, generate-flow state, and entitlement flags (free/Pro status for local UI) — separate <code>localStorage</code> keys prefixed with <code>pallet-preview:</code>.</li>
            <li>When export checkout is enabled in the future, a local profile (name and email) may be stored after account setup — still on your device until a real account system ships.</li>
          </ul>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>What we do not store today</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Your palette or brand files on a HueSet server.</li>
            <li>Marketing email lists from in-app forms (Contact uses your email client; we do not receive submissions unless you send them).</li>
            <li>Third-party advertising or cross-site tracking pixels in the app.</li>
          </ul>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Hosting</h2>
          <p>Like most websites, our hosting provider may process basic request metadata (IP address, user agent, timestamps) to deliver the site. We do not add separate analytics SDKs in the app today.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Payments (when enabled)</h2>
          <p className="rounded-lg border border-dashed border-charcoal/20 bg-offwhite px-3 py-2 text-[13px] text-charcoal/60">
            <b>Review point — billing:</b> When Stripe checkout launches, payment processing will be handled by Stripe under their privacy policy. This section must be updated with processor details, data collected, and retention before enabling payments.
          </p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>If this changes</h2>
          <p>If we add accounts, cloud sync, or optional analytics, this page will be updated first with a new &ldquo;Last updated&rdquo; date.</p>

          <p className="mt-4">Questions? Please use the <a href="/contact" onClick={nav("/contact")} className="font-semibold underline">Contact</a> page.</p>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
