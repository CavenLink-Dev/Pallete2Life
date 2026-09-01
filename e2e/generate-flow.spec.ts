import { test, expect } from "@playwright/test"

const BASE = "http://localhost:4173"

test.describe("Generate Design journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test("quick path reaches interactive preview within 30 seconds", async ({ page }) => {
    await page.goto(`${BASE}/generate`)
    await page.getByRole("button", { name: "Preview My Palette" }).click()
    await expect(page).toHaveURL(new RegExp(`${BASE}/quick-design`))
    await page.waitForLoadState("networkidle")
    await expect(page.getByRole("tab", { name: "Basic Website" })).toBeVisible()
    await expect(page.getByRole("tabpanel")).toBeVisible()
  })

  test("full path requires explicit apply and preserves cancel", async ({ page }) => {
    await page.goto(`${BASE}/generate`)
    await page.getByRole("button", { name: "Build a Full Design System" }).click()
    await page.getByRole("button", { name: "Website" }).click()
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("heading", { name: "Pick a starting layout" })).toBeVisible()
    const applyButton = page.getByRole("button", { name: "Apply template" })
    await expect(applyButton).toBeDisabled()

    await page.getByRole("button", { name: /Simple Landing Page/i }).first().click()
    await expect(applyButton).toBeEnabled()

    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByRole("heading", { name: "What do you want to design?" })).toBeVisible()
  })

  test("category selection only filters templates", async ({ page }) => {
    await page.goto(`${BASE}/generate`)
    await page.getByRole("button", { name: "Build a Full Design System" }).click()
    await page.getByRole("button", { name: "App" }).click()
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByText("Live preview").first()).toBeVisible()
    await expect(page.getByText("Simple Landing Page")).toHaveCount(0)
  })

  test("returning user skips generate onboarding", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("pallet-preview:generate-flow-v1", JSON.stringify({ completed: true })))
    await page.goto(`${BASE}/generate`)
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(new RegExp(`${BASE}/app`))
  })
})

test.describe("Builder template switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")
  })

  test("browsing templates does not apply until confirmed", async ({ page }) => {
    const before = await page.locator('[aria-label="Preview canvas"]').innerText()

    await page.getByRole("button", { name: "Change template" }).click()
    await page.getByRole("button", { name: "Application", exact: true }).click()
    await expect(page.getByRole("button", { name: "Apply template" })).toBeEnabled()

    const during = await page.locator('[aria-label="Preview canvas"]').innerText()
    expect(during).toBe(before)

    await page.getByRole("button", { name: "Cancel" }).click()
    const after = await page.locator('[aria-label="Preview canvas"]').innerText()
    expect(after).toBe(before)
  })

  test("applied template change is undoable", async ({ page }) => {
    await page.getByRole("button", { name: "Change template" }).click()
    await page.getByRole("button", { name: "Application", exact: true }).click()
    await page.getByRole("button", { name: "Apply template" }).click()

    await page.getByRole("button", { name: "Undo" }).click()
    await page.getByRole("button", { name: "Change template" }).click()
    await expect(page.getByRole("button", { name: "Website", exact: true })).toHaveAttribute("aria-pressed", "true")
  })
})
