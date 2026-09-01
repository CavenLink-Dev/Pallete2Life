import { describe, expect, it, beforeEach, afterEach } from "vitest"
import { applyPageMeta, metaForRoute, PAGE_META } from "./pageMeta"

describe("pageMeta", () => {
  beforeEach(() => {
    document.head.innerHTML = ""
    document.title = ""
  })

  afterEach(() => {
    document.head.innerHTML = ""
  })

  it("defines unique titles for public routes", () => {
    const titles = Object.values(PAGE_META).map((m) => m.title)
    expect(new Set(titles).size).toBe(titles.length)
  })

  it("applies title, description, canonical, and social tags", () => {
    applyPageMeta(PAGE_META["/help"])
    expect(document.title).toContain("Help & guide")
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toContain("HueSet")
    expect(document.querySelector('link[rel="canonical"]')).toBeTruthy()
    expect(document.querySelector('meta[property="og:title"]')).toBeTruthy()
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute("content")).toBe("summary_large_image")
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toContain("/og-image.svg")
  })

  it("returns 404 meta for unknown paths", () => {
    const meta = metaForRoute("/404", "/does-not-exist")
    expect(meta.title).toContain("Page not found")
    expect(meta.noIndex).toBe(true)
  })
})
