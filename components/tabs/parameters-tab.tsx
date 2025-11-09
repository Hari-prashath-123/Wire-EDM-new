"use client"

import { Card, CardContent } from "@/components/ui/card"
import CuttingMethodSelector from "@/components/parameters/cutting-method-selector"
import MaterialSelector from "@/components/parameters/material-selector"
import ParameterPanel from "@/components/parameters/parameter-panel"
import ProcessOverview from "@/components/parameters/process-overview"
import { CuttingMethod, Parameters } from "@/components/simulation/types"

interface Props {
  cuttingMethod: CuttingMethod
  setCuttingMethod: (method: CuttingMethod) => void
  parameters: Parameters
  setParameters: (parameters: Parameters) => void
  material: string
  setMaterial: (material: string) => void
}

export default function ParametersTab({
  cuttingMethod,
  setCuttingMethod,
  parameters,
  setParameters,
  material,
  setMaterial,
}: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CuttingMethodSelector
              selectedMethod={cuttingMethod}
              onSelectMethod={(method) => setCuttingMethod(method as CuttingMethod)}
            />
            <MaterialSelector
              selectedMethod={cuttingMethod}
              selectedMaterial={material}
              onSelectMaterial={setMaterial}
            />
          </div>
          <div>
            <ParameterPanel
              parameters={parameters}
              onParameterChange={setParameters}
            />
            <ProcessOverview parameters={parameters} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
