"use client"

import type { ProcessMetrics, EDMParameters } from "@/components/simulation/types"

interface Props {
  processMetrics: ProcessMetrics
  parameters?: EDMParameters
}

export default function EnsemblePrediction({ processMetrics, parameters }: Props) {
  // Derive dimensional accuracy from spark gap (from parameters) if available; else roughness proxy
  const dimensionalAccuracy = parameters
    ? (parameters.sparkGap * 0.5).toFixed(3)
    : (processMetrics.surfaceRoughness / 100).toFixed(3)

  const processingTime = (100 / (Math.max(processMetrics.materialRemovalRate, 0.01))).toFixed(2)

  const metrics = [
    { label: "Material Removal Rate", value: processMetrics.materialRemovalRate.toFixed(2), unit: "mm³/min" },
    { label: "Surface Roughness", value: processMetrics.surfaceRoughness.toFixed(2), unit: "µm" },
    { label: "Dimensional Accuracy", value: dimensionalAccuracy, unit: "mm" },
    { label: "Processing Time", value: processingTime, unit: "min" },
  ]

  return (
    <div className="bg-card border border-border rounded-lg p-6 max-w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-6">Ensemble Prediction</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[320px]">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-background rounded-lg p-4 border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-accent">{metric.value}</span>
              <span className="text-xs text-muted-foreground">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
