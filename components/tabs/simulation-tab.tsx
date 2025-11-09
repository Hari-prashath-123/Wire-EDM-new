"use client"
import { CuttingSimulation } from "@/components/simulation/cutting-simulation"
import type { EDMParameters } from "@/components/simulation/types"

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
      />
    </div>
  )
}
