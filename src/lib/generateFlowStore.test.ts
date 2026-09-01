import { describe, it, expect, beforeEach } from "vitest"
import { hasCompletedFlow, markFlowCompleted, resetFlow } from "./generateFlowStore"

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
    // Write corrupt data directly to the storage key
    const key = "pallet-preview:generate-flow-v1"
    localStorage.setItem(key, "not json{{")
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
