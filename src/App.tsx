import { useEffect } from "react"
import { isKnownRoute, replaceRoute, useRoute } from "./lib/router"
import { ToastProvider } from "./components/Toast"
import ErrorBoundary from "./components/ErrorBoundary"
import NotFound from "./pages/NotFound"
import Home from "./pages/Home"
import Builder from "./pages/Builder"
import Pricing from "./pages/Pricing"
import Help from "./pages/Help"
import Privacy from "./pages/Privacy"
import Terms from "./pages/Terms"
import Contact from "./pages/Contact"
import QuickDesign from "./pages/QuickDesign"
import GenerateDesign from "./pages/GenerateDesign"
import { BRAND } from "./lib/color"

export default function App() {
  const [route] = useRoute()

  // Correct legacy URLs in the address bar (effect so we never call history APIs during render)
  useEffect(() => {
    if (route === "/preview" || route === "/builder") replaceRoute("/app")
    if (route === "/live-changes") replaceRoute("/quick-design")
  }, [route])

  // Detect unknown paths directly from the URL (useRoute coerces them to "/")
  const rawPath = typeof window !== "undefined" ? window.location.pathname : "/"

  let page: React.ReactNode

  if (!isKnownRoute(rawPath)) {
    page = <NotFound />
  } else {
    switch (route) {
      case "/generate":
        page = <GenerateDesign />
        break
      case "/app":
        page = <Builder />
        break
      case "/preview":
      case "/builder":
        // Render Builder immediately; the effect above redirects the URL asynchronously
        page = <Builder />
        break
      case "/quick-design":
      case "/live-changes":
        page = <QuickDesign />
        break
      case "/pricing":  page = <Pricing />;  break
      case "/help":     page = <Help />;     break
      case "/privacy":  page = <Privacy />;  break
      case "/terms":    page = <Terms />;    break
      case "/contact":  page = <Contact />;  break
      case "/":
      default:          page = <Home />;     break
    }
  }

  return (
    <ToastProvider>
      <ErrorBoundary
        label="route"
        fallback={(error, reset) => <RouteErrorFallback error={error} reset={reset} />}
      >
        {page}
      </ErrorBoundary>
    </ToastProvider>
  )
}

function RouteErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-offwhite px-6 text-center">
      <h1 className="text-[24px] font-bold text-charcoal">Something went wrong</h1>
      <p className="max-w-sm text-[14px] text-charcoal/60">
        An unexpected error occurred. You can try again or return home.
      </p>
      {import.meta.env.DEV && (
        <details className="mt-1 max-w-lg text-left">
          <summary className="cursor-pointer text-[12px] text-charcoal/40 hover:text-charcoal/70">
            Developer details
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-charcoal/5 p-3 text-[11px] leading-relaxed text-charcoal/70">
            {error.message}
          </pre>
        </details>
      )}
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-lg border border-softgrey bg-white px-5 py-2.5 text-[13px] font-semibold text-charcoal hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
          style={{ background: BRAND.cta }}
        >
          Return Home
        </a>
      </div>
    </div>
  )
}
