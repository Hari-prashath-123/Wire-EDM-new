"use client"

export default function EnsemblePrediction() {
  const metrics = [
    { label: "Material Removal Rate", value: "85.3", unit: "mm³/min" },
    { label: "Surface Roughness", value: "0.42", unit: "μm" },
    { label: "Dimensional Accuracy", value: "0.15", unit: "mm" },
    { label: "Processing Time", value: "12.5", unit: "min" },
  ]

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Ensemble Prediction</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-background rounded-lg p-4 border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-accent">{metric.value}</span>
              <span className="text-xs text-muted-foreground">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
