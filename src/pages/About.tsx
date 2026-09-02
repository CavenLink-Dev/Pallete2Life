import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function About() {
  const nav = useNav()

  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-14 sm:py-20">
        <div>
          <h1
            className="text-[32px] font-bold text-charcoal sm:text-[42px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            About HueSet
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-charcoal/65">
            A visual design and colour testing tool — sitting between a simple palette generator
            and a professional design application.
          </p>
        </div>

        <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-charcoal/75">
          <section>
            <h2
              className="text-[19px] font-bold text-charcoal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What HueSet does
            </h2>
            <p className="mt-2">
              HueSet lets you create colour palettes and instantly preview them on real
              interface layouts — websites, mobile apps, and components like buttons, cards,
              forms, and navigation. You choose colours, assign roles, and see the result
              immediately. No signup, no server, no waiting.
            </p>
          </section>

          <section>
            <h2
              className="text-[19px] font-bold text-charcoal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Local-first
            </h2>
            <p className="mt-2">
              Your palettes, brand uploads, template choices, and workspace preferences are
              stored in your browser. Nothing is uploaded to a HueSet server. Your work stays
              on your device, persists across refreshes, and is never shared unless you choose
              to export it.
            </p>
          </section>

          <section>
            <h2
              className="text-[19px] font-bold text-charcoal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Early access
            </h2>
            <p className="mt-2">
              HueSet is in early access. The core editor — palette creation, template previews,
              Quick Design, brand uploads, and full-screen mode — is free to use now. Export
              checkout and Pro features are planned but not live yet.
              See{" "}
              <a
                href="/pricing"
                onClick={nav("/pricing")}
                className="font-semibold underline"
                style={{ color: "#0A6288" }}
              >
                Pricing
              </a>{" "}
              for planned tiers and current availability.
            </p>
          </section>

          <section>
            <h2
              className="text-[19px] font-bold text-charcoal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Who it is for
            </h2>
            <p className="mt-2">
              Designers who want to test colour decisions on real layouts before moving to Figma
              or production. Developers who need palette values, design tokens, or CSS variables.
              Anyone who cares about colour and wants a faster way to explore visual directions.
            </p>
          </section>

          <section>
            <h2
              className="text-[19px] font-bold text-charcoal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Get in touch
            </h2>
            <p className="mt-2">
              Feedback, bug reports, feature requests, and collaboration enquiries are all
              welcome. Use the{" "}
              <a
                href="/contact"
                onClick={nav("/contact")}
                className="font-semibold underline"
                style={{ color: "#0A6288" }}
              >
                Contact
              </a>{" "}
              page to reach us.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
