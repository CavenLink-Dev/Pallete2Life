import { Component, type ErrorInfo, type ReactNode } from "react"
import { BRAND } from "../lib/color"

type Props = {
  children: ReactNode
  /** Short label shown in DEV logs and fallback UI (e.g. "editor-preview", "route"). */
  label?: string
  /** Custom fallback renderer. Receives the thrown error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode
  /** Called after the internal error state is cleared, before re-render. */
  onReset?: () => void
}

type State = { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(
        `[HueSet${this.props.label ? ` · ${this.props.label}` : ""}] Uncaught error`,
        error,
        info.componentStack,
      )
    }
  }

  reset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    if (!this.state.error) return this.props.children

    if (this.props.fallback) return this.props.fallback(this.state.error, this.reset)

    return <DefaultFallback error={this.state.error} reset={this.reset} label={this.props.label} />
  }
}

function DefaultFallback({ error, reset, label }: { error: Error; reset: () => void; label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-offwhite px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-charcoal/35">
        {label ?? "Error"}
      </p>
      <h1 className="text-[24px] font-bold text-charcoal">Something went wrong</h1>
      <p className="max-w-sm text-[14px] text-charcoal/60">
        An unexpected error occurred. Try resetting the view.
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
          className="rounded-lg border border-softgrey bg-white px-5 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2"
          style={{ background: BRAND.brand }}
        >
          Return Home
        </a>
      </div>
    </div>
  )
}
