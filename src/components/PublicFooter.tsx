import { useNav } from "../lib/router"

export default function PublicFooter() {
  const nav = useNav()
  return (
    <footer className="border-t border-softgrey bg-white/70 px-6 py-8 text-[13px] text-charcoal/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} HueSet</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <a href="/pricing" onClick={nav("/pricing")} className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">Pricing</a>
          <a href="/help" onClick={nav("/help")} className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">Help</a>
          <a href="/privacy" onClick={nav("/privacy")} className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">Privacy</a>
          <a href="/terms" onClick={nav("/terms")} className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">Terms</a>
          <a href="/contact" onClick={nav("/contact")} className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
