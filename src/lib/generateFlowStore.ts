const FLOW_KEY = "pallet-preview:generate-flow-v1"
const RESULT_KEY = "pallet-preview:generate-result"
const GUIDE_KEY = "pallet-preview:guide-seen-v1"

type FlowState = { completed: boolean }
type GenerateResult = { group: string; sub: string; templateId: string }

export function hasCompletedFlow(): boolean {
  try {
    const raw = localStorage.getItem(FLOW_KEY)
    return raw ? (JSON.parse(raw) as FlowState).completed === true : false
  } catch {
    return false
  }
}

export function markFlowCompleted() {
  localStorage.setItem(FLOW_KEY, JSON.stringify({ completed: true }))
}

export function resetFlow() {
  localStorage.removeItem(FLOW_KEY)
  sessionStorage.removeItem(RESULT_KEY)
}

export function setGenerateResult(result: GenerateResult) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result))
}

export function readGenerateResult(): GenerateResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY)
    if (!raw) return null
    sessionStorage.removeItem(RESULT_KEY)
    return JSON.parse(raw) as GenerateResult
  } catch {
    return null
  }
}

export function hasSeenGuide(): boolean {
  return localStorage.getItem(GUIDE_KEY) === "true"
}

export function markGuideSeen() {
  localStorage.setItem(GUIDE_KEY, "true")
}
