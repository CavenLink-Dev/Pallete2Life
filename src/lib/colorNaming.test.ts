import { describe, it, expect } from "vitest"
import { colorName, createSwatch, updateSwatchHex } from "./color"

describe("colorName", () => {
  it("names a saturated blue", () => {
    expect(colorName("#2060E0")).toBe("Sky Blue")
  })

  it("names near-black neutrals", () => {
    expect(colorName("#101010")).toBe("Near Black")
  })

  it("names soft white neutrals", () => {
    expect(colorName("#F5F5F5")).toBe("Soft White")
  })
})

describe("createSwatch", () => {
  it("auto-names by default", () => {
    const swatch = createSwatch("#2060E0")
    expect(swatch.name).toBe("Sky Blue")
    expect(swatch.hex).toBe("#2060E0")
    expect(swatch.id).toBeTruthy()
    expect(swatch.autoNamed).toBeUndefined()
  })

  it("uses index label when auto naming is disabled", () => {
    const swatch = createSwatch("#2060E0", 2, false)
    expect(swatch.name).toBe("Colour 3")
    expect(swatch.autoNamed).toBe(false)
  })

  it("normalizes hex on create", () => {
    const swatch = createSwatch("2060e0")
    expect(swatch.hex).toBe("#2060E0")
  })
})

describe("updateSwatchHex", () => {
  it("updates name when autoNamed is not false", () => {
    const swatch = createSwatch("#2060E0")
    const updated = updateSwatchHex(swatch, "#F46B5E")
    expect(updated.hex).toBe("#F46B5E")
    expect(updated.name).toBe("Red")
  })

  it("keeps custom name when autoNamed is false", () => {
    const swatch = { id: "s1", hex: "#2060E0", name: "Brand Blue", autoNamed: false as const }
    const updated = updateSwatchHex(swatch, "#F46B5E")
    expect(updated.hex).toBe("#F46B5E")
    expect(updated.name).toBe("Brand Blue")
  })

  it("keeps name when autoNamed is undefined (default auto)", () => {
    const swatch = { id: "s1", hex: "#2060E0", name: "Old Blue" }
    const updated = updateSwatchHex(swatch, "#102A43")
    expect(updated.name).toBe("Deep Sky Blue")
  })
})
