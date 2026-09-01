import { useState } from "react"
import { BRAND } from "../lib/color"
import DialogShell from "./DialogShell"

type Props = {
  open: boolean
  onComplete: (profile: { name: string; email: string }) => void
  onLater: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AccountSetupOverlay({ open, onComplete, onLater }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const trimName = name.trim()
    const trimEmail = email.trim()
    if (!trimName) { setError("Please enter your name."); return }
    if (!EMAIL_RE.test(trimEmail)) { setError("Please enter a valid email address."); return }
    setError(null)
    onComplete({ name: trimName, email: trimEmail })
  }

  return (
    <DialogShell open={open} onClose={onLater} labelledBy="account-setup-title" panelClassName="max-w-[420px]" zClassName="z-[60]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.cta }}>
        Almost there
      </p>
      <h2 id="account-setup-title" className="mt-1 text-[26px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
        Create your account
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-charcoal/70">
        Set up a quick profile so your export and future projects are linked to you.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-charcoal/65">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            data-dialog-initial-focus
            className="h-11 rounded-lg border border-softgrey px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-charcoal/65">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="h-11 rounded-lg border border-softgrey px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
          />
        </label>
        {error && <p role="alert" className="rounded-lg bg-[#fef2f2] px-3 py-2 text-[12.5px] text-[#b42318]">{error}</p>}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onLater}
          className="min-h-11 rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13px] font-semibold text-charcoal/70 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={submit}
          className="min-h-11 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
          style={{ background: BRAND.cta }}
        >
          Create account
        </button>
      </div>
      <p className="mt-3 text-center text-[11px] text-charcoal/40">Powered by Stripe &middot; coming soon</p>
    </DialogShell>
  )
}
