"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Plus, RefreshCcw, Check } from "lucide-react"
import { Upload, Download } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PathBasedShapeInputProps {
  title: string
  acceptedFormats: string
  onShapeChange: (shapeData: unknown) => void
  /** Start simulation callback (optional) */
  onStartSimulation?: () => void
  /** Optional override for workpiece/world width (X) and height (Y) used to map canvas pixels */
  workpieceWidth?: number // default 100 (matches 3D box X dimension)
  workpieceHeight?: number // default 80 (matches 3D box Y dimension)
}

export default function PathBasedShapeInput({
  title,
  acceptedFormats,
  onShapeChange,
  onStartSimulation,
  workpieceWidth = 100,
  workpieceHeight = 80,
}: PathBasedShapeInputProps) {
  const [drawingCanvas, setDrawingCanvas] = useState<HTMLCanvasElement | null>(null)
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([])
  const [isDrawing, setIsDrawing] = useState(false)
  // Coordinate entry state
  const [coordPoints, setCoordPoints] = useState<Array<{ x: number; y: number }>>([])
  const [currentX, setCurrentX] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [step, setStep] = useState(5) // increment step in world units
  // Grid & snapping
  const [showGrid, setShowGrid] = useState(true)
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [gridSize, setGridSize] = useState(5)

  const snap = (v: number) => (snapEnabled ? Math.round(v / gridSize) * gridSize : v)

  // Defer emitting shape to next macrotask to avoid parent updates during child render
  const emitShape = useCallback(
    (shape: unknown) => {
      try {
        setTimeout(() => {
          onShapeChange(shape)
        }, 0)
      } catch (err) {
        console.error("[v0] Error emitting shape:", err)
      }
    },
    [onShapeChange],
  )

  // Map canvas pixel coordinates directly into world space matching the workpiece dimensions.
  // Canvas origin (0,0) => world (-W/2, +H/2) so drawing orientation matches what user sees:
  // xWorld = (px / canvasWidth - 0.5) * workpieceWidth
  // yWorld = (0.5 - py / canvasHeight) * workpieceHeight  (invert Y so up on canvas is +Y in world)
  const normalizePoints = (
    pts: Array<{ x: number; y: number }>,
    canvasWidth: number,
    canvasHeight: number,
  ): Array<{ x: number; y: number }> => {
    return pts.map(({ x, y }) => ({
      x: (x / canvasWidth - 0.5) * workpieceWidth,
      y: (0.5 - y / canvasHeight) * workpieceHeight,
    }))
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("[v0] File uploaded:", file.name)
      emitShape({ type: "file", name: file.name, formats: acceptedFormats })
    }
  }

  const handleDownloadSample = () => {
    console.log("[v0] Downloading sample 2D file")
    emitShape({ type: "sample", format: acceptedFormats.split(",")[0].trim() })
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
      try {
        const { width, height } = drawingCanvas
        const normalized = normalizePoints(points, width, height)
        emitShape({ type: "drawn", points: normalized })
      } catch (err) {
        console.error("[v0] Error on canvas mouse up:", err)
      }
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
      try {
        const { width, height } = drawingCanvas
        const normalized = normalizePoints(points, width, height)
        emitShape({ type: "drawn", points: normalized })
      } catch (err) {
        console.error("[v0] Error on canvas touch end:", err)
      }
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
    try {
      if (!drawingCanvas || points.length === 0) {
        emitShape({ type: "drawn", points: [] })
        return
      }
      const { width, height } = drawingCanvas
      const normalized = normalizePoints(points, width, height)
      emitShape({ type: "drawn", points: normalized })
    } catch (err) {
      console.error("[v0] Error saving drawing:", err)
    }
  }

  // Optional live preview after render (avoids parent updates during render phase)
  useEffect(() => {
    if (!isDrawing) return
    if (!drawingCanvas) return
    if (points.length < 2) return
    const { width, height } = drawingCanvas
    const normalized = normalizePoints(points, width, height)
    emitShape({ type: "drawn", points: normalized })
  }, [points, isDrawing, drawingCanvas])

  return (
    <Card className="p-6 bg-card border border-border">
      <h3 className="text-xl font-bold mb-6">{title}</h3>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="draw">Draw</TabsTrigger>
          <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
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
            Click or touch and drag to draw your 2D profile. Use <strong>Clear</strong> to reset and{" "}
            <strong>Save Drawing</strong> when you're done. Tip: try drawing a closed outline; coordinates are captured
            in canvas pixels.
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
            <Button onClick={handleSaveDrawing}>Save Drawing</Button>
          </div>
        </TabsContent>

        {/* Coordinate-based shape construction */}
        <TabsContent value="coordinates" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Enter or nudge X/Y values, then Add Point to build a path. Close Shape will link last point to first.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-xs uppercase tracking-wide text-muted-foreground w-6">X</label>
                <Input
                  type="number"
                  value={currentX}
                  onChange={(e) => setCurrentX(snap(Number(e.target.value)))}
                  className="h-9 w-28"
                />
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" onClick={() => setCurrentX((prev) => snap(prev - step))}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => setCurrentX((prev) => snap(prev + step))}>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs uppercase tracking-wide text-muted-foreground w-6">Y</label>
                <Input
                  type="number"
                  value={currentY}
                  onChange={(e) => setCurrentY(snap(Number(e.target.value)))}
                  className="h-9 w-28"
                />
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" onClick={() => setCurrentY((prev) => snap(prev + step))}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => setCurrentY((prev) => snap(prev - step))}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs uppercase tracking-wide text-muted-foreground w-6">Step</label>
                <Input
                  type="number"
                  value={step}
                  onChange={(e) => setStep(Math.max(1, Number(e.target.value)))}
                  className="h-9 w-24"
                />
                <span className="text-xs text-muted-foreground">world units</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                  Show grid
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={snapEnabled} onChange={(e) => setSnapEnabled(e.target.checked)} />
                  Snap to grid
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Grid</span>
                  <Input
                    type="number"
                    value={gridSize}
                    onChange={(e) => setGridSize(Math.max(1, Number(e.target.value)))}
                    className="h-9 w-20"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => {
                    setCoordPoints((prev) => {
                      const next = [...prev, { x: snap(currentX), y: snap(currentY) }]
                      emitShape({ type: "coordinates", points: next })
                      return next
                    })
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Point
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (coordPoints.length > 2) {
                      const closed = [...coordPoints, coordPoints[0]]
                      setCoordPoints(closed)
                      emitShape({ type: "coordinates", points: closed })
                    }
                  }}
                >
                  <Check className="w-4 h-4 mr-2" /> Close Shape
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCoordPoints([])
                    emitShape({ type: "coordinates", points: [] })
                  }}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
                {coordPoints.length > 1 && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      // Normalize points before emitting for simulation
                      const normalized = normalizePoints(coordPoints, 600, 300)
                      emitShape({ type: "coordinates", points: normalized })
                      if (onStartSimulation) onStartSimulation()
                    }}
                  >
                    Start Simulation
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    // Export CSV
                    const csv = coordPoints.map((pt) => `${pt.x},${pt.y}`).join("\n")
                    const blob = new Blob([csv], { type: "text/csv" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "coordinates.csv"
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    document.getElementById("import-coord-csv")?.click()
                  }}
                >
                  Import CSV
                </Button>
                <input
                  id="import-coord-csv"
                  type="file"
                  accept=".csv"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (evt) => {
                      const text = evt.target?.result as string
                      const pts = text
                        .split(/\r?\n/)
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                          const [x, y] = line.split(",").map(Number)
                          return { x, y }
                        })
                        .filter((pt) => !isNaN(pt.x) && !isNaN(pt.y))
                      setCoordPoints(pts)
                      emitShape({ type: "coordinates", points: pts })
                    }
                    reader.readAsText(file)
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-3 max-h-56 overflow-auto text-sm">
                <p className="text-xs mb-2 font-semibold">Points ({coordPoints.length})</p>
                {coordPoints.length === 0 ? (
                  <p className="text-muted-foreground text-xs">No points yet. Use Add Point.</p>
                ) : (
                  <ol className="space-y-1">
                    {coordPoints.map((pt, i) => (
                      <li key={i} className="flex justify-between">
                        <span>#{i + 1}</span>
                        <span className="text-muted-foreground">
                          x: {pt.x.toFixed(2)} y: {pt.y.toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCoordPoints((prev) => {
                              const next = prev.filter((_, idx) => idx !== i)
                              emitShape({ type: "coordinates", points: next })
                              return next
                            })
                          }}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              {/* Graph preview */}
              <div className="border border-border rounded-lg p-2 bg-background/40">
                <svg viewBox="0 0 600 300" className="w-full h-40">
                  {/* Grid */}
                  {showGrid &&
                    (() => {
                      const lines: React.ReactNode[] = []
                      const xStep = (gridSize / workpieceWidth) * 600
                      const yStep = (gridSize / workpieceHeight) * 300
                      for (let x = 300; x <= 600; x += xStep)
                        lines.push(
                          <line key={`gxR${x}`} x1={x} y1={0} x2={x} y2={300} stroke="#1f2937" strokeWidth="0.5" />,
                        )
                      for (let x = 300 - xStep; x >= 0; x -= xStep)
                        lines.push(
                          <line key={`gxL${x}`} x1={x} y1={0} x2={x} y2={300} stroke="#1f2937" strokeWidth="0.5" />,
                        )
                      for (let y = 150; y <= 300; y += yStep)
                        lines.push(
                          <line key={`gyD${y}`} x1={0} y1={y} x2={600} y2={y} stroke="#1f2937" strokeWidth="0.5" />,
                        )
                      for (let y = 150 - yStep; y >= 0; y -= yStep)
                        lines.push(
                          <line key={`gyU${y}`} x1={0} y1={y} x2={600} y2={y} stroke="#1f2937" strokeWidth="0.5" />,
                        )
                      return <g opacity={0.5}>{lines}</g>
                    })()}
                  {/* Axes */}
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#334155" strokeWidth="1" />
                  <line x1="300" y1="0" x2="300" y2="300" stroke="#334155" strokeWidth="1" />
                  {/* Path lines */}
                  {coordPoints.length > 1 &&
                    coordPoints.map((pt, i) => {
                      const next = coordPoints[i + 1]
                      if (!next) return null
                      const x1 = (pt.x / workpieceWidth + 0.5) * 600
                      const y1 = (0.5 - pt.y / workpieceHeight) * 300
                      const x2 = (next.x / workpieceWidth + 0.5) * 600
                      const y2 = (0.5 - next.y / workpieceHeight) * 300
                      return <line key={"seg" + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6366f1" strokeWidth="2" />
                    })}
                  {/* Optional closing line */}
                  {coordPoints.length > 2 &&
                    coordPoints[0] &&
                    coordPoints[coordPoints.length - 1] &&
                    (() => {
                      const first = coordPoints[0]
                      const last = coordPoints[coordPoints.length - 1]
                      const x1 = (last.x / workpieceWidth + 0.5) * 600
                      const y1 = (0.5 - last.y / workpieceHeight) * 300
                      const x2 = (first.x / workpieceWidth + 0.5) * 600
                      const y2 = (0.5 - first.y / workpieceHeight) * 300
                      return (
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" />
                      )
                    })()}
                  {/* Points */}
                  {coordPoints.map((pt, i) => {
                    const cx = (pt.x / workpieceWidth + 0.5) * 600
                    const cy = (0.5 - pt.y / workpieceHeight) * 300
                    return <circle key={"pt" + i} cx={cx} cy={cy} r={4} fill="#10b981" />
                  })}
                </svg>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
