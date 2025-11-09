"use client"

import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"

interface Parameters {
  speed: number
  power: number
  precision: number
}

interface Props {
  parameters: Parameters
  onParameterChange: (params: Parameters) => void
}

const SLIDER_CONFIG = [
  {
    key: "speed" as const,
    label: "Cutting Speed",
    unit: "mm/min",
    min: 0,
    max: 100,
  },
  {
    key: "power" as const,
    label: "Power Output",
    unit: "W",
    min: 0,
    max: 100,
  },
  {
    key: "precision" as const,
    label: "Precision Level",
    unit: "µm",
    min: 0,
    max: 100,
  },
]

export default function ParameterPanel({ parameters, onParameterChange }: Props) {
  const handleSliderChange = (key: keyof Parameters, value: number[]) => {
    onParameterChange({
      ...parameters,
      [key]: value[0],
    })
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-semibold mb-6">Parameters</h2>
      <div className="space-y-6">
        {SLIDER_CONFIG.map(({ key, label, unit, min, max }) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{label}</label>
              <span className="text-sm text-muted-foreground">
                {parameters[key]} {unit}
              </span>
            </div>
            <Slider
              value={[parameters[key]]}
              onValueChange={(value) => handleSliderChange(key, value)}
              min={min}
              max={max}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </Card>
  )
}
