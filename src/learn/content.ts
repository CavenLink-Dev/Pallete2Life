// HueSet /learn — full content model.
// Encodes the shipped Learn page shell + the comprehensive course blueprint
// from the deep-research report as structured, renderable blocks.

export const BRAND = {
  siteName: "HueSet",
  origin: "https://hueset.app",
  routeLearn: "/learn",
  routeQuickDesign: "/quick-design",
  routeHelp: "/help",
  routeExamples: "/examples",
  supportEmail: "cavenlink.dev@gmail.com",
  learnTitle: "Learn — HueSet",
  learnDesc:
    "Learn how experienced designers make good decisions about colour, type, layout, accessibility, and design systems.",
  ctaPrimaryLabel: "Saved Topics",
  ctaPrimaryHref: "/quick-design",
  ctaSecondaryLabel: "Help & guide",
  ctaSecondaryHref: "/help",
};

export type Block =
  | { k: "lead"; text: string }
  | { k: "p"; text: string }
  | { k: "h2"; text: string }
  | { k: "h3"; text: string }
  | { k: "ul"; items: string[] }
  | { k: "ol"; items: string[] }
  | { k: "table"; head: string[]; rows: string[][]; caption?: string }
  | { k: "code"; lang: string; code: string }
  | { k: "checklist"; title: string; items: string[] }
  | { k: "callout"; tone: "brand" | "note" | "warn"; title?: string; text: string }
  | { k: "links"; items: { label: string; href: string }[] }
  | { k: "flow"; steps: string[] }
  | { k: "stat"; items: { value: string; label: string }[] }
  | { k: "interactive"; kind: "emphasis" | "contrast" };

export type Page = {
  id: string;
  icon: string; // lucide icon name
  kicker: string;
  title: string;
  summary: string;
  meta?: string; // e.g. "14 hours"
  blocks: Block[];
};

export type NavItem = { id: string; label: string };
export type NavGroup = { id: string; label: string; icon: string; items: NavItem[] };

// ---------------------------------------------------------------------------
// Helper to assemble a full curriculum module page from the report structure.
// ---------------------------------------------------------------------------
function modulePage(cfg: {
  id: string;
  icon: string;
  title: string;
  hours: string;
  summary: string;
  objectives: string;
  syllabus: string[][];
  tools: string;
  readings: { label: string; href: string }[];
  exercise: string;
  extraBlocks?: Block[];
  a11y: string[];
  perf: string[];
  assessment: string;
  capstone: string;
}): Page {
  return {
    id: cfg.id,
    icon: cfg.icon,
    kicker: `Curriculum · ${cfg.hours}`,
    title: cfg.title,
    summary: cfg.summary,
    meta: cfg.hours,
    blocks: [
      { k: "h2", text: "Learning objectives" },
      { k: "p", text: cfg.objectives },
      { k: "h2", text: "Syllabus" },
      { k: "table", head: ["Lesson", "Time", "Content"], rows: cfg.syllabus },
      { k: "h2", text: "Tools & readings" },
      { k: "p", text: cfg.tools },
      { k: "links", items: cfg.readings },
      { k: "h2", text: "Exercise & deliverable" },
      { k: "p", text: cfg.exercise },
      ...(cfg.extraBlocks ?? []),
      { k: "h2", text: "Quality checklists" },
      { k: "checklist", title: "Accessibility", items: cfg.a11y },
      { k: "checklist", title: "Performance", items: cfg.perf },
      { k: "h2", text: "Assessment" },
      { k: "p", text: cfg.assessment },
      { k: "callout", tone: "brand", title: "Capstone milestone", text: cfg.capstone },
    ],
  };
}

