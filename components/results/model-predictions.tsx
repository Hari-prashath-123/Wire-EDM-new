"use client"

import type { ModelResult } from "@/lib/aiModels"
import type { EDMParameters } from "@/components/simulation/types"

interface Props {
  predictions: Record<string, ModelResult>
  parameters?: EDMParameters
}

export default function ModelPredictions({ predictions, parameters }: Props) {
  const modelNames = Object.keys(predictions)
  const metricKeys = ["Material Removal Rate", "Surface Roughness"]

  // Run predict now (some stubs require parameters; if absent, pass an empty object)
  const evaluated: Record<string, any> = {}
  modelNames.forEach(name => {
    try {
      // Some stubs accept EDMParameters; provide a minimal object
      evaluated[name] = predictions[name].predict((parameters as any) ?? {})
    } catch (e) {
      evaluated[name] = {}
    }
  })

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">AI Model Predictions</h2>
      {modelNames.length === 0 ? (
        <div className="text-sm text-muted-foreground">No models trained yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-sm">Metric</th>
                {modelNames.map((model) => (
                  <th key={model} className="text-right py-3 px-4 font-semibold text-sm text-accent">
                    {model}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricKeys.map(metricKey => (
                <tr key={metricKey} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                  <td className="py-3 px-4 text-sm">{metricKey}</td>
                  {modelNames.map(model => (
                    <td key={model} className="text-right py-3 px-4 text-sm">
                      {typeof evaluated[model]?.[metricKey] === 'number'
                        ? evaluated[model][metricKey].toFixed(2)
                        : (evaluated[model]?.[metricKey] ?? 'N/A')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
