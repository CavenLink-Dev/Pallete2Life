# Better Interface — Apple-Docs-style redesign (HueSet)

## Context

The current `/better-interface` experience (`src/App.tsx`) is a single dark-themed HueSet
course page centered on one lesson with a collapsible-module sidebar. The user wants to
re-architect it to feel like **Apple Developer Documentation / Design Get Started** — strong
documentation-style information architecture, calm content-first reading, clear navigation
across a large topic library — while keeping HueSet's own brand (dark charcoal base, baby-blue
accent, white text, existing logo/icon assets).

The redesign turns the page from "one lesson" into a small **multi-view documentation product**:
a Topics/Overview index → an individual Lesson → a Resource Library, all switchable in-app,
wrapped in a persistent doc-style shell (left topic nav, top search, right on-page TOC).

Confirmed scope decisions:
- **Full multi-view**: Overview index + Visual Hierarchy lesson + Resource Library, switchable in-app.
- **Search is visual-only**: styled search field/affordance that looks the part, not wired to real filtering.

## Design direction (from Apple reference, applied to HueSet)

- Documentation IA: grouped categories in a persistent left rail (Getting Started, Foundations,
  Patterns, Components, Website Design, App Design, Design Systems).
- Content-first, calm: generous whitespace, typography + dividers to organize — **not** everything
  wrapped in cards. Alternate rhythm of prose and example clusters.
- Restrained hero on Overview: typographic headline + one supporting line, then grouped category
  cards (Apple "Foundations/Patterns/Components" icon-card grid), then a "Continue where you left
  off" row and a compact resource teaser.
- Keep HueSet visual system from `src/index.css` (dark charcoal, `--color-accent` baby blue).
  Do NOT introduce Apple branding or SF-style chrome.

## Architecture

Keep it a single client-side app with **state-driven view switching** (no react-router needed).
Split the current monolithic `App.tsx` into a small, readable structure:

- `src/course/data.ts` — single source of truth: category groups + lessons (id, title, group,
  status), resource-library items grouped by type, and lesson content for Visual Hierarchy.
  Reuse the existing `course`/lesson shape already in `App.tsx` as the starting point.
- `src/components/DocShell.tsx` — the persistent frame: HueSet logo (uses
  `src/imports/Clip_path_group_2x.png`), top bar with **visual-only** search field + local subnav
  (Overview · Lessons · Resources), persistent left topic nav (grouped, current-lesson highlighted,
  completed checks, progress summary), mobile drawer. Accepts `view`/`onNavigate` props.
- `src/views/Overview.tsx` — restrained hero + grouped category cards + "continue learning" +
  resource teaser. Cards navigate into lessons/library.
- `src/views/Lesson.tsx` — documentation-style Visual Hierarchy lesson (structured, referenceable):
  Overview → Principles → Interactive demo (emphasis slider) → Bad vs Better toggle → Common
  mistakes → Rules of thumb → Exercise → Related topics → Prev/Next. Right-hand **on-page TOC**
  (anchor list, sticky) on desktop. Reuse the existing `SampleCard`, emphasis-slider, bad/better
  toggle, and exercise logic already built in `App.tsx`.
- `src/views/Library.tsx` — Resource Library grouped by type (Website patterns, App patterns,
  Navigation examples, Button/Form/Layout examples, Figma exercises, Checklists), Apple-style
  grouped sections rather than one giant gallery.
- `src/App.tsx` — thin orchestrator: holds `view` state (`"overview" | "lesson" | "library"`),
  shared progress/completion state, renders `DocShell` + active view.

Shared UI atoms (Check, Chevron, Logo) currently inline in `App.tsx` move into a small
`src/components/ui.tsx` and are reused across views to avoid duplication.

## Key files

- Modify: `src/App.tsx` (reduce to orchestrator), `src/index.css` (add on-page-TOC / anchor-scroll
  polish, `scroll-margin-top` for headings, any tokens needed — preserve existing HueSet tokens).
- Add: `src/course/data.ts`, `src/components/DocShell.tsx`, `src/components/ui.tsx`,
  `src/views/Overview.tsx`, `src/views/Lesson.tsx`, `src/views/Library.tsx`.
- Reuse assets: `src/imports/Clip_path_group_2x.png` (icon), wordmark rendered as text
  (`Hue` white + `Set` accent) as already done.

## Behavior / interactions

- View switching via local subnav, sidebar lessons, overview cards, and prev/next — preserves
  progress/completion state across views (lifted into `App.tsx`).
- Left nav: grouped categories, current lesson highlighted (`aria-current`), completed lessons
  show accent check, overall progress bar + "N of M lessons".
- Right on-page TOC: anchors to lesson sections with smooth scroll + `scroll-margin-top`.
- Search: styled ⌘K-style field with placeholder + a static suggestions popover of popular topics
  that navigate (visual/affordance only — no live text filtering).
- Lesson keeps working: emphasis slider, Poor/Better toggle, exercise with correct/wrong + retry,
  Mark complete.
- Mobile: left nav collapses to a drawer; lesson stays highly readable; TOC hidden.

## Accessibility

Preserve current floor: AA contrast, ~680–720px reading measure, visible accent focus rings
(already in `index.css`), `aria-current`/`aria-expanded`, reduced-motion guard, ≥18px targets.

## Verification

- `npx tsc --noEmit` passes (type-check the new multi-file structure + png import).
- Manual: dev server already running on `$PORT`; load `/` and confirm:
  1. Overview renders with grouped categories; clicking a category/lesson opens the lesson.
  2. Left nav shows groups, highlights current lesson, shows progress; navigating updates the view.
  3. Lesson shows all documentation sections; emphasis slider, Poor/Better toggle, and exercise work;
     right TOC anchors scroll to sections.
  4. Resources view shows grouped resource sections.
  5. Mark complete updates progress and persists when switching views.
  6. Search field opens its suggestions popover (visual only).
  7. Resize below ~1000px: sidebar becomes a drawer, TOC hides, content stays readable.
```
