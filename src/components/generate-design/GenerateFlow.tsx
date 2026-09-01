import { useState } from "react"
import { replaceRoute } from "../../lib/router"
import { completeFirstFlowInStore } from "../../lib/entitlement"
import { setGenerateResult } from "../../lib/generateFlowStore"
import type { TemplateAsset, TemplateCategory } from "../../lib/templateAssets"
import CategoryStep from "./CategoryStep"
import PathStep, { type DesignPath } from "./PathStep"
import TemplateStep from "./TemplateStep"

type Step = "path" | "category" | "template"

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

export default function GenerateFlow({ onCancel }: { onCancel: () => void }) {
  const [step, setStep] = useState<Step>("path")
  const [category, setCategory] = useState<TemplateCategory | null>(null)

  const goToApp = (asset: TemplateAsset) => {
    const group = asset.category.toLowerCase()
    setGenerateResult({ group, sub: slug(asset.type), templateId: asset.id })
    completeFirstFlowInStore()
    replaceRoute("/app")
  }

  switch (step) {
    case "path":
      return (
        <PathStep
          onContinue={(path: DesignPath) => {
            if (path === "quick") {
              replaceRoute("/quick-design")
              return
            }
            setStep("category")
          }}
          onCancel={onCancel}
        />
      )
    case "category":
      return (
        <CategoryStep
          onContinue={(cat) => { setCategory(cat); setStep("template") }}
          onBack={() => setStep("path")}
        />
      )
    case "template":
      return (
        <TemplateStep
          category={category!}
          onApply={goToApp}
          onBack={() => setStep("category")}
          onChangeCategory={() => setStep("category")}
        />
      )
  }
}
