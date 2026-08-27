import { useEffect, useState } from "react"

export type Route =
  | "/"
  | "/builder"
  | "/pricing"
  | "/help"
  | "/privacy"
  | "/terms"
  | "/contact"

const KNOWN: Route[] = ["/", "/builder", "/pricing", "/help", "/privacy", "/terms", "/contact"]

function currentPath(): Route {
  if (typeof window === "undefined") return "/"
  const p = window.location.pathname as Route
  return (KNOWN as string[]).includes(p) ? p : "/"
}

/**
 * Minimal client-side router. Keeps the browser's Back/Forward working
 * (uses the History API), and updates on every route change.
 */
export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(currentPath)

  useEffect(() => {
    const onPop = () => setRoute(currentPath())
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const navigate = (r: Route) => {
    if (r === window.location.pathname) return
    window.history.pushState({}, "", r)
    setRoute(r)
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  return [route, navigate]
}

/**
 * A styled anchor that stays inside the SPA — cmd/ctrl-click still opens a new tab,
 * plain click uses pushState so Back/Forward keeps working.
 */
export function useNav() {
  const [, navigate] = useRoute()
  return (to: Route) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate(to)
  }
}
