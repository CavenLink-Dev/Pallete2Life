// Learn page shell — sidebar navigation + header.
// Adapted from the Figma Make DocShell for hueframe-repo integration.

import { useEffect, useState, type ReactNode } from "react"
import { navFor, pages, BRAND } from "./content"
import { Icon, Logo, Check } from "./LearnUI"
import { useNav } from "../lib/router"

const POPULAR = ["design-tokens", "color-system", "components", "buttons", "accessibility"]

function SearchField({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(v => !v)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className="flex h-9 w-full min-w-0 items-center gap-2 rounded-full border border-learn-border bg-learn-surface px-3.5 text-left text-learn-muted transition-colors hover:border-learn-border-strong sm:w-64"
      >
        <Icon name="Search" className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-[13.5px]">Search the course…</span>
        <kbd className="hidden rounded border border-learn-border bg-learn-surface-2 px-1.5 font-mono text-[11px] text-learn-muted sm:inline">
          ⌘K
        </kbd>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-learn-border bg-learn-surface p-2 shadow-xl"
        >
          <p className="px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-learn-muted">Popular topics</p>
          {POPULAR.map(id => {
            const p = pages[id]
            if (!p) return null
            return (
              <button
                key={id}
                role="option"
                aria-selected="false"
                onMouseDown={() => { onNavigate(id); setOpen(false) }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-learn-surface-2"
              >
                <Icon name={p.icon} className="h-4 w-4 text-learn-ink" />
                <span className="flex-1 text-[13.5px] text-learn-heading">{p.title}</span>
                <Icon name="ArrowRight" className="h-3.5 w-3.5 text-learn-muted" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SidebarNav({
  currentId,
  onNavigate,
  completedIds,
}: {
  currentId: string
  onNavigate: (id: string) => void
  completedIds: Set<string>
}) {
  const nav = navFor()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const hueframeNav = useNav()

  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Course contents">
        {nav.map(group => {
          const open = !collapsed.has(group.id)
          return (
            <div key={group.id} className="mb-5">
              <button
                type="button"
                onClick={() => toggle(group.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-learn-heading transition-colors hover:text-white"
              >
                <Icon name={group.icon} className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <Icon
                  name="ChevronDown"
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`}
                />
              </button>
              {open && (
                <ul className="mt-1">
                  {group.items.map(item => {
                    const p = pages[item.id]
                    if (!p) return null
                    const active = item.id === currentId
                    const complete = completedIds.has(item.id)
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          aria-current={active ? "page" : undefined}
                          className={`group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13.5px] transition-colors ${
                            active
                              ? "bg-learn-ink/10 font-semibold text-learn-ink"
                              : "text-learn-muted hover:bg-learn-surface-2 hover:text-learn-heading"
                          }`}
                        >
                          <span className={`grid h-5 w-5 shrink-0 place-items-center rounded ${active ? "text-learn-ink" : "text-learn-muted group-hover:text-learn-ink"}`}>
                            {complete ? (
                              <Check className="h-3.5 w-3.5 text-learn-ink" />
                            ) : (
                              <Icon name={p.icon} className="h-4 w-4" />
                            )}
                          </span>
                          <span className="flex-1 leading-snug">{item.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-learn-border p-4">
        <a
          href="/quick-design"
          onClick={hueframeNav("/quick-design")}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-learn-ink px-4 text-[14px] font-semibold text-white transition-colors hover:opacity-90"
        >
          <Icon name="Bookmark" className="h-4 w-4" />
          Open Quick Design
        </a>
        <a
          href="/help"
          onClick={hueframeNav("/help")}
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-learn-border px-4 text-[13.5px] font-semibold text-learn-body transition-colors hover:border-learn-border-strong hover:text-learn-heading"
        >
          Help &amp; guide
        </a>
      </div>
    </div>
  )
}

export default function LearnShell({
  currentId,
  onNavigate,
  completedIds,
  children,
}: {
  currentId: string
  onNavigate: (id: string) => void
  completedIds: Set<string>
  children: ReactNode
}) {
  const [drawer, setDrawer] = useState(false)
  const hueframeNav = useNav()

  useEffect(() => { setDrawer(false) }, [currentId])

  const go = (id: string) => { onNavigate(id); setDrawer(false) }

  return (
    <div className="learn-theme min-h-full">
      <header className="sticky top-0 z-30 border-b border-learn-border bg-learn-bg/85 backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-learn-body hover:bg-learn-surface-2 lg:hidden"
            aria-label="Open navigation"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <Icon name="Menu" className="h-5 w-5" />
          </button>
          <a href="/" onClick={hueframeNav("/")} className="shrink-0" aria-label="Home">
            <Logo />
          </a>
          <span className="hidden text-[13px] text-learn-muted sm:inline">/</span>
          <span className="hidden text-[13px] font-semibold text-learn-body sm:inline">Learn</span>
          <div className="ml-auto flex items-center gap-2.5">
            <SearchField onNavigate={go} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 border-r border-learn-border bg-learn-surface/40 lg:block">
          <SidebarNav currentId={currentId} onNavigate={go} completedIds={completedIds} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-80 bg-learn-bg shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-learn-border px-4">
              <Logo />
              <button
                className="grid h-9 w-9 place-items-center rounded-lg text-learn-body hover:bg-learn-surface-2"
                aria-label="Close navigation"
                onClick={() => setDrawer(false)}
              >
                <Icon name="X" className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100%-3.5rem)]">
              <SidebarNav currentId={currentId} onNavigate={go} completedIds={completedIds} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
