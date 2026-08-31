import type { CSSProperties } from "react"

export type InspectorKind = "button" | "card" | "text" | "navigation"
export type InspectorSelection = { id: string; kind: InspectorKind; label: string; defaults?: ElementTokenValues }
export type ElementTokenValues = Record<string, string | boolean>
export type ElementOverrides = Record<string, ElementTokenValues>

export const TOKEN_OPTIONS = {
  radius: ["radius.none", "radius.sm", "radius.md", "radius.lg", "radius.full"],
  size: ["size.sm", "size.md", "size.lg"],
  padding: ["space.2", "space.3", "space.4", "space.6"],
  gap: ["space.1", "space.2", "space.3", "space.4"],
  border: ["border.none", "border.subtle", "border.strong"],
  shadow: ["shadow.none", "shadow.sm", "shadow.md", "shadow.lg"],
  typography: ["type.body", "type.label", "type.heading", "type.display"],
  fontSize: ["font.sm", "font.md", "font.lg", "font.xl"],
  fontWeight: ["weight.regular", "weight.medium", "weight.semibold", "weight.bold"],
  lineHeight: ["leading.tight", "leading.normal", "leading.relaxed"],
  fontFamily: ["font.system", "font.inter", "font.georgia", "font.mono"],
  letterSpacing: ["tracking.tight", "tracking.normal", "tracking.wide"],
  textAlign: ["align.left", "align.center", "align.right"],
  buttonPreset: ["solid", "outline", "soft", "pill", "minimal"],
  borderWidth: ["border-w.0", "border-w.1", "border-w.2"],
} as const

export const ELEMENT_DEFAULTS: Record<InspectorKind, ElementTokenValues> = {
  button: {
    buttonType: "solid",
    text: "Get started",
    colourRole: "Brand Primary",
    radius: "radius.md",
    size: "size.md",
    padding: "space.3",
    gap: "space.2",
    border: "border.none",
  },
  card: {
    background: "Secondary Background",
    border: "border.subtle",
    radius: "radius.lg",
    shadow: "shadow.sm",
    padding: "space.4",
    gap: "space.3",
  },
  text: {
    textContent: "",
    textColour: "Heading Text",
    typography: "type.body",
    fontSize: "font.md",
    fontWeight: "weight.regular",
    lineHeight: "leading.normal",
  },
  navigation: {
    label: "Navigation item",
    active: false,
    colourRole: "Body Text",
    gap: "space.2",
    padding: "space.2",
    border: "border.none",
  },
}

