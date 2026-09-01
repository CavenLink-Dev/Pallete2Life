import { Component, type ErrorInfo, type ReactNode } from "react"

const STORE_KEY = "hueframe:v1"

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Catches render-time crashes so a single bad value can't blank the whole app.
 *
 * Before this existed, any throw during render unmounted the entire tree and
 * left an empty <div id="root">, which is what produced the "blank /app" report.
 * The most common cause was malformed localStorage being fed straight into
 * component state, so the recovery action offered here clears that blob.
 *
 * The error is still logged to the console — this boundary is meant to make
 * failures survivable, not invisible.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[HueSet] Unhandled render error:", error, info.componentStack)
  }

  private reload = () => {
    window.location.reload()
  }

  private resetStoredState = () => {
    try {
      localStorage.removeItem(STORE_KEY)
    } catch {
      /* storage unavailable */
    }
    // Drop the palette hash too — a malformed #p= would re-trigger the crash.
    window.location.replace(window.location.pathname)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="grid min-h-dvh place-items-center bg-offwhite px-6 text-charcoal">
        <div className="w-full max-w-md">
          <h1 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Something went wrong
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-charcoal/60">
            HueSet hit an unexpected error and couldn't finish loading this screen. Your saved work is
            usually still intact — try reloading first.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={this.reload}
              className="rounded-lg bg-charcoal px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={this.resetStoredState}
              className="rounded-lg border border-softgrey px-4 py-2.5 text-sm font-semibold text-charcoal/70 hover:border-charcoal/25 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Reset saved data
            </button>
          </div>

          <p className="mt-3 text-[11px] text-charcoal/40">
            Resetting clears your locally saved palette, brand and template choices. It cannot be undone.
          </p>

          <details className="mt-6">
            <summary className="cursor-pointer text-[11px] font-semibold text-charcoal/45">
              Technical details
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-softgrey bg-white p-3 text-[11px] leading-5 text-charcoal/70">
              {error.message || String(error)}
            </pre>
          </details>
        </div>
      </div>
    )
  }
}
