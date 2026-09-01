import { beforeEach, describe, expect, it } from "vitest"
import {
  canExport,
  canUseFeature,
  canUseWorkspace,
  completeFirstFlowInStore,
  isFirstFlowComplete,
  needsExportPaywall,
  needsPro,
  mockPayFirstExport,
  mockSubscribePro,
  PAYMENTS_ENABLED,
  PLAN_FEATURES,
  PRICING,
  type Entitlement,
} from "./entitlement"

const fresh: Entitlement = {
  isPro: false,
  firstExportPaid: false,
  firstExportDesignId: null,
  firstFlowComplete: false,
  account: null,
}

beforeEach(() => {
  localStorage.clear()
})

describe("entitlement plans", () => {
  it("stores checkout amounts in cents", () => {
    expect(PRICING.FIRST_EXPORT_CENTS).toBe(99)
    expect(PRICING.PRO_MONTHLY_CENTS).toBe(1499)
    expect(PRICING.firstExport.label).toBe("$0.99")
    expect(PRICING.pro.label).toBe("$14.99")
  })

  it("lists brand assets and full screen on the free plan", () => {
    expect(PLAN_FEATURES.free).toContain("brandAssets")
    expect(PLAN_FEATURES.free).toContain("fullScreen")
  })

  it("does not list brand assets or full screen as pro-only", () => {
    expect(PLAN_FEATURES.pro).not.toContain("brandAssets")
    expect(PLAN_FEATURES.pro).not.toContain("fullScreen")
  })
})

describe("entitlement runtime access", () => {
  it("allows free features regardless of plan state", () => {
    expect(canUseFeature(fresh, "brandAssets")).toBe(true)
    expect(canUseFeature(fresh, "fullScreen")).toBe(true)
  })

  it("blocks second opinion without pro", () => {
    expect(canUseFeature(fresh, "secondOpinion")).toBe(false)
  })

  it("blocks export code when payments are disabled", () => {
    expect(canUseFeature(fresh, "exportCode", "design-1")).toBe(false)
  })
})

describe("payments flag", () => {
  it("defaults to disabled in tests", () => {
    expect(PAYMENTS_ENABLED).toBe(false)
  })

  it("does not apply paywalls when payments are disabled", () => {
    const complete = { ...fresh, firstFlowComplete: true }
    expect(needsPro(complete)).toBe(false)
    expect(needsExportPaywall(fresh)).toBe(false)
    expect(canExport(fresh, "design-1")).toBe(false)
  })

  it("does not mutate entitlement via mock checkout when payments are disabled", () => {
    expect(mockPayFirstExport(fresh, "d1")).toEqual(fresh)
    expect(mockSubscribePro(fresh)).toEqual(fresh)
  })
})

describe("workspace access after first flow", () => {
  it("requires pro when first flow is complete and user is not pro", () => {
    const complete = { ...fresh, firstFlowComplete: true }
    expect(canUseWorkspace(complete)).toBe(false)
    expect(isFirstFlowComplete(complete)).toBe(true)
  })

  it("syncs generate-flow completion into entitlement storage", () => {
    localStorage.setItem("pallet-preview:generate-flow-v1", JSON.stringify({ completed: true }))
    const loaded = completeFirstFlowInStore()
    expect(loaded.firstFlowComplete).toBe(true)
  })
})
