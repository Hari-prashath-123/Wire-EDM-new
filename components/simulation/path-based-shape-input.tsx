"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PathBasedShapeInputProps {
  title: string
  acceptedFormats: string
  onShapeChange: (shapeData: unknown) => void
  scale?: number // world-units per 1/scale pixel; default 5
}

export default function PathBasedShapeInput({ title, acceptedFormats, onShapeChange, scale = 5 }: PathBasedShapeInputProps) {
  const [drawingCanvas, setDrawingCanvas] = useState<HTMLCanvasElement | null>(null)
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Normalize canvas pixel points to a centered world-space coordinate system
  // x' = (x - canvasWidth/2)/5, y' = (canvasHeight/2 - y)/5 (invert Y axis)
  const normalizePoints = (
    pts: Array<{ x: number; y: number }>,
    canvasWidth: number,
    canvasHeight: number
  ): Array<{ x: number; y: number }> => {
    const s = scale === 0 ? 1 : scale
    return pts.map(({ x, y }) => ({
      x: (x - canvasWidth / 2) / s,
      y: (canvasHeight / 2 - y) / s,
    }))
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("[v0] File uploaded:", file.name)
      onShapeChange({ type: "file", name: file.name, formats: acceptedFormats })
    }
  }

  const handleDownloadSample = () => {
    console.log("[v0] Downloading sample 2D file")
    onShapeChange({ type: "sample", format: acceptedFormats.split(",")[0].trim() })
  }

  const drawFromPoints = (canvas: HTMLCanvasElement | null, pts: Array<{ x: number; y: number }>) => {
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (pts.length === 0) return
    ctx.strokeStyle = "#a855f7"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
    ctx.stroke()
  }

  const getCanvasPoint = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const p = getCanvasPoint(canvas, e.clientX, e.clientY)
    setIsDrawing(true)
    setPoints((prev) => {
      const next = [...prev, p]
      drawFromPoints(canvas, next)
      return next
    })
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = e.currentTarget
    const p = getCanvasPoint(canvas, e.clientX, e.clientY)
    setPoints((prev) => {
      const next = [...prev, p]
      drawFromPoints(canvas, next)
      return next
    })
  }

  const handleCanvasMouseUp = () => {
    // If we were drawing and have a usable path, normalize and emit to consumer
    if (isDrawing && points.length > 1 && drawingCanvas) {
      const { width, height } = drawingCanvas
      const normalized = normalizePoints(points, width, height)
      onShapeChange({ type: "drawn", points: normalized })
    }
    setIsDrawing(false)
    // ensure final draw
    if (drawingCanvas) drawFromPoints(drawingCanvas, points)
  }

  // Touch handlers for mobile
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const t = e.touches[0]
    const p = getCanvasPoint(canvas, t.clientX, t.clientY)
    setIsDrawing(true)
    setPoints((prev) => {
      const next = [...prev, p]
      drawFromPoints(canvas, next)
      return next
    })
  }

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = e.currentTarget
    const t = e.touches[0]
    const p = getCanvasPoint(canvas, t.clientX, t.clientY)
    setPoints((prev) => {
      const next = [...prev, p]
      drawFromPoints(canvas, next)
      return next
    })
    e.preventDefault()
  }

  const handleCanvasTouchEnd = () => {
    // Mirror mouse up behavior for touch end
    if (isDrawing && points.length > 1 && drawingCanvas) {
      const { width, height } = drawingCanvas
      const normalized = normalizePoints(points, width, height)
      onShapeChange({ type: "drawn", points: normalized })
    }
    setIsDrawing(false)
    if (drawingCanvas) drawFromPoints(drawingCanvas, points)
  }

  const handleClearCanvas = () => {
    setPoints([])
    if (drawingCanvas) {
      const ctx = drawingCanvas.getContext("2d")
      if (ctx) ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
    }
  }

  // Save button handler: normalize current points and emit
  const handleSaveDrawing = () => {
    if (!drawingCanvas || points.length === 0) {
      onShapeChange({ type: "drawn", points: [] })
      return
    }
    const { width, height } = drawingCanvas
    const normalized = normalizePoints(points, width, height)
    onShapeChange({ type: "drawn", points: normalized })
  }

  return (
    <Card className="p-6 bg-card border border-border">
      <h3 className="text-xl font-bold mb-6">{title}</h3>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="draw">Draw</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">Upload 2D Vector File</p>
            <p className="text-xs text-muted-foreground mb-4">Supported formats: {acceptedFormats}</p>
            <input type="file" onChange={handleUpload} accept={acceptedFormats} className="hidden" id="shape-upload" />
            <label htmlFor="shape-upload">
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

        <TabsContent value="draw" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            Click or touch and drag to draw your 2D profile. Use <strong>Clear</strong> to reset and <strong>Save Drawing</strong> when you're done.
            Tip: try drawing a closed outline; coordinates are captured in canvas pixels.
          </p>
          <canvas
            ref={setDrawingCanvas}
            width={600}
            height={300}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
            className="w-full border border-border rounded-lg bg-black cursor-crosshair"
          />
          <div className="flex gap-2">
            <Button onClick={handleClearCanvas} variant="outline">
              Clear
            </Button>
            <Button onClick={handleSaveDrawing}>
              Save Drawing
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
