"use client"

import { useState } from "react"
import { CuttingSimulation } from "@/components/simulation/cutting-simulation"
import IterationHistory from "@/components/simulation/IterationHistory"
import CutoutShape from "@/components/simulation/CutoutShape"
import type { EDMParameters, SimulationIteration } from "@/components/simulation/types"

interface SimulationTabProps {
  cuttingMethod: string
  parameters: EDMParameters
  setParameters: React.Dispatch<React.SetStateAction<EDMParameters>> | ((params: EDMParameters | ((prev: EDMParameters) => EDMParameters)) => void)
  material: string
  isRunning?: boolean
  onToggleSimulation?: () => void
  onStopSimulation?: () => void
  cuttingSpeed?: number
  onCuttingSpeedChange?: (value: number) => void
}

export default function SimulationTab({ cuttingMethod, parameters, setParameters, material, isRunning, onToggleSimulation, onStopSimulation, cuttingSpeed, onCuttingSpeedChange }: SimulationTabProps) {
  const [iterations, setIterations] = useState<SimulationIteration[]>([]);
  const MAX_ITERATIONS = 5;

  const handleSaveIteration = (iterationData: Omit<SimulationIteration, 'id'> & { cutoutPoints: { x: number; y: number }[] }) => {
    if (iterations.length >= MAX_ITERATIONS) return;
    const newIteration: SimulationIteration = {
      ...iterationData,
      id: new Date().toISOString() + Math.random(),
      cutoutPoints: iterationData.cutoutPoints,
    };
    setIterations(prev => [newIteration, ...prev]);
  };

  const handleClearIterations = () => setIterations([]);

  return (
    <div className="space-y-6">
      <CuttingSimulation
        cuttingMethod={cuttingMethod}
        parameters={parameters}
        setParameters={setParameters}
        material={material}
        isRunning={isRunning}
        onToggleSimulation={onToggleSimulation}
        onStopSimulation={onStopSimulation}
        cuttingSpeed={cuttingSpeed}
        onCuttingSpeedChange={onCuttingSpeedChange}
        onSaveIteration={handleSaveIteration}
      />
      <IterationHistory
        iterations={iterations}
        maxIterations={MAX_ITERATIONS}
        onClear={handleClearIterations}
      />
    </div>
  )
}
