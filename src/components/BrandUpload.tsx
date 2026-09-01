import { useEffect, useRef, useState } from "react"
import type { Brand } from "./PreviewCtx"
import { useDialogFocus } from "../lib/useDialogFocus"

const ACCEPT = ["image/svg+xml", "image/png", "image/jpeg", "image/webp"]
const ACCEPT_EXT = ".svg,.png,.jpg,.jpeg,.webp"
const MAX = 5 * 1024 * 1024 // 5 MB

function validate(file: File): string | null {
  const okType = ACCEPT.includes(file.type) || /\.(svg|png|jpe?g|webp)$/i.test(file.name)
  if (!okType) return `“${file.name}” is not supported. Use SVG, PNG, JPG, JPEG or WebP.`
  if (file.size > MAX) return `“${file.name}” is ${(file.size / 1024 / 1024).toFixed(1)} MB — the maximum is 5 MB.`
  return null
}

export default function BrandUpload({
  brand,
  onChange,
  onClose,
}: {
  brand: Brand
  onChange: (b: Brand) => void
  onClose: () => void
}) {
  const [name, setName] = useState(brand.name)
  const dialogRef = useDialogFocus<HTMLDivElement>(true)

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="brand-assets-title">
      <div ref={dialogRef} className="animate-pop-in max-h-[90vh] w-full max-w-lg overflow-auto rounded-[8px] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 id="brand-assets-title" className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Brand assets</h2>
            <p className="mt-0.5 text-sm text-charcoal/55">See your real branding inside HueSet.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-softgrey text-charcoal/50 hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2" aria-label="Close brand assets" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="mt-5">
          <label className="mb-1 block text-xs font-semibold text-charcoal/60">Company name</label>
          <input
            aria-label="Company name"
            value={name}
            onChange={(e) => { setName(e.target.value); onChange({ ...brand, name: e.target.value }) }}
            className="h-11 w-full rounded-[7px] border border-softgrey px-3 text-sm outline-none focus:border-[#20B9FA] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            placeholder="Acme Inc."
          />
        </div>

        <UploadSlot
          title="Company logo"
          value={brand.logo}
          onSet={(v) => onChange({ ...brand, logo: v })}
          reqs="SVG, PNG, JPG, JPEG or WebP · max 5 MB. Recommend SVG or transparent PNG, at least 500 px wide."
          preview="wordmark"
        />
        <UploadSlot
          title="Company symbol / app icon"
          value={brand.symbol}
          onSet={(v) => onChange({ ...brand, symbol: v })}
          reqs="SVG, PNG, JPG, JPEG or WebP · max 5 MB. Recommend a square image, 512×512 px or larger, transparent background."
          preview="icon"
        />

        <p className="mt-5 text-[11px] leading-relaxed text-charcoal/45">
          HueSet never bundles proprietary logos, fonts or icon systems. Defaults use web-safe fonts and generic icons — upload your own supported files to see real branding.
        </p>
      </div>
    </div>
  )
}

function UploadSlot({
  title,
  value,
  onSet,
  reqs,
  preview,
}: {
  title: string
  value: string | null
  onSet: (v: string | null) => void
  reqs: string
  preview: "wordmark" | "icon"
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handle = (file?: File) => {
    setError(null)
    if (!file) return
    const err = validate(file)
    if (err) { setError(err); return }
    const reader = new FileReader()
    reader.onload = () => onSet(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="mt-5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
        {value && <button type="button" onClick={() => onSet(null)} className="min-h-11 px-2 text-xs font-medium text-charcoal/50 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Remove</button>}
      </div>
      <p className="mb-2 text-[11px] leading-relaxed text-charcoal/50">{reqs}</p>

      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files?.[0]) }}
        className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-softgrey p-4 text-left transition-colors hover:border-[#20B9FA]"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-offwhite">
          {value ? (
            <img src={value} alt="" className={preview === "icon" ? "h-full w-full object-cover" : "max-h-full max-w-full object-contain"} />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A818B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-charcoal">{value ? "Replace file" : "Click or drag a file to upload"}</p>
          <p className="text-[11px] text-charcoal/45">{ACCEPT_EXT.replaceAll(",", "  ")}</p>
        </div>
      </button>

      <input ref={ref} type="file" accept={ACCEPT_EXT} className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      {error && (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
          {error}
        </p>
      )}
    </div>
  )
}
