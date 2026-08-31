import type { Theme, Swatch } from "./color"
import type { ElementTokenValues } from "./designTokens"

export type SemanticColourKey =
  | "background"
  | "surface"
  | "surfaceElevated"
  | "textPrimary"
  | "textSecondary"
  | "textMuted"
  | "brandPrimary"
  | "brandSecondary"
  | "accent"
  | "border"
  | "focus"
  | "success"
  | "warning"
  | "error"
  | "info"

export type ButtonMainTokens = {
  radius: string
  height: string
  paddingInline: string
  gap: string
  background: SemanticColourKey
  text: SemanticColourKey | "textInverse"
  border: string
}

export type DesignTokenSystem = {
  version: 1
  primitive: {
    spacing: Record<string, number>
    gaps: Record<string, number>
    radius: Record<string, number>
    typography: Record<string, string>
    fontSize: Record<string, number>
    fontWeight: Record<string, number>
    lineHeight: Record<string, number>
    borders: Record<string, number>
    shadows: Record<string, string>
    opacity: Record<string, number>
    sizing: Record<string, number>
    iconSize: Record<string, number>
  }
  semantic: {
    colours: Record<SemanticColourKey, string>
    spacing: { control: string; section: string }
    typography: { body: string; label: string; heading: string }
  }
  component: {
    buttonMain: ButtonMainTokens
    cardDefault: {
      background: SemanticColourKey
      radius: string
      padding: string
      gap: string
      border: string
      shadow: string
    }
  }
  state: {
    focusRing: { colour: SemanticColourKey; width: number; offset: number }
    disabledOpacity: number
    hoverOpacity: number
    motionDuration: { fast: number; normal: number; slow: number }
    motionEasing: { standard: string; enter: string; exit: string }
  }
}

export const SEMANTIC_COLOUR_META: { key: SemanticColourKey; label: string; internal: string }[] = [
  { key: "background", label: "Background", internal: "colour.background" },
  { key: "surface", label: "Surface", internal: "colour.surface" },
  { key: "surfaceElevated", label: "Elevated surface", internal: "colour.surface.elevated" },
  { key: "textPrimary", label: "Primary text", internal: "colour.text.primary" },
  { key: "textSecondary", label: "Secondary text", internal: "colour.text.secondary" },
  { key: "textMuted", label: "Muted text", internal: "colour.text.muted" },
  { key: "brandPrimary", label: "Brand primary", internal: "colour.brand.primary" },
  { key: "brandSecondary", label: "Brand secondary", internal: "colour.brand.secondary" },
  { key: "accent", label: "Accent", internal: "colour.accent" },
  { key: "border", label: "Border", internal: "colour.border" },
  { key: "focus", label: "Focus", internal: "colour.focus" },
  { key: "success", label: "Success", internal: "colour.feedback.success" },
  { key: "warning", label: "Warning", internal: "colour.feedback.warning" },
  { key: "error", label: "Error", internal: "colour.feedback.error" },
  { key: "info", label: "Info", internal: "colour.feedback.info" },
]

const paletteId = (palette: Swatch[], index: number) => palette[index]?.id ?? palette[0]?.id ?? ""

