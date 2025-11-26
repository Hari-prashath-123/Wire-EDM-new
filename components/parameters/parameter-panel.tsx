"use client"

// Use a client-only slider to avoid hydration attribute mismatches (data-has-listeners, etc.)
import dynamic from "next/dynamic"
const Slider = dynamic(() => import("@/components/ui/slider").then((m) => m.Slider), { ssr: false })
import { Card } from "@/components/ui/card"
import type { EDMParameters } from "@/components/simulation/types"

interface Props {
  parameters: EDMParameters
  onParameterChange: (key: keyof EDMParameters, value: number) => void
}

const SLIDER_CONFIG: Array<{
  key: keyof EDMParameters
  label: string
  unit: string
  min: number
  max: number
  step?: number
}> = [
  {
    key: "voltage",
    label: "Voltage",
    unit: "V",
    min: 80,
    max: 300,
    step: 1,
  },
  {
    key: "current",
    label: "Current",
    unit: "A",
    min: 1,
    max: 50,
    step: 1,
  },
  {
    key: "pulseOnTime",
    label: "Pulse On Time",
    unit: "µs",
    min: 5,
    max: 200,
    step: 1,
  },
  {
    key: "pulseOffTime",
    label: "Pulse Off Time",
    unit: "µs",
    min: 5,
    max: 200,
    step: 1,
  },
  {
    key: "wireSpeed",
    label: "Wire Speed",
    unit: "mm/min",
    min: 50,
    max: 400,
    step: 5,
  },
  {
    key: "dielectricFlow",
    label: "Dielectric Flow",
    unit: "L/min",
    min: 5,
    max: 30,
    step: 0.5,
  },
  {
    key: "wireOffset",
    label: "Wire Offset",
    unit: "mm",
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    key: "sparkGap",
    label: "Spark Gap",
    unit: "mm",
    min: 0.01,
    max: 0.2,
    step: 0.01,
  },
  {
    key: "materialThickness" as keyof EDMParameters,
    label: "Material Thickness",
    unit: "mm",
    min: 1,
    max: 100,
    step: 1,
  },
]

export default function ParameterPanel({ parameters, onParameterChange }: Props) {
  const handleSliderChange = (key: keyof EDMParameters, value: number[]) => {
    onParameterChange(key, value[0])
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-semibold mb-6">Parameters</h2>
      <div className="space-y-6">
        {SLIDER_CONFIG.map(({ key, label, unit, min, max, step }) => (
          <div key={String(key)} className="space-y-2" suppressHydrationWarning>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{label}</label>
              <span className="text-sm text-muted-foreground">
                {String(parameters[key])} {unit}
              </span>
            </div>
            {/* Client-only slider */}
            <Slider
              value={[Number(parameters[key] as unknown as number)]}
              onValueChange={(value: number[]) => handleSliderChange(key, value)}
              min={min}
              max={max}
              step={step ?? 1}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </Card>
  )
}
