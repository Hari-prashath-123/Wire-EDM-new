"use client"


import { Card, CardContent } from "@/components/ui/card"
import { CuttingMethod } from "@/components/simulation/types"
import CuttingMethodSelector from "@/components/parameters/cutting-method-selector"
import MaterialSelector from "@/components/parameters/material-selector"
import ParameterPanel from "@/components/parameters/parameter-panel"
import ProcessOverview from "@/components/parameters/process-overview"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"



interface ParametersTabProps {
  selectedMethod: string;
  onCuttingMethodChange: (method: CuttingMethod) => void;
  parameters: { speed: number, power: number, precision: number };
  setParameters: (params: any) => void;
  selectedMaterial: string;
  setSelectedMaterial: (material: string) => void;
  onNext: () => void;
}

export default function ParametersTab({
  selectedMethod,
  onCuttingMethodChange,
  parameters,
  setParameters,
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
              onParameterChange={setParameters}
            />
            <Button onClick={onNext} className="w-full h-12 text-lg font-semibold mt-6">
              Next to Simulation <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <div>
            <ProcessOverview parameters={parameters} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
