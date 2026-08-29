import { useEffect, useMemo, useState } from "react"
import {
  templateAssets,
  templateCategories,
  templateStats,
  type TemplateAsset,
  type TemplateCategory,
} from "../lib/templateAssets"

type LibrarySection = "Built-In" | "Imported" | "Recent" | "Favorites"

type Props = {
  selectedId: string
  onSelect: (template: TemplateAsset) => void
  onClose: () => void
}

const FAVORITES_KEY = "hueframe:template-favorites"
const RECENTS_KEY = "hueframe:template-recents"

function loadIds(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]")
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
  } catch {
    return []
  }
}

function saveIds(key: string, ids: string[]) {
  try { localStorage.setItem(key, JSON.stringify(ids)) } catch { /* storage unavailable */ }
}

export default function TemplateLibrary({ selectedId, onSelect, onClose }: Props) {
  const selected = templateAssets.find((asset) => asset.id === selectedId) ?? templateAssets[0]
  const [section, setSection] = useState<LibrarySection>(selected.collection)
  const [category, setCategory] = useState<TemplateCategory>(selected.category)
  const [type, setType] = useState("All types")
  const [variant, setVariant] = useState("All variants")
  const [query, setQuery] = useState("")
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => loadIds(FAVORITES_KEY))
  const [recentIds, setRecentIds] = useState<string[]>(() => loadIds(RECENTS_KEY))

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const sectionAssets = useMemo(() => {
    if (section === "Built-In" || section === "Imported") return templateAssets.filter((asset) => asset.collection === section)
    const ids = section === "Recent" ? recentIds : favoriteIds
    return ids.flatMap((id) => {
      const asset = templateAssets.find((item) => item.id === id)
      return asset ? [asset] : []
    })
  }, [favoriteIds, recentIds, section])

  const categoryAssets = useMemo(() => sectionAssets.filter((asset) => asset.category === category), [category, sectionAssets])
  const types = useMemo(() => Array.from(new Set(categoryAssets.map((asset) => asset.type))), [categoryAssets])
  const variants = useMemo(() => Array.from(new Set(
    categoryAssets.filter((asset) => type === "All types" || asset.type === type).map((asset) => asset.variant),
  )), [categoryAssets, type])

  const visibleTemplates = useMemo(() => {
    const search = query.trim().toLowerCase()
    return categoryAssets.filter((asset) => {
      const matchesType = type === "All types" || asset.type === type
      const matchesVariant = variant === "All variants" || asset.variant === variant
      const matchesSearch = !search || `${asset.name} ${asset.category} ${asset.type} ${asset.variant} ${asset.tags.join(" ")}`.toLowerCase().includes(search)
      return matchesType && matchesVariant && matchesSearch
    })
  }, [categoryAssets, query, type, variant])

  const chooseSection = (next: LibrarySection) => {
    setSection(next)
    setType("All types")
    setVariant("All variants")
  }

  const chooseCategory = (next: TemplateCategory) => {
    setCategory(next)
    setType("All types")
    setVariant("All variants")
  }

  const chooseType = (next: string) => {
    setType(next)
    setVariant("All variants")
  }

  const chooseTemplate = (template: TemplateAsset) => {
    const nextRecent = [template.id, ...recentIds.filter((id) => id !== template.id)].slice(0, 16)
    setRecentIds(nextRecent)
    saveIds(RECENTS_KEY, nextRecent)
    onSelect(template)
  }

  const toggleFavorite = (templateId: string) => {
    const next = favoriteIds.includes(templateId)
      ? favoriteIds.filter((id) => id !== templateId)
      : [templateId, ...favoriteIds]
    setFavoriteIds(next)
    saveIds(FAVORITES_KEY, next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/45 p-3 backdrop-blur-[2px] sm:p-6" role="dialog" aria-modal="true" aria-label="Template and component library" onMouseDown={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[8px] border border-softgrey bg-white shadow-[0_30px_80px_-28px_rgba(14,24,33,0.5)]" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-softgrey px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-[16px] font-bold text-charcoal" style={{ fontFamily: "var(--font-display)" }}>Template and component library</h2>
            <p className="mt-0.5 text-[12px] text-charcoal/50">
              {templateStats.builtInTemplates} built-in <span aria-hidden>·</span> {templateStats.websiteTemplates} Website <span aria-hidden>·</span> {templateStats.applicationTemplates} Application <span aria-hidden>·</span> {templateStats.componentTemplates} Components
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] border border-softgrey text-charcoal/55 transition-colors hover:bg-[#f3f4f6] hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label="Close library" title="Close">
            <CloseIcon />
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-softgrey px-4 pt-2 sm:px-5" aria-label="Library sections">
          {(["Built-In", "Imported", "Recent", "Favorites"] as LibrarySection[]).map((item) => (
            <button key={item} type="button" onClick={() => chooseSection(item)} className={`shrink-0 border-b-2 px-3 py-2 text-[12px] font-semibold ${section === item ? "border-brand text-charcoal" : "border-transparent text-charcoal/50 hover:text-charcoal"}`} aria-current={section === item ? "page" : undefined}>
              {item}
            </button>
          ))}
        </nav>

        <div className="grid gap-3 border-b border-softgrey bg-[#fafafa] px-4 py-3 sm:grid-cols-[150px_1fr_1fr_1fr] sm:px-5">
          <FilterField label="Template">
            <select disabled value="Template" className="template-filter-select cursor-not-allowed opacity-70" aria-label="Template area"><option>Template</option></select>
          </FilterField>
          <FilterField label="Category">
            <select value={category} onChange={(event) => chooseCategory(event.target.value as TemplateCategory)} className="template-filter-select" aria-label="Template category">
              {templateCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>
          <FilterField label="Type">
            <select value={type} onChange={(event) => chooseType(event.target.value)} className="template-filter-select" aria-label="Template type">
              <option>All types</option>{types.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>
          <FilterField label="Variant">
            <select value={variant} onChange={(event) => setVariant(event.target.value)} className="template-filter-select" aria-label="Template variant">
              <option>All variants</option>{variants.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-softgrey px-4 py-2.5 sm:px-5">
            <div className="relative max-w-sm flex-1">
              <SearchIcon />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search templates" className="h-9 w-full rounded-[7px] border border-softgrey bg-white pl-9 pr-3 text-[12px] text-charcoal outline-none transition-shadow placeholder:text-charcoal/35 focus:border-brand focus:ring-2 focus:ring-brand/15" />
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-charcoal/45">{visibleTemplates.length} shown</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f7f8] p-4 sm:p-5">
            {visibleTemplates.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visibleTemplates.map((template) => {
                  const active = template.id === selectedId
                  const favorite = favoriteIds.includes(template.id)
                  return (
                    <div key={template.id} className="group relative min-w-0 overflow-hidden rounded-[8px] border border-softgrey bg-white shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-charcoal/25 hover:shadow-md" style={{ borderColor: active ? "#20b9fa" : undefined, boxShadow: active ? "0 0 0 2px rgba(32,185,250,0.18)" : undefined }}>
                      <button type="button" onClick={() => chooseTemplate(template)} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand" aria-pressed={active}>
                        <span className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-b border-softgrey bg-[#eef0f2] p-2">
                          <TemplateThumbnail template={template} />
                        </span>
                        <span className="block min-w-0 px-3 py-2.5">
                          <span className="block truncate text-[12px] font-bold text-charcoal">{template.name}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-charcoal/50">{template.category} / {template.type} / {template.variant}</span>
                        </span>
                      </button>
                      <button type="button" onClick={() => toggleFavorite(template.id)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-[7px] border border-black/10 bg-white/90 text-charcoal/50 shadow-sm backdrop-blur hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label={favorite ? `Remove ${template.name} from favorites` : `Add ${template.name} to favorites`} title={favorite ? "Remove favorite" : "Add favorite"}>
                        <StarIcon filled={favorite} />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <p className="text-sm font-bold text-charcoal">No templates here yet</p>
                <p className="mt-1 max-w-sm text-[12px] text-charcoal/50">Try another category or add templates to this section.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateThumbnail({ template }: { template: TemplateAsset }) {
  if (template.renderer === "svg") {
    return <img src={template.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]" />
  }

  const phone = template.category === "Application"
  const component = template.category === "Components"
  return (
    <span className="flex h-full w-full items-center justify-center rounded-[5px] bg-white p-2" aria-hidden>
      <span className={`flex h-full overflow-hidden border border-[#cfd4da] bg-[#f7f8fa] ${phone ? "w-[38%] flex-col rounded-[12px] border-[3px]" : "w-full flex-col rounded-[4px]"}`}>
        <span className="flex h-4 shrink-0 items-center gap-1 border-b border-[#dfe3e7] bg-white px-2"><span className="h-1.5 w-1.5 rounded-full bg-[#20b9fa]" /><span className="h-1.5 w-5 rounded-full bg-[#d8dde3]" /></span>
        <span className={`grid flex-1 gap-1.5 p-2 ${component ? "grid-cols-2" : "grid-cols-[1.2fr_0.8fr]"}`}>
          <span className="flex flex-col justify-center gap-1"><span className="h-2 w-4/5 rounded-sm bg-[#293642]" /><span className="h-1.5 w-full rounded-sm bg-[#cfd5db]" /><span className="h-2.5 w-8 rounded-sm bg-[#20b9fa]" /></span>
          <span className="grid gap-1"><span className="rounded-sm bg-[#e1f4fc]" /><span className="rounded-sm border border-[#d8dde3] bg-white" /></span>
        </span>
      </span>
    </span>
  )
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1"><span className="text-[10px] font-bold uppercase text-charcoal/45">{label}</span>{children}</label>
}

const CloseIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
const SearchIcon = () => <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
const StarIcon = ({ filled }: { filled: boolean }) => <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m12 2.7 2.8 5.7 6.3.9-4.5 4.4 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.5-4.4 6.3-.9Z" /></svg>
