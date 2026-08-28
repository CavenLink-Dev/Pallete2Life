import { uid, type Swatch } from "./color"

const STORE_KEY = "hueframe:v1"

const DEFAULT_COLOURS = [
  { name: "Cloud", hex: "#F8FAFC" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Clear Blue", hex: "#2563EB" },
  { name: "Ink Navy", hex: "#0F172A" },
  { name: "Slate", hex: "#475569" },
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
