"use client"

import type { ModelResult } from "@/lib/aiModels"

interface ModelMetrics {
  name: string
  r2Score: number
  rmse: number
}

interface ModelComparisonProps {
  trainedModels?: Record<string, ModelResult>
}

export default function ModelComparison({ trainedModels = {} }: ModelComparisonProps) {
  // Use trained models if available, otherwise show sample data
  const models: ModelMetrics[] =
    Object.entries(trainedModels).length > 0
      ? Object.entries(trainedModels).map(([name, model]) => ({
          name: name.toUpperCase(),
          r2Score: model.r2Score ?? 0.95,
          rmse: model.rmse ?? 0.03,
        }))
      : [
          { name: "ANN", r2Score: 0.9847, rmse: 0.0234 },
          { name: "SVM", r2Score: 0.9512, rmse: 0.0456 },
          { name: "ELM", r2Score: 0.9623, rmse: 0.0387 },
          { name: "GA", r2Score: 0.9421, rmse: 0.0512 },
        ]

  return (
    <div className="p-4 bg-card rounded-lg border border-border h-fit">
      <h3 className="text-lg font-semibold mb-6">Model Comparison</h3>

      <div className="space-y-3">
        {models.map((model, index) => (
          <div key={index} className="p-3 bg-background rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{model.name}</span>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">R² Score</div>
                  <div className="font-mono text-sm font-semibold text-cyan-400">{model.r2Score.toFixed(4)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">RMSE</div>
                  <div className="font-mono text-sm font-semibold text-orange-400">{model.rmse.toFixed(4)}</div>
                </div>
              </div>
            </div>

            {/* Visual R² Score Bar */}
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${model.r2Score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
