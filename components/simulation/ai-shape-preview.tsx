"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Point2D } from "./types"
import { X } from "lucide-react"

interface AIShapePreviewProps {
  points: Point2D[]
  onClose: () => void
  onConfirm: (points: Point2D[]) => void
}

function PreviewShape({ points, materialThickness = 10 }: { points: Point2D[]; materialThickness?: number }) {
  const shape = useMemo(() => {
    if (points.length < 2) return null
    const shapePoints = points.map((p) => new THREE.Vector2(p.x, p.y))
    return new THREE.Shape(shapePoints)
  }, [points])

  if (!shape) return null

  return (
    <group>
      {/* Base workpiece */}
      <mesh position={[0, 0, -materialThickness / 2]}>
        <boxGeometry args={[100, 80, materialThickness]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Cutting path visualization */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, materialThickness / 2 + 1]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff0080" linewidth={2} />
      </lineSegments>

      {/* Path points as spheres */}
      {points.map((point, idx) => (
        <mesh key={idx} position={[point.x, point.y, materialThickness / 2 + 1.5]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={idx === 0 ? "#00ff00" : "#ffff00"} emissive="#ffff00" />
        </mesh>
      ))}
    </group>
  )
}

export default function AIShapePreview({ points, onClose, onConfirm }: AIShapePreviewProps) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-card border border-border w-11/12 max-w-2xl max-h-96 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-bold">Shape Preview</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, -70, 40], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <PreviewShape points={points} />
            <OrbitControls />
          </Canvas>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(points)
              setConfirmed(true)
              setTimeout(onClose, 300)
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            Confirm & Use
          </Button>
        </div>
      </Card>
    </div>
  )
}
