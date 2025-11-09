// ShapeLibrary.ts
// Predefined shapes for Wire EDM simulation

export type ShapeCategory = 'Basic' | 'Complex' | 'Industrial' | 'Custom';

export type ShapeParameter = {
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
};

export type ShapeDefinition = {
  id: string;
  name: string;
  description: string;
  category: ShapeCategory;
  points: (params?: Record<string, number>) => number[][];
  parameters?: ShapeParameter[];
};

// Utility to generate points for basic shapes
// Shape generators with parameters
function generateSquare(params?: Record<string, number>): number[][] {
  const size = params?.size ?? 1;
  return [
    [0, 0],
    [size, 0],
    [size, size],
    [0, size],
    [0, 0],
  ];
}

function generateCircle(params?: Record<string, number>): number[][] {
  const radius = params?.radius ?? 0.5;
  const segments = params?.segments ?? 33;
  return Array.from({ length: segments }, (_, i) => {
    const theta = (2 * Math.PI * i) / segments;
    return [
      0.5 + radius * Math.cos(theta),
      0.5 + radius * Math.sin(theta),
    ];
  });
}

function generateTriangle(params?: Record<string, number>): number[][] {
  const size = params?.size ?? 1;
  const h = (Math.sqrt(3) / 2) * size;
  return [
    [0.5, 0],
    [0, h],
    [size, h],
    [0.5, 0],
  ];
}

function generateHexagon(params?: Record<string, number>): number[][] {
  const radius = params?.radius ?? 0.5;
  return Array.from({ length: 6 }, (_, i) => {
    const theta = (2 * Math.PI * i) / 6;
    return [
      0.5 + radius * Math.cos(theta),
      0.5 + radius * Math.sin(theta),
    ];
  }).concat([[0.5 + radius, 0.5]]);
}

function generateKeyhole(params?: Record<string, number>): number[][] {
  // Simple keyhole: circle + rectangle
  const radius = params?.radius ?? 0.2;
  const length = params?.length ?? 0.6;
  const segments = params?.segments ?? 20;
  const circle = Array.from({ length: segments }, (_, i) => {
    const theta = (2 * Math.PI * i) / segments;
    return [
      0.5 + radius * Math.cos(theta),
      0.2 + radius * Math.sin(theta),
    ];
  });
  const rect = [
    [0.5 - radius, 0.2],
    [0.5 - radius, 0.2 + length],
    [0.5 + radius, 0.2 + length],
    [0.5 + radius, 0.2],
  ];
  return [...circle, ...rect, circle[0]];
}

function generateSlot(params?: Record<string, number>): number[][] {
  // Rectangle with rounded ends
  const width = params?.width ?? 0.6;
  const height = params?.height ?? 0.2;
  const segments = params?.segments ?? 10;
  const left = Array.from({ length: segments }, (_, i) => {
    const theta = Math.PI * (i / (segments - 1));
    return [
      0.2 + (height / 2) * Math.cos(theta),
      0.5 + (height / 2) * Math.sin(theta),
    ];
  });
  const right = Array.from({ length: segments }, (_, i) => {
    const theta = Math.PI * (i / (segments - 1));
    return [
      0.2 + width + (height / 2) * Math.cos(Math.PI - theta),
      0.5 + (height / 2) * Math.sin(Math.PI - theta),
    ];
  });
  return [...left, ...right, left[0]];
}

export const shapeLibrary: ShapeDefinition[] = [
  {
    id: 'square',
    name: 'Square',
    description: 'Basic square shape',
    category: 'Basic',
    points: generateSquare,
    parameters: [
      { key: 'size', label: 'Size', min: 0.1, max: 2, default: 1, step: 0.01 },
    ],
  },
  {
    id: 'circle',
    name: 'Circle',
    description: 'Perfect circle',
    category: 'Basic',
    points: generateCircle,
    parameters: [
      { key: 'radius', label: 'Radius', min: 0.1, max: 1, default: 0.5, step: 0.01 },
      { key: 'segments', label: 'Segments', min: 8, max: 100, default: 33, step: 1 },
    ],
  },
  {
    id: 'triangle',
    name: 'Triangle',
    description: 'Equilateral triangle',
    category: 'Basic',
    points: generateTriangle,
    parameters: [
      { key: 'size', label: 'Size', min: 0.1, max: 2, default: 1, step: 0.01 },
    ],
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    description: 'Regular hexagon',
    category: 'Basic',
    points: generateHexagon,
    parameters: [
      { key: 'radius', label: 'Radius', min: 0.1, max: 1, default: 0.5, step: 0.01 },
    ],
  },
  {
    id: 'keyhole',
    name: 'Keyhole',
    description: 'Standard keyhole shape',
    category: 'Industrial',
    points: generateKeyhole,
    parameters: [
      { key: 'radius', label: 'Circle Radius', min: 0.05, max: 0.5, default: 0.2, step: 0.01 },
      { key: 'length', label: 'Slot Length', min: 0.2, max: 1, default: 0.6, step: 0.01 },
      { key: 'segments', label: 'Circle Segments', min: 8, max: 50, default: 20, step: 1 },
    ],
  },
  {
    id: 'slot',
    name: 'Slot',
    description: 'Rectangular slot with rounded ends',
    category: 'Industrial',
    points: generateSlot,
    parameters: [
      { key: 'width', label: 'Width', min: 0.2, max: 2, default: 0.6, step: 0.01 },
      { key: 'height', label: 'Height', min: 0.05, max: 1, default: 0.2, step: 0.01 },
      { key: 'segments', label: 'End Segments', min: 4, max: 30, default: 10, step: 1 },
    ],
  },
  // Add more shapes here (Gear, Spiral, Flower, etc.)
];
