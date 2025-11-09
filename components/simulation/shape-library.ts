import type { Point2D } from "./types";

export const presetShapes: Record<string, Point2D[]> = {
  rectangle: [
    { x: -40, y: -30 }, { x: 40, y: -30 }, { x: 40, y: 30 }, { x: -40, y: 30 }, { x: -40, y: -30 }
  ],
  circle: Array.from({ length: 33 }, (_, i) => {
    const theta = (2 * Math.PI * i) / 33;
    return { x: 40 * Math.cos(theta), y: 40 * Math.sin(theta) };
  }),
  star: Array.from({ length: 11 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? 40 : 15;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  }),
  gear: [
    { x: -20, y: -20 }, { x: -20, y: 20 }, { x: -15, y: 20 }, { x: -15, y: 25 }, { x: -5, y: 25 }, { x: -5, y: 20 },
    { x: 5, y: 20 }, { x: 5, y: 25 }, { x: 15, y: 25 }, { x: 15, y: 20 }, { x: 20, y: 20 }, { x: 20, y: -20 },
    { x: 15, y: -20 }, { x: 15, y: -25 }, { x: 5, y: -25 }, { x: 5, y: -20 }, { x: -5, y: -20 }, { x: -5, y: -25 },
    { x: -15, y: -25 }, { x: -15, y: -20 }, { x: -20, y: -20 }
  ],
  wave: [
    { x: -40, y: 0 }, { x: -30, y: 15 }, { x: -20, y: -15 }, { x: -10, y: 15 }, { x: 0, y: -15 },
    { x: 10, y: 15 }, { x: 20, y: -15 }, { x: 30, y: 15 }, { x: 40, y: 0 }
  ]
};
