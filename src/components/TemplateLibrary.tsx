import { useEffect, useMemo, useState } from "react"
import {
  templateAssets,
  templateCategories,
  templateStats,
  type TemplateAsset,
  type TemplateCategory,
} from "../lib/templateAssets"

type Props = {
  selectedId: string
  onSelect: (template: TemplateAsset) => void
  onClose: () => void
}

export default function TemplateLibrary({ selectedId, onSelect, onClose }: Props) {
  const selected = templateAssets.find((asset) => asset.id === selectedId) ?? templateAssets[0]
  const [category, setCategory] = useState<TemplateCategory>(selected.category)
  const [type, setType] = useState("All types")
  const [variant, setVariant] = useState("All variants")
  const [query, setQuery] = useState("")

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const categoryAssets = useMemo(
    () => templateAssets.filter((asset) => asset.category === category),
    [category],
  )
  const types = useMemo(() => Array.from(new Set(categoryAssets.map((asset) => asset.type))), [categoryAssets])
  const variants = useMemo(() => Array.from(new Set(
    categoryAssets.filter((asset) => type === "All types" || asset.type === type).map((asset) => asset.variant),
  )), [categoryAssets, type])

  const visibleTemplates = useMemo(() => {
    const search = query.trim().toLowerCase()
    return categoryAssets.filter((asset) => {
      const matchesType = type === "All types" || asset.type === type
      const matchesVariant = variant === "All variants" || asset.variant === variant
      const matchesSearch = !search || `${asset.category} ${asset.type} ${asset.variant}`.toLowerCase().includes(search)
      return matchesType && matchesVariant && matchesSearch
    })
  }, [categoryAssets, query, type, variant])

  const chooseCategory = (next: TemplateCategory) => {
    setCategory(next)
    setType("All types")
    setVariant("All variants")
  }

  const chooseType = (next: string) => {
    setType(next)
    setVariant("All variants")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/45 p-3 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Template library"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[8px] border border-softgrey bg-white shadow-[0_30px_80px_-28px_rgba(14,24,33,0.5)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-softgrey px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-[16px] font-bold text-charcoal" style={{ fontFamily: "var(--font-display)" }}>Template library</h2>
            <p className="mt-0.5 text-[12px] text-charcoal/50">
              {templateStats.uniqueTemplates} templates · {templateStats.websiteTemplates} Website · {templateStats.applicationTemplates} Application
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] border border-softgrey text-charcoal/55 transition-colors hover:bg-[#f3f4f6] hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Close template library"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="grid gap-3 border-b border-softgrey bg-[#fafafa] px-4 py-3 sm:grid-cols-[150px_1fr_1fr_1fr] sm:px-5">
          <FilterField label="Template Area">
            <select disabled value="Template" className="template-filter-select cursor-not-allowed opacity-70" aria-label="Template Area">
              <option>Template</option>
            </select>
          </FilterField>
          <FilterField label="Template Category">
            <select value={category} onChange={(event) => chooseCategory(event.target.value as TemplateCategory)} className="template-filter-select" aria-label="Template Category">
              {templateCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>
          <FilterField label="Type">
            <select value={type} onChange={(event) => chooseType(event.target.value)} className="template-filter-select" aria-label="Template Type">
              <option>All types</option>
              {types.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>
          <FilterField label="Variant">
            <select value={variant} onChange={(event) => setVariant(event.target.value)} className="template-filter-select" aria-label="Template Variant">
              <option>All variants</option>
              {variants.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterField>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-softgrey px-4 py-2.5 sm:px-5">
            <div className="relative max-w-sm flex-1">
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search templates"
                className="h-9 w-full rounded-[7px] border border-softgrey bg-white pl-9 pr-3 text-[12px] text-charcoal outline-none transition-shadow placeholder:text-charcoal/35 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-charcoal/45">{visibleTemplates.length} shown</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f7f8] p-4 sm:p-5">
            {visibleTemplates.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visibleTemplates.map((template) => {
                  const active = template.id === selectedId
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => onSelect(template)}
                      className="group min-w-0 overflow-hidden rounded-[8px] border border-softgrey bg-white text-left shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-charcoal/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      style={{ borderColor: active ? "#20b9fa" : undefined, boxShadow: active ? "0 0 0 2px rgba(32,185,250,0.18)" : undefined }}
                      aria-pressed={active}
                    >
                      <span className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-b border-softgrey bg-[#eef0f2] p-2">
                        <img
                          src={template.thumbnail}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                      </span>
                      <span className="block min-w-0 px-3 py-2.5">
                        <span className="block truncate text-[12px] font-bold text-charcoal">{template.type}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-charcoal/50">{template.variant}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="grid min-h-[260px] place-items-center text-center">
                <div>
                  <p className="text-sm font-semibold text-charcoal/65">No matching templates</p>
                  <button type="button" onClick={() => { setQuery(""); setType("All types"); setVariant("All variants") }} className="mt-2 text-xs font-semibold text-brand-dark hover:underline">Clear filters</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-[9px] font-bold uppercase text-charcoal/40">{label}</span>
      {children}
    </label>
  )
}
