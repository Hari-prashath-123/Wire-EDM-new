import { Card } from "@/components/ui/card"
import type { EDMParameters, ProcessMetrics } from "@/components/simulation/types"

interface Props {
  parameters: EDMParameters
  processMetrics?: ProcessMetrics
}

export default function ProcessOverview({ parameters, processMetrics }: Props) {
  // Prefer provided metrics from parent; fallback to a consistent estimation from parameters
  const pm: ProcessMetrics = processMetrics ?? (() => {
    const dischargeEnergy = (parameters.voltage * parameters.current * parameters.pulseOnTime) / 1000
    const dutyCycle = (parameters.pulseOnTime / (parameters.pulseOnTime + parameters.pulseOffTime)) * 100
    const powerConsumption = (parameters.voltage * parameters.current) / 1000
    const estimatedCostPerHour = powerConsumption * 0.12 + 15 + (parameters.wireSpeed * 0.02)
    const materialRemovalRate = (dischargeEnergy * dutyCycle * parameters.current) / 100
    const surfaceRoughness = Math.max(0.1, 5 - (parameters.voltage / 100) + (parameters.pulseOnTime / 20))
    const wireWearRate = (parameters.current * parameters.voltage) / (parameters.wireSpeed * 100)
    const efficiency = Math.min(100, (dutyCycle * parameters.dielectricFlow * parameters.wireSpeed) / 1000)
    return { dischargeEnergy, dutyCycle, powerConsumption, estimatedCostPerHour, materialRemovalRate, surfaceRoughness, wireWearRate, efficiency }
  })()

  const metrics = [
    { label: "Discharge Energy", value: pm.dischargeEnergy.toFixed(2), unit: "J" },
    { label: "Duty Cycle", value: pm.dutyCycle.toFixed(1), unit: "%" },
    { label: "Power Consumption", value: pm.powerConsumption.toFixed(2), unit: "kW" },
    { label: "Material Removal Rate", value: pm.materialRemovalRate.toFixed(2), unit: "mm³/min" },
    { label: "Surface Roughness", value: pm.surfaceRoughness.toFixed(2), unit: "µm" },
    { label: "Wire Wear Rate", value: pm.wireWearRate.toFixed(2), unit: "%" },
    { label: "Process Efficiency", value: pm.efficiency.toFixed(1), unit: "%" },
    { label: "Estimated Cost/Hour", value: pm.estimatedCostPerHour.toFixed(2), unit: "$" },
  ]

  return (
    <Card className="p-6 bg-card border-border sticky top-8">
      <h2 className="text-xl font-semibold mb-6">Process Overview</h2>
      <div className="space-y-4">
        {metrics.map(({ label, value, unit }) => (
          <div
            key={label}
            className="flex justify-between items-center pb-3 border-b border-border/50 last:border-0 last:pb-0"
          >
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground">
              {value} <span className="text-xs text-muted-foreground">{unit}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
