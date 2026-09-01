import { describe, it, expect } from "vitest"
import {
  applyRoleChange,
  isSingletonRole,
  pruneBindingsForSwatch,
  resolveSwatchRole,
  SINGLETON_ROLES,
  type Swatch,
} from "./color"

const WEBSITE_ROLE_LABELS = [
  "Page Background",
  "Secondary Background",
  "Brand Primary",
  "Secondary",
  "Tertiary",
  "Accent",
  "Heading Text",
  "Body Text",
  "Surface",
  "Border",
] as const

function palette(ids: string[]): Swatch[] {
  return ids.map((id, index) => ({
    id,
    name: `Colour ${index + 1}`,
    hex: `#${String(index).padStart(6, "0")}`,
  }))
}

describe("SINGLETON_ROLES", () => {
  it("treats core layout roles as singleton", () => {
    for (const role of ["Page Background", "Brand Primary", "Heading Text", "Surface", "Border"]) {
      expect(isSingletonRole(role)).toBe(true)
      expect(SINGLETON_ROLES).toContain(role)
    }
  })

  it("does not treat accent family roles as singleton", () => {
    for (const role of ["Accent", "Secondary", "Tertiary"]) {
      expect(isSingletonRole(role)).toBe(false)
    }
  })
})

describe("applyRoleChange", () => {
  it("moves a singleton role from the previous holder to the new swatch", () => {
    const first = applyRoleChange("Brand Primary", "a", {}, [], WEBSITE_ROLE_LABELS)
    const second = applyRoleChange("Brand Primary", "b", first.roleBindings, first.unassignedRoleSwatchIds, WEBSITE_ROLE_LABELS)

    expect(second.roleBindings["Brand Primary"]).toBe("b")
    expect(Object.values(second.roleBindings)).not.toContain("a")
  })

  it("clears existing roles on the swatch before assigning a new one", () => {
    let state = applyRoleChange("Accent", "a", {}, [], WEBSITE_ROLE_LABELS)
    state = applyRoleChange("Secondary", "a", state.roleBindings, state.unassignedRoleSwatchIds, WEBSITE_ROLE_LABELS)

    expect(state.roleBindings.Accent).toBeUndefined()
    expect(state.roleBindings.Secondary).toBe("a")
  })

  it("marks swatch unassigned when role is cleared", () => {
    const state = applyRoleChange("", "a", { Accent: "a" }, [], WEBSITE_ROLE_LABELS)
    expect(state.roleBindings.Accent).toBeUndefined()
    expect(state.unassignedRoleSwatchIds).toContain("a")
  })

  it("removes swatch from unassigned when a role is assigned", () => {
    const state = applyRoleChange("Accent", "a", {}, ["a"], WEBSITE_ROLE_LABELS)
    expect(state.unassignedRoleSwatchIds).not.toContain("a")
    expect(state.roleBindings.Accent).toBe("a")
  })
})

describe("resolveSwatchRole", () => {
  const swatches = palette(["bg", "surface", "brand", "sec", "ter"])

  it("returns explicit binding first", () => {
    const role = resolveSwatchRole("brand", swatches, { "Brand Primary": "brand" }, [], WEBSITE_ROLE_LABELS)
    expect(role).toBe("Brand Primary")
  })

  it("returns empty for explicitly unassigned swatches", () => {
    const role = resolveSwatchRole("sec", swatches, {}, ["sec"], WEBSITE_ROLE_LABELS)
    expect(role).toBe("")
  })

  it("uses index fallback for unbound swatches", () => {
    const role = resolveSwatchRole("bg", swatches, {}, [], WEBSITE_ROLE_LABELS)
    expect(role).toBe("Page Background")
  })

  it("suppresses singleton fallback when role is bound elsewhere", () => {
    const bindings = { "Brand Primary": "brand" }
    const role = resolveSwatchRole("sec", swatches, bindings, [], WEBSITE_ROLE_LABELS)
    expect(role).toBe("Secondary")
  })

  it("allows duplicate non-singleton fallback when role is bound elsewhere", () => {
    const bindings = { Accent: "brand" }
    const accentAtIndex = resolveSwatchRole("brand", swatches, bindings, [], WEBSITE_ROLE_LABELS)
    const accentFallback = resolveSwatchRole("sec", swatches, bindings, [], WEBSITE_ROLE_LABELS)

    expect(accentAtIndex).toBe("Accent")
    expect(accentFallback).toBe("Secondary")
  })

  it("hides singleton index fallback when another swatch holds the binding", () => {
    const bindings = { "Page Background": "surface" }
    const role = resolveSwatchRole("bg", swatches, bindings, [], WEBSITE_ROLE_LABELS)
    expect(role).toBe("")
  })
})

describe("pruneBindingsForSwatch", () => {
  it("removes bindings and unassigned entries for deleted swatch", () => {
    const result = pruneBindingsForSwatch(
      "a",
      { "Brand Primary": "a", Accent: "b" },
      ["a", "c"],
    )

    expect(result.roleBindings).toEqual({ Accent: "b" })
    expect(result.unassignedRoleSwatchIds).toEqual(["c"])
  })
})
