import { describe, it, expect } from "vitest"
import { isKnownRoute } from "./router"

describe("isKnownRoute", () => {
  it("returns true for all app routes", () => {
    for (const route of ["/", "/app", "/generate", "/quick-design", "/pricing", "/help", "/privacy", "/terms", "/contact", "/learn", "/examples", "/about"]) {
      expect(isKnownRoute(route), `Expected ${route} to be known`).toBe(true)
    }
  })

  it("returns true for legacy alias routes", () => {
    expect(isKnownRoute("/builder")).toBe(true)
    expect(isKnownRoute("/preview")).toBe(true)
    expect(isKnownRoute("/live-changes")).toBe(true)
  })

  it("returns false for unknown paths", () => {
    expect(isKnownRoute("/foo")).toBe(false)
    expect(isKnownRoute("/404")).toBe(false)
    expect(isKnownRoute("")).toBe(false)
    expect(isKnownRoute("/app/sub")).toBe(false)
    expect(isKnownRoute("app")).toBe(false)
  })
})
