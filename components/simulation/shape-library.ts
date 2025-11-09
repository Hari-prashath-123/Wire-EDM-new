import { type Point2D } from "./types";

// Normalized coordinates (origin at center)
export const presetShapes: Record<string, Point2D[]> = {
  rectangle: [
    { x: -40, y: -30 },
    { x: 40, y: -30 },
    { x: 40, y: 30 },
    { x: -40, y: 30 },
    { x: -40, y: -30 },
  ],
  circle: Array.from({ length: 33 }, (_, i) => {
    const angle = (i / 32) * Math.PI * 2;
    return {
      x: Math.cos(angle) * 35,
      y: Math.sin(angle) * 35,
    };
  }),
  star: Array.from({ length: 11 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? 40 : 15;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  }),
};
