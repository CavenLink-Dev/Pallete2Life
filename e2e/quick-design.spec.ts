import { test, expect, type Page } from "@playwright/test"

const BASE = "http://localhost:4173"
const DEFAULT_ENTITLEMENT = {
  isPro: false,
  firstExportPaid: false,
  firstExportDesignId: null,
  firstFlowComplete: false,
  account: null,
}

function trackErrors(page: Page) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []

  page.on("pageerror", (error) => {
    pageErrors.push(String(error))
  })
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text())
    }
  })

  return { pageErrors, consoleErrors }
}

async function expectNoUnexpectedErrors(tracker: ReturnType<typeof trackErrors>) {
  expect(tracker.pageErrors, `Unexpected page errors: ${tracker.pageErrors.join("; ")}`).toHaveLength(0)
  expect(tracker.consoleErrors, `Unexpected console errors: ${tracker.consoleErrors.join("; ")}`).toHaveLength(0)
}

async function clearBrowserState(page: Page) {
  await page.goto(`${BASE}/`)
  await page.evaluate((entitlement) => {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem("pallet-preview:ent:v3", JSON.stringify(entitlement))
  }, DEFAULT_ENTITLEMENT)
}

async function openQuickDesign(page: Page) {
  await page.goto(`${BASE}/quick-design`)
  await page.waitForLoadState("networkidle")
  await expect(page.getByRole("heading", { name: "Quick Design" })).toBeVisible()
}

async function setHex(page: Page, index: number, hex: string) {
  const input = page.getByLabel("Hex colour").nth(index)
  await input.fill(hex)
  await input.blur()
}

async function setColourName(page: Page, index: number, name: string) {
  const input = page.getByLabel("Colour name").nth(index)
  await input.fill(name)
  await input.blur()
}

