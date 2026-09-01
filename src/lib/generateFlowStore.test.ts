import { describe, it, expect, beforeEach } from "vitest"
import { hasCompletedFlow, hasSeenGuide, markFlowCompleted, markGuideSeen, resetFlow } from "./generateFlowStore"

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe("hasCompletedFlow", () => {
  it("returns false on fresh storage", () => {
    expect(hasCompletedFlow()).toBe(false)
  })

  it("returns true after markFlowCompleted", () => {
    markFlowCompleted()
    expect(hasCompletedFlow()).toBe(true)
  })

  it("returns false on corrupt JSON without throwing", () => {
    localStorage.setItem("pallet-preview:generate-flow-v1", "not json{{")
    expect(() => hasCompletedFlow()).not.toThrow()
    expect(hasCompletedFlow()).toBe(false)
  })

  it("returns false when completed flag is explicitly false", () => {
    localStorage.setItem("pallet-preview:generate-flow-v1", JSON.stringify({ completed: false }))
    expect(hasCompletedFlow()).toBe(false)
  })
})

describe("resetFlow", () => {
  it("makes hasCompletedFlow return false after a completed state", () => {
    markFlowCompleted()
    expect(hasCompletedFlow()).toBe(true)
    resetFlow()
    expect(hasCompletedFlow()).toBe(false)
  })
})

describe("returning user onboarding flags", () => {
  it("skips guide walkthrough after first view", () => {
    expect(hasSeenGuide()).toBe(false)
    markGuideSeen()
    expect(hasSeenGuide()).toBe(true)
  })
})
