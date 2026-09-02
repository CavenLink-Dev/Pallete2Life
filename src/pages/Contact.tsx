import { useState } from "react"
import { BRAND } from "../lib/color"
import {
  SUPPORT_EMAIL,
  buildBugReportMailto,
  detectBrowserLabel,
  detectDeviceLabel,
} from "../lib/contactSupport"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Contact() {
  const [route, setRoute] = useState(() => (typeof window !== "undefined" ? window.location.pathname : ""))
  const [device, setDevice] = useState(() => detectDeviceLabel())
  const [browser, setBrowser] = useState(() => detectBrowserLabel())
  const [description, setDescription] = useState("")
  const [steps, setSteps] = useState("")
  const [copied, setCopied] = useState(false)

  const canSubmit = description.trim().length > 0

  const copyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      /* clipboard API not available — the email is visible */
    })
  }

  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-14 sm:py-20">
        <div>
          <h1 className="text-[32px] font-bold sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>Contact</h1>
          <p className="mt-3 text-[15px] text-charcoal/65">
            Feedback, bug reports, feature requests, teams enquiries — all welcome.
          </p>
        </div>

        {/* Email card with copy fallback */}
        <div className="rounded-2xl border border-softgrey bg-white p-6">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-charcoal/45">Email</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-[20px] font-bold underline"
              style={{ color: BRAND.cta, fontFamily: "var(--font-display)" }}
            >
              {SUPPORT_EMAIL}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="min-h-9 rounded-lg border border-softgrey bg-offwhite px-3 py-1 text-[12px] font-semibold text-charcoal/70 transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
            >
              {copied ? "Copied" : "Copy address"}
            </button>
          </div>
          <p className="mt-4 text-[13.5px] leading-relaxed text-charcoal/65">
            For general feedback, questions, or feature requests, send a plain email.
            For structured bug reports, use the form below — it opens your email client with the details filled in.
          </p>
          <p className="mt-2 text-[12px] text-charcoal/50">
            If your email client does not open, copy the address above and paste it into your preferred email app.
          </p>
        </div>

        {/* Bug report form */}
        <form
          className="rounded-2xl border border-softgrey bg-white p-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (!canSubmit) return
            window.location.href = buildBugReportMailto({ route, device, browser, description: description.trim(), steps: steps.trim() })
          }}
        >
          <h2 className="text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Report a bug</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-charcoal/65">
            HueSet saves your colours locally. Try refreshing first — your work should still be there on the same browser.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <Field label="Route / page">
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="/app"
                className="h-11 w-full rounded-lg border border-softgrey px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Device (screen size)">
                <input
                  type="text"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="h-11 w-full rounded-lg border border-softgrey px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                />
              </Field>
              <Field label="Browser">
                <input
                  type="text"
                  value={browser}
                  onChange={(e) => setBrowser(e.target.value)}
                  className="h-11 w-full rounded-lg border border-softgrey px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                />
              </Field>
            </div>
            <Field label="What happened?">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full rounded-lg border border-softgrey px-3 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
              />
            </Field>
            <Field label="Steps to reproduce">
              <textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                rows={3}
                placeholder="1. Open /app&#10;2. Click Export&#10;3. …"
                className="w-full rounded-lg border border-softgrey px-3 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
            style={{ background: "#0A6288" }}
          >
            Open email with report
          </button>
        </form>
      </main>
      <PublicFooter />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-semibold text-charcoal/65">{label}</span>
      {children}
    </label>
  )
}
