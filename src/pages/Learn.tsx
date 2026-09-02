import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

const BRAND_INK = "#0A6288"

type Lesson = {
  id: string
  title: string
  summary: string
  sections: { heading: string; body: string }[]
}

const LESSONS: Lesson[] = [
  {
    id: "colour-basics",
    title: "Colour basics",
    summary: "Hue, saturation, lightness, and how they shape what people feel when they look at your design.",
    sections: [
      {
        heading: "Hue, saturation, lightness",
        body: "Every colour can be described with three numbers. Hue is the position on the colour wheel — red, orange, yellow, green, blue, violet. Saturation is how vivid the colour is: 100% is pure colour, 0% is grey. Lightness is how close the colour is to white or black. HueSet shows all three when you open a swatch editor so you can adjust each one independently.",
      },
      {
        heading: "Warm and cool",
        body: "Reds, oranges, and yellows feel warm — energetic, urgent, inviting. Blues, greens, and violets feel cool — calm, trustworthy, professional. Most palettes mix warm and cool colours to create contrast and guide attention. A landing page might use a cool blue background with a warm orange call-to-action button.",
      },
      {
        heading: "Colour relationships",
        body: "Complementary colours sit opposite each other on the wheel (blue and orange, red and green). They create strong contrast. Analogous colours sit next to each other (blue, teal, green) and feel harmonious. Triadic colours are evenly spaced (red, yellow, blue) and feel balanced but vibrant. You do not need to memorise these — just notice what feels right when you preview your palette in HueSet.",
      },
    ],
  },
  {
    id: "building-palettes",
    title: "Building palettes",
    summary: "How to choose colours that work together — and the roles those colours play in a real interface.",
    sections: [
      {
        heading: "Start with one colour",
        body: "Pick the colour that matters most — usually your brand colour or primary action colour. Everything else should support it. In HueSet, set your first swatch to that colour, then build around it.",
      },
      {
        heading: "Assign roles, not just colours",
        body: "A palette is not a random list of colours. Each colour has a job: background, surface, primary action, heading text, body text, border. HueSet lets you assign roles to swatches so changing one colour updates every element that uses that role. This is how real design systems work.",
      },
      {
        heading: "Limit your palette",
        body: "Most good interfaces use three to six colours. A neutral background, a surface colour for cards and inputs, a primary accent for buttons and links, a text colour for headings, a softer text colour for body copy, and a border colour. More than that usually means the palette is doing too many jobs.",
      },
      {
        heading: "Use Randomise to explore",
        body: "Lock the colours you like, then press Randomise to generate new ones for the rest. This is faster than picking every colour manually and often produces combinations you would not have tried.",
      },
    ],
  },
  {
    id: "typography",
    title: "Typography in interfaces",
    summary: "Font size, weight, line height, and the small decisions that make text easy or painful to read.",
    sections: [
      {
        heading: "Size hierarchy",
        body: "Body text in web interfaces should be at least 16 pixels. Headings should be noticeably larger — typically 24 to 48 pixels depending on importance. Labels and captions can be smaller (12 to 14 pixels) but should never be the main reading text. HueSet previews use this scale so your palette is tested at realistic sizes.",
      },
      {
        heading: "Weight and emphasis",
        body: "Bold text draws the eye. Use it for headings, labels, and buttons — not for entire paragraphs. Semibold (600 weight) is useful for navigation items and secondary headings. Regular weight (400) is for body text. Avoid using more than two or three weights in one interface.",
      },
      {
        heading: "Line height and spacing",
        body: "Body text needs generous line height — 1.5 to 1.7 times the font size. Headings can be tighter (1.1 to 1.3). Paragraphs need clear spacing between them. Cramped text is the fastest way to make a polished layout feel amateur.",
      },
      {
        heading: "Font pairing",
        body: "One font for headings, one for body text is a safe starting point. Sans-serif fonts (Inter, Poppins, Instrument Sans) are the standard for interfaces. Serif fonts (Instrument Serif, Georgia) work well for headings when you want a more editorial feel. Monospace fonts (JetBrains Mono, Fira Code) are for code and technical data only.",
      },
    ],
  },
  {
    id: "layout",
    title: "Layout principles",
    summary: "Spacing, alignment, and visual hierarchy — the structure that makes a design feel intentional.",
    sections: [
      {
        heading: "Consistent spacing",
        body: "Use a spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 pixels. Every margin, padding, and gap should come from this scale. This creates visual rhythm without thinking about every individual value. HueSet templates follow this pattern.",
      },
      {
        heading: "Alignment",
        body: "Left-align text in most interfaces (right-to-left languages excepted). Centre-align headings and hero text sparingly. Never mix alignment within the same section. Misaligned elements make a layout look unfinished even when the colours and typography are good.",
      },
      {
        heading: "Visual hierarchy",
        body: "The most important element should be the largest, highest-contrast, or most colourful thing on the page. Secondary elements should be smaller or lower-contrast. When everything is the same size and weight, nothing stands out and the user does not know where to look.",
      },
      {
        heading: "Responsive structure",
        body: "A layout that works at 1440 pixels wide needs to work at 390 pixels wide. This usually means single-column on mobile, two or three columns on desktop. Navigation collapses into a menu. Images scale down. HueSet previews show both desktop and mobile layouts so you can test your palette at both sizes.",
      },
    ],
  },
  {
    id: "accessibility",
    title: "Colour and accessibility",
    summary: "Contrast ratios, WCAG guidelines, and practical steps to make your colours work for everyone.",
    sections: [
      {
        heading: "Why contrast matters",
        body: "Roughly 1 in 12 men and 1 in 200 women have some form of colour vision deficiency. Low contrast between text and background makes content hard to read for everyone — especially in bright sunlight, on low-quality screens, or for people with reduced vision.",
      },
      {
        heading: "WCAG contrast requirements",
        body: "The Web Content Accessibility Guidelines (WCAG) define minimum contrast ratios. Normal text (under 18 pixels, or under 14 pixels bold) needs at least 4.5:1 contrast against its background to pass AA. Large text (18 pixels and above, or 14 pixels bold and above) needs at least 3:1. These are minimums — higher contrast is usually better.",
      },
      {
        heading: "Checking contrast in practice",
        body: "HueSet shows contrast ratios when you use Second Opinion (a Pro feature when available). You can also check manually: pick your text colour and background colour, calculate the contrast ratio using the formula in the WCAG specification, and compare to the 4.5:1 or 3:1 threshold. Free online tools exist for quick checks.",
      },
      {
        heading: "Do not rely on colour alone",
        body: "Error states should not just turn text red — add an icon, underline, or label. Links should be underlined or visually distinct beyond just colour. Status indicators (success, warning, error) should include text labels. This ensures people who cannot distinguish certain colours still understand the interface.",
      },
    ],
  },
  {
    id: "design-systems",
    title: "Design systems",
    summary: "Tokens, roles, and the thinking behind reusable, consistent design that scales beyond one page.",
    sections: [
      {
        heading: "What is a design system?",
        body: "A design system is a set of reusable decisions: colours, typography, spacing, component styles, and the rules for using them. Instead of writing #0A6288 in your CSS, you write --color-primary. If the brand colour changes, you update one token and everything follows. HueSet roles work the same way — assign a colour to a role, and every element using that role stays consistent.",
      },
      {
        heading: "Design tokens",
        body: "Tokens are named values that represent design decisions. Instead of writing #0A6288 in your CSS, you write --color-primary. If the brand colour changes, you update one token and everything follows. HueSet exports colour values in token-friendly formats (CSS custom properties, JSON, Tailwind config) when export is available.",
      },
      {
        heading: "Semantic vs primitive tokens",
        body: "Primitive tokens are raw values: blue-500, grey-200. Semantic tokens describe purpose: text-primary, surface-card, border-input. Semantic tokens are more useful because they tell you what the colour is for, not just what it looks like. When you switch themes (light to dark), semantic tokens let you swap entire palettes without renaming anything.",
      },
      {
        heading: "Starting small",
        body: "You do not need a full design system on day one. Start with a consistent palette, a clear type scale, and a spacing system. Add component patterns as you build. HueSet is designed for this starting point — test your colour decisions on real layouts before committing to a full system.",
      },
    ],
  },
]

