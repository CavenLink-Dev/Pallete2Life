/** Configured support inbox — do not invent alternate addresses. */
export const SUPPORT_EMAIL = "cavenlink.dev@gmail.com"

export type BugReportFields = {
  route: string
  device: string
  browser: string
  description: string
  steps: string
}

export function buildBugReportMailto(fields: BugReportFields): string {
  const subject = encodeURIComponent("HueSet bug report")
  const body = encodeURIComponent(
    [
      "HueSet bug report",
      "",
      `Route: ${fields.route}`,
      `Device: ${fields.device}`,
      `Browser: ${fields.browser}`,
      "",
      "What happened:",
      fields.description,
      "",
      "Steps to reproduce:",
      fields.steps,
    ].join("\n"),
  )
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
}

export function buildNotifyMeMailto(product: "payments" | "pro" | "export"): string {
  const labels = {
    payments: "HueSet — notify me when payments launch",
    pro: "HueSet — notify me when Pro launches",
    export: "HueSet — notify me when export checkout launches",
  }
  const subject = encodeURIComponent(labels[product])
  const body = encodeURIComponent(
    "Please notify me when HueSet checkout is available.\n\n(Optional) What I am trying to do:\n",
  )
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
}

export function detectBrowserLabel(): string {
  if (typeof navigator === "undefined") return "Unknown"
  const ua = navigator.userAgent
  if (ua.includes("Firefox/")) return "Firefox"
  if (ua.includes("Edg/")) return "Microsoft Edge"
  if (ua.includes("Chrome/")) return "Chrome"
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari"
  return ua.slice(0, 120)
}

export function detectDeviceLabel(): string {
  if (typeof window === "undefined") return "Unknown"
  return `${window.screen.width}×${window.screen.height}`
}
