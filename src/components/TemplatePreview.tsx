import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { templateAssetById } from "../lib/templateAssets"

type LoadedSvg = {
  markup: string
  width: number
  height: number
}

const MIN_ZOOM = 0.25
const MAX_ZOOM = 2
const MAX_FIT_ZOOM = 0.5
const ZOOM_STEP = 0.1
const sourceCache = new Map<string, Promise<LoadedSvg>>()

function loadSvg(source: string): Promise<LoadedSvg> {
  const cached = sourceCache.get(source)
  if (cached) return cached

  const request = fetch(source, { cache: "force-cache" })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Template source returned ${response.status}`)
      const markup = await response.text()
      const documentNode = new DOMParser().parseFromString(markup, "image/svg+xml")
      const svg = documentNode.documentElement
      const viewBox = svg.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number)
      const width = viewBox?.length === 4 && Number.isFinite(viewBox[2]) ? viewBox[2] : Number.parseFloat(svg.getAttribute("width") ?? "1440")
      const height = viewBox?.length === 4 && Number.isFinite(viewBox[3]) ? viewBox[3] : Number.parseFloat(svg.getAttribute("height") ?? "900")

      documentNode.querySelectorAll("script").forEach((node) => node.remove())
      documentNode.querySelectorAll("*").forEach((node) => {
        Array.from(node.attributes).forEach((attribute) => {
          if (attribute.name.toLowerCase().startsWith("on")) node.removeAttribute(attribute.name)
          if ((attribute.name === "href" || attribute.name === "xlink:href") && attribute.value.trim().toLowerCase().startsWith("javascript:")) {
            node.removeAttribute(attribute.name)
          }
        })
      })
      svg.removeAttribute("width")
      svg.removeAttribute("height")
      svg.setAttribute("preserveAspectRatio", "xMidYMin meet")
      return { markup: svg.outerHTML, width, height }
    })
    .catch((error) => {
      sourceCache.delete(source)
      throw error
    })

  sourceCache.set(source, request)
  return request
}

export type TemplatePreviewHandle = { fitToScreen: () => void }

const TemplatePreview = forwardRef<TemplatePreviewHandle, { templateId: string }>(function TemplatePreview({ templateId }, ref) {
  const template = templateAssetById.get(templateId)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [svg, setSvg] = useState<LoadedSvg | null>(null)
  const [error, setError] = useState("")
  const [fitZoom, setFitZoom] = useState(MAX_FIT_ZOOM)
  const [zoom, setZoom] = useState(MAX_FIT_ZOOM)
  const [fitMode, setFitMode] = useState(true)

  useEffect(() => {
    let active = true
    setSvg(null)
    setError("")
    setFitMode(true)
    setZoom(MAX_FIT_ZOOM)

    if (!template?.source) {
      setError("Template not found")
      return () => { active = false }
    }

    loadSvg(template.source)
      .then((loadedSvg) => { if (active) setSvg(loadedSvg) })
      .catch(() => { if (active) setError("This template could not be loaded") })

    return () => { active = false }
  }, [template])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !svg || !template) return

    const updateFitZoom = () => {
      const availableWidth = Math.max(1, viewport.clientWidth - 32)
      const availableHeight = Math.max(1, viewport.clientHeight - 72)
      const baseWidth = Math.min(availableWidth, template.category === "Application" ? 390 : 1440)
      const renderedHeightAtFullSize = baseWidth * (svg.height / svg.width)
      const nextFitZoom = clamp(availableHeight / renderedHeightAtFullSize, MIN_ZOOM, MAX_FIT_ZOOM)
      const roundedFitZoom = Math.round(nextFitZoom * 100) / 100

      setFitZoom(roundedFitZoom)
      if (fitMode) setZoom(roundedFitZoom)
    }

    updateFitZoom()
    const observer = new ResizeObserver(updateFitZoom)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [fitMode, svg, template])

  const changeZoom = (direction: -1 | 1) => {
    setFitMode(false)
    setZoom((current) => clamp(Math.round((current + direction * ZOOM_STEP) * 100) / 100, MIN_ZOOM, MAX_ZOOM))
  }

  const fitToScreen = () => {
    setFitMode(true)
    setZoom(fitZoom)
    viewportRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }

  useImperativeHandle(ref, () => ({ fitToScreen }), [fitZoom])

  if (!template) return <TemplateState message="Template not found" />
  if (error) return <TemplateState message={error} />
  if (!svg) return <TemplateState message="Loading template…" loading />

  const baseWidth = template.category === "Application" ? 390 : 1440
  const frameStyle: CSSProperties = {
    width: `${Math.round(zoom * 100)}%`,
    maxWidth: `${Math.round(baseWidth * zoom)}px`,
  }
  const frameClass = template.category === "Application"
    ? "shrink-0 bg-white shadow-[0_22px_55px_-24px_rgba(14,24,33,0.42)]"
    : "shrink-0 bg-white"

  return (
    <div className="relative h-full w-full bg-[#eceef1]">
      <div className="absolute right-3 top-3 z-20 flex h-9 items-center rounded-[8px] border border-[#d7d9dd] bg-white/95 p-0.5 shadow-sm backdrop-blur">
        <ZoomButton
          label="Zoom out"
          onClick={() => changeZoom(-1)}
          disabled={zoom <= MIN_ZOOM}
          icon={<ZoomOutIcon />}
        />
        <span className="w-12 text-center text-[11px] font-bold tabular-nums text-charcoal/65" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <ZoomButton
          label="Zoom in"
          onClick={() => changeZoom(1)}
          disabled={zoom >= MAX_ZOOM}
          icon={<ZoomInIcon />}
        />
        <span className="mx-0.5 h-5 w-px bg-softgrey" aria-hidden />
        <ZoomButton
          label="Fit preview to screen"
          onClick={fitToScreen}
          pressed={fitMode}
          icon={<FitIcon />}
        />
      </div>

      <div ref={viewportRef} className="h-full w-full overflow-auto pt-14">
        <div className="flex min-h-full items-start justify-center px-4 pb-5 sm:px-8">
          <div className={frameClass} style={frameStyle}>
            <div
              className="template-svg-stage w-full"
              role="img"
              aria-label={`${template.category} ${template.type} ${template.variant} template`}
              dangerouslySetInnerHTML={{ __html: svg.markup }}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

export default TemplatePreview

function ZoomButton({
  label,
  onClick,
  icon,
  disabled = false,
  pressed,
}: {
  label: string
  onClick: () => void
  icon: ReactNode
  disabled?: boolean
  pressed?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-[7px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-30 ${
        pressed ? "bg-[#eef8fc] text-brand-dark" : "text-charcoal/60 hover:bg-[#f3f4f6] hover:text-charcoal"
      }`}
    >
      {icon}
    </button>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 4 4M7.5 10.5h6" />
  </svg>
)

const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 4 4M7.5 10.5h6M10.5 7.5v6" />
  </svg>
)

const FitIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
)

function TemplateState({ message, loading = false }: { message: string; loading?: boolean }) {
  return (
    <div className="flex h-full min-h-[360px] w-full items-center justify-center bg-[#f3f4f6] text-sm font-semibold text-charcoal/55">
      <div className="flex items-center gap-2.5">
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-charcoal/15 border-t-brand" aria-hidden />}
        <span>{message}</span>
      </div>
    </div>
  )
}
