import { describe, expect, it } from "vitest"
import { BRAND, BRAND_CTA_ON_WHITE, BRAND_TEXT_ON_WHITE, contrastRatio } from "./color"

describe("brand contrast for WCAG 2.2 AA", () => {
  it("rejects the previous light blue on white for normal text", () => {
    expect(contrastRatio("#13A8E7", "#FFFFFF")).toBeLessThan(4.5)
    expect(contrastRatio("#20B9FA", "#FFFFFF")).toBeLessThan(4.5)
  })

  it("uses a primary CTA fill that meets 4.5:1 with white text", () => {
    expect(contrastRatio("#FFFFFF", BRAND.cta)).toBeGreaterThanOrEqual(4.5)
    expect(BRAND.cta).toBe(BRAND_CTA_ON_WHITE)
  })

  it("uses a brand text colour that meets 4.5:1 on white", () => {
    expect(contrastRatio(BRAND_TEXT_ON_WHITE, "#FFFFFF")).toBeGreaterThanOrEqual(4.5)
  })

  it("keeps charcoal body text well above AA on off-white", () => {
    expect(contrastRatio(BRAND.charcoal, BRAND.offwhite)).toBeGreaterThanOrEqual(4.5)
  })
})
