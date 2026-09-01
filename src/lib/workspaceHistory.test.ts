import { describe, it, expect } from "vitest"
import { createHistoryState, MAX_HISTORY, type WorkspaceSnapshot } from "./workspaceHistory"

function makeSnapshot(overrides: Partial<WorkspaceSnapshot> = {}): WorkspaceSnapshot {
  return {
    palette: [{ id: "a", name: "Red", hex: "#FF0000" }],
    selection: { group: "website", sub: "landing-page" },
    templateByType: {},
    elementOverrides: {},
    roleBindings: {},
    unassignedRoleSwatchIds: [],
    brand: { name: "HueSet", logo: null, symbol: null },
    ...overrides,
  }
}

describe("createHistoryState", () => {
  it("starts with no undo or redo available", () => {
    const initial = makeSnapshot()
    const history = createHistoryState(initial)

    expect(history.snapshot).toEqual(initial)
    expect(history.undoStack).toEqual([])
    expect(history.redoStack).toEqual([])
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)
  })

  it("records changes on pushSnapshot and supports undo/redo", () => {
    const initial = makeSnapshot()
    let history = createHistoryState(initial)

    const changed = makeSnapshot({
      palette: [{ id: "a", name: "Blue", hex: "#0000FF" }],
    })

    history = history.pushSnapshot(changed)
    expect(history.snapshot).toEqual(changed)
    expect(history.canUndo).toBe(true)
    expect(history.canRedo).toBe(false)
    expect(history.undoStack).toHaveLength(1)
    expect(history.undoStack[0]).toEqual(initial)

    history = history.undo()
    expect(history.snapshot).toEqual(initial)
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(true)

    history = history.redo()
    expect(history.snapshot).toEqual(changed)
    expect(history.canUndo).toBe(true)
    expect(history.canRedo).toBe(false)
  })

  it("ignores pushSnapshot when the snapshot is unchanged", () => {
    const initial = makeSnapshot()
    let history = createHistoryState(initial)

    history = history.pushSnapshot(makeSnapshot())
    expect(history.canUndo).toBe(false)
    expect(history.undoStack).toHaveLength(0)
  })

  it("withSkipHistory bypasses history recording", () => {
    const initial = makeSnapshot()
    let history = createHistoryState(initial)

    const skipped = makeSnapshot({
      palette: [{ id: "b", name: "Green", hex: "#00FF00" }],
    })

    history.withSkipHistory(() => {
      history = history.pushSnapshot(skipped)
    })

    expect(history.snapshot).toEqual(skipped)
    expect(history.canUndo).toBe(false)
    expect(history.undoStack).toHaveLength(0)
  })

  it("caps undo stack at MAX_HISTORY", () => {
    const initial = makeSnapshot({ palette: [{ id: "0", name: "Start", hex: "#000000" }] })
    let history = createHistoryState(initial)

    for (let i = 1; i <= MAX_HISTORY + 5; i += 1) {
      history = history.pushSnapshot(
        makeSnapshot({ palette: [{ id: String(i), name: `Color ${i}`, hex: "#111111" }] }),
      )
    }

    expect(history.undoStack).toHaveLength(MAX_HISTORY)
    expect(history.undoStack[0].palette[0]?.id).toBe("5")
  })
})
