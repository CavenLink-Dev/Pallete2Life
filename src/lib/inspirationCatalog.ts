import { createSwatch, type Swatch } from "./color"
import { templateAssets, type TemplateAsset, type TemplateCategory } from "./templateAssets"

/**
 * A curated colour palette (hex + role names, in the same order the app's
 * `deriveTheme` expects — Background, Surface, Primary, Heading, Body, Border)
 * paired with an existing catalog template so the inspiration gallery can show
 * a real, styled layout rather than a blank grey shell.
 *
 * Palettes are intentionally reused across a handful of templates within the
 * same category (the way Mobbin-style galleries repeat a small set of proven
 * colour stories across many shots) rather than hand-authoring 35 one-off sets.
 */
export type CuratedPalette = {
  id: string
  name: string
  description: string
  colours: { hex: string; role: string }[]
}

export const CURATED_PALETTES: CuratedPalette[] = [
  {
    id: "ocean-saas",
    name: "Ocean SaaS",
    description: "A calm, professional palette for software dashboards and B2B landing pages.",
    colours: [
      { hex: "#F7F9FC", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#0B7BAA", role: "Primary" },
      { hex: "#1A2332", role: "Heading" },
      { hex: "#5A6978", role: "Body" },
      { hex: "#E2E8F0", role: "Border" },
    ],
  },
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    description: "Rich, warm tones for content-heavy sites, blogs, and magazine layouts.",
    colours: [
      { hex: "#FDF8F3", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#C4572A", role: "Primary" },
      { hex: "#2C1810", role: "Heading" },
      { hex: "#6B5244", role: "Body" },
      { hex: "#E8DDD4", role: "Border" },
    ],
  },
  {
    id: "mint-commerce",
    name: "Mint Commerce",
    description: "Fresh, trustworthy colours for e-commerce product pages and checkout flows.",
    colours: [
      { hex: "#F4FAF7", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#0D8A5E", role: "Primary" },
      { hex: "#1B2E28", role: "Heading" },
      { hex: "#4A6B5F", role: "Body" },
      { hex: "#D4E5DD", role: "Border" },
    ],
  },
  {
    id: "dark-dashboard",
    name: "Dark Dashboard",
    description: "A dark theme for analytics dashboards, dev tools, and monitoring interfaces.",
    colours: [
      { hex: "#0F1419", role: "Background" },
      { hex: "#1A2332", role: "Surface" },
      { hex: "#3B9EDB", role: "Primary" },
      { hex: "#E8EDF2", role: "Heading" },
      { hex: "#8899AA", role: "Body" },
      { hex: "#2A3544", role: "Border" },
    ],
  },
  {
    id: "coral-wellness",
    name: "Coral Wellness",
    description: "Soft, inviting colours for health apps, fitness trackers, and wellbeing platforms.",
    colours: [
      { hex: "#FFF5F3", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#E06B52", role: "Primary" },
      { hex: "#2D1F1A", role: "Heading" },
      { hex: "#7A5E55", role: "Body" },
      { hex: "#F0DDD8", role: "Border" },
    ],
  },
  {
    id: "indigo-productivity",
    name: "Indigo Productivity",
    description: "Focused, distraction-free colours for task managers, notes, and productivity tools.",
    colours: [
      { hex: "#F5F3FF", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#5B4FC7", role: "Primary" },
      { hex: "#1E1935", role: "Heading" },
      { hex: "#5C5680", role: "Body" },
      { hex: "#DDD8F0", role: "Border" },
    ],
  },
  {
    id: "slate-neutral",
    name: "Slate Neutral",
    description: "A versatile neutral set for buttons, forms, cards, and navigation components.",
    colours: [
      { hex: "#F8FAFC", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#334155", role: "Primary" },
      { hex: "#0F172A", role: "Heading" },
      { hex: "#64748B", role: "Body" },
      { hex: "#E2E8F0", role: "Border" },
    ],
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    description: "Bold, expressive colours for creative portfolios, landing heroes, and marketing components.",
    colours: [
      { hex: "#FFFAF5", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#E25822", role: "Primary" },
      { hex: "#1C0F05", role: "Heading" },
      { hex: "#7A5438", role: "Body" },
      { hex: "#F0D9C8", role: "Border" },
    ],
  },
  {
    id: "forest-ui",
    name: "Forest UI",
    description: "Earthy greens and warm greys for nature-inspired interfaces and environmental dashboards.",
    colours: [
      { hex: "#F5F7F4", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#3A7D44", role: "Primary" },
      { hex: "#1A2E1C", role: "Heading" },
      { hex: "#5A7060", role: "Body" },
      { hex: "#D5E0D7", role: "Border" },
    ],
  },
  {
    id: "rose-editorial",
    name: "Rose Studio",
    description: "Elegant, gallery-adjacent tones for portfolios, boutique brands, and photography sites.",
    colours: [
      { hex: "#FBF5F5", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#A8384F", role: "Primary" },
      { hex: "#241417", role: "Heading" },
      { hex: "#6B4F53", role: "Body" },
      { hex: "#EAD9DB", role: "Border" },
    ],
  },
  {
    id: "amber-finance",
    name: "Amber Finance",
    description: "Confident, high-contrast tones for finance dashboards and banking apps.",
    colours: [
      { hex: "#FFFBF2", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#B8720A", role: "Primary" },
      { hex: "#1F1710", role: "Heading" },
      { hex: "#6B5B45", role: "Body" },
      { hex: "#EDE0C8", role: "Border" },
    ],
  },
  {
    id: "violet-social",
    name: "Violet Social",
    description: "Playful, high-energy colours for social apps, community feeds, and messaging.",
    colours: [
      { hex: "#FAF5FF", role: "Background" },
      { hex: "#FFFFFF", role: "Surface" },
      { hex: "#8B3FD9", role: "Primary" },
      { hex: "#231032", role: "Heading" },
      { hex: "#6B5980", role: "Body" },
      { hex: "#E5D5F5", role: "Border" },
    ],
  },
]

const palettesById = new Map(CURATED_PALETTES.map((palette) => [palette.id, palette]))

/** Deterministic pick — same template id always gets the same curated palette. */
function paletteIndexFor(seed: string, length: number): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return hash % length
}

/** A hand-picked palette assignment for templates that deserve a specific look. */
const PALETTE_OVERRIDES: Record<string, string> = {
  "builtin-website-dashboard-minimal": "dark-dashboard",
  "builtin-website-dashboard-data-focused": "dark-dashboard",
  "builtin-application-dashboard-minimal": "dark-dashboard",
  "builtin-application-dashboard-data-focused": "dark-dashboard",
  "builtin-application-finance-minimal": "amber-finance",
  "builtin-application-finance-data-focused": "amber-finance",
  "builtin-application-fitness-activity": "coral-wellness",
  "builtin-application-fitness-progress": "coral-wellness",
  "builtin-application-social-feed": "violet-social",
  "builtin-application-social-profile": "violet-social",
  "builtin-application-messaging-chat": "violet-social",
  "builtin-application-messaging-conversation": "violet-social",
  "builtin-application-task-manager-list": "indigo-productivity",
  "builtin-application-task-manager-kanban": "indigo-productivity",
  "builtin-website-portfolio-minimal": "rose-editorial",
  "builtin-website-portfolio-editorial": "rose-editorial",
  "builtin-website-blog-editorial": "warm-editorial",
  "builtin-website-blog-minimal": "warm-editorial",
  "builtin-website-ecommerce-minimal": "mint-commerce",
  "builtin-website-ecommerce-premium": "mint-commerce",
}

export function curatedPaletteForTemplate(asset: TemplateAsset): CuratedPalette {
  const overrideId = PALETTE_OVERRIDES[asset.id]
  if (overrideId) {
    const overridden = palettesById.get(overrideId)
    if (overridden) return overridden
  }
  const index = paletteIndexFor(asset.id, CURATED_PALETTES.length)
  return CURATED_PALETTES[index]
}

export function curatedPaletteAsSwatches(palette: CuratedPalette): Swatch[] {
  return palette.colours.map((c) => ({ ...createSwatch(c.hex, 0, false), name: c.role }))
}

/** One browsable inspiration entry: a real catalog template + a curated palette. */
export type InspirationItem = {
  id: string
  template: TemplateAsset
  palette: CuratedPalette
  category: TemplateCategory
}

export const INSPIRATION_ITEMS: InspirationItem[] = templateAssets
  .filter((asset) => asset.collection === "Built-In")
  .map((asset) => ({
    id: asset.id,
    template: asset,
    palette: curatedPaletteForTemplate(asset),
    category: asset.category,
  }))

export const inspirationItemById = new Map(INSPIRATION_ITEMS.map((item) => [item.id, item]))

export function inspirationItemsByCategory(category: TemplateCategory | "all"): InspirationItem[] {
  if (category === "all") return INSPIRATION_ITEMS
  return INSPIRATION_ITEMS.filter((item) => item.category === category)
}
