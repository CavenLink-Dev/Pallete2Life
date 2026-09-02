import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function About() {
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 px-6 py-20 text-center">
        <h1
          className="text-[36px] font-bold text-charcoal sm:text-[42px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          About HueSet
        </h1>
        <p className="max-w-md text-[16px] leading-relaxed text-charcoal/60">
          HueSet is a visual design and colour testing tool. Create palettes and instantly preview them across websites, mobile apps, and components — sitting between a simple palette generator and a professional design application.
        </p>
      </main>
      <PublicFooter />
    </div>
  )
}
