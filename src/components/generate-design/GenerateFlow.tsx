import { useState } from "react"
import type { TemplateAsset, TemplateCategory } from "../../lib/templateAssets"
import { markFlowCompleted, setGenerateResult, hasSeenGuide } from "../../lib/generateFlowStore"
import { replaceRoute } from "../../lib/router"
import CategoryStep from "./CategoryStep"
import TemplateStep from "./TemplateStep"
import GuideStep from "./GuideStep"

type Step = "category" | "template" | "guide"

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

export default function GenerateFlow({ onCancel }: { onCancel: () => void }) {
  const [step, setStep] = useState<Step>("category")
  const [category, setCategory] = useState<TemplateCategory | null>(null)
  const [chosenAsset, setChosenAsset] = useState<TemplateAsset | null>(null)

  const goToApp = (asset: TemplateAsset) => {
    const group = asset.category.toLowerCase()
    setGenerateResult({ group, sub: slug(asset.type), templateId: asset.id })
    markFlowCompleted()
    replaceRoute("/app")
  }

  switch (step) {
    case "category":
      return (
        <CategoryStep
          onContinue={(cat) => { setCategory(cat); setStep("template") }}
          onBack={onCancel}
        />
      )
    case "template":
      return (
        <TemplateStep
          category={category!}
          onContinue={(asset) => {
            setChosenAsset(asset)
            if (hasSeenGuide()) {
              goToApp(asset)
            } else {
              setStep("guide")
            }
          }}
          onBack={() => setStep("category")}
          onChangeCategory={() => setStep("category")}
        />
      )
    case "guide":
      return (
        <GuideStep
          onStartDesigning={() => goToApp(chosenAsset!)}
          onBack={() => setStep("template")}
          onSkip={() => goToApp(chosenAsset!)}
        />
      )
  }
}
