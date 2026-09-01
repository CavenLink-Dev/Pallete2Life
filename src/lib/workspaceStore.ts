import { createDefaultPalette, loadPalette } from "./paletteStore"
import { migrateLiveRolesToBindings } from "./quickRoleBridge"
import { fullTemplateGroups } from "./templateCatalog"
import { templateAssetById, type TemplateGroupKey } from "./templateAssets"
import { isSingletonRole, uid, type RoleBindings, type Swatch } from "./color"
import type { ElementOverrides } from "./designTokens"

const STORE_KEY = "hueframe:v1"

type Brand = { name: string; logo: string | null; symbol: string | null }

type WorkspaceSelection = { group: TemplateGroupKey; sub: string }

export type WorkspacePreferences = {
  paletteOpen: boolean
  customiseOpen: boolean
}

export type WorkspaceProject = {
  schemaVersion: 2
  palette: Swatch[]
  selection: WorkspaceSelection
  templateByType: Record<string, string>
  brand: Brand
  designId: string
  elementOverrides: ElementOverrides
  roleBindings: RoleBindings
  unassignedRoleSwatchIds: string[]
  preferences: WorkspacePreferences
}

export type WorkspaceLoadResult = {
  project: WorkspaceProject
  recovered: boolean
  issues: string[]
}

export const DEFAULT_WORKSPACE_SELECTION: WorkspaceSelection = { group: "website", sub: "landing-page" }

const DEFAULT_PREFERENCES: WorkspacePreferences = {
  paletteOpen: true,
  customiseOpen: true,
}

export function createDefaultProject(): WorkspaceProject {
  return {
    schemaVersion: 2,
    palette: createDefaultPalette(),
    selection: { ...DEFAULT_WORKSPACE_SELECTION },
    templateByType: {},
    brand: { name: "HueSet", logo: null, symbol: null },
    designId: uid(),
    elementOverrides: {},
    roleBindings: {},
    unassignedRoleSwatchIds: [],
    preferences: { ...DEFAULT_PREFERENCES },
  }
}

export function projectToPersistedFields(project: WorkspaceProject): Record<string, unknown> {
  return {
    schemaVersion: project.schemaVersion,
    palette: project.palette,
    selection: project.selection,
    templateByType: project.templateByType,
    brand: project.brand,
    designId: project.designId,
    elementOverrides: project.elementOverrides,
    roleBindings: project.roleBindings,
    unassignedRoleSwatchIds: project.unassignedRoleSwatchIds,
    preferences: project.preferences,
  }
}

export function dedupeSingletonRoles(roleBindings: RoleBindings, issues: string[]): RoleBindings {
  const result: RoleBindings = {}
  const seenSingletonKeys = new Set<string>()

  for (const [role, swatchId] of Object.entries(roleBindings)) {
    if (isSingletonRole(role)) {
      const key = role.trim().toLowerCase()
      if (seenSingletonKeys.has(key)) {
        issues.push(`Duplicate singleton role binding "${role}", dropped`)
        continue
      }
      seenSingletonKeys.add(key)
    }
    result[role] = swatchId
  }

  return result
}

function isValidGroupSub(group: unknown, sub: unknown): boolean {
  if (typeof group !== "string" || typeof sub !== "string") return false
  const g = fullTemplateGroups.find((gr) => gr.key === group)
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
    const g = fullTemplateGroups.find((gr) => gr.key === selection.group)
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
  return dedupeSingletonRoles(result, issues)
}

function validateUnassignedIds(raw: unknown, paletteIds: Set<string>): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((id): id is string => typeof id === "string" && paletteIds.has(id))
}

function validateLegacyFields(blob: Record<string, unknown>): void {
  /* legacy buttonStyle / assignments / liveRoles — ignored on read; liveRoles migrated separately */
  void blob.buttonStyle
  void blob.assignments
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

function validatePreferences(raw: unknown, issues: string[]): WorkspacePreferences {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    if (raw !== null && raw !== undefined) {
      issues.push("Invalid preferences shape, using defaults")
    }
    return { ...DEFAULT_PREFERENCES }
  }
  const prefs = raw as Record<string, unknown>
  const paletteOpen = typeof prefs.paletteOpen === "boolean" ? prefs.paletteOpen : DEFAULT_PREFERENCES.paletteOpen
  const customiseOpen = typeof prefs.customiseOpen === "boolean" ? prefs.customiseOpen : DEFAULT_PREFERENCES.customiseOpen
  if (typeof prefs.paletteOpen !== "boolean" || typeof prefs.customiseOpen !== "boolean") {
    issues.push("Invalid preferences fields, using defaults where needed")
  }
  return { paletteOpen, customiseOpen }
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

  // Palette: merge hash into stored palette when hash exists
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

  const storedSchemaVersion = blob.schemaVersion
  const hasStoredBlob = Object.keys(blob).length > 0
  const needsV2Migration = hasStoredBlob && storedSchemaVersion !== 2

  const selection = validateSelection(blob.selection, issues)
  const templateByType = validateTemplateByType(blob.templateByType, selection, issues)
  const brand = validateBrand(blob.brand)
  let roleBindings = validateRoleBindings(blob.roleBindings, paletteIds, issues)
  const unassignedRoleSwatchIds = validateUnassignedIds(blob.unassignedRoleSwatchIds, paletteIds)
  validateLegacyFields(blob)

  // Migrate legacy Quick Design liveRoles → shared roleBindings when bindings are empty
  if (Object.keys(roleBindings).length === 0 && blob.liveRoles) {
    const migrated = migrateLiveRolesToBindings(blob.liveRoles, paletteIds)
    if (Object.keys(migrated).length > 0) {
      roleBindings = dedupeSingletonRoles(migrated, issues)
      issues.push("Migrated legacy liveRoles into roleBindings")
      recovered = true
    }
  }
  const elementOverrides = validateElementOverrides(blob.elementOverrides)
  const designId = typeof blob.designId === "string" && blob.designId.length > 0 ? blob.designId : uid()
  const preferences = needsV2Migration
    ? { ...DEFAULT_PREFERENCES }
    : validatePreferences(blob.preferences, issues)

  if (issues.length > 0) recovered = true
  if (needsV2Migration) {
    issues.push("Migrated workspace from schema v1 to v2")
    recovered = true
  }

  const project: WorkspaceProject = {
    schemaVersion: 2,
    palette,
    selection,
    templateByType,
    brand,
    designId,
    elementOverrides,
    roleBindings,
    unassignedRoleSwatchIds,
    preferences,
  }

  // Write repaired fields back so next load is clean
  if (recovered) {
    writeRepaired(projectToPersistedFields(project))
  }

  return { project, recovered, issues }
}

/** Atomically saves the full workspace project to localStorage. */
export function saveWorkspaceProject(project: WorkspaceProject): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(projectToPersistedFields(project)))
  } catch {
    /* storage unavailable */
  }
}

/** Saves a single field to the workspace blob (same merge pattern as Builder's useStored). */
export function saveWorkspaceField(key: string, value: unknown): void {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const data: Record<string, unknown> = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    data[key] = value
    data.schemaVersion = 2
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
  const g = fullTemplateGroups.find((gr) => gr.key === selection.group)
  const s = g?.subs.find((sub) => sub.key === selection.sub) ?? g?.subs[0]
  return s?.templates[0]?.key ?? ""
}
