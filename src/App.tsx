import { useEffect, useMemo, useRef, useState } from "react"
import { BRAND, deriveTheme, normalizeHex, randomHex, readableOn, uid, withAlpha, type Swatch } from "./lib/color"
import PalettePanel from "./components/PalettePanel"
import {
  BUTTON_STYLES,
  ButtonLab,
  DEFAULT_BUTTON_PROPS,
  STYLE_META,
  paletteToTrio,
  styleThumb,
  type ButtonProps,
  type ButtonStyle,
} from "./components/ButtonPreview"
import {
  GROUPS,
  TemplateThumb,
  renderComponentPreview,
  type GroupKey,
} from "./components/Previews"
import { PreviewProvider, ScopeProvider, type Brand, type PreviewCtxValue } from "./components/PreviewCtx"
import BrandUpload from "./components/BrandUpload"

type Selection = { group: GroupKey; sub: string }

const START_NAMES = ["Primary", "Secondary", "Tertiary", "Quaternary", "Quinary", "Senary"]

/* localStorage persistence (best-effort; the app works fine without it) */
const STORE_KEY = "hueframe:v1"
function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return fallback
    const data = JSON.parse(raw)
    return data?.[key] ?? fallback
  } catch {
    return fallback
  }
}
function useStored(key: string, value: unknown) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      const data = raw ? JSON.parse(raw) : {}
      data[key] = value
      localStorage.setItem(STORE_KEY, JSON.stringify(data))
    } catch {
      /* storage unavailable — ignore */
    }
  }, [key, value])
}

const initialPalette: Swatch[] = [
  { id: uid(), name: "Primary", hex: BRAND.brand },
  { id: uid(), name: "Secondary", hex: BRAND.charcoal },
  { id: uid(), name: "Tertiary", hex: BRAND.offwhite },
]

const GROUP_ICONS: Record<GroupKey, string> = { website: "▦", mobile: "▯", components: "◉" }

