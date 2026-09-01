import { describe, it, expect, beforeEach } from "vitest"
import {
  loadPalette,
  loadPaletteFromStorage,
  mergeHashPalette,
  createDefaultPalette,
} from "./paletteStore"
import type { Swatch } from "./color"

const STORE_KEY = "hueframe:v1"

beforeEach(() => {
  localStorage.clear()
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", "/")
  }
})

describe("createDefaultPalette", () => {
  it("returns exactly 5 swatches with valid fields", () => {
    const palette = createDefaultPalette()
    expect(palette).toHaveLength(5)
    for (const swatch of palette) {
      expect(typeof swatch.id).toBe("string")
      expect(typeof swatch.name).toBe("string")
      expect(typeof swatch.hex).toBe("string")
      expect(swatch.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe("loadPaletteFromStorage", () => {
  it("returns the default palette when storage is empty", () => {
    const palette = loadPaletteFromStorage()
    expect(palette.length).toBe(5)
  })

  it("preserves autoNamed when stored as boolean", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        palette: [{ id: "a1", name: "Brand Blue", hex: "#2060E0", autoNamed: false }],
      }),
    )
    const palette = loadPaletteFromStorage()
    expect(palette[0].autoNamed).toBe(false)
  })

  it("omits autoNamed when stored value is not boolean", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        palette: [{ id: "a1", name: "Red", hex: "#FF0000", autoNamed: "yes" }],
      }),
    )
    const palette = loadPaletteFromStorage()
    expect(palette[0].autoNamed).toBeUndefined()
  })
})

describe("mergeHashPalette", () => {
  it("updates hex by index while preserving ids, names, locked, and autoNamed", () => {
    const stored: Swatch[] = [
      { id: "s1", name: "Brand Blue", hex: "#2060E0", locked: true, autoNamed: false },
      { id: "s2", name: "Accent", hex: "#AABBCC" },
    ]
    const hashPalette: Swatch[] = [
      { id: "h1", name: "Colour 1", hex: "#FF0000" },
      { id: "h2", name: "Colour 2", hex: "#00FF00" },
    ]
    const merged = mergeHashPalette(stored, hashPalette)
    expect(merged).toHaveLength(2)
    expect(merged[0]).toEqual({
      id: "s1",
      name: "Brand Blue",
      hex: "#FF0000",
      locked: true,
      autoNamed: false,
    })
    expect(merged[1].id).toBe("s2")
    expect(merged[1].hex).toBe("#00FF00")
  })

  it("auto-renames swatches when autoNamed is not false", () => {
    const stored: Swatch[] = [{ id: "s1", name: "Old Name", hex: "#2060E0" }]
    const hashPalette: Swatch[] = [{ id: "h1", name: "Colour 1", hex: "#F46B5E" }]
    const merged = mergeHashPalette(stored, hashPalette)
    expect(merged[0].hex).toBe("#F46B5E")
    expect(merged[0].name).not.toBe("Old Name")
  })

  it("appends new swatches for extra hash slots", () => {
    const stored: Swatch[] = [{ id: "s1", name: "One", hex: "#111111" }]
    const hashPalette: Swatch[] = [
      { id: "h1", name: "Colour 1", hex: "#222222" },
      { id: "h2", name: "Colour 2", hex: "#333333" },
    ]
    const merged = mergeHashPalette(stored, hashPalette)
    expect(merged).toHaveLength(2)
    expect(merged[0].id).toBe("s1")
    expect(merged[1].id).not.toBe("h2")
    expect(merged[1].hex).toBe("#333333")
  })
})

describe("loadPalette", () => {
  it("returns the default palette when storage is empty", () => {
    const palette = loadPalette()
    expect(palette.length).toBe(5)
  })

  it("returns the stored palette when valid", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ palette: [{ id: "a1", name: "Red", hex: "#FF0000" }] }),
    )
    const palette = loadPalette()
    expect(palette[0].hex).toBe("#FF0000")
    expect(palette[0].id).toBe("a1")
  })

  it("merges hash hexes into stored palette when hash exists", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        palette: [{ id: "a1", name: "Brand Blue", hex: "#2060E0", autoNamed: false }],
      }),
    )
    window.history.replaceState(null, "", "/#p=FF0000")
    const palette = loadPalette()
    expect(palette[0].id).toBe("a1")
    expect(palette[0].name).toBe("Brand Blue")
    expect(palette[0].hex).toBe("#FF0000")
    expect(palette[0].autoNamed).toBe(false)
  })

  it("returns default palette when stored palette is an empty array", () => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ palette: [] }))
    const palette = loadPalette()
    expect(palette.length).toBeGreaterThan(0)
  })

  it("returns default palette when all stored items fail validation", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ palette: [{ bad: "data" }, { also: "bad" }] }),
    )
    const palette = loadPalette()
    expect(palette.length).toBeGreaterThan(0)
    expect(palette[0]).toHaveProperty("hex")
  })

  it("returns default palette on corrupt JSON", () => {
    localStorage.setItem(STORE_KEY, "corrupt{{")
    const palette = loadPalette()
    expect(palette.length).toBeGreaterThan(0)
  })
})