const SPACE: Record<string, number> = { "space.1": 4, "space.2": 8, "space.3": 12, "space.4": 16, "space.6": 24 }
const RADIUS: Record<string, number> = { "radius.none": 0, "radius.sm": 4, "radius.md": 8, "radius.lg": 12, "radius.full": 999 }
const FONT_SIZE: Record<string, number> = { "font.sm": 12, "font.md": 15, "font.lg": 20, "font.xl": 30 }
const FONT_WEIGHT: Record<string, number> = { "weight.regular": 400, "weight.medium": 500, "weight.semibold": 600, "weight.bold": 700 }
const LINE_HEIGHT: Record<string, number> = { "leading.tight": 1.15, "leading.normal": 1.5, "leading.relaxed": 1.75 }
const FONT_FAMILY: Record<string, string> = { "font.system": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", "font.inter": "'Inter', sans-serif", "font.georgia": "Georgia, 'Times New Roman', serif", "font.mono": "ui-monospace, SFMono-Regular, Menlo, monospace" }
const LETTER_SPACING: Record<string, string> = { "tracking.tight": "-0.02em", "tracking.normal": "0em", "tracking.wide": "0.04em" }
const TEXT_ALIGN: Record<string, string> = { "align.left": "left", "align.center": "center", "align.right": "right" }
const BORDER_WIDTH: Record<string, number> = { "border-w.0": 0, "border-w.1": 1, "border-w.2": 2 }
const SHADOW: Record<string, string> = {
  "shadow.none": "none",
  "shadow.sm": "0 4px 12px rgba(14,24,33,0.08)",
  "shadow.md": "0 10px 28px rgba(14,24,33,0.12)",
  "shadow.lg": "0 18px 44px rgba(14,24,33,0.16)",
}

export function elementTokens(kind: InspectorKind, override?: ElementTokenValues): ElementTokenValues {
  return { ...ELEMENT_DEFAULTS[kind], ...override }
}

export function elementTokenStyle(
  kind: InspectorKind,
  values: ElementTokenValues,
  tokenColor: (role: string) => string,
): CSSProperties {
  const border = String(values.border ?? "border.none")
  const borderWidth = border === "border.strong" ? 2 : border === "border.subtle" ? 1 : 0

  if (kind === "button") {
    const buttonType = String(values.buttonType ?? "solid")
    const colour = tokenColor(String(values.colourRole ?? "Brand Primary"))
    const explicitBorderW = values.borderWidthToken ? (BORDER_WIDTH[String(values.borderWidthToken)] ?? borderWidth) : borderWidth
    const style: CSSProperties = {
      borderRadius: RADIUS[String(values.radius)] ?? 8,
      gap: SPACE[String(values.gap)] ?? 8,
      borderWidth: explicitBorderW,
      borderStyle: "solid",
      borderColor: values.borderColour ? tokenColor(String(values.borderColour)) : colour,
      fontWeight: values.fontWeight ? (FONT_WEIGHT[String(values.fontWeight)] ?? undefined) : undefined,
    }
    if (buttonType === "outline") return { ...style, background: "transparent", color: colour }
    if (buttonType === "ghost" || buttonType === "minimal") return { ...style, background: "transparent", color: colour, borderWidth: 0 }
    if (buttonType === "glass") return { ...style, background: `${colour}66`, color: tokenColor("Heading Text"), backdropFilter: "blur(12px)" }
    if (buttonType === "soft") return { ...style, background: `${colour}18`, color: colour, borderWidth: 0 }
    if (buttonType === "pill") return { ...style, background: colour, color: tokenColor("Button Text"), borderRadius: 999 }
    return { ...style, background: colour, color: tokenColor("Button Text") }
  }

  if (kind === "card") {
    return {
      background: tokenColor(String(values.background ?? "Secondary Background")),
      borderWidth,
      borderStyle: "solid",
      borderColor: tokenColor("Border"),
      borderRadius: RADIUS[String(values.radius)] ?? 12,
      boxShadow: SHADOW[String(values.shadow)] ?? SHADOW["shadow.sm"],
      padding: SPACE[String(values.padding)] ?? 16,
      gap: SPACE[String(values.gap)] ?? 12,
    }
  }

  if (kind === "text") {
    const typography = String(values.typography ?? "type.body")
    const explicitFamily = values.fontFamily ? FONT_FAMILY[String(values.fontFamily)] : undefined
    return {
      color: tokenColor(String(values.textColour ?? "Heading Text")),
      fontFamily: explicitFamily ?? (typography === "type.display" || typography === "type.heading" ? "var(--font-display)" : "var(--font-sans)"),
      fontSize: FONT_SIZE[String(values.fontSize)] ?? 15,
      fontWeight: FONT_WEIGHT[String(values.fontWeight)] ?? 400,
      fontStyle: values.italic ? "italic" as const : "normal" as const,
      textDecoration: values.underline ? "underline" as const : "none" as const,
      lineHeight: LINE_HEIGHT[String(values.lineHeight)] ?? 1.5,
      letterSpacing: values.letterSpacing ? LETTER_SPACING[String(values.letterSpacing)] ?? "0em" : undefined,
      textAlign: values.textAlign ? TEXT_ALIGN[String(values.textAlign)] as CSSProperties["textAlign"] : undefined,
    }
  }

  const active = Boolean(values.active)
  const colour = tokenColor(String(values.colourRole ?? "Body Text"))
  return {
    color: active ? tokenColor("Button Text") : colour,
    background: active ? tokenColor("Brand Primary") : "transparent",
    gap: SPACE[String(values.gap)] ?? 8,
    padding: SPACE[String(values.padding)] ?? 8,
    borderWidth,
    borderStyle: "solid",
    borderColor: tokenColor("Border"),
    borderRadius: 8,
  }
}

export function elementOverrideStyle(
  kind: InspectorKind,
  override: ElementTokenValues | undefined,
  tokenColor: (role: string) => string,
): CSSProperties {
  if (!override) return {}
  const complete = elementTokenStyle(kind, elementTokens(kind, override), tokenColor)
  const result: CSSProperties = {}
  const include = (...properties: (keyof CSSProperties)[]) => properties.forEach((property) => { result[property] = complete[property] as never })

  if (kind === "card") {
    if ("background" in override) include("background")
    if ("border" in override) include("borderWidth", "borderStyle", "borderColor")
    if ("radius" in override) include("borderRadius")
    if ("shadow" in override) include("boxShadow")
    if ("padding" in override) include("padding")
    if ("gap" in override) include("gap")
  } else if (kind === "text") {
    if ("textColour" in override) include("color")
    if ("typography" in override || "fontFamily" in override) include("fontFamily")
    if ("fontSize" in override) include("fontSize")
    if ("fontWeight" in override) include("fontWeight")
    if ("lineHeight" in override) include("lineHeight")
    if ("italic" in override) include("fontStyle")
    if ("underline" in override) include("textDecoration")
    if ("letterSpacing" in override) include("letterSpacing")
    if ("textAlign" in override) include("textAlign")
  } else if (kind === "navigation") {
    if ("active" in override) include("color", "background", "borderRadius")
    if ("colourRole" in override) include("color")
    if ("gap" in override) include("gap")
    if ("padding" in override) include("padding")
    if ("border" in override) include("borderWidth", "borderStyle", "borderColor")
  } else {
    if ("buttonType" in override || "colourRole" in override) include("background", "color", "backdropFilter")
    if ("radius" in override) include("borderRadius")
    if ("gap" in override) include("gap")
    if ("border" in override) include("borderWidth", "borderStyle", "borderColor")
  }

  return result
}

export function buttonPadding(token: string, size: string): { paddingBlock: number; paddingInline: number } {
  const base = SPACE[token] ?? 12
  const scale = size === "size.sm" ? 0.8 : size === "size.lg" ? 1.3 : 1
  return { paddingBlock: Math.round(base * 0.72 * scale), paddingInline: Math.round(base * 1.45 * scale) }
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomTypographyTokens(): ElementTokenValues {
  return {
    fontFamily: pickRandom(TOKEN_OPTIONS.fontFamily),
    fontWeight: pickRandom(TOKEN_OPTIONS.fontWeight),
    lineHeight: pickRandom(TOKEN_OPTIONS.lineHeight),
    letterSpacing: pickRandom(TOKEN_OPTIONS.letterSpacing),
  }
}

export function randomButtonTokens(): ElementTokenValues {
  return {
    buttonType: pickRandom(TOKEN_OPTIONS.buttonPreset),
    radius: pickRandom(TOKEN_OPTIONS.radius),
    size: pickRandom(TOKEN_OPTIONS.size),
  }
}
