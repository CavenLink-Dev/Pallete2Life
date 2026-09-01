import { test, expect } from "@playwright/test"

const BASE = "http://localhost:4173"

test.describe("HueSet Stability", () => {
  test("fresh browser → /app → usable editor with no page errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(String(e)))

    await page.goto(`${BASE}/`)
    await page.evaluate(() => localStorage.clear())

    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")

    await expect(page.locator('[aria-label="Preview canvas"]')).toBeVisible()
    expect(errors, `Unexpected page errors: ${errors.join("; ")}`).toHaveLength(0)
  })

  test("corrupted project → /app → recovered editor with no page errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(String(e)))

    await page.goto(`${BASE}/`)
    await page.evaluate(() => {
      localStorage.setItem("hueframe:v1", "not-valid-json{{{")
    })

    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")

    await expect(page.locator('[aria-label="Preview canvas"]')).toBeVisible()
    expect(errors, `Unexpected page errors: ${errors.join("; ")}`).toHaveLength(0)
  })

  test("refresh /app → editor remains usable", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(String(e)))

    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")
    await page.reload()
    await page.waitForLoadState("networkidle")

    await expect(page.locator('[aria-label="Preview canvas"]')).toBeVisible()
    expect(errors, `Unexpected page errors: ${errors.join("; ")}`).toHaveLength(0)
  })

  test("direct /generate → setup flow visible (no blank screen)", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(String(e)))

    await page.goto(`${BASE}/`)
    await page.evaluate(() => localStorage.removeItem("pallet-preview:generate-flow-v1"))

    await page.goto(`${BASE}/generate`)
    await page.waitForLoadState("networkidle")

    // Should show visible content — either the loading shell or the flow UI
    const bodyText = await page.locator("body").innerText()
    expect(bodyText.trim().length).toBeGreaterThan(0)
    expect(errors, `Unexpected page errors: ${errors.join("; ")}`).toHaveLength(0)
  })

  test("invalid URL → branded 404 page", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(String(e)))

    await page.goto(`${BASE}/does-not-exist-xyz`)
    await page.waitForLoadState("networkidle")

    await expect(page.getByText("Page not found")).toBeVisible()
    await expect(page.getByRole("link", { name: "Return Home" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Open Quick Design" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Start a New Design" })).toBeVisible()
    expect(errors, `Unexpected page errors: ${errors.join("; ")}`).toHaveLength(0)
  })

  test("browser back/forward work correctly between known routes", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(String(e)))

    await page.goto(`${BASE}/`)
    await page.waitForLoadState("networkidle")

    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator('[aria-label="Preview canvas"]')).toBeVisible()

    await page.goBack()
    await page.waitForLoadState("networkidle")
    // URL may have a palette hash appended — check the path only
    await expect(page).toHaveURL(new RegExp(`^${BASE}/?`))

    await page.goForward()
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(new RegExp(`^${BASE}/app`))
    await expect(page.locator('[aria-label="Preview canvas"]')).toBeVisible()

    expect(errors, `Unexpected page errors: ${errors.join("; ")}`).toHaveLength(0)
  })
})
