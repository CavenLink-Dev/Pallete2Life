import { describe, it, expect, beforeEach } from "vitest"
import { loadPalette, createDefaultPalette } from "./paletteStore"

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
