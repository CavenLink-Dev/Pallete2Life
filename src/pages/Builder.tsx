import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BRAND, deriveTheme, normalizeHex, randomHex, readableOn, uid, withAlpha, type Swatch } from "../lib/color"
import PalettePanel from "../components/PalettePanel"
import {
  BUTTON_STYLES,
  ButtonLab,
  DEFAULT_BUTTON_PROPS,
  STYLE_META,
  paletteToTrio,
  styleThumb,
  type ButtonProps,
  type ButtonStyle,
} from "../components/ButtonPreview"
import {
  GROUPS,
  TemplateThumb,
  renderComponentPreview,
  type GroupKey,
} from "../components/Previews"
import { PreviewProvider, ScopeProvider, type Brand, type PreviewCtxValue } from "../components/PreviewCtx"
import BrandUpload from "../components/BrandUpload"
import { useNav, useRoute } from "../lib/router"
import { useToast } from "../components/Toast"
import ConfirmDialog from "../components/ConfirmDialog"
import IntroTour, { markIntroSeen, shouldShowIntro } from "../components/IntroTour"
import PaywallOverlay from "../components/PaywallOverlay"
import {
  FREE_PREVIEW_LIMIT,
  freeRemaining,
  loadEntitlement,
  needsPaywall,
  previewKey,
  recordSwitch,
  saveEntitlement,
  type Entitlement,
} from "../lib/entitlement"
import AccessibilityPanel, { ColourblindFilters, type ColourblindMode } from "../components/AccessibilityPanel"
import ExportPanel from "../components/ExportPanel"

type Selection = { group: GroupKey; sub: string }

const START_NAMES = ["Primary", "Secondary", "Tertiary", "Quaternary", "Quinary", "Senary"]

/* localStorage persistence */
const STORE_KEY = "hueframe:v1"
function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return fallback
    const data = JSON.parse(raw)
    return data?.[key] ?? fallback
  } catch { return fallback }
}
function useStored(key: string, value: unknown) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      const data = raw ? JSON.parse(raw) : {}
      data[key] = value
      localStorage.setItem(STORE_KEY, JSON.stringify(data))
    } catch { /* storage unavailable — ignore */ }
  }, [key, value])
}

const initialPalette: Swatch[] = [
  { id: uid(), name: "Primary", hex: BRAND.brand },
  { id: uid(), name: "Secondary", hex: BRAND.charcoal },
  { id: uid(), name: "Tertiary", hex: BRAND.offwhite },
]

const MAX_HISTORY = 40
const GROUP_ICONS: Record<GroupKey, string> = { website: "▦", mobile: "▯", components: "◉" }