test.describe("Quick Design acceptance", () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page)
  })

  test("full state survives refresh exactly", async ({ page }) => {
    const tracker = trackErrors(page)
    await openQuickDesign(page)

    await setHex(page, 0, "#123456")
    await setColourName(page, 0, "Brand Blue")
    await page.getByRole("button", { name: "Lock Brand Blue" }).click()
    await page.getByLabel("Text colour").selectOption({ index: 0 })
    await page.getByRole("tab", { name: "Basic App" }).click()
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByLabel("Company name").fill("Acme Labs")
    await page.getByRole("button", { name: "Close brand assets" }).click()

    await page.waitForTimeout(250)
    await page.reload()
    await page.waitForLoadState("networkidle")

    await expect(page.getByLabel("Colour name").first()).toHaveValue("Brand Blue")
    await expect(page.getByLabel("Hex colour").first()).toHaveValue("#123456")
    await expect(page.getByRole("button", { name: "Unlock Brand Blue" })).toBeVisible()
    await expect(page.getByLabel("Text colour").locator("option:checked")).toContainText("Brand Blue (#123456)")
    await expect(page.getByRole("tab", { name: "Basic App" })).toHaveAttribute("aria-selected", "true")
    await expect(page.getByText("Acme Labs").first()).toBeVisible()

    await expectNoUnexpectedErrors(tracker)
  })

  test("randomise preserves a locked colour", async ({ page }) => {
    const tracker = trackErrors(page)
    await openQuickDesign(page)

    await setHex(page, 0, "#224466")
    await page.getByRole("button", { name: /^Lock / }).first().click()
    await page.getByRole("button", { name: "Randomise" }).click()

    await expect(page.getByLabel("Hex colour").first()).toHaveValue("#224466")

    await expectNoUnexpectedErrors(tracker)
  })

  test("undo and redo visible controls restore palette and role changes", async ({ page }) => {
    const tracker = trackErrors(page)
    await openQuickDesign(page)

    const textRole = page.getByLabel("Text colour")
    const initialRole = await textRole.locator("option:checked").textContent()
    const initialHex = await page.getByLabel("Hex colour").first().inputValue()

    await textRole.selectOption({ index: 0 })
    await expect(textRole.locator("option:checked")).toContainText("Pale Sky Blue")

    await page.getByRole("button", { name: "Undo" }).click()
    await expect(textRole.locator("option:checked")).toHaveText(initialRole ?? "")

    await page.getByRole("button", { name: "Redo" }).click()
    await expect(textRole.locator("option:checked")).toContainText("Pale Sky Blue")

    await setHex(page, 0, "#112233")
    await expect(page.getByLabel("Hex colour").first()).toHaveValue("#112233")

    await page.getByRole("button", { name: "Undo" }).click()
    await expect(page.getByLabel("Hex colour").first()).toHaveValue(initialHex)

    await page.getByRole("button", { name: "Redo" }).click()
    await expect(page.getByLabel("Hex colour").first()).toHaveValue("#112233")

    await expectNoUnexpectedErrors(tracker)
  })

  test("reset requires confirmation and undo restores the prior state", async ({ page }) => {
    const tracker = trackErrors(page)
    await openQuickDesign(page)

    await setColourName(page, 0, "Before Reset")
    await page.getByRole("tab", { name: "Basic App" }).click()
    await page.getByRole("button", { name: "Reset", exact: true }).click()
    await expect(page.getByRole("dialog", { name: "Reset your palette?" })).toBeVisible()
    await page.getByRole("button", { name: "Reset palette" }).click()

    await expect(page.getByLabel("Colour name").first()).toHaveValue("Pale Sky Blue")
    await expect(page.getByRole("tab", { name: "Basic Website" })).toHaveAttribute("aria-selected", "true")

    await page.getByRole("button", { name: "Undo" }).click()
    await expect(page.getByLabel("Colour name").first()).toHaveValue("Before Reset")
    await expect(page.getByRole("tab", { name: "Basic App" })).toHaveAttribute("aria-selected", "true")

    await expectNoUnexpectedErrors(tracker)
  })

  test("delete requires confirmation and undo restores the colour", async ({ page }) => {
    const tracker = trackErrors(page)
    await openQuickDesign(page)

    await expect(page.getByLabel("Colour name")).toHaveCount(5)
    await page.getByRole("button", { name: "Delete Pale Sky Blue" }).click()
    await expect(page.getByRole("dialog", { name: "Delete colour?" })).toBeVisible()
    await page.getByRole("button", { name: "Delete colour" }).click()

    await expect(page.getByLabel("Colour name")).toHaveCount(4)

    await page.getByRole("button", { name: "Undo" }).click()
    await expect(page.getByLabel("Colour name")).toHaveCount(5)
    await expect(page.getByLabel("Colour name").first()).toHaveValue("Pale Sky Blue")

    await expectNoUnexpectedErrors(tracker)
  })

  test("accessibility guidance updates and adjust role focuses the matching select", async ({ page }) => {
    const tracker = trackErrors(page)
    await openQuickDesign(page)

    await setHex(page, 0, "#FFFFFF")
    await setHex(page, 3, "#FFFFFF")
    await page.getByLabel("Text colour").selectOption({ index: 0 })

    await expect(page.getByText("Normal text: Poor contrast")).toBeVisible()
    await expect(page.getByText("Darken the text or lighten its background.")).toBeVisible()

    await page.getByRole("button", { name: "Adjust role for Text" }).first().click()
    await expect(page.getByLabel("Text colour")).toBeFocused()

    await expectNoUnexpectedErrors(tracker)
  })

  test("browser back and forward preserve the Quick Design project state", async ({ page }) => {
    const tracker = trackErrors(page)
    await openQuickDesign(page)

    await setColourName(page, 0, "History Blue")
    await page.getByRole("link", { name: "HueSet home" }).click()
    await page.waitForLoadState("networkidle")

    await page.goBack()
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(new RegExp(`${BASE}/quick-design`))
    await expect(page.getByLabel("Colour name").first()).toHaveValue("History Blue")

    await page.goForward()
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(new RegExp(`^${BASE}/?(?:#.*)?$`))

    await page.goBack()
    await page.waitForLoadState("networkidle")
    await expect(page.getByLabel("Colour name").first()).toHaveValue("History Blue")

    await expectNoUnexpectedErrors(tracker)
  })
})
