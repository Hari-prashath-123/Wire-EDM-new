"use client"
import { CuttingSimulation } from "@/components/simulation/cutting-simulation"


interface SimulationTabProps {
  cuttingMethod: string
  parameters: { speed: number; power: number; precision: number }
  setParameters: (params: { speed: number; power: number; precision: number }) => void
  material: string
}

export default function SimulationTab({ cuttingMethod, parameters, setParameters, material }: SimulationTabProps) {
  return (
    <div className="space-y-6">
      <CuttingSimulation
        cuttingMethod={cuttingMethod}
        parameters={parameters}
        setParameters={setParameters}
        material={material}
      />
    </div>
  )
}
