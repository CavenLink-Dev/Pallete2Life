import { test, expect, type Page } from "@playwright/test"

const BASE = "http://localhost:4173"
const WIDTHS = [320, 375, 768, 1024, 1440] as const

async function pageOverflowsHorizontally(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
}

function contrastFromCssColors(fg: string, bg: string) {
  const parse = (color: string) => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [0, 0, 0]
  }
  const linear = (value: number) => {
    const channel = value / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }
  const luminance = (color: string) => {
    const [r, g, b] = parse(color)
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  }
  const lighter = Math.max(luminance(fg), luminance(bg))
  const darker = Math.min(luminance(fg), luminance(bg))
  return (lighter + 0.05) / (darker + 0.05)
}

test.describe("Accessibility and responsive UX", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.evaluate(() => localStorage.clear())
  })

  test("primary landing CTAs meet 4.5:1 contrast for white text", async ({ page }) => {
    await page.goto(`${BASE}/`)
    const contrast = await page.locator(".home-btn-primary").first().evaluate((element) => {
      const styles = getComputedStyle(element)
      return { color: styles.color, background: styles.backgroundColor }
    })
    expect(contrastFromCssColors(contrast.color, contrast.background)).toBeGreaterThanOrEqual(4.5)
  })

  test("Escape closes a confirmation dialog and restores focus", async ({ page }) => {
    await page.goto(`${BASE}/quick-design`)
    const reset = page.getByRole("button", { name: "Reset" })
    await reset.click()
    await expect(page.getByRole("dialog", { name: "Reset your palette?" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(reset).toBeFocused()
  })

  test("opening the export paywall does not mark Export complete", async ({ page }) => {
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")
    await page.getByRole("button", { name: "Export" }).click()
    await expect(page.getByRole("heading", { name: "Unlock export" })).toBeVisible()
    const done = await page.evaluate(() => {
      const raw = localStorage.getItem("pallet-preview:onboarding-v1")
      if (!raw) return [] as string[]
      try {
        return (JSON.parse(raw).done ?? []) as string[]
      } catch {
        return [] as string[]
      }
    })
    expect(done).not.toContain("export")
  })

  test("Quick Design decorative preview controls are not buttons", async ({ page }) => {
    await page.goto(`${BASE}/quick-design`)
    await expect(page.getByRole("button", { name: "Start a project" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Create project" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Primary" })).toHaveCount(0)
  })

  test("workspace Full screen control has an accessible name", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE}/app`)
    await page.waitForLoadState("networkidle")
    const fullScreen = page.getByRole("button", { name: "Full screen" })
    if (await fullScreen.count()) {
      await expect(fullScreen.first()).toBeVisible()
    } else {
      await page.getByRole("button", { name: "More tools" }).click()
      await expect(page.getByRole("menuitem", { name: "Full screen" })).toBeVisible()
    }
  })

  for (const width of WIDTHS) {
    test(`primary tasks stay on-screen at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 })
      await page.goto(`${BASE}/app`)
      await page.waitForLoadState("networkidle")
      expect(await pageOverflowsHorizontally(page)).toBeFalsy()
      await expect(page.getByRole("button", { name: "Export" })).toBeVisible()
      await expect(page.locator('[aria-label="Preview canvas"]')).toBeVisible()

      await page.goto(`${BASE}/quick-design`)
      expect(await pageOverflowsHorizontally(page)).toBeFalsy()
      await expect(page.getByRole("button", { name: "Add colour" })).toBeVisible()

      await page.goto(`${BASE}/`)
      expect(await pageOverflowsHorizontally(page)).toBeFalsy()
      await expect(page.locator(".home-btn-primary").first()).toBeVisible()
    })
  }
})
