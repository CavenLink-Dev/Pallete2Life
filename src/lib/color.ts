export type Swatch = { id: string; name: string; hex: string; locked?: boolean; autoNamed?: boolean }
export type RoleBindings = Record<string, string>

/** Roles that may only be displayed on one swatch at a time. */
export const SINGLETON_ROLES = [
  "Page Background",
  "App Background",
  "Form Background",
  "Card Background",
  "Nav Background",
  "Secondary Background",
  "Brand Primary",
  "Primary",
  "Heading Text",
  "Heading",
  "Body Text",
  "Body",
  "Surface",
  "Border",
  "Input Border",
  "Card Border",
  "Divider",
  "Outline",
] as const

const SINGLETON_ROLE_KEYS = new Set(SINGLETON_ROLES.map((role) => role.trim().toLowerCase()))

export function isSingletonRole(role: string): boolean {
  return SINGLETON_ROLE_KEYS.has(role.trim().toLowerCase())
}

export const BRAND = {
  brand: "#20B9FA",
  brandLight: "#4BC6FB",
  brandDark: "#05A9F0",
  /** Darker fill for white text on primary CTAs. Passes WCAG 2.2 AA 4.5:1. */
  cta: "#0B6F9A",
  charcoal: "#0E1821",
  offwhite: "#F8F8F6",
  white: "#FFFFFF",
  softgrey: "#E7E9ED",
  medgrey: "#7A818B",
}

export const BRAND_CTA_ON_WHITE = "#0B6F9A"
export const BRAND_TEXT_ON_WHITE = "#0A6288"

let counter = 0
export const uid = () => `c${Date.now().toString(36)}${(counter++).toString(36)}`

export function normalizeHex(hex: string): string {
  let h = hex.trim().replace(/^#/, "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return "#000000"
  return "#" + h.toUpperCase()
}

export function hexToRgb(hex: string) {
  const h = normalizeHex(hex).slice(1)
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

export function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")
  return ("#" + c(r) + c(g) + c(b)).toUpperCase()
}

// Relative luminance (0 dark – 1 light)
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const lin = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

// Best readable text color (near-black or near-white) on a background
export function readableOn(hex: string): string {
  return luminance(hex) > 0.42 ? "#0E1821" : "#FFFFFF"
}

// Mix a hex toward black (amt<0) or white (amt>0), amt in [-1,1]
export function shade(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex)
  const target = amt < 0 ? 0 : 255
  const t = Math.abs(amt)
  return rgbToHex(r + (target - r) * t, g + (target - g) * t, b + (target - b) * t)
}

