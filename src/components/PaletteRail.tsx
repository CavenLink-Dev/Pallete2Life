import { useEffect, useState } from "react"
import {
  hexToHsl,
  hexToRgb,
  hslToHex,
  normalizeHex,
  rgbToHex,
  type Swatch,
} from "../lib/color"

type Props = {
  palette: Swatch[]
  onAdd: () => void
  onRandomise: () => void
  onReset: () => void
  onChange: (id: string, hex: string) => void
  onRename: (id: string, name: string) => void
  onRemove: (id: string) => void
  onToggleLock: (id: string) => void
  className?: string
}

type Draft = { hex: string; rgb: string; hsl: string }

function values(hex: string): Draft {
  const rgb = hexToRgb(hex)
  const hsl = hexToHsl(hex)
  return {
    hex: normalizeHex(hex),
    rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    hsl: `${hsl.h}, ${hsl.s}%, ${hsl.l}%`,
  }
}

export default function PaletteRail({
  palette,
  onAdd,
  onRandomise,
  onReset,
  onChange,
  onRename,
  onRemove,
  onToggleLock,
  className = "",
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const openSwatch = palette.find((swatch) => swatch.id === openId)
  const [draft, setDraft] = useState<Draft>(() => values(palette[0]?.hex ?? "#000000"))

  useEffect(() => {
    if (openSwatch) setDraft(values(openSwatch.hex))
  }, [openSwatch?.hex, openSwatch?.id])

  const togglePicker = (swatch: Swatch) => {
    if (openId === swatch.id) {
      setOpenId(null)
      return
    }
    setDraft(values(swatch.hex))
    setOpenId(swatch.id)
  }

  const setColour = (swatch: Swatch, hex: string) => {
    const next = values(hex)
    setDraft(next)
    onChange(swatch.id, next.hex)
  }

  const updateHex = (swatch: Swatch, input: string) => {
    setDraft((current) => ({ ...current, hex: input }))
    if (/^#?[0-9a-f]{6}$/i.test(input.trim())) setColour(swatch, normalizeHex(input))
  }

  const updateRgb = (swatch: Swatch, input: string) => {
    setDraft((current) => ({ ...current, rgb: input }))
    const channels = input.match(/\d+(?:\.\d+)?/g)?.map(Number)
    if (channels?.length === 3 && channels.every((channel) => channel >= 0 && channel <= 255)) {
      setColour(swatch, rgbToHex(channels[0], channels[1], channels[2]))
    }
  }

  const updateHsl = (swatch: Swatch, input: string) => {
    setDraft((current) => ({ ...current, hsl: input }))
    const channels = input.match(/-?\d+(?:\.\d+)?/g)?.map(Number)
    if (channels?.length === 3 && channels[0] >= 0 && channels[0] <= 360 && channels[1] >= 0 && channels[1] <= 100 && channels[2] >= 0 && channels[2] <= 100) {
      setColour(swatch, hslToHex(channels[0], channels[1], channels[2]))
    }
  }

  return (
    <section className={`flex min-h-0 flex-col overflow-hidden bg-white ${className}`} aria-label="Palette">
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-softgrey px-2">
        <h2 className="min-w-0 flex-1 truncate px-1 text-[13px] font-bold">Palette</h2>
        <RailAction label="Add colour" onClick={onAdd}><PlusIcon /></RailAction>
        <RailAction label="Randomise palette" onClick={onRandomise}><DiceIcon /></RailAction>
        <RailAction label="Reset palette" onClick={onReset}><ResetIcon /></RailAction>
      </header>

      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 ${openId ? "pb-[300px]" : ""}`}>
        <div className="flex flex-col gap-1">
          {palette.map((swatch) => {
            const open = swatch.id === openId
            return (
              <div key={swatch.id} className={`relative ${open ? "z-20" : "z-0"}`}>
                <div className="flex h-16 items-center gap-2 rounded-[8px] border border-transparent p-1 hover:border-softgrey hover:bg-offwhite">
                  <button
                    type="button"
                    className="h-14 w-14 shrink-0 rounded-[7px] border border-charcoal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    style={{ backgroundColor: swatch.hex }}
                    onClick={() => togglePicker(swatch)}
                    aria-expanded={open}
                    aria-controls={`picker-${swatch.id}`}
                    aria-label={`Edit ${swatch.name}`}
                    title={`Edit ${swatch.name}`}
                  />
                  <div className="min-w-0 flex-1">
                    <input
                      value={swatch.name}
                      onChange={(event) => onRename(swatch.id, event.target.value)}
                      className="h-6 w-full truncate rounded-[4px] bg-transparent px-1 text-[12px] font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand"
                      aria-label={`Name for ${swatch.hex}`}
                    />
                    <p className="px-1 font-mono text-[11px] uppercase text-charcoal/55">{swatch.hex}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleLock(swatch.id)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-[7px] text-charcoal/50 hover:bg-white hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    aria-pressed={!!swatch.locked}
                    aria-label={`${swatch.locked ? "Unlock" : "Lock"} ${swatch.name}`}
                    title={`${swatch.locked ? "Unlock" : "Lock"} colour`}
                  >
                    {swatch.locked ? <LockedIcon /> : <UnlockedIcon />}
                  </button>
                </div>

                {open && (
                  <div
                    id={`picker-${swatch.id}`}
                    className="absolute left-0 right-0 top-[68px] rounded-[8px] border border-softgrey bg-white p-3 shadow-xl"
                  >
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-bold uppercase text-charcoal/50">Visual picker</span>
                      <input
                        type="color"
                        value={normalizeHex(swatch.hex)}
                        onChange={(event) => setColour(swatch, event.target.value)}
                        className="h-12 w-full cursor-pointer rounded-[7px] border border-softgrey bg-white p-1"
                        aria-label={`Choose ${swatch.name} visually`}
                      />
                    </label>
                    <div className="mt-2 grid gap-2">
                      <ColourField label="HEX" value={draft.hex} onChange={(value) => updateHex(swatch, value)} />
                      <ColourField label="RGB" value={draft.rgb} onChange={(value) => updateRgb(swatch, value)} />
                      <ColourField label="HSL" value={draft.hsl} onChange={(value) => updateHsl(swatch, value)} />
                    </div>
                    <div className="mt-2 flex justify-between border-t border-softgrey pt-2">
                      <button
                        type="button"
                        onClick={() => { onRemove(swatch.id); setOpenId(null) }}
                        disabled={palette.length <= 1}
                        className="min-h-11 rounded-[7px] px-2 text-[11px] font-semibold text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-35"
                      >
                        Delete colour
                      </button>
                      <button type="button" onClick={() => setOpenId(null)} className="min-h-11 rounded-[7px] px-3 text-[11px] font-semibold text-charcoal hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Done</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ColourField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid grid-cols-[38px_minmax(0,1fr)] items-center gap-2">
      <span className="text-[10px] font-bold text-charcoal/45">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-9 min-w-0 rounded-[7px] border border-softgrey bg-offwhite px-2 font-mono text-[11px] text-charcoal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
    </label>
  )
}

function RailAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className="grid h-11 w-11 shrink-0 place-items-center rounded-[7px] text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{children}</button>
}

const PlusIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
const ResetIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
const DiceIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" /></svg>
const LockedIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
const UnlockedIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.5-2" /></svg>
