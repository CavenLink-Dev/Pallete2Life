import { useEffect, useMemo, useRef, useState } from "react"

/* Small HSV/HEX/RGB colour editor popover. Matches the design mockup:
 * dark chrome, big SV square, eyedropper + hue + opacity handles,
 * format dropdown and value field. Live updates via onChange. */

type Format = "Hex" | "RGB" | "HSL"

type Props = {
  hex: string
  alpha: number
  onChange: (hex: string, alpha: number) => void
  onClose: () => void
}

export default function ColorEditor({ hex, alpha, onChange, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const alphaRef = useRef<HTMLDivElement>(null)

  const initial = useMemo(() => hexToHsv(hex), [])
  const [h, setH] = useState(initial.h)
  const [s, setS] = useState(initial.s)
  const [v, setV] = useState(initial.v)
  const [a, setA] = useState(alpha)
  const [format, setFormat] = useState<Format>("Hex")
  const [valueField, setValueField] = useState(() => hex.replace("#", "").toUpperCase())

  // outbound sync
  useEffect(() => {
    const nextHex = hsvToHex(h, s, v)
    onChange(nextHex, a)
    setValueField(displayValue(nextHex, h, s, v, format))
  }, [h, s, v, a, format])

  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // outside click closes
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) onClose()
    }
    // defer to avoid catching the opening click
    const t = setTimeout(() => document.addEventListener("mousedown", onDown), 0)
    return () => { clearTimeout(t); document.removeEventListener("mousedown", onDown) }
  }, [onClose])

  // SV drag
  const handleSV = (clientX: number, clientY: number) => {
    const box = svRef.current?.getBoundingClientRect(); if (!box) return
    const nx = clamp((clientX - box.left) / box.width, 0, 1)
    const ny = clamp((clientY - box.top) / box.height, 0, 1)
    setS(nx); setV(1 - ny)
  }
  const handleHue = (clientX: number) => {
    const box = hueRef.current?.getBoundingClientRect(); if (!box) return
    setH(clamp((clientX - box.left) / box.width, 0, 1) * 360)
  }
  const handleAlpha = (clientX: number) => {
    const box = alphaRef.current?.getBoundingClientRect(); if (!box) return
    setA(clamp((clientX - box.left) / box.width, 0, 1))
  }

  const eyedrop = async () => {
    // @ts-expect-error - EyeDropper is not in all TS lib versions yet
    if (typeof window !== "undefined" && typeof window.EyeDropper === "function") {
      try {
        // @ts-expect-error - runtime API
        const result = await new window.EyeDropper().open()
        const picked = hexToHsv(result.sRGBHex)
        setH(picked.h); setS(picked.s); setV(picked.v)
      } catch {/* cancelled */}
    }
  }

  const commitValueField = () => {
    if (format === "Hex") {
      const m = valueField.replace("#", "").trim()
      if (/^[0-9a-fA-F]{6}$/.test(m)) {
        const parsed = hexToHsv("#" + m)
        setH(parsed.h); setS(parsed.s); setV(parsed.v)
      }
    }
  }

  const hex6 = hsvToHex(h, s, v)

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Edit colour"
      className="fixed right-4 top-24 z-50 w-[320px] rounded-2xl border border-white/10 bg-[#1F1F1F] p-4 text-white shadow-2xl animate-pop-in"
      style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)" }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-[15px] font-extrabold tracking-tight">PALETTE</span>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
          aria-label="Close colour editor"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* SV square */}
      <div
        ref={svRef}
        onMouseDown={(e) => {
          handleSV(e.clientX, e.clientY)
          const move = (ev: MouseEvent) => handleSV(ev.clientX, ev.clientY)
          const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up) }
          document.addEventListener("mousemove", move); document.addEventListener("mouseup", up)
        }}
        className="mt-3 aspect-square w-full cursor-crosshair rounded-xl relative"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pureHueHex(h)})`,
        }}
      >
        <div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md"
          style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, background: hex6 }}
        />
      </div>

      {/* Eyedropper + hue + alpha */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={eyedrop}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
          aria-label="Pick colour from screen"
          title="Pick colour from screen"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M5 12l7 7"/><path d="m14 5 4 4"/><path d="M14 5 18.4.6a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L18 9"/></svg>
        </button>

        <div className="flex-1 space-y-2">
          <div
            ref={hueRef}
            onMouseDown={(e) => {
              handleHue(e.clientX)
              const move = (ev: MouseEvent) => handleHue(ev.clientX)
              const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up) }
              document.addEventListener("mousemove", move); document.addEventListener("mouseup", up)
            }}
            className="relative h-2.5 w-full cursor-pointer rounded-full"
            style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
            aria-label="Hue"
            role="slider"
            aria-valuenow={Math.round(h)}
            aria-valuemin={0}
            aria-valuemax={360}
          >
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow"
              style={{ left: `${(h / 360) * 100}%`, background: pureHueHex(h) }}
            />
          </div>

          <div
            ref={alphaRef}
            onMouseDown={(e) => {
              handleAlpha(e.clientX)
              const move = (ev: MouseEvent) => handleAlpha(ev.clientX)
              const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up) }
              document.addEventListener("mousemove", move); document.addEventListener("mouseup", up)
            }}
            className="relative h-2.5 w-full cursor-pointer rounded-full"
            style={{ background: `linear-gradient(to right, transparent, ${hex6}), repeating-conic-gradient(#555 0% 25%, #777 0% 50%) 50% / 8px 8px` }}
            aria-label="Opacity"
            role="slider"
            aria-valuenow={Math.round(a * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow"
              style={{ left: `${a * 100}%`, background: hex6 }}
            />
          </div>
        </div>
      </div>

      {/* Value inputs */}
      <div className="mt-3 flex items-center gap-2">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as Format)}
          className="rounded-md border border-white/15 bg-[#2A2A2A] px-2 py-1.5 text-[11.5px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
          aria-label="Format"
        >
          <option>Hex</option><option>RGB</option><option>HSL</option>
        </select>
        <input
          value={valueField}
          onChange={(e) => setValueField(e.target.value.toUpperCase())}
          onBlur={commitValueField}
          onKeyDown={(e) => { if (e.key === "Enter") { commitValueField(); (e.target as HTMLInputElement).blur() } }}
          className="flex-1 rounded-md border border-white/15 bg-[#2A2A2A] px-2.5 py-1.5 text-[11.5px] font-mono text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
          spellCheck={false}
          aria-label="Colour value"
        />
        <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-[#2A2A2A] px-2 py-1.5">
          <input
            type="number"
            min={0}
            max={100}
            value={Math.round(a * 100)}
            onChange={(e) => setA(clamp(Number(e.target.value) / 100, 0, 1))}
            className="w-9 bg-transparent text-[11.5px] font-mono text-white focus:outline-none"
            aria-label="Opacity percent"
          />
          <span className="text-[11px] text-white/60">%</span>
        </span>
      </div>
    </div>
  )
}

/* ---- utils ---- */
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)) }
function pureHueHex(h: number) { return hsvToHex(h, 1, 1) }

function hexToRgb(hex: string) {
  const m = hex.replace("#", "")
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m
  const num = parseInt(v || "000000", 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}
function rgbToHex(r: number, g: number, b: number) {
  const to = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0")
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase()
}
function hexToHsv(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const rr = r / 255, gg = g / 255, bb = b / 255
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d) % 6
    else if (max === gg) h = (bb - rr) / d + 2
    else h = (rr - gg) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  const v = max
  return { h, s, v }
}
function hsvToHex(h: number, s: number, v: number) {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}
function hsvToHsl(h: number, s: number, v: number) {
  const l = v * (1 - s / 2)
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)
  return { h, s: sl, l }
}
function displayValue(hex: string, h: number, s: number, v: number, format: Format) {
  if (format === "Hex") return hex.replace("#", "").toUpperCase()
  if (format === "RGB") { const { r, g, b } = hexToRgb(hex); return `${r}, ${g}, ${b}` }
  const { h: hh, s: ss, l } = hsvToHsl(h, s, v)
  return `${Math.round(hh)}, ${Math.round(ss * 100)}%, ${Math.round(l * 100)}%`
}
