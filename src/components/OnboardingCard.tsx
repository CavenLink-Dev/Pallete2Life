import { useEffect, useState } from "react"

/* Dismissible onboarding card pinned to the bottom-right corner. A
 * 4-step checklist ticks off as the user performs each action; the X
 * button dismisses forever via localStorage. Replaces the earlier
 * blocking IntroTour modal. */

const STORAGE_KEY = "pallet-preview:onboarding-v1"
const STEPS = [
  { id: "pick",      label: "Pick a colour" },
  { id: "template",  label: "Try a template" },
  { id: "edit",      label: "Edit an element" },
  { id: "export",    label: "Export tokens" },
] as const

export type OnboardingStep = typeof STEPS[number]["id"]

type Stored = { dismissed: boolean; done: OnboardingStep[] }

function readStored(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { dismissed: false, done: [] }
    const parsed = JSON.parse(raw)
    return {
      dismissed: Boolean(parsed?.dismissed),
      done: Array.isArray(parsed?.done) ? parsed.done.filter((d: string) => STEPS.some((s) => s.id === d)) as OnboardingStep[] : [],
    }
  } catch { return { dismissed: false, done: [] } }
}
function writeStored(next: Stored) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* storage unavailable */ }
}

/* Mark a step complete. Safe to call multiple times. */
export function markOnboardingStep(step: OnboardingStep) {
  const current = readStored()
  if (current.done.includes(step)) return
  writeStored({ dismissed: current.dismissed, done: [...current.done, step] })
  window.dispatchEvent(new Event("pallet-preview:onboarding-updated"))
}

export default function OnboardingCard() {
  const [state, setState] = useState<Stored>(readStored)

  useEffect(() => {
    const refresh = () => setState(readStored())
    window.addEventListener("pallet-preview:onboarding-updated", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("pallet-preview:onboarding-updated", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  if (state.dismissed) return null
  const allDone = STEPS.every((s) => state.done.includes(s.id))
  if (allDone) return null

  const dismiss = () => {
    const next: Stored = { dismissed: true, done: state.done }
    writeStored(next)
    setState(next)
  }

  return (
    <div
      className="fixed bottom-20 right-2 z-40 w-[min(260px,calc(100vw-1rem))] rounded-[8px] border border-[#e5e7eb] bg-white p-3.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] sm:right-4"
      role="region"
      aria-label="Getting started"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.24px] text-[#111827]">Get started</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss getting started"
          title="Dismiss (won't appear again)"
          className="grid h-11 w-11 place-items-center rounded-md text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {STEPS.map((s) => {
          const done = state.done.includes(s.id)
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${done ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-[#d1d5db] bg-white text-transparent"}`}
                aria-hidden
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
              </span>
              <span className={`text-[12px] ${done ? "text-[#6b7280] line-through" : "text-[#111827]"}`}>{s.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
