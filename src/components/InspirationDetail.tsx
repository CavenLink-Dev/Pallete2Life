import { useState } from "react"
import BuiltInTemplatePreview from "./BuiltInTemplatePreview"
import { deriveTheme } from "../lib/color"
import { curatedPaletteAsSwatches, type InspirationItem } from "../lib/inspirationCatalog"
import { writeHashPalette } from "../lib/paletteStore"
import { PreviewProvider, ScopeProvider } from "./PreviewCtx"
import { useStaticPreviewContext } from "./staticPreviewContext"
import { useDialogFocus } from "../lib/useDialogFocus"
import { useNav } from "../lib/router"
import { useToast } from "./Toast"

type Props = {
  item: InspirationItem
  saved: boolean
  onToggleSave: (id: string) => void
  onClose: () => void
}

export default function InspirationDetail({ item, saved, onToggleSave, onClose }: Props) {
  const dialogRef = useDialogFocus<HTMLDivElement>(true, onClose)
  const nav = useNav()
  const toast = useToast()
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  const swatches = curatedPaletteAsSwatches(item.palette)
  const theme = deriveTheme(swatches)
  const ctx = useStaticPreviewContext(swatches)

  const cssVariables = item.palette.colours
    .map((c) => `  --${c.role.toLowerCase().replace(/\s+/g, "-")}: ${c.hex};`)
    .join("\n")

  const copyAll = async () => {
    const text = `:root {\n${cssVariables}\n}`
    try {
      await navigator.clipboard.writeText(text)
      toast.push("Palette copied as CSS", "success")
    } catch {
      toast.push("Couldn't copy — try selecting the colours manually", "error")
    }
  }

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedHex(hex)
      window.setTimeout(() => setCopiedHex((v) => (v === hex ? null : v)), 1500)
    } catch {
      toast.push("Couldn't copy that colour", "error")
    }
  }

  const useThisPalette = (e: React.MouseEvent) => {
    writeHashPalette(swatches)
    nav("/app")(e)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-3 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.template.name} inspiration detail`}
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[10px] border border-softgrey bg-white shadow-[0_30px_80px_-28px_rgba(14,24,33,0.5)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-softgrey px-4 py-3.5 sm:px-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/40">
              {item.template.category} / {item.template.type}
            </span>
            <h2 className="mt-0.5 text-[18px] font-bold text-charcoal" style={{ fontFamily: "var(--font-display)" }}>
              {item.template.name}
            </h2>
            <p className="mt-0.5 text-[13px] text-charcoal/55">{item.palette.name} — {item.palette.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[7px] border border-softgrey text-charcoal/55 transition-colors hover:bg-[#f3f4f6] hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
            aria-label="Close"
            title="Close"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Live preview */}
          <div className="border-b border-softgrey bg-[#f6f7f8] p-4 sm:p-6">
            <div
              className={`mx-auto overflow-hidden rounded-[10px] border border-softgrey shadow-sm ${
                item.template.layout === "phone" ? "max-w-[360px]" : "max-w-full"
              }`}
            >
              <PreviewProvider value={ctx}>
                <ScopeProvider value={`inspiration-detail:${item.id}`}>
                  <BuiltInTemplatePreview asset={item.template} theme={theme} />
                </ScopeProvider>
              </PreviewProvider>
            </div>
          </div>

          {/* Palette + actions */}
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-charcoal/45">Palette</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {item.palette.colours.map((c) => (
                  <button
                    key={c.role}
                    type="button"
                    onClick={() => copyHex(c.hex)}
                    className="flex items-center gap-2.5 rounded-lg border border-softgrey bg-white px-2.5 py-2 text-left transition-colors hover:border-charcoal/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
                    title={`Copy ${c.hex}`}
                  >
                    <span className="h-8 w-8 shrink-0 rounded-md border border-black/10" style={{ background: c.hex }} aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-charcoal">{c.role}</span>
                      <span className="block truncate text-[11px] text-charcoal/55">
                        {copiedHex === c.hex ? "Copied!" : c.hex.toUpperCase()}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-softgrey pt-4">
              <button
                type="button"
                onClick={() => onToggleSave(item.id)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                style={
                  saved
                    ? { background: "#0A6288", color: "#fff", borderColor: "#0A6288" }
                    : { background: "#fff", color: "#0A6288", borderColor: "#0A6288" }
                }
                aria-pressed={saved}
              >
                <StarIcon filled={saved} />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                onClick={copyAll}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-softgrey bg-white px-4 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
              >
                <CopyIcon />
                Copy CSS
              </button>
              <a
                href="/app"
                onClick={useThisPalette}
                className="ml-auto inline-flex min-h-11 items-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                style={{ background: "#0A6288" }}
              >
                Use this palette
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
)
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m12 2.7 2.8 5.7 6.3.9-4.5 4.4 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.5-4.4 6.3-.9Z" />
  </svg>
)
