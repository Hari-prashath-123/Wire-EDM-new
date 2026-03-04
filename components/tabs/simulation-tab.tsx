"use client"

import type React from "react"

import { useState } from "react"
import { CuttingSimulation } from "@/components/simulation/cutting-simulation"
import IterationHistory from "@/components/simulation/IterationHistory"
import PerplexityAIChat from "@/components/simulation/perplexity-ai-chat"
import AIShapePreview from "@/components/simulation/ai-shape-preview"
import SemVisualizer from "@/components/simulation/sem-visualizer"
import { Button } from "@/components/ui/button"
import { Microscope, Maximize2 } from "lucide-react"
import type { ShapeData, Point2D, EDMParameters, SimulationIteration } from "@/components/simulation/types"

interface SimulationTabProps {
  cuttingMethod: string
  parameters: EDMParameters
  setParameters:
    | React.Dispatch<React.SetStateAction<EDMParameters>>
    | ((params: EDMParameters | ((prev: EDMParameters) => EDMParameters)) => void)
  material: string
  isRunning?: boolean
  onToggleSimulation?: () => void
  onStopSimulation?: () => void
  cuttingSpeed?: number
  onCuttingSpeedChange?: (value: number) => void
}

export default function SimulationTab({
  cuttingMethod,
  parameters,
  setParameters,
  material,
  isRunning,
  onToggleSimulation,
  onStopSimulation,
  cuttingSpeed,
  onCuttingSpeedChange,
}: SimulationTabProps) {
  const [iterations, setIterations] = useState<SimulationIteration[]>([])
  const [previewPoints, setPreviewPoints] = useState<Point2D[] | null>(null)
  const [currentShape, setCurrentShape] = useState<ShapeData | null>(null)
  const [viewMode, setViewMode] = useState<"macro" | "microscopic">("macro")
  const MAX_ITERATIONS = 5

  const handleSaveIteration = (
    iterationData: Omit<SimulationIteration, "id"> & { cutoutPoints: { x: number; y: number }[] },
  ) => {
    if (iterations.length >= MAX_ITERATIONS) return
    const newIteration: SimulationIteration = {
      ...iterationData,
      id: new Date().toISOString() + Math.random(),
      cutoutPoints: iterationData.cutoutPoints,
    }
    setIterations((prev) => [newIteration, ...prev])
  }

  const handleClearIterations = () => setIterations([])

  const handleShapeGenerated = (points: Point2D[]) => {
    const shapeData: ShapeData = {
      type: "coordinates",
      points: points,
    }
    setCurrentShape(shapeData)
    setPreviewPoints(null)
  }

  const handlePreviewShape = (points: Point2D[]) => {
    setPreviewPoints(points)
  }

  return (
    <div className="space-y-6">
      <PerplexityAIChat onShapeGenerated={handleShapeGenerated} onPreviewShape={handlePreviewShape} />

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-3">
        <span className="text-sm font-medium text-muted-foreground">Simulation View:</span>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "macro" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("macro")}
            className="flex items-center gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            Macro View
          </Button>
          <Button
            variant={viewMode === "microscopic" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("microscopic")}
            className="flex items-center gap-2"
          >
            <Microscope className="h-4 w-4" />
            Microscopic SEM View
          </Button>
        </div>
      </div>

      {/* Conditional Rendering Based on View Mode */}
      {viewMode === "macro" ? (
        <>
          <CuttingSimulation
            cuttingMethod={cuttingMethod}
            parameters={parameters}
            setParameters={setParameters}
            material={material}
            materialThickness={parameters.materialThickness}
            isRunning={isRunning}
            onToggleSimulation={onToggleSimulation}
            onStopSimulation={onStopSimulation}
            cuttingSpeed={cuttingSpeed}
            onCuttingSpeedChange={onCuttingSpeedChange}
            onSaveIteration={handleSaveIteration}
          />
          <IterationHistory iterations={iterations} maxIterations={MAX_ITERATIONS} onClear={handleClearIterations} />
        </>
      ) : (
        <SemVisualizer parameters={parameters} />
      )}

      {previewPoints && previewPoints.length > 0 && (
        <AIShapePreview
          points={previewPoints}
          onClose={() => setPreviewPoints(null)}
          onConfirm={handleShapeGenerated}
        />
      )}
    </div>
  )
}
