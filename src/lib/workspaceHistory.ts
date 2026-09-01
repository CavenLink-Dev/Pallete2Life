import { type RoleBindings, type Swatch } from "./color"
import type { Brand } from "../components/PreviewCtx"
import type { ElementOverrides } from "./designTokens"

export const MAX_HISTORY = 40

export type WorkspaceSnapshot = {
  palette: Swatch[]
  selection: { group: string; sub: string }
  templateByType: Record<string, string>
  elementOverrides: ElementOverrides
  roleBindings: RoleBindings
  unassignedRoleSwatchIds: string[]
  brand: Brand
}

export type HistoryState = {
  snapshot: WorkspaceSnapshot
  undoStack: WorkspaceSnapshot[]
  redoStack: WorkspaceSnapshot[]
  canUndo: boolean
  canRedo: boolean
  pushSnapshot: (next: WorkspaceSnapshot) => HistoryState
  undo: () => HistoryState
  redo: () => HistoryState
  withSkipHistory: <T>(fn: () => T) => T
}

function snapshotsEqual(a: WorkspaceSnapshot, b: WorkspaceSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function createHistoryState(initial: WorkspaceSnapshot): HistoryState {
  let snapshot = initial
  let undoStack: WorkspaceSnapshot[] = []
  let redoStack: WorkspaceSnapshot[] = []
  let skipHistoryDepth = 0

  function buildState(): HistoryState {
    return {
      snapshot,
      undoStack: [...undoStack],
      redoStack: [...redoStack],
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      pushSnapshot,
      undo,
      redo,
      withSkipHistory,
    }
  }

  function withSkipHistory<T>(fn: () => T): T {
    skipHistoryDepth += 1
    try {
      return fn()
    } finally {
      skipHistoryDepth -= 1
    }
  }

  function pushSnapshot(next: WorkspaceSnapshot): HistoryState {
    if (skipHistoryDepth > 0) {
      snapshot = next
      return buildState()
    }

    if (snapshotsEqual(snapshot, next)) {
      return buildState()
    }

    undoStack = [...undoStack, snapshot].slice(-MAX_HISTORY)
    redoStack = []
    snapshot = next
    return buildState()
  }

  function undo(): HistoryState {
    if (undoStack.length === 0) {
      return buildState()
    }

    return withSkipHistory(() => {
      const previous = undoStack[undoStack.length - 1]
      undoStack = undoStack.slice(0, -1)
      redoStack = [...redoStack, snapshot]
      snapshot = previous
      return buildState()
    })
  }

  function redo(): HistoryState {
    if (redoStack.length === 0) {
      return buildState()
    }

    return withSkipHistory(() => {
      const next = redoStack[redoStack.length - 1]
      redoStack = redoStack.slice(0, -1)
      undoStack = [...undoStack, snapshot].slice(-MAX_HISTORY)
      snapshot = next
      return buildState()
    })
  }

  return buildState()
}
