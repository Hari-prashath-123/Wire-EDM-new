export interface Point2D {
  x: number
  y: number
}

export type DrawnShape = {
  type: 'drawn'
  points: Point2D[]
}

export type FileShape = {
  type: 'file'
  name?: string
  formats?: string
}

export type CoordinatesShape = {
  type: 'coordinates'
  points: Point2D[]
}

export type ShapeData = DrawnShape | FileShape | CoordinatesShape

// Unified EDMParameters used across app and AI stubs (superset of fields)
export interface EDMParameters {
  voltage: number
  current: number
  pulseOnTime: number
  pulseOffTime: number
  wireSpeed: number
  dielectricFlow: number
  wireOffset: number
  sparkGap: number
}

// Metrics derived from parameters and simulation
export interface ProcessMetrics {
  dischargeEnergy: number
  dutyCycle: number
  powerConsumption: number
  estimatedCostPerHour: number
  materialRemovalRate: number
  surfaceRoughness: number
  wireWearRate: number
  efficiency: number
}

export type CuttingMethod =
  | 'path-based'
  | 'milling'
  | 'wire-edm'
  | 'water-jet'
  | 'laser-cutting'
  | 'cnc-milling'
