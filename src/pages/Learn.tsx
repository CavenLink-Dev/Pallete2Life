import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Learn() {
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 px-6 py-20 text-center">
        <h1
          className="text-[36px] font-bold text-charcoal sm:text-[42px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Learn
        </h1>
        <p className="max-w-md text-[16px] leading-relaxed text-charcoal/60">
          Lessons on colour, typography, layout, accessibility, and design systems are coming soon. Check back for practical guides from experienced designers.
        </p>
      </main>
      <PublicFooter />
    </div>
  )
}
