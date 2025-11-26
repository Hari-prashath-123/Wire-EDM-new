  // Ensure onSaveIteration is available in this scope
"use client"

import { useMemo, useState } from "react"
import { Play, Square, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import dynamic from "next/dynamic"
const Slider = dynamic(() => import("@/components/ui/slider").then(m => m.Slider), { ssr: false })
import { Label } from "@/components/ui/label"
import PathBasedShapeInput from "@/components/simulation/path-based-shape-input"
import MillingShapeInput from "@/components/simulation/milling-shape-input"
import Scene from "./scene"
import type { ShapeData } from './types'
import type { EDMParameters } from "@/components/simulation/types"
import { ShapeLibraryPanel } from "@/components/simulation/ShapeLibraryPanel"
import ModelComparison from "@/components/ai-models/model-comparison"
import EnsemblePrediction from "@/components/results/ensemble-prediction"

interface CuttingSimulationProps {
  cuttingMethod?: string;
  parameters: EDMParameters;
  setParameters: React.Dispatch<React.SetStateAction<EDMParameters>> | ((params: EDMParameters | ((prev: EDMParameters) => EDMParameters)) => void);
  material: string;
  materialThickness?: number;
  isRunning?: boolean;
  onToggleSimulation?: () => void;
  onStopSimulation?: () => void;
  cuttingSpeed?: number;
  onCuttingSpeedChange?: (value: number) => void;
  onSaveIteration?: (iterationData: { parameters: EDMParameters; material: string; shapeName: string; cutoutPoints: { x: number; y: number }[]; points: { x: number; y: number }[] }) => void;
}

export function CuttingSimulation({ cuttingMethod = "wire-edm", parameters, setParameters, material, materialThickness = 10, isRunning, onToggleSimulation, onStopSimulation, cuttingSpeed, onCuttingSpeedChange, onSaveIteration }: CuttingSimulationProps) {
  // Helper to extract shape info
  const getShapeInfo = (shape: ShapeData | null) => {
    if (!shape) return { name: '', points: [] };
    if ('points' in shape && Array.isArray(shape.points)) {
      return { name: 'name' in shape && typeof shape.name === 'string' ? shape.name : '', points: shape.points };
    }
    return { name: '', points: [] };
  };
  const [localIsRunning, setLocalIsRunning] = useState(false)
  const [shapeData, setShapeData] = useState<ShapeData | null>(null)
  const [selectedShapeId, setSelectedShapeId] = useState<string | undefined>(undefined)

  const running = isRunning ?? localIsRunning

  const handleStart = () => {
    if (onToggleSimulation) onToggleSimulation()
    else setLocalIsRunning(true)
  }
  const handleStop = () => {
    if (onStopSimulation) onStopSimulation()
    else setLocalIsRunning(false)
  }
  const handleReset = () => {
    if (onStopSimulation) onStopSimulation()
    else setLocalIsRunning(false)
    ;(setParameters as React.Dispatch<React.SetStateAction<EDMParameters>>)((prev) => ({ ...prev, wireSpeed: 250 }))
  }

  const handleShapeChange = (data: unknown) => {
    setSelectedShapeId(undefined)
    setShapeData(data as ShapeData)
    // Stop any running simulation when shape changes
    if (running) {
      if (onStopSimulation) onStopSimulation()
      else setLocalIsRunning(false)
    }
  }

  const handlePresetShape = (shape: { type: string; name: string; points: any[] }) => {
    setShapeData({ type: 'preset', name: shape.name, points: shape.points })
    // Stop any running simulation when shape changes
    if (running) {
      if (onStopSimulation) onStopSimulation()
      else setLocalIsRunning(false)
    }
  }

  const getShapeName = (shape: ShapeData | null): string => {
    if (!shape) return "No Shape";
    if (shape.type === 'preset') return shape.name;
    if (shape.type === 'drawn') return `Drawn (${shape.points.length} pts)`;
    if (shape.type === 'file') return shape.name || "Uploaded File";
    if (shape.type === 'coordinates') return `Path (${shape.points.length} pts)`;
    return "Custom Shape";
  };

  const renderShapeInput = () => {
    switch (cuttingMethod) {
      case "wire-edm":
        return (
          <PathBasedShapeInput
            title="Wire EDM Shape Input"
            acceptedFormats=".dxf, .dwg"
            onShapeChange={handleShapeChange}
            onStartSimulation={handleStart}
          />
        )
      case "water-jet":
        return (
          <PathBasedShapeInput
            title="Water Jet Shape Input"
            acceptedFormats=".dxf, .svg"
            onShapeChange={handleShapeChange}
            onStartSimulation={handleStart}
          />
        )
      case "laser-cutting":
        return (
          <PathBasedShapeInput
            title="Laser Cutting Shape Input"
            acceptedFormats=".dxf, .svg, .ai"
            onShapeChange={handleShapeChange}
            onStartSimulation={handleStart}
          />
        )
      case "cnc-milling":
        return <MillingShapeInput onShapeChange={handleShapeChange} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="p-6 bg-card border border-border flex-1">
          <h2 className="text-2xl font-bold mb-6">Cutting Simulation</h2>
          {/* 3D Canvas Container - moved to top */}
          <div className="mb-8">
            <div
              className="bg-black rounded-lg border border-border"
              style={{ width: "800px", height: "400px", maxWidth: "100%" }}
            >
                <Scene
                  shapeData={shapeData}
                  isRunning={running}
                  cuttingSpeed={(cuttingSpeed ?? parameters.wireSpeed ?? 0)}
                  cuttingMethod={cuttingMethod}
                  parameters={parameters}
                  material={material}
                  materialThickness={materialThickness}
                  onLoop={() => {
                    if (onSaveIteration) {
                      const shapeInfo = getShapeInfo(shapeData);
                      onSaveIteration({
                        parameters,
                        material,
                        shapeName: shapeInfo.name,
                        cutoutPoints: shapeInfo.points,
                        points: shapeInfo.points,
                      });
                    }
                  }}
                />
            </div>
          </div>
          {/* Control Buttons */}
          <div className="flex gap-3 mb-8">
            <Button
              onClick={handleStart}
              disabled={running}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
            <Button
              onClick={handleStop}
              disabled={!running}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex items-center gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
          {/* Cutting Speed Control */}
          <div className="mb-8 max-w-xs" suppressHydrationWarning>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-base font-semibold">Cutting Speed Control</Label>
              <span className="text-sm font-medium text-accent">{(cuttingSpeed ?? parameters.wireSpeed)} mm/min</span>
            </div>
            <Slider
              value={[cuttingSpeed ?? parameters.wireSpeed ?? 0]}
              onValueChange={(value) => {
                if (onCuttingSpeedChange) onCuttingSpeedChange(value[0])
                ;(setParameters as React.Dispatch<React.SetStateAction<EDMParameters>>)((prev) => ({ ...prev, wireSpeed: value[0] }))
              }}
              min={50}
              max={400}
              step={5}
              className="w-full"
            />
          </div>
        </Card>
        <div className="flex flex-col gap-6 lg:w-[400px]">
          {/* Prediction Section on the right */}
          <ModelComparison />
          <EnsemblePrediction
            processMetrics={{
              dischargeEnergy: 0,
              dutyCycle: 0,
              powerConsumption: 0,
              estimatedCostPerHour: 0,
              materialRemovalRate: 0,
              surfaceRoughness: 0,
              wireWearRate: 0,
              efficiency: 0,
            }}
            parameters={parameters}
          />
        </div>
      </div>
      {/* Shape Library Panel */}
      <ShapeLibraryPanel onShapeChange={handleShapeChange} />
      {/* The Shape Input component is now rendered *below* the simulation */}
      {renderShapeInput()}
    </div>
  )
}
