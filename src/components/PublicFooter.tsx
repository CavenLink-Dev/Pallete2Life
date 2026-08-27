import { useNav } from "../lib/router"

export default function PublicFooter() {
  const nav = useNav()
  return (
    <footer className="border-t border-softgrey bg-white/70 px-6 py-8 text-[13px] text-charcoal/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Palette Preview</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <a href="/pricing" onClick={nav("/pricing")} className="rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]">Pricing</a>
          <a href="/help" onClick={nav("/help")} className="rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]">Help</a>
          <a href="/privacy" onClick={nav("/privacy")} className="rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]">Privacy</a>
          <a href="/terms" onClick={nav("/terms")} className="rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]">Terms</a>
          <a href="/contact" onClick={nav("/contact")} className="rounded-sm transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
