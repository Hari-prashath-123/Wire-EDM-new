"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MillingShapeInputProps {
  onShapeChange: (shapeData: unknown) => void
}

export default function MillingShapeInput({ onShapeChange }: MillingShapeInputProps) {
  const [coordinates, setCoordinates] = useState<Array<{ x: number; y: number; z: number }>>([])
  const [newCoord, setNewCoord] = useState({ x: 0, y: 0, z: 0 })

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("[v0] 3D model file uploaded:", file.name)
      onShapeChange({ type: "file", name: file.name, format: file.name.split(".").pop() })
    }
  }

  const handleDownloadSample = () => {
    console.log("[v0] Downloading sample 3D file")
    onShapeChange({ type: "sample", format: ".step" })
  }

  const handleAddCoordinate = () => {
    const updated = [...coordinates, { ...newCoord }]
    setCoordinates(updated)
    onShapeChange({ type: "coordinates", data: updated })
    setNewCoord({ x: 0, y: 0, z: 0 })
  }

  const handleRemoveCoordinate = (index: number) => {
    const updated = coordinates.filter((_, i) => i !== index)
    setCoordinates(updated)
    onShapeChange({ type: "coordinates", data: updated })
  }

  return (
    <Card className="p-6 bg-card border border-border">
      <h3 className="text-xl font-bold mb-6">CNC Milling Shape Input</h3>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload">Upload 3D Model</TabsTrigger>
          <TabsTrigger value="coordinates">Toolpath</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">Upload 3D Solid Model</p>
            <p className="text-xs text-muted-foreground mb-4">Supported formats: .step, .iges, .stl</p>
            <input
              type="file"
              onChange={handleUpload}
              accept=".step, .iges, .stl, .stp, .igs"
              className="hidden"
              id="milling-upload"
            />
            <label htmlFor="milling-upload">
              <Button asChild className="mb-3">
                <span>Select File</span>
              </Button>
            </label>
            <Button onClick={handleDownloadSample} variant="outline" className="ml-2 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download Sample
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="coordinates" className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={newCoord.x}
                  onChange={(e) => setNewCoord({ ...newCoord, x: Number.parseFloat(e.target.value) })}
                  placeholder="X coord"
                  className="bg-input border-border"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={newCoord.y}
                  onChange={(e) => setNewCoord({ ...newCoord, y: Number.parseFloat(e.target.value) })}
                  placeholder="Y coord"
                  className="bg-input border-border"
                />
              </div>
              <div>
                <Label className="text-xs">Z</Label>
                <Input
                  type="number"
                  value={newCoord.z}
                  onChange={(e) => setNewCoord({ ...newCoord, z: Number.parseFloat(e.target.value) })}
                  placeholder="Z coord"
                  className="bg-input border-border"
                />
              </div>
            </div>
            <Button onClick={handleAddCoordinate} className="w-full">
              Add Coordinate
            </Button>
          </div>

          {coordinates.length > 0 && (
            <div className="border border-border rounded-lg p-3 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium mb-2 text-muted-foreground">Toolpath Points ({coordinates.length})</p>
              {coordinates.map((coord, index) => (
                <div key={index} className="flex justify-between items-center text-xs mb-2 bg-background p-2 rounded">
                  <span>
                    X:{coord.x.toFixed(2)} Y:{coord.y.toFixed(2)} Z:{coord.z.toFixed(2)}
                  </span>
                  <Button
                    onClick={() => handleRemoveCoordinate(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 h-6 px-2"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
