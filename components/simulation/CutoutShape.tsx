"use client"

import React, { useMemo } from "react"
import { Extrude } from "@react-three/drei"
import * as THREE from "three"
import type { Point2D } from './types'

interface CutoutShapeProps {
  points: Point2D[];
  materialThickness: number;
  materialColor?: string;
}

export default function CutoutShape({ points, materialThickness = 10, materialColor = "#64748b" }: CutoutShapeProps) {
  const shape = useMemo(() => {
    if (points.length < 2) return null
    const shapePoints = points.map(p => new THREE.Vector2(p.x, p.y))
    return new THREE.Shape(shapePoints)
  }, [points])

  const extrudeSettings = useMemo(() => ({
    depth: materialThickness,
    bevelEnabled: false,
  }), [materialThickness])

  if (!shape) return null

  return (
    <Extrude args={[shape, extrudeSettings]} position={[0, 0, -materialThickness / 2]}>
      <meshStandardMaterial color={materialColor} />
    </Extrude>
  )
}
