import { useMemo, useState } from "react"
import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
import { INSPIRATION_ITEMS, inspirationItemById, type InspirationItem } from "../lib/inspirationCatalog"
import type { TemplateCategory } from "../lib/templateAssets"
import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"
import InspirationThumbnail from "../components/InspirationThumbnail"
import InspirationDetail from "../components/InspirationDetail"

const BRAND_INK = "#0A6288"
const FAVORITES_KEY = "hueframe:inspiration-favorites"

type Filter = "all" | TemplateCategory | "saved"

const CATEGORIES: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Website", label: "Websites" },
  { id: "Application", label: "Apps" },
  { id: "Components", label: "Components" },
  { id: "saved", label: "Saved" },
]

function loadFavorites(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]")
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
  } catch {
    return []
  }
}

function saveFavorites(ids: string[]) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)) } catch { /* storage unavailable */ }
}

export default function Examples() {
  const nav = useNav()
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => loadFavorites())

  const toggleSave = (id: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]
      saveFavorites(next)
      return next
    })
  }

  const filtered = useMemo(() => {
    const base: InspirationItem[] =
      filter === "all" ? INSPIRATION_ITEMS
      : filter === "saved" ? favoriteIds.flatMap((id) => { const item = inspirationItemById.get(id); return item ? [item] : [] })
      : INSPIRATION_ITEMS.filter((item) => item.category === filter)

    const search = query.trim().toLowerCase()
    if (!search) return base
    return base.filter((item) =>
      `${item.template.name} ${item.template.type} ${item.template.variant} ${item.palette.name}`.toLowerCase().includes(search),
    )
  }, [filter, favoriteIds, query])

  const activeItem = activeId ? inspirationItemById.get(activeId) ?? null : null

  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 sm:py-20">
        {/* Hero */}
        <div>
          <h1
            className="text-[32px] font-bold text-charcoal sm:text-[42px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Inspiration
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-charcoal/65">
            Browse real websites, apps, and components styled with curated colour palettes.
            Open one to see it in full, save it for later, or copy the palette straight into
            your own project.
          </p>
        </div>

        {/* Filter + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by category">
            {CATEGORIES.map((cat) => {
              const on = filter === cat.id
              const count = cat.id === "all" ? INSPIRATION_ITEMS.length
                : cat.id === "saved" ? favoriteIds.length
                : INSPIRATION_ITEMS.filter((item) => item.category === cat.id).length
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setFilter(cat.id)}
                  className="min-h-11 rounded-lg border px-4 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                  style={
                    on
                      ? { background: BRAND_INK, color: "#fff", borderColor: BRAND_INK }
                      : { background: "#fff", color: BRAND.charcoal, borderColor: BRAND.softgrey }
                  }
                >
                  {cat.label} <span className={on ? "opacity-80" : "opacity-50"}>({count})</span>
                </button>
              )
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search inspiration"
              aria-label="Search inspiration"
              className="h-11 w-full rounded-lg border border-softgrey bg-white pl-9 pr-3 text-[13px] text-charcoal outline-none transition-shadow placeholder:text-charcoal/45 focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </div>
        </div>

        {/* Gallery grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <InspirationCard
                key={item.id}
                item={item}
                saved={favoriteIds.includes(item.id)}
                onOpen={() => setActiveId(item.id)}
                onToggleSave={() => toggleSave(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-softgrey bg-white text-center">
            <p className="text-sm font-bold text-charcoal">
              {filter === "saved" ? "Nothing saved yet" : "No matches"}
            </p>
            <p className="mt-1 max-w-sm text-[12px] text-charcoal/50">
              {filter === "saved"
                ? "Open an example and hit Save to keep it here for later."
                : "Try another category or a different search term."}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-softgrey bg-white px-6 py-8 text-center">
          <h2
            className="text-[20px] font-bold text-charcoal sm:text-[24px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Build your own
          </h2>
          <p className="max-w-md text-[15px] text-charcoal/60">
            These examples are starting points. Open Quick Design to create a palette that fits your project.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/quick-design"
              onClick={nav("/quick-design")}
              className="inline-flex min-h-11 items-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
              style={{ background: "#0A6288" }}
            >
              Open Quick Design
            </a>
            <a
              href="/learn"
              onClick={nav("/learn")}
              className="inline-flex min-h-11 items-center rounded-lg border border-softgrey bg-white px-5 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
            >
              Learn about colour
            </a>
          </div>
        </div>
      </main>
      <PublicFooter />

      {activeItem && (
        <InspirationDetail
          item={activeItem}
          saved={favoriteIds.includes(activeItem.id)}
          onToggleSave={toggleSave}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  )
}

/* ---------- Gallery card ---------- */

function InspirationCard({
  item,
  saved,
  onOpen,
  onToggleSave,
}: {
  item: InspirationItem
  saved: boolean
  onOpen: () => void
  onToggleSave: () => void
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-softgrey bg-white transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-charcoal/25 hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="block aspect-[4/3] w-full overflow-hidden border-b border-softgrey text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-cta"
        aria-label={`Open ${item.template.name}`}
      >
        <InspirationThumbnail item={item} />
      </button>

      <button
        type="button"
        onClick={onToggleSave}
        className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-[7px] border border-black/10 bg-white/90 text-charcoal/50 opacity-0 shadow-sm backdrop-blur transition-opacity hover:text-charcoal focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2 group-hover:opacity-100"
        style={saved ? { opacity: 1, color: BRAND_INK } : undefined}
        aria-label={saved ? `Remove ${item.template.name} from saved` : `Save ${item.template.name}`}
        aria-pressed={saved}
        title={saved ? "Remove from saved" : "Save"}
      >
        <StarIcon filled={saved} />
      </button>

      <button type="button" onClick={onOpen} className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3 text-left focus-visible:outline-none">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/40">
            {item.template.category}
          </span>
          <h3
            className="mt-0.5 text-[16px] font-bold text-charcoal"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {item.template.name}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-charcoal/60">
            {item.palette.name} — {item.palette.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {item.palette.colours.map((c) => (
            <div
              key={c.role}
              className="group/swatch relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-black/8"
              style={{ background: c.hex }}
              title={`${c.role}: ${c.hex}`}
            >
              <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-charcoal/90 px-1.5 py-0.5 text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover/swatch:opacity-100">
                {c.role}
              </span>
            </div>
          ))}
        </div>
      </button>
    </div>
  )
}

const SearchIcon = () => (
  <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>
)
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m12 2.7 2.8 5.7 6.3.9-4.5 4.4 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.5-4.4 6.3-.9Z" />
  </svg>
)
