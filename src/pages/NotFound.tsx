import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function NotFound() {
  const nav = useNav()
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-20 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-charcoal/35">404</p>
        <h1
          className="text-[36px] font-bold text-charcoal sm:text-[42px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Page not found
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-charcoal/60">
          The page you were looking for doesn{"'"}t exist. Here are some helpful places to go instead:
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a
            href="/"
            onClick={nav("/")}
            className="inline-flex min-h-11 items-center rounded-lg border border-softgrey bg-white px-5 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
          >
            Return Home
          </a>
          <a
            href="/quick-design"
            onClick={nav("/quick-design")}
            className="inline-flex min-h-11 items-center rounded-lg border border-softgrey bg-white px-5 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
          >
            Open Quick Design
          </a>
          <a
            href="/generate"
            onClick={nav("/generate")}
            className="inline-flex min-h-11 items-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
            style={{ background: BRAND.cta }}
          >
            Start a New Design
          </a>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
