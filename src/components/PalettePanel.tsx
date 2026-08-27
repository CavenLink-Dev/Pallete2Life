import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { createPortal } from "react-dom"
import {
  aaCheck,
  hslString,
  hexToRgb,
  normalizeHex,
  readableOn,
  rgbString,
  rgbToHex,
  withAlpha,
  type Swatch,
} from "../lib/color"

type Props = {
  palette: Swatch[]
  onChange: (id: string, hex: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onRandomize: () => void
  onToggleLock: (id: string) => void
  onRename: (id: string, name: string) => void
  onReorder: (activeId: string, overId: string) => void
  brand: string
  roleLabels?: (string | null)[]
  rightSlot?: ReactNode
}

const CARD_SIZE = "palette-card-size"

export default function PalettePanel({
  palette,
  onChange,
  onAdd,
  onRemove,
  onRandomize,
  onToggleLock,
  onRename,
  onReorder,
  brand,
  roleLabels,
  rightSlot,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const openSwatch = palette.find((item) => item.id === openId) ?? null
  const openRole = openSwatch ? roleLabels?.[palette.indexOf(openSwatch)] ?? null : null
  const dragSwatch = palette.find((item) => item.id === dragId) ?? null
  const dragRole = dragSwatch ? roleLabels?.[palette.indexOf(dragSwatch)] ?? null : null
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] },
    }),
  )

  const closeEditor = () => {
    setOpenId(null)
    setAnchor(null)
  }

  useEffect(() => {
    if (openId && !openSwatch) closeEditor()
  }, [openId, openSwatch])

  useEffect(() => {
    if (!openId) return
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeEditor()
    }
    const pointerdown = (event: PointerEvent) => {
      const target = event.target as Node
      if (anchor?.contains(target) || editorRef.current?.contains(target)) return
      closeEditor()
    }
    window.addEventListener("keydown", keydown)
    document.addEventListener("pointerdown", pointerdown)
    return () => {
      window.removeEventListener("keydown", keydown)
      document.removeEventListener("pointerdown", pointerdown)
    }
  }, [anchor, openId])

  const open = (id: string, element: HTMLElement) => {
    if (id === openId) return closeEditor()
    setOpenId(id)
    setAnchor(element)
  }

  const dragStart = ({ active }: DragStartEvent) => {
    closeEditor()
    setDragId(String(active.id))
  }

  const dragEnd = ({ active, over }: DragEndEvent) => {
    setDragId(null)
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id))
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1 overflow-x-auto px-0.5 py-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={dragStart} onDragCancel={() => setDragId(null)} onDragEnd={dragEnd}>
          <SortableContext items={palette.map((item) => item.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex min-w-max snap-x snap-proximity items-stretch gap-3">
              {palette.map((swatch, index) => (
                <SortableCard
                  key={swatch.id}
                  swatch={swatch}
                  role={roleLabels?.[index] ?? null}
                  selected={openId === swatch.id}
                  brand={brand}
                  canRemove={palette.length > 1}
                  onOpen={open}
                  onToggleLock={() => onToggleLock(swatch.id)}
                  onRemove={() => onRemove(swatch.id)}
                />
              ))}
              <button
                type="button"
                onClick={onAdd}
                aria-label="Add colour"
                className={`${CARD_SIZE} group flex shrink-0 snap-start flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-charcoal/20 bg-white text-charcoal/55 transition-[border-color,color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-charcoal/40 hover:text-charcoal hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-offwhite transition-colors group-hover:bg-softgrey/70"><PlusIcon /></span>
                <span className="text-xs font-bold uppercase">Add colour</span>
              </button>
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
            {dragSwatch ? <CardFace swatch={dragSwatch} role={dragRole} dragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <button
          type="button"
          onClick={onRandomize}
          className="flex h-10 items-center gap-2 rounded-lg border border-softgrey bg-white px-3.5 text-xs font-semibold text-charcoal/75 transition-[border-color,color,box-shadow] hover:border-charcoal/30 hover:text-charcoal hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          title="Randomise unlocked colours"
        >
          <ShuffleIcon /> Randomise
        </button>
        {rightSlot}
      </div>

      {openSwatch && anchor && createPortal(
        <ColorEditor
          editorRef={editorRef}
          anchor={anchor}
          swatch={openSwatch}
          role={openRole}
          canRemove={palette.length > 1}
          onChange={(hex) => onChange(openSwatch.id, hex)}
          onRename={(name) => onRename(openSwatch.id, name)}
          onToggleLock={() => onToggleLock(openSwatch.id)}
          onRemove={() => {
            onRemove(openSwatch.id)
            closeEditor()
          }}
          onClose={() => {
            closeEditor()
            anchor.focus()
          }}
        />,
        document.body,
      )}
    </div>
  )
}

function SortableCard({
  swatch,
  role,
  selected,
  brand,
  canRemove,
  onOpen,
  onToggleLock,
  onRemove,
}: {
  swatch: Swatch
  role: string | null
  selected: boolean
  brand: string
  canRemove: boolean
  onOpen: (id: string, anchor: HTMLElement) => void
  onToggleLock: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: swatch.id,
    transition: { duration: 180, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.28 : 1,
    zIndex: isDragging ? 20 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className={`${CARD_SIZE} group relative shrink-0 snap-start`}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            onOpen(swatch.id, event.currentTarget)
            return
          }
          listeners?.onKeyDown?.(event)
        }}
        onClick={(event) => {
          if (!isDragging) onOpen(swatch.id, event.currentTarget)
        }}
        aria-label={`${role ?? swatch.name}, ${swatch.hex}. Open colour picker or drag to reorder.`}
        aria-expanded={selected}
        className="h-full w-full cursor-grab overflow-hidden rounded-lg bg-white text-left active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        style={{
          boxShadow: selected
            ? `0 0 0 2px ${brand}, 0 8px 22px ${withAlpha("#0E1821", 0.12)}`
            : `inset 0 0 0 1px ${withAlpha("#0E1821", 0.1)}, 0 4px 14px ${withAlpha("#0E1821", 0.07)}`,
        }}
      >
        <CardFace swatch={swatch} role={role} />
      </button>

      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); onToggleLock() }}
        aria-label={swatch.locked ? `Unlock ${role ?? swatch.name}` : `Lock ${role ?? swatch.name}`}
        aria-pressed={Boolean(swatch.locked)}
        className={`absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-[background-color,color,border-color,transform] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${swatch.locked ? "border-white bg-white text-charcoal shadow-sm" : "border-white/50 bg-charcoal/20 text-white backdrop-blur-sm hover:bg-charcoal/35"}`}
        title={swatch.locked ? "Unlock colour" : "Lock colour for Randomise"}
      >
        {swatch.locked ? <LockIcon /> : <UnlockIcon />}
      </button>

      {canRemove && (
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onRemove() }}
          aria-label={`Delete ${role ?? swatch.name}`}
          className="absolute right-3 top-3 z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/95 text-charcoal opacity-0 shadow-sm transition-[opacity,transform,color] hover:scale-105 hover:text-[#C22F2F] focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 group-focus-within:opacity-100 md:flex"
          title="Delete colour"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  )
}

function CardFace({ swatch, role, dragging = false }: { swatch: Swatch; role: string | null; dragging?: boolean }) {
  return (
    <span className={`${CARD_SIZE} flex flex-col overflow-hidden rounded-lg bg-white ${dragging ? "rotate-1 shadow-2xl" : ""}`} aria-hidden={dragging || undefined}>
      <span className="min-h-0 flex-1" style={{ background: swatch.hex }} />
      <span className="flex h-[52px] shrink-0 items-center justify-between gap-3 px-4">
        <span className="min-w-0">
          <span className="block truncate text-[10px] font-bold uppercase text-charcoal/50" style={{ fontFamily: "var(--font-display)" }}>{role ?? swatch.name}</span>
          <span className="mt-1 block text-[15px] font-bold text-charcoal" style={{ fontFamily: "var(--font-mono)" }}>{swatch.hex.toUpperCase()}</span>
        </span>
        <DragDotsIcon />
      </span>
    </span>
  )
}

const ROLE_SUGGESTIONS = ["Primary", "Secondary", "Tertiary", "Text", "Caption", "Border", "Surface", "Outline", "Navigation", "Disabled", "Background", "Accent"]

function ColorEditor({
  editorRef,
  anchor,
  swatch,
  role,
  canRemove,
  onChange,
  onRename,
  onToggleLock,
  onRemove,
  onClose,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>
  anchor: HTMLElement
  swatch: Swatch
  role: string | null
  canRemove: boolean
  onChange: (hex: string) => void
  onRename: (name: string) => void
  onToggleLock: () => void
  onRemove: () => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(swatch.hex)
  const [nameDraft, setNameDraft] = useState(swatch.name)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const position = useAnchoredPosition(anchor)
  const hsv = hexToHsv(swatch.hex)
  const eyedropperAvailable = "EyeDropper" in window

  useEffect(() => setDraft(swatch.hex), [swatch.hex, swatch.id])
  useEffect(() => setNameDraft(swatch.name), [swatch.name, swatch.id])

  const updateSV = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    const rect = event.currentTarget.getBoundingClientRect()
    const saturation = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 100
    const value = (1 - clamp((event.clientY - rect.top) / rect.height, 0, 1)) * 100
    onChange(hsvToHex(hsv.h, saturation, value))
  }

  const useEyedropper = async () => {
    const Picker = (window as typeof window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper
    if (!Picker) return
    try {
      const result = await new Picker().open()
      onChange(normalizeHex(result.sRGBHex))
    } catch {
      // Closing the browser eyedropper is not an error the user needs to handle.
    }
  }

  const copyHex = async () => {
    await navigator.clipboard.writeText(swatch.hex.toUpperCase())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div
      ref={editorRef}
      className="animate-pop-in fixed z-[100] max-h-[calc(100vh-24px)] overflow-y-auto rounded-[22px] border border-charcoal/15 bg-white shadow-2xl"
      style={position}
      role="dialog"
      aria-label={`Edit ${role ?? swatch.name}`}
    >
      <div className="p-4">
        <div
          className="relative aspect-[1.55/1] w-full touch-none cursor-crosshair overflow-hidden rounded-[14px] border border-charcoal/10"
          style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${hsv.h} 100% 50%)` }}
          onPointerDown={updateSV}
          onPointerMove={(event) => { if (event.buttons === 1) updateSV(event) }}
          aria-label="Saturation and brightness"
        >
          <span
            className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.55)]"
            style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, background: swatch.hex }}
          />
        </div>

        <div className="relative my-4 h-5">
          <input
            type="range"
            min="0"
            max="360"
            value={Math.round(hsv.h)}
            onChange={(event) => onChange(hsvToHex(Number(event.target.value), hsv.s, hsv.v))}
            className="palette-hue-slider absolute inset-0 h-5 w-full cursor-pointer appearance-none rounded-full"
            aria-label="Hue"
          />
        </div>

        <label className="flex h-12 items-center gap-3 rounded-xl border-2 border-brand/85 px-3 focus-within:ring-2 focus-within:ring-brand/20">
          <span className="sr-only">HEX</span>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => onChange(normalizeHex(draft))}
            onKeyDown={(event) => { if (event.key === "Enter") onChange(normalizeHex(draft)) }}
            className="min-w-0 flex-1 bg-transparent text-xl font-medium uppercase outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <span className="h-8 w-8 shrink-0 rounded-lg border border-charcoal/10" style={{ background: swatch.hex }} aria-hidden />
        </label>
      </div>

      {detailsOpen && (
        <div className="border-t border-softgrey px-4 py-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase text-charcoal/45">Name</span>
            <input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={() => onRename(nameDraft)}
              onKeyDown={(event) => { if (event.key === "Enter") onRename(nameDraft) }}
              list="palette-role-suggestions"
              className="w-full rounded-lg border border-softgrey px-3 py-2 text-sm font-semibold outline-none focus:border-brand"
              aria-label="Colour name"
            />
            <datalist id="palette-role-suggestions">{ROLE_SUGGESTIONS.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ReadField label="RGB" value={rgbString(swatch.hex)} />
            <ReadField label="HSL" value={hslString(swatch.hex)} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <ContrastBadge fg="#FFFFFF" bg={swatch.hex} label="White" />
            <ContrastBadge fg="#0E1821" bg={swatch.hex} label="Dark" />
          </div>
          <div className="mt-4 flex gap-2 border-t border-softgrey pt-3">
            <button type="button" onClick={onToggleLock} className={`flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${swatch.locked ? "border-charcoal bg-charcoal text-white" : "border-softgrey text-charcoal/70 hover:border-charcoal/30"}`}>
              {swatch.locked ? <LockIcon /> : <UnlockIcon />}{swatch.locked ? "Locked" : "Lock"}
            </button>
            {canRemove && <button type="button" onClick={onRemove} className="h-10 rounded-lg border border-softgrey px-3 text-xs font-semibold text-charcoal/60 hover:border-[#C22F2F]/30 hover:text-[#C22F2F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C22F2F] focus-visible:ring-offset-2">Delete</button>}
            <button type="button" onClick={onClose} className="ml-auto h-10 rounded-lg bg-charcoal px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal focus-visible:ring-offset-2">Done</button>
          </div>
        </div>
      )}

      <div className="flex h-14 items-center border-t border-softgrey px-4">
        <button
          type="button"
          onClick={() => setDetailsOpen((value) => !value)}
          aria-expanded={detailsOpen}
          className="flex h-10 items-center gap-2 rounded-lg px-1 text-sm font-semibold hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Picker <ChevronIcon open={detailsOpen} />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={useEyedropper} disabled={!eyedropperAvailable} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-offwhite disabled:cursor-not-allowed disabled:opacity-30" aria-label="Pick colour from screen" title="Pick colour from screen"><EyedropperIcon /></button>
          <button type="button" onClick={copyHex} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-offwhite" aria-label={copied ? "HEX copied" : "Copy HEX"} title={copied ? "Copied" : "Copy HEX"}><CopyIcon /></button>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-offwhite" aria-label="Close colour picker" title="Done"><CloseIcon /></button>
        </div>
      </div>
    </div>
  )
}