export function withAlpha(hex: string, a: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

export function aaCheck(fg: string, bg: string): { ratio: number; aa: boolean; aaLarge: boolean } {
  const r = contrastRatio(fg, bg)
  return { ratio: Math.round(r * 100) / 100, aa: r >= 4.5, aaLarge: r >= 3 }
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function rgbString(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  return `${r}, ${g}, ${b}`
}

export function hslString(hex: string): string {
  const { h, s, l } = hexToHsl(hex)
  return `${h}°, ${s}%, ${l}%`
}

export function createSwatch(hex: string, index = 0, autoNamed = true): Swatch {
  const normalized = normalizeHex(hex)
  const name = autoNamed !== false ? colorName(normalized) : `Colour ${index + 1}`
  return {
    id: uid(),
    hex: normalized,
    name,
    ...(autoNamed === false ? { autoNamed: false } : {}),
  }
}

export function updateSwatchHex(swatch: Swatch, newHex: string): Swatch {
  const hex = normalizeHex(newHex)
  if (swatch.autoNamed === false) return { ...swatch, hex }
  return { ...swatch, hex, name: colorName(hex) }
}

export function refreshPaletteAutoNames(palette: Swatch[]): Swatch[] {
  const usedNames = new Set<string>()

  return palette.map((swatch, index) => {
    if (swatch.autoNamed === false) {
      const name = swatch.name.trim() || `Colour ${index + 1}`
      usedNames.add(name.toLowerCase())
      return name === swatch.name ? swatch : { ...swatch, name }
    }

    const base = colorName(swatch.hex)
    let name = base
    let suffix = 2
    while (usedNames.has(name.toLowerCase())) {
      name = `${base} ${suffix}`
      suffix += 1
    }

    usedNames.add(name.toLowerCase())
    return swatch.name === name ? swatch : { ...swatch, name }
  })
}

export function applyRoleChange(
  role: string,
  swatchId: string,
  roleBindings: RoleBindings,
  unassignedRoleSwatchIds: readonly string[],
  roleLabels: readonly string[],
): { roleBindings: RoleBindings; unassignedRoleSwatchIds: string[] } {
  void roleLabels

  let nextUnassigned = [...unassignedRoleSwatchIds]
  if (role) {
    nextUnassigned = nextUnassigned.filter((id) => id !== swatchId)
  } else if (!nextUnassigned.includes(swatchId)) {
    nextUnassigned = [...nextUnassigned, swatchId]
  }

  const nextBindings = { ...roleBindings }
  for (const [key, id] of Object.entries(nextBindings)) {
    if (id === swatchId) delete nextBindings[key]
  }

  if (role) {
    nextBindings[role] = swatchId
  }

  return { roleBindings: nextBindings, unassignedRoleSwatchIds: nextUnassigned }
}

export function resolveSwatchRole(
  swatchId: string,
  palette: Swatch[],
  roleBindings: RoleBindings,
  unassignedRoleSwatchIds: readonly string[],
  defaultRoleByIndex: readonly string[],
): string {
  const bound = Object.entries(roleBindings).find(([, id]) => id === swatchId)
  if (bound) return bound[0]
  if (unassignedRoleSwatchIds.includes(swatchId)) return ""

  const index = palette.findIndex((swatch) => swatch.id === swatchId)
  if (index < 0 || index >= defaultRoleByIndex.length) return ""

  const fallbackRole = defaultRoleByIndex[index]
  if (!fallbackRole) return ""

  if (isSingletonRole(fallbackRole)) {
    const holder = roleBindings[fallbackRole]
    if (holder && holder !== swatchId) return ""
  }

  return fallbackRole
}

export function pruneBindingsForSwatch(
  swatchId: string,
  roleBindings: RoleBindings,
  unassignedRoleSwatchIds: readonly string[],
): { roleBindings: RoleBindings; unassignedRoleSwatchIds: string[] } {
  const nextBindings = { ...roleBindings }
  for (const [key, id] of Object.entries(nextBindings)) {
    if (id === swatchId) delete nextBindings[key]
  }
  return {
    roleBindings: nextBindings,
    unassignedRoleSwatchIds: unassignedRoleSwatchIds.filter((id) => id !== swatchId),
  }
}

export function colorName(hex: string): string {
  const { h, s, l } = hexToHsl(hex)

  if (s < 10) {
    if (l < 16) return "Near Black"
    if (l < 34) return "Charcoal Grey"
    if (l < 58) return "Stone Grey"
    if (l < 82) return "Silver Grey"
    return "Soft White"
  }

  const tone = l < 24 ? "Deep" : l < 40 ? "Dark" : l > 82 ? "Pale" : l > 68 ? "Soft" : ""
  const family =
    h < 12 || h >= 348 ? "Red" :
    h < 38 ? "Coral" :
    h < 62 ? "Gold" :
    h < 82 ? "Lime" :
    h < 150 ? "Green" :
    h < 178 ? "Mint" :
    h < 202 ? "Teal" :
    h < 224 ? "Sky Blue" :
    h < 252 ? "Blue" :
    h < 278 ? "Indigo" :
    h < 305 ? "Violet" :
    h < 330 ? "Magenta" :
    "Rose"

  return `${tone} ${family}`.trim()
}

export function randomHex(): string {
  // Pleasant, saturated-but-not-neon random colors
  const h = Math.random() * 360
  const s = 45 + Math.random() * 40
  const l = 32 + Math.random() * 42
  return hslToHex(h, s, l)
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255)
}

// Map palette values by their design role. Never reorder semantic tokens by
// brightness: a user-selected background must remain the background.
const roleKey = (role: string) => role.trim().toLowerCase()

export function deriveTheme(
  palette: Swatch[],
  roleLabels?: (string | null)[],
  roleBindings: RoleBindings = {},
) {
  const entries = palette.map((swatch, index) => ({
    id: swatch.id,
    hex: swatch.hex,
    role: roleKey(roleLabels?.[index] ?? ""),
  }))
  const bindings = Object.fromEntries(Object.entries(roleBindings).map(([role, id]) => [roleKey(role), id]))
  const hasRoles = entries.some((entry) => entry.role) || Object.keys(bindings).length > 0
  const at = (index: number, fallback: string) => entries[index]?.hex ?? fallback
  const byRole = (...roles: string[]) => {
    for (const role of roles) {
      const boundId = bindings[roleKey(role)]
      const bound = boundId ? entries.find((entry) => entry.id === boundId) : undefined
      if (bound) return bound.hex
    }
    const keys = roles.map(roleKey)
    return entries.find((entry) => keys.includes(entry.role))?.hex
  }

  const paper = byRole("page background", "app background", "form background", "card background", "nav background", "canvas background", "chart background", "background")
    ?? at(0, BRAND.white)
  const surfaceFallback = shade(paper, luminance(paper) > 0.5 ? -0.04 : 0.06)
  const surface = byRole("secondary background", "input fill", "surface", "card")
    ?? (hasRoles ? surfaceFallback : at(1, surfaceFallback))
  const secondary = byRole("secondary", "secondary series", "success accent", "secondary accent") ?? surface
  const tertiary = byRole("tertiary", "tertiary accent") ?? secondary
  const accent = byRole("brand primary", "primary", "sale accent", "chart accent", "primary button", "primary series", "warning accent", "active", "accent")
    ?? (hasRoles ? BRAND.brand : at(2, BRAND.brand))
  const ink = byRole("heading text", "heading", "nav text", "label text")
    ?? (hasRoles ? readableOn(paper) : at(3, readableOn(paper)))
  const body = byRole("body text", "body", "muted text", "caption")
    ?? (hasRoles ? ink : at(4, ink))
  const border = byRole("input border", "card border", "grid lines", "error accent", "border", "divider", "outline")
    ?? withAlpha(ink, 0.12)

  return {
    brand: accent,
    accent,
    secondary,
    tertiary,
    ink,
    inkSoft: body,
    inkFaint: withAlpha(body, 0.1),
    paper,
    surface,
    border,
    onBrand: readableOn(accent),
    onInk: readableOn(ink),
  }
}

export type Theme = ReturnType<typeof deriveTheme>

export type ContrastIssue = {
  foreground: "Heading text" | "Body text"
  background: "Page background" | "Surface"
  ratio: number
}

export function themeContrastIssues(theme: Theme, minimum = 4.5): ContrastIssue[] {
  const pairs = [
    ["Heading text", theme.ink, "Page background", theme.paper],
    ["Heading text", theme.ink, "Surface", theme.surface],
    ["Body text", theme.inkSoft, "Page background", theme.paper],
    ["Body text", theme.inkSoft, "Surface", theme.surface],
  ] as const

  return pairs.flatMap(([foreground, foregroundHex, background, backgroundHex]) => {
    const ratio = contrastRatio(foregroundHex, backgroundHex)
    return ratio < minimum ? [{ foreground, background, ratio: Math.round(ratio * 100) / 100 }] : []
  })
}
