import { uid, type Swatch } from "./color"

const STORE_KEY = "hueframe:v1"
const HASH_KEY = "p"

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

/* Reads a palette from the location hash: `#p=RRGGBB,RRGGBB,...`.
 * A present but malformed palette falls back to the defaults as one
 * unit; accepting only the valid fragments would silently change a
 * shared palette. Null means there is no palette hash at all. */
export function readHashPalette(): Swatch[] | null {
  if (typeof window === "undefined") return null
  const raw = window.location.hash.replace(/^#/, "")
  if (!raw) return null
  const params = new URLSearchParams(raw)
  const value = params.get(HASH_KEY)
  if (value === null) return null

  const parts = value.split(",").map((part) => part.trim())
  const colours = parts.map((part) => part.replace(/^#/, "").toUpperCase())
  if (!colours.length || colours.some((colour) => !/^[0-9A-F]{6}$/.test(colour))) {
    return createDefaultPalette()
  }

  return colours.map((hex, index) => ({ id: uid(), name: `Colour ${index + 1}`, hex: `#${hex}` }))
}

/* Writes the current palette into the location hash. Debounced ~200ms
 * so rapid palette edits don't spam history. Uses replaceState so the
 * user's browser Back button stays useful. */
let hashWriteTimer: ReturnType<typeof setTimeout> | null = null
export function writeHashPalette(palette: Swatch[]) {
  if (typeof window === "undefined") return
  if (hashWriteTimer) clearTimeout(hashWriteTimer)
  hashWriteTimer = setTimeout(() => {
    const hexes = palette.map((s) => s.hex.replace(/^#/, "").toUpperCase()).join(",")
    const next = `#${HASH_KEY}=${hexes}`
    if (window.location.hash === next) return
    window.history.replaceState({}, "", window.location.pathname + window.location.search + next)
  }, 200)
}

/* Priority: URL hash > localStorage > default palette. This lets a
 * pasted share link deterministically restore a palette. */
export function loadPalette(): Swatch[] {
  const fromHash = readHashPalette()
  if (fromHash) return fromHash
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const palette = raw ? JSON.parse(raw)?.palette : null
    if (!Array.isArray(palette) || palette.length === 0) return createDefaultPalette()
    const cleaned = palette
      .filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.hex === "string")
      .map((item) => ({ id: item.id, name: item.name, hex: item.hex, locked: !!item.locked }))
    // Filtering can empty a non-empty array if every entry was malformed.
    // Downstream code indexes palette[0..4] freely, so never hand back [].
    return cleaned.length ? cleaned : createDefaultPalette()
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