function useAnchoredPosition(anchor: HTMLElement): CSSProperties {
  const [position, setPosition] = useState<CSSProperties>({ visibility: "hidden" })
  useLayoutEffect(() => {
    const update = () => {
      const rect = anchor.getBoundingClientRect()
      const width = Math.min(386, window.innerWidth - 24)
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12)
      const estimatedHeight = 474
      const top = window.innerHeight - rect.bottom >= estimatedHeight + 12 ? rect.bottom + 8 : Math.max(12, rect.top - estimatedHeight - 8)
      setPosition({ left, top, width })
    }
    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [anchor])
  return position
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hexToHsv(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  let h = 0
  if (delta) {
    if (max === red) h = 60 * (((green - blue) / delta) % 6)
    else if (max === green) h = 60 * ((blue - red) / delta + 2)
    else h = 60 * ((red - green) / delta + 4)
  }
  if (h < 0) h += 360
  return { h, s: max ? (delta / max) * 100 : 0, v: max * 100 }
}

function hsvToHex(h: number, s: number, v: number) {
  const saturation = s / 100
  const value = v / 100
  const chroma = value * saturation
  const section = h / 60
  const x = chroma * (1 - Math.abs((section % 2) - 1))
  const [red, green, blue] = section < 1 ? [chroma, x, 0] : section < 2 ? [x, chroma, 0] : section < 3 ? [0, chroma, x] : section < 4 ? [0, x, chroma] : section < 5 ? [x, 0, chroma] : [chroma, 0, x]
  const match = value - chroma
  return rgbToHex((red + match) * 255, (green + match) * 255, (blue + match) * 255)
}

export function ContrastBadge({ fg, bg, label }: { fg: string; bg: string; label?: string }) {
  const { ratio, aa, aaLarge } = aaCheck(fg, bg)
  const status = aa ? "AA Pass" : aaLarge ? "AA Large" : "AA Fail"
  const color = aa ? "#0E8A4E" : aaLarge ? "#9A6B00" : "#C22F2F"
  const tint = aa ? "rgba(14,138,78,0.1)" : aaLarge ? "rgba(154,107,0,0.12)" : "rgba(194,47,47,0.1)"
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold" style={{ background: tint, color }} title={`${label ?? "Contrast"}: ${ratio}:1`}><span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: bg, color: fg }}>A</span>{label && <span style={{ color: "#7A818B" }}>{label}</span>}{ratio}:1 · {status}</span>
}

function ReadField({ label, value }: { label: string; value: string }) {
  return <div><span className="mb-1 block text-[10px] font-semibold uppercase text-charcoal/45">{label}</span><div className="truncate rounded-lg border border-softgrey bg-offwhite px-2.5 py-2 text-xs text-charcoal/80" style={{ fontFamily: "var(--font-mono)" }} title={value}>{value}</div></div>
}

const PlusIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
const ShuffleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
const LockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
const UnlockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.6-1.7" /></svg>
const CloseIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
const ChevronIcon = ({ open }: { open: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden><path d="m6 9 6 6 6-6" /></svg>
const EyedropperIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m19 3 2 2-9.5 9.5-3-3L18 2l1 1Z" /><path d="m9 11-4.5 4.5a2.1 2.1 0 0 0-.5 1V20h3.5a2.1 2.1 0 0 0 1-.5L13 15" /></svg>
const CopyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></svg>
const DragDotsIcon = () => <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" className="shrink-0 text-charcoal/25" aria-hidden><circle cx="3" cy="4" r="1.1" /><circle cx="9" cy="4" r="1.1" /><circle cx="3" cy="8" r="1.1" /><circle cx="9" cy="8" r="1.1" /><circle cx="3" cy="12" r="1.1" /><circle cx="9" cy="12" r="1.1" /></svg>
