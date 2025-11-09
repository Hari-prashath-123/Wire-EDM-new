"use client"

import { useState } from "react"
import { Play, Square, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import PathBasedShapeInput from "@/components/simulation/path-based-shape-input"
import MillingShapeInput from "@/components/simulation/milling-shape-input"
import Scene from "./scene"
import type { ShapeData } from './types'

interface CuttingSimulationProps {
  cuttingMethod?: string
}

export default function CuttingSimulation({ cuttingMethod = "wire-edm" }: CuttingSimulationProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [cuttingSpeed, setCuttingSpeed] = useState(50)
  const [shapeData, setShapeData] = useState<ShapeData | null>(null)

  const handleStart = () => setIsRunning(true)
  const handleStop = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setCuttingSpeed(50)
  }

  const handleShapeChange = (data: unknown) => {
    console.log("[v0] Shape data updated:", data)
    setShapeData(data as ShapeData)
  }

  const renderShapeInput = () => {
    switch (cuttingMethod) {
      case "wire-edm":
        return (
          <PathBasedShapeInput
            title="Wire EDM Shape Input"
            acceptedFormats=".dxf, .dwg"
            onShapeChange={handleShapeChange}
          />
        )
      case "water-jet":
        return (
          <PathBasedShapeInput
            title="Water Jet Shape Input"
            acceptedFormats=".dxf, .svg"
            onShapeChange={handleShapeChange}
          />
        )
      case "laser-cutting":
        return (
          <PathBasedShapeInput
            title="Laser Cutting Shape Input"
            acceptedFormats=".dxf, .svg, .ai"
            onShapeChange={handleShapeChange}
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
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-2xl font-bold mb-6">Cutting Simulation</h2>

        {/* Control Buttons */}
        <div className="flex gap-3 mb-8">
          <Button
            onClick={handleStart}
            disabled={isRunning}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Start
          </Button>
          <Button
            onClick={handleStop}
            disabled={!isRunning}
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
        <div className="mb-8 max-w-xs">
          <div className="flex justify-between items-center mb-3">
            <Label className="text-base font-semibold">Cutting Speed Control</Label>
            <span className="text-sm font-medium text-accent">{cuttingSpeed}%</span>
          </div>
          <Slider
            value={[cuttingSpeed]}
            onValueChange={(value) => setCuttingSpeed(value[0])}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* 3D Canvas Container - THIS IS THE UPDATED PART */}
        <div className="mt-8 pt-8 border-t border-border">
          <div
            className="bg-black rounded-lg border border-border"
            style={{ width: "800px", height: "400px", maxWidth: "100%" }}
          >
            {/* The placeholder div is replaced with the Scene component */}
            <Scene
              shapeData={shapeData}
              isRunning={isRunning}
              cuttingSpeed={cuttingSpeed}
            />
          </div>
        </div>
      </Card>

      {/* The Shape Input component is now rendered *below* the simulation */}
      {renderShapeInput()}
    </div>
  )
}