export default function App() {
  const [palette, setPalette] = useState<Swatch[]>(() => loadStored("palette", initialPalette))
  const [sel, setSel] = useState<Selection>({ group: "website", sub: "landing" })
  const [tplBySub, setTplBySub] = useState<Record<string, string>>({})
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>(() => loadStored("buttonStyle", "depth" as ButtonStyle))
  const [buttonProps, setButtonProps] = useState<ButtonProps>(() => loadStored("buttonProps", DEFAULT_BUTTON_PROPS))

  // Edit mode: click any element in a preview to bind it to a palette colour.
  const [editMode, setEditMode] = useState(false)
  const [assignments, setAssignments] = useState<Record<string, string>>(() => loadStored("assignments", {}))
  const [assignTarget, setAssignTarget] = useState<{ id: string; label: string } | null>(null)

  const theme = useMemo(() => deriveTheme(palette), [palette])
  const trio = useMemo(() => paletteToTrio(palette), [palette])

  // Brand assets shown inside previews (logo / app icon), editable via the Brand modal.
  const [brand, setBrand] = useState<Brand>(() => loadStored("brand", { name: "Pallet Preview", logo: null, symbol: null }))
  const [brandOpen, setBrandOpen] = useState(false)

  // Overlay popovers (Preview picker + Style/Template picker).
  const [previewPickerOpen, setPreviewPickerOpen] = useState(false)
  const [stylePickerOpen, setStylePickerOpen] = useState(false)

  // Persist the pieces worth keeping across refreshes.
  useStored("palette", palette)
  useStored("assignments", assignments)
  useStored("brand", brand)
  useStored("buttonStyle", buttonStyle)
  useStored("buttonProps", buttonProps)

  // Full screen preview
  const [fullscreen, setFullscreen] = useState(false)
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [fullscreen])

  const currentGroup = GROUPS.find((g) => g.key === sel.group)!
  const currentSub = currentGroup.subs.find((s) => s.key === sel.sub) ?? currentGroup.subs[0]
  const templates = currentSub.templates
  const tpl = tplBySub[sel.sub] ?? templates[0]?.key ?? ""
  const isButton = sel.group === "components" && sel.sub === "button"

  // Label for the top "Preview:" chip.
  const previewLabel = `${currentGroup.label} · ${currentSub.label}`
  // Whether there's a style/template control that makes sense to expose right now.
  const hasStyleControl = isButton || templates.length > 1
  const styleLabel = isButton
    ? STYLE_META[buttonStyle].label
    : templates.find((t) => t.key === tpl)?.label ?? ""

  const change = (id: string, hex: string) => setPalette((p) => p.map((s) => (s.id === id ? { ...s, hex } : s)))
  const rename = (id: string, name: string) =>
    setPalette((p) => p.map((s) => (s.id === id ? { ...s, name: name.trim() || s.name } : s)))
  const add = () =>
    setPalette((p) => [...p, { id: uid(), name: START_NAMES[p.length] ?? `Colour ${p.length + 1}`, hex: randomHex() }])
  const remove = (id: string) =>
    setPalette((p) => (p.length > 1 ? p.filter((s) => s.id !== id) : p))
  const randomize = () => setPalette((p) => p.map((s) => (s.locked ? s : { ...s, hex: randomHex() })))
  const toggleLock = (id: string) => setPalette((p) => p.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s)))

  const selectTpl = (key: string) => setTplBySub((m) => ({ ...m, [sel.sub]: key }))

  // Button lab maps the first swatches onto the active style's parts.
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
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-softgrey/70 bg-white/85 px-3 py-1.5 backdrop-blur sm:flex-nowrap sm:px-5">
        <div className="flex items-center gap-2">
          <img
            src="/app-icon-64.png"
            alt="Pallet Preview"
            width={26}
            height={26}
            className="h-[26px] w-[26px] rounded-md"
          />
          <h1 className="text-[13px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Pallet <span style={{ color: BRAND.brand }}>Preview</span>
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ChipButton
            onClick={() => setPreviewPickerOpen(true)}
            title="Change what you're previewing"
          >
            <span className="hidden text-charcoal/45 sm:inline">Preview:</span>
            <span className="ml-0.5 hidden max-w-[180px] truncate sm:inline">{previewLabel}</span>
            <span className="max-w-[110px] truncate sm:hidden">{currentSub.label}</span>
            <CaretDown />
          </ChipButton>

          <ChipButton onClick={() => setBrandOpen(true)} title="Upload logo / app icon">
            <BrandIcon />
            <span className="hidden sm:inline">Brand</span>
          </ChipButton>

          <ChipButton
            onClick={() => setEditMode((v) => !v)}
            active={editMode}
            title="Toggle Edit Mode — click elements in the preview to reassign their colour"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: editMode ? "#fff" : BRAND.brand }} />
            {editMode ? "Editing" : "Edit"}
          </ChipButton>

          {!isButton && (
            <ChipButton onClick={() => setFullscreen(true)} title="Full screen preview">
              <FullscreenIcon />
              <span className="hidden lg:inline">Full screen</span>
            </ChipButton>
          )}
        </div>
      </header>

      {/* ---------- Compact palette bar ---------- */}
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
              <ChipButton onClick={() => setStylePickerOpen(true)} title={isButton ? "Change button style" : "Change template"}>
                <span className="text-charcoal/45">{isButton ? "Style:" : "Template:"}</span>
                <span className="ml-1">{styleLabel}</span>
                <CaretDown />
              </ChipButton>
            ) : null
          }
        />
      </section>

      {/* ---------- Large live preview (edge-to-edge, immersive) ---------- */}
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
            Edit mode — click an element to assign it a colour
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
                  <span>{GROUP_ICONS[g.key]}</span>
                  {g.label}
                </p>
                <div className="flex flex-col gap-1">
                  {g.subs.map((s) => {
                    const on = sel.group === g.key && sel.sub === s.key
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => {
                          setSel({ group: g.key, sub: s.key })
                          setPreviewPickerOpen(false)
                        }}
                        className="rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors"
                        style={on
                          ? { background: withAlpha(BRAND.brand, 0.12), color: BRAND.brandDark }
                          : { color: BRAND.medgrey }}
                      >
                        {s.label}
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
              ? BUTTON_STYLES.map((k) => {
                  const on = buttonStyle === k
                  return (
                    <PickerTile
                      key={k}
                      label={STYLE_META[k].label}
                      thumb={<div className="h-full w-full">{styleThumb(k, trio)}</div>}
                      on={on}
                      onClick={() => {
                        setButtonStyle(k)
                        setStylePickerOpen(false)
                      }}
                    />
                  )
                })
              : templates.map((t) => {
                  const on = tpl === t.key
                  return (
                    <PickerTile
                      key={t.key}
                      label={t.label}
                      thumb={<TemplateThumb theme={theme} layout={t.layout} />}
                      on={on}
                      onClick={() => {
                        selectTpl(t.key)
                        setStylePickerOpen(false)
                      }}
                    />
                  )
                })}
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
          {/* compact HueFrame bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-charcoal px-4 py-2.5 text-white sm:px-6">
            <div className="flex items-center gap-2">
              <img src="/app-icon-64.png" alt="Pallet Preview" width={22} height={22} className="h-[22px] w-[22px] rounded-md" />
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
              <button
                type="button"
                onClick={randomize}
                className="ml-1 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white"
              >
                Randomise
              </button>
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                style={editMode ? { background: BRAND.brand, color: "#fff" } : { border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)" }}
              >
                {editMode ? "Editing" : "Edit"}
              </button>
              <button
                type="button"
                onClick={() => setPreviewPickerOpen(true)}
                className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white"
              >
                Change preview
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              Exit
            </button>
          </div>
        </div>
      )}

      {/* ---------- Brand assets modal ---------- */}
      {brandOpen && (
        <BrandUpload brand={brand} onChange={setBrand} onClose={() => setBrandOpen(false)} />
      )}

      {/* ---------- Assign-colour modal (edit mode) ---------- */}
      {assignTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4"
          onClick={() => setAssignTarget(null)}
        >
          <div
            className="animate-pop-in w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Assign a colour</p>
            <p className="mt-0.5 text-xs text-charcoal/55">Bind “{assignTarget.label}” to one of your palette colours.</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {palette.map((s) => {
                const on = assignments[assignTarget.id] === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setAssignments((a) => ({ ...a, [assignTarget.id]: s.id }))
                      setAssignTarget(null)
                    }}
                    className="flex flex-col gap-1.5 rounded-xl p-1.5 text-left transition-transform hover:-translate-y-0.5"
                    style={{ outline: on ? `2px solid ${BRAND.brand}` : "1px solid " + BRAND.softgrey }}
                  >
                    <span className="h-10 w-full rounded-lg" style={{ background: s.hex, boxShadow: `inset 0 0 0 1px ${withAlpha(readableOn(s.hex), 0.12)}` }} />
                    <span className="text-[11px] font-semibold text-charcoal/70">{s.name}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setAssignments((a) => {
                    const next = { ...a }
                    delete next[assignTarget.id]
                    return next
                  })
                  setAssignTarget(null)
                }}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-charcoal/55 hover:text-charcoal"
              >
                Reset to default
              </button>
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className="rounded-lg border border-softgrey px-3 py-2 text-xs font-semibold text-charcoal/70 hover:text-charcoal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- small header/palette-bar chip button ---------- */
function ChipButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors"
      style={active
        ? { background: BRAND.brand, color: "#fff" }
        : { background: "#fff", color: BRAND.medgrey, border: `1px solid ${BRAND.softgrey}` }}
    >
      {children}
    </button>
  )
}

/* ---------- centered picker modal (used for both Preview and Style pickers) ---------- */
function PickerOverlay({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-charcoal/40 p-4 pt-[8vh]"
      onClick={onClose}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl"
        role="dialog"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-softgrey px-2.5 py-1.5 text-[11px] font-semibold text-charcoal/60 hover:text-charcoal"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function PickerTile({
  label,
  thumb,
  on,
  onClick,
}: {
  label: string
  thumb: React.ReactNode
  on: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-stretch gap-1.5 rounded-xl p-1.5 text-left transition-transform hover:-translate-y-0.5"
      style={{ outline: on ? "2px solid #20B9FA" : `1px solid ${BRAND.softgrey}` }}
    >
      <div className="h-16 w-full overflow-hidden rounded-lg border border-softgrey">
        {thumb}
      </div>
      <span className="px-1 text-[11.5px] font-semibold" style={{ color: on ? "#05A9F0" : BRAND.medgrey }}>
        {label}
      </span>
    </button>
  )
}

/* ---------- inline icons ---------- */
const CaretDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
    <path d="m6 9 6 6 6-6" />
  </svg>
)
const BrandIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L7 20" />
  </svg>
)
const FullscreenIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
)
