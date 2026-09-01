import { createSwatch, updateSwatchHex, uid, type Swatch } from "./color"

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
  return DEFAULT_COLOURS.map((colour) => ({ ...colour, id: uid(), autoNamed: false }))
}

function cleanStoredSwatch(item: unknown): Swatch | null {
  if (!item || typeof item !== "object") return null
  const record = item as Record<string, unknown>
  if (typeof record.id !== "string" || typeof record.name !== "string" || typeof record.hex !== "string") {
    return null
  }
  return {
    id: record.id,
    name: record.name,
    hex: record.hex,
    locked: !!record.locked,
    ...(typeof record.autoNamed === "boolean" ? { autoNamed: record.autoNamed } : {}),
  }
}

/** Reads the palette from localStorage only (no URL hash). */
export function loadPaletteFromStorage(): Swatch[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const palette = raw ? JSON.parse(raw)?.palette : null
    if (!Array.isArray(palette) || palette.length === 0) return createDefaultPalette()
    const cleaned = palette.map(cleanStoredSwatch).filter((item): item is Swatch => item !== null)
    // Filtering can empty a non-empty array if every entry was malformed.
    // Downstream code indexes palette[0..4] freely, so never hand back [].
    return cleaned.length ? cleaned : createDefaultPalette()
  } catch {
    return createDefaultPalette()
  }
}

/** Applies hash hexes by index onto stored swatches; extra hash slots become new swatches. */
export function mergeHashPalette(stored: Swatch[], hashPalette: Swatch[]): Swatch[] {
  const merged = stored.map((swatch, index) => {
    const hashSwatch = hashPalette[index]
    if (!hashSwatch) return swatch
    return updateSwatchHex(swatch, hashSwatch.hex)
  })
  for (let index = stored.length; index < hashPalette.length; index++) {
    merged.push(createSwatch(hashPalette[index].hex, index))
  }
  return merged
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

/* Priority: merge URL hash into stored palette when hash exists;
 * otherwise localStorage > default palette. */
export function loadPalette(): Swatch[] {
  const stored = loadPaletteFromStorage()
  const fromHash = readHashPalette()
  if (fromHash) return mergeHashPalette(stored, fromHash)
  return stored
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
