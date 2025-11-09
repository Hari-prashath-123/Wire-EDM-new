"use client"

import { Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIModelPanelProps {
  selectedModel: string
  onSelectModel: (model: string) => void
  onTrain: () => void
  isTraining: boolean
}

const models = [
  { id: "svm", label: "SVM", description: "Support Vector Machine" },
  { id: "ann", label: "ANN", description: "Artificial Neural Network" },
  { id: "elm", label: "ELM", description: "Extreme Learning Machine" },
  { id: "ga", label: "GA", description: "Genetic Algorithm" },
]

export default function AIModelPanel({ selectedModel, onSelectModel, onTrain, isTraining }: AIModelPanelProps) {
  return (
    <div className="space-y-6">
      {/* Training Dataset Section */}
      <div className="p-4 bg-card rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Training Dataset</h3>
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button variant="outline" className="flex items-center gap-2 flex-1 bg-transparent">
            <Upload className="w-4 h-4" />
            Upload CSV
          </Button>
          <Button variant="outline" className="flex items-center gap-2 flex-1 bg-transparent">
            <Download className="w-4 h-4" />
            Download Sample
          </Button>
        </div>
      </div>

      {/* Model Selection Grid */}
      <div className="p-4 bg-card rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Select Model</h3>
        <div className="grid grid-cols-2 gap-3">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedModel === model.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              <div className="font-semibold text-sm">{model.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Train Model Button */}
      <Button onClick={onTrain} disabled={isTraining} className="w-full h-12 text-base font-semibold">
        {isTraining ? "Training..." : "Train Model"}
      </Button>
    </div>
  )
}
