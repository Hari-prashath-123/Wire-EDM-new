
export function generateRectangle(width: number, height: number): Point2D[] {
  const w2 = width / 2;
  const h2 = height / 2;
  return [
    { x: -w2, y: -h2 },
    { x: w2, y: -h2 },
    { x: w2, y: h2 },
    { x: -w2, y: h2 },
    { x: -w2, y: -h2 }
  ];
}

export function generateCircle(radius: number, segments: number = 32): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (2 * Math.PI * i) / segments;
    points.push({ x: radius * Math.cos(theta), y: radius * Math.sin(theta) });
  }
  return points;
}

export function generateStar(outerRadius: number, innerRadius: number, numPoints: number): Point2D[] {
  const points: Point2D[] = [];
  const totalPoints = numPoints * 2;
  for (let i = 0; i <= totalPoints; i++) {
    const angle = (i / totalPoints) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }
  return points;
}

export function generateGear(scale: number = 1): Point2D[] {
  const baseGear = [
    { x: -20, y: -20 }, { x: -20, y: 20 }, { x: -15, y: 20 }, { x: -15, y: 25 }, { x: -5, y: 25 }, { x: -5, y: 20 },
    { x: 5, y: 20 }, { x: 5, y: 25 }, { x: 15, y: 25 }, { x: 15, y: 20 }, { x: 20, y: 20 }, { x: 20, y: -20 },
    { x: 15, y: -20 }, { x: 15, y: -25 }, { x: 5, y: -25 }, { x: 5, y: -20 }, { x: -5, y: -20 }, { x: -5, y: -25 },
    { x: -15, y: -25 }, { x: -15, y: -20 }, { x: -20, y: -20 }
  ];
  return baseGear.map(p => ({ x: p.x * scale, y: p.y * scale }));
}

export function generateWave(amplitude: number = 15, length: number = 80, segments: number = 20): Point2D[] {
  const points: Point2D[] = [];
  const halfLength = length / 2;
  for (let i = 0; i <= segments; i++) {
    const x = -halfLength + (length * i) / segments;
    const y = amplitude * Math.sin((i / segments) * Math.PI * 2);
    points.push({ x, y });
  }
  return points;
}

export const staticPresetShapes: Record<string, Point2D[]> = {
  rectangle: generateRectangle(80, 60),
  circle: generateCircle(40, 32),
  star: generateStar(40, 15, 5),
  gear: generateGear(1),
  wave: generateWave(15, 80, 20)
};
import type { Point2D } from "./types";
