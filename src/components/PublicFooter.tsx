import { useNav } from "../lib/router"

export default function PublicFooter() {
  const nav = useNav()
  return (
    <footer className="border-t border-softgrey bg-white/70 px-6 py-8 text-[13px] text-charcoal/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Pallet Preview</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <a href="/pricing" onClick={nav("/pricing")} className="hover:text-charcoal">Pricing</a>
          <a href="/help" onClick={nav("/help")} className="hover:text-charcoal">Help</a>
          <a href="/privacy" onClick={nav("/privacy")} className="hover:text-charcoal">Privacy</a>
          <a href="/terms" onClick={nav("/terms")} className="hover:text-charcoal">Terms</a>
          <a href="/contact" onClick={nav("/contact")} className="hover:text-charcoal">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
