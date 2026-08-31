import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"
import { templateAssetById } from "../lib/templateAssets"
import { clampPreviewZoom, computeFitZoom, PREVIEW_FIT_INSET, PREVIEW_FIT_MAX_ZOOM, PREVIEW_FIT_MIN_ZOOM } from "../lib/previewFit"

type LoadedSvg = {
  markup: string
  width: number
  height: number
}

const MIN_ZOOM = PREVIEW_FIT_MIN_ZOOM
const MAX_ZOOM = PREVIEW_FIT_MAX_ZOOM
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
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const [svg, setSvg] = useState<LoadedSvg | null>(null)
  const [error, setError] = useState("")
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    let active = true
    setSvg(null)
    setError("")
    setZoom(1)

    if (!template?.source) {
      setError("Template not found")
      return () => { active = false }
    }

    loadSvg(template.source)
      .then((loadedSvg) => { if (active) setSvg(loadedSvg) })
      .catch(() => { if (active) setError("This template could not be loaded") })

    return () => { active = false }
  }, [template])

  const changeZoom = (direction: -1 | 1) => {
    setZoom((current) => clampPreviewZoom(Math.round((current + direction * ZOOM_STEP) * 100) / 100))
  }

  const fitToScreen = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport || !svg || !template) return
    const baseWidth = template.category === "Application" ? 390 : 1440
    const aspectHeight = svg.height * (baseWidth / svg.width)
    const nextZoom = computeFitZoom(viewport.clientWidth, viewport.clientHeight, baseWidth, aspectHeight)
    setZoom(nextZoom)
    requestAnimationFrame(() => {
      if (viewport) viewport.scrollTo({ top: 0, left: 0, behavior: "auto" })
    })
  }, [svg, template])

  useImperativeHandle(ref, () => ({ fitToScreen }), [fitToScreen])

  useLayoutEffect(() => {
    fitToScreen()
  }, [fitToScreen, templateId])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !svg) return
    const observer = new ResizeObserver(() => fitToScreen())
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [fitToScreen, svg])

  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    if (!viewport || event.button !== 0) return
    dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop }
    viewport.setPointerCapture(event.pointerId)
    setDragging(true)
  }
  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    const drag = dragRef.current
    if (!viewport || !drag) return
    viewport.scrollLeft = drag.left - (event.clientX - drag.x)
    viewport.scrollTop = drag.top - (event.clientY - drag.y)
  }
  const endPan = () => { dragRef.current = null; setDragging(false) }

  if (!template) return <TemplateState message="Template not found" />
  if (error) return <TemplateState message={error} />
  if (!svg) return <TemplateState message="Loading template…" loading />

  const baseWidth = template.category === "Application" ? 390 : 1440
  const frameStyle: CSSProperties = {
    width: `${Math.round(baseWidth * zoom)}px`,
  }
  const frameClass = template.category === "Application"
    ? "mx-auto shrink-0 bg-white shadow-[0_22px_55px_-24px_rgba(14,24,33,0.42)]"
    : "mx-auto shrink-0 bg-white"

  return (
    <div className="relative h-full w-full bg-[#eceef1]">
      <div className="absolute bottom-3 right-3 z-20 flex h-12 items-center rounded-[8px] border border-[#d7d9dd] bg-white/95 p-0.5 shadow-sm backdrop-blur" role="group" aria-label="Preview zoom controls">
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
      </div>

      <div ref={viewportRef} className={`h-full w-full touch-none overflow-auto ${dragging ? "cursor-grabbing select-none" : zoom < 0.99 ? "cursor-grab" : ""}`} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan}>
        <div className="flex min-h-full items-start justify-center" style={{ padding: PREVIEW_FIT_INSET / 2 }}>
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
}: {
  label: string
  onClick: () => void
  icon: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-[7px] text-charcoal/60 transition-colors hover:bg-[#f3f4f6] hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-30"
    >
      {icon}
    </button>
  )
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
