import { useEffect, useMemo, useState } from "react"
import {
  BRAND,
  colorName,
  normalizeHex,
  randomHex,
  readableOn,
  uid,
  type Swatch,
} from "../lib/color"
import { loadPalette, savePalette, writeHashPalette } from "../lib/paletteStore"
import PublicFooter from "../components/PublicFooter"
import PublicHeader from "../components/PublicHeader"
import BrandUpload from "../components/BrandUpload"
import type { Brand } from "../components/PreviewCtx"
import { useToast } from "../components/Toast"
import {
  LiveChangePreview,
  type LivePreviewKind,
  type LiveRole,
  type LiveRoleColors,
} from "../components/LiveChangePreviews"
import { createTokenSystem } from "../lib/tokenSystem"
import { ACCESSIBILITY_STATUS_LABEL, evaluateAccessibility, worstAccessibilityStatus } from "../lib/accessibility"

const STORE_KEY = "hueframe:v1"
const MAX_COLOURS = 8
const MIN_COLOURS = 2

const ROLE_OPTIONS: { key: LiveRole; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "button", label: "Button" },
  { key: "text", label: "Text" },
  { key: "border", label: "Border" },
  { key: "accent", label: "Accent" },
]

const PREVIEW_OPTIONS: { key: LivePreviewKind; label: string }[] = [
  { key: "website", label: "Basic Website" },
  { key: "app", label: "Basic App" },
  { key: "components", label: "Basic Components" },
]

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return fallback
    return JSON.parse(raw)?.[key] ?? fallback
  } catch {
    return fallback
  }
}

function saveStored(key: string, value: unknown) {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const data = raw ? JSON.parse(raw) : {}
    data[key] = value
    localStorage.setItem(STORE_KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable */
  }
}

