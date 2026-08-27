import { BRAND } from "../lib/color"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Contact() {
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-14 sm:py-20">
        <div>
          <h1 className="text-[32px] font-bold sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>Contact</h1>
          <p className="mt-3 text-[15px] text-charcoal/65">
            Feedback, bug reports, feature requests, teams enquiries — all welcome.
          </p>
        </div>
        <div className="rounded-2xl border border-softgrey bg-white p-6">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-charcoal/45">Email</p>
          <a
            href="mailto:cavenlink.dev@gmail.com"
            className="mt-1 block text-[20px] font-bold underline"
            style={{ color: BRAND.brand, fontFamily: "var(--font-display)" }}
          >
            cavenlink.dev@gmail.com
          </a>
          <p className="mt-4 text-[13.5px] leading-relaxed text-charcoal/65">
            The fastest way to reach us. Include a screenshot or a short description of what you were trying to do and we'll get back within a few working days.
          </p>
        </div>
        <div className="rounded-2xl border border-softgrey bg-white p-6">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-charcoal/45">Report a bug</p>
          <p className="mt-2 text-[14px] leading-relaxed text-charcoal/75">
            The Builder saves your palette locally. If something breaks, try refreshing first — your work should still be there. If it persists, email us with the steps you took.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
