import { useEffect, useState } from "react"
import { hasCompletedFlow } from "../lib/generateFlowStore"
import { replaceRoute } from "../lib/router"
import GenerateFlow from "../components/generate-design/GenerateFlow"

export default function GenerateDesign() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (hasCompletedFlow()) {
      replaceRoute("/app")
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) return null

  return (
    <div className="fixed inset-0 bg-charcoal/10">
      <GenerateFlow onCancel={() => replaceRoute("/")} />
    </div>
  )
}
