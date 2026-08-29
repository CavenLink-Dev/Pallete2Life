import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import PublicFooter from "../components/PublicFooter"
import PublicHeader from "../components/PublicHeader"

/* #LiveChangesPage /live-changes - foundation route for quick live edits. */
export default function LiveChanges() {
  const nav = useNav()

  return (
    <div className="flex min-h-full flex-col bg-offwhite text-charcoal">
      <PublicHeader />
      <main className="flex flex-1 items-center px-6 py-16 sm:py-24">
        <section className="mx-auto w-full max-w-4xl">
          <div className="max-w-2xl">
            <h1 className="text-[34px] font-bold leading-tight sm:text-[48px]" style={{ fontFamily: "var(--font-display)" }}>
              Live Changes
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-charcoal/65">
              A focused workspace for quick palette adjustments and small website, application, and component previews is being prepared here.
            </p>
          </div>

          <div className="mt-10 grid gap-0 overflow-hidden rounded-[8px] border border-softgrey bg-white sm:grid-cols-3">
            {["Website preview", "Application preview", "Component preview"].map((label, index) => (
              <div key={label} className={`min-h-32 p-5 ${index > 0 ? "border-t border-softgrey sm:border-l sm:border-t-0" : ""}`}>
                <span className="block h-2 w-12 rounded-sm" style={{ background: index === 0 ? BRAND.brand : index === 1 ? BRAND.charcoal : BRAND.brandLight }} />
                <p className="mt-8 text-sm font-bold">{label}</p>
                <p className="mt-1 text-xs text-charcoal/50">Foundation ready</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/builder"
              onClick={nav("/builder")}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: BRAND.brand }}
            >
              Open Quick Palette
            </a>
            <a
              href="/preview"
              onClick={nav("/preview")}
              className="rounded-lg border border-softgrey bg-white px-4 py-2.5 text-sm font-semibold text-charcoal"
            >
              Generate A Design
            </a>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
