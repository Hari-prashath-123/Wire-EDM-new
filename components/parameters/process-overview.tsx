import { Card } from "@/components/ui/card"

interface Parameters {
  speed: number
  power: number
  precision: number
}

interface Props {
  parameters: Parameters
}

export default function ProcessOverview({ parameters }: Props) {
  // Calculate derived values based on parameters
  const cuttingEnergy = ((parameters.power * parameters.speed) / 100).toFixed(2)
  const materialRemovalRate = (parameters.speed * 0.85).toFixed(2)
  const surfaceRoughness = (100 - parameters.precision).toFixed(2)
  const powerConsumption = parameters.power

  const metrics = [
    { label: "Cutting Energy", value: cuttingEnergy, unit: "J/mm" },
    { label: "Cutting Speed", value: parameters.speed, unit: "mm/min" },
    { label: "Power Consumption", value: powerConsumption, unit: "W" },
    { label: "Material Removal Rate", value: materialRemovalRate, unit: "mm³/min" },
    { label: "Surface Roughness", value: surfaceRoughness, unit: "Ra (µm)" },
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
