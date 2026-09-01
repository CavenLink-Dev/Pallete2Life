import { useEffect, useState } from "react"
import { isFirstFlowComplete, loadEntitlement } from "../lib/entitlement"
import { replaceRoute } from "../lib/router"
import GenerateFlow from "../components/generate-design/GenerateFlow"

export default function GenerateDesign() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (isFirstFlowComplete(loadEntitlement())) {
      replaceRoute("/app")
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-offwhite">
        <p className="text-[14px] text-charcoal/40">Loading…</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-charcoal/10">
      <GenerateFlow onCancel={() => replaceRoute("/")} />
    </div>
  )
}
