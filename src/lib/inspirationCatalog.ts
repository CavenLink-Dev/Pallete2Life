// src/lib/inspirationCatalog.ts
// Powers the /examples Mobbin-style gallery.
// 95 real designs exported from template_page/ as WebP thumbnails.

import { createSwatch, type Swatch } from "./color"

export type InspirationCategory = "Website" | "App" | "Component"

export type CuratedPalette = {
  id: string
  name: string
  description: string
  colours: { hex: string; role: string }[]
}

export type InspirationItem = {
  id: string
  displayName: string
  category: InspirationCategory
  subcategory: string
  imagePath: string      // /templates/<id>.webp
  palette: CuratedPalette
}

// ── Subcategories per top-level category ─────────────────────────────────────
// Mirrors the project brief's page/component types so the top-nav dropdown
// has a stable, curated list rather than free-text derived from filenames.

export const SUBCATEGORIES: Record<InspirationCategory, string[]> = {
  Website: ["Landing", "SaaS", "E-commerce", "Sign-in", "Paywall", "Editorial"],
  App: ["Onboarding", "Profile", "Settings", "Product", "Empty & Error States", "Notifications"],
  Component: ["Cards", "Forms", "Navigation", "Typography", "Buttons & Pills", "Overlays"],
}

// ── 12 curated palettes ──────────────────────────────────────────────────────

