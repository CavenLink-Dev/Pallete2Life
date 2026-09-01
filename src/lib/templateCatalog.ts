import {
  templateAssets,
  type TemplateAsset,
  type TemplateCategory,
  type TemplateCategoryNode,
  type TemplateGroupKey,
} from "./templateAssets"

export type TemplateEditability = "live" | "partial" | "static" | "placeholder"

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

/** Canonical type labels for picker grouping (consolidates overlapping names). */
export const TYPE_ALIASES: Record<string, string> = {
  "404": "Error Page",
  Login: "Authentication",
  "Sign In": "Authentication",
  "Sign Up": "Authentication",
}

export function canonicalType(type: string): string {
  return TYPE_ALIASES[type] ?? type
}

export function classifyTemplateEditability(asset: TemplateAsset): TemplateEditability {
  if (asset.renderer === "built-in") return "live"
  if (asset.renderer === "svg") return "static"
  return "placeholder"
}

export function isPaletteAware(asset: TemplateAsset): boolean {
  return classifyTemplateEditability(asset) === "live"
}

function dedupeKey(asset: TemplateAsset): string {
  return `${asset.category}|${canonicalType(asset.type)}|${asset.variant}`.toLowerCase()
}

/** Prefer built-in (live) templates when a duplicate type/variant exists in both collections. */
export function pickPreferredTemplate(assets: TemplateAsset[]): TemplateAsset {
  const builtIn = assets.find((asset) => asset.collection === "Built-In")
  return builtIn ?? assets[0]
}

export function buildPublicTemplateAssets(): TemplateAsset[] {
  const liveAssets = templateAssets.filter((asset) => isPaletteAware(asset))
  const grouped = new Map<string, TemplateAsset[]>()

  for (const asset of liveAssets) {
    const key = dedupeKey(asset)
    const bucket = grouped.get(key) ?? []
    bucket.push(asset)
    grouped.set(key, bucket)
  }

  return Array.from(grouped.values()).map(pickPreferredTemplate)
}

export const publicTemplateAssets = buildPublicTemplateAssets()

export function buildTemplateGroups(assets: TemplateAsset[]): TemplateCategoryNode[] {
  const categories: TemplateCategory[] = ["Website", "Application", "Components"]

  return categories.map((category) => {
    const categoryAssets = assets.filter((asset) => asset.category === category)
    const types = Array.from(new Set(categoryAssets.map((asset) => canonicalType(asset.type))))

    return {
      key: category.toLowerCase() as TemplateGroupKey,
      label: category,
      subs: types.map((type) => ({
        key: slug(type),
        label: type,
        templates: categoryAssets
          .filter((asset) => canonicalType(asset.type) === type)
          .map((asset) => ({
            key: asset.id,
            label: asset.variant,
            layout: asset.layout,
            thumbnail: asset.thumbnail,
            source: asset.source,
          })),
      })),
    }
  })
}

/** Picker-safe groups: live, deduped templates only. */
export const publicTemplateGroups = buildTemplateGroups(publicTemplateAssets)

/** Full catalog groups (includes legacy imported templates for recovery). */
export const fullTemplateGroups = buildTemplateGroups(templateAssets)

export function publicAssetsForCategory(category: TemplateCategory): TemplateAsset[] {
  return publicTemplateAssets.filter((asset) => asset.category === category)
}

export function templateCatalogStats() {
  const byEditability = templateAssets.reduce<Record<TemplateEditability, number>>((acc, asset) => {
    const key = classifyTemplateEditability(asset)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, { live: 0, partial: 0, static: 0, placeholder: 0 })

  return {
    total: templateAssets.length,
    publicPicker: publicTemplateAssets.length,
    hiddenFromPicker: templateAssets.length - publicTemplateAssets.length,
    byEditability,
  }
}
