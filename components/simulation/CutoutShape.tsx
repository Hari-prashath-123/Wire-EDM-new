"use client"

import React, { useMemo } from "react"
import { Extrude } from "@react-three/drei"
import * as THREE from "three"
import type { Point2D } from './types'

interface CutoutShapeProps {
  points: Point2D[]
}

export default function CutoutShape({ points }: CutoutShapeProps) {
  const shape = useMemo(() => {
    if (points.length < 2) return null
    // Convert 2D points to THREE.Vector2
    const shapePoints = points.map(p => new THREE.Vector2(p.x, p.y))
    // Create a shape from these points
    return new THREE.Shape(shapePoints)
  }, [points])

  const extrudeSettings = useMemo(() => ({
    depth: 10, // Match the original box height
    bevelEnabled: false,
  }), [])

  if (!shape) return null

    return (
      <Extrude args={[shape, extrudeSettings]} position={[0, 0, -5]}>
        <meshStandardMaterial color="#64748b" />
      </Extrude>
    )
}