export function createTokenSystem(palette: Swatch[]): DesignTokenSystem {
  return {
    version: 1,
    primitive: {
      spacing: { "spacing.1": 4, "spacing.2": 8, "spacing.3": 12, "spacing.4": 16, "spacing.6": 24, "spacing.8": 32 },
      gaps: { "gap.xs": 4, "gap.sm": 8, "gap.md": 12, "gap.lg": 16, "gap.xl": 24 },
      radius: { "radius.none": 0, "radius.sm": 4, "radius.md": 8, "radius.lg": 12, "radius.full": 999 },
      typography: { "typography.body": "var(--font-sans)", "typography.label": "var(--font-sans)", "typography.heading": "var(--font-display)", "typography.display": "var(--font-display)" },
      fontSize: { "font.size.sm": 12, "font.size.md": 15, "font.size.lg": 20, "font.size.xl": 30, "font.size.display": 52 },
      fontWeight: { "font.weight.regular": 400, "font.weight.medium": 500, "font.weight.semibold": 600, "font.weight.bold": 700 },
      lineHeight: { "line.height.tight": 1.15, "line.height.normal": 1.5, "line.height.relaxed": 1.75 },
      borders: { "border.none": 0, "border.subtle": 1, "border.strong": 2 },
      shadows: { "shadow.none": "none", "shadow.sm": "0 4px 12px rgba(14,24,33,0.08)", "shadow.md": "0 10px 28px rgba(14,24,33,0.12)", "shadow.lg": "0 18px 44px rgba(14,24,33,0.16)" },
      opacity: { "opacity.disabled": 0.45, "opacity.muted": 0.64, "opacity.overlay": 0.82 },
      sizing: { "size.control.sm": 36, "size.control.md": 44, "size.control.lg": 52, "size.touch.minimum": 44 },
      iconSize: { "size.icon.sm": 14, "size.icon.md": 18, "size.icon.lg": 24 },
    },
    semantic: {
      colours: {
        background: paletteId(palette, 0),
        surface: paletteId(palette, 1),
        surfaceElevated: paletteId(palette, 1),
        textPrimary: paletteId(palette, 3),
        textSecondary: paletteId(palette, 4),
        textMuted: paletteId(palette, 4),
        brandPrimary: paletteId(palette, 2),
        brandSecondary: paletteId(palette, 1),
        accent: paletteId(palette, 2),
        border: paletteId(palette, 4),
        focus: paletteId(palette, 2),
        success: paletteId(palette, 2),
        warning: paletteId(palette, Math.min(1, palette.length - 1)),
        error: paletteId(palette, Math.min(2, palette.length - 1)),
        info: paletteId(palette, 2),
      },
      spacing: { control: "spacing.3", section: "spacing.8" },
      typography: { body: "typography.body", label: "typography.label", heading: "typography.heading" },
    },
    component: {
      buttonMain: {
        radius: "radius.md",
        height: "size.control.md",
        paddingInline: "spacing.4",
        gap: "gap.sm",
        background: "brandPrimary",
        text: "textInverse",
        border: "border.none",
      },
      cardDefault: {
        background: "surface",
        radius: "radius.lg",
        padding: "spacing.4",
        gap: "gap.md",
        border: "border.subtle",
        shadow: "shadow.sm",
      },
    },
    state: {
      focusRing: { colour: "focus", width: 2, offset: 2 },
      disabledOpacity: 0.45,
      hoverOpacity: 0.9,
      motionDuration: { fast: 120, normal: 180, slow: 280 },
      motionEasing: { standard: "cubic-bezier(0.2, 0, 0, 1)", enter: "cubic-bezier(0, 0, 0.2, 1)", exit: "cubic-bezier(0.4, 0, 1, 1)" },
    },
  }
}

export function normalizeTokenSystem(value: unknown, palette: Swatch[]): DesignTokenSystem {
  const defaults = createTokenSystem(palette)
  if (!value || typeof value !== "object") return defaults
  const stored = value as Partial<DesignTokenSystem>
  const system: DesignTokenSystem = {
    ...defaults,
    ...stored,
    primitive: {
      spacing: { ...defaults.primitive.spacing, ...stored.primitive?.spacing },
      gaps: { ...defaults.primitive.gaps, ...stored.primitive?.gaps },
      radius: { ...defaults.primitive.radius, ...stored.primitive?.radius },
      typography: { ...defaults.primitive.typography, ...stored.primitive?.typography },
      fontSize: { ...defaults.primitive.fontSize, ...stored.primitive?.fontSize },
      fontWeight: { ...defaults.primitive.fontWeight, ...stored.primitive?.fontWeight },
      lineHeight: { ...defaults.primitive.lineHeight, ...stored.primitive?.lineHeight },
      borders: { ...defaults.primitive.borders, ...stored.primitive?.borders },
      shadows: { ...defaults.primitive.shadows, ...stored.primitive?.shadows },
      opacity: { ...defaults.primitive.opacity, ...stored.primitive?.opacity },
      sizing: { ...defaults.primitive.sizing, ...stored.primitive?.sizing },
      iconSize: { ...defaults.primitive.iconSize, ...stored.primitive?.iconSize },
    },
    semantic: {
      ...defaults.semantic,
      ...stored.semantic,
      colours: { ...defaults.semantic.colours, ...stored.semantic?.colours },
      spacing: { ...defaults.semantic.spacing, ...stored.semantic?.spacing },
      typography: { ...defaults.semantic.typography, ...stored.semantic?.typography },
    },
    component: {
      ...defaults.component,
      ...stored.component,
      buttonMain: { ...defaults.component.buttonMain, ...stored.component?.buttonMain },
      cardDefault: { ...defaults.component.cardDefault, ...stored.component?.cardDefault },
    },
    state: {
      ...defaults.state,
      ...stored.state,
      focusRing: { ...defaults.state.focusRing, ...stored.state?.focusRing },
      motionDuration: { ...defaults.state.motionDuration, ...stored.state?.motionDuration },
      motionEasing: { ...defaults.state.motionEasing, ...stored.state?.motionEasing },
    },
  }
  const ids = new Set(palette.map((swatch) => swatch.id))
  for (const meta of SEMANTIC_COLOUR_META) {
    if (!ids.has(system.semantic.colours[meta.key])) system.semantic.colours[meta.key] = defaults.semantic.colours[meta.key]
  }
  return system
}

export function semanticColour(system: DesignTokenSystem, palette: Swatch[], key: SemanticColourKey, fallback: string): string {
  const id = system.semantic.colours[key]
  return palette.find((swatch) => swatch.id === id)?.hex ?? fallback
}

