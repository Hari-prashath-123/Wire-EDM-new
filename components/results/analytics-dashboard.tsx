"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsDashboard() {
  // Sample data for charts
  const chartData = [
    { time: "0s", mrr: 80, power: 45, quality: 92, efficiency: 88 },
    { time: "2s", mrr: 82, power: 48, quality: 91, efficiency: 87 },
    { time: "4s", mrr: 83, power: 50, quality: 89, efficiency: 86 },
    { time: "6s", mrr: 85, power: 52, quality: 90, efficiency: 88 },
    { time: "8s", mrr: 84, power: 51, quality: 92, efficiency: 89 },
    { time: "10s", mrr: 86, power: 53, quality: 93, efficiency: 90 },
  ]

  const charts = [
    { title: "Material Removal Rate", dataKey: "mrr", unit: "mm³/min", color: "#6366f1" },
    { title: "Power Consumption", dataKey: "power", unit: "kW", color: "#ec4899" },
    { title: "Surface Quality", dataKey: "quality", unit: "%", color: "#10b981" },
    { title: "Process Efficiency", dataKey: "efficiency", unit: "%", color: "#f59e0b" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <Card key={chart.title} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">{chart.title}</CardTitle>
              <CardDescription className="text-xs">{chart.unit}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={chart.dataKey}
                    stroke={chart.color}
                    strokeWidth={2}
                    dot={{ fill: chart.color, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