// ---------------------------------------------------------------------------
// PAGES
// ---------------------------------------------------------------------------
export const pages: Record<string, Page> = {
  // ===== Getting started =====
  overview: {
    id: "overview",
    icon: "Map",
    kicker: "Getting started",
    title: "Learn",
    summary:
      "How experienced designers make good decisions about colour, type, layout, accessibility, and design systems — and how to carry that intent all the way to a deployed, tested product.",
    blocks: [
      {
        k: "lead",
        text:
          "A course that reliably produces great, working digital products cannot stop at visual design. It teaches you to move through the whole product-delivery loop: understand a problem, structure information, design responsive interfaces, implement reusable components, meet accessibility requirements, prototype behaviour, measure performance, test systematically, deploy safely, and maintain what you ship.",
      },
      { k: "h2", text: "What a finished product must pass" },
      {
        k: "p",
        text:
          "You are not rewarded merely for producing attractive screens. A finished product must clear several independent gates: **usefulness, usability, visual quality, accessibility, technical correctness, performance, robustness and maintainability**. For web work, the baselines are WCAG 2.2 AA for accessibility and the current Core Web Vitals for performance — LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile, measured separately for mobile and desktop.",
      },
      { k: "h2", text: "The programme at a glance" },
      {
        k: "table",
        caption: "154-hour core curriculum, progressing from interface foundations to production delivery.",
        head: ["Course section", "Core time", "Principal outcome"],
        rows: [
          ["Website Design", "14 h", "Responsive, semantic, implementation-ready web interfaces"],
          ["App Design", "14 h", "Platform-aware native / mobile application interfaces"],
          ["Typography", "8 h", "Responsive and accessible typographic systems"],
          ["Accessibility", "14 h", "WCAG-aware, assistive-technology-tested interfaces"],
          ["Design Systems & Components", "16 h", "Tokenised, reusable cross-design/code systems"],
          ["Interaction & Motion", "10 h", "Intentional, accessible interactive behaviour"],
          ["Prototyping & Handoff", "10 h", "Testable prototypes and developer-ready specifications"],
          ["Performance & Optimisation", "12 h", "Measurable web / native performance"],
          ["Testing & QA", "14 h", "Repeatable functional, visual and accessibility validation"],
          ["Deployment & Maintenance", "10 h", "CI/CD, release governance and product maintenance"],
          ["Practical Projects", "32 h", "Portfolio-quality integrated products"],
          ["Total", "154 h", "Design-to-production capability"],
        ],
      },
      {
        k: "callout",
        tone: "brand",
        title: "The bar for a great product",
        text:
          "A learner can take a product from problem definition to a deployed, tested and maintainable implementation without losing the design intent   or the user between design and code.",
      },
    ],
  },

  "how-it-works": {
    id: "how-it-works",
    icon: "Compass",
    kicker: "Getting started",
    title: "How the course works",
    summary:
      "The pedagogical loop, the tools you'll use, and how HueSet fits into your design workflow.",
    blocks: [
      { k: "h2", text: "The pedagogical loop" },
      {
        k: "p",
        text:
          "Every module runs the same loop, because neither automated tools nor prototypes can establish product quality on their own. You move from a real problem to research, information architecture, wireframes, a system of components, an interactive prototype, testing, and only then production — measuring real behaviour and feeding evidence back in.",
      },
      {
        k: "flow",
        steps: [
          "Problem / user task",
          "Research & requirements",
          "Information architecture",
          "Wireframe",
          "System + components",
          "Prototype",
          "Usability / a11y test",
          "Production",
          "QA",
          "Deploy",
          "Measure",
        ],
      },
      { k: "h2", text: "Design as a model of behaviour" },
      {
        k: "p",
        text:
          "Treat Figma as a model of interface behaviour, not a drawing programme. Auto Layout reacts when children or dimensions change; variables can hold state for higher-fidelity prototypes; Dev Mode gives developers an inspection-oriented view of designs marked ready for development. Those concepts parallel production concerns — layout constraints, state, tokens and implementation status.",
      },
      { k: "h2", text: "Implementation paths" },
      {
        k: "table",
        head: ["Learner goal", "Minimum implementation path"],
        rows: [
          ["Designer who needs production literacy", "HTML + CSS + basic JavaScript + Git"],
          ["Web product designer / developer", "HTML/CSS/TypeScript + a framework + Playwright"],
          ["Apple specialist", "Swift + SwiftUI + Xcode"],
          ["Android specialist", "Kotlin + Jetpack Compose + Android Studio"],
          ["Cross-platform designer", "Web foundations plus one native path"],
          ["Design-system specialist", "Figma Variables/Components + tokens + component library + CI"],
        ],
      },
      {
        k: "callout",
        tone: "note",
        title: "Never coded before?",
        text:
          "Complete the optional 20–30-hour coding primer (semantic HTML, CSS layout, JS variables/functions/events, Git, terminal basics, reading component code) before the implementation-heavy second half. It sits outside the 154-hour core.",
      },
      { k: "h2", text: "Where HueSet fits" },
      {
        k: "p",
        text:
          "Use HueSet to make visual decisions fast — preview a website or app style before you commit to Figma or code. Every lesson links back to it with a **Try it yourself** action so you can test colour, type and layout choices against the principle you just read.",
      },
    ],
  },

  // ===== Core lessons (Web / App shared) =====
  "design-tokens": {
    id: "design-tokens",
    icon: "Braces",
    kicker: "Core lesson 01",
    title: "Design tokens",
    summary: "Named design decisions you reuse everywhere — structured from primitive to semantic to component.",
    blocks: [
      { k: "lead", text: "Tokens are named design decisions stored as values you reuse everywhere. Change a token once and every place that references it updates — keeping design and code in step." },
      { k: "h2", text: "Use tokens for reusable decisions" },
      {
        k: "table",
        head: ["Category", "Example tokens"],
        rows: [
          ["Color", "color.action.primary · color.text.default · color.surface.page · color.border.error"],
          ["Spacing", "space.1 · space.2 · space.4 · space.control.inline"],
          ["Typography", "type.heading.lg · type.body.md · type.label.sm"],
          ["Radius", "radius.sm · radius.md · radius.full"],
          ["Motion", "motion.fast · motion.standard · ease.out"],
          ["Elevation / shadow", "shadow.card · shadow.dialog"],
        ],
      },
      { k: "h2", text: "Best structure" },
      { k: "p", text: "Layer tokens so raw values stay separate from meaning, and meaning stays separate from any single component." },
      { k: "flow", steps: ["Primitive tokens", "Semantic tokens", "Component tokens"] },
      {
        k: "table",
        caption: "The same decision flows through three layers.",
        head: ["Primitive", "Semantic", "Component"],
        rows: [
          ["blue.600", "color.action.primary", "button.primary.background"],
          ["space.3", "space.control.inline", "button.padding.inline"],
        ],
      },
      {
        k: "code",
        lang: "css",
        code: ":root {\n  /* Primitive */\n  --blue-600: #2457d6;\n  --space-3: 0.75rem;\n\n  /* Semantic */\n  --color-action-primary: var(--blue-600);\n  --space-control-inline: var(--space-3);\n\n  /* Component */\n  --button-primary-background: var(--color-action-primary);\n  --button-padding-inline: var(--space-control-inline);\n}",
      },
    ],
  },

  "color-system": {
    id: "color-system",
    icon: "Palette",
    kicker: "Core lesson 02",
    title: "Color system",
    summary: "Name colours by the job they do, not just their hue — and make every choice pass contrast.",
    blocks: [
      { k: "p", text: "Do not only name colours like **blue** or **gray**. Also define what they are *for*. A role-based system stays meaningful when you re-theme, and it tells you when a colour is being misused." },
      { k: "h2", text: "Useful colour roles" },
      {
        k: "ul",
        items: [
          "background",
          "surface",
          "text.primary",
          "text.secondary",
          "border.default",
          "action.primary",
          "action.secondary",
          "success",
          "warning",
          "error",
          "focus",
        ],
      },
      {
        k: "callout",
        tone: "brand",
        title: "Two rules for every colour",
        text: "Every colour choice should pass contrast checks, and colour should never be the only way a user understands state.",
      },
      { k: "h2", text: "Check it against the rendered UI" },
      { k: "p", text: "Verify contrast on the states people actually see — resting, hover, disabled, placeholder, and text over images. Try the checker below against real HueSet tokens." },
      { k: "interactive", kind: "contrast" },
    ],
  },

  "variables": {
    id: "variables",
    icon: "Variable",
    kicker: "Core lesson 03",
    title: "Variables",
    summary: "Use variables for values that need to change across contexts — themes, density, platform, state.",
    blocks: [
      { k: "p", text: "Where a token is a single named decision, a **variable** is a decision that resolves differently depending on context. Use variables for values that need to change across contexts." },
      { k: "h2", text: "When to reach for a variable" },
      {
        k: "ul",
        items: [
          "Light / dark mode",
          "Brand themes",
          "Density modes",
          "Component states",
          "Prototype state in Figma",
          "Platform differences",
        ],
      },
      { k: "h2", text: "Example" },
      {
        k: "table",
        caption: "One semantic name, resolved per mode.",
        head: ["Variable", "Light mode", "Dark mode"],
        rows: [["color.action.primary", "blue.600", "blue.300"]],
      },
      {
        k: "code",
        lang: "css",
        code: ":root { --color-action-primary: var(--blue-600); }\n\n@media (prefers-color-scheme: dark) {\n  :root { --color-action-primary: var(--blue-300); }\n}",
      },
      { k: "callout", tone: "note", text: "In Figma, variables can hold modes (light/dark, brand, density) and even prototype state — the same idea that light/dark theming uses in code." },
    ],
  },

  "components": {
    id: "components",
    icon: "Component",
    kicker: "Core lesson 04",
    title: "Components",
    summary: "What every serious component must define, and which ones to build first.",
    blocks: [
      { k: "p", text: "A component is a contract, not a picture. Every serious component should define the same set of things so it behaves predictably in design and code." },
      { k: "h2", text: "Every serious component defines" },
      {
        k: "ul",
        items: [
          "Anatomy",
          "Variants",
          "States",
          "Slots",
          "Content rules",
          "Accessibility behavior",
          "Code mapping",
        ],
      },
      { k: "h2", text: "Core components to design first" },
      {
        k: "ul",
        items: [
          "Button",
          "Text Field",
          "Card",
          "Alert",
          "Dialog",
          "Navigation / Header",
          "Form group",
          "Tabs",
          "Menu",
          "Toast / Notification",
        ],
      },
      { k: "callout", tone: "brand", title: "Start small", text: "Define these ten with their states first. Grow the library only as real needs appear — a gallery of components without states, APIs and docs is not a system." },
    ],
  },

  "buttons": {
    id: "buttons",
    icon: "MousePointer2",
    kicker: "Core lesson 05",
    title: "Buttons",
    summary: "The component that needs the clearest rules — appearance, size, states, slots and a quality checklist.",
    blocks: [
      { k: "p", text: "Buttons need especially clear rules, because they carry the most-used actions in a product and every ambiguous state is felt immediately." },
      { k: "h2", text: "Define" },
      {
        k: "code",
        lang: "text",
        code: "Button\n├── Appearance: primary | secondary | subtle | destructive\n├── Size: small | medium | large\n├── State: default | hover | pressed | focus | disabled | loading\n├── Slots: leading icon (optional) · label (required) · trailing icon (optional)\n└── Rules: label required · icon optional",
      },
      { k: "h2", text: "Good button checklist" },
      {
        k: "checklist",
        title: "Every button should pass",
        items: [
          "Clear visual hierarchy",
          "Visible focus state",
          "Minimum usable target size",
          "Loading state prevents duplicate action",
          "Disabled state explains itself when needed",
          "Destructive actions look meaningfully different",
          "Text label says the action, not vague words like \"Submit\"",
        ],
      },
    ],
  },

  "accessibility": {
    id: "accessibility",
    icon: "Accessibility",
    kicker: "Core lesson 06",
    title: "Accessibility",
    summary: "Far more than contrast — the full set of behaviours an accessible interface must cover.",
    blocks: [
      { k: "p", text: "This is not just contrast. Accessibility is a set of behaviours the whole interface must support, and most of them cannot be caught by an automated colour check." },
      { k: "h2", text: "Must cover" },
      {
        k: "checklist",
        title: "Accessibility responsibilities",
        items: [
          "Keyboard access",
          "Focus order",
          "Focus visibility",
          "Accessible names",
          "Error messages",
          "Touch target size",
          "Screen-reader behavior",
          "Reduced-motion behavior",
          "No meaning conveyed by color alone",
        ],
      },
      { k: "h2", text: "Contrast is still part of it" },
      { k: "p", text: "Contrast remains a target you verify against the rendered UI — at least 4.5:1 for standard text and 3:1 for large text and meaningful UI. Check the real colours and states, not tokens in isolation." },
      { k: "interactive", kind: "contrast" },
    ],
  },

  "design-to-code": {
    id: "design-to-code",
    icon: "Code",
    kicker: "Core lesson 07",
    title: "Design-to-code match",
    summary: "Keep Figma and code connected so design intent survives the handoff.",
    blocks: [
      { k: "p", text: "The report strongly emphasises that Figma and code should stay connected. When the two drift apart, design intent — and the user — get lost between the picture and the implementation." },
      { k: "h2", text: "What should stay in sync" },
      {
        k: "table",
        head: ["In Figma", "In code", "Kept in sync by"],
        rows: [
          ["Variables / modes", "CSS custom properties / theme", "Shared token names"],
          ["Component properties", "Component props / variants", "One-to-one naming"],
          ["Auto Layout structure", "Flex / grid + spacing tokens", "Space tokens, not magic numbers"],
          ["Dev Mode “ready” status", "Implemented component", "Handoff / acceptance criteria"],
        ],
      },
      { k: "flow", steps: ["Figma variable", "Design token", "Code variable", "Component prop"] },
      {
        k: "callout",
        tone: "brand",
        title: "The traceability test",
        text: "You should be able to trace any value on screen back to a named token, and back again to its Figma variable — without reverse-engineering the design.",
      },
      { k: "callout", tone: "note", text: "Try any of these decisions live in HueSet before you commit them to Figma or code." },
    ],
  },

  // ===== Full curriculum (11 modules) =====
  "mod-website": modulePage({
    id: "mod-website",
    icon: "Globe",
    title: "Website Design",
    hours: "14 hours",
    summary: "Turn content and user tasks into responsive, semantic, implementation-ready web interfaces.",
    objectives:
      "Transform content and user tasks into semantic information architecture; create responsive layouts rather than fixed-width mock-ups; use grids, spacing and hierarchy deliberately; design navigation and forms; and implement the result with semantic HTML and adaptable CSS. Figma Auto Layout is ideal for teaching responsive relationships because its parent/child resizing, wrapping and grid capabilities respond to content and container changes.",
    syllabus: [
      ["Web structure & information architecture", "2 h", "User tasks, page hierarchy, landmarks, content priority, semantic anatomy"],
      ["Responsive layout", "3 h", "Intrinsic sizing, grid/flex, Auto Layout, content-driven breakpoints"],
      ["Navigation & content patterns", "3 h", "Header, nav, cards, lists, search, filtering, empty/loading/error states"],
      ["Forms & transactional interfaces", "3 h", "Labels, input states, validation, progressive disclosure, confirmation"],
      ["Design-to-browser build", "3 h", "Translate Figma structure into HTML/CSS; responsive QA; browser inspection"],
    ],
    tools: "Figma; a modern browser; browser DevTools; a code editor; basic HTML/CSS; Git recommended.",
    readings: [
      { label: "Figma Auto Layout", href: "https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout" },
      { label: "Apple Human Interface Guidelines", href: "https://developer.apple.com/design/human-interface-guidelines/" },
      { label: "Fluent Layout", href: "https://fluent2.microsoft.design/layout" },
      { label: "WCAG 2.2 Quick Reference", href: "https://www.w3.org/WAI/WCAG22/quickref/" },
    ],
    exercise:
      "Redesign a content-heavy service website at narrow phone, tablet/intermediate and wide desktop sizes. Deliver a Figma source file using Auto Layout, a content inventory, sitemap, wireframes, responsive high-fidelity screens and a working semantic HTML/CSS implementation.",
    extraBlocks: [
      {
        k: "code",
        lang: "html",
        code: `<main class="page">\n  <section class="hero" aria-labelledby="hero-title">\n    <p class="eyebrow">Personal finance</p>\n    <h1 id="hero-title">Make your money easier to understand.</h1>\n    <p>One clear place for goals, spending and progress.</p>\n    <a class="button" href="/start">Get started</a>\n  </section>\n</main>`,
      },
      {
        k: "code",
        lang: "css",
        code: `.page { width: min(100% - 2rem, 72rem); margin-inline: auto; }\n.hero { display: grid; gap: clamp(1rem, 3vw, 3rem); padding-block: clamp(3rem, 8vw, 8rem); }\nh1 { font-size: clamp(2.25rem, 6vw, 5rem); line-height: 1.05; max-inline-size: 14ch; }\n.button { display: inline-flex; min-block-size: 2.75rem; align-items: center; padding-inline: 1rem; }`,
      },
    ],
    a11y: [
      "Semantic landmarks and a logical heading hierarchy",
      "Visible keyboard focus; navigation operable without a pointer",
      "Labelled form controls and text alternatives",
      "No information conveyed by colour alone; sufficient contrast",
      "Zoom / reflow testing and understandable errors",
    ],
    perf: [
      "Explicit image dimensions and responsive image sources",
      "Don't ship imagery larger than rendered need; reserve space for async content",
      "Minimise layout shifts; prioritise principal visible content",
      "Limit unnecessary JavaScript; test low-end / mobile conditions",
    ],
    assessment: "Hierarchy/IA 20% · responsive behaviour 25% · semantic/accessibility quality 20% · implementation correspondence 20% · visual polish 15%.",
    capstone: "A production-ready responsive marketing/onboarding area with documented breakpoint behaviour and component states.",
  }),

  "mod-app": modulePage({
    id: "mod-app",
    icon: "Smartphone",
    title: "App Design",
    hours: "14 hours",
    summary: "Platform-aware native and mobile application interfaces, built around state and convention.",
    objectives:
      "Understand application navigation, transient/persistent state, platform conventions, safe areas and insets, feedback, permissions and lifecycle states; recognise when iOS, Android and web behaviours should diverge; and build one real native interface rather than only imitating native screens in Figma.",
    syllabus: [
      ["App mental models & navigation", "2 h", "Hierarchy, tabs, stack navigation, modal tasks, back behaviour"],
      ["Platform conventions", "3 h", "Apple HIG vs Material/Android vs Fluent; system controls and adaptation"],
      ["State-rich interface design", "3 h", "Loading, offline, empty, partial, optimistic, error and success states"],
      ["Adaptive mobile layouts", "3 h", "Orientation, safe regions, insets, large screens, dynamic content"],
      ["Native implementation lab", "3 h", "Implement one core flow in SwiftUI or Jetpack Compose"],
    ],
    tools: "Figma; mobile interaction fundamentals; Swift/Xcode for the Apple path or Kotlin/Android Studio for the Android path.",
    readings: [
      { label: "Apple Human Interface Guidelines", href: "https://developer.apple.com/design/human-interface-guidelines/" },
      { label: "Apple Design Resources", href: "https://developer.apple.com/design/resources/" },
      { label: "Material Design 3", href: "https://m3.material.io/" },
      { label: "Material 3 in Jetpack Compose", href: "https://developer.android.com/develop/ui/compose/designsystems/material3" },
      { label: "Fluent 2", href: "https://fluent2.microsoft.design/" },
    ],
    exercise:
      "Create a three-to-five-screen transactional app flow — goal creation, transfer setup or appointment booking — with normal, loading, validation, empty and failure states. Implement the main screen natively.",
    extraBlocks: [
      {
        k: "code",
        lang: "swift",
        code: `struct GoalView: View {\n  @State private var saved = false\n  var body: some View {\n    NavigationStack {\n      Form {\n        Section("Goal") {\n          TextField("Name", text: .constant(""))\n          TextField("Target amount", text: .constant(""))\n            .keyboardType(.decimalPad)\n        }\n        Button("Save goal") { saved = true }\n      }\n      .navigationTitle("New goal")\n      .alert("Goal saved", isPresented: $saved) {\n        Button("Done", role: .cancel) { }\n      }\n    }\n  }\n}`,
      },
      {
        k: "callout",
        tone: "note",
        text:
          "Material's Compose guidance recommends using its semantic colour roles rather than arbitrarily pairing colours, because built-in components and themes are structured to support accessible contrast.",
      },
    ],
    a11y: [
      "Dynamic Type / scalable text; VoiceOver & TalkBack reading order",
      "Meaningful control names and adequate touch targets",
      "Orientation / adaptation and system accessibility settings",
      "Non-colour state indicators; error announcements",
    ],
    perf: [
      "Avoid loading everything before first meaningful interaction",
      "Virtualise long collections; cache/reuse expensive calculations",
      "Test release builds — Baseline Profiles, stable keys, avoid needless recompositions",
    ],
    assessment: "Navigation/model 20% · state coverage 20% · platform appropriateness 20% · accessibility 15% · native implementation 15% · visual craft 10%.",
    capstone: "One complete native journey corresponding to an equivalent web journey but adapted to the chosen platform.",
  }),

  "mod-typography": modulePage({
    id: "mod-typography",
    icon: "Type",
    title: "Typography",
    hours: "8 hours",
    summary: "Semantic, responsive and accessible typographic systems that scale across platforms.",
    objectives:
      "Create a semantic type hierarchy; choose appropriate typefaces; control measure, leading, scale and emphasis; design responsive type rather than fixed screenshots; and support platform text scaling such as Dynamic Type and Android scalable units.",
    syllabus: [
      ["Typography as information architecture", "2 h", "Hierarchy, semantic roles, families, weights and contrast"],
      ["Reading and rhythm", "2 h", "Measure, line-height, spacing, alignment and density"],
      ["Responsive typography", "2 h", "rem, relative units, clamp(), zoom and localisation"],
      ["Native scaling and QA", "2 h", "Dynamic Type, Android scalable units, truncation and extreme content"],
    ],
    tools: "Figma text styles/variables; a browser; SwiftUI/Compose for the native track.",
    readings: [
      { label: "Apple HIG — Typography", href: "https://developer.apple.com/design/human-interface-guidelines/typography" },
      { label: "Fluent Typography", href: "https://fluent2.microsoft.design/typography" },
      { label: "Material Design 3", href: "https://m3.material.io/" },
    ],
    exercise:
      "Create one content page with at least six semantic text roles, then stress-test it at long translations, browser zoom and native text scaling.",
    extraBlocks: [
      {
        k: "code",
        lang: "css",
        code: `:root {\n  --text-body: clamp(1rem, 0.96rem + 0.2vw, 1.125rem);\n  --text-title: clamp(2rem, 1.35rem + 3vw, 4.5rem);\n}\nbody { font-size: var(--text-body); line-height: 1.55; }\nh1 { font-size: var(--text-title); line-height: 1.05; text-wrap: balance; }`,
      },
    ],
    a11y: [
      "Minimum contrast (≥ 4.5:1 standard text, ≥ 3:1 qualifying large text)",
      "Zoom / scaling without clipping; readable hierarchy independent of colour",
      "Adequate line spacing; avoid images of important text",
      "No essential copy hidden by truncation",
    ],
    perf: [
      "Keep webfont families/weights deliberate; use effective fallbacks",
      "Avoid typography-driven layout shift",
      "Don't download decorative fonts that add little product value",
    ],
    assessment: "Hierarchy 30% · readability 25% · responsive/scalable behaviour 20% · accessibility 15% · implementation accuracy 10%.",
    capstone: "Shared type roles with mappings for Figma, CSS and the selected native platform.",
  }),

  "mod-accessibility": modulePage({
    id: "mod-accessibility",
    icon: "Accessibility",
    title: "Accessibility",
    hours: "14 hours",
    summary: "Design and test against WCAG 2.2 — far beyond a colour-contrast check.",
    objectives:
      "Design and test against WCAG 2.2 rather than treating accessibility as a contrast check. WCAG 2.2 addresses perceivable content, keyboard access, focus, reflow, target sizing, labels, errors and other interaction concerns.",
    syllabus: [
      ["Disability, inclusive design & WCAG", "2 h", "Permanent/temporary/situational barriers; POUR; A/AA/AAA"],
      ["Semantic structure & assistive tech", "3 h", "HTML semantics, accessible names, landmarks, headings, native semantics"],
      ["Keyboard, focus & input", "3 h", "Focus order/visibility, dialogs, menus, pointer alternatives, targets"],
      ["Forms, errors, colour & media", "3 h", "Labels, help, error recovery, contrast, captions, non-colour cues"],
      ["Accessibility testing laboratory", "3 h", "Keyboard-only, screen readers, automated scanning, inspectors"],
    ],
    tools: "Browser accessibility tree; keyboard; VoiceOver and/or TalkBack; Apple Accessibility Inspector; Playwright + axe for web automation.",
    readings: [
      { label: "WCAG 2.2 Quick Reference", href: "https://www.w3.org/WAI/WCAG22/quickref/" },
      { label: "WAI-ARIA Authoring Practices", href: "https://www.w3.org/WAI/ARIA/apg/" },
      { label: "Apple HIG — Accessibility", href: "https://developer.apple.com/design/human-interface-guidelines/accessibility" },
      { label: "Android Compose Accessibility", href: "https://developer.android.com/develop/ui/compose/accessibility" },
      { label: "Playwright Accessibility Testing", href: "https://playwright.dev/docs/accessibility-testing" },
    ],
    exercise:
      "Audit an intentionally flawed checkout/application form, repair the implementation, and submit before/after results plus a manual screen-reader walkthrough.",
    extraBlocks: [
      {
        k: "code",
        lang: "html",
        code: `<form>\n  <label for="amount">Transfer amount</label>\n  <input id="amount" name="amount" inputmode="decimal"\n         aria-describedby="amount-help amount-error" />\n  <p id="amount-help">Maximum transfer: £5,000.</p>\n  <p id="amount-error" role="alert" hidden>\n    Enter an amount between £1 and £5,000.\n  </p>\n  <button type="submit">Review transfer</button>\n</form>`,
      },
      {
        k: "callout",
        tone: "warn",
        title: "Automation is not a certificate",
        text:
          "An automated “zero violations” result is not an accessibility certificate. Many defects require manual testing — combine automation with manual assessment and inclusive user testing.",
      },
    ],
    a11y: [
      "WCAG 2.2 AA matrix; semantic-native elements first",
      "Names / roles / states; keyboard operable; visible focus; no keyboard trap",
      "200%+ zoom / reflow; contrast; touch/pointer target spacing",
      "Form errors in text; screen-reader core-flow test; reduced-motion behaviour",
    ],
    perf: [
      "Accessibility must not depend on a large client-side library before basic controls work",
      "Preserve meaningful DOM structure; avoid massive redundant accessibility trees",
      "Don't use effects that materially delay task completion",
    ],
    assessment: "WCAG reasoning 25% · semantic implementation 25% · keyboard/focus 15% · assistive-technology testing 20% · issue documentation/remediation 15%.",
    capstone: "Documented accessibility acceptance criteria for every critical journey plus a manual AT test record.",
  }),

  "mod-design-systems": modulePage({
    id: "mod-design-systems",
    icon: "Component",
    title: "Design Systems & Components",
    hours: "16 hours",
    summary: "Move from screens to reusable, tokenised systems that bridge Figma and production code.",
    objectives:
      "Move from individual screens to reusable foundations: primitive/global tokens, semantic/alias tokens, component APIs, variants, states, slots, themes, documentation and governance. Fluent's model is explicit — global tokens hold raw values while alias tokens assign meaning, and Figma component properties map towards code.",
    syllabus: [
      ["From screens to systems", "3 h", "Foundations, tokens, primitives, components, patterns"],
      ["Token architecture", "3 h", "Primitive/global vs semantic/alias vs component tokens; modes/themes"],
      ["Component modelling", "3 h", "Anatomy, properties, variants, states, slots and content rules"],
      ["Figma-to-code system", "4 h", "Variables, component properties, Auto Layout, implementation contracts"],
      ["Governance and evolution", "3 h", "Versioning, contribution rules, deprecation, documentation, adoption"],
    ],
    tools: "Solid Figma skills; basic CSS or native component knowledge; Git recommended. Figma variables make light/dark and other modes a natural teaching mechanism.",
    readings: [
      { label: "Figma Variables", href: "https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma" },
      { label: "Fluent Design Tokens", href: "https://fluent2.microsoft.design/design-tokens" },
      { label: "Material Design 3", href: "https://m3.material.io/" },
      { label: "Apple HIG", href: "https://developer.apple.com/design/human-interface-guidelines/" },
    ],
    exercise:
      "Create a mini system with colour, spacing, radius and typography tokens plus Button, Text Field, Card, Alert and Dialog components. Each specifies default, hover/pressed (where applicable), focus, disabled and error/validation behaviour.",
    extraBlocks: [
      {
        k: "code",
        lang: "text",
        code: `Button\n├── Appearance: primary | secondary | subtle | destructive\n├── Size: small | medium | large\n├── State: default | hover | pressed | focus | disabled | loading\n├── Leading icon: optional\n├── Trailing icon: optional\n└── Label: required`,
      },
    ],
    a11y: [
      "Every component defines keyboard behaviour and focus appearance",
      "Accessible-name requirements and contrast expectations specified",
      "Disabled / loading semantics defined",
      "Custom components not accepted merely because they visually match",
    ],
    perf: [
      "Avoid components that import large dependencies for trivial behaviour",
      "Tree-shake/split packages; avoid excessive nested wrappers",
      "Prevent unnecessary rerendering; provide asset guidance",
    ],
    assessment: "Token architecture 20% · component API 25% · states/accessibility 20% · design-code correspondence 20% · documentation/governance 15%.",
    capstone: "The capstone UI is composed primarily from a documented mini design system rather than one-off components.",
  }),

  "mod-motion": modulePage({
    id: "mod-motion",
    icon: "MousePointerClick",
    title: "Interaction & Motion",
    hours: "10 hours",
    summary: "Intentional, accessible interactive behaviour — feedback and motion that explain, not decorate.",
    objectives:
      "Understand affordance, state feedback, transition continuity, timing/easing, gesture consequences and reduced-motion alternatives. Motion should explain relationships or reinforce feedback rather than act as unrelated decoration.",
    syllabus: [
      ["Interaction feedback", "2 h", "Hover, focus, pressed, loading, optimistic and completion feedback"],
      ["Motion foundations", "2 h", "Duration, easing, continuity, entering/leaving and state change"],
      ["Gestures & advanced transitions", "3 h", "Drag, swipe, sheets, shared context, interruption and cancellation"],
      ["Accessible motion laboratory", "3 h", "Reduced motion, vestibular safety, performance profiling"],
    ],
    tools: "Figma prototypes; CSS/native animation; a device for testing reduced-motion settings.",
    readings: [
      { label: "Apple HIG", href: "https://developer.apple.com/design/human-interface-guidelines/" },
      { label: "Fluent 2", href: "https://fluent2.microsoft.design/" },
      { label: "WCAG 2.2 Quick Reference", href: "https://www.w3.org/WAI/WCAG22/quickref/" },
    ],
    exercise:
      "Prototype and implement a disclosure panel, a modal transition and a sortable or draggable interaction — each with a reduced-motion alternative.",
    extraBlocks: [
      {
        k: "code",
        lang: "css",
        code: `.card { transition: transform 180ms ease, opacity 180ms ease; }\n.card[data-entering="true"] { opacity: 0; transform: translateY(0.5rem); }\n\n@media (prefers-reduced-motion: reduce) {\n  .card { transition: none; transform: none; }\n}`,
      },
    ],
    a11y: [
      "Essential state understandable without animation",
      "Keyboard equivalents for gesture-only actions; motion preference respected",
      "No harmful flashing; focus follows overlays/dialogs correctly",
      "Drag actions have alternatives when required",
    ],
    perf: [
      "Animate properties that avoid unnecessary layout work",
      "Avoid long blocking work before feedback; keep interruptible interactions responsive",
      "Inspect frame stability on low-end hardware",
    ],
    assessment: "Behavioural clarity 30% · motion craft 20% · accessibility 25% · implementation responsiveness 15% · documentation 10%.",
    capstone: "A motion specification defining purpose, trigger, entering/exiting states and reduced-motion behaviour for every significant transition.",
  }),

  "mod-prototyping": modulePage({
    id: "mod-prototyping",
    icon: "Workflow",
    title: "Prototyping & Handoff",
    hours: "10 hours",
    summary: "Prototypes that answer questions, and handoff that developers don't have to reverse-engineer.",
    objectives:
      "Distinguish prototypes used to answer questions from decorative demo reels; prototype real task flows and edge states; document behaviour and acceptance criteria; and provide implementation information without making developers reverse-engineer a picture.",
    syllabus: [
      ["Prototype fidelity strategy", "2 h", "Paper/low-fidelity, structural, high-fidelity and coded prototypes"],
      ["Stateful prototypes", "3 h", "Variables, component variants, conditional flows and realistic content"],
      ["Usability sessions", "2 h", "Task scripts, observation, severity and iteration"],
      ["Development handoff", "3 h", "Ready-for-dev criteria, specs, edge cases, tokens, assets, acceptance criteria"],
    ],
    tools: "Figma prototypes/variables; Dev Mode; an issue tracker; optionally Storybook or equivalent component docs.",
    readings: [
      { label: "Figma Variables", href: "https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma" },
      { label: "Figma Dev Mode", href: "https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode" },
      { label: "Figma Auto Layout", href: "https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout" },
    ],
    exercise:
      "Prototype one critical journey containing at least one validation error, a cancellation path, a loading state and a successful completion. Run three structured usability sessions, revise, then submit the developer handoff.",
    extraBlocks: [
      {
        k: "code",
        lang: "text",
        code: `TransferAmountField\nInputs   value: Decimal · currency: CurrencyCode · availableBalance: Decimal · error: String?\nBehaviour\n  Empty      -> neutral\n  Invalid    -> error text + accessible announcement\n  Valid      -> Continue enabled\n  Submitting -> controls locked + progress state\nAcceptance\n  Keyboard-only operable · SR label includes currency\n  Error persists until corrected · long/localised values do not clip`,
      },
    ],
    a11y: [
      "Prototype includes focus sequence and accessible copy",
      "Error states and reduced-motion alternatives specified",
      "Intended accessibility names documented — not merely visual screens",
    ],
    perf: [
      "Handoff identifies critical imagery/assets and lazy-vs-eager loading expectations",
      "Skeleton/loading strategies defined",
      "Latency masked honestly rather than deceptively",
    ],
    assessment: "Realism 20% · flow completeness 25% · usability-testing evidence 20% · handoff quality 25% · accessibility/performance spec 10%.",
    capstone: "A formal “ready for development” package: flows, edge states, component references and acceptance tests.",
  }),

  "mod-performance": modulePage({
    id: "mod-performance",
    icon: "Gauge",
    title: "Performance & Optimisation",
    hours: "12 hours",
    summary: "Speed is a design constraint. Measure rather than guess; distinguish lab from field.",
    objectives:
      "Understand that speed is a product-design constraint, not an engineering clean-up. Measure rather than guess, distinguish field from laboratory measurements, identify loading/interactivity/layout-shift problems, design appropriate loading states, and understand equivalent native-performance principles.",
    syllabus: [
      ["Performance as UX", "2 h", "Perceived vs measured latency; budgets and critical journeys"],
      ["Web loading performance", "3 h", "LCP, images, fonts, caching, rendering, network waterfalls"],
      ["Responsiveness & stability", "3 h", "INP, main-thread work, CLS, async content, SPA navigation"],
      ["Native performance", "2 h", "Lists, state/recomposition, startup and release profiling"],
      ["Measurement & regression gates", "2 h", "Field telemetry, Lighthouse, CI budgets and dashboards"],
    ],
    tools: "Browser DevTools; Lighthouse / Lighthouse CI; web-vitals / RUM; native profiling tools for the chosen platform.",
    readings: [
      { label: "Web Vitals", href: "https://web.dev/articles/vitals" },
      { label: "Lighthouse", href: "https://developer.chrome.com/docs/lighthouse/overview" },
      { label: "Jetpack Compose Performance", href: "https://developer.android.com/develop/ui/compose/performance" },
    ],
    exercise:
      "Deliberately build a slow page, establish a baseline, optimise it, and present a performance investigation explaining why each change altered the metrics.",
    extraBlocks: [
      {
        k: "code",
        lang: "html",
        code: `<img\n  src="/hero-960.webp"\n  srcset="/hero-640.webp 640w, /hero-960.webp 960w, /hero-1600.webp 1600w"\n  sizes="(max-width: 48rem) 100vw, 60vw"\n  width="1600" height="900" alt="" fetchpriority="high" />`,
      },
      {
        k: "callout",
        tone: "note",
        title: "2026 note — SPA measurement",
        text:
          "Chrome 151 added APIs to measure Core Web Vitals across SPA “soft” route transitions. Adoption is early and cross-browser support is incomplete — teach it as an evolving capability, not universally comparable data.",
      },
    ],
    a11y: [
      "Loading optimisation must not remove accessible names or semantic structure",
      "Skeletons should not create noisy assistive-tech output",
      "Focus must survive deferred rendering; keyboard input stays responsive",
    ],
    perf: [
      "LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile where field data exist",
      "Lab tests before deployment; monitor mobile and desktop separately",
      "RUM in production where practical",
    ],
    assessment: "Diagnostic reasoning 30% · measurable improvement 30% · technical correctness 20% · preservation of accessibility/visual quality 10% · reporting 10%.",
    capstone: "A documented performance budget and before/after measurement record for the final product.",
  }),

  "mod-testing": modulePage({
    id: "mod-testing",
    icon: "FlaskConical",
    title: "Testing & QA",
    hours: "14 hours",
    summary: "Turn requirements into testable criteria across functional, accessibility and visual regression.",
    objectives:
      "Convert design requirements into testable acceptance criteria; create functional, accessibility and visual regression tests; maintain a device/browser matrix; perform exploratory testing; and distinguish automation from human judgement.",
    syllabus: [
      ["QA strategy & acceptance criteria", "2 h", "Requirements, risk, severity, P0/P1/P2, happy/unhappy paths"],
      ["Functional & end-to-end automation", "3 h", "User-facing selectors, deterministic data, core journeys"],
      ["Accessibility QA", "3 h", "Automated axe checks plus keyboard/screen-reader manual testing"],
      ["Visual & responsive regression", "3 h", "Screenshot baselines, cross-viewport states, rendering variance"],
      ["Exploratory / device QA", "3 h", "Browser/device matrix, localisation, offline/error, release candidate"],
    ],
    tools: "Playwright + @axe-core/playwright; a controlled environment for visual baselines; a device/browser matrix.",
    readings: [
      { label: "Playwright Accessibility Testing", href: "https://playwright.dev/docs/accessibility-testing" },
      { label: "Playwright Visual Comparisons", href: "https://playwright.dev/docs/test-snapshots" },
      { label: "WCAG 2.2 Quick Reference", href: "https://www.w3.org/WAI/WCAG22/quickref/" },
    ],
    exercise:
      "Create a QA suite for the previous project with at least one end-to-end happy path, one validation/error path, an axe scan and visual regression snapshots.",
    extraBlocks: [
      {
        k: "code",
        lang: "ts",
        code: `import { test, expect } from '@playwright/test';\nimport AxeBuilder from '@axe-core/playwright';\n\ntest('transfer review is usable and accessible', async ({ page }) => {\n  await page.goto('/transfer');\n  await page.getByLabel('Transfer amount').fill('125');\n  await page.getByRole('button', { name: 'Review transfer' }).click();\n  await expect(page.getByRole('heading', { name: 'Review transfer' })).toBeVisible();\n  const results = await new AxeBuilder({ page }).analyze();\n  expect(results.violations).toEqual([]);\n  await expect(page).toHaveScreenshot('transfer-review.png');\n});`,
      },
    ],
    a11y: [
      "Automated scan plus keyboard-only journey and focus order",
      "Screen reader; zoom/reflow; error handling; contrast",
      "Touch/pointer interaction and reduced-motion state",
    ],
    perf: [
      "QA suite includes at least a smoke performance gate",
      "Test assets approximate production conditions",
      "Performance regressions block promotion when agreed budgets fail",
    ],
    assessment: "Coverage/risk reasoning 20% · automated tests 25% · accessibility QA 20% · exploratory/manual QA 20% · defect reporting 15%.",
    capstone: "A CI-ready quality suite attached to the final product.",
  }),

  "mod-deployment": modulePage({
    id: "mod-deployment",
    icon: "Rocket",
    title: "Deployment & Maintenance",
    hours: "10 hours",
    summary: "CI/CD, release governance, monitoring, and keeping a product healthy after launch.",
    objectives:
      "Understand branching/review, automated checks, release environments, rollback, monitoring, design-system versioning, accessibility regression and security maintenance. Treat security testing as work spanning definition, design, development, deployment and maintenance — not a final penetration test.",
    syllabus: [
      ["Release architecture", "2 h", "Development, preview/staging, production; secrets and configuration"],
      ["CI/CD", "2 h", "Build, lint, test, accessibility and deploy gates"],
      ["Store / web deployment", "2 h", "Hosting, app distribution, review requirements, release metadata"],
      ["Monitoring & incident response", "2 h", "Errors, analytics, performance, rollback and hotfix strategy"],
      ["Maintenance & governance", "2 h", "Dependency updates, security, deprecation, accessibility regressions"],
    ],
    tools: "GitHub Actions (or equivalent) for CI/CD; error/analytics/performance monitoring; an issue tracker; a runbook.",
    readings: [
      { label: "GitHub Actions", href: "https://docs.github.com/actions" },
      { label: "Apple App Review Guidelines", href: "https://developer.apple.com/app-store/review/guidelines/" },
      { label: "OWASP Web Security Testing Guide", href: "https://owasp.org/www-project-web-security-testing-guide/" },
    ],
    exercise:
      "Create a staging-to-production pipeline with automated tests and a written rollback procedure.",
    extraBlocks: [
      {
        k: "code",
        lang: "yaml",
        code: `name: quality\non:\n  pull_request:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22, cache: npm }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test\n      - run: npx playwright install --with-deps\n      - run: npx playwright test`,
      },
    ],
    a11y: [
      "Accessibility checks remain release gates",
      "Monitor regressions after design-system upgrades; review new/third-party embeds",
      "Include accessibility bugs in normal defect management",
    ],
    perf: [
      "Monitor field data after release; compare releases",
      "Maintain bundle/media budgets; roll back severe regressions",
      "Measure on representative devices / networks",
    ],
    assessment: "CI/CD correctness 25% · release safety 20% · monitoring strategy 20% · maintenance/security approach 20% · documentation/rollback 15%.",
    capstone: "A deployed release plus a runbook covering monitoring, rollback, ownership and future upgrades.",
  }),

  "mod-projects": {
    id: "mod-projects",
    icon: "Hammer",
    kicker: "Curriculum · 32 hours",
    title: "Practical Projects",
    summary: "Increasingly realistic delivery constraints that turn isolated lessons into shipped products.",
    meta: "32 hours",
    blocks: [
      { k: "h2", text: "Learning objectives" },
      {
        k: "p",
        text:
          "Repeatedly move through problem → design → test → implementation, rather than submitting isolated Figma screens. Each project adds a more realistic delivery constraint than the last.",
      },
      { k: "h2", text: "The four projects" },
      {
        k: "table",
        head: ["Project", "Time", "Brief", "Deliverables"],
        rows: [
          ["Responsive information product", "6 h", "Rework a content/service site", "IA, responsive Figma, coded page, a11y audit"],
          ["Transactional product", "8 h", "Multi-step form / checkout / workflow", "Flow, validation/error states, prototype, implementation"],
          ["Cross-platform experience", "8 h", "Adapt one task between web and native", "Shared requirements, platform adaptations, component mapping"],
          ["Production capstone sprint", "10 h", "Harden the final product", "Test suite, optimisation, CI, release, documentation"],
        ],
      },
      {
        k: "callout",
        tone: "warn",
        title: "Every project needs a failure",
        text:
          "Each project must contain a documented failure or edge case. A project containing only idealised happy-path screenshots does not pass.",
      },
      { k: "h2", text: "End-to-end transaction shape" },
      {
        k: "code",
        lang: "text",
        code: `Account selector → Amount input\n  → (invalid) Inline error ┐\n  → (valid) Review summary │\n     → Confirm ←───────────┘\n     → Submitting → success → receipt\n                   → failure → retry / help`,
      },
      { k: "checklist", title: "Accessibility", items: [
        "At least one manual assistive-technology run on the critical task",
        "All essential functionality keyboard accessible where keyboard applies",
        "No critical WCAG AA defect left unresolved",
      ] },
      { k: "checklist", title: "Performance", items: [
        "Measured baseline and final performance shown",
        "Substantial asset/dependency decisions justified",
        "Critical task remains responsive under constrained conditions",
      ] },
      { k: "callout", tone: "brand", title: "Capstone milestone", text: "The four projects form the evidence base for the final graduation assessment." },
    ],
  },

  // ===== Framework =====
  "assessment": {
    id: "assessment",
    icon: "Trophy",
    kicker: "Framework",
    title: "Assessment & capstone",
    summary: "A weighted rubric plus hard quality gates — and the single product you deliver end-to-end.",
    blocks: [
      {
        k: "p",
        text:
          "A “great product” grade cannot be earned by accumulating points for surface aesthetics while failing accessibility or implementation. Grading is a **weighted rubric plus hard quality gates**.",
      },
      { k: "h2", text: "Weighted rubric" },
      {
        k: "table",
        head: ["Criterion", "Weight", "Excellent standard"],
        rows: [
          ["Product value & task completion", "15%", "Problem is clear; the critical task is substantially easier than alternatives"],
          ["Information architecture & usability", "15%", "Navigation, hierarchy and state model clear without explanation"],
          ["Visual hierarchy & typography", "10%", "Consistent, polished, responsive hierarchy with strong legibility"],
          ["Accessibility", "15%", "Critical journeys usable with assistive methods; WCAG 2.2 AA target for web"],
          ["Design system / components", "10%", "Tokens/components reusable, documented and reflected in code"],
          ["Interaction & motion", "5%", "Feedback immediate and purposeful; motion has an accessible alternative"],
          ["Implementation correctness", "10%", "Behaviour matches documented design and handles edge states"],
          ["Performance", "10%", "Meets agreed budgets; web targets current Core Web Vitals where measurable"],
          ["Testing & reliability", "5%", "Critical paths automated and manually verified"],
          ["Handoff / maintainability", "5%", "Another contributor can understand, test and extend the system"],
        ],
      },
      { k: "h2", text: "Hard gates override the score" },
      {
        k: "p",
        text:
          "A product does not graduate — regardless of its weighted score — while it contains any of the following.",
      },
      {
        k: "ul",
        items: [
          "A critical user-flow failure",
          "An unresolved critical accessibility blocker",
          "Loss of user data in ordinary use",
          "An unrecoverable deployment failure",
          "A known severe security issue",
        ],
      },
      { k: "h2", text: "Final capstone — “One product, fully delivered”" },
      {
        k: "p",
        text:
          "Pick a credible real-world problem — personal finance, appointment management, small-business operations, healthcare scheduling, education or productivity — and design one coherent product with a responsive web surface, an authenticated or complex transactional flow, at least one native implementation (or an exceptional PWA path), a reusable mini design system, accessible interactions, measurable performance, functional and visual tests, and a deployment pipeline.",
      },
      {
        k: "table",
        head: ["Artefact", "Minimum evidence"],
        rows: [
          ["Product brief", "Problem, audience, constraints, success metrics, non-goals"],
          ["Research", "User/task evidence and assumptions clearly separated"],
          ["IA / user flows", "Critical task plus failure/cancellation/recovery paths"],
          ["Figma", "Auto Layout, reusable components, variables/tokens and prototype"],
          ["Design system", "Foundations/tokens plus ≥ 8 reusable production components"],
          ["Responsive interface", "Narrow through large-screen behaviour"],
          ["Native / platform", "One critical platform-appropriate journey"],
          ["Accessibility", "WCAG matrix (web); keyboard/AT evidence; native AT test"],
          ["Motion", "Interaction/state spec + reduced-motion behaviour"],
          ["Production code", "Working project in version control"],
          ["Performance", "Baseline, optimisation report and final measurement"],
          ["Testing", "E2E, accessibility and visual regression coverage"],
          ["Deployment", "Staging + production/release-candidate workflow"],
          ["Operations", "Rollback, monitoring and maintenance runbook"],
          ["Retrospective", "What failed, what changed, what evidence changed the design"],
        ],
      },
      { k: "h2", text: "Assessment sequence" },
      {
        k: "flow",
        steps: [
          "Design review",
          "Prototype usability review",
          "Accessibility review",
          "Implementation review",
          "Performance / QA review",
          "Release review",
          "Capstone defence",
        ],
      },
      {
        k: "callout",
        tone: "brand",
        title: "The graduation question",
        text:
          "Can another competent designer or developer open the project tomorrow, understand the component system and product behaviour, change one requirement, test the result and deploy it — without reverse-engineering the original designer's intentions?",
      },
    ],
  },

  "quality-gates": {
    id: "quality-gates",
    icon: "ShieldCheck",
    kicker: "Framework",
    title: "Quality gates",
    summary: "Accessibility and performance embedded in every module as design, implementation and release gates.",
    blocks: [
      {
        k: "p",
        text:
          "Accessibility is embedded in every module, not confined to one section. WCAG 2.2 covers structure (headings, relationships), operation (keyboard, focus, target size), perception (contrast, reflow) and input assistance (labels, errors). The matrix below turns those into course-wide gates.",
      },
      { k: "h2", text: "Accessibility gates" },
      {
        k: "table",
        head: ["Area", "Design review", "Implementation review", "Release review"],
        rows: [
          ["Semantics", "Purpose documented", "Native semantics used", "Accessibility tree sampled"],
          ["Keyboard", "Focus path specified", "Core task keyboard-operable", "Keyboard smoke test passes"],
          ["Focus", "Focus states designed", "Visible, logical, unobscured", "Overlay/nav flows verified"],
          ["Contrast", "Tokens checked", "Runtime states checked", "Automated + manual spot check"],
          ["Text scaling", "Scaled variants designed", "Zoom / Dynamic Type survive", "Critical pages retested"],
          ["Targets", "Adequate hit regions", "Region matches intent", "Touch-device verification"],
          ["Errors", "Copy & recovery designed", "Associated / announced", "Failure-path E2E test"],
          ["Motion", "Reduced-motion design", "Preference honoured", "Setting tested on platform"],
          ["Screen readers", "Names/roles documented", "Semantic output verified", "Critical journey completed"],
          ["Localisation", "Expansion / RTL considered", "Layout tolerates variation", "Localisation tested"],
        ],
      },
      {
        k: "callout",
        tone: "note",
        text:
          "Target sizes differ by platform — Fluent cites 44×44 for iOS/web and 48×48 for Android. Preserve platform expectations rather than forcing one number everywhere.",
      },
      { k: "h2", text: "Performance gates" },
      {
        k: "table",
        head: ["Gate", "Question", "Evidence"],
        rows: [
          ["Before design sign-off", "Heaviest likely UI/media decision?", "Asset inventory / budget"],
          ["Before implementation merge", "What could block interaction or shift layout?", "Profiling + review"],
          ["Staging", "Does the page meet agreed lab budgets?", "Lighthouse / DevTools report"],
          ["Production", "Do real users experience acceptable performance?", "RUM / field data"],
          ["Native", "Is this a release build?", "Release profiling / benchmark"],
          ["Regression", "Did this release worsen a key journey?", "CI / dashboard comparison"],
        ],
      },
      { k: "h2", text: "The layered evidence system" },
      {
        k: "flow",
        steps: [
          "Static checks",
          "Component tests",
          "A11y automation",
          "Integration / E2E",
          "Visual regression",
          "Manual keyboard + AT",
          "Usability testing",
          "Production telemetry",
        ],
      },
      { k: "h2", text: "Four anti-patterns to reject" },
      {
        k: "table",
        head: ["Anti-pattern", "Why it fails", "Replacement"],
        rows: [
          ["“Figma-perfect” but non-responsive", "Screenshot fidelity hides real content/container changes", "Responsive constraints + coded verification"],
          ["“Accessible because Lighthouse is green”", "Automation can't detect every problem", "Automated + manual + AT testing"],
          ["“Performant on my laptop”", "Local lab isn't representative", "Lab + field / RUM evidence"],
          ["“Design system = component gallery”", "Components without tokens, states, APIs & governance aren't a system", "Foundations + components + docs + contribution model"],
        ],
      },
    ],
  },

  "comparisons": {
    id: "comparisons",
    icon: "Columns3",
    kicker: "Framework",
    title: "System comparisons",
    summary: "Apple HIG, Material 3 and Fluent 2 as three related system strategies — not competing styles.",
    blocks: [
      {
        k: "p",
        text:
          "Don't teach Apple HIG, Material and Fluent as competing “styles”. They're three related but distinct system strategies: Apple is strongly platform-idiomatic; Material is a broad language with direct Android/Compose implementation; Fluent supplies multi-platform foundations with explicit global/alias tokens and Figma kits that map towards code.",
      },
      { k: "h2", text: "System strategy comparison" },
      {
        k: "table",
        head: ["Dimension", "Apple HIG", "Material 3", "Fluent 2", "Course lesson"],
        rows: [
          ["Orientation", "Apple platform experience", "Cross-device, strong Android", "Microsoft / multi-platform", "Respect the host platform"],
          ["Foundation", "Conventions, layout, type, controls, a11y", "Colour, type, shape, components, motion", "Tokens, layout, type, components, a11y", "Semantic decisions first, then visual properties"],
          ["Resources", "Official UI kits, system assets", "Material resources/components", "Web, iOS & Android Figma kits", "Use official kits before recreating controls"],
          ["Tokens / theming", "System styling, semantic roles", "Theme/colour roles & type system", "Explicit global + alias hierarchy", "Primitive → semantic → component"],
          ["Typography", "System type / Dynamic Type", "M3 semantic type scale", "Platform-specific ramps", "Semantic roles & scaling, not arbitrary numbers"],
          ["Components", "Native/platform-familiar controls", "Material components", "Code-aligned Fluent components", "Component choice is behavioural, not only visual"],
          ["Design → dev", "Resources + platform frameworks", "Material → Compose", "Figma properties/tokens ↔ code", "Maintain traceability from design to production token"],
        ],
      },
      {
        k: "callout",
        tone: "note",
        text:
          "Material and Fluent describe their components as an accessible foundation (meeting/surpassing WCAG AA). That never means “using the library makes the app accessible” — application-level composition, content and customisation still require testing.",
      },
      { k: "h2", text: "Choosing a component approach" },
      {
        k: "table",
        head: ["Approach", "Best fit", "Strength", "Main risk"],
        rows: [
          ["Native HTML + CSS", "General websites", "Browser-native semantics, minimal abstraction", "Reinventing complex widgets badly"],
          ["Apple SwiftUI", "Apple-native apps", "First-party declarative framework", "Copying web layouts into native"],
          ["Material 3 + Compose", "Modern Android apps", "First-party Android component/system", "Over-customising away system benefits"],
          ["Fluent UI / assets", "Microsoft / multi-platform", "Strong token & Figma↔code model", "Treating Fluent style as universal"],
          ["Headless primitives", "Highly customised web", "Behaviour/a11y foundation without visual style", "Needs stronger CSS/component skill"],
          ["Custom library", "Mature unique products", "Maximum product specificity", "Expensive a11y, maintenance, API responsibility"],
        ],
      },
      { k: "h2", text: "A design-system data model" },
      {
        k: "code",
        lang: "text",
        code: `PRIMITIVE_TOKEN  ──referenced by──▶  SEMANTIC_TOKEN  ──specialised──▶  COMPONENT_TOKEN\nCOMPONENT  has ▶ VARIANT · supports ▶ STATE · contains ▶ SLOT\nCOMPONENT_TOKEN  styles ▶ COMPONENT\nCOMPONENT  ▶ PATTERN  ▶ SCREEN  ▶ USER_FLOW\nCOMPONENT & USER_FLOW  ──validated by──▶  TEST`,
      },
    ],
  },

  // ===== Reference =====
  "readings": {
    id: "readings",
    icon: "BookMarked",
    kicker: "Reference",
    title: "Recommended readings",
    summary: "A living, primarily first-party reading list — refresh it as platform guidance evolves.",
    blocks: [
      {
        k: "p",
        text:
          "Keep the reading list primarily first-party so the syllabus can be refreshed as platform guidance changes — especially for platform design, performance and release material.",
      },
      {
        k: "table",
        head: ["Domain", "Primary resource", "Best stage"],
        rows: [
          ["Apple product design", "Apple Human Interface Guidelines", "Beginner → advanced"],
          ["Apple current resources", "Apple Design & Design Resources", "App design / system work"],
          ["Apple release readiness", "App Review Guidelines", "Deployment"],
          ["Figma responsive design", "Guide to Auto Layout", "Beginner"],
          ["Figma state / tokens", "Guide to Variables", "Intermediate"],
          ["Figma developer workflow", "Guide to Dev Mode", "Intermediate → advanced"],
          ["Material", "Material Design 3", "App / system design"],
          ["Android implementation", "Material 3 in Compose", "Intermediate"],
          ["Android accessibility", "Accessibility in Compose", "Intermediate"],
          ["Android performance", "Compose Performance", "Advanced"],
          ["Fluent", "Fluent 2", "Intermediate"],
          ["Fluent tokens", "Fluent Design Tokens", "Design systems"],
          ["Web accessibility", "WCAG 2.2 Quick Reference", "Entire course"],
          ["Complex widgets", "WAI-ARIA Authoring Practices", "Intermediate → advanced"],
          ["Web performance", "Web Vitals", "Advanced"],
          ["Web auditing", "Lighthouse", "Intermediate → advanced"],
          ["Browser automation", "Playwright Accessibility Testing", "Advanced"],
          ["Visual regression", "Playwright Visual Comparisons", "Advanced"],
          ["CI/CD", "GitHub Actions", "Advanced"],
          ["Security QA", "OWASP Web Security Testing Guide", "Advanced"],
          ["HCI foundations", "Fitts's seminal movement paper", "Interaction theory"],
        ],
      },
      { k: "h2", text: "Key links" },
      {
        k: "links",
        items: [
          { label: "Apple Human Interface Guidelines", href: "https://developer.apple.com/design/human-interface-guidelines/" },
          { label: "Figma — Guide to Auto Layout", href: "https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout" },
          { label: "Figma — Guide to Variables", href: "https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma" },
          { label: "Material Design 3", href: "https://m3.material.io/" },
          { label: "Fluent 2", href: "https://fluent2.microsoft.design/" },
          { label: "WCAG 2.2 Quick Reference", href: "https://www.w3.org/WAI/WCAG22/quickref/" },
          { label: "Web Vitals", href: "https://web.dev/articles/vitals" },
          { label: "Playwright — Accessibility Testing", href: "https://playwright.dev/docs/accessibility-testing" },
          { label: "GitHub Actions", href: "https://docs.github.com/actions" },
          { label: "OWASP Web Security Testing Guide", href: "https://owasp.org/www-project-web-security-testing-guide/" },
        ],
      },
    ],
  },

  "competence": {
    id: "competence",
    icon: "TrendingUp",
    kicker: "Reference",
    title: "Competence levels",
    summary: "The beginner-to-advanced progression, and the single decision that matters most.",
    blocks: [
      {
        k: "table",
        head: ["Level", "Learner can…", "Promotion requirement"],
        rows: [
          ["Foundation", "Construct visually coherent responsive screens", "Real content survives responsive resizing"],
          ["Product designer", "Model flows, states, typography and accessibility", "Critical journey validated with users / AT"],
          ["Systems designer", "Define tokens/components; maintain design-code correspondence", "Mini system implemented, documented and reusable"],
          ["Product builder", "Measure, test, deploy and maintain the whole product", "Capstone passes all hard quality gates"],
        ],
      },
      { k: "h2", text: "The decision that matters most" },
      {
        k: "p",
        text:
          "The most important curriculum decision is not adding another visual-design lesson — it's making **implementation evidence mandatory**. Figma models responsive composition, state and dev status; Fluent demonstrates tokens and code-aligned kits; Material connects system design to a production framework; Apple supplies platform resources; WCAG supplies testable accessibility; Web Vitals supplies measurable targets; Playwright makes automation repeatable; GitHub Actions automates delivery; OWASP extends testing into maintenance.",
      },
      {
        k: "callout",
        tone: "brand",
        title: "Great digital product design",
        text:
          "Not a beautiful interface in isolation, but a coherent system that communicates clearly, adapts to its platform and content, remains usable by people with different abilities, responds quickly, handles failure gracefully, can be tested objectively, survives deployment, and can still be understood and improved after the original designer has moved on.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// PRACTICAL LESSONS
// Each lesson explains the idea, its value, a professional workflow, a review
// checklist, a concrete exercise, and primary sources for further study.
// ---------------------------------------------------------------------------
type PracticalLesson = {
  id: string;
  title: string;
  icon: string;
  kicker: string;
  lead: string;
  why: string;
  workflow: string[][];
  principles: string[];
  exercise: string;
  evidence: string;
  readings: { label: string; href: string }[];
};

function practicalLesson(cfg: PracticalLesson): Page {
  return {
    id: cfg.id,
    icon: cfg.icon,
    kicker: cfg.kicker,
    title: cfg.title,
    summary: cfg.lead,
    blocks: [
      { k: "h2", text: "Why it matters" },
      { k: "p", text: cfg.why },
      { k: "h2", text: "How designers use it" },
      { k: "table", head: ["Stage", "What to do"], rows: cfg.workflow },
      { k: "h2", text: "Principles to remember" },
      { k: "checklist", title: "Review your work", items: cfg.principles },
      { k: "h2", text: "Practice lesson" },
      { k: "p", text: cfg.exercise },
      { k: "callout", tone: "brand", title: "Evidence of a strong result", text: cfg.evidence },
      { k: "h2", text: "Reliable references" },
      { k: "links", items: cfg.readings },
    ],
  };
}

const practicalLessons: PracticalLesson[] = [
  {
    id: "design-principles",
    title: "Design Principles",
    icon: "Compass",
    kicker: "Getting started",
    lead: "Design principles are durable rules for making decisions when a screen, feature, or stakeholder request creates competing options.",
    why: "A polished interface can still solve the wrong problem. Principles keep attention on user needs, evidence, clarity, inclusion, and the full service rather than personal taste. They also give a team shared language for critique, so feedback can describe a user outcome instead of simply saying that something feels better.",
    workflow: [
      ["Frame", "Write the user need, context, constraint, and desired outcome before drawing a solution."],
      ["Explore", "Create several simple options and identify which principle each option supports."],
      ["Test", "Use realistic content and observe whether people can complete the intended task."],
      ["Decide", "Choose from evidence, record the tradeoff, and revisit the decision when conditions change."],
    ],
    principles: [
      "Start with a verified user need",
      "Make the difficult system work feel simple to the user",
      "Be consistent where familiarity helps and adapt where context differs",
      "Design for varied abilities, devices, languages, and situations",
      "Iterate from evidence instead of defending the first idea",
    ],
    exercise: "Choose an existing screen and write its user need in one sentence. Produce three rough alternatives. Review each against clarity, inclusion, effort, and consistency. Test the strongest option with two realistic tasks and record what changed after observation.",
    evidence: "A reviewer can connect every major design choice to a user need, a constraint, a principle, or observed evidence.",
    readings: [
      { label: "Government Design Principles", href: "https://www.gov.uk/guidance/government-design-principles" },
      { label: "Apple Human Interface Guidelines", href: "https://developer.apple.com/design/human-interface-guidelines/" },
    ],
  },
  {
    id: "ios-design",
    title: "iOS App Design",
    icon: "Smartphone",
    kicker: "App design",
    lead: "Good iOS design feels native to Apple platforms while giving the product a clear identity through content, colour, type, and purposeful detail.",
    why: "People bring strong expectations from the system apps they already know. Respecting safe areas, Dynamic Type, standard controls, system navigation, and familiar gestures reduces learning effort and improves compatibility with accessibility features. A custom visual style should support these conventions rather than replace them.",
    workflow: [
      ["Model", "Define the main destinations, the navigation stack within each destination, and any focused modal task."],
      ["Compose", "Begin with system components and semantic text styles, then add product styling where it preserves behaviour."],
      ["Adapt", "Test portrait, landscape, iPad windows, long content, large text, and safe area changes."],
      ["Validate", "Use VoiceOver, Full Keyboard Access where relevant, reduced motion, and a real device before release."],
    ],
    principles: [
      "Use a tab bar for top level destinations and a toolbar for actions",
      "Keep the tab bar stable while people move within a destination",
      "Respect system safe areas, margins, and display features",
      "Support Dynamic Type without hiding essential content",
      "Prefer familiar controls and gestures unless a custom approach clearly improves the task",
      "Aim for the platform control size guidance and provide comfortable spacing",
    ],
    exercise: "Design a three screen booking flow in iPhone and iPad layouts. Use a stable top level destination model, a navigation stack for detail, and a modal confirmation only if the task benefits from focused attention. Test the design at the largest accessibility text size and document any layout adaptation.",
    evidence: "The task remains understandable across window sizes and text settings, and the interaction model would feel familiar to an experienced iOS user.",
    readings: [
      { label: "Apple Human Interface Guidelines", href: "https://developer.apple.com/design/human-interface-guidelines/" },
      { label: "Apple Layout Guidance", href: "https://developer.apple.com/design/human-interface-guidelines/layout" },
      { label: "Apple Accessibility Guidance", href: "https://developer.apple.com/design/human-interface-guidelines/accessibility" },
    ],
  },
  {
    id: "android-design",
    title: "Android App Design",
    icon: "Smartphone",
    kicker: "App design",
    lead: "Android design must work across compact phones, tablets, foldables, desktop windows, varied input devices, and changing device postures.",
    why: "Android is not one fixed phone canvas. Current platform guidance treats adaptive design as the default. Layouts should respond at the pane and component level, navigation should change with available space, and content must remain clear around system bars, display cutouts, keyboards, and gesture regions.",
    workflow: [
      ["Model", "Define core tasks, destinations, state, and expected Back behaviour before styling screens."],
      ["Compose", "Use Material components and semantic colour roles as a dependable behavioural foundation."],
      ["Adapt", "Plan how panes reflow, reveal, resize, or change presentation for each window size."],
      ["Validate", "Test resizable windows, rotation, large text, TalkBack, keyboard input, gesture navigation, and interruptions."],
    ],
    principles: [
      "Choose layouts from the available window size rather than a device name",
      "Change navigation presentation when the window expands",
      "Use WindowInsets so controls are never hidden by system UI",
      "Provide at least 48 dp touch targets for interactive elements",
      "Provide an alternative to gesture only actions",
      "Preserve task state through interruption, sleep, rotation, and return",
    ],
    exercise: "Design a list and detail experience for a compact phone, a foldable, and a tablet. Show the compact one pane view, the expanded two pane view, the navigation change, system inset handling, and predictive Back destination. Test the layout with font scaling and keyboard navigation.",
    evidence: "The same task remains complete and comfortable without stretching a phone layout across larger windows or hiding controls beneath system regions.",
    readings: [
      { label: "Android Adaptive Layout Guidance", href: "https://developer.android.com/design/ui/mobile/guides/layout-and-content/adapt-layout" },
      { label: "Android Layout and Navigation Patterns", href: "https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns" },
      { label: "Android Accessibility Guidance", href: "https://developer.android.com/design/ui/mobile/guides/foundations/accessibility" },
    ],
  },
  {
    id: "purpose",
    title: "Purpose",
    icon: "Target",
    kicker: "Core lesson",
    lead: "Purpose turns a collection of interface elements into a product that helps a specific person reach a meaningful outcome.",
    why: "A screen without a defined purpose accumulates competing messages, controls, and decoration. A clear purpose helps the team prioritise content, choose the primary action, define success, and reject work that does not improve the intended outcome.",
    workflow: [
      ["Define", "Write who the screen serves, what they are trying to achieve, and what success looks like."],
      ["Prioritise", "Choose one primary outcome and rank supporting information by when it is needed."],
      ["Design", "Make the next useful action clear while keeping alternatives available without equal emphasis."],
      ["Measure", "Use task completion, errors, time, confidence, and appropriate product outcomes to judge success."],
    ],
    principles: [
      "Describe the user outcome before describing the feature",
      "Give every screen a primary responsibility",
      "Separate user success from business conversion",
      "State assumptions as questions that research can answer",
      "Remove content that does not help the decision or task",
    ],
    exercise: "Take a busy home screen and write a purpose statement using this form: For this person in this situation, the screen helps them achieve this outcome. Rank every element as essential now, useful later, or unnecessary. Redesign using only the first two groups.",
    evidence: "A new user can explain the screen purpose and identify the next action after a short inspection.",
    readings: [
      { label: "Android Core Value Guidance", href: "https://developer.android.com/quality/core-value" },
      { label: "Government Design Principles", href: "https://www.gov.uk/guidance/government-design-principles" },
    ],
  },
  {
    id: "bd-style",
    title: "Style",
    icon: "SwatchBook",
    kicker: "Basic design",
    lead: "Visual style is the repeatable expression of a product through colour, type, shape, imagery, iconography, and motion.",
    why: "A coherent style helps people recognise the product and understand which elements behave alike. Style becomes useful when it strengthens hierarchy and meaning. It becomes noise when it creates novelty without helping the task.",
    workflow: [
      ["Collect", "Gather brand attributes, audience expectations, platform conventions, and representative content."],
      ["Direct", "Create a small visual direction using type, palette, shape, imagery, and motion references."],
      ["Systemise", "Turn approved decisions into named tokens and component rules."],
      ["Stress test", "Apply the style to dense, sparse, error, disabled, and accessible states before approval."],
    ],
    principles: [
      "Choose a small number of expressive decisions",
      "Use visual differences to communicate meaning",
      "Keep the style coherent across product surfaces",
      "Respect platform behaviour even when the brand is distinctive",
      "Test contrast, legibility, and motion preferences in the final interface",
    ],
    exercise: "Create two visual directions for the same settings screen. Limit each to one type family, one spacing scale, one radius family, and semantic colour roles. Compare which direction communicates hierarchy most clearly before judging personality.",
    evidence: "The interface remains recognisable in an ordinary settings or error screen where large brand graphics are absent.",
    readings: [
      { label: "Apple Design Foundations", href: "https://developer.apple.com/design/human-interface-guidelines/" },
      { label: "GOV UK Design System Styles", href: "https://design-system.service.gov.uk/styles/" },
    ],
  },
  {
    id: "bd-state",
    title: "State",
    icon: "Contrast",
    kicker: "Basic design",
    lead: "State describes what the product knows, what it is doing, and what the user can do at a particular moment.",
    why: "Users experience a sequence of changing conditions rather than a gallery of ideal screens. Missing states create confusion, repeated actions, lost work, and inaccessible feedback. State design makes behaviour visible and recoverable.",
    workflow: [
      ["Inventory", "List data states, interaction states, permission states, network conditions, and lifecycle events."],
      ["Model", "Define what causes each state, what the user sees, and which actions remain available."],
      ["Communicate", "Use clear text, visuals, and semantics to explain status without relying on colour alone."],
      ["Recover", "Provide retry, undo, cancel, save, or support where the user can reasonably continue."],
    ],
    principles: [
      "Design loading, empty, partial, success, error, and offline conditions",
      "Keep feedback near the action or content it describes",
      "Prevent duplicate submission while preserving a way to recover",
      "Distinguish selected, pressed, focused, and disabled meanings",
      "Preserve valuable user input when an operation fails",
    ],
    exercise: "Map every state of a file upload from selection through progress, success, cancellation, network loss, invalid file, and retry. Write the message, available action, and accessibility announcement for each state.",
    evidence: "A reviewer can interrupt the flow at any point and still understand what happened, what is saved, and what to do next.",
    readings: [
      { label: "Material Interaction States", href: "https://m3.material.io/foundations/interaction/states/overview" },
      { label: "Android Core App Quality", href: "https://developer.android.com/develop/adaptive-apps/quality-guidelines/core-app-quality" },
    ],
  },
  {
    id: "bd-spacing",
    title: "Spacing",
    icon: "Ruler",
    kicker: "Basic design",
    lead: "Spacing creates grouping, rhythm, emphasis, and comfortable interaction by controlling the empty area within and between elements.",
    why: "People infer relationships from proximity. Related content should feel connected, while separate ideas need enough distance to be understood as separate. A shared spacing scale also makes a product easier to build and maintain than a collection of unrelated measurements.",
    workflow: [
      ["Choose", "Define a compact scale with enough steps for controls, groups, sections, and page margins."],
      ["Group", "Use smaller gaps within a group and larger gaps between groups."],
      ["Adapt", "Allow larger structural spacing to change with available space while keeping control spacing predictable."],
      ["Audit", "Check alignment, density, touch comfort, text scaling, and localisation with real content."],
    ],
    principles: [
      "Use named spacing tokens instead of isolated values",
      "Let proximity show which label belongs to which control",
      "Keep repeated structures on a consistent rhythm",
      "Avoid using empty space to hide a weak information hierarchy",
      "Test the smallest supported view and the largest text setting",
    ],
    exercise: "Redesign a form using six named spacing values. Annotate spacing inside controls, between label and input, between related fields, between sections, and around the page. Ask another person to identify the groups without reading the labels.",
    evidence: "The content groups are obvious, repeated relationships use the same spacing, and the layout remains comfortable when text grows.",
    readings: [
      { label: "GOV UK Spacing Guidance", href: "https://design-system.service.gov.uk/styles/spacing/" },
      { label: "Apple Layout Guidance", href: "https://developer.apple.com/design/human-interface-guidelines/layout" },
    ],
  },
  {
    id: "bd-components",
    title: "Components",
    icon: "Boxes",
    kicker: "Basic design",
    lead: "A component is a reusable interface unit with a defined purpose, anatomy, behaviour, content model, and set of states.",
    why: "Components reduce repeated design work and make familiar actions behave consistently. Reuse is valuable only when the component has a clear responsibility. A universal component with too many options can be harder to understand than a small family of focused components.",
    workflow: [
      ["Identify", "Find repeated interface responsibilities rather than repeated rectangles."],
      ["Define", "Document anatomy, required content, variants, states, size behaviour, and accessibility."],
      ["Build", "Use constraints and named properties that map cleanly to production code."],
      ["Maintain", "Test changes across real instances and document migration when behaviour changes."],
    ],
    principles: [
      "Name components by purpose rather than appearance",
      "Keep properties independent so combinations remain understandable",
      "Define content limits and responsive behaviour",
      "Include keyboard, focus, loading, disabled, and error behaviour",
      "Add a component only after a real product need appears",
    ],
    exercise: "Build a text field component with label, hint, input, optional prefix, validation message, and character count. Define normal, focus, disabled, error, and success states. Test short labels, long labels, empty values, large text, and narrow widths.",
    evidence: "Another designer and developer can use the component correctly without guessing about content, state, or behaviour.",
    readings: [
      { label: "Figma Variant Fundamentals", href: "https://help.figma.com/hc/en-us/articles/39636737843735-Components-collection-Variants-and-component-set-fundamentals" },
      { label: "GOV UK Design System", href: "https://design-system.service.gov.uk/" },
    ],
  },
  {
    id: "bd-interaction",
    title: "Interaction",
    icon: "MousePointerClick",
    kicker: "Basic design",
    lead: "Interaction design defines how people act on the interface, how the system responds, and how each change remains understandable.",
    why: "A clear static layout can fail when feedback is slow, gestures are hidden, focus moves unexpectedly, or errors remove progress. Good interaction design makes cause and effect visible and supports input through touch, pointer, keyboard, voice, and assistive technology where appropriate.",
    workflow: [
      ["Describe", "Write the trigger, precondition, system response, state change, and recovery for each action."],
      ["Prototype", "Model the critical sequence and realistic delays rather than only screen transitions."],
      ["Test", "Observe people using different input methods and include cancellation and failure."],
      ["Specify", "Record focus movement, feedback timing, announcements, motion, and reduced motion behaviour."],
    ],
    principles: [
      "Make interactive elements recognisable before interaction",
      "Respond immediately even when processing continues",
      "Keep important actions reversible when possible",
      "Provide an alternative to path based gestures",
      "Use motion to explain change rather than decorate delay",
    ],
    exercise: "Prototype adding an item to a saved collection. Include tap, keyboard activation, optimistic feedback, delayed confirmation, failure, retry, undo, and reduced motion. Test whether people can predict the result before acting.",
    evidence: "Every action has a perceivable response, every failure has a next step, and no essential action depends on one input method.",
    readings: [
      { label: "Material Interaction States", href: "https://m3.material.io/foundations/interaction/states/overview" },
      { label: "WCAG 2.2", href: "https://www.w3.org/TR/WCAG22/" },
    ],
  },
  {
    id: "web-users",
    title: "Users",
    icon: "Users",
    kicker: "Website",
    lead: "User centred design begins by understanding what people are trying to do, their context, their current behaviour, and the barriers they face.",
    why: "Demographics alone rarely explain what an interface must support. Research should reveal tasks, motivations, knowledge, constraints, language, access needs, devices, and surrounding channels. Inclusive recruitment prevents the team from optimising only for people who resemble its members.",
    workflow: [
      ["Question", "Turn assumptions about users into research questions that could change a design decision."],
      ["Recruit", "Include relevant experience levels, access needs, contexts, and people who need support."],
      ["Observe", "Study current behaviour and real tasks, not only stated preferences."],
      ["Apply", "Convert patterns into needs, risks, design changes, and questions for the next round."],
    ],
    principles: [
      "Research behaviour and context as well as opinions",
      "Include disabled people throughout the design process",
      "Separate observed evidence from interpretation",
      "Protect participant privacy and obtain informed consent",
      "Continue research after launch because needs and behaviour change",
    ],
    exercise: "Plan five interviews about a real task. Write three research questions, define who must be represented, and prepare a realistic task prompt. After the sessions, separate observations, findings, and design actions into three columns.",
    evidence: "The research changes at least one product decision and makes remaining uncertainty explicit.",
    readings: [
      { label: "GOV UK User Research Introduction", href: "https://www.gov.uk/service-manual/user-research/how-user-research-improves-service-design" },
      { label: "GOV UK Research Planning", href: "https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service" },
    ],
  },
  {
    id: "web-goals",
    title: "Goals",
    icon: "Flag",
    kicker: "Website",
    lead: "A useful website connects a user goal with a measurable product outcome without confusing one for the other.",
    why: "A conversion metric can increase while the experience becomes less useful. Good goals therefore combine task outcomes, quality measures, and business value. The goal should tell the team what improvement means and protect it from optimising superficial activity.",
    workflow: [
      ["Outcome", "Describe the real world change the user wants after using the site."],
      ["Measure", "Choose task completion, error, time, confidence, return, or quality measures that fit the outcome."],
      ["Instrument", "Collect only the events and feedback needed to answer a defined question."],
      ["Review", "Compare quantitative signals with research and support evidence before changing the design."],
    ],
    principles: [
      "Prefer outcomes over page views or button clicks",
      "Pair success measures with guardrails such as errors or complaints",
      "Define the measurement before launching the design",
      "Segment results where different users face different conditions",
      "Avoid collecting personal data without a clear need",
    ],
    exercise: "For a course enrolment page, write one user outcome, one product outcome, three measures, and two guardrails. Explain what each measure can reveal and what it cannot prove on its own.",
    evidence: "The team can tell whether people reached the intended outcome and whether the method introduced new harm or friction.",
    readings: [
      { label: "GOV UK Service Standard", href: "https://www.gov.uk/service-manual/service-standard" },
      { label: "Measuring Service Benefits", href: "https://www.gov.uk/service-manual/measuring-success/measuring-service-benefits" },
    ],
  },
  {
    id: "web-usability",
    title: "Usability",
    icon: "Pointer",
    kicker: "Website",
    lead: "Usability is the degree to which intended users can complete intended tasks effectively, efficiently, and with an acceptable experience in context.",
    why: "A design team already knows how its interface works, so internal review cannot reproduce the uncertainty of a first visit. Observing representative people attempt realistic tasks reveals unclear language, hidden actions, unexpected navigation, and fragile recovery paths.",
    workflow: [
      ["Choose", "Select the highest value or highest risk tasks and define observable completion criteria."],
      ["Prepare", "Use realistic content, a functioning prototype, and neutral task prompts."],
      ["Observe", "Let participants work without coaching while recording behaviour, errors, and comments."],
      ["Improve", "Prioritise recurring barriers, revise the design, and test the changed task again."],
    ],
    principles: [
      "Test tasks rather than asking whether people like a screen",
      "Use familiar language and patterns where they support the task",
      "Count recoverable confusion as a design issue, not only failure",
      "Test important error and cancellation paths",
      "Combine observed behaviour with appropriate performance data",
    ],
    exercise: "Ask five representative people to find a plan, compare it, start purchase, correct a form error, and cancel before payment. Record completion, hesitation, errors, and confidence. Fix the most consequential repeated barrier and test again.",
    evidence: "People complete the critical task without coaching, and the team can show which observations led to each revision.",
    readings: [
      { label: "GOV UK Making Services Simple", href: "https://www.gov.uk/service-manual/service-standard/point-4-make-the-service-simple-to-use" },
      { label: "GOV UK User Research", href: "https://www.gov.uk/service-manual/user-research" },
    ],
  },
  {
    id: "web-credibility",
    title: "Credibility",
    icon: "BadgeCheck",
    kicker: "Website",
    lead: "Credibility grows when a website is clear about who is responsible, what it offers, what will happen next, and how users remain in control.",
    why: "Trust is not a decorative badge. It is the result of accurate content, consistent behaviour, secure and understandable transactions, visible support, honest limits, and professional maintenance. Misleading urgency or hidden costs may improve a short term metric while damaging confidence and retention.",
    workflow: [
      ["Identify", "List the uncertainties a first time visitor must resolve before acting."],
      ["Explain", "Place ownership, price, evidence, privacy, delivery, and cancellation information near the decision."],
      ["Demonstrate", "Use specific claims, verifiable proof, and accurate product states."],
      ["Maintain", "Review dates, links, policies, support paths, and visual defects on a schedule."],
    ],
    principles: [
      "Make the organisation and responsibility clear",
      "Use specific evidence instead of vague superiority claims",
      "Show total cost and important conditions before commitment",
      "Avoid disguised advertising, forced continuity, and false urgency",
      "Provide clear security, privacy, support, and cancellation information",
    ],
    exercise: "Audit a purchase page from the perspective of a cautious first time visitor. List every unanswered question about identity, product, cost, delivery, privacy, cancellation, and support. Revise the page so answers appear at the relevant decision point.",
    evidence: "A user can explain who provides the service, what they will receive, what it costs, and how to get help before committing.",
    readings: [
      { label: "GOV UK Good Service Design", href: "https://www.gov.uk/service-manual/design/introduction-designing-government-services" },
      { label: "GOV UK Content Design Role", href: "https://www.gov.uk/service-manual/the-team/content-designer" },
    ],
  },
  {
    id: "web-journey",
    title: "Journey",
    icon: "Route",
    kicker: "Website",
    lead: "A user journey describes the complete experience of reaching an outcome across time, channels, people, policies, and product touchpoints.",
    why: "The interface may be only one part of a larger task. A technically correct website can still fail when identity checks, email, support, delivery, or internal processes create gaps. Journey mapping makes these handoffs and dependencies visible.",
    workflow: [
      ["Scope", "Choose a specific person, goal, starting condition, and end condition."],
      ["Map", "Record actions, touchpoints, questions, emotions, barriers, evidence, and backstage dependencies."],
      ["Find", "Locate moments where responsibility changes or people repeat information."],
      ["Improve", "Design the smallest joined up change that removes the most important barrier."],
    ],
    principles: [
      "Map the current experience before drawing an ideal one",
      "Include offline and support channels",
      "Show evidence and uncertainty directly on the map",
      "Include waiting, interruption, rejection, and recovery",
      "Assign ownership to improvements beyond the interface",
    ],
    exercise: "Map the journey of changing an address from discovering the requirement through final confirmation. Include web, email, identity evidence, support, internal processing, waiting, and failure. Mark the three greatest risks and one measurable improvement for each.",
    evidence: "The map reveals a service problem that would be invisible in a screen flow alone and connects it to an owner and next action.",
    readings: [
      { label: "GOV UK Good Service Design", href: "https://www.gov.uk/service-manual/design/introduction-designing-government-services" },
      { label: "GOV UK Research in Discovery", href: "https://www.gov.uk/service-manual/user-research/user-research-in-discovery" },
    ],
  },
  {
    id: "web-userflows",
    title: "User flows",
    icon: "Workflow",
    kicker: "Website",
    lead: "A user flow models the screens, decisions, system responses, and alternate paths required to complete one defined task.",
    why: "Flows expose missing states before visual polish makes them expensive to change. They help design, engineering, content, and testing agree on entry points, decisions, data, errors, cancellation, and completion.",
    workflow: [
      ["Boundary", "Define the trigger, preconditions, successful result, and what lies outside the flow."],
      ["Main path", "Map the simplest valid route from entry to completion."],
      ["Branches", "Add invalid input, unavailable data, permissions, timeout, cancellation, and return."],
      ["Verify", "Connect each step to a screen state, rule, event, and acceptance criterion."],
    ],
    principles: [
      "Use one clear action or decision at each node",
      "Distinguish user actions from system responses",
      "Show where data is created, changed, saved, or discarded",
      "Include Back, cancel, retry, and resume behaviour",
      "Keep the diagram readable enough to support discussion",
    ],
    exercise: "Map password reset from sign in through email delivery, expired link, new password rules, success, and return to the original task. Write the page title, primary action, error condition, and saved state for every step.",
    evidence: "A tester can derive complete happy path and failure path scenarios from the flow without inventing missing behaviour.",
    readings: [
      { label: "GOV UK Good Service Design", href: "https://www.gov.uk/service-manual/design/introduction-designing-government-services" },
      { label: "WAI ARIA Authoring Practices", href: "https://www.w3.org/WAI/ARIA/apg/" },
    ],
  },
  {
    id: "web-content",
    title: "Content",
    icon: "FileText",
    kicker: "Website",
    lead: "Content design gives people the information and language they need to understand, decide, and act at the right moment.",
    why: "Words are part of the interface. Labels, headings, instructions, errors, and confirmations shape the task as directly as controls do. Designing with real content early reveals hierarchy, layout, and policy problems that placeholder copy hides.",
    workflow: [
      ["Need", "Identify what the user must know or do at this point in the journey."],
      ["Structure", "Lead with the answer, use descriptive headings, and place details in the order needed."],
      ["Write", "Use familiar words, active sentences, specific actions, and meaningful link labels."],
      ["Test", "Check comprehension, scanning, translation, zoom, screen reader output, and error recovery."],
    ],
    principles: [
      "Write for the user task rather than the organisation structure",
      "Give headings and labels a clear topic or purpose",
      "Use link text that describes the destination",
      "Keep instructions beside the decision they support",
      "Review content for accuracy, relevance, accessibility, and ownership",
    ],
    exercise: "Rewrite a complex application page using real policy information. Begin with the outcome, divide the task under descriptive headings, replace vague links, and write errors that explain the problem and correction. Test it with a person unfamiliar with the service.",
    evidence: "A reader can find the answer, predict the next step, and recover from an error without needing the designer to explain the page.",
    readings: [
      { label: "GOV UK Content Design Role", href: "https://www.gov.uk/service-manual/the-team/content-designer" },
      { label: "W3C Link Purpose Guidance", href: "https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html" },
    ],
  },
  {
    id: "layout-structure",
    title: "Structure",
    icon: "LayoutGrid",
    kicker: "Layout",
    lead: "Structure organises content into meaningful regions and relationships before colour, decoration, or fine spacing is applied.",
    why: "Strong structure supports scanning, navigation, accessibility, and responsive change. It lets visual layout and semantic markup tell the same story. When structure depends only on position or styling, it can collapse when content, text size, language, or viewport changes.",
    workflow: [
      ["Inventory", "List the content, actions, and states required for the user task."],
      ["Group", "Create meaningful regions based on purpose and relationship."],
      ["Order", "Place content in a logical reading and focus sequence."],
      ["Adapt", "Define how regions resize, wrap, reflow, reveal, or change presentation."],
    ],
    principles: [
      "Begin with one column at the smallest useful width",
      "Use semantic regions and a logical heading hierarchy",
      "Let content determine when the layout needs to change",
      "Constrain long lines and wide controls for readability",
      "Keep reading order meaningful when columns collapse",
    ],
    exercise: "Turn a desktop dashboard into a content outline, then rebuild its structure at narrow, medium, and wide widths. Annotate reading order, focus order, maximum widths, pane changes, and which information appears first.",
    evidence: "The page remains understandable as plain text, at narrow width, at high zoom, and when sections reflow into a different visual arrangement.",
    readings: [
      { label: "Responsive Web Design Basics", href: "https://web.dev/articles/responsive-web-design-basics" },
      { label: "GOV UK Layout Guidance", href: "https://design-system.service.gov.uk/styles/layout/" },
    ],
  },
  {
    id: "layout-sections",
    title: "Sections",
    icon: "Columns3",
    kicker: "Layout",
    lead: "A section groups content that answers one meaningful question or advances one part of the task.",
    why: "Sections help people scan, understand progress, and skip to relevant material. They also create reusable responsive units. Too many sections fragment the story, while sections without meaningful headings hide the structure from both sighted readers and assistive technology.",
    workflow: [
      ["Outline", "Turn the page into user questions and place them in the order they are likely to arise."],
      ["Name", "Give each section a descriptive heading that makes sense outside the page context."],
      ["Compose", "Keep one main idea per section and connect supporting content directly to it."],
      ["Rhythm", "Vary density with purpose while preserving consistent alignment and spacing rules."],
    ],
    principles: [
      "Use headings to describe topic or purpose",
      "Avoid a section that exists only for visual decoration",
      "Keep related actions inside the section they affect",
      "Use spacing before extra lines or containers",
      "Check that section order still works on a small screen",
    ],
    exercise: "Outline a long product page as seven user questions. Write a specific heading and one sentence answer for each, then add only the evidence or action needed. Remove any section that cannot justify its place in the sequence.",
    evidence: "A reader can scan only the headings and accurately predict the content, order, and main action of the page.",
    readings: [
      { label: "WCAG 2.2", href: "https://www.w3.org/TR/WCAG22/" },
      { label: "GOV UK Layout Guidance", href: "https://design-system.service.gov.uk/styles/layout/" },
    ],
  },
  {
    id: "layout-headers-footers",
    title: "Headers and footers",
    icon: "PanelTop",
    kicker: "Layout",
    lead: "Headers establish identity and primary navigation, while footers provide supporting destinations, policy, ownership, and a dependable end to the page.",
    why: "These regions appear repeatedly, so small problems affect every visit. Their job is orientation and access, not displaying every available action. Consistent placement also helps returning users build a stable mental model of the site.",
    workflow: [
      ["Prioritise", "Choose the identity, primary destinations, current location cue, and one essential utility action."],
      ["Adapt", "Design how navigation opens, closes, wraps, and receives focus on narrow screens."],
      ["Support", "Use the footer for important secondary links, legal information, contact, and ownership."],
      ["Test", "Check keyboard access, focus return, zoom, long labels, active state, and screen reader landmarks."],
    ],
    principles: [
      "Keep primary navigation focused on major destinations",
      "Use the same header model across related pages",
      "Show a clear current location where it helps orientation",
      "Do not duplicate every page action in the header",
      "Keep footer information accurate and assign an owner",
    ],
    exercise: "Design a responsive header and footer for a six section service. Specify desktop and mobile navigation, menu focus behaviour, active location, support access, policy links, and content ownership. Complete the whole flow using only a keyboard.",
    evidence: "People can identify the site, reach every primary destination, understand where they are, and find support at both narrow and wide widths.",
    readings: [
      { label: "GOV UK Header Component", href: "https://design-system.service.gov.uk/components/header/" },
      { label: "GOV UK Footer Component", href: "https://design-system.service.gov.uk/components/footer/" },
    ],
  },
  {
    id: "vd-icon",
    title: "Icons",
    icon: "Sparkles",
    kicker: "Visual design",
    lead: "An interface icon is a simplified symbol that communicates one action, object, or state quickly and consistently.",
    why: "Icons can improve scanning for familiar concepts, but an unfamiliar symbol creates guessing. Meaning, not decoration, should determine whether an icon appears. A coherent family also needs consistent weight, detail, perspective, alignment, and selected state treatment.",
    workflow: [
      ["Meaning", "Name the concept first and check whether a familiar platform symbol already represents it."],
      ["Draw", "Reduce the shape to the minimum detail needed at the final display size."],
      ["Balance", "Match optical weight, stroke, corner treatment, view box, and baseline across the set."],
      ["Validate", "Test recognition without context, then add a text label whenever meaning is uncertain."],
    ],
    principles: [
      "Use one icon for one stable meaning",
      "Prefer familiar system symbols for common actions",
      "Pair ambiguous icons with visible labels",
      "Do not communicate state through colour alone",
      "Provide an accessible name for an icon only control",
    ],
    exercise: "Create or select icons for search, share, delete, filter, and save. Test them at the intended size with no labels, then with labels. Record misinterpretations and replace any symbol that depends on explanation.",
    evidence: "The icons remain clear at final size, belong to one visual family, and never force a user to infer an unfamiliar action.",
    readings: [
      { label: "Apple Icon Guidance", href: "https://developer.apple.com/design/human-interface-guidelines/icons" },
      { label: "Apple Menu Guidance", href: "https://developer.apple.com/design/human-interface-guidelines/menus" },
    ],
  },
  {
    id: "vd-imagery",
    title: "Imagery",
    icon: "Image",
    kicker: "Visual design",
    lead: "Imagery should explain, demonstrate, document, or create an intentional emotional tone that supports the content.",
    why: "A useful image can make a product or idea immediately understandable. Decorative imagery can increase load time, distract from decisions, or exclude people when essential information exists only inside the image. Every image needs a defined role.",
    workflow: [
      ["Purpose", "State what the image contributes that the surrounding words do not."],
      ["Direct", "Choose subject, crop, perspective, lighting, colour, and representation to match the message."],
      ["Prepare", "Create suitable dimensions, modern formats, responsive sources, and stable aspect ratios."],
      ["Describe", "Write alternative text for meaningful images and use empty alternative text for decoration."],
    ],
    principles: [
      "Do not place essential instructions only inside an image",
      "Use imagery that represents people respectfully and specifically",
      "Reserve layout space so loading does not shift content",
      "Match crop and focal point to each responsive context",
      "Remove an image that does not add information or meaningful tone",
    ],
    exercise: "Audit ten images on a product page. Give each a purpose, meaningful alternative text or decorative status, target aspect ratio, and size budget. Remove two images with no useful role and compare clarity and loading behaviour.",
    evidence: "The page remains complete without seeing decorative images, meaningful images have accurate alternatives, and media loads without disruptive layout movement.",
    readings: [
      { label: "GOV UK Image Guidance", href: "https://design-system.service.gov.uk/styles/images/" },
      { label: "Responsive Web Design Basics", href: "https://web.dev/articles/responsive-web-design-basics" },
    ],
  },
  {
    id: "vd-components",
    title: "Visual components",
    icon: "Shapes",
    kicker: "Visual design",
    lead: "Visual component design turns semantic roles and behaviour into a coherent family that remains legible across variants, states, themes, and platforms.",
    why: "Consistency does not mean every component looks identical. It means the same visual decisions have the same meaning. Shared colour, type, spacing, shape, and elevation tokens make hierarchy predictable and keep later changes controlled.",
    workflow: [
      ["Role", "Define the component purpose, importance, and relationship to nearby content."],
      ["Tokenise", "Apply semantic colour, type, spacing, radius, border, and elevation roles."],
      ["Differentiate", "Make variants and states distinct enough to communicate behaviour without losing family resemblance."],
      ["Stress test", "Check themes, long text, zoom, dense layouts, disabled states, and high contrast needs."],
    ],
    principles: [
      "Use hierarchy to distinguish primary, secondary, and quiet actions",
      "Keep state cues visible in more than one way",
      "Avoid adding a visual variant without a semantic reason",
      "Use component tokens for local decisions that may evolve",
      "Compare the design with the coded component before release",
    ],
    exercise: "Design a button, text field, card, alert, and dialog using the same token set. Create the necessary variants and states, then place all five in a realistic form. Fix any token that produces weak hierarchy or ambiguous state.",
    evidence: "The components look related, their roles remain distinct, and a token change updates the family without creating one off repairs.",
    readings: [
      { label: "Figma Variant Fundamentals", href: "https://help.figma.com/hc/en-us/articles/39636737843735-Components-collection-Variants-and-component-set-fundamentals" },
      { label: "Material Design 3", href: "https://m3.material.io/" },
    ],
  },
  {
    id: "states-links",
    title: "Links",
    icon: "Link",
    kicker: "States",
    lead: "A link moves to a resource or location, while a button performs an action in the current context.",
    why: "Using the correct control sets an accurate expectation and gives browsers and assistive technology the right behaviour. Clear link text also lets people scan a page or a list of links without reconstructing the surrounding sentence.",
    workflow: [
      ["Choose", "Use a link for navigation and a button for an operation or submission."],
      ["Name", "Describe the destination or result with meaningful text."],
      ["Style", "Make links recognisable without depending on colour alone and define visited, hover, focus, and active states."],
      ["Test", "Check keyboard order, focus visibility, new window behaviour, broken destinations, and screen reader link lists."],
    ],
    principles: [
      "Avoid vague labels such as click here or learn more when context is weak",
      "Use consistent text for links with the same destination",
      "Do not remove underlines from body links without another persistent cue",
      "Keep focus visible and unobscured",
      "Warn users when a link unexpectedly opens a different format or context",
    ],
    exercise: "Audit every link on a content page with the surrounding text hidden. Rewrite any label whose destination becomes unclear. Then verify default, visited, hover, focus, and active states against the page backgrounds.",
    evidence: "Each link makes sense in isolation, looks interactive in every relevant state, and behaves as navigation rather than a disguised action.",
    readings: [
      { label: "W3C Link Purpose Guidance", href: "https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html" },
      { label: "WCAG 2.2", href: "https://www.w3.org/TR/WCAG22/" },
    ],
  },
  {
    id: "states-component",
    title: "Component states",
    icon: "Layers",
    kicker: "States",
    lead: "Component states communicate availability, interaction, selection, progress, validation, and completion for one reusable control.",
    why: "State names must describe different meanings rather than simply different colours. Hover indicates pointer position, focus identifies the current keyboard or assistive input target, pressed shows activation, selected records a choice, and disabled removes current operability. Combining them carelessly creates ambiguity.",
    workflow: [
      ["List", "Identify every interaction, data, validation, permission, and progress state the component can enter."],
      ["Define", "Document the trigger, visual cue, semantic output, available actions, and exit condition."],
      ["Combine", "Test valid combinations such as selected with focus and reject impossible combinations."],
      ["Validate", "Use real input methods, high contrast settings, loading delays, and assistive technology."],
    ],
    principles: [
      "Do not treat hover and focus as the same state",
      "Keep selected state distinct from momentary pressed state",
      "Use disabled only when the reason is understandable",
      "Preserve focus or move it deliberately after state changes",
      "Announce important asynchronous changes when users cannot otherwise perceive them",
    ],
    exercise: "Create a state matrix for a selectable card with a nested action. Include default, hover, focus, pressed, selected, disabled, loading, and error. Remove any nested interaction that makes keyboard or pointer behaviour ambiguous.",
    evidence: "A developer can implement the state machine from the specification, and users can tell what is available, current, selected, and changing.",
    readings: [
      { label: "Material Interaction States", href: "https://m3.material.io/foundations/interaction/states/overview" },
      { label: "Figma Create and Use Variants", href: "https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants" },
    ],
  },
  {
    id: "a11y-keyboard",
    title: "Keyboard navigation",
    icon: "Keyboard",
    kicker: "Accessibility",
    lead: "Keyboard accessibility means every applicable task can be completed without a pointer and without becoming trapped in a component.",
    why: "Keyboard operation supports people with motor or vision disabilities, switch users, voice control workflows, and many expert users. Native elements provide dependable behaviour, while custom controls require careful semantics and key handling.",
    workflow: [
      ["Structure", "Use native links, buttons, form controls, and logical document order before adding custom behaviour."],
      ["Specify", "Define Tab movement, arrow key behaviour where appropriate, activation keys, Escape, and focus return."],
      ["Operate", "Complete every critical task using only the keyboard."],
      ["Inspect", "Verify focus order, names, roles, states, scroll visibility, and absence of traps."],
    ],
    principles: [
      "Keep focus order aligned with meaning and reading order",
      "Never add positive tabindex values to repair visual order",
      "Move focus into a modal and return it to the trigger on close",
      "Provide a way to bypass repeated navigation",
      "Do not require a pointer path or dragging movement for an essential action",
    ],
    exercise: "Disconnect the mouse and complete account creation, validation, help, submission, and cancellation. Record every extra tab stop, missing control, trap, invisible focus state, and unexpected focus jump. Repair and repeat from the beginning.",
    evidence: "The complete task works with predictable keys, visible position, logical order, and no pointer assistance.",
    readings: [
      { label: "WCAG 2.2", href: "https://www.w3.org/TR/WCAG22/" },
      { label: "WAI ARIA Authoring Practices", href: "https://www.w3.org/WAI/ARIA/apg/" },
    ],
  },
  {
    id: "a11y-focus",
    title: "Focus states",
    icon: "Focus",
    kicker: "Accessibility",
    lead: "Keyboard focus identifies the single element that will receive the next keyboard action.",
    why: "Without a visible indicator, a keyboard user cannot reliably operate the interface. Focus must also remain logically ordered and visible when sticky headers, dialogs, cookie notices, or scrolling containers could cover it.",
    workflow: [
      ["Design", "Create a high visibility indicator that works on every component and background."],
      ["Implement", "Use focus visible behaviour so the indicator appears for keyboard interaction without suppressing it globally."],
      ["Manage", "Move focus only when a context change requires it and return focus after temporary layers close."],
      ["Test", "Check every state at zoom, with sticky content, in overlays, and in forced colour settings."],
    ],
    principles: [
      "Never remove the browser outline without a stronger replacement",
      "Use a visible change with sufficient contrast against adjacent colours",
      "Keep the focused element at least partly unobscured",
      "Do not confuse selected state with focused state",
      "Test focus on light, dark, image, error, and disabled adjacent surfaces",
    ],
    exercise: "Create one focus treatment for links, buttons, inputs, cards, and menu items on light and dark surfaces. Navigate the full page at 200 percent zoom and confirm that sticky elements never fully hide the focused target.",
    evidence: "A person can always locate focus immediately, understand which control owns it, and continue without the indicator disappearing behind other content.",
    readings: [
      { label: "WCAG Focus Appearance", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html" },
      { label: "GOV UK Focus State Guidance", href: "https://design-system.service.gov.uk/get-started/focus-states/" },
    ],
  },
  {
    id: "maint-analytics",
    title: "Analytics review",
    icon: "TrendingUp",
    kicker: "Maintenance",
    lead: "Analytics review uses behavioural and performance data to find product questions, monitor outcomes, and detect changes after release.",
    why: "Analytics reveal what happened at scale but rarely explain why. A useful review begins with a question, protects privacy, checks data quality, and combines quantitative patterns with research, feedback, support, and technical evidence.",
    workflow: [
      ["Question", "Define the decision and the behaviour or outcome that would inform it."],
      ["Validate", "Check event meaning, missing data, consent, sample, segmentation, and release changes."],
      ["Interpret", "Compare trends, funnels, errors, performance, and relevant qualitative evidence."],
      ["Act", "Create a hypothesis, choose a change or research task, and define how it will be evaluated."],
    ],
    principles: [
      "Measure outcomes rather than collecting every possible event",
      "Treat correlation as a question rather than proof of cause",
      "Segment by device and context when experience differs",
      "Pair web performance field data with laboratory diagnosis",
      "Document metric definitions so the team interprets them consistently",
    ],
    exercise: "Review a checkout funnel with completion, validation errors, device class, and performance data. Write three findings, three alternative explanations, and the smallest research or design test that could distinguish them.",
    evidence: "Every proposed change names the supporting signal, uncertainty, expected outcome, and measurement plan.",
    readings: [
      { label: "GOV UK Designing with Data", href: "https://www.gov.uk/service-manual/design/designing-with-data-an-introduction" },
      { label: "Web Vitals", href: "https://web.dev/articles/vitals" },
    ],
  },
  {
    id: "maint-feedback",
    title: "User feedback",
    icon: "MessageSquare",
    kicker: "Maintenance",
    lead: "User feedback is a continuous evidence source that reveals language, expectations, barriers, and unmet needs that behavioural data cannot explain alone.",
    why: "Feedback is valuable but biased toward people who choose to respond and toward unusually good or bad moments. Teams should analyse patterns, connect them to context, and validate important issues through observation rather than treating every request as a feature specification.",
    workflow: [
      ["Collect", "Offer accessible channels at relevant moments and protect personal information."],
      ["Classify", "Tag the task, user context, issue, severity, frequency, and supporting evidence."],
      ["Investigate", "Combine themes with support logs, analytics, and targeted research."],
      ["Respond", "Prioritise the underlying need, communicate progress where appropriate, and measure the result."],
    ],
    principles: [
      "Ask focused questions instead of only requesting a rating",
      "Separate the reported solution from the underlying need",
      "Include feedback from support and non digital channels",
      "Prioritise severity and user impact as well as volume",
      "Close the loop when people reasonably expect a response",
    ],
    exercise: "Analyse twenty feedback items. Group them by task and underlying need, then compare the themes with one analytics signal and one support source. Write a research question for the highest risk uncertainty.",
    evidence: "The team can explain why a theme matters, who it affects, how confident the evidence is, and what it will do next.",
    readings: [
      { label: "GOV UK User Research", href: "https://www.gov.uk/service-manual/user-research" },
      { label: "GOV UK Research Analysis", href: "https://www.gov.uk/service-manual/user-research/analyse-a-research-session" },
    ],
  },
  {
    id: "maint-bugs",
    title: "Bug fixes",
    icon: "Bug",
    kicker: "Maintenance",
    lead: "A bug fix restores an expected user outcome and reduces the chance that the same failure returns.",
    why: "Visual symptoms may come from state, data, timing, accessibility, performance, or platform behaviour. Fixing only the visible symptom can create regressions elsewhere. A strong fix begins with reproducible evidence and ends with verification under the conditions that caused the failure.",
    workflow: [
      ["Triage", "Record user impact, frequency, affected contexts, workarounds, and urgency."],
      ["Reproduce", "Capture the smallest reliable steps, environment, inputs, expected result, and actual result."],
      ["Repair", "Find the underlying cause and add an appropriate automated or documented regression check."],
      ["Verify", "Retest the original case, nearby cases, accessibility, performance, and supported platforms."],
    ],
    principles: [
      "Prioritise blocked tasks, data loss, security, and accessibility impact",
      "Preserve user input and offer recovery when failure is possible",
      "Fix the cause rather than hiding the message",
      "Include realistic data and timing in regression tests",
      "Document known limits and ownership when a complete fix is delayed",
    ],
    exercise: "Choose a real form defect. Write a reproduction that another person can follow, identify the broken expectation, create a regression test, repair the cause, and verify keyboard, screen reader, small screen, and slow network behaviour.",
    evidence: "The original failure no longer occurs, nearby behaviour still works, and a repeat would be detected before release.",
    readings: [
      { label: "Android Core App Quality", href: "https://developer.android.com/develop/adaptive-apps/quality-guidelines/core-app-quality" },
      { label: "WCAG 2.2", href: "https://www.w3.org/TR/WCAG22/" },
    ],
  },
  {
    id: "maint-content",
    title: "Content updates",
    icon: "FilePen",
    kicker: "Maintenance",
    lead: "Content maintenance keeps every instruction, label, claim, link, and policy accurate, useful, accessible, and owned after launch.",
    why: "Outdated content can cause the same harm as broken functionality. Prices, eligibility, contact details, product behaviour, and platform instructions change. An explicit lifecycle prevents the site from becoming a mixture of current and abandoned information.",
    workflow: [
      ["Inventory", "Record the purpose, owner, source, risk, review date, and dependencies of important content."],
      ["Review", "Check accuracy, user need, reading order, accessibility, links, and consistency with the product."],
      ["Change", "Update related interfaces, help, metadata, messages, and translated versions together."],
      ["Retire", "Remove obsolete content safely and redirect or explain changed destinations."],
    ],
    principles: [
      "Assign an accountable owner to consequential content",
      "Review high risk information more frequently",
      "Keep visible copy aligned with actual product behaviour",
      "Test changed content inside the real responsive interface",
      "Preserve meaningful history when policy or guidance changes",
    ],
    exercise: "Build a content register for one critical journey. Include owner, authoritative source, last review, next review, risk, translation impact, and related screens. Update the highest risk item and verify every place where it appears.",
    evidence: "Important content has a source and owner, and changes reach every relevant page, state, message, and channel.",
    readings: [
      { label: "GOV UK Content Design Role", href: "https://www.gov.uk/service-manual/the-team/content-designer" },
      { label: "GOV UK Good Service Design", href: "https://www.gov.uk/service-manual/design/introduction-designing-government-services" },
    ],
  },
  {
    id: "maint-designsystem",
    title: "Design system updates",
    icon: "Library",
    kicker: "Maintenance",
    lead: "Design system maintenance keeps shared foundations, components, guidance, and code dependable as product needs and platforms evolve.",
    why: "A system change can improve many screens or break all of them. Governance should therefore connect evidence, design assets, coded packages, documentation, testing, versioning, adoption, and deprecation. A component library without this lifecycle is only a collection.",
    workflow: [
      ["Propose", "Describe the user need, evidence, affected products, alternatives, risks, and migration cost."],
      ["Validate", "Test the change with real content, product contexts, accessibility, themes, and supported platforms."],
      ["Release", "Version design and code together with clear change notes and migration guidance."],
      ["Adopt", "Track usage, support teams, deprecate safely, and remove old paths only when migration is complete."],
    ],
    principles: [
      "Start with an evidenced product need",
      "Keep Figma properties and code interfaces aligned",
      "Treat breaking changes as migrations rather than announcements",
      "Test tokens and components in representative compositions",
      "Measure adoption, exceptions, defects, and accessibility regressions",
    ],
    exercise: "Change the primary button API and appearance in a small system. Write the proposal, affected instance list, accessibility checks, version decision, migration guide, release note, and retirement condition for the previous version.",
    evidence: "Teams can adopt the update without guessing, existing products remain stable, and design assets, code, and guidance describe the same behaviour.",
    readings: [
      { label: "Figma Variant Fundamentals", href: "https://help.figma.com/hc/en-us/articles/39636737843735-Components-collection-Variants-and-component-set-fundamentals" },
      { label: "GOV UK Community Principles", href: "https://design-system.service.gov.uk/community/community-principles/" },
    ],
  },
  {
    id: "maint-postlaunch",
    title: "Post launch improvements",
    icon: "Rocket",
    kicker: "Maintenance",
    lead: "Launch begins the period when real behaviour, performance, support, accessibility, and operational evidence can improve the product.",
    why: "Production exposes conditions a prototype cannot fully reproduce. Device variety, actual content, network quality, scale, assistive technology, and changing user needs reveal new risks. Improvement should be continuous, measured, and safe rather than a sequence of unconnected redesigns.",
    workflow: [
      ["Observe", "Monitor task outcomes, errors, performance, accessibility reports, support, and feedback."],
      ["Prioritise", "Balance severity, reach, confidence, effort, strategic value, and risk."],
      ["Improve", "Ship the smallest coherent change that can test the hypothesis safely."],
      ["Learn", "Compare the result with the baseline, document unintended effects, and choose the next action."],
    ],
    principles: [
      "Fix critical failures before adding new polish",
      "Use both field data and direct user research",
      "Protect accessibility and performance with release gates",
      "Keep rollback and monitoring ready for consequential changes",
      "Retire features that no longer justify their cost or complexity",
    ],
    exercise: "Create a thirty day improvement plan for a newly launched service. Define daily health checks, weekly evidence review, incident ownership, three hypotheses, success measures, guardrails, and a rollback rule for each change.",
    evidence: "The team can show a trace from production evidence to priority, change, measured result, and the next decision.",
    readings: [
      { label: "GOV UK Measuring Service Benefits", href: "https://www.gov.uk/service-manual/measuring-success/measuring-service-benefits" },
      { label: "Web Vitals", href: "https://web.dev/articles/vitals" },
    ],
  },
];

for (const lesson of practicalLessons) {
  pages[lesson.id] = practicalLesson(lesson);
}

// ---------------------------------------------------------------------------
// NAVIGATION — literal sidebar structure
// ---------------------------------------------------------------------------
export type Track = "web" | "app"; // retained for API compatibility; nav is static

const NAV_TREE: NavGroup[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: "Home",
    items: [
      { id: "overview", label: "HueLearn" },
      { id: "mod-website", label: "Website" },
      { id: "mod-app", label: "App" },
      { id: "ios-design", label: "iOS App" },
      { id: "android-design", label: "Android App" },
      { id: "design-principles", label: "Design Principles" },
    ],
  },
  {
    id: "core-lessons",
    label: "Core Lessons",
    icon: "BookMarked",
    items: [
      { id: "design-tokens", label: "Design Tokens" },
      { id: "purpose", label: "Purpose" },
      { id: "components", label: "Components" },
      { id: "variables", label: "Variables" },
    ],
  },
  {
    id: "basic-design",
    label: "Basic Design",
    icon: "Blocks",
    items: [
      { id: "mod-typography", label: "Typography" },
      { id: "bd-style", label: "Style" },
      { id: "bd-state", label: "State" },
      { id: "bd-spacing", label: "Spacing" },
      { id: "color-system", label: "Colour" },
      { id: "bd-components", label: "Components" },
      { id: "bd-interaction", label: "Interaction" },
    ],
  },
  {
    id: "framework",
    label: "Framework",
    icon: "ClipboardCheck",
    items: [
      { id: "assessment", label: "Test Assessment" },
      { id: "quality-gates", label: "Grading" },
    ],
  },
  {
    id: "website",
    label: "Website",
    icon: "Monitor",
    items: [
      { id: "web-users", label: "Users" },
      { id: "web-goals", label: "Goals" },
      { id: "web-usability", label: "Usability" },
      { id: "web-credibility", label: "Credibility" },
      { id: "web-journey", label: "Journey" },
      { id: "web-userflows", label: "User flows" },
      { id: "web-content", label: "Content" },
    ],
  },
  {
    id: "layout",
    label: "Layout",
    icon: "PanelsTopLeft",
    items: [
      { id: "layout-structure", label: "Structure" },
      { id: "layout-sections", label: "Sections" },
      { id: "layout-headers-footers", label: "Headers and footers" },
    ],
  },
  {
    id: "visual-design",
    label: "Visual Design",
    icon: "Brush",
    items: [
      { id: "vd-icon", label: "Icon" },
      { id: "vd-imagery", label: "Imagery" },
      { id: "vd-components", label: "Components" },
    ],
  },
  {
    id: "states",
    label: "States",
    icon: "ToggleLeft",
    items: [
      { id: "buttons", label: "Buttons" },
      { id: "states-links", label: "Links" },
      { id: "states-component", label: "Component" },
    ],
  },
  {
    id: "accessibility",
    label: "Accessibility",
    icon: "Accessibility",
    items: [
      { id: "a11y-keyboard", label: "Keyboard navigation" },
      { id: "a11y-focus", label: "Focus states" },
    ],
  },
  {
    id: "maintenance",
    label: "Maintenance & Improvement",
    icon: "Wrench",
    items: [
      { id: "maint-analytics", label: "Analytics review" },
      { id: "maint-feedback", label: "User feedback" },
      { id: "maint-bugs", label: "Bug fixes" },
      { id: "maint-content", label: "Content updates" },
      { id: "maint-designsystem", label: "Design system updates" },
      { id: "maint-postlaunch", label: "Post launch improvements" },
    ],
  },
];

export function navFor(_track?: Track): NavGroup[] {
  return NAV_TREE;
}

export function orderedFor(_track?: Track): string[] {
  return NAV_TREE.flatMap((g) => g.items.map((i) => i.id));
}

// Default exports for consumers that just need "everything".
export const nav = NAV_TREE;
export const orderedPageIds = orderedFor();
