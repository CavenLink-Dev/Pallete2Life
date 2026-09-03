import { useState, useMemo } from "react"
import {
  INSPIRATION_ITEMS,
  type InspirationCategory,
  type InspirationItem,
} from "../lib/inspirationCatalog"
import InspirationDetail from "../components/InspirationDetail"

const FAVORITES_KEY = "hueframe:inspiration-favorites"

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}
function saveFavorites(s: Set<string>) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...s])) } catch {}
}

type Filter = "all" | InspirationCategory | "saved"

const DOT: Record<InspirationCategory, string> = {
  Website: "bg-blue-400",
  App: "bg-violet-400",
  Component: "bg-emerald-400",
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  )
}

function Card({
  item,
  saved,
  onSave,
  onClick,
}: {
  item: InspirationItem
  saved: boolean
  onSave: (id: string) => void
  onClick: () => void
}) {
  return (
    <div
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-white border border-neutral-200/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
      onClick={onClick}
    >
      {/* Thumbnail — natural aspect ratio so nothing is cropped away */}
      <div className="overflow-hidden bg-neutral-100">
        <img
          src={item.imagePath}
          alt={item.displayName}
          loading="lazy"
          decoding="async"
          className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      {/* Label */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[item.category]}`} />
          <span className="text-[13px] font-medium text-neutral-800 truncate leading-none">
            {item.displayName}
          </span>
        </div>
        <button
          aria-label={saved ? "Remove from saved" : "Save"}
          onClick={e => { e.stopPropagation(); onSave(item.id) }}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
            saved
              ? "text-amber-500"
              : "text-neutral-300 opacity-0 group-hover:opacity-100 hover:text-amber-400"
          }`}
        >
          <StarIcon filled={saved} />
        </button>
      </div>
    </div>
  )
}

export default function Examples() {
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")
  const [saved, setSaved] = useState<Set<string>>(loadFavorites)
  const [active, setActive] = useState<InspirationItem | null>(null)

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveFavorites(next)
      return next
    })
  }

  const counts = useMemo(
    () => ({
      all:       INSPIRATION_ITEMS.length,
      Website:   INSPIRATION_ITEMS.filter(i => i.category === "Website").length,
      App:       INSPIRATION_ITEMS.filter(i => i.category === "App").length,
      Component: INSPIRATION_ITEMS.filter(i => i.category === "Component").length,
      saved:     saved.size,
    }),
    [saved],
  )

  const items = useMemo(() => {
    let list =
      filter === "saved"
        ? INSPIRATION_ITEMS.filter(i => saved.has(i.id))
        : filter === "all"
        ? INSPIRATION_ITEMS
        : INSPIRATION_ITEMS.filter(i => i.category === (filter as InspirationCategory))

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        i =>
          i.displayName.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      )
    }
    return list
  }, [filter, search, saved])

  const FILTERS: { label: string; value: Filter }[] = [
    { label: "All",        value: "all" },
    { label: "Websites",   value: "Website" },
    { label: "Apps",       value: "App" },
    { label: "Components", value: "Component" },
    { label: "Saved",      value: "saved" },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 pb-16">
      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Title */}
          <div className="flex-shrink-0">
            <h1 className="text-white font-semibold text-base leading-none">Inspiration</h1>
            <p className="text-neutral-500 text-xs mt-0.5">95 real designs · apply any palette</p>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search designs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {FILTERS.map(f => {
              const cnt = counts[f.value as keyof typeof counts]
              const active = filter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-white text-neutral-900"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {f.label}
                  <span className={active ? "text-neutral-400" : "text-neutral-600"}>
                    {cnt}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-600">
            <p className="text-base font-medium">No designs found</p>
            <p className="text-sm mt-1">
              {filter === "saved" ? "Save a design to see it here" : "Try a different search term"}
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {items.map(item => (
              <div key={item.id} className="break-inside-avoid">
                <Card
                  item={item}
                  saved={saved.has(item.id)}
                  onSave={toggleSave}
                  onClick={() => setActive(item)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail modal ────────────────────────────────────────────────── */}
      {active && (
        <InspirationDetail
          item={active}
          saved={saved.has(active.id)}
          onToggleSave={toggleSave}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}
