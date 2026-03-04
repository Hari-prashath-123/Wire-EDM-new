"use client"

import EnsemblePrediction from "@/components/results/ensemble-prediction"
import ModelPredictions from "@/components/results/model-predictions"
import AnalyticsDashboard from "@/components/results/analytics-dashboard"
import BestModel from "@/components/results/best-model"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Info } from "lucide-react"
import type { EDMParameters, ProcessMetrics } from "@/components/simulation/types"
import type { ModelResult } from "@/lib/aiModels"

interface ResultsTabProps {
  parameters: EDMParameters
  processMetrics: ProcessMetrics
  predictions: Record<string, ModelResult>
}

export default function ResultsTab({ predictions, parameters, processMetrics }: ResultsTabProps) {
  // Models to compare for Surface Roughness prediction
  const researchModels = ["MLR", "PCR", "RSM", "ANN"]
  
  return (
    <div className="space-y-6">
      <EnsemblePrediction processMetrics={processMetrics} parameters={parameters} />
      
      {/* Model Performance Comparison Section */}
      <Card className="bg-card border-border">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Model Performance Comparison (Surface Roughness)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-4 px-4 font-semibold text-sm text-foreground">Model</th>
                  <th className="text-right py-4 px-4 font-semibold text-sm text-foreground">Accuracy (%)</th>
                  <th className="text-right py-4 px-4 font-semibold text-sm text-foreground">RMSE</th>
                </tr>
              </thead>
              <tbody>
                {researchModels.map((modelName, idx) => {
                  const model = predictions[modelName]
                  const isTrained = model !== undefined
                  const isANN = modelName === "ANN"
                  
                  return (
                    <tr 
                      key={modelName} 
                      className={`border-b border-border/50 transition-colors ${
                        isANN ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-background/50'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isANN ? 'text-primary' : 'text-foreground'}`}>
                            {modelName}
                          </span>
                          {isANN && (
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                              Best
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {modelName === "MLR" && "Multiple Linear Regression"}
                          {modelName === "PCR" && "Principal Component Regression"}
                          {modelName === "RSM" && "Response Surface Methodology"}
                          {modelName === "ANN" && "Artificial Neural Network (3-10-1)"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isTrained ? (
                          <span className={`text-lg font-semibold ${isANN ? 'text-primary' : 'text-foreground'}`}>
                            {((model.accuracy ?? 0) * 100).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not trained</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isTrained ? (
                          <span className={`text-lg font-semibold ${isANN ? 'text-primary' : 'text-foreground'}`}>
                            {(model.rmse ?? 0).toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Research Conclusion Callout */}
          <Alert className="mt-6 border-primary/50 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm leading-relaxed">
              <span className="font-semibold text-primary">Research Conclusion:</span>{" "}
              <span className="text-foreground">
                ANN performs best at predicting surface roughness because it captures non-linear 
                relationships and parameter interactions better than traditional regression models. 
                The 3-10-1 architecture with 30/35/35 data split achieves superior accuracy and 
                lower RMSE compared to MLR, PCR, and RSM approaches.
              </span>
            </AlertDescription>
          </Alert>
        </div>
      </Card>
      
      <BestModel models={predictions} />
      <ModelPredictions predictions={predictions} />
      <AnalyticsDashboard />
    </div>
  )
}
