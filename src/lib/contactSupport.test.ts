import { describe, expect, it } from "vitest"
import { buildBugReportMailto, buildNotifyMeMailto, SUPPORT_EMAIL } from "./contactSupport"

describe("contactSupport", () => {
  it("uses the configured support email", () => {
    expect(SUPPORT_EMAIL).toBe("cavenlink.dev@gmail.com")
    expect(buildNotifyMeMailto("pro")).toContain(SUPPORT_EMAIL)
  })

  it("builds a structured bug report mailto", () => {
    const href = buildBugReportMailto({
      route: "/app",
      device: "1440×900",
      browser: "Chrome",
      description: "Export dialog stuck",
      steps: "1. Click Export",
    })
    expect(href).toMatch(/^mailto:/)
    expect(decodeURIComponent(href)).toContain("Route: /app")
    expect(decodeURIComponent(href)).toContain("Export dialog stuck")
  })
})
