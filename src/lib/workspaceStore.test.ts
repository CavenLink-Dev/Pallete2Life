import { describe, it, expect, beforeEach } from "vitest"
import { loadWorkspace, createDefaultProject } from "./workspaceStore"

const STORE_KEY = "hueframe:v1"

beforeEach(() => {
  localStorage.clear()
  // Clear any palette hash from the URL
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", "/")
  }
})

describe("createDefaultProject", () => {
  it("returns a project with all required fields", () => {
    const p = createDefaultProject()
    expect(p.schemaVersion).toBe(1)
    expect(p.palette.length).toBeGreaterThan(0)
    expect(p.selection.group).toBe("website")
    expect(p.selection.sub).toBe("landing-page")
    expect(p.brand.name).toBe("HueSet")
    expect(p.designId.length).toBeGreaterThan(0)
  })
})

describe("loadWorkspace — fresh load", () => {
  it("returns defaults with no issues on empty storage", () => {
    const { project, recovered, issues } = loadWorkspace()
    expect(project.palette.length).toBeGreaterThan(0)
    expect(project.selection.group).toBe("website")
    expect(project.selection.sub).toBe("landing-page")
    expect(project.designId.length).toBeGreaterThan(0)
    expect(recovered).toBe(false)
    expect(issues).toHaveLength(0)
  })
})

describe("loadWorkspace — valid stored data", () => {
  it("preserves a valid stored palette and brand", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        palette: [{ id: "abc", name: "Test Red", hex: "#FF0000" }],
        brand: { name: "ACME Corp", logo: null, symbol: null },
        selection: { group: "website", sub: "landing-page" },
      }),
    )
    const { project } = loadWorkspace()
    expect(project.palette[0].hex).toBe("#FF0000")
    expect(project.brand.name).toBe("ACME Corp")
  })

  it("drops role bindings that reference unknown swatch ids", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        palette: [{ id: "real-id", name: "A", hex: "#AABBCC" }],
        roleBindings: { "Brand Primary": "real-id", Accent: "ghost-id" },
        selection: { group: "website", sub: "landing-page" },
      }),
    )
    const { project, issues } = loadWorkspace()
    expect(project.roleBindings["Brand Primary"]).toBe("real-id")
    expect(project.roleBindings["Accent"]).toBeUndefined()
    expect(issues.some((i) => i.includes("ghost-id"))).toBe(true)
  })
})

describe("loadWorkspace — corrupt / incomplete data", () => {
  it("recovers from a completely corrupt JSON blob", () => {
    localStorage.setItem(STORE_KEY, "not valid json{{{")
    const { project, recovered, issues } = loadWorkspace()
    expect(recovered).toBe(true)
    expect(issues.length).toBeGreaterThan(0)
    expect(project.palette.length).toBeGreaterThan(0)
    expect(project.selection.group).toBe("website")
  })

  it("falls back to default selection on an unknown group/sub", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ selection: { group: "unknown-group", sub: "thing" } }),
    )
    const { project, recovered } = loadWorkspace()
    expect(project.selection.group).toBe("website")
    expect(project.selection.sub).toBe("landing-page")
    expect(recovered).toBe(true)
  })

  it("returns a non-empty palette when the stored palette is an empty array", () => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ palette: [] }))
    const { project } = loadWorkspace()
    expect(project.palette.length).toBeGreaterThan(0)
  })

  it("returns a non-empty palette when all stored items are malformed", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ palette: [{ bad: "data" }, { also: "bad" }] }),
    )
    const { project } = loadWorkspace()
    expect(project.palette.length).toBeGreaterThan(0)
    expect(project.palette[0]).toHaveProperty("hex")
  })

  it("strips template ids that are not in the asset registry", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        selection: { group: "website", sub: "landing-page" },
        templateByType: { "website/landing-page": "nonexistent-template-xyz" },
      }),
    )
    const { project } = loadWorkspace()
    // Should not contain the bogus id; should contain a valid fallback
    expect(project.templateByType["website/landing-page"]).not.toBe("nonexistent-template-xyz")
    expect(typeof project.templateByType["website/landing-page"]).toBe("string")
  })

  it("renames legacy 'Palette Preview' brand name to 'HueSet'", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        brand: { name: "Palette Preview", logo: null, symbol: null },
        selection: { group: "website", sub: "landing-page" },
      }),
    )
    const { project } = loadWorkspace()
    expect(project.brand.name).toBe("HueSet")
  })
})
