## Learned User Preferences

- Prefer refining the existing workspace incrementally; do not redesign the whole page, remove functionality, or rebuild from scratch.
- Do not edit attached plan files when implementing plans.
- Template preview should remain the dominant screen element; side panels (palette, Customise) should be collapsible to maximize preview space.
- Keep HueSet as a lightweight style customizer, not a Figma-style editor with layers, freeform positioning, or vector editing.
- Prefer simpler UX with pruning and fewer overlapping flows over adding complexity or parallel surfaces.
- Do not show toast or popup notifications for routine palette actions such as Randomise.
- Leave the landing page (Home.tsx / Home.css) unchanged unless explicitly asked to modify it.
- When asked for feature explanations, plain paste-friendly text format is preferred over markdown-heavy layouts.

## Learned Workspace Facts

- Product is HueSet (npm package `pallet-preview`); the main design workspace is Builder at `/app`.
- Quick Design lives at `/quick-design`; `/live-changes` redirects there; primary landing CTA is "Generate Design".
- Entitlement model: first design is free to generate, edit, and preview; first export requires a $0.99 USD one-time payment; ongoing access requires HueSet Pro at $14.99 USD/month.
- The right-side workspace panel is labelled "Customise" (renamed from Inspector); payment and account UI are mock/Stripe-ready with no real backend yet.
- Figma Make project "Colour Palette Builder" is the design source of truth; parent scaffold docs live at `../AGENTS.md`.