const PALETTES: CuratedPalette[] = [
  {
    id: "ocean-saas",
    name: "Ocean SaaS",
    description: "Calm blues for productivity apps",
    colours: [
      { hex: "#f8fafc", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#2563eb", role: "Primary" },
      { hex: "#1e40af", role: "Heading" },
      { hex: "#334155", role: "Body" },
      { hex: "#e2e8f0", role: "Border" },
    ],
  },
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    description: "Earthy neutrals for content-first brands",
    colours: [
      { hex: "#fffbeb", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#d97706", role: "Primary" },
      { hex: "#92400e", role: "Heading" },
      { hex: "#44403c", role: "Body" },
      { hex: "#d6d3d1", role: "Border" },
    ],
  },
  {
    id: "mint-commerce",
    name: "Mint Commerce",
    description: "Fresh greens for e-commerce",
    colours: [
      { hex: "#f0fdf4", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#059669", role: "Primary" },
      { hex: "#064e3b", role: "Heading" },
      { hex: "#374151", role: "Body" },
      { hex: "#d1fae5", role: "Border" },
    ],
  },
  {
    id: "dark-dashboard",
    name: "Dark Dashboard",
    description: "High-contrast dark theme for data UIs",
    colours: [
      { hex: "#0f0f1a", role: "Background" },
      { hex: "#1e1e2e", role: "Surface" },
      { hex: "#6366f1", role: "Primary" },
      { hex: "#e2e8f0", role: "Heading" },
      { hex: "#94a3b8", role: "Body" },
      { hex: "#312e81", role: "Border" },
    ],
  },
  {
    id: "coral-wellness",
    name: "Coral Wellness",
    description: "Warm pinks for health and lifestyle",
    colours: [
      { hex: "#fff1f2", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#f43f5e", role: "Primary" },
      { hex: "#1c0a0e", role: "Heading" },
      { hex: "#4b5563", role: "Body" },
      { hex: "#ffe4e6", role: "Border" },
    ],
  },
  {
    id: "indigo-productivity",
    name: "Indigo Productivity",
    description: "Deep indigo for focus and utility apps",
    colours: [
      { hex: "#f5f3ff", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#4338ca", role: "Primary" },
      { hex: "#1e1b4b", role: "Heading" },
      { hex: "#374151", role: "Body" },
      { hex: "#e0e7ff", role: "Border" },
    ],
  },
  {
    id: "slate-neutral",
    name: "Slate Neutral",
    description: "Clean greys for developer tools",
    colours: [
      { hex: "#f8fafc", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#475569", role: "Primary" },
      { hex: "#0f172a", role: "Heading" },
      { hex: "#334155", role: "Body" },
      { hex: "#e2e8f0", role: "Border" },
    ],
  },
  {
    id: "sunset-gradient",
    name: "Sunset",
    description: "Vibrant oranges for creative platforms",
    colours: [
      { hex: "#fff7ed", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#ea580c", role: "Primary" },
      { hex: "#431407", role: "Heading" },
      { hex: "#44403c", role: "Body" },
      { hex: "#fed7aa", role: "Border" },
    ],
  },
  {
    id: "forest-ui",
    name: "Forest UI",
    description: "Deep greens for outdoors and nature brands",
    colours: [
      { hex: "#f0fdf4", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#166534", role: "Primary" },
      { hex: "#052e16", role: "Heading" },
      { hex: "#374151", role: "Body" },
      { hex: "#dcfce7", role: "Border" },
    ],
  },
  {
    id: "rose-editorial",
    name: "Rose Editorial",
    description: "Dusty rose for fashion and lifestyle",
    colours: [
      { hex: "#fdf2f8", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#be185d", role: "Primary" },
      { hex: "#500724", role: "Heading" },
      { hex: "#4b5563", role: "Body" },
      { hex: "#fce7f3", role: "Border" },
    ],
  },
  {
    id: "amber-finance",
    name: "Amber Finance",
    description: "Rich amber for fintech and banking",
    colours: [
      { hex: "#fffbeb", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#b45309", role: "Primary" },
      { hex: "#1c0a00", role: "Heading" },
      { hex: "#44403c", role: "Body" },
      { hex: "#fef3c7", role: "Border" },
    ],
  },
  {
    id: "violet-social",
    name: "Violet Social",
    description: "Bold violet for social and community apps",
    colours: [
      { hex: "#f5f3ff", role: "Background" },
      { hex: "#ffffff", role: "Surface" },
      { hex: "#7c3aed", role: "Primary" },
      { hex: "#2e1065", role: "Heading" },
      { hex: "#374151", role: "Body" },
      { hex: "#ede9fe", role: "Border" },
    ],
  },
]

const PALETTE_MAP = new Map(PALETTES.map(p => [p.id, p]))

// ── Palette assignment overrides ─────────────────────────────────────────────

const OVERRIDES: Record<string, string> = {
  app_professional_profile:        "dark-dashboard",
  app_stride:                      "dark-dashboard",
  website_maison_noire:            "dark-dashboard",
  "website-void-gallery":          "dark-dashboard",
  "website-aethon-orbital":        "dark-dashboard",
  "website-neural-arc":            "amber-finance",
  website_orbital:                 "amber-finance",
  app_artisan_product:             "amber-finance",
  "website-ando-collective":       "violet-social",
  "website-kinesis":               "violet-social",
  app_rootwell_onboarding:         "coral-wellness",
  app_bloom_onboarding:            "coral-wellness",
  app_pantry_run_01_welcome:       "mint-commerce",
  app_pantry_run_02_location:      "mint-commerce",
  app_pantry_run_03_address:       "mint-commerce",
  app_pantry_run_04_preferences:   "mint-commerce",
  app_pantry_run_05_notifications: "mint-commerce",
  app_pantry_run_06_first_shop:    "mint-commerce",
  app_cadence_01_welcome:          "indigo-productivity",
  app_cadence_02_goal:             "indigo-productivity",
  app_cadence_03_level:            "indigo-productivity",
  app_cadence_04_availability:     "indigo-productivity",
  app_cadence_05_permission:       "indigo-productivity",
  app_cadence_06_plan_ready:       "indigo-productivity",
  app_semaphore_01_welcome:        "slate-neutral",
  app_semaphore_02_how_it_works:   "slate-neutral",
  app_semaphore_03_create_key:     "slate-neutral",
  app_semaphore_04_recovery:       "slate-neutral",
  app_semaphore_05_notifications:  "slate-neutral",
  app_semaphore_06_verify:         "slate-neutral",
  app_semaphore_07_ready:          "slate-neutral",
  website_sonora:                  "warm-editorial",
  website_atelier:                 "warm-editorial",
  website_aska:                    "warm-editorial",
  "website-domaine-vaillant":      "warm-editorial",
  "website-lumiere-fest":          "rose-editorial",
  "website-terra-cloth":           "forest-ui",
  app_sneaker_product:             "slate-neutral",
  app_wavelength_onboarding_1:     "sunset-gradient",
  app_wavelength_onboarding_2:     "sunset-gradient",
  app_wavelength_onboarding_3:     "sunset-gradient",
}

function hashIndex(id: string, len: number): number {
  let h = 0
  for (const c of id) h = (((h << 5) - h) + c.charCodeAt(0)) | 0
  return Math.abs(h) % len
}

function paletteFor(id: string): CuratedPalette {
  const key = OVERRIDES[id]
  if (key) {
    const p = PALETTE_MAP.get(key)
    if (p) return p
  }
  return PALETTES[hashIndex(id, PALETTES.length)]
}

// ── Subcategory assignment ────────────────────────────────────────────────────
// Explicit per-stem mapping so subcategories are accurate rather than guessed.

const SUBCATEGORY_OVERRIDES: Record<string, string> = {
  // Website — Landing
  website_bramble_field: "Landing", website_cadence_landing: "Landing",
  website_halyard_landing: "Landing", website_kinetic: "Landing",
  website_kite_coral: "Landing", website_lexicon_landing: "Landing",
  website_rivulet_landing: "Landing", website_semaphore_landing: "Landing",
  website_signal_loop: "Landing", website_static_field: "Landing",
  website_studio_zero: "Landing", website_third_rail: "Landing",
  website_vellum: "Landing", "website-lumiere-fest": "Landing",
  // Website — SaaS
  website_meridian: "SaaS", website_northwater: "SaaS",
  website_orbital: "SaaS", "website-neural-arc": "SaaS",
  "website-aethon-orbital": "SaaS", website_foundry_health: "SaaS",
  // Website — E-commerce
  website_cinder_salt: "E-commerce", "website-terra-cloth": "E-commerce",
  "website-domaine-vaillant": "E-commerce", website_sonora: "E-commerce",
  // Website — Sign-in
  website_maison_noire: "Sign-in", "website-void-gallery": "Sign-in",
  // Website — Paywall
  "website-kinesis": "Paywall",
  // Website — Editorial
  website_aska: "Editorial", website_atelier: "Editorial",
  "website-ando-collective": "Editorial",

  // App — Onboarding
  app_bloom_onboarding: "Onboarding", app_rootwell_onboarding: "Onboarding",
  app_pantry_run_01_welcome: "Onboarding", app_pantry_run_02_location: "Onboarding",
  app_pantry_run_03_address: "Onboarding", app_pantry_run_04_preferences: "Onboarding",
  app_pantry_run_05_notifications: "Onboarding", app_pantry_run_06_first_shop: "Onboarding",
  app_cadence_01_welcome: "Onboarding", app_cadence_02_goal: "Onboarding",
  app_cadence_03_level: "Onboarding", app_cadence_04_availability: "Onboarding",
  app_cadence_05_permission: "Onboarding", app_cadence_06_plan_ready: "Onboarding",
  app_semaphore_01_welcome: "Onboarding", app_semaphore_02_how_it_works: "Onboarding",
  app_semaphore_03_create_key: "Onboarding", app_semaphore_04_recovery: "Onboarding",
  app_semaphore_05_notifications: "Onboarding", app_semaphore_06_verify: "Onboarding",
  app_semaphore_07_ready: "Onboarding", app_wavelength_onboarding_1: "Onboarding",
  app_wavelength_onboarding_2: "Onboarding", app_wavelength_onboarding_3: "Onboarding",
  // App — Profile
  app_professional_profile: "Profile", app_capsule: "Profile",
  // App — Settings
  app_settings_clean: "Settings", app_settings_premium: "Settings",
  // App — Product
  app_artisan_product: "Product", app_sneaker_product: "Product",
  app_search_experience: "Product", app_stride: "Product",
  // App — Empty & Error States
  app_empty_state: "Empty & Error States", app_error_state: "Empty & Error States",
  // App — Notifications
  app_notification_center: "Notifications",

  // Component — Cards
  component_card: "Cards", component_card_data_display: "Cards",
  component_checkout_card: "Cards", component_modal_card: "Cards",
  component_pricing_cards: "Cards", component_review_card: "Cards",
  component_stat_card_1: "Cards", component_stat_card_2: "Cards",
  component_stat_card_3: "Cards", component_stat_card_4: "Cards",
  component_tooltip_card: "Cards",
  // Component — Forms
  component_form_inputs: "Forms", component_progress_tracker: "Forms",
  // Component — Navigation
  component_bottom_bar: "Navigation", component_nav_pill: "Navigation",
  component_navigation_set: "Navigation", component_sidebar_drawer: "Navigation",
  component_top_tabs: "Navigation", component_contextual_toolbar: "Navigation",
  // Component — Typography
  component_activity_feed: "Typography", component_core_states: "Typography",
  component_confirmation_states: "Typography",
  // Component — Buttons & Pills
  component_bar_1: "Buttons & Pills", component_bar_2: "Buttons & Pills",
  component_bar_3: "Buttons & Pills", component_pill: "Buttons & Pills",
  // Component — Overlays
  component_modal: "Overlays", component_paywall: "Overlays",
  component_feedback_overlay: "Overlays", component_audio_player: "Overlays",
}

function subcategoryFor(id: string, category: InspirationCategory): string {
  return SUBCATEGORY_OVERRIDES[id] ?? SUBCATEGORIES[category][0]
}

// ── Display name generation ───────────────────────────────────────────────────

function cap(s: string): string {
  return s.replace(/\b([a-z])/g, c => c.toUpperCase())
}

function toDisplayName(stem: string): string {
  const s = stem.replace(/^(website|app|component)[_-]/, "")
  // "cadence_01_welcome" → "Cadence — Welcome"
  const m = s.match(/^([a-z][a-z_]*)_(\d+)_(.+)$/)
  if (m) return `${cap(m[1].replace(/_/g, " "))} — ${cap(m[3].replace(/[_-]/g, " "))}`
  return cap(s.replace(/[_-]/g, " "))
}

function categoryFor(stem: string): InspirationCategory {
  if (stem.startsWith("website")) return "Website"
  if (stem.startsWith("app")) return "App"
  return "Component"
}

// ── 95 template stems ─────────────────────────────────────────────────────────

const STEMS: string[] = [
  "app_artisan_product", "app_bloom_onboarding", "app_cadence_01_welcome",
  "app_cadence_02_goal", "app_cadence_03_level", "app_cadence_04_availability",
  "app_cadence_05_permission", "app_cadence_06_plan_ready", "app_capsule",
  "app_empty_state", "app_error_state", "app_notification_center",
  "app_pantry_run_01_welcome", "app_pantry_run_02_location", "app_pantry_run_03_address",
  "app_pantry_run_04_preferences", "app_pantry_run_05_notifications", "app_pantry_run_06_first_shop",
  "app_professional_profile", "app_rootwell_onboarding", "app_search_experience",
  "app_semaphore_01_welcome", "app_semaphore_02_how_it_works", "app_semaphore_03_create_key",
  "app_semaphore_04_recovery", "app_semaphore_05_notifications", "app_semaphore_06_verify",
  "app_semaphore_07_ready", "app_settings_clean", "app_settings_premium",
  "app_sneaker_product", "app_stride", "app_wavelength_onboarding_1",
  "app_wavelength_onboarding_2", "app_wavelength_onboarding_3",
  "component_activity_feed", "component_audio_player", "component_bar_1",
  "component_bar_2", "component_bar_3", "component_bottom_bar",
  "component_card", "component_card_data_display", "component_checkout_card",
  "component_confirmation_states", "component_contextual_toolbar", "component_core_states",
  "component_feedback_overlay", "component_form_inputs", "component_modal",
  "component_modal_card", "component_nav_pill", "component_navigation_set",
  "component_paywall", "component_pill", "component_pricing_cards",
  "component_progress_tracker", "component_review_card", "component_sidebar_drawer",
  "component_stat_card_1", "component_stat_card_2", "component_stat_card_3",
  "component_stat_card_4", "component_tooltip_card", "component_top_tabs",
  "website_aska", "website_atelier", "website_bramble_field", "website_cadence_landing",
  "website_cinder_salt", "website_foundry_health", "website_halyard_landing",
  "website_kinetic", "website_kite_coral", "website_lexicon_landing",
  "website_maison_noire", "website_meridian", "website_northwater",
  "website_orbital", "website_rivulet_landing", "website_semaphore_landing",
  "website_signal_loop", "website_sonora", "website_static_field",
  "website_studio_zero", "website_third_rail", "website_vellum",
  "website-aethon-orbital", "website-ando-collective", "website-domaine-vaillant",
  "website-kinesis", "website-lumiere-fest", "website-neural-arc",
  "website-terra-cloth", "website-void-gallery",
]

export const INSPIRATION_ITEMS: InspirationItem[] = STEMS.map(id => {
  const category = categoryFor(id)
  return {
    id,
    displayName: toDisplayName(id),
    category,
    subcategory: subcategoryFor(id, category),
    imagePath: `/templates/${id}.webp`,
    palette: paletteFor(id),
  }
})

export const inspirationItemById = new Map(INSPIRATION_ITEMS.map(i => [i.id, i]))

export function inspirationItemsByCategory(
  cat: InspirationCategory | "all",
): InspirationItem[] {
  return cat === "all" ? INSPIRATION_ITEMS : INSPIRATION_ITEMS.filter(i => i.category === cat)
}

/** Convert a curated palette to Swatch[] for writeHashPalette */
export function curatedPaletteAsSwatches(palette: CuratedPalette): Swatch[] {
  return palette.colours.map((c, i) => ({ ...createSwatch(c.hex, i, false), name: c.role }))
}