export default function Builder() {
  const navHome = useNav()
  const [, navigate] = useRoute()
  const toast = useToast()

  // ---------- palette + design state ----------
  const [palette, setPalette] = useState<Swatch[]>(() => loadStored("palette", initialPalette))
  const [sel, setSel] = useState<Selection>({ group: "website", sub: "landing" })
  const [tplBySub, setTplBySub] = useState<Record<string, string>>({})
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>(() => loadStored("buttonStyle", "depth" as ButtonStyle))
  const [buttonProps, setButtonProps] = useState<ButtonProps>(() => loadStored("buttonProps", DEFAULT_BUTTON_PROPS))

  // Edit Elements
  const [editMode, setEditMode] = useState(false)
  const [assignments, setAssignments] = useState<Record<string, string>>(() => loadStored("assignments", {}))
  const [assignTarget, setAssignTarget] = useState<{ id: string; label: string } | null>(null)

  // Brand
  const [brand, setBrand] = useState<Brand>(() => loadStored("brand", { name: "Pallet Preview", logo: null, symbol: null }))
  const [brandOpen, setBrandOpen] = useState(false)

  // Overlays
  const [previewPickerOpen, setPreviewPickerOpen] = useState(false)
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false)
  const [a11yOpen, setA11yOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  // Accessibility: colour-blindness simulation applied to the preview
  const [cbMode, setCbMode] = useState<ColourblindMode>("off")

  // Undo / Redo
  const [undoStack, setUndoStack] = useState<Swatch[][]>([])
  const [redoStack, setRedoStack] = useState<Swatch[][]>([])
  const skipHistory = useRef(false)

  // Free / Pro entitlement
  const [ent, setEnt] = useState<Entitlement>(loadEntitlement)
  useEffect(() => { saveEntitlement(ent) }, [ent])
  const [paywall, setPaywall] = useState<{ open: boolean; reason?: string }>({ open: false })
  const remaining = freeRemaining(ent)
  const remainingLabel = ent.isPro ? null : `${remaining} preview${remaining === 1 ? "" : "s"} left`

  useStored("palette", palette)
  useStored("assignments", assignments)
  useStored("brand", brand)
  useStored("buttonStyle", buttonStyle)
  useStored("buttonProps", buttonProps)

  // First-visit tour
  useEffect(() => { if (shouldShowIntro()) setHelpOpen(true) }, [])
  const closeHelp = useCallback(() => { markIntroSeen(); setHelpOpen(false) }, [])

  // Fullscreen Escape
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [fullscreen])

  // Undo history mutator
  const mutatePalette = useCallback((updater: (prev: Swatch[]) => Swatch[]) => {
    setPalette((prev) => {
      const next = updater(prev)
      if (!skipHistory.current && JSON.stringify(prev) !== JSON.stringify(next)) {
        setUndoStack((s) => (s.length >= MAX_HISTORY ? [...s.slice(1), prev] : [...s, prev]))
        setRedoStack([])
      }
      skipHistory.current = false
      return next
    })
  }, [])

  const undo = useCallback(() => {
    setUndoStack((s) => {
      if (!s.length) { toast.push("Nothing to undo"); return s }
      const prev = s[s.length - 1]
      setRedoStack((r) => [...r, palette])
      skipHistory.current = true
      setPalette(prev)
      toast.push("Undone")
      return s.slice(0, -1)
    })
  }, [palette, toast])

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (!r.length) { toast.push("Nothing to redo"); return r }
      const next = r[r.length - 1]
      setUndoStack((s) => [...s, palette])
      skipHistory.current = true
      setPalette(next)
      toast.push("Redone")
      return r.slice(0, -1)
    })
  }, [palette, toast])

  // Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z / Cmd/Ctrl+Y
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return
      if (mod && !e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); undo() }
      else if (mod && ((e.shiftKey && e.key.toLowerCase() === "z") || e.key.toLowerCase() === "y")) { e.preventDefault(); redo() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [undo, redo])

  const currentGroup = GROUPS.find((g) => g.key === sel.group)!
  const currentSub = currentGroup.subs.find((s) => s.key === sel.sub) ?? currentGroup.subs[0]
  const templates = currentSub.templates
  const tpl = tplBySub[sel.sub] ?? templates[0]?.key ?? ""
  const isButton = sel.group === "components" && sel.sub === "button"
  const currentTemplateLabel = isButton
    ? STYLE_META[buttonStyle].label
    : templates.find((t) => t.key === tpl)?.label ?? ""

  const theme = useMemo(() => deriveTheme(palette), [palette])
  const trio = useMemo(() => paletteToTrio(palette), [palette])

  // ---------- entitlement-aware preview switching ----------
  const goPro = () => { setPaywall({ open: false }); navigate("/pricing") }
  const dismissPaywall = () => setPaywall({ open: false })

  const trySelectPreview = useCallback((next: Selection): boolean => {
    const key = previewKey(next.group, next.sub)
    if (needsPaywall(ent, key)) {
      setPaywall({ open: true, reason: `You've used all ${FREE_PREVIEW_LIMIT} of your free previews. Unlock Pro to keep exploring — your current work stays exactly where it is.` })
      return false
    }
    setSel(next)
    setEnt((e) => recordSwitch(e, key))
    return true
  }, [ent])

  // ---------- palette mutations ----------
  const change = (id: string, hex: string) => mutatePalette((p) => p.map((s) => (s.id === id ? { ...s, hex } : s)))
  const rename = (id: string, name: string) => mutatePalette((p) => p.map((s) => (s.id === id ? { ...s, name: name.trim() || s.name } : s)))
  const add = () => { mutatePalette((p) => [...p, { id: uid(), name: START_NAMES[p.length] ?? `Colour ${p.length + 1}`, hex: randomHex() }]); toast.push("Colour added", "success") }
  const remove = (id: string) => mutatePalette((p) => (p.length > 1 ? p.filter((s) => s.id !== id) : p))
  const randomize = () => {
    if (!palette.some((s) => !s.locked)) { toast.push("All colours are locked — unlock one to randomise", "error"); return }
    mutatePalette((p) => p.map((s) => (s.locked ? s : { ...s, hex: randomHex() })))
  }
  const toggleLock = (id: string) => mutatePalette((p) => p.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s)))

  const doReset = () => {
    skipHistory.current = false
    setUndoStack((u) => [...u, palette])
    setRedoStack([])
    skipHistory.current = true
    setPalette(initialPalette.map((s) => ({ ...s, id: uid() })))
    setAssignments({})
    setConfirmReset(false)
    toast.push("Palette reset — Undo brings it back", "success")
  }

  const selectTpl = (key: string) => setTplBySub((m) => ({ ...m, [sel.sub]: key }))

  const roleLabels = isButton ? STYLE_META[buttonStyle].roles.map((r) => r.part) : undefined

  const ctx: PreviewCtxValue = {
    editMode,
    assignments,
    requestAssign: (id, label) => setAssignTarget({ id, label }),
    roleColor: (swatchId) => palette.find((s) => s.id === swatchId)?.hex,
    brand,
    buttonStyle,
    buttonProps,
    trio,
  }

  // Colour-blindness filter CSS
  const cbFilter = cbMode === "off" ? undefined : `url(#cb-${cbMode})`

  return (
    <div className="flex h-full flex-col bg-offwhite text-charcoal">
      <ColourblindFilters />

      {/* ================= Row 1: slim brand header ================= */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-softgrey/70 bg-white/90 px-3 py-1.5 backdrop-blur sm:flex-nowrap sm:px-5">
        <a
          href="/"
          onClick={navHome("/")}
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
          aria-label="Pallet Preview — home"
        >
          <img src="/app-icon-64.png" alt="" width={24} height={24} className="h-6 w-6 rounded-md" />
          <h1 className="text-[13px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Pallet <span style={{ color: BRAND.brand }}>Preview</span>
          </h1>
        </a>

        <div className="flex flex-wrap items-center gap-1.5 sm:flex-nowrap sm:gap-2">
          {/* Save status */}
          <span
            className="hidden items-center gap-1.5 text-[11px] font-medium text-charcoal/55 sm:inline-flex"
            title="Your palette is saved in your browser"
            aria-label="Saved locally in your browser"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#0E8A4E" }} />
            Saved locally
          </span>
          {/* Free-preview counter */}
          {remainingLabel && (
            <button
              type="button"
              onClick={() => navigate("/pricing")}
              title="Free tier — click to see Pro"
              className="inline-flex items-center gap-1.5 rounded-full border border-softgrey bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-charcoal/55 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
              aria-label={`${remainingLabel}. Open pricing.`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: remaining > 0 ? BRAND.brand : "#C22F2F" }} />
              {remainingLabel}
            </button>
          )}
          {/* Utility group */}
          <span className="mx-1 hidden h-4 w-px bg-softgrey sm:inline-block" aria-hidden />
          <IconButton onClick={undo} disabled={!undoStack.length} label="Undo" title="Undo last change (Ctrl/Cmd+Z)"><UndoIcon /></IconButton>
          <IconButton onClick={redo} disabled={!redoStack.length} label="Redo" title="Redo (Ctrl/Cmd+Shift+Z)"><RedoIcon /></IconButton>
          <IconButton onClick={() => setConfirmReset(true)} label="Reset" title="Reset the palette to defaults"><ResetIcon /></IconButton>
          <IconButton onClick={() => setHelpOpen(true)} label="Help" title="How Pallet Preview works"><HelpIcon /></IconButton>
        </div>
      </header>

      {/* ================= Row 2: palette bar (with Randomise) ================= */}
      <section className="shrink-0 border-b border-softgrey/70 bg-white px-3 py-2 sm:px-5">
        <PalettePanel
          palette={palette}
          onChange={change}
          onAdd={add}
          onRemove={remove}
          onRandomize={randomize}
          onToggleLock={toggleLock}
          onRename={rename}
          brand={BRAND.brand}
          roleLabels={roleLabels}
        />
      </section>

      {/* ================= Row 3: main tools ================= */}
      <section className="shrink-0 border-b border-softgrey/70 bg-white/80 px-2 py-1.5 backdrop-blur sm:px-4" aria-label="Design tools">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <ToolButton
            onClick={() => setPreviewPickerOpen(true)}
            icon={<PreviewIcon />}
            label="Preview"
            valueLabel={`${currentGroup.label} · ${currentSub.label}`}
            title="Choose what to preview"
          />
          <ToolButton
            onClick={() => setTemplatePickerOpen(true)}
            icon={<TemplateIcon />}
            label="Templates"
            valueLabel={currentTemplateLabel}
            title={isButton ? "Choose button style" : "Choose template"}
          />
          <ToolButton
            onClick={() => setEditMode((v) => !v)}
            icon={<EditIcon />}
            label="Edit Elements"
            active={editMode}
            title={editMode ? "Turn off Edit Elements" : "Click elements in the preview to change their colour"}
          />
          <ToolButton
            onClick={() => setBrandOpen(true)}
            icon={<BrandIcon />}
            label="Brand"
            title="Company name, logo, app icon and typography"
          />
          <ToolButton
            onClick={() => setA11yOpen(true)}
            icon={<A11yIcon />}
            label="Accessibility"
            title="Contrast checks and colour-blindness simulation"
            valueLabel={cbMode !== "off" ? `Sim: ${cbMode}` : undefined}
          />
          <ToolButton
            onClick={() => setExportOpen(true)}
            icon={<ExportIcon />}
            label="Export"
            title="Copy colours, developer formats and download"
          />
        </div>
      </section>

      {/* ================= Row 4: breadcrumb + full screen ================= */}
      <section className="flex shrink-0 items-center justify-between gap-2 border-b border-softgrey/60 bg-offwhite px-3 py-1.5 sm:px-4" aria-label="Current location">
        <nav
          className="flex min-w-0 items-center gap-1 truncate text-[11.5px] font-semibold text-charcoal/60"
          aria-label="Breadcrumb"
        >
          <span aria-hidden className="text-[13px] leading-none" style={{ color: BRAND.brand }}>{GROUP_ICONS[sel.group]}</span>
          <span className="truncate">{currentGroup.label}</span>
          <Chevron />
          <span className="truncate">{currentSub.label}</span>
          {currentTemplateLabel && (
            <>
              <Chevron />
              <span className="truncate" style={{ color: BRAND.brandDark }}>{currentTemplateLabel}</span>
            </>
          )}
        </nav>
        {!isButton && (
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            title="Enter full screen preview"
            aria-label="Enter full screen preview"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-softgrey bg-white px-2.5 py-1 text-[11px] font-semibold text-charcoal/70 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
          >
            <FullscreenIcon />
            <span className="hidden sm:inline">Full screen</span>
          </button>
        )}
      </section>

      {/* ================= Preview (large, immersive) ================= */}
      <main className="relative min-h-0 flex-1 overflow-hidden bg-offwhite p-2 sm:p-3">
        <div className="h-full w-full" style={{ filter: cbFilter }}>
          <PreviewProvider value={ctx}>
            {isButton ? (
              <div className="h-full w-full overflow-hidden rounded-xl border border-softgrey/70 bg-white">
                <ButtonLab colors={trio} style={buttonStyle} props={buttonProps} setProps={setButtonProps} />
              </div>
            ) : (
              <ScopeProvider value={`${sel.group}/${sel.sub}/${tpl}`}>
                <div
                  key={sel.sub + tpl}
                  className="animate-pop-in relative h-full w-full overflow-hidden rounded-xl border border-softgrey/70 bg-white"
                >
                  {renderComponentPreview(sel.group, sel.sub, tpl, theme)}
                </div>
              </ScopeProvider>
            )}
          </PreviewProvider>
        </div>

        {editMode && (
          <div
            role="status"
            className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-charcoal/85 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-lg backdrop-blur"
          >
            Edit Elements is on — click something in the preview to customise it
          </div>
        )}
      </main>

      {/* ================= Preview picker ================= */}
      {previewPickerOpen && (
        <PickerOverlay onClose={() => setPreviewPickerOpen(false)} title="Choose what to preview">
          <div className="grid gap-6 sm:grid-cols-3">
            {GROUPS.map((g) => (
              <div key={g.key}>
                <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-charcoal/45">
                  <span aria-hidden>{GROUP_ICONS[g.key]}</span>
                  {g.label}
                </p>
                <div className="flex flex-col gap-1">
                  {g.subs.map((s) => {
                    const on = sel.group === g.key && sel.sub === s.key
                    const key = previewKey(g.key, s.key)
                    const locked = needsPaywall(ent, key)
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => {
                          setPreviewPickerOpen(false)
                          const ok = trySelectPreview({ group: g.key, sub: s.key })
                          if (ok) toast.push(`Now previewing ${g.label} · ${s.label}`)
                        }}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
                        style={on ? { background: withAlpha(BRAND.brand, 0.12), color: BRAND.brandDark } : { color: BRAND.medgrey }}
                        aria-current={on ? "true" : undefined}
                      >
                        <span>{s.label}</span>
                        {locked && <ProBadge />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </PickerOverlay>
      )}

      {/* ================= Template picker ================= */}
      {templatePickerOpen && (
        <PickerOverlay
          onClose={() => setTemplatePickerOpen(false)}
          title={isButton ? "Choose button style" : "Choose template"}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {isButton
              ? BUTTON_STYLES.map((k) => (
                  <PickerTile
                    key={k}
                    label={STYLE_META[k].label}
                    thumb={<div className="h-full w-full">{styleThumb(k, trio)}</div>}
                    on={buttonStyle === k}
                    onClick={() => { setButtonStyle(k); setTemplatePickerOpen(false); toast.push(`Style: ${STYLE_META[k].label}`) }}
                  />
                ))
              : templates.map((t) => (
                  <PickerTile
                    key={t.key}
                    label={t.label}
                    thumb={<TemplateThumb theme={theme} layout={t.layout} />}
                    on={tpl === t.key}
                    onClick={() => { selectTpl(t.key); setTemplatePickerOpen(false); toast.push(`Template: ${t.label}`) }}
                  />
                ))}
          </div>
        </PickerOverlay>
      )}

      {/* ================= Full screen preview ================= */}
      {fullscreen && !isButton && (
        <div className="fixed inset-0 z-40 flex flex-col bg-charcoal/95">
          <div className="min-h-0 flex-1 p-3 sm:p-5" style={{ filter: cbFilter }}>
            <PreviewProvider value={ctx}>
              <ScopeProvider value={`${sel.group}/${sel.sub}/${tpl}`}>
                <div className="h-full w-full overflow-hidden rounded-2xl bg-white">
                  {renderComponentPreview(sel.group, sel.sub, tpl, theme)}
                </div>
              </ScopeProvider>
            </PreviewProvider>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-charcoal px-4 py-2.5 text-white sm:px-6">
            <div className="flex items-center gap-2">
              <img src="/app-icon-64.png" alt="" width={22} height={22} className="h-[22px] w-[22px] rounded-md" />
              <span className="hidden text-xs font-semibold sm:block" style={{ fontFamily: "var(--font-display)" }}>Pallet <span style={{ color: BRAND.brand }}>Preview</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {palette.map((s) => (
                <label
                  key={s.id}
                  className="relative block h-8 w-8 cursor-pointer rounded-full transition-transform hover:scale-110"
                  style={{ background: s.hex, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)" }}
                  title={`${s.name} · ${s.hex}${s.locked ? " · locked" : ""}`}
                >
                  <input
                    type="color"
                    value={s.hex}
                    onChange={(e) => change(s.id, normalizeHex(e.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label={`Edit ${s.name}`}
                  />
                </label>
              ))}
              <button type="button" onClick={randomize} className="ml-1 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white">Randomise</button>
              <button type="button" onClick={() => setEditMode((v) => !v)} className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors" style={editMode ? { background: BRAND.brand, color: "#fff" } : { border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)" }}>{editMode ? "Editing" : "Edit"}</button>
              <button type="button" onClick={() => setPreviewPickerOpen(true)} className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white">Change preview</button>
            </div>
            <button type="button" onClick={() => setFullscreen(false)} className="flex items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Brand modal */}
      {brandOpen && (
        <BrandUpload
          brand={brand}
          onChange={(b) => { setBrand(b); toast.push("Brand updated", "success") }}
          onClose={() => setBrandOpen(false)}
        />
      )}

      {/* Assign-colour modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={() => setAssignTarget(null)}>
          <div className="animate-pop-in w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Assign a colour">
            <p className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Assign a colour</p>
            <p className="mt-0.5 text-xs text-charcoal/55">Bind “{assignTarget.label}” to one of your palette colours.</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {palette.map((s) => {
                const on = assignments[assignTarget.id] === s.id
                return (
                  <button key={s.id} type="button" onClick={() => { setAssignments((a) => ({ ...a, [assignTarget.id]: s.id })); setAssignTarget(null); toast.push(`${assignTarget.label} → ${s.name}`, "success") }} className="flex flex-col gap-1.5 rounded-xl p-1.5 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]" style={{ outline: on ? `2px solid ${BRAND.brand}` : "1px solid " + BRAND.softgrey }}>
                    <span className="h-10 w-full rounded-lg" style={{ background: s.hex, boxShadow: `inset 0 0 0 1px ${withAlpha(readableOn(s.hex), 0.12)}` }} />
                    <span className="text-[11px] font-semibold text-charcoal/70">{s.name}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex justify-between">
              <button type="button" onClick={() => { setAssignments((a) => { const next = { ...a }; delete next[assignTarget.id]; return next }); setAssignTarget(null); toast.push("Reset to default colour") }} className="rounded-lg px-3 py-2 text-xs font-semibold text-charcoal/55 hover:text-charcoal">Reset to default</button>
              <button type="button" onClick={() => setAssignTarget(null)} className="rounded-lg border border-softgrey px-3 py-2 text-xs font-semibold text-charcoal/70 hover:text-charcoal">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility */}
      <AccessibilityPanel
        open={a11yOpen}
        onClose={() => setA11yOpen(false)}
        palette={palette}
        mode={cbMode}
        setMode={(m) => { setCbMode(m); toast.push(m === "off" ? "Simulation off" : `Simulating ${m}`) }}
      />

      {/* Export */}
      <ExportPanel
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        palette={palette}
        isPro={ent.isPro}
        onUpgrade={() => { setExportOpen(false); setPaywall({ open: true, reason: "High-resolution image exports are part of Pro." }) }}
        onToast={(m, k) => toast.push(m, k)}
      />

      {/* Intro tour + Help */}
      <IntroTour open={helpOpen} onClose={closeHelp} />

      {/* Reset confirmation */}
      <ConfirmDialog
        open={confirmReset}
        title="Reset your palette?"
        body="Your current colours and element assignments will be replaced by the defaults. You can Undo (Ctrl/Cmd+Z) if you change your mind."
        confirmLabel="Reset palette"
        destructive
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      />

      {/* Pro paywall */}
      <PaywallOverlay
        open={paywall.open}
        reason={paywall.reason}
        onUnlock={goPro}
        onLater={dismissPaywall}
      />
    </div>
  )
}

/* ---------- shared components ---------- */

function ToolButton({
  onClick, icon, label, valueLabel, title, active,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  valueLabel?: string
  title?: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={valueLabel ? `${label}: ${valueLabel}` : label}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-1"
      style={active
        ? { background: BRAND.brand, color: "#fff", border: `1px solid ${BRAND.brand}` }
        : { background: "#fff", color: BRAND.charcoal, border: `1px solid ${BRAND.softgrey}` }}
    >
      <span className="flex h-4 w-4 items-center justify-center" aria-hidden style={{ color: active ? "#fff" : BRAND.brand }}>{icon}</span>
      <span>{label}</span>
      {valueLabel && !active && (
        <>
          <span className="text-charcoal/30" aria-hidden>·</span>
          <span className="max-w-[140px] truncate text-charcoal/55">{valueLabel}</span>
        </>
      )}
    </button>
  )
}

function IconButton({
  onClick, disabled, label, title, children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      aria-label={label}
      className="flex items-center gap-1.5 rounded-lg border border-softgrey bg-white px-2 py-1.5 text-[11px] font-semibold text-charcoal/65 outline-none transition-colors hover:text-charcoal focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}

function PickerOverlay({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-charcoal/40 p-4 pt-[6vh]" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div onClick={(e) => e.stopPropagation()} className="animate-pop-in w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-softgrey px-2.5 py-1.5 text-[11px] font-semibold text-charcoal/60 hover:text-charcoal">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function PickerTile({
  label, thumb, on, onClick,
}: { label: string; thumb: React.ReactNode; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-stretch gap-1.5 rounded-xl p-1.5 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
      style={{ outline: on ? "2px solid #20B9FA" : `1px solid ${BRAND.softgrey}` }}
    >
      <div className="h-16 w-full overflow-hidden rounded-lg border border-softgrey">{thumb}</div>
      <span className="px-1 text-[11.5px] font-semibold" style={{ color: on ? "#05A9F0" : BRAND.medgrey }}>{label}</span>
    </button>
  )
}

const ProBadge = () => (
  <span
    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
    style={{ background: `${BRAND.brand}18`, color: BRAND.brandDark }}
    aria-label="Pro feature"
  >
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
    Pro
  </span>
)

/* ---------- icons ---------- */
const Chevron = () => (<span aria-hidden className="text-charcoal/25">›</span>)
const PreviewIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 20h8" /></svg>)
const TemplateIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>)
const EditIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 4.5 5 5-11 11H3.5v-5.5z" /><path d="m12 7 5 5" /></svg>)
const BrandIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L7 20" /></svg>)
const A11yIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4.5" r="1.6" /><path d="M4 7.5c2.5 1.5 5.5 2 8 2s5.5-.5 8-2" /><path d="M9 22 12 12l3 10" /><path d="M12 12v-2" /></svg>)
const ExportIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /></svg>)
const FullscreenIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>)
const UndoIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" /></svg>)
const RedoIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h4" /></svg>)
const ResetIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>)
const HelpIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7" /><path d="M12 17.01V17" /></svg>)
