import { uid, type Swatch } from "./color"

const STORE_KEY = "hueframe:v1"

const DEFAULT_COLOURS = [
  { name: "Pale Sky Blue", hex: "#D5E4ED" },
  { name: "Muted Teal", hex: "#4F9A94" },
  { name: "Coral Red", hex: "#F46B5E" },
  { name: "Golden Yellow", hex: "#F6C453" },
  { name: "Deep Navy", hex: "#102A43" },
]

export function createDefaultPalette(): Swatch[] {
  return DEFAULT_COLOURS.map((colour) => ({ ...colour, id: uid() }))
}

export function loadPalette(): Swatch[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const palette = raw ? JSON.parse(raw)?.palette : null
    if (!Array.isArray(palette) || palette.length === 0) return createDefaultPalette()
    return palette
      .filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.hex === "string")
      .map((item) => ({ id: item.id, name: item.name, hex: item.hex, locked: !!item.locked }))
  } catch {
    return createDefaultPalette()
  }
}

export function savePalette(palette: Swatch[]) {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const data = raw ? JSON.parse(raw) : {}
    data.palette = palette
    localStorage.setItem(STORE_KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable */
  }
}
