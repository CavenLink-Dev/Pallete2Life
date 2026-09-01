import { describe, it, expect } from "vitest"
import {
  buildPublicTemplateAssets,
  canonicalType,
  classifyTemplateEditability,
  isPaletteAware,
  publicAssetsForCategory,
  publicTemplateAssets,
  templateCatalogStats,
} from "./templateCatalog"
import { templateAssets } from "./templateAssets"

describe("templateCatalog", () => {
  it("classifies built-in templates as live and imported SVG as static", () => {
    const builtIn = templateAssets.find((asset) => asset.renderer === "built-in")
    const imported = templateAssets.find((asset) => asset.renderer === "svg")
    expect(builtIn && classifyTemplateEditability(builtIn)).toBe("live")
    expect(imported && classifyTemplateEditability(imported)).toBe("static")
  })

  it("exposes only palette-aware templates in the public picker", () => {
    expect(publicTemplateAssets.length).toBeGreaterThan(0)
    expect(publicTemplateAssets.every(isPaletteAware)).toBe(true)
    expect(publicTemplateAssets.length).toBeLessThan(templateAssets.length)
  })

  it("dedupes overlapping built-in and imported names", () => {
    const landingSimple = publicTemplateAssets.filter(
      (asset) => asset.category === "Website" && canonicalType(asset.type) === "Landing Page" && asset.variant === "Simple",
    )
    expect(landingSimple).toHaveLength(1)
    expect(landingSimple[0]?.collection).toBe("Built-In")
  })

  it("consolidates authentication and 404 type aliases for grouping", () => {
    expect(canonicalType("404")).toBe("Error Page")
    expect(canonicalType("Login")).toBe("Authentication")
    expect(canonicalType("Sign In")).toBe("Authentication")
    expect(canonicalType("Sign Up")).toBe("Authentication")
  })

  it("filters public assets by category without empty groups", () => {
    for (const category of ["Website", "Application", "Components"] as const) {
      const assets = publicAssetsForCategory(category)
      expect(assets.length).toBeGreaterThan(0)
      expect(assets.every((asset) => asset.category === category)).toBe(true)
    }
  })

  it("reports catalog audit stats", () => {
    const stats = templateCatalogStats()
    expect(stats.total).toBe(templateAssets.length)
    expect(stats.publicPicker).toBe(buildPublicTemplateAssets().length)
    expect(stats.hiddenFromPicker).toBe(stats.total - stats.publicPicker)
    expect(stats.byEditability.live).toBeGreaterThan(0)
    expect(stats.byEditability.static).toBeGreaterThan(0)
  })
})
