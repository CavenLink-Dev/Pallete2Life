import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"
import { useNav } from "../lib/router"

/* #NotFoundPage — rendered for any path outside the known route table. */
export default function NotFound() {
  const nav = useNav()

  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-20">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-charcoal/45">Error 404</p>
        <h1 className="mt-2 text-[32px] font-bold sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>
          This page doesn't exist
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal/65">
          The link may be out of date, or the address may have a typo. Nothing you've saved has been lost.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <a
            href="/"
            onClick={nav("/")}
            className="rounded-lg bg-charcoal px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Back to home
          </a>
          <a
            href="/quick-design"
            onClick={nav("/quick-design")}
            className="rounded-lg border border-softgrey px-4 py-2.5 text-sm font-semibold text-charcoal/70 hover:border-charcoal/25 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Quick Design
          </a>
          <a
            href="/help"
            onClick={nav("/help")}
            className="rounded-lg border border-softgrey px-4 py-2.5 text-sm font-semibold text-charcoal/70 hover:border-charcoal/25 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Help
          </a>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
