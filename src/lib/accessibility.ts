import { contrastRatio, hexToRgb, rgbToHex, type Theme } from "./color"
import type { DesignTokenSystem } from "./tokenSystem"

export type AccessibilityStatus = "good" | "review" | "poor"
export type AccessibilityCheck = {
  id: "normal-text" | "large-text" | "button" | "border" | "focus" | "touch-target"
  label: string
  status: AccessibilityStatus
  value: string
  suggestion: string
}

export const ACCESSIBILITY_STATUS_LABEL: Record<AccessibilityStatus, string> = {
  good: "Good",
  review: "Needs review",
  poor: "Poor contrast",
}

export function evaluateAccessibility(theme: Theme, system: DesignTokenSystem): AccessibilityCheck[] {
  const normal = contrastRatio(opaque(theme.ink, theme.paper), opaque(theme.paper, "#FFFFFF"))
  const large = contrastRatio(opaque(theme.inkSoft, theme.paper), opaque(theme.paper, "#FFFFFF"))
  const button = contrastRatio(opaque(theme.onBrand, theme.accent), opaque(theme.accent, theme.paper))
  const border = contrastRatio(opaque(theme.border, theme.paper), opaque(theme.paper, "#FFFFFF"))
  const focusColour = system.state.focusRing.colour === "focus" ? theme.accent : theme.ink
  const focus = contrastRatio(opaque(focusColour, theme.paper), opaque(theme.paper, "#FFFFFF"))
  const controlHeight = system.primitive.sizing[system.component.buttonMain.height] ?? 44

  return [
    ratioCheck("normal-text", "Normal text", normal, 4.5, 3, "Darken the text or lighten its background."),
    ratioCheck("large-text", "Large text", large, 3, 2.5, "Increase the difference between large text and its background."),
    ratioCheck("button", "Button contrast", button, 4.5, 3, "Use a lighter or darker button label colour."),
    ratioCheck("border", "Border contrast", border, 3, 2, "Strengthen borders used to identify controls and fields."),
    {
      id: "focus",
      label: "Focus visibility",
      status: focus >= 3 && system.state.focusRing.width >= 2 ? "good" : focus >= 2 || system.state.focusRing.width >= 2 ? "review" : "poor",
      value: `${round(focus)}:1 · ${system.state.focusRing.width}px ring`,
      suggestion: "Use a 2px or wider focus ring with clear contrast.",
    },
    {
      id: "touch-target",
      label: "Touch target size",
      status: controlHeight >= 44 ? "good" : controlHeight >= 40 ? "review" : "poor",
      value: `${controlHeight}px high`,
      suggestion: "Use controls at least 44px high for comfortable touch input.",
    },
  ]
}

export function worstAccessibilityStatus(checks: AccessibilityCheck[]): AccessibilityStatus {
  if (checks.some((check) => check.status === "poor")) return "poor"
  if (checks.some((check) => check.status === "review")) return "review"
  return "good"
}

function ratioCheck(id: AccessibilityCheck["id"], label: string, ratio: number, good: number, review: number, suggestion: string): AccessibilityCheck {
  return {
    id,
    label,
    status: ratio >= good ? "good" : ratio >= review ? "review" : "poor",
    value: `${round(ratio)}:1`,
    suggestion,
  }
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

function opaque(colour: string, background: string): string {
  if (colour.startsWith("#")) return colour
  const match = colour.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i)
  if (!match) return "#000000"
  const alpha = match[4] === undefined ? 1 : Number(match[4])
  const bg = hexToRgb(background.startsWith("#") ? background : "#FFFFFF")
  return rgbToHex(
    Number(match[1]) * alpha + bg.r * (1 - alpha),
    Number(match[2]) * alpha + bg.g * (1 - alpha),
    Number(match[3]) * alpha + bg.b * (1 - alpha),
  )
}
