"use client"


import { Card, CardContent } from "@/components/ui/card"
import { CuttingMethod } from "@/components/simulation/types"
import CuttingMethodSelector from "@/components/parameters/cutting-method-selector"
import MaterialSelector from "@/components/parameters/material-selector"
import ParameterPanel from "@/components/parameters/parameter-panel"
import ProcessOverview from "@/components/parameters/process-overview"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

// Import EDMParameters from page (could be refactored to a shared types file later)
import type { EDMParameters, ProcessMetrics } from "@/components/simulation/types"



interface ParametersTabProps {
  selectedMethod: CuttingMethod
  onCuttingMethodChange: (method: CuttingMethod) => void
  parameters: EDMParameters
  setParameters: (params: EDMParameters) => void
  onParameterChange?: (key: keyof EDMParameters, value: any) => void
  processMetrics?: ProcessMetrics
  selectedMaterial: string
  setSelectedMaterial: (material: string) => void
  onNext: () => void
}

export default function ParametersTab({
  selectedMethod,
  onCuttingMethodChange,
  parameters,
  setParameters,
  onParameterChange,
  processMetrics,
  selectedMaterial,
  setSelectedMaterial,
  onNext,
}: ParametersTabProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CuttingMethodSelector
              selectedMethod={selectedMethod}
              onSelectMethod={onCuttingMethodChange}
            />
            <MaterialSelector
              selectedMethod={selectedMethod}
              selectedMaterial={selectedMaterial}
              onSelectMaterial={setSelectedMaterial}
            />
            <ParameterPanel
              parameters={parameters}
              onParameterChange={(key, value) => {
                if (onParameterChange) {
                  onParameterChange(key, value)
                } else {
                  setParameters({ ...parameters, [key]: value } as EDMParameters)
                }
              }}
            />
            <Button onClick={onNext} className="w-full h-12 text-lg font-semibold mt-6">
              Next to Simulation <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <div>
            <ProcessOverview parameters={parameters} processMetrics={processMetrics} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
