import { Card } from "@/components/ui/card"
import type { EDMParameters, ProcessMetrics } from "@/components/simulation/types"

interface Props {
  parameters: EDMParameters
  processMetrics?: ProcessMetrics
}

export default function ProcessOverview({ parameters, processMetrics }: Props) {
  // Prefer provided metrics from parent; fallback to a consistent estimation from parameters
  let metrics: { label: string; value: string; unit: string }[] = [];
  if (processMetrics) {
    metrics = [
      { label: "Discharge Energy", value: processMetrics.dischargeEnergy.toFixed(2), unit: "J" },
      { label: "Duty Cycle", value: processMetrics.dutyCycle.toFixed(1), unit: "%" },
      { label: "Power Consumption", value: processMetrics.powerConsumption.toFixed(2), unit: "kW" },
      { label: "Material Removal Rate", value: processMetrics.materialRemovalRate.toFixed(2), unit: "mm³/min" },
      { label: "Surface Roughness", value: processMetrics.surfaceRoughness.toFixed(2), unit: "µm" },
      { label: "Wire Wear Rate", value: processMetrics.wireWearRate.toFixed(2), unit: "%" },
      { label: "Process Efficiency", value: processMetrics.efficiency.toFixed(1), unit: "%" },
      { label: "Estimated Cost/Hour", value: processMetrics.estimatedCostPerHour.toFixed(2), unit: "$" },
    ];
    // Remove duplicates by label and value
    metrics = metrics.filter((item, idx, arr) =>
      arr.findIndex(m => m.label === item.label && m.value === item.value) === idx
    );
  }

  return (
    <Card className="p-6 bg-card border-border sticky top-8">
      <h2 className="text-xl font-semibold mb-6">Process Overview</h2>
      <div className="space-y-4">
        {metrics.length > 0 ? (
          metrics.map(({ label, value, unit }) => (
            <div
              key={label}
              className="flex justify-between items-center pb-3 border-b border-border/50 last:border-0 last:pb-0"
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-semibold text-foreground">
                {value} <span className="text-xs text-muted-foreground">{unit}</span>
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">Simulation not started. Metrics will appear here.</div>
        )}
      </div>
    </Card>
  )
}
