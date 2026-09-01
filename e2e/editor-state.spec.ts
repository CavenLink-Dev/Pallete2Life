import { test, expect } from "@playwright/test"

const BASE = "http://localhost:4173"

test.describe("Editor state & interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.evaluate(() => localStorage.clear())
  })

  test("refresh restores a manually edited color name", async ({ page }) => {
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")

    const nameInput = page.locator('input[aria-label^="Name for"]').first()
    await nameInput.fill("My Saved Coral")
    await nameInput.blur()

    await page.reload()
    await page.waitForLoadState("networkidle")

    await expect(page.locator('input[aria-label^="Name for"]').first()).toHaveValue("My Saved Coral")
  })

  test("locked color survives randomise", async ({ page }) => {
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")

    const firstHex = await page.locator("span.font-mono").first().textContent()
    const lockButton = page.getByRole("button", { name: /^Lock / }).first()
    await lockButton.click()

    await page.getByRole("button", { name: "Randomise" }).click()
    await page.waitForTimeout(300)

    await expect(page.locator("span.font-mono").first()).toHaveText(firstHex ?? "")
  })

  test("undo reverses add colour", async ({ page }) => {
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")

    const before = await page.locator('input[aria-label^="Name for"]').count()
    await page.getByRole("button", { name: "Add colour" }).click()
    await expect(page.locator('input[aria-label^="Name for"]')).toHaveCount(before + 1)

    await page.keyboard.press("Meta+z")
    await expect(page.locator('input[aria-label^="Name for"]')).toHaveCount(before)
  })

  test("customise panel does not block preview canvas clicks", async ({ page }) => {
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")

    // Ensure customise is open
    const customiseToggle = page.getByRole("button", { name: /customise/i }).first()
    const pressed = await customiseToggle.getAttribute("aria-pressed")
    if (pressed !== "true") await customiseToggle.click()

    await expect(page.locator('[aria-label="Customise panel"]')).toBeVisible()

    // Click preview canvas area (left of panel) — should not close customise via backdrop
    const canvas = page.locator('[aria-label="Preview canvas"]')
    await canvas.click({ position: { x: 40, y: 40 } })
    await expect(page.locator('[aria-label="Customise panel"]')).toBeVisible()
  })
})
