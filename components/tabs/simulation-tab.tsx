"use client"
import CuttingSimulation from "@/components/simulation/cutting-simulation"

interface SimulationTabProps {
  cuttingMethod?: string
}

export default function SimulationTab({ cuttingMethod = "wire-edm" }: SimulationTabProps) {
  return (
    <div className="space-y-6">
      <CuttingSimulation cuttingMethod={cuttingMethod} />
    </div>
  )
}
