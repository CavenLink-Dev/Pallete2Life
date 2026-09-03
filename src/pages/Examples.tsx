import { useState, useMemo, useRef, useEffect } from "react"
import {
  INSPIRATION_ITEMS,
  SUBCATEGORIES,
  type InspirationCategory,
  type InspirationItem,
} from "../lib/inspirationCatalog"
import { BRAND } from "../lib/color"
import { useNav } from "../lib/router"
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

/* ── Icons ──────────────────────────────────────────────────────────── */

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth={2} fill="none" />
    </svg>
  )
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}

/* ── Card ───────────────────────────────────────────────────────────── */

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
    <div className="group cursor-pointer" onClick={onClick}>
      {/* Dark card with inset screenshot */}
      <div className="rounded-2xl bg-neutral-800/80 p-3 transition-all duration-200 group-hover:bg-neutral-700/80 group-hover:shadow-xl group-hover:shadow-black/30 group-hover:-translate-y-0.5">
        <div className="overflow-hidden rounded-xl">
          <img
            src={item.imagePath}
            alt={item.displayName}
            loading="lazy"
            decoding="async"
            className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* Info row below the card — icon + name + save */}
      <div className="flex items-center gap-2.5 px-1 pt-3 pb-1">
        <span className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white/90 ${DOT[item.category]}`}>
          {item.category[0]}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-white truncate leading-tight">
            {item.displayName}
          </p>
          <p className="text-[11px] text-neutral-500 truncate leading-tight mt-0.5">
            {item.subcategory} · {item.palette.name}
          </p>
        </div>

        <button
          aria-label={saved ? "Remove from saved" : "Save"}
          onClick={e => { e.stopPropagation(); onSave(item.id) }}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
            saved
              ? "text-amber-500"
              : "text-neutral-600 opacity-0 group-hover:opacity-100 hover:text-amber-400"
          }`}
        >
          <StarIcon filled={saved} />
        </button>
      </div>
    </div>
  )
}

/* ── Category filter with subcategory dropdown ────────────────────────── */