function defaultRoleBindings(palette: Swatch[]): Record<LiveRole, string> {
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

function loadRoleBindings(palette: Swatch[]): Record<LiveRole, string> {
  const defaults = defaultRoleBindings(palette)
  const stored = loadStored<Partial<Record<LiveRole, string>>>("liveRoles", {})
  const ids = new Set(palette.map((swatch) => swatch.id))
  return Object.fromEntries(ROLE_OPTIONS.map(({ key }) => [key, ids.has(stored[key] ?? "") ? stored[key] : defaults[key]])) as Record<LiveRole, string>
}

/* #LiveChangesPage /live-changes - quick palette testing with three previews. */
export default function LiveChanges() {
  const toast = useToast()
  const [palette, setPalette] = useState<Swatch[]>(loadPalette)
  const [roles, setRoles] = useState<Record<LiveRole, string>>(() => loadRoleBindings(palette))
  const [brand, setBrand] = useState<Brand>(() => loadStored("brand", { name: "Palette Preview", logo: null, symbol: null }))
  const [brandOpen, setBrandOpen] = useState(false)
  const [preview, setPreview] = useState<LivePreviewKind>("website")

  useEffect(() => {
    savePalette(palette)
    writeHashPalette(palette)
  }, [palette])
  useEffect(() => saveStored("liveRoles", roles), [roles])
  useEffect(() => saveStored("brand", brand), [brand])

  const paletteById = useMemo(() => new Map(palette.map((swatch) => [swatch.id, swatch])), [palette])
  const colours = useMemo(() => Object.fromEntries(
    ROLE_OPTIONS.map(({ key }) => [key, paletteById.get(roles[key])?.hex ?? palette[0]?.hex ?? "#FFFFFF"]),
  ) as LiveRoleColors, [palette, paletteById, roles])
  const accessibilityChecks = useMemo(() => evaluateAccessibility({
    brand: colours.button,
    accent: colours.button,
    secondary: colours.accent,
    ink: colours.text,
    inkSoft: colours.text,
    inkFaint: colours.border,
    paper: colours.background,
    surface: colours.surface,
    border: colours.border,
    onBrand: readableOn(colours.button),
    onInk: readableOn(colours.text),
  }, createTokenSystem(palette)), [colours, palette])

  const changeColour = (id: string, value: string) => {
    const hex = normalizeHex(value)
    setPalette((current) => current.map((swatch) => swatch.id === id ? { ...swatch, hex, name: colorName(hex) } : swatch))
  }

  const randomise = () => {
    if (!palette.some((swatch) => !swatch.locked)) {
      toast.push("Unlock a colour to randomise", "error")
      return
    }
    setPalette((current) => current.map((swatch) => {
      if (swatch.locked) return swatch
      const hex = randomHex()
      return { ...swatch, hex, name: colorName(hex) }
    }))
  }

  const addColour = () => {
    if (palette.length >= MAX_COLOURS) {
      toast.push("Quick Palette supports up to 8 colours", "error")
      return
    }
    const hex = randomHex()
    setPalette((current) => [...current, { id: uid(), hex, name: colorName(hex) }])
  }

  const removeColour = (id: string) => {
    if (palette.length <= MIN_COLOURS) {
      toast.push("Keep at least 2 colours in your palette", "error")
      return
    }
    const fallback = palette.find((swatch) => swatch.id !== id)
    setPalette((current) => current.filter((swatch) => swatch.id !== id))
    if (fallback) {
      setRoles((current) => Object.fromEntries(
        ROLE_OPTIONS.map(({ key }) => [key, current[key] === id ? fallback.id : current[key]]),
      ) as Record<LiveRole, string>)
    }
  }

  const toggleLock = (id: string) => {
    setPalette((current) => current.map((swatch) => swatch.id === id ? { ...swatch, locked: !swatch.locked } : swatch))
  }

  return (
    <div className="flex min-h-full flex-col bg-offwhite text-charcoal">
      <PublicHeader />
      <main className="flex-1">
        <section className="border-b border-softgrey bg-white px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[30px] font-bold leading-tight sm:text-[38px]" style={{ fontFamily: "var(--font-display)" }}>
                  Live Changes
                </h1>
                <p className="mt-2 text-sm text-charcoal/55">Quick Palette <span aria-hidden>·</span> Changes save automatically</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={randomise} className="inline-flex h-10 items-center gap-2 rounded-lg border border-softgrey bg-white px-3.5 text-sm font-semibold hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]">
                  <ShuffleIcon /> Randomise
                </button>
                <button type="button" onClick={addColour} disabled={palette.length >= MAX_COLOURS} className="inline-flex h-10 items-center gap-2 rounded-lg bg-charcoal px-3.5 text-sm font-semibold text-white hover:bg-[#263542] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]">
                  <PlusIcon /> Add colour
                </button>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8">
              {palette.map((swatch) => (
                <PaletteColour
                  key={swatch.id}
                  swatch={swatch}
                  canRemove={palette.length > MIN_COLOURS}
                  onChange={changeColour}
                  onLock={toggleLock}
                  onRemove={removeColour}
                />
              ))}
            </div>

            <div className="mt-8 grid gap-8 border-t border-softgrey pt-7 lg:grid-cols-[1fr_280px]">
              <div>
                <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>Visual roles</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ROLE_OPTIONS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 rounded-lg border border-softgrey bg-offwhite px-3 py-2.5">
                      <span className="h-7 w-7 shrink-0 rounded-md border border-black/10" style={{ background: colours[key] }} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-semibold text-charcoal/50">{label}</span>
                        <select
                          value={roles[key]}
                          onChange={(event) => setRoles((current) => ({ ...current, [key]: event.target.value }))}
                          className="block w-full appearance-none bg-transparent text-sm font-semibold outline-none"
                          aria-label={`${label} colour`}
                        >
                          {palette.map((swatch) => <option key={swatch.id} value={swatch.id}>{swatch.name} ({swatch.hex})</option>)}
                        </select>
                      </span>
                      <ChevronIcon />
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-softgrey pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>Brand</h2>
                <div className="mt-3 flex items-center gap-3">
                  <BrandThumb brand={brand} accent={colours.accent} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{brand.name || "Company name"}</p>
                    <p className="text-xs text-charcoal/45">Logo and app icon</p>
                  </div>
                  <button type="button" onClick={() => setBrandOpen(true)} className="rounded-lg border border-softgrey bg-white px-3 py-2 text-xs font-semibold hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]">
                    Edit
                  </button>
                </div>
              </div>
            </div>
            <LiveAccessibilitySummary checks={accessibilityChecks} />
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[24px] font-bold sm:text-[28px]" style={{ fontFamily: "var(--font-display)" }}>Live preview</h2>
                <p className="mt-1 text-sm text-charcoal/50">3 free preview options</p>
              </div>
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-softgrey bg-white" role="tablist" aria-label="Live preview options">
                {PREVIEW_OPTIONS.map((option) => {
                  const active = preview === option.key
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setPreview(option.key)}
                      className="min-h-10 border-l border-softgrey px-3 py-2 text-xs font-semibold first:border-l-0 sm:px-4 sm:text-sm"
                      style={active ? { background: BRAND.charcoal, color: BRAND.white } : { color: BRAND.medgrey }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-lg border border-softgrey bg-white shadow-sm" role="tabpanel">
              <LiveChangePreview kind={preview} colours={colours} brand={brand} />
              <LiveAccessibilityBadge checks={accessibilityChecks} />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />

      {brandOpen && <BrandUpload brand={brand} onChange={setBrand} onClose={() => setBrandOpen(false)} />}
    </div>
  )
}

function LiveAccessibilitySummary({ checks }: { checks: ReturnType<typeof evaluateAccessibility> }) {
  return <div className="mt-6 border-t border-softgrey pt-5"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase text-charcoal/45">Accessibility</span>{checks.map((check) => <span key={check.id} className={`rounded-[6px] px-2 py-1 text-[10.5px] font-semibold ${check.status === "good" ? "bg-[#ecfdf3] text-[#067647]" : check.status === "review" ? "bg-[#fff7ed] text-[#9a3412]" : "bg-[#fef2f2] text-[#b42318]"}`} title={check.status === "good" ? check.value : `${check.value}. ${check.suggestion}`}>{check.label}: {ACCESSIBILITY_STATUS_LABEL[check.status]}</span>)}</div></div>
}

function LiveAccessibilityBadge({ checks }: { checks: ReturnType<typeof evaluateAccessibility> }) {
  const status = worstAccessibilityStatus(checks)
  return <span className={`pointer-events-none absolute bottom-3 left-3 rounded-[6px] border px-2.5 py-1.5 text-[10.5px] font-semibold shadow-sm ${status === "good" ? "border-[#a7e0c2] bg-[#ecfdf3] text-[#067647]" : status === "review" ? "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]" : "border-[#fecaca] bg-[#fef2f2] text-[#b42318]"}`}>Accessibility: {ACCESSIBILITY_STATUS_LABEL[status]}</span>
}

function PaletteColour({
  swatch,
  canRemove,
  onChange,
  onLock,
  onRemove,
}: {
  swatch: Swatch
  canRemove: boolean
  onChange: (id: string, value: string) => void
  onLock: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [draft, setDraft] = useState(swatch.hex)

  useEffect(() => setDraft(swatch.hex), [swatch.hex])

  const commitDraft = () => {
    const hex = normalizeHex(draft)
    setDraft(hex)
    onChange(swatch.id, hex)
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-softgrey bg-white">
      <label className="relative block h-16 cursor-pointer border-b border-softgrey" style={{ background: swatch.hex }} title={`Edit ${swatch.name}`}>
        <input type="color" value={swatch.hex} onChange={(event) => onChange(swatch.id, event.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`Edit ${swatch.name}`} />
      </label>
      <div className="flex items-center gap-1.5 px-2 py-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur() }}
          className="min-w-0 flex-1 bg-transparent font-mono text-xs font-semibold uppercase outline-none"
          aria-label={`${swatch.name} hex colour`}
        />
        <button type="button" onClick={() => onLock(swatch.id)} className="rounded p-1 text-charcoal/50 hover:bg-offwhite hover:text-charcoal" aria-label={swatch.locked ? `Unlock ${swatch.name}` : `Lock ${swatch.name}`} title={swatch.locked ? "Unlock colour" : "Lock colour"}>
          {swatch.locked ? <LockedIcon /> : <UnlockedIcon />}
        </button>
        <button type="button" onClick={() => onRemove(swatch.id)} disabled={!canRemove} className="rounded p-1 text-charcoal/50 hover:bg-offwhite hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-25" aria-label={`Delete ${swatch.name}`} title="Delete colour">
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

function BrandThumb({ brand, accent }: { brand: Brand; accent: string }) {
  if (brand.symbol) return <img src={brand.symbol} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: accent }} aria-hidden>
      {(brand.name || "P").trim().charAt(0).toUpperCase()}
    </span>
  )
}

const ShuffleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
const ChevronIcon = () => <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-charcoal/35"><path d="m6 9 6 6 6-6" /></svg>
const LockedIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
const UnlockedIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.6-1.7" /></svg>
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" /></svg>
