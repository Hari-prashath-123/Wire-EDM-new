export function generateRectangle(width: number, height: number): Point2D[] {
  const w2 = width / 2
  const h2 = height / 2
  return [
    { x: -w2, y: -h2 },
    { x: w2, y: -h2 },
    { x: w2, y: h2 },
    { x: -w2, y: h2 },
    { x: -w2, y: -h2 },
  ]
}

export function generateCircle(radius: number, segments = 32): Point2D[] {
  const points: Point2D[] = []
  for (let i = 0; i <= segments; i++) {
    const theta = (2 * Math.PI * i) / segments
    points.push({ x: radius * Math.cos(theta), y: radius * Math.sin(theta) })
  }
  return points
}

export function generateStar(outerRadius: number, innerRadius: number, numPoints: number): Point2D[] {
  const points: Point2D[] = []
  const totalPoints = numPoints * 2
  for (let i = 0; i <= totalPoints; i++) {
    const angle = (i / totalPoints) * Math.PI * 2 - Math.PI / 2
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    })
  }
  return points
}

export function generateGear(scale = 1): Point2D[] {
  const baseGear = [
    { x: -2, y: -2 },
    { x: -2, y: 2 },
    { x: -1.5, y: 2 },
    { x: -1.5, y: 2.5 },
    { x: -0.5, y: 2.5 },
    { x: -0.5, y: 2 },
    { x: 0.5, y: 2 },
    { x: 0.5, y: 2.5 },
    { x: 1.5, y: 2.5 },
    { x: 1.5, y: 2 },
    { x: 2, y: 2 },
    { x: 2, y: -2 },
    { x: 1.5, y: -2 },
    { x: 1.5, y: -2.5 },
    { x: 0.5, y: -2.5 },
    { x: 0.5, y: -2 },
    { x: -0.5, y: -2 },
    { x: -0.5, y: -2.5 },
    { x: -1.5, y: -2.5 },
    { x: -1.5, y: -2 },
    { x: -2, y: -2 },
  ]
  return baseGear.map((p) => ({ x: p.x * scale, y: p.y * scale }))
}

export function generateWave(amplitude = 1.5, length = 8, segments = 20): Point2D[] {
  const points: Point2D[] = []
  const halfLength = length / 2
  for (let i = 0; i <= segments; i++) {
    const x = -halfLength + (length * i) / segments
    const y = amplitude * Math.sin((i / segments) * Math.PI * 2)
    points.push({ x, y })
  }
  return points
}

export const staticPresetShapes: Record<string, Point2D[]> = {
  rectangle: generateRectangle(8, 6),
  circle: generateCircle(4, 32),
  star: generateStar(4, 1.5, 5),
  gear: generateGear(1),
  wave: generateWave(1.5, 8, 20),
}

import type { Point2D } from "./types"
