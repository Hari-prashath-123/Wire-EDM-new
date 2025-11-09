"use client"

import { useState } from "react"
import AIModelPanel from "@/components/ai-models/ai-model-panel"
import ModelComparison from "@/components/ai-models/model-comparison"

export default function AIModelsTab() {
  const [selectedModel, setSelectedModel] = useState<string>("ann")
  const [isTraining, setIsTraining] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - AI Model Panel */}
      <AIModelPanel
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onTrain={() => setIsTraining(!isTraining)}
        isTraining={isTraining}
      />

      {/* Right Column - Model Comparison */}
      <ModelComparison />
    </div>
  )
}
