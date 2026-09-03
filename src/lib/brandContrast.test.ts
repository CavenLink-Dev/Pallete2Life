import { describe, expect, it } from "vitest"
import { BRAND, BRAND_CTA_ON_WHITE, BRAND_TEXT_ON_WHITE, contrastRatio } from "./color"

describe("brand contrast for WCAG 2.2 AA", () => {
  it("rejects the previous light blue on white for normal text", () => {
    expect(contrastRatio("#13A8E7", "#FFFFFF")).toBeLessThan(4.5)
    expect(contrastRatio("#20B9FA", "#FFFFFF")).toBeLessThan(4.5)
  })

  it("uses the brand primary blue for CTA fills", () => {
    expect(BRAND.cta).toBe("#13A8E7")
    expect(BRAND.cta).toBe(BRAND_CTA_ON_WHITE)
  })

  it("uses the requested secondary action blue", () => {
    expect(BRAND.secondary).toBe("#178ABA")
  })

  it("documents that white text on brand primary blue is below 4.5:1", () => {
    expect(contrastRatio("#FFFFFF", BRAND.cta)).toBeLessThan(4.5)
    expect(contrastRatio("#FFFFFF", BRAND.secondary)).toBeLessThan(4.5)
  })

  it("uses a brand text colour that meets 4.5:1 on white", () => {
    expect(contrastRatio(BRAND_TEXT_ON_WHITE, "#FFFFFF")).toBeGreaterThanOrEqual(4.5)
  })

  it("documents that brand primary blue is below 3:1 non-text contrast on white", () => {
    expect(contrastRatio(BRAND.cta, "#FFFFFF")).toBeLessThan(3)
  })

  it("keeps charcoal body text well above AA on off-white", () => {
    expect(contrastRatio(BRAND.charcoal, BRAND.offwhite)).toBeGreaterThanOrEqual(4.5)
  })

  it("CTA fill #0A6288 passes 4.5:1 contrast with white text", () => {
    expect(contrastRatio("#FFFFFF", "#0A6288")).toBeGreaterThanOrEqual(4.5)
  })

  it("keeps both landing action fills distinct from the dark background", () => {
    expect(contrastRatio(BRAND.cta, "#1F2329")).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(BRAND.secondary, "#1F2329")).toBeGreaterThanOrEqual(3)
  })
})
