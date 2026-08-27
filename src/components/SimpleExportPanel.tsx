import { useEffect } from "react"
import { BRAND, hslString, rgbString, type Swatch } from "../lib/color"

type Props = {
  open: boolean
  palette: Swatch[]
  onClose: () => void
  onToast: (message: string, kind?: "info" | "success" | "error") => void
}

export default function SimpleExportPanel({ open, palette, onClose, onToast }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const copy = async (format: "HEX" | "RGB" | "HSL") => {
    const text = palette.map((swatch) => {
      if (format === "RGB") return `${swatch.name}: rgb(${rgbString(swatch.hex)})`
      if (format === "HSL") return `${swatch.name}: hsl(${hslString(swatch.hex)})`
      return `${swatch.name}: ${swatch.hex.toUpperCase()}`
    }).join("\n")

    try {
      await navigator.clipboard.writeText(text)
      onToast(`${format} colours copied`, "success")
    } catch {
      onToast("Couldn't copy the palette", "error")
    }
  }

  const download = () => {
    const content = palette.map((swatch) => [
      swatch.name,
      swatch.hex.toUpperCase(),
      `rgb(${rgbString(swatch.hex)})`,
      `hsl(${hslString(swatch.hex)})`,
    ].join("\t")).join("\n")
    const blob = new Blob([`Name\tHEX\tRGB\tHSL\n${content}\n`], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "palette-preview-colours.txt"
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    onToast("Palette downloaded", "success")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/45 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="simple-export-title"
    >
      <div className="animate-pop-in w-full max-w-md rounded-lg bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="simple-export-title" className="text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Export palette</h2>
            <p className="mt-0.5 text-[12.5px] text-charcoal/55">Your colour values are always free to copy and download.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-softgrey text-charcoal/55 hover:text-charcoal" aria-label="Close export">
            <CloseIcon />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {(["HEX", "RGB", "HSL"] as const).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => copy(format)}
              className="flex min-h-20 flex-col items-start justify-between rounded-md border border-softgrey p-3 text-left transition-colors hover:border-charcoal/25 hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
            >
              <span className="text-[11px] font-bold text-charcoal/45">{format}</span>
              <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: BRAND.brandDark }}>
                <CopyIcon /> Copy
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={download}
          className="mt-3 flex w-full items-center justify-between rounded-md border border-softgrey px-3.5 py-3 text-left transition-colors hover:border-charcoal/25 hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
        >
          <span>
            <span className="block text-[13px] font-bold">Download palette</span>
            <span className="block text-[11.5px] text-charcoal/50">HEX, RGB and HSL in one text file</span>
          </span>
          <DownloadIcon />
        </button>
      </div>
    </div>
  )
}

const CopyIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>)
const DownloadIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>)
const CloseIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>)
