"use client"

import EnsemblePrediction from "@/components/results/ensemble-prediction"
import ModelPredictions from "@/components/results/model-predictions"
import AnalyticsDashboard from "@/components/results/analytics-dashboard"
import BestModel from "@/components/results/best-model"
import type { EDMParameters, ProcessMetrics } from "@/components/simulation/types"
import type { ModelResult } from "@/lib/aiModels"

interface ResultsTabProps {
  parameters: EDMParameters
  processMetrics: ProcessMetrics
  predictions: Record<string, ModelResult>
}

export default function ResultsTab({ predictions, parameters, processMetrics }: ResultsTabProps) {
  return (
    <div className="space-y-6">
      <EnsemblePrediction processMetrics={processMetrics} parameters={parameters} />
      <BestModel models={predictions} />
      <ModelPredictions predictions={predictions} />
      <AnalyticsDashboard />
    </div>
  )
}
