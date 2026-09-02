import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Examples() {
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 px-6 py-20 text-center">
        <h1
          className="text-[36px] font-bold text-charcoal sm:text-[42px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Examples
        </h1>
        <p className="max-w-md text-[16px] leading-relaxed text-charcoal/60">
          Original HueSet examples for websites, apps, dashboards, pricing pages, authentication screens, and components are coming soon.
        </p>
      </main>
      <PublicFooter />
    </div>
  )
}