function CategoryFilterButton({
  category,
  label,
  count,
  isActive,
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
}: {
  category: InspirationCategory
  label: string
  count: number
  isActive: boolean
  activeSubcategory: string | null
  onSelectCategory: () => void
  onSelectSubcategory: (sub: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("mousedown", onClick)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("mousedown", onClick)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const subs = SUBCATEGORIES[category]

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => {
          if (!isActive) {
            onSelectCategory()
            setOpen(true)
          } else {
            setOpen(o => !o)
          }
        }}
        className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
          isActive
            ? "bg-white text-neutral-900"
            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
        }`}
      >
        {label}
        <span className={isActive ? "text-neutral-400" : "text-neutral-600"}>{count}</span>
        <ChevronDown open={open && isActive} />
      </button>

      {open && isActive && (
        <div className="absolute left-0 top-full mt-2 z-20 min-w-[180px] rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl shadow-black/50 py-1.5 overflow-hidden">
          <button
            onClick={() => { onSelectSubcategory(null); setOpen(false) }}
            className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
              activeSubcategory === null
                ? "text-white bg-neutral-800"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            All {label}
          </button>
          <div className="h-px bg-neutral-800 my-1" />
          {subs.map(sub => (
            <button
              key={sub}
              onClick={() => { onSelectSubcategory(sub); setOpen(false) }}
              className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                activeSubcategory === sub
                  ? "text-white bg-neutral-800"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default function Examples() {
  const nav = useNav()
  const [filter, setFilter] = useState<Filter>("all")
  const [subcategory, setSubcategory] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [saved, setSaved] = useState<Set<string>>(loadFavorites)
  const [activeId, setActiveId] = useState<string | null>(null)

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveFavorites(next)
      return next
    })
  }

  const selectCategory = (cat: Filter) => {
    setFilter(prev => {
      // Toggle off if clicking the already-active filter (except "all")
      if (prev === cat && cat !== "all") {
        setSubcategory(null)
        return "all"
      }
      setSubcategory(null)
      return cat
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

    if (subcategory && (filter === "Website" || filter === "App" || filter === "Component")) {
      list = list.filter(i => i.subcategory === subcategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        i =>
          i.displayName.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.subcategory.toLowerCase().includes(q),
      )
    }
    return list
  }, [filter, subcategory, search, saved])

  // Keep the open detail modal pointed at the same design even if the
  // background list is re-filtered — never let it silently jump to
  // whatever now sits at the old numeric index.
  const activeIndex = activeId ? items.findIndex(i => i.id === activeId) : -1
  useEffect(() => {
    if (activeId && activeIndex === -1) setActiveId(null)
  }, [activeId, activeIndex])

  const CATS: { label: string; value: InspirationCategory }[] = [
    { label: "Websites",   value: "Website" },
    { label: "Apps",       value: "App" },
    { label: "Components", value: "Component" },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 pb-16">
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-[1400px] mx-auto px-4 py-2.5">
          <div className="flex items-center gap-4">

            {/* LEFT — Logo + Inspiration */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href="/"
                onClick={nav("/")}
                className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                aria-label="HueSet home"
              >
                <img src="/logo-64.png" alt="" className="w-8 h-8 object-contain" />
                <span className="text-white font-bold text-[17px] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                  Hue<span style={{ color: BRAND.cta }}>Set</span>
                </span>
              </a>
              <span className="w-px h-5 bg-neutral-700" />
              <h1 className="text-white font-semibold text-sm leading-none">Inspiration</h1>
            </div>

            {/* CENTER — Search + Filters */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
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

              {/* Filter pills — All + category dropdowns */}
              <div className="hidden sm:flex items-center gap-1 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => selectCategory("all")}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === "all"
                      ? "bg-white text-neutral-900"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  All
                  <span className={filter === "all" ? "text-neutral-400" : "text-neutral-600"}>{counts.all}</span>
                </button>

                {CATS.map(c => (
                  <CategoryFilterButton
                    key={c.value}
                    category={c.value}
                    label={c.label}
                    count={counts[c.value]}
                    isActive={filter === c.value}
                    activeSubcategory={filter === c.value ? subcategory : null}
                    onSelectCategory={() => selectCategory(c.value)}
                    onSelectSubcategory={setSubcategory}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT — Saved + Profile */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => selectCategory("saved")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "saved"
                    ? "bg-white text-neutral-900"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
                aria-pressed={filter === "saved"}
              >
                <BookmarkIcon />
                <span className="hidden sm:inline">Saved</span>
                {saved.size > 0 && (
                  <span className="text-xs tabular-nums text-neutral-500">
                    {saved.size}
                  </span>
                )}
              </button>

              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Profile"
              >
                <UserIcon />
                <span className="hidden sm:inline">Profile</span>
              </button>
            </div>

          </div>

          {/* Active subcategory chip — visible summary of the drilldown */}
          {subcategory && (filter === "Website" || filter === "App" || filter === "Component") && (
            <div className="hidden sm:flex items-center gap-2 mt-2">
              <span className="text-neutral-500 text-xs">Filtered by:</span>
              <button
                onClick={() => setSubcategory(null)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
              >
                {subcategory}
                <span className="text-neutral-500">×</span>
              </button>
            </div>
          )}

          {/* Mobile filter row — shown below on small screens */}
          <div className="flex sm:hidden gap-1 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => selectCategory("all")}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === "all"
                  ? "bg-white text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              All
              <span className={filter === "all" ? "text-neutral-400" : "text-neutral-600"}>{counts.all}</span>
            </button>
            {CATS.map(c => {
              const isActive = filter === c.value
              return (
                <button
                  key={c.value}
                  onClick={() => selectCategory(c.value)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-white text-neutral-900"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {c.label}
                  <span className={isActive ? "text-neutral-400" : "text-neutral-600"}>{counts[c.value]}</span>
                </button>
              )
            })}
          </div>

          {/* Mobile subcategory row */}
          {(filter === "Website" || filter === "App" || filter === "Component") && (
            <div className="flex sm:hidden gap-1 mt-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <button
                onClick={() => setSubcategory(null)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                  subcategory === null
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-500 hover:text-white"
                }`}
              >
                All
              </button>
              {SUBCATEGORIES[filter].map(sub => (
                <button
                  key={sub}
                  onClick={() => setSubcategory(sub)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    subcategory === sub
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Grid — 3 columns on desktop ────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 pt-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-600">
            <p className="text-base font-medium">No designs found</p>
            <p className="text-sm mt-1">
              {filter === "saved" ? "Save a design to see it here" : "Try a different search term"}
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {items.map(item => (
              <div key={item.id} className="break-inside-avoid">
                <Card
                  item={item}
                  saved={saved.has(item.id)}
                  onSave={toggleSave}
                  onClick={() => setActiveId(item.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail viewer ──────────────────────────────────────────── */}
      {activeIndex !== -1 && items[activeIndex] && (
        <InspirationDetail
          items={items}
          currentIndex={activeIndex}
          onNavigate={idx => setActiveId(items[idx]?.id ?? null)}
          saved={saved.has(items[activeIndex].id)}
          onToggleSave={toggleSave}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  )
}
