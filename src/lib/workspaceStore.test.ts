import { describe, it, expect, beforeEach } from "vitest"
import {
  loadWorkspace,
  createDefaultProject,
  dedupeSingletonRoles,
  saveWorkspaceProject,
  projectToPersistedFields,
} from "./workspaceStore"

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
    expect(p.schemaVersion).toBe(2)
    expect(p.palette.length).toBeGreaterThan(0)
    expect(p.selection.group).toBe("website")
    expect(p.selection.sub).toBe("landing-page")
    expect(p.brand.name).toBe("HueSet")
    expect(p.designId.length).toBeGreaterThan(0)
    expect(p.preferences).toEqual({ paletteOpen: true, customiseOpen: true, quickPreview: "website" })
  })
})

describe("dedupeSingletonRoles", () => {
  it("drops duplicate singleton role bindings with different casing", () => {
    const issues: string[] = []
    const result = dedupeSingletonRoles(
      {
        "Brand Primary": "a",
        "brand primary": "b",
        Accent: "c",
      },
      issues,
    )
    expect(result["Brand Primary"]).toBe("a")
    expect(result["brand primary"]).toBeUndefined()
    expect(result.Accent).toBe("c")
    expect(issues.some((issue) => issue.includes("Duplicate singleton role"))).toBe(true)
  })
})

describe("projectToPersistedFields", () => {
  it("includes schemaVersion 2 and preferences", () => {
    const project = createDefaultProject()
    project.preferences.quickPreview = "components"
    const fields = projectToPersistedFields(project)
    expect(fields.schemaVersion).toBe(2)
    expect(fields.preferences).toEqual({ paletteOpen: true, customiseOpen: true, quickPreview: "components" })
  })
})

describe("saveWorkspaceProject", () => {
  it("writes the full project atomically", () => {
    const project = createDefaultProject()
    project.preferences = { paletteOpen: false, customiseOpen: true, quickPreview: "app" }
    saveWorkspaceProject(project)
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}")
    expect(raw.schemaVersion).toBe(2)
    expect(raw.preferences).toEqual({ paletteOpen: false, customiseOpen: true, quickPreview: "app" })
  })
})

describe("loadWorkspace — fresh load", () => {
  it("returns defaults with no issues on empty storage", () => {
    const { project, recovered, issues } = loadWorkspace()
    expect(project.palette.length).toBeGreaterThan(0)
    expect(project.selection.group).toBe("website")
    expect(project.selection.sub).toBe("landing-page")
    expect(project.designId.length).toBeGreaterThan(0)
    expect(project.schemaVersion).toBe(2)
    expect(project.preferences).toEqual({ paletteOpen: true, customiseOpen: true, quickPreview: "website" })
    expect(recovered).toBe(false)
    expect(issues).toHaveLength(0)
  })
})

describe("loadWorkspace — valid stored data", () => {
  it("preserves a valid stored palette and brand", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        schemaVersion: 2,
        palette: [{ id: "abc", name: "Test Red", hex: "#FF0000" }],
        brand: { name: "ACME Corp", logo: null, symbol: null },
        selection: { group: "website", sub: "landing-page" },
        preferences: { paletteOpen: false, customiseOpen: false, quickPreview: "app" },
      }),
    )
    const { project } = loadWorkspace()
    expect(project.palette[0].hex).toBe("#FF0000")
    expect(project.brand.name).toBe("ACME Corp")
    expect(project.preferences).toEqual({ paletteOpen: false, customiseOpen: false, quickPreview: "app" })
  })

  it("defaults missing quick preview to website without invalidating builder preferences", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        schemaVersion: 2,
        selection: { group: "website", sub: "landing-page" },
        preferences: { paletteOpen: false, customiseOpen: false },
      }),
    )
    const { project, recovered, issues } = loadWorkspace()
    expect(project.preferences).toEqual({ paletteOpen: false, customiseOpen: false, quickPreview: "website" })
    expect(recovered).toBe(false)
    expect(issues).toEqual([])
  })

  it("merges hash palette into stored palette", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        schemaVersion: 2,
        palette: [{ id: "abc", name: "Custom", hex: "#2060E0", autoNamed: false }],
        selection: { group: "website", sub: "landing-page" },
      }),
    )
    window.history.replaceState(null, "", "/#p=00FF00")
    const { project } = loadWorkspace()
    expect(project.palette[0].id).toBe("abc")
    expect(project.palette[0].name).toBe("Custom")
    expect(project.palette[0].hex).toBe("#00FF00")
  })

  it("drops role bindings that reference unknown swatch ids", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        schemaVersion: 2,
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

describe("loadWorkspace — schema migration", () => {
  it("migrates v1 workspaces to v2 with default preferences", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        palette: [{ id: "abc", name: "Test", hex: "#AABBCC" }],
        selection: { group: "website", sub: "landing-page" },
      }),
    )
    const { project, recovered, issues } = loadWorkspace()
    expect(project.schemaVersion).toBe(2)
    expect(project.preferences).toEqual({ paletteOpen: true, customiseOpen: true, quickPreview: "website" })
    expect(recovered).toBe(true)
    expect(issues.some((issue) => issue.includes("schema v1 to v2"))).toBe(true)
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

  it("migrates legacy liveRoles into roleBindings", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        schemaVersion: 2,
        palette: [{ id: "a1", name: "A", hex: "#AABBCC" }],
        liveRoles: { background: "a1", button: "a1" },
        selection: { group: "website", sub: "landing-page" },
      }),
    )
    const { project, recovered } = loadWorkspace()
    expect(project.roleBindings["Page Background"]).toBe("a1")
    expect(project.roleBindings["App Background"]).toBe("a1")
    expect(project.roleBindings["Brand Primary"]).toBe("a1")
    expect(recovered).toBe(true)
  })

  it("repairs an invalid quick preview preference", () => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        schemaVersion: 2,
        selection: { group: "website", sub: "landing-page" },
        preferences: { paletteOpen: true, customiseOpen: true, quickPreview: "tablet" },
      }),
    )
    const { project, recovered, issues } = loadWorkspace()
    expect(project.preferences).toEqual({ paletteOpen: true, customiseOpen: true, quickPreview: "website" })
    expect(recovered).toBe(true)
    expect(issues.some((issue) => issue.includes("quick preview"))).toBe(true)
  })
})
