"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { generateL9Array, calculateSNRatio, calculateANOVA } from "@/lib/statistics"
import type { EDMParameters } from "@/components/simulation/types"

interface StatisticsTabProps {
  parameters: EDMParameters
}

export default function StatisticsTab({ parameters }: StatisticsTabProps) {
  const experimentData = useMemo(() => {
    // Use current parameters as Level 2 (medium)
    const tonLevels = [parameters.pulseOnTime * 0.8, parameters.pulseOnTime, parameters.pulseOnTime * 1.2]
    const toffLevels = [parameters.pulseOffTime * 0.8, parameters.pulseOffTime, parameters.pulseOffTime * 1.2]
    const ipLevels = [parameters.current * 0.8, parameters.current, parameters.current * 1.2]

    // Generate L9 array
    const l9Array = generateL9Array(tonLevels, toffLevels, ipLevels)

    // Mock surface roughness calculation for each experiment
    const results = l9Array.experiments.map((exp) => {
      // Simple mock formula: Ra depends on Ton, Toff, and Ip
      const ra =
        2.5 +
        (exp.ton / 100) * 0.8 -
        (exp.toff / 150) * 0.3 +
        (exp.ip / 30) * 0.5 +
        Math.random() * 0.3
      const snRatio = calculateSNRatio([ra])
      return {
        experimentNumber: exp.experimentNumber,
        ton: exp.ton,
        toff: exp.toff,
        ip: exp.ip,
        surfaceRoughness: parseFloat(ra.toFixed(3)),
        snRatio: parseFloat(snRatio.toFixed(2)),
      }
    })

    return results
  }, [parameters])

  const anovaData = useMemo(() => {
    const anovaResults = calculateANOVA(experimentData)
    
    return anovaResults.factors.map((factor) => ({
      name: factor.factor === 'ton' ? 'Pulse On Time (Ton)' : 
            factor.factor === 'toff' ? 'Pulse Off Time (Toff)' : 
            'Current (Ip)',
      value: parseFloat(factor.percentageContribution.toFixed(2)),
      fValue: factor.fValue ? parseFloat(factor.fValue.toFixed(2)) : 0,
    }))
  }, [experimentData])

  const COLORS = ["#6366f1", "#ec4899", "#10b981"]

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Taguchi L9 Orthogonal Array Experiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Run</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Ton (µs)</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Toff (µs)</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Ip (A)</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">Ra (µm)</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">S/N Ratio (dB)</th>
                </tr>
              </thead>
              <tbody>
                {experimentData.map((exp) => (
                  <tr key={exp.experimentNumber} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                    <td className="py-3 px-4 text-sm">{exp.experimentNumber}</td>
                    <td className="py-3 px-4 text-sm">{exp.ton.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm">{exp.toff.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm">{exp.ip.toFixed(1)}</td>
                    <td className="text-right py-3 px-4 text-sm font-mono">{exp.surfaceRoughness}</td>
                    <td className="text-right py-3 px-4 text-sm font-mono">{exp.snRatio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>ANOVA Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {anovaData.map((factor, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{factor.name}</span>
                    <span className="text-sm text-muted-foreground">F-Value: {factor.fValue}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${factor.value}%`,
                          backgroundColor: COLORS[idx],
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{factor.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Contribution to Surface Roughness</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={anovaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name.split(" ")[0]}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {anovaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(value: number) => [`${value}%`, "Contribution"]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The Taguchi L9 orthogonal array experiment evaluates the effect of three factors (Pulse On Time, Pulse
              Off Time, and Current) on surface roughness (Ra).
            </p>
            <p>
              The Signal-to-Noise (S/N) ratio is calculated as -10 × log₁₀(MSD), where MSD is the mean squared
              deviation. Higher S/N ratios indicate better performance (lower surface roughness).
            </p>
            <p>
              ANOVA (Analysis of Variance) determines the statistical significance and percentage contribution of each
              factor to the overall variation in surface roughness.
            </p>
            <p className="text-foreground font-medium">
              Most Influential Factor:{" "}
              <span className="text-cyan-400">
                {anovaData.reduce((max, curr) => (curr.value > max.value ? curr : max)).name}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
