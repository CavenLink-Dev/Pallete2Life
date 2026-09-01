import { applyRoleChange, type RoleBindings, type Swatch } from "./color"

/** Quick Design visual role keys — mapped to Builder semantic role labels. */
export type QuickRole = "background" | "surface" | "button" | "text" | "border" | "accent"

export const QUICK_ROLE_OPTIONS: { key: QuickRole; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "button", label: "Button" },
  { key: "text", label: "Text" },
  { key: "border", label: "Border" },
  { key: "accent", label: "Accent" },
]

const WEBSITE_BUILDER_ROLES: Record<QuickRole, string> = {
  background: "Page Background",
  surface: "Secondary Background",
  button: "Brand Primary",
  text: "Body Text",
  border: "Border",
  accent: "Accent",
}

const APP_BUILDER_ROLES: Record<QuickRole, string> = {
  background: "App Background",
  surface: "Secondary Background",
  button: "Brand Primary",
  text: "Body Text",
  border: "Border",
  accent: "Accent",
}

export type QuickPreviewKind = "website" | "app" | "components"

function builderRoleForQuick(quickRole: QuickRole, preview: QuickPreviewKind): string {
  const map = preview === "app" ? APP_BUILDER_ROLES : WEBSITE_BUILDER_ROLES
  return map[quickRole]
}

function defaultQuickRoles(palette: Swatch[]): Record<QuickRole, string> {
  const at = (index: number) => palette[index]?.id ?? palette[0]?.id ?? ""
  return {
    background: at(0),
    surface: at(1),
    button: at(2),
    text: at(3),
    border: at(4),
    accent: at(2),
  }
}

/** Resolve Quick Design role → swatch id from shared roleBindings. */
export function quickRolesFromBindings(
  roleBindings: RoleBindings,
  palette: Swatch[],
  preview: QuickPreviewKind = "website",
): Record<QuickRole, string> {
  const defaults = defaultQuickRoles(palette)
  const ids = new Set(palette.map((s) => s.id))
  const result = { ...defaults }

  for (const { key } of QUICK_ROLE_OPTIONS) {
    const builderRole = builderRoleForQuick(key, preview)
    const bound = roleBindings[builderRole]
    if (bound && ids.has(bound)) {
      result[key] = bound
    }
  }

  return result
}

/** Apply a Quick Design role change into shared roleBindings. */
export function applyQuickRoleToBindings(
  quickRole: QuickRole,
  swatchId: string,
  roleBindings: RoleBindings,
  unassignedRoleSwatchIds: readonly string[],
  preview: QuickPreviewKind = "website",
): { roleBindings: RoleBindings; unassignedRoleSwatchIds: string[] } {
  const builderRole = builderRoleForQuick(quickRole, preview)
  return applyRoleChange(builderRole, swatchId, roleBindings, unassignedRoleSwatchIds, [])
}

/** One-time migration from legacy liveRoles blob field → roleBindings. */
export function migrateLiveRolesToBindings(
  liveRoles: unknown,
  paletteIds: Set<string>,
): RoleBindings {
  if (!liveRoles || typeof liveRoles !== "object" || Array.isArray(liveRoles)) return {}
  const raw = liveRoles as Record<string, unknown>
  const bindings: RoleBindings = {}

  for (const { key } of QUICK_ROLE_OPTIONS) {
    const swatchId = raw[key]
    if (typeof swatchId === "string" && paletteIds.has(swatchId)) {
      bindings[WEBSITE_BUILDER_ROLES[key]] = swatchId
    }
  }

  return bindings
}
