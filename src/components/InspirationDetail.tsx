import { useEffect, useRef, useState, useCallback } from "react"
import { type InspirationItem, curatedPaletteAsSwatches } from "../lib/inspirationCatalog"
import { writeHashPalette } from "../lib/paletteStore"
import { useRoute, useNav } from "../lib/router"
import { useToast } from "./Toast"
import { BRAND } from "../lib/color"

/* ── Icons ─────────────────────────────────────────────────────────────── */

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  )
}

function MaximizeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
    </svg>
  )
}

function MinimizeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4v4H4M16 4v4h4M8 20v-4H4M16 20v-4h4" />
    </svg>
  )
}

const DOT: Record<string, string> = {
  Website: "bg-blue-400",
  App: "bg-violet-400",
  Component: "bg-emerald-400",
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function InspirationDetail({
  items,
  currentIndex,
  onNavigate,
  saved,
  onToggleSave,
  onClose,
}: {
  items: InspirationItem[]
  currentIndex: number
  onNavigate: (index: number) => void
  saved: boolean
  onToggleSave: (id: string) => void
  onClose: () => void
}) {
  const item = items[currentIndex]
  const { push } = useToast()
  const [, navigate] = useRoute()
  const nav = useNav()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < items.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1)
  }, [hasPrev, currentIndex, onNavigate])

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1)
  }, [hasNext, currentIndex, onNavigate])

  // Keyboard: Escape, ArrowLeft, ArrowRight + body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, goPrev, goNext])

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedHex(hex)
      setTimeout(() => setCopiedHex(null), 1500)
    } catch {}
  }

  const copyCSS = async () => {
    const css = `:root {\n${item.palette.colours
      .map(c => `  --color-${c.role.toLowerCase()}: ${c.hex};`)
      .join("\n")}\n}`
    try {
      await navigator.clipboard.writeText(css)
      push("Palette CSS copied!", "success")
    } catch {
      push("Copy failed", "error")
    }
  }

  const usePalette = () => {
    writeHashPalette(curatedPaletteAsSwatches(item.palette))
    navigate("/app")
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur-sm"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-12 flex-shrink-0 border-b border-neutral-800/60">
        {/* Left: logo + item name */}
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/"
            onClick={nav("/")}
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-400 flex-shrink-0"
            aria-label="HueSet home"
          >
            <img src="/logo-64.png" alt="" className="w-6 h-6 object-contain" />
            <span className="text-white/80 text-sm font-bold hidden sm:inline" style={{ fontFamily: "var(--font-display)" }}>
              Hue<span style={{ color: BRAND.cta }}>Set</span>
            </span>
          </a>
          <span className="w-px h-4 bg-neutral-700 hidden sm:block" />
          <span className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white/90 ${DOT[item.category] || "bg-neutral-600"}`}>
            {item.category[0]}
          </span>
          <span className="text-white text-sm font-medium truncate max-w-[180px] sm:max-w-xs">
            {item.displayName}
          </span>
          <span className="text-neutral-600 text-xs tabular-nums hidden sm:inline">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFullscreen(f => !f)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title={fullscreen ? "Exit full screen" : "Full screen"}
          >
            {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
            <span className="hidden sm:inline">{fullscreen ? "Screen" : "Full screen"}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* ── Main area: screenshot + nav arrows ───────────────────────── */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-0">
        {/* Left arrow */}
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          className={`absolute left-2 sm:left-4 z-10 p-2.5 rounded-full transition-all ${
            hasPrev
              ? "bg-neutral-800/80 text-white hover:bg-neutral-700 shadow-lg"
              : "bg-neutral-800/30 text-neutral-700 cursor-default"
          }`}
          aria-label="Previous design"
        >
          <ChevronLeft />
        </button>

        {/* Screenshot — contained, no scroll */}
        <div className={`flex items-center justify-center transition-all duration-300 ${
          fullscreen
            ? "w-full h-full p-2"
            : "w-full max-w-5xl h-full p-4 sm:p-8"
        }`}>
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              key={item.id}
              src={item.imagePath}
              alt={item.displayName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/60 transition-all duration-300"
              style={{ maxHeight: fullscreen ? "calc(100vh - 120px)" : "calc(100vh - 180px)" }}
              draggable={false}
            />
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={goNext}
          disabled={!hasNext}
          className={`absolute right-2 sm:right-4 z-10 p-2.5 rounded-full transition-all ${
            hasNext
              ? "bg-neutral-800/80 text-white hover:bg-neutral-700 shadow-lg"
              : "bg-neutral-800/30 text-neutral-700 cursor-default"
          }`}
          aria-label="Next design"
        >
          <ChevronRight />
        </button>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div className={`flex-shrink-0 border-t border-neutral-800/60 bg-neutral-950/90 backdrop-blur-sm transition-all ${
        fullscreen ? "px-4 py-2" : "px-4 sm:px-6 py-3"
      }`}>
        <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap">
          {/* Palette swatches — compact inline */}
          <div className="flex items-center gap-1 mr-2">
            {item.palette.colours.map(c => (
              <button
                key={c.role}
                onClick={() => copyHex(c.hex)}
                title={`${c.role}: ${c.hex}`}
                className="group relative"
              >
                <span
                  className="block w-6 h-6 rounded-md border border-white/10 transition-transform hover:scale-110"
                  style={{ background: c.hex }}
                />
                {copiedHex === c.hex && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-white text-neutral-900 text-[10px] font-medium rounded whitespace-nowrap">
                    Copied
                  </span>
                )}
              </button>
            ))}
          </div>

          <span className="text-neutral-500 text-xs hidden sm:inline">
            {item.palette.name}
          </span>

          <div className="flex-1" />

          {/* Actions */}
          <button
            onClick={() => onToggleSave(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              saved
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            <StarIcon filled={saved} />
            {saved ? "Saved" : "Save"}
          </button>

          <button
            onClick={copyCSS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            <CopyIcon />
            <span className="hidden sm:inline">Copy palette</span>
            <span className="sm:hidden">Copy</span>
          </button>

          <button
            onClick={usePalette}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: BRAND.cta }}
          >
            Use palette
            <span className="ml-0.5">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
