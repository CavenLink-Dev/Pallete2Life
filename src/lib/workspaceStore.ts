import { createDefaultPalette, loadPalette } from "./paletteStore"
import { templateGroups, templateAssetById, type TemplateGroupKey } from "./templateAssets"
import { uid, type RoleBindings, type Swatch } from "./color"
import type { ElementOverrides } from "./designTokens"

const STORE_KEY = "hueframe:v1"

type Brand = { name: string; logo: string | null; symbol: string | null }
type ButtonStyle = "flat" | "depth" | "elevated" | "outline" | "glass" | "gradient"
const VALID_BUTTON_STYLES: ButtonStyle[] = ["flat", "depth", "elevated", "outline", "glass", "gradient"]

type WorkspaceSelection = { group: TemplateGroupKey; sub: string }

export type WorkspaceProject = {
  schemaVersion: 1
  palette: Swatch[]
  selection: WorkspaceSelection
  templateByType: Record<string, string>
  brand: Brand
  designId: string
  elementOverrides: ElementOverrides
  roleBindings: RoleBindings
  unassignedRoleSwatchIds: string[]
  buttonStyle: ButtonStyle
  assignments: Record<string, string>
}

export type WorkspaceLoadResult = {
  project: WorkspaceProject
  recovered: boolean
  issues: string[]
}

export const DEFAULT_WORKSPACE_SELECTION: WorkspaceSelection = { group: "website", sub: "landing-page" }

export function createDefaultProject(): WorkspaceProject {
  return {
    schemaVersion: 1,
    palette: createDefaultPalette(),
    selection: { ...DEFAULT_WORKSPACE_SELECTION },
    templateByType: {},
    brand: { name: "HueSet", logo: null, symbol: null },
    designId: uid(),
    elementOverrides: {},
    roleBindings: {},
    unassignedRoleSwatchIds: [],
    buttonStyle: "flat",
    assignments: {},
  }
}

function isValidGroupSub(group: unknown, sub: unknown): boolean {
  if (typeof group !== "string" || typeof sub !== "string") return false
  const g = templateGroups.find((gr) => gr.key === group)
  return g !== undefined && g.subs.some((s) => s.key === sub)
}

function validateSelection(raw: unknown, issues: string[]): WorkspaceSelection {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const { group, sub } = raw as Record<string, unknown>
    if (isValidGroupSub(group, sub)) return { group: group as TemplateGroupKey, sub: sub as string }
    issues.push(`Invalid selection "${String(group)}/${String(sub)}", using default`)
  }
  return { ...DEFAULT_WORKSPACE_SELECTION }
}

function validateBrand(raw: unknown): Brand {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { name: "HueSet", logo: null, symbol: null }
  const b = raw as Record<string, unknown>
  const rawName = typeof b.name === "string" ? b.name : ""
  const name = rawName === "Palette Preview" ? "HueSet" : rawName || "HueSet"
  const logo = typeof b.logo === "string" ? b.logo : null
  const symbol = typeof b.symbol === "string" ? b.symbol : null
  return { name, logo, symbol }
}

function validateTemplateByType(raw: unknown, selection: WorkspaceSelection, issues: string[]): Record<string, string> {
  // Track whether the caller actually stored any templateByType data
  const hadStoredData = raw !== null && raw !== undefined
  const result: Record<string, string> = {}

  if (hadStoredData && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof val !== "string") continue
      const slash = key.indexOf("/")
      if (slash === -1) continue
      const group = key.slice(0, slash)
      const sub = key.slice(slash + 1)
      if (!isValidGroupSub(group, sub)) continue
      if (!templateAssetById.has(val)) continue
      result[key] = val
    }
  }

  // Guarantee the active selection key resolves to a valid template
  const activeKey = `${selection.group}/${selection.sub}`
  if (!result[activeKey]) {
    const g = templateGroups.find((gr) => gr.key === selection.group)
    const s = g?.subs.find((sub) => sub.key === selection.sub)
    const first = s?.templates[0]?.key
    if (first) {
      result[activeKey] = first
      // Only flag as recovery if the caller had stored data that failed validation;
      // on a fresh install with no stored data this is just normal initialisation.
      if (hadStoredData) {
        issues.push(`Template for ${activeKey} was missing or invalid, reset to first available`)
      }
    }
  }

  return result
}

function validateRoleBindings(raw: unknown, paletteIds: Set<string>, issues: string[]): RoleBindings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const result: RoleBindings = {}
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof val === "string" && paletteIds.has(val)) {
      result[key] = val
    } else if (typeof val === "string") {
      issues.push(`Role binding "${key}" → unknown swatch id "${val}", dropped`)
    }
  }
  return result
}

