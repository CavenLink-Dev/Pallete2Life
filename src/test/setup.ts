// Global test setup — runs before each test file.
// Vitest uses jsdom (configured in vite.config.ts), so window, localStorage,
// and sessionStorage are all available.
import { afterEach, expect } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => {
  cleanup()
})

expect.extend({
  toHaveFocus(received: unknown) {
    const pass = received === document.activeElement
    return {
      pass,
      message: () => pass
        ? "expected element not to have focus"
        : `expected element to have focus, but active element was ${document.activeElement?.outerHTML ?? "null"}`,
    }
  },
})

declare module "vitest" {
  interface Assertion<T> {
    toHaveFocus(): T
  }
}
