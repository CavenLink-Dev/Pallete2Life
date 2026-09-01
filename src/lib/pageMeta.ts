import { useEffect } from "react"
import type { Route } from "./router"

const SITE_NAME = "HueSet"
const SITE_ORIGIN = typeof window !== "undefined" ? window.location.origin : "https://hueset.app"

export type PageMeta = {
  title: string
  description: string
  path: string
  ogType?: "website" | "article"
  noIndex?: boolean
}

export const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: `${SITE_NAME} — Preview your website or app style before you build`,
    description:
      "Preview your website or app style before you build. Make visual decisions faster before moving into Figma or development.",
    path: "/",
  },
  "/app": {
    title: `Design workspace — ${SITE_NAME}`,
    description: "Edit palettes, preview templates, and customise your design in the HueSet workspace.",
    path: "/app",
    noIndex: true,
  },
  "/generate": {
    title: `Generate Design — ${SITE_NAME}`,
    description: "Start a new design with guided palette and template selection in HueSet.",
    path: "/generate",
  },
  "/quick-design": {
    title: `Quick Design — ${SITE_NAME}`,
    description: "Test colour combinations quickly on basic website, app, and component previews.",
    path: "/quick-design",
  },
  "/pricing": {
    title: `Pricing — ${SITE_NAME}`,
    description: "Simple pricing for HueSet. Your first design is free; export and Pro plans are clearly labelled.",
    path: "/pricing",
  },
  "/help": {
    title: `Help & guide — ${SITE_NAME}`,
    description: "How to use HueSet: palettes, templates, Customise, Brand assets, Full screen, and more.",
    path: "/help",
  },
  "/contact": {
    title: `Contact — ${SITE_NAME}`,
    description: "Contact HueSet for feedback, bug reports, and feature requests.",
    path: "/contact",
  },
  "/privacy": {
    title: `Privacy Policy — ${SITE_NAME}`,
    description: "How HueSet handles your data. Palettes and preferences are stored locally in your browser.",
    path: "/privacy",
  },
  "/terms": {
    title: `Terms of Service — ${SITE_NAME}`,
    description: "Terms for using HueSet. Provided as-is during early access.",
    path: "/terms",
  },
  "/404": {
    title: `Page not found — ${SITE_NAME}`,
    description: "The page you requested could not be found on HueSet.",
    path: "/404",
    noIndex: true,
  },
}

const OG_IMAGE = "/og-image.svg"

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (typeof document === "undefined") return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function upsertLink(rel: string, href: string) {
  if (typeof document === "undefined") return
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", rel)
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

export function applyPageMeta(meta: PageMeta) {
  if (typeof document === "undefined") return

  document.title = meta.title
  upsertMeta("name", "description", meta.description)
  upsertMeta("name", "robots", meta.noIndex ? "noindex, nofollow" : "index, follow")

  const canonical = `${SITE_ORIGIN}${meta.path === "/404" ? window.location.pathname : meta.path}`
  upsertLink("canonical", canonical)

  upsertMeta("property", "og:title", meta.title)
  upsertMeta("property", "og:description", meta.description)
  upsertMeta("property", "og:url", canonical)
  upsertMeta("property", "og:type", meta.ogType ?? "website")
  upsertMeta("property", "og:image", `${SITE_ORIGIN}${OG_IMAGE}`)
  upsertMeta("property", "og:site_name", SITE_NAME)

  upsertMeta("name", "twitter:card", "summary_large_image")
  upsertMeta("name", "twitter:title", meta.title)
  upsertMeta("name", "twitter:description", meta.description)
  upsertMeta("name", "twitter:image", `${SITE_ORIGIN}${OG_IMAGE}`)
}

export function metaForRoute(route: Route, rawPath?: string): PageMeta {
  if (route === "/404" || (rawPath && !PAGE_META[rawPath])) {
    return PAGE_META["/404"]
  }
  return PAGE_META[route] ?? PAGE_META["/"]
}

export function usePageMeta(route: Route, rawPath?: string) {
  useEffect(() => {
    applyPageMeta(metaForRoute(route, rawPath))
  }, [route, rawPath])
}
