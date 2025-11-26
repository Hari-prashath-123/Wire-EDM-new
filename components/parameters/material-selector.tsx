"use client"

import { Card } from "@/components/ui/card"

interface MaterialSelectorProps {
  selectedMethod: string
  selectedMaterial: string
  onSelectMaterial: (material: string) => void
}

const MATERIALS_BY_METHOD: Record<string, string[]> = {
  "wire-edm": ["Steel", "Stainless Steel", "Titanium", "Aluminum", "Copper", "Carbide", "Nickel"],
  "water-jet": ["Steel", "Stainless Steel", "Aluminum", "Titanium", "Glass", "Stone", "Composites", "Nickel"],
  "laser-cutting": ["Steel", "Stainless Steel", "Aluminum", "Copper", "Plastics", "Wood", "Nickel"],
  "cnc-milling": ["Steel", "Stainless Steel", "Aluminum", "Titanium", "Plastics", "Composites", "Nickel"],
}

export default function MaterialSelector({
  selectedMethod,
  selectedMaterial,
  onSelectMaterial,
}: MaterialSelectorProps) {
  const availableMaterials = MATERIALS_BY_METHOD[selectedMethod] || []

  return (
    <Card className="p-6 bg-card border-border mt-6">
      <h2 className="text-xl font-semibold mb-4">Material Type</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {availableMaterials.map((material) => (
          <button
            key={material}
            onClick={() => onSelectMaterial(material)}
            className={`p-3 rounded-lg border transition-all duration-200 text-sm font-medium ${
              selectedMaterial === material
                ? "border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/50 text-cyan-400"
                : "border-border hover:border-muted-foreground hover:bg-muted/50 text-foreground"
            }`}
          >
            {material}
          </button>
        ))}
      </div>
    </Card>
  )
}
