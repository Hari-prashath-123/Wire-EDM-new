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

export interface Parameters {
  speed: number
  power: number
  precision: number
}

export type CuttingMethod =
  | 'path-based'
  | 'milling'
  | 'wire-edm'
  | 'water-jet'
  | 'laser-cutting'
  | 'cnc-milling'
