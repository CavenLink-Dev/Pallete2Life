import { test, expect, type Page } from "@playwright/test"

const BASE = "http://localhost:4173"

function trackErrors(page: Page) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  const failedRequests: string[] = []

  page.on("pageerror", (error) => {
    pageErrors.push(String(error))
  })
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.failure()?.errorText ?? "failed"} ${request.url()}`)
  })

  return { pageErrors, consoleErrors, failedRequests }
}

async function expectHealthy(tracker: ReturnType<typeof trackErrors>) {
  expect(tracker.pageErrors, `Unexpected page errors: ${tracker.pageErrors.join("; ")}`).toHaveLength(0)
  expect(tracker.consoleErrors, `Unexpected console errors: ${tracker.consoleErrors.join("; ")}`).toHaveLength(0)
  const missingAssets = tracker.failedRequests.filter((entry) => /404|net::ERR_FILE_NOT_FOUND/i.test(entry))
  expect(missingAssets, `Missing local assets: ${missingAssets.join("; ")}`).toHaveLength(0)
}

test.describe("Production-readiness public surfaces", () => {
  test("every public route has unique metadata and is not blank", async ({ page }) => {
    const tracker = trackErrors(page)
    const routes = [
      { path: "/", title: /HueSet — Preview your website or app style before you build/ },
      { path: "/generate", title: /Generate Design — HueSet/ },
      { path: "/help", title: /Help & guide — HueSet/ },
      { path: "/pricing", title: /Pricing — HueSet/ },
      { path: "/contact", title: /Contact — HueSet/ },
      { path: "/privacy", title: /Privacy Policy — HueSet/ },
      { path: "/terms", title: /Terms of Service — HueSet/ },
      { path: "/quick-design", title: /Quick Design — HueSet/ },
      { path: "/app", title: /Design workspace — HueSet/ },
    ] as const

    const titles = new Set<string>()
    for (const route of routes) {
      await page.goto(`${BASE}${route.path}`)
      await page.waitForLoadState("networkidle")
      const title = await page.title()
      expect(title).toMatch(route.title)
      titles.add(title)
      await expect(page.locator("body")).not.toHaveText(/^\s*$/)
      const description = await page.locator('meta[name="description"]').getAttribute("content")
      expect(description?.length).toBeGreaterThan(20)
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-image\.svg/)
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image")
    }

    expect(titles.size).toBe(routes.length)
    await expectHealthy(tracker)
  })

  test("invalid URL shows branded 404 with noindex metadata", async ({ page }) => {
    const tracker = trackErrors(page)
    const response = await page.goto(`${BASE}/does-not-exist-xyz`)
    await page.waitForLoadState("networkidle")
    expect(response?.ok()).toBeTruthy()
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible()
    await expect(page).toHaveTitle(/Page not found — HueSet/)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
    await expectHealthy(tracker)
  })

  test("pricing and export stay in payment-disabled notify state", async ({ page }) => {
    const tracker = trackErrors(page)
    await page.goto(`${BASE}/pricing`)
    await expect(page.getByText("Early access:")).toBeVisible()
    await expect(page.getByRole("link", { name: "Notify me" })).toHaveCount(2)
    await expect(page.getByRole("button", { name: /Unlock Export|Go Pro ·/ })).toHaveCount(0)

    await page.goto(`${BASE}/`)
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")
    await page.getByRole("button", { name: "Export" }).click()
    await expect(page.getByRole("heading", { name: "Export checkout coming soon" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Notify me" })).toBeVisible()
    await expect(page.getByRole("button", { name: /Unlock Export/ })).toHaveCount(0)
    await page.getByRole("button", { name: "Keep Editing" }).click()
    await expect(page.getByRole("heading", { name: "Export checkout coming soon" })).toHaveCount(0)
    await expectHealthy(tracker)
  })
})

test.describe("Production-readiness workspace journeys", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test("fresh visitor can start Quick Design from home", async ({ page }) => {
    const tracker = trackErrors(page)
    await page.goto(`${BASE}/`)
    await page.getByRole("link", { name: "Preview My Palette" }).first().click()
    await expect(page).toHaveURL(/\/quick-design/)
    await expect(page.getByRole("heading", { name: "Quick Design" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Basic Website" })).toBeVisible()
    await expectHealthy(tracker)
  })

  test("fresh visitor can start Full Design System from home", async ({ page }) => {
    const tracker = trackErrors(page)
    await page.goto(`${BASE}/`)
    await page.getByRole("link", { name: "Build a Full Design System" }).first().click()
    await expect(page).toHaveURL(/\/generate/)
    await expect(page.getByRole("button", { name: "Build a Full Design System" })).toBeVisible()
    await page.getByRole("button", { name: "Build a Full Design System" }).click()
    await page.getByRole("button", { name: "Website" }).click()
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(page.getByRole("heading", { name: "Pick a starting layout" })).toBeVisible()
    await expectHealthy(tracker)
  })

  test("brand name, preview switch, and new-tab URL restore state", async ({ page, context }) => {
    const tracker = trackErrors(page)
    await page.goto(`${BASE}/quick-design`)
    await page.waitForLoadState("networkidle")
    await page.getByRole("tab", { name: "Basic Components" }).click()
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByLabel("Company name").fill("Northwind")
    await page.getByRole("button", { name: "Close brand assets" }).click()
    await expect(page.getByText("Northwind").first()).toBeVisible()

    const url = page.url()
    const second = await context.newPage()
    const secondTracker = trackErrors(second)
    await second.goto(url)
    await second.waitForLoadState("networkidle")
    await expect(second.getByRole("tab", { name: "Basic Components" })).toHaveAttribute("aria-selected", "true")
    await expect(second.getByText("Northwind").first()).toBeVisible()
    await expectHealthy(tracker)
    await expectHealthy(secondTracker)
    await second.close()
  })

  test("keyboard can open Export and dismiss with Escape", async ({ page }) => {
    const tracker = trackErrors(page)
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")
    await page.getByRole("button", { name: "Export" }).focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("heading", { name: /Unlock export|Export checkout coming soon/ })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expectHealthy(tracker)
  })

  test("customise opens after selecting a preview heading", async ({ page }) => {
    const tracker = trackErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")
    const dismiss = page.getByRole("button", { name: "Dismiss getting started" })
    if (await dismiss.count()) await dismiss.click()
    const heading = page.locator('[aria-label="Preview canvas"] [title="Edit Page heading"]')
    await expect(heading).toBeVisible()
    await heading.click()
    await expect(page.locator('[aria-label="Customise panel"]')).toContainText("Page heading")
    await expect(page.locator('[aria-label="Customise panel"]')).toContainText(/Typography/)
    await expectHealthy(tracker)
  })

  test("Website, App, and Components previews switch without a blank canvas", async ({ page }) => {
    const tracker = trackErrors(page)
    await page.goto(`${BASE}/quick-design`)
    await page.waitForLoadState("networkidle")
    for (const tab of ["Basic Website", "Basic App", "Basic Components"] as const) {
      await page.getByRole("tab", { name: tab }).click()
      await expect(page.getByRole("tab", { name: tab })).toHaveAttribute("aria-selected", "true")
      await expect(page.getByRole("tabpanel")).toBeVisible()
      await expect(page.getByRole("tabpanel")).not.toHaveText(/^\s*$/)
    }
    await expectHealthy(tracker)
  })
})
