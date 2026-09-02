## Learned User Preferences

- Prefer refining the existing workspace incrementally; do not redesign the whole page, remove functionality, or rebuild from scratch.
- Do not edit attached plan files when implementing plans.
- Template preview should remain the dominant screen element; side panels (palette, Customise) should be collapsible to maximize preview space. Customise must stay a non-blocking side panel with no canvas backdrop, and clicking outside must not discard the selection.
- Keep HueSet as a lightweight style customizer, not a Figma-style editor with layers, freeform positioning, or vector editing.
- Prefer simpler UX with pruning and fewer overlapping flows over adding complexity or parallel surfaces.
- Do not show toast or popup notifications for routine palette actions such as Randomise.
- Leave the landing page (Home.tsx / Home.css) unchanged unless explicitly asked to modify it.
- When asked for feature explanations, plain paste-friendly text format is preferred over markdown-heavy layouts.
- Treat Quick Design as the primary, reliability-standard path until Full Design System is equally reliable; polish it without extra onboarding screens or denser UI.
- Preserve manually entered colour names; regenerate only system-generated names when their colours change.
- Applying a template must be explicit (Apply/Cancel); browsing or filtering templates must not replace the current design.
- Align public copy with shipped behaviour; do not invent legal entities, branded contact emails, or claim WCAG AA unless the rendered UI actually passes.

## Learned Workspace Facts

- Product is HueSet (npm package `pallet-preview`); the main design workspace is Builder at `/app`; `/preview` and `/builder` redirect there.
- Quick Design lives at `/quick-design`; `/live-changes` redirects there; primary landing CTA is "Generate Design"; Full Design System setup is `/generate`.
- Entitlement model: first design is free to generate, edit, and preview; Brand Assets and Full Screen stay free; first export is $0.99 USD one-time; HueSet Pro is $14.99 USD/month. Payments are gated by `VITE_PAYMENTS_ENABLED` (default off); when disabled, purchase CTAs show Early Access / Notify Me instead of checkout.
- The right-side workspace panel is labelled "Customise" (renamed from Inspector); payment and account UI are mock/Stripe-ready with no real backend yet.
- Figma Make project "Colour Palette Builder" is the design source of truth; parent scaffold docs live at `../AGENTS.md`.
- Public routes include `/`, `/generate`, `/app`, `/quick-design`, `/help`, `/pricing`, `/contact`, `/privacy`, and `/terms`; unknown routes render a branded 404 with Return Home, Open Quick Design, and Start a New Design.
- Versioned project state persists in localStorage; shared palette URL hashes must not erase richer local project state.
- Singleton semantic roles such as Page Background allow one assignment; multi-value roles such as accents may have several.
- Brand primary / CTA color is `#13A8E7` (`BRAND.cta`); keep it on landing and primary buttons unless explicitly asked to change it.
