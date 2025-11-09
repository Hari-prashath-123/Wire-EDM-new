"use client"

import { Card } from "@/components/ui/card"

interface CuttingMethod {
  id: string
  name: string
  description: string
}

const CUTTING_METHODS: CuttingMethod[] = [
  {
    id: "wire-edm",
    name: "Wire EDM",
    description: "Electrical Discharge Machining",
  },
  {
    id: "water-jet",
    name: "Water Jet",
    description: "High-pressure water cutting",
  },
  {
    id: "laser-cutting",
    name: "Laser Cutting",
    description: "Precision laser technology",
  },
  {
    id: "cnc-milling",
    name: "CNC Milling",
    description: "Computer numerical control",
  },
]

interface Props {
  selectedMethod: string
  onSelectMethod: (methodId: string) => void
}

export default function CuttingMethodSelector({ selectedMethod, onSelectMethod }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Cutting Method</h2>
      <div className="grid grid-cols-2 gap-4">
        {CUTTING_METHODS.map((method) => (
          <Card
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            className={`p-4 cursor-pointer transition-all duration-200 ${
              selectedMethod === method.id
                ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50"
                : "border-border hover:border-muted-foreground hover:bg-muted/50"
            }`}
          >
            <h3 className="font-semibold text-sm mb-1">{method.name}</h3>
            <p className="text-xs text-muted-foreground">{method.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
