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
const NAV_EVENT = "pallet-preview:navigate"

function currentPath(): Route {
  if (typeof window === "undefined") return "/"
  const p = window.location.pathname as Route
  return (KNOWN as string[]).includes(p) ? p : "/"
}

/**
 * Minimal client-side router. Every `useRoute` instance listens for both
 * native `popstate` (browser Back/Forward) and a custom `NAV_EVENT` fired
 * by `navigate` — so a click in the header updates the App-level route.
 */
export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(currentPath)

  useEffect(() => {
    const onChange = () => setRoute(currentPath())
    window.addEventListener("popstate", onChange)
    window.addEventListener(NAV_EVENT, onChange)
    return () => {
      window.removeEventListener("popstate", onChange)
      window.removeEventListener(NAV_EVENT, onChange)
    }
  }, [])

  const navigate = (r: Route) => {
    if (r === window.location.pathname) return
    window.history.pushState({}, "", r)
    // fan-out so every other useRoute() in the tree updates
    window.dispatchEvent(new Event(NAV_EVENT))
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  return [route, navigate]
}

/**
 * A styled anchor helper — cmd/ctrl-click still opens a new tab, plain click
 * uses pushState + the custom nav event so Back/Forward keeps working and
 * every subscribed component re-renders.
 */
export function useNav() {
  const [, navigate] = useRoute()
  return (to: Route) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate(to)
  }
}