export function semanticRoleBindings(system: DesignTokenSystem): Record<string, string> {
  const colours = system.semantic.colours
  return {
    "Page Background": colours.background,
    "App Background": colours.background,
    Background: colours.background,
    "Secondary Background": colours.surface,
    Surface: colours.surface,
    "Elevated Surface": colours.surfaceElevated,
    "Heading Text": colours.textPrimary,
    "Primary Text": colours.textPrimary,
    "Body Text": colours.textSecondary,
    "Secondary Text": colours.textSecondary,
    "Muted Text": colours.textMuted,
    "Brand Primary": colours.brandPrimary,
    "Brand Secondary": colours.brandSecondary,
    Accent: colours.accent,
    Border: colours.border,
    Focus: colours.focus,
    Success: colours.success,
    Warning: colours.warning,
    Error: colours.error,
    Info: colours.info,
  }
}

const roleToSemantic: Record<string, SemanticColourKey> = {
  "page background": "background",
  "app background": "background",
  background: "background",
  "secondary background": "surface",
  surface: "surface",
  "elevated surface": "surfaceElevated",
  "heading text": "textPrimary",
  "primary text": "textPrimary",
  "body text": "textSecondary",
  "secondary text": "textSecondary",
  "muted text": "textMuted",
  "brand primary": "brandPrimary",
  "brand secondary": "brandSecondary",
  accent: "accent",
  border: "border",
  focus: "focus",
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
}

export function semanticKeyForRole(role: string): SemanticColourKey | undefined {
  return roleToSemantic[role.trim().toLowerCase()]
}

export function buttonMainElementTokens(system: DesignTokenSystem): ElementTokenValues {
  const button = system.component.buttonMain
  const size = button.height === "size.control.sm" ? "size.sm" : button.height === "size.control.lg" ? "size.lg" : "size.md"
  const gap = button.gap === "gap.xs" ? "space.1" : button.gap === "gap.md" ? "space.3" : button.gap === "gap.lg" ? "space.4" : "space.2"
  return {
    buttonType: "solid",
    colourRole: semanticLabel(button.background),
    radius: button.radius,
    size,
    padding: button.paddingInline.replace("spacing.", "space."),
    gap,
    border: button.border,
  }
}

export function cardDefaultElementTokens(system: DesignTokenSystem): ElementTokenValues {
  const card = system.component.cardDefault
  const gap = card.gap === "gap.xs" ? "space.1" : card.gap === "gap.sm" ? "space.2" : card.gap === "gap.lg" ? "space.4" : "space.3"
  return {
    background: semanticLabel(card.background),
    radius: card.radius,
    padding: card.padding.replace("spacing.", "space."),
    gap,
    border: card.border,
    shadow: card.shadow,
  }
}

export function semanticLabel(key: SemanticColourKey): string {
  return SEMANTIC_COLOUR_META.find((item) => item.key === key)?.label ?? key
}

export function tokenSystemExport(system: DesignTokenSystem, palette: Swatch[], theme: Theme) {
  const paletteTokens = Object.fromEntries(palette.map((swatch, index) => [`palette-${index + 1}`, { $value: swatch.hex.toLowerCase(), $type: "color", $description: swatch.name }]))
  const semanticTokens = Object.fromEntries(SEMANTIC_COLOUR_META.map((item) => [item.key, { $value: semanticColour(system, palette, item.key, theme.accent).toLowerCase(), $type: "color", $description: item.label }]))
  return {
    $schema: "https://design-tokens.github.io/community-group/format/",
    primitive: {
      colour: paletteTokens,
      spacing: valueTokens(system.primitive.spacing, "dimension", "px"),
      gap: valueTokens(system.primitive.gaps, "dimension", "px"),
      radius: valueTokens(system.primitive.radius, "dimension", "px"),
      typography: valueTokens(system.primitive.typography, "fontFamily"),
      fontSize: valueTokens(system.primitive.fontSize, "dimension", "px"),
      fontWeight: valueTokens(system.primitive.fontWeight, "number"),
      lineHeight: valueTokens(system.primitive.lineHeight, "number"),
      border: valueTokens(system.primitive.borders, "dimension", "px"),
      shadow: valueTokens(system.primitive.shadows, "shadow"),
      opacity: valueTokens(system.primitive.opacity, "number"),
      sizing: valueTokens(system.primitive.sizing, "dimension", "px"),
      iconSize: valueTokens(system.primitive.iconSize, "dimension", "px"),
    },
    semantic: { colour: semanticTokens, spacing: system.semantic.spacing, typography: system.semantic.typography },
    component: { buttonMain: system.component.buttonMain, cardDefault: system.component.cardDefault },
    state: system.state,
    export: { generatedBy: "HueSet", version: 1 },
  }
}

function valueTokens(values: Record<string, string | number>, type: string, unit = "") {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { $value: typeof value === "number" ? `${value}${unit}` : value, $type: type }]))
}
