import { useEffect, useState } from "react"
import { templateAssetById } from "../lib/templateAssets"

const sourceCache = new Map<string, Promise<string>>()

function loadSvg(source: string): Promise<string> {
  const cached = sourceCache.get(source)
  if (cached) return cached

  const request = fetch(source, { cache: "force-cache" })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Template source returned ${response.status}`)
      const markup = await response.text()
      const documentNode = new DOMParser().parseFromString(markup, "image/svg+xml")
      const svg = documentNode.documentElement

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
      return svg.outerHTML
    })
    .catch((error) => {
      sourceCache.delete(source)
      throw error
    })

  sourceCache.set(source, request)
  return request
}

export default function TemplatePreview({ templateId }: { templateId: string }) {
  const template = templateAssetById.get(templateId)
  const [svg, setSvg] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    setSvg("")
    setError("")

    if (!template) {
      setError("Template not found")
      return () => { active = false }
    }

    loadSvg(template.source)
      .then((markup) => { if (active) setSvg(markup) })
      .catch(() => { if (active) setError("This template could not be loaded") })

    return () => { active = false }
  }, [template])

  if (!template) return <TemplateState message="Template not found" />
  if (error) return <TemplateState message={error} />
  if (!svg) return <TemplateState message="Loading template…" loading />

  const frameClass = template.category === "Application"
    ? "mx-auto min-h-full w-full max-w-[390px] bg-white shadow-[0_22px_55px_-24px_rgba(14,24,33,0.42)]"
    : "mx-auto min-h-full w-full max-w-[1440px] bg-white"

  return (
    <div className="h-full w-full overflow-auto bg-[#eceef1]">
      <div className={template.category === "Application" ? "min-h-full px-4 py-5 sm:px-8" : "min-h-full"}>
        <div className={frameClass}>
          <div
            className="template-svg-stage w-full"
            role="img"
            aria-label={`${template.category} ${template.type} ${template.variant} template`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
    </div>
  )
}

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
