import type { TemplateCategory } from "./templateAssets"
import type { InspectorKind } from "./designTokens"

/** Percentage-based hit region (0–100) within the SVG viewBox. */
export type SvgTemplateElement = {
  id: string
  kind: InspectorKind
  label: string
  x: number
  y: number
  w: number
  h: number
}

const WEBSITE_ELEMENTS: SvgTemplateElement[] = [
  { id: "nav", kind: "navigation", label: "Navigation", x: 18, y: 2, w: 82, h: 8 },
  { id: "heading", kind: "text", label: "Page heading", x: 18, y: 12, w: 55, h: 10 },
  { id: "primary-button", kind: "button", label: "Primary button", x: 18, y: 24, w: 22, h: 6 },
  { id: "content-card", kind: "card", label: "Content card", x: 18, y: 34, w: 78, h: 58 },
]

const APPLICATION_ELEMENTS: SvgTemplateElement[] = [
  { id: "status-bar", kind: "navigation", label: "Status bar", x: 5, y: 2, w: 90, h: 6 },
  { id: "heading", kind: "text", label: "Screen title", x: 8, y: 10, w: 84, h: 8 },
  { id: "primary-button", kind: "button", label: "Primary action", x: 8, y: 22, w: 84, h: 7 },
  { id: "content-card", kind: "card", label: "Content area", x: 8, y: 32, w: 84, h: 58 },
]

export function svgElementsForCategory(category: TemplateCategory): SvgTemplateElement[] {
  if (category === "Application") return APPLICATION_ELEMENTS
  return WEBSITE_ELEMENTS
}
