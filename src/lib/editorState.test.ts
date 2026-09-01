import { describe, it, expect, beforeEach } from "vitest"
import { createHistoryState } from "./workspaceHistory"
import { saveWorkspaceProject, loadWorkspace, createDefaultProject } from "./workspaceStore"
import { createSwatch, updateSwatchHex } from "./color"

beforeEach(() => {
  localStorage.clear()
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", "/")
  }
})

describe("refresh persistence", () => {
  it("restores manual color names and autoNamed flag after save/load", () => {
    const project = createDefaultProject()
    project.palette = [
      { id: "a1", name: "My Brand Coral", hex: "#FF0000", autoNamed: false },
      ...project.palette.slice(1),
    ]
    project.preferences = { paletteOpen: true, customiseOpen: false }
    saveWorkspaceProject(project)

    const { project: loaded } = loadWorkspace()
    expect(loaded.palette[0].name).toBe("My Brand Coral")
    expect(loaded.palette[0].autoNamed).toBe(false)
    expect(loaded.preferences.customiseOpen).toBe(false)
  })

  it("merges hash hex without erasing manual names", () => {
    const project = createDefaultProject()
    project.palette[0] = { ...project.palette[0], name: "Kept Name", hex: "#AABBCC", autoNamed: false }
    saveWorkspaceProject(project)

    window.history.replaceState(null, "", "/#p=112233,4F9A94,F46B5E,F6C453,102A43")
    const { project: loaded } = loadWorkspace()
    expect(loaded.palette[0].hex).toBe("#112233")
    expect(loaded.palette[0].name).toBe("Kept Name")
    expect(loaded.palette[0].id).toBe(project.palette[0].id)
  })
})

describe("undo/redo integration", () => {
  it("reverses add colour and role binding changes", () => {
    const initial = createDefaultProject()
    const history = createHistoryState({
      palette: initial.palette,
      selection: initial.selection,
      templateByType: initial.templateByType,
      elementOverrides: initial.elementOverrides,
      roleBindings: initial.roleBindings,
      unassignedRoleSwatchIds: initial.unassignedRoleSwatchIds,
      brand: initial.brand,
    })

    const added = createSwatch("#ABCDEF", initial.palette.length)
    let state = history.pushSnapshot({
      ...history.snapshot,
      palette: [...history.snapshot.palette, added],
    })
    expect(state.snapshot.palette).toHaveLength(initial.palette.length + 1)

    state = state.undo()
    expect(state.snapshot.palette).toHaveLength(initial.palette.length)

    const swatchId = initial.palette[2].id
    state = state.pushSnapshot({
      ...state.snapshot,
      roleBindings: { "Brand Primary": swatchId },
    })
    expect(state.snapshot.roleBindings["Brand Primary"]).toBe(swatchId)

    state = state.undo()
    expect(state.snapshot.roleBindings["Brand Primary"]).toBeUndefined()
  })

  it("regenerates auto names on hex change but keeps manual names", () => {
    const manual = { id: "m1", name: "Custom", hex: "#FF0000", autoNamed: false as const }
    const auto = { id: "a1", name: "Deep Blue", hex: "#0000FF", autoNamed: true as const }

    expect(updateSwatchHex(manual, "#00FF00").name).toBe("Custom")
    expect(updateSwatchHex(auto, "#00FF00").name).not.toBe("Deep Blue")
  })
})
