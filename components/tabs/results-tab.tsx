"use client"

import EnsemblePrediction from "@/components/results/ensemble-prediction"
import ModelPredictions from "@/components/results/model-predictions"
import AnalyticsDashboard from "@/components/results/analytics-dashboard"

export default function ResultsTab() {
  return (
    <div className="space-y-6">
      <EnsemblePrediction />
      <ModelPredictions />
      <AnalyticsDashboard />
    </div>
  )
}
