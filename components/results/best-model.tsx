"use client"

import type { ModelResult } from "@/lib/aiModels"

interface Props {
  models: Record<string, ModelResult>
}

export default function BestModel({ models }: Props) {
  const entries = Object.entries(models)
  if (entries.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Best Model</h2>
        <p className="text-sm text-muted-foreground">No models trained yet.</p>
      </div>
    )
  }

  // Choose best by highest accuracy; break ties with lowest RMSE
  const best = entries.reduce((bestSoFar, current) => {
    if (!bestSoFar) return current
    const [, a] = bestSoFar
    const [, b] = current
    if ((b.accuracy ?? 0) !== (a.accuracy ?? 0)) {
      return (b.accuracy ?? 0) > (a.accuracy ?? 0) ? current : bestSoFar
    }
    return (b.rmse ?? Number.POSITIVE_INFINITY) < (a.rmse ?? Number.POSITIVE_INFINITY) ? current : bestSoFar
  })

  const [bestName, bestModel] = best

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Best Model</h2>
        <span className="text-xs px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">which is better</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-lg font-semibold text-accent">{bestName}</div>
        <div className="text-sm text-muted-foreground space-x-6">
          <span>Accuracy: <span className="text-foreground font-medium">{(bestModel.accuracy ?? 0).toFixed(2)}</span></span>
          <span>RMSE: <span className="text-foreground font-medium">{(bestModel.rmse ?? 0).toFixed(2)}</span></span>
        </div>
      </div>
    </div>
  )
}
