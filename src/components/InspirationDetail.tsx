import { useEffect, useRef, useState } from "react"
import { type InspirationItem, curatedPaletteAsSwatches } from "../lib/inspirationCatalog"
import { writeHashPalette } from "../lib/paletteStore"
import { useRoute } from "../lib/router"
import { useToast } from "./Toast"

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

const DOT: Record<string, string> = {
  Website: "bg-blue-400",
  App: "bg-violet-400",
  Component: "bg-emerald-400",
}

export default function InspirationDetail({
  item,
  saved,
  onToggleSave,
  onClose,
}: {
  item: InspirationItem
  saved: boolean
  onToggleSave: (id: string) => void
  onClose: () => void
}) {
  const { push } = useToast()
  const [, navigate] = useRoute()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  // Escape + body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev }
  }, [onClose])

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm sm:p-6"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="relative w-full sm:max-w-4xl max-h-[96svh] sm:max-h-[92vh] bg-neutral-950 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header — close button only, minimal */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Category icon */}
            <span className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-white/90 ${DOT[item.category] || "bg-neutral-600"}`}>
              {item.category[0]}
            </span>
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-sm leading-tight truncate">{item.displayName}</h2>
              <p className="text-neutral-500 text-xs mt-0.5 truncate">
                {item.category} · {item.palette.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pb-4">
          {/* Dark card with inset screenshot — Mobbin style */}
          <div className="rounded-2xl bg-neutral-800/70 p-4 sm:p-6">
            <div className="overflow-hidden rounded-xl shadow-lg shadow-black/40">
              <img
                src={item.imagePath}
                alt={item.displayName}
                className="w-full h-auto block"
              />
            </div>
          </div>

          {/* Palette section */}
          <div className="mt-5">
            <p className="text-neutral-500 text-[11px] font-medium uppercase tracking-widest mb-3">
              {item.palette.name} — {item.palette.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {item.palette.colours.map(c => (
                <button
                  key={c.role}
                  onClick={() => copyHex(c.hex)}
                  title={`Copy ${c.hex}`}
                  className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded-sm flex-shrink-0 border border-white/10"
                    style={{ background: c.hex }}
                  />
                  <span className="text-xs leading-none">
                    <span className="text-neutral-300 font-medium">{c.role}</span>
                    <span className="text-neutral-500 font-mono ml-1.5">
                      {copiedHex === c.hex ? "Copied!" : c.hex}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-t border-neutral-800 flex-shrink-0 bg-neutral-950">
          <button
            onClick={() => onToggleSave(item.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            <CopyIcon />
            Copy palette
          </button>

          <button
            onClick={usePalette}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            Use palette →
          </button>
        </div>
      </div>
    </div>
  )
}