function validateUnassignedIds(raw: unknown, paletteIds: Set<string>): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((id): id is string => typeof id === "string" && paletteIds.has(id))
}

function validateButtonStyle(raw: unknown): ButtonStyle {
  return (VALID_BUTTON_STYLES as unknown[]).includes(raw) ? (raw as ButtonStyle) : "flat"
}

function validateStringRecord(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") result[k] = v
  }
  return result
}

function validateElementOverrides(raw: unknown): ElementOverrides {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const result: ElementOverrides = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object" || Array.isArray(v)) continue
    const ov: Record<string, string | boolean> = {}
    for (const [propKey, propVal] of Object.entries(v as Record<string, unknown>)) {
      if (typeof propVal === "string" || typeof propVal === "boolean") ov[propKey] = propVal
    }
    result[k] = ov
  }
  return result
}

function writeRepaired(fields: Record<string, unknown>): void {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const data: Record<string, unknown> = {}
    try { if (raw) Object.assign(data, JSON.parse(raw)) } catch { /* ignore corrupt existing */ }
    Object.assign(data, fields)
    localStorage.setItem(STORE_KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable */
  }
}

/**
 * Loads and validates the full workspace from localStorage.
 * Preserves all valid data; repairs or defaults individual corrupt/missing fields.
 * Never clears all localStorage.
 */
export function loadWorkspace(): WorkspaceLoadResult {
  const issues: string[] = []
  let recovered = false

  // Palette: hash → localStorage → default (handles empty-filter case after paletteStore guard)
  const palette = loadPalette()
  const paletteIds = new Set(palette.map((s) => s.id))

  // Read raw blob
  let blob: Record<string, unknown> = {}
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        blob = parsed as Record<string, unknown>
      } else {
        issues.push("Workspace blob had unexpected shape, using defaults for all fields")
        recovered = true
      }
    }
  } catch {
    issues.push("Workspace blob could not be parsed, using defaults for all fields")
    recovered = true
    const project = createDefaultProject()
    project.palette = palette
    return { project, recovered, issues }
  }

  const selection = validateSelection(blob.selection, issues)
  const templateByType = validateTemplateByType(blob.templateByType, selection, issues)
  const brand = validateBrand(blob.brand)
  const roleBindings = validateRoleBindings(blob.roleBindings, paletteIds, issues)
  const unassignedRoleSwatchIds = validateUnassignedIds(blob.unassignedRoleSwatchIds, paletteIds)
  const buttonStyle = validateButtonStyle(blob.buttonStyle)
  const assignments = validateStringRecord(blob.assignments)
  const elementOverrides = validateElementOverrides(blob.elementOverrides)
  const designId = typeof blob.designId === "string" && blob.designId.length > 0 ? blob.designId : uid()

  if (issues.length > 0) recovered = true

  const project: WorkspaceProject = {
    schemaVersion: 1,
    palette,
    selection,
    templateByType,
    brand,
    designId,
    elementOverrides,
    roleBindings,
    unassignedRoleSwatchIds,
    buttonStyle,
    assignments,
  }

  // Write repaired fields back so next load is clean
  if (recovered) {
    writeRepaired({
      schemaVersion: 1,
      selection: project.selection,
      templateByType: project.templateByType,
      brand: project.brand,
      designId: project.designId,
      elementOverrides: project.elementOverrides,
      roleBindings: project.roleBindings,
      unassignedRoleSwatchIds: project.unassignedRoleSwatchIds,
      buttonStyle: project.buttonStyle,
      assignments: project.assignments,
    })
  }

  return { project, recovered, issues }
}

/** Saves a single field to the workspace blob (same merge pattern as Builder's useStored). */
export function saveWorkspaceField(key: string, value: unknown): void {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const data: Record<string, unknown> = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    data[key] = value
    data.schemaVersion = 1
    localStorage.setItem(STORE_KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable */
  }
}

/** Returns a guaranteed-valid template id for the given selection. */
export function resolveTemplateId(
  selection: { group: string; sub: string },
  templateByType: Record<string, string>,
): string {
  const key = `${selection.group}/${selection.sub}`
  const stored = templateByType[key]
  if (stored && templateAssetById.has(stored)) return stored
  const g = templateGroups.find((gr) => gr.key === selection.group)
  const s = g?.subs.find((sub) => sub.key === selection.sub) ?? g?.subs[0]
  return s?.templates[0]?.key ?? ""
}
