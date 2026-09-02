import { useEffect, useState } from "react"
import { isFirstFlowComplete, loadEntitlement } from "../lib/entitlement"
import { replaceRoute, useNav } from "../lib/router"
import GenerateFlow from "../components/generate-design/GenerateFlow"

export default function GenerateDesign() {
  const nav = useNav()
  const [ready, setReady] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (isFirstFlowComplete(loadEntitlement())) {
      replaceRoute("/app")
      // If replaceRoute doesn't cause a re-render (race), fall back after a short delay
      const fallback = setTimeout(() => {
        setTimedOut(true)
      }, 2000)
      return () => clearTimeout(fallback)
    } else {
      setReady(true)
    }
  }, [])

  // Returning user: replaceRoute fired but component is still mounted
  if (!ready) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-offwhite">
        {timedOut ? (
          <>
            <p className="text-[15px] font-semibold text-charcoal">
              Your workspace is ready
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/app"
                onClick={nav("/app")}
                className="inline-flex min-h-11 items-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                style={{ background: "#0A6288" }}
              >
                Open workspace
              </a>
              <a
                href="/"
                onClick={nav("/")}
                className="inline-flex min-h-11 items-center rounded-lg border border-softgrey bg-white px-5 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
              >
                Return Home
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="text-[14px] text-charcoal/70">Loading…</p>
            <a
              href="/"
              onClick={nav("/")}
              className="text-[13px] font-semibold text-charcoal/50 underline hover:text-charcoal/80"
            >
              Return Home
            </a>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-charcoal/10">
      <GenerateFlow onCancel={() => replaceRoute("/")} />
    </div>
  )
}
