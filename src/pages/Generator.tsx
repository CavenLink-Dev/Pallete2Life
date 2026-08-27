import { useCallback, useEffect, useRef, useState } from "react"
import {
  BRAND,
  colorName,
  hexToHsl,
  hexToRgb,
  hslString,
  hslToHex,
  normalizeHex,
  randomHex,
  readableOn,
  rgbString,
  rgbToHex,
  uid,
  withAlpha,
  type Swatch,
} from "../lib/color"
import { createDefaultPalette, loadPalette, savePalette } from "../lib/paletteStore"
import { useNav, useRoute } from "../lib/router"
import { useToast } from "../components/Toast"
import SimpleExportPanel from "../components/SimpleExportPanel"

const MAX_HISTORY = 40
const MAX_COLOURS = 8
const MIN_COLOURS = 2

export default function Generator() {
  const nav = useNav()
  const [, navigate] = useRoute()
  const toast = useToast()
  const [palette, setPalette] = useState<Swatch[]>(loadPalette)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [undoStack, setUndoStack] = useState<Swatch[][]>([])
  const [redoStack, setRedoStack] = useState<Swatch[][]>([])
  const skipHistory = useRef(false)

  useEffect(() => savePalette(palette), [palette])

  const mutatePalette = useCallback((updater: (previous: Swatch[]) => Swatch[]) => {
    setPalette((previous) => {
      const next = updater(previous)
      if (!skipHistory.current && JSON.stringify(previous) !== JSON.stringify(next)) {
        setUndoStack((stack) => stack.length >= MAX_HISTORY ? [...stack.slice(1), previous] : [...stack, previous])
        setRedoStack([])
      }
      skipHistory.current = false
      return next
    })
  }, [])

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (!stack.length) return stack
      const previous = stack[stack.length - 1]
      setRedoStack((redo) => [...redo, palette])
      skipHistory.current = true
      setPalette(previous)
      setActiveId(null)
      return stack.slice(0, -1)
    })
  }, [palette])

  const redo = useCallback(() => {
    setRedoStack((stack) => {
      if (!stack.length) return stack
      const next = stack[stack.length - 1]
      setUndoStack((undoItems) => [...undoItems, palette])
      skipHistory.current = true
      setPalette(next)
      setActiveId(null)
      return stack.slice(0, -1)
    })
  }, [palette])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return
      const modifier = event.metaKey || event.ctrlKey
      if (modifier && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault()
        undo()
      } else if (modifier && ((event.shiftKey && event.key.toLowerCase() === "z") || event.key.toLowerCase() === "y")) {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [redo, undo])

  const change = (id: string, value: string) => {
    const hex = normalizeHex(value)
    mutatePalette((items) => items.map((item) => item.id === id ? { ...item, hex, name: colorName(hex) } : item))
  }

  const randomise = () => {
    if (!palette.some((swatch) => !swatch.locked)) {
      toast.push("Unlock a colour to randomise", "error")
      return
    }
    mutatePalette((items) => items.map((item) => {
      if (item.locked) return item
      const hex = randomHex()
      return { ...item, hex, name: colorName(hex) }
    }))
  }

  const add = () => {
    if (palette.length >= MAX_COLOURS) return
    const hex = randomHex()
    const id = uid()
    mutatePalette((items) => [...items, { id, hex, name: colorName(hex) }])
    setActiveId(id)
  }

  const remove = (id: string) => {
    if (palette.length <= MIN_COLOURS) return
    mutatePalette((items) => items.filter((item) => item.id !== id))
    setActiveId((active) => active === id ? null : active)
  }

  const toggleLock = (id: string) => {
    mutatePalette((items) => items.map((item) => item.id === id ? { ...item, locked: !item.locked } : item))
  }

  const reset = () => {
    mutatePalette(() => createDefaultPalette())
    setActiveId(null)
    toast.push("Palette reset", "success")
  }

  const openPreview = () => {
    savePalette(palette)
    navigate("/preview")
  }

  const copyHex = async (swatch: Swatch) => {
    try {
      await navigator.clipboard.writeText(swatch.hex.toUpperCase())
      toast.push(`${swatch.hex.toUpperCase()} copied`, "success")
    } catch {
      toast.push("Couldn't copy this colour", "error")
    }
  }

  const activeSwatch = palette.find((swatch) => swatch.id === activeId) ?? null

  return (
    <div className="flex h-full min-h-[520px] flex-col overflow-hidden bg-white text-charcoal">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-softgrey bg-white px-3 py-2 sm:min-h-16 sm:flex-nowrap sm:gap-3 sm:px-5 sm:py-0">
        <a
          href="/"
          onClick={nav("/")}
          className="mr-1 flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
          aria-label="Palette Preview home"
        >
          <img src="/app-icon-64.png" alt="" width={30} height={30} className="h-[30px] w-[30px] rounded-md" />
          <span className="hidden text-[14px] font-bold sm:block" style={{ fontFamily: "var(--font-display)" }}>
            Palette <span style={{ color: BRAND.brand }}>Preview</span>
          </span>
        </a>

        <div className="order-3 flex w-full items-center gap-1 border-t border-softgrey pt-1 sm:order-none sm:w-auto sm:gap-2 sm:border-0 sm:pt-0">
          <span className="hidden h-6 w-px shrink-0 bg-softgrey sm:block" aria-hidden />
          <IconButton label="Undo" onClick={undo} disabled={!undoStack.length}><UndoIcon /></IconButton>
          <IconButton label="Redo" onClick={redo} disabled={!redoStack.length}><RedoIcon /></IconButton>
          <IconButton label="Reset palette" onClick={reset}><ResetIcon /></IconButton>
          <span className="hidden h-6 w-px shrink-0 bg-softgrey sm:block" aria-hidden />
          <ToolbarButton onClick={randomise} icon={<ShuffleIcon />}>Randomise</ToolbarButton>
          <ToolbarButton onClick={add} icon={<PlusIcon />} disabled={palette.length >= MAX_COLOURS}>Add colour</ToolbarButton>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openPreview}
            className="flex h-9 items-center gap-2 rounded-md border border-charcoal bg-charcoal px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#263542] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
          >
            <PreviewIcon /> Preview
          </button>
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="flex h-9 items-center gap-2 rounded-md border border-softgrey bg-white px-3.5 text-[12.5px] font-semibold text-charcoal transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
          >
            <ExportIcon /> Export
          </button>
          <a
            href="/pricing"
            onClick={nav("/pricing")}
            className="flex h-9 items-center gap-2 rounded-md px-3.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
            style={{ background: BRAND.brandDark }}
          >
            <LockIcon /> Unlock Pro
          </a>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto" aria-label="Palette Generator">
        {palette.map((swatch) => {
          const foreground = readableOn(swatch.hex)
          const active = activeId === swatch.id
          return (
            <article
              key={swatch.id}
              className="group relative min-w-[78vw] flex-1 snap-start overflow-hidden sm:min-w-[42vw] lg:min-w-0"
              style={{ background: swatch.hex }}
            >
              <button
                type="button"
                onClick={() => setActiveId(swatch.id)}
                className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                style={{ color: foreground }}
                aria-label={`Edit ${swatch.name}, ${swatch.hex}`}
              />

              <div
                className={`absolute left-1/2 top-[44%] z-10 flex -translate-x-1/2 flex-col gap-2 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 ${active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <ColumnAction label="Edit colour" onClick={() => setActiveId(swatch.id)} foreground={foreground}><EditIcon /></ColumnAction>
                <ColumnAction label={swatch.locked ? "Unlock colour" : "Lock colour"} onClick={() => toggleLock(swatch.id)} foreground={foreground} active={!!swatch.locked}>
                  {swatch.locked ? <LockedIcon /> : <UnlockedIcon />}
                </ColumnAction>
              </div>

              {palette.length > MIN_COLOURS && (
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); remove(swatch.id) }}
                  className="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full text-[24px] font-light leading-none opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current group-hover:opacity-100"
                  style={{ background: withAlpha(foreground, 0.14), color: foreground }}
                  aria-label={`Remove ${swatch.name}`}
                  title="Remove colour"
                >
                  ×
                </button>
              )}

              {swatch.locked && (
                <span
                  className="pointer-events-none absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: withAlpha(foreground, 0.14), color: foreground }}
                  aria-hidden
                >
                  <LockedIcon />
                </span>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-6 text-center sm:p-8">
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); copyHex(swatch) }}
                  className="pointer-events-auto text-[24px] font-bold leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current sm:text-[26px]"
                  style={{ color: foreground, fontFamily: "var(--font-mono)" }}
                  title="Copy HEX value"
                >
                  {swatch.hex.replace("#", "").toUpperCase()}
                </button>
                <p className="mt-3 text-[13px] font-semibold" style={{ color: withAlpha(foreground, 0.72) }}>
                  {swatch.name}
                </p>
              </div>
            </article>
          )
        })}
      </main>

      {activeSwatch && (
        <ColourEditor
          swatch={activeSwatch}
          canRemove={palette.length > MIN_COLOURS}
          onChange={(hex) => change(activeSwatch.id, hex)}
          onToggleLock={() => toggleLock(activeSwatch.id)}
          onRemove={() => remove(activeSwatch.id)}
          onClose={() => setActiveId(null)}
        />
      )}

      <SimpleExportPanel
        open={exportOpen}
        palette={palette}
        onClose={() => setExportOpen(false)}
        onToast={toast.push}
      />
    </div>
  )
}

function ColourEditor({ swatch, canRemove, onChange, onToggleLock, onRemove, onClose }: {
  swatch: Swatch
  canRemove: boolean
  onChange: (hex: string) => void
  onToggleLock: () => void
  onRemove: () => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<"hex" | "rgb" | "hsl">("hex")
  const [hexDraft, setHexDraft] = useState(swatch.hex)
  const [rgbDraft, setRgbDraft] = useState(() => hexToRgb(swatch.hex))
  const [hslDraft, setHslDraft] = useState(() => hexToHsl(swatch.hex))

  useEffect(() => {
    setHexDraft(swatch.hex)
    setRgbDraft(hexToRgb(swatch.hex))
    setHslDraft(hexToHsl(swatch.hex))
  }, [swatch.hex, swatch.id])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const applyRgb = () => onChange(rgbToHex(rgbDraft.r, rgbDraft.g, rgbDraft.b))
  const applyHsl = () => onChange(hslToHex(clamp(hslDraft.h, 0, 360), clamp(hslDraft.s, 0, 100), clamp(hslDraft.l, 0, 100)))

  return (
    <div className="fixed inset-x-3 bottom-4 z-40 mx-auto w-auto max-w-[370px] rounded-lg border border-black/10 bg-white p-4 shadow-2xl sm:inset-x-0" role="dialog" aria-modal="false" aria-label={`Edit ${swatch.name}`}>
      <div className="flex items-center gap-3">
        <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-md" style={{ background: swatch.hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)" }} title="Open colour picker">
          <input type="color" value={swatch.hex} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Visual colour picker" />
        </label>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{swatch.name}</p>
          <p className="mt-0.5 text-[11px] text-charcoal/45">{swatch.hex} · rgb({rgbString(swatch.hex)}) · hsl({hslString(swatch.hex)})</p>
        </div>
        <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-softgrey text-charcoal/55 hover:text-charcoal" aria-label="Close colour editor"><CloseIcon /></button>
      </div>

      <div className="mt-4 grid grid-cols-3 border-b border-softgrey" role="tablist" aria-label="Colour format">
        {(["hex", "rgb", "hsl"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setMode(item)} className="border-b-2 px-2 py-2 text-[11px] font-bold uppercase" style={{ borderColor: mode === item ? BRAND.brand : "transparent", color: mode === item ? BRAND.brandDark : BRAND.medgrey }} role="tab" aria-selected={mode === item}>{item}</button>
        ))}
      </div>

      <div className="mt-3 min-h-10">
        {mode === "hex" && (
          <label className="block">
            <span className="sr-only">HEX value</span>
            <input value={hexDraft} onChange={(event) => setHexDraft(event.target.value)} onBlur={() => onChange(hexDraft)} onKeyDown={(event) => { if (event.key === "Enter") onChange(hexDraft) }} className="h-10 w-full rounded-md border border-softgrey px-3 text-[13px] outline-none focus:border-[#20B9FA]" style={{ fontFamily: "var(--font-mono)" }} />
          </label>
        )}
        {mode === "rgb" && (
          <div className="grid grid-cols-3 gap-2">
            {(["r", "g", "b"] as const).map((channel) => (
              <NumberField key={channel} label={channel.toUpperCase()} value={rgbDraft[channel]} max={255} onChange={(value) => setRgbDraft((draft) => ({ ...draft, [channel]: value }))} onCommit={applyRgb} />
            ))}
          </div>
        )}
        {mode === "hsl" && (
          <div className="grid grid-cols-3 gap-2">
            {(["h", "s", "l"] as const).map((channel) => (
              <NumberField key={channel} label={channel.toUpperCase()} value={hslDraft[channel]} max={channel === "h" ? 360 : 100} onChange={(value) => setHslDraft((draft) => ({ ...draft, [channel]: value }))} onCommit={applyHsl} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-softgrey pt-3">
        <button type="button" onClick={onToggleLock} className="flex items-center gap-1.5 rounded-md border border-softgrey px-2.5 py-1.5 text-[11.5px] font-semibold text-charcoal/70 hover:text-charcoal">
          {swatch.locked ? <LockedIcon /> : <UnlockedIcon />} {swatch.locked ? "Locked" : "Lock"}
        </button>
        {canRemove && <button type="button" onClick={onRemove} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold text-[#B32929] hover:bg-[#B32929]/5"><TrashIcon /> Remove</button>}
      </div>
    </div>
  )
}

function NumberField({ label, value, max, onChange, onCommit }: { label: string; value: number; max: number; onChange: (value: number) => void; onCommit: () => void }) {
  return (
    <label>
      <span className="mb-1 block text-[9.5px] font-bold uppercase text-charcoal/45">{label}</span>
      <input type="number" min={0} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} onBlur={onCommit} onKeyDown={(event) => { if (event.key === "Enter") onCommit() }} className="h-10 w-full rounded-md border border-softgrey px-2 text-[13px] outline-none focus:border-[#20B9FA]" style={{ fontFamily: "var(--font-mono)" }} />
    </label>
  )
}

function ToolbarButton({ icon, children, onClick, disabled }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex h-9 shrink-0 items-center gap-2 rounded-md px-2.5 text-[12.5px] font-semibold text-charcoal/75 transition-colors hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] disabled:cursor-not-allowed disabled:opacity-35">{icon}{children}</button>
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-charcoal/55 transition-colors hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] disabled:cursor-not-allowed disabled:opacity-30">{children}</button>
}

function ColumnAction({ label, onClick, foreground, active, children }: { label: string; onClick: () => void; foreground: string; active?: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={(event) => { event.stopPropagation(); onClick() }} title={label} aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current" style={{ background: active ? foreground : withAlpha(foreground, 0.14), color: active ? readableOn(foreground) : foreground, boxShadow: `inset 0 0 0 1px ${withAlpha(foreground, 0.12)}` }}>{children}</button>
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))

const UndoIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" /></svg>)
const RedoIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h4" /></svg>)
const ResetIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>)
const ShuffleIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>)
const PlusIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>)
const PreviewIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 20h8" /></svg>)
const ExportIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /></svg>)
const LockIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>)
const LockedIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>)
const UnlockedIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.6-1.7" /></svg>)
const EditIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 4.5 5 5-11 11H3.5v-5.5z" /><path d="m12 7 5 5" /></svg>)
const TrashIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 15H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>)
const CloseIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>)
