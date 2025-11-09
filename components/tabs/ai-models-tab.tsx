"use client"

import { useState } from "react"
import AIModelPanel from "@/components/ai-models/ai-model-panel"
import ModelComparison from "@/components/ai-models/model-comparison"
import type { ModelResult } from "@/lib/aiModels"

interface AIModelsTabProps {
  onTrainModel?: (modelType: string, data: any) => void
  trainedModels?: Record<string, ModelResult>
}

export default function AIModelsTab({ onTrainModel, trainedModels = {} }: AIModelsTabProps) {
  const [selectedModel, setSelectedModel] = useState<string>("ANN")
  const [isTraining, setIsTraining] = useState(false)

  const handleTrain = async () => {
    if (!onTrainModel) return
    setIsTraining(true)
    const modelKey = selectedModel.toUpperCase()
    await onTrainModel(modelKey, { useRealData: true })
    setIsTraining(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AIModelPanel
        selectedModel={selectedModel.toLowerCase()}
        onSelectModel={(m) => setSelectedModel(m.toUpperCase())}
        onTrain={handleTrain}
        isTraining={isTraining}
      />
      <ModelComparison /* could be enhanced to consume trainedModels */ />
    </div>
  )
}
