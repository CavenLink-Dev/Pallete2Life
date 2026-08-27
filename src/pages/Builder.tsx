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

const GROUP_ICONS: Record<GroupKey, string> = { website: "▦", mobile: "▯", components: "◉" }
const MAX_HISTORY = 40

export default function Builder() {
  const navHome = useNav()
  const [, navigate] = useRoute()
  const toast = useToast()

  const [palette, setPalette] = useState<Swatch[]>(() => loadStored("palette", initialPalette))
  const [sel, setSel] = useState<Selection>({ group: "website", sub: "landing" })
  const [tplBySub, setTplBySub] = useState<Record<string, string>>({})
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>(() => loadStored("buttonStyle", "depth" as ButtonStyle))
  const [buttonProps, setButtonProps] = useState<ButtonProps>(() => loadStored("buttonProps", DEFAULT_BUTTON_PROPS))

  const [editMode, setEditMode] = useState(false)
  const [assignments, setAssignments] = useState<Record<string, string>>(() => loadStored("assignments", {}))
  const [assignTarget, setAssignTarget] = useState<{ id: string; label: string } | null>(null)

  const [brand, setBrand] = useState<Brand>(() => loadStored("brand", { name: "Pallet Preview", logo: null, symbol: null }))
  const [brandOpen, setBrandOpen] = useState(false)

  const [previewPickerOpen, setPreviewPickerOpen] = useState(false)
  const [stylePickerOpen, setStylePickerOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  // Free/Pro entitlement — persisted locally.
  const [ent, setEnt] = useState<Entitlement>(loadEntitlement)
  useEffect(() => { saveEntitlement(ent) }, [ent])
  const [paywall, setPaywall] = useState<{ open: boolean; reason?: string }>({ open: false })
  const remaining = freeRemaining(ent)
  const remainingLabel = ent.isPro ? null : `${remaining} free preview${remaining === 1 ? "" : "s"} left`

  const goPro = () => { setPaywall({ open: false }); navigate("/pricing") }
  const dismissPaywall = () => setPaywall({ open: false })

  /**
   * Attempt to switch the preview. Consumes one free preview only when the
   * (group, sub) pair is new to the user. Never touches the palette or design.
   * Returns true when the switch happened, false when the paywall was opened.
   */
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

  // Undo/Redo history for the palette
  const [undoStack, setUndoStack] = useState<Swatch[][]>([])
  const [redoStack, setRedoStack] = useState<Swatch[][]>([])
  const skipHistory = useRef(false)

  useStored("palette", palette)
  useStored("assignments", assignments)
  useStored("brand", brand)
  useStored("buttonStyle", buttonStyle)
  useStored("buttonProps", buttonProps)

  // First-visit intro
  useEffect(() => {
    if (shouldShowIntro()) setHelpOpen(true)
  }, [])

  const closeHelp = useCallback(() => {
    markIntroSeen()
    setHelpOpen(false)
  }, [])

  // Fullscreen Escape handler
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [fullscreen])

  // Keyboard shortcuts: Ctrl/Cmd+Z (undo), Ctrl/Cmd+Shift+Z or Ctrl+Y (redo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (target?.isContentEditable)) return
      if (mod && !e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); undo() }
      else if (mod && ((e.shiftKey && e.key.toLowerCase() === "z") || e.key.toLowerCase() === "y")) { e.preventDefault(); redo() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoStack, redoStack, palette])

  // Push previous palette onto undo stack before every mutation.
  const mutatePalette = useCallback((updater: (prev: Swatch[]) => Swatch[]) => {
    setPalette((prev) => {
      const next = updater(prev)
      if (!skipHistory.current && JSON.stringify(prev) !== JSON.stringify(next)) {
        setUndoStack((s) => {
          const cap = s.length >= MAX_HISTORY ? s.slice(1) : s
          return [...cap, prev]
        })
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

  const currentGroup = GROUPS.find((g) => g.key === sel.group)!
  const currentSub = currentGroup.subs.find((s) => s.key === sel.sub) ?? currentGroup.subs[0]
  const templates = currentSub.templates
  const tpl = tplBySub[sel.sub] ?? templates[0]?.key ?? ""
  const isButton = sel.group === "components" && sel.sub === "button"

  const theme = useMemo(() => deriveTheme(palette), [palette])
  const trio = useMemo(() => paletteToTrio(palette), [palette])

  const previewLabel = `${currentGroup.label} · ${currentSub.label}`
  const hasStyleControl = isButton || templates.length > 1
  const styleLabel = isButton
    ? STYLE_META[buttonStyle].label
    : templates.find((t) => t.key === tpl)?.label ?? ""

  const change = (id: string, hex: string) => mutatePalette((p) => p.map((s) => (s.id === id ? { ...s, hex } : s)))
  const rename = (id: string, name: string) =>
    mutatePalette((p) => p.map((s) => (s.id === id ? { ...s, name: name.trim() || s.name } : s)))
  const add = () => {
    mutatePalette((p) => [...p, { id: uid(), name: START_NAMES[p.length] ?? `Colour ${p.length + 1}`, hex: randomHex() }])
    toast.push("Colour added", "success")
  }
  const remove = (id: string) => {
    mutatePalette((p) => (p.length > 1 ? p.filter((s) => s.id !== id) : p))
  }
  const randomize = () => {
    const anyUnlocked = palette.some((s) => !s.locked)
    if (!anyUnlocked) { toast.push("All colours are locked — unlock one to randomise", "error"); return }
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

  return (
    <div className="flex h-full flex-col bg-offwhite text-charcoal">
      {/* ---------- Small header ---------- */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-softgrey/70 bg-white/90 px-3 py-1.5 backdrop-blur sm:flex-nowrap sm:px-5">
        <a
          href="/"
          onClick={navHome("/")}
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
          aria-label="Pallet Preview — home"
        >
          <img src="/app-icon-64.png" alt="" width={26} height={26} className="h-[26px] w-[26px] rounded-md" />
          <h1 className="text-[13px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Pallet <span style={{ color: BRAND.brand }}>Preview</span>
          </h1>
        </a>

        <div className="flex flex-wrap items-center gap-1.5 sm:flex-nowrap sm:gap-2">
          {remainingLabel && (
            <button
              type="button"
              onClick={() => navigate("/pricing")}
              title="You're on the Free tier — click to see Pro"
              className="hidden items-center gap-1.5 rounded-full border border-softgrey bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-charcoal/55 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] sm:inline-flex"
              aria-label={`${remainingLabel}. Open pricing.`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: remaining > 0 ? BRAND.brand : "#C22F2F" }} />
              {remainingLabel}
            </button>
          )}
          <ChipButton
            onClick={() => setPreviewPickerOpen(true)}
            title="Change what you're previewing"
            ariaLabel={`Change preview — currently ${previewLabel}`}
          >
            <PreviewIcon />
            <span className="hidden text-charcoal/45 sm:inline">Preview:</span>
            <span className="ml-0.5 hidden max-w-[180px] truncate sm:inline">{previewLabel}</span>
            <span className="max-w-[110px] truncate sm:hidden">{currentSub.label}</span>
            <CaretDown />
          </ChipButton>

          <ChipButton onClick={() => setBrandOpen(true)} title="Upload your logo or app icon" ariaLabel="Brand assets">
            <BrandIcon />
            <span className="hidden sm:inline">Brand</span>
          </ChipButton>

          <ChipButton
            onClick={() => setEditMode((v) => !v)}
            active={editMode}
            title={editMode ? "Turn off Edit Mode" : "Turn on Edit Mode to click preview elements and change their colour"}
            ariaLabel={editMode ? "Edit mode on" : "Edit mode off"}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: editMode ? "#fff" : BRAND.brand }} />
            {editMode ? "Editing" : "Edit"}
          </ChipButton>

          <ChipButton
            onClick={undo}
            disabled={!undoStack.length}
            title={undoStack.length ? "Undo the last palette change (Ctrl/Cmd+Z)" : "Nothing to undo yet"}
            ariaLabel="Undo"
          >
            <UndoIcon />
            <span className="hidden sm:inline">Undo</span>
          </ChipButton>
          <ChipButton
            onClick={redo}
            disabled={!redoStack.length}
            title={redoStack.length ? "Redo (Ctrl/Cmd+Shift+Z)" : "Nothing to redo"}
            ariaLabel="Redo"
          >
            <RedoIcon />
            <span className="hidden sm:inline">Redo</span>
          </ChipButton>

          <ChipButton onClick={() => setConfirmReset(true)} title="Reset the palette to the defaults" ariaLabel="Reset palette">
            <ResetIcon />
            <span className="hidden md:inline">Reset</span>
          </ChipButton>

          <ChipButton onClick={() => setHelpOpen(true)} title="How Pallet Preview works" ariaLabel="Help">
            <HelpIcon />
            <span className="hidden md:inline">Help</span>
          </ChipButton>

          {!isButton && (
            <ChipButton onClick={() => setFullscreen(true)} title="Enter full screen preview" ariaLabel="Full screen">
              <FullscreenIcon />
              <span className="hidden lg:inline">Full screen</span>
            </ChipButton>
          )}
        </div>
      </header>

      {/* ---------- Palette bar ---------- */}
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
          rightSlot={
            hasStyleControl ? (
              <ChipButton onClick={() => setStylePickerOpen(true)} title={isButton ? "Change button style" : "Change template"} ariaLabel={isButton ? "Change button style" : "Change template"}>
                <span className="text-charcoal/45">{isButton ? "Style:" : "Template:"}</span>
                <span className="ml-1">{styleLabel}</span>
                <CaretDown />
              </ChipButton>
            ) : null
          }
        />
      </section>

      {/* ---------- Large live preview ---------- */}
      <main className="relative min-h-0 flex-1 overflow-hidden bg-offwhite p-2 sm:p-3">
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

        {editMode && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-charcoal/85 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur">
            Edit mode on — click any element in the preview to assign a colour
          </div>
        )}
      </main>

      {/* ---------- Preview picker overlay ---------- */}
      {previewPickerOpen && (
        <PickerOverlay onClose={() => setPreviewPickerOpen(false)} title="Change preview">
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
                        {locked && (
                          <span
                            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                            style={{ background: `${BRAND.brand}18`, color: BRAND.brandDark }}
                            aria-label="Pro feature"
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                            Pro
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </PickerOverlay>
      )}

      {/* ---------- Style / Template picker overlay ---------- */}
      {stylePickerOpen && hasStyleControl && (
        <PickerOverlay
          onClose={() => setStylePickerOpen(false)}
          title={isButton ? "Button style" : "Template"}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {isButton
              ? BUTTON_STYLES.map((k) => (
                  <PickerTile
                    key={k}
                    label={STYLE_META[k].label}
                    thumb={<div className="h-full w-full">{styleThumb(k, trio)}</div>}
                    on={buttonStyle === k}
                    onClick={() => {
                      setButtonStyle(k)
                      setStylePickerOpen(false)
                      toast.push(`Style: ${STYLE_META[k].label}`)
                    }}
                  />
                ))
              : templates.map((t) => (
                  <PickerTile
                    key={t.key}
                    label={t.label}
                    thumb={<TemplateThumb theme={theme} layout={t.layout} />}
                    on={tpl === t.key}
                    onClick={() => {
                      selectTpl(t.key)
                      setStylePickerOpen(false)
                      toast.push(`Template: ${t.label}`)
                    }}
                  />
                ))}
          </div>
        </PickerOverlay>
      )}

      {/* ---------- Full screen preview ---------- */}
      {fullscreen && !isButton && (
        <div className="fixed inset-0 z-40 flex flex-col bg-charcoal/95">
          <div className="min-h-0 flex-1 p-3 sm:p-5">
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
            <div className="flex items-center gap-2">
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
                  {s.locked && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-charcoal">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                    </span>
                  )}
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

      {/* ---------- Brand assets modal ---------- */}
      {brandOpen && (
        <BrandUpload
          brand={brand}
          onChange={(b) => { setBrand(b); toast.push("Brand updated", "success") }}
          onClose={() => setBrandOpen(false)}
        />
      )}

      {/* ---------- Assign-colour modal (Edit Mode) ---------- */}
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

      {/* ---------- Intro / help drawer ---------- */}
      <IntroTour open={helpOpen} onClose={closeHelp} />

      {/* ---------- Reset confirmation ---------- */}
      <ConfirmDialog
        open={confirmReset}
        title="Reset your palette?"
        body="Your current colours and element assignments will be replaced by the defaults. You can Undo (Ctrl/Cmd+Z) if you change your mind."
        confirmLabel="Reset palette"
        destructive
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      />

      {/* ---------- Pro paywall (over the preview, non-destructive) ---------- */}
      <PaywallOverlay
        open={paywall.open}
        reason={paywall.reason}
        onUnlock={goPro}
        onLater={dismissPaywall}
      />
    </div>
  )
}

/* ---------- small header/palette-bar chip button ---------- */
function ChipButton({
  onClick, active, disabled, title, ariaLabel, children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  ariaLabel?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
      style={active
        ? { background: BRAND.brand, color: "#fff" }
        : { background: "#fff", color: BRAND.medgrey, border: `1px solid ${BRAND.softgrey}` }}
    >
      {children}
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
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-charcoal/40 p-4 pt-[8vh]" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
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

/* ---------- icons ---------- */
const CaretDown = () => (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><path d="m6 9 6 6 6-6" /></svg>)
const BrandIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L7 20" /></svg>)
const FullscreenIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>)
const PreviewIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 20h8" /></svg>)
const UndoIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" /></svg>)
const RedoIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h4" /></svg>)
const ResetIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>)
const HelpIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7" /><path d="M12 17.01V17" /></svg>)
