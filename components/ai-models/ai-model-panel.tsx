"use client"

import { Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIModelPanelProps {
  selectedModel: string
  onSelectModel: (model: string) => void
  onTrain: () => void
  isTraining: boolean
  onUpload?: (data: any[]) => void
  uploadedData?: any[] | null
}

const models = [
  { id: "svm", label: "SVM", description: "Support Vector Machine" },
  { id: "ann", label: "ANN", description: "Artificial Neural Network" },
  { id: "elm", label: "ELM", description: "Extreme Learning Machine" },
  { id: "ga", label: "GA", description: "Genetic Algorithm" },
]

export default function AIModelPanel({ selectedModel, onSelectModel, onTrain, isTraining, onUpload, uploadedData }: AIModelPanelProps) {
  // CSV upload handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      // Simple CSV parse (reuse parseCSV from aiModels if possible)
      const lines = text.split('\n').filter(line => line.trim() !== '')
      if (lines.length < 2) return
      const headers = lines[0].split(',').map(h => h.trim())
      const data = lines.slice(1).map(line => {
        const values = line.split(',')
        const obj: { [key: string]: number } = {}
        headers.forEach((header, index) => {
          obj[header] = parseFloat(values[index]) || 0
        })
        return obj
      })
      if (onUpload) onUpload(data)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      {/* Training Dataset Section */}
      <div className="p-4 bg-card rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Training Dataset</h3>
        <div className="flex gap-3 flex-col sm:flex-row">
          <label className="flex-1">
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVUpload} />
            <Button variant="outline" className="flex items-center gap-2 w-full bg-transparent" asChild>
              <span><Upload className="w-4 h-4" /> Upload CSV</span>
            </Button>
          </label>
          <Button variant="outline" className="flex items-center gap-2 flex-1 bg-transparent">
            <Download className="w-4 h-4" />
            Download Sample
          </Button>
        </div>
        {uploadedData && (
          <div className="mt-2 text-xs text-blue-400">Custom dataset loaded: {uploadedData.length} samples</div>
        )}
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