export default function Learn() {
  const nav = useNav()

  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-14 sm:py-20">
        {/* Hero */}
        <div>
          <h1
            className="text-[32px] font-bold text-charcoal sm:text-[42px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Learn
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-charcoal/65">
            Practical lessons on colour, typography, layout, accessibility, and design systems.
            Written for designers and developers who want to make better visual decisions — no jargon walls, no prerequisites.
          </p>
        </div>

        {/* Lesson index */}
        <nav aria-label="Lesson index" className="rounded-2xl border border-softgrey bg-white p-5">
          <h2
            className="text-[15px] font-bold uppercase tracking-wide text-charcoal/45"
          >
            Lessons
          </h2>
          <ol className="mt-3 flex flex-col gap-2">
            {LESSONS.map((lesson, i) => (
              <li key={lesson.id}>
                <a
                  href={`#${lesson.id}`}
                  className="group flex items-baseline gap-2.5 rounded-lg px-2 py-1.5 text-[15px] transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
                >
                  <span
                    className="shrink-0 text-[13px] font-bold tabular-nums"
                    style={{ color: BRAND_INK }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold text-charcoal group-hover:text-charcoal/80">
                    {lesson.title}
                  </span>
                  <span className="hidden text-[13px] text-charcoal/50 sm:inline">
                    — {lesson.summary.split(".")[0]}.
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Lesson content */}
        {LESSONS.map((lesson, i) => (
          <article key={lesson.id} id={lesson.id} className="scroll-mt-20">
            <div className="flex items-baseline gap-3">
              <span
                className="shrink-0 text-[13px] font-bold tabular-nums"
                style={{ color: BRAND_INK }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2
                className="text-[22px] font-bold text-charcoal sm:text-[26px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {lesson.title}
              </h2>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-charcoal/60">
              {lesson.summary}
            </p>
            <div className="mt-5 flex flex-col gap-5">
              {lesson.sections.map((section) => (
                <section key={section.heading} className="flex flex-col gap-1.5">
                  <h3
                    className="text-[16px] font-bold text-charcoal"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {section.heading}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-charcoal/75">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          </article>
        ))}

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-softgrey bg-white px-6 py-8 text-center">
          <h2
            className="text-[20px] font-bold text-charcoal sm:text-[24px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Try it yourself
          </h2>
          <p className="max-w-md text-[15px] text-charcoal/60">
            The fastest way to learn is to experiment. Open Quick Design and start testing colours on real layouts.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/quick-design"
              onClick={nav("/quick-design")}
              className="inline-flex min-h-11 items-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
              style={{ background: "#0A6288" }}
            >
              Open Quick Design
            </a>
            <a
              href="/help"
              onClick={nav("/help")}
              className="inline-flex min-h-11 items-center rounded-lg border border-softgrey bg-white px-5 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
            >
              Help &amp; guide
            </a>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
