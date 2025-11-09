"use client"

export default function ModelPredictions() {
  const models = ["SVM", "ANN", "ELM", "GA"]
  const metrics = [
    { name: "Material Removal Rate (mm³/min)", svm: 82.1, ann: 85.3, elm: 83.7, ga: 84.2 },
    { name: "Surface Roughness (μm)", svm: 0.48, ann: 0.42, elm: 0.45, ga: 0.43 },
    { name: "Dimensional Accuracy (mm)", svm: 0.18, ann: 0.15, elm: 0.17, ga: 0.16 },
    { name: "Processing Time (min)", svm: 13.2, ann: 12.5, elm: 12.8, ga: 12.6 },
  ]

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">AI Model Predictions</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-sm">Metric</th>
              {models.map((model) => (
                <th key={model} className="text-right py-3 px-4 font-semibold text-sm text-accent">
                  {model}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.name} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                <td className="py-3 px-4 text-sm">{metric.name}</td>
                <td className="text-right py-3 px-4 text-sm">{metric.svm}</td>
                <td className="text-right py-3 px-4 text-sm text-accent font-semibold">{metric.ann}</td>
                <td className="text-right py-3 px-4 text-sm">{metric.elm}</td>
                <td className="text-right py-3 px-4 text-sm">{metric.ga}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
