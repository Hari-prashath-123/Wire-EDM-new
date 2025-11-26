"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import CuttingScene from "./cutting-scene"
import type { EDMParameters } from "@/components/simulation/types"
import type { ShapeData } from "./types"

interface SceneWrapperProps {
  shapeData?: ShapeData | null
  isRunning: boolean
  cuttingSpeed: number
  cuttingMethod: string
  parameters: EDMParameters
  material: string
  onLoop?: () => void
  materialThickness?: number
}

function SceneLoading() {
  return (
    <div className="w-full h-full bg-black rounded-lg border border-border flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mb-2"></div>
        <p className="text-gray-400 text-sm">Initializing 3D Scene...</p>
      </div>
    </div>
  )
}

export function SceneWrapper(props: SceneWrapperProps) {
  return (
    <ErrorBoundary fallback={<SceneFallback />}>
      <Suspense fallback={<SceneLoading />}>
        <CuttingScene {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

function SceneFallback() {
  return (
    <div className="w-full h-full bg-black rounded-lg border border-border flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 text-sm mb-2">Failed to load 3D scene</p>
        <p className="text-gray-400 text-xs">Please refresh the page or try a different browser</p>
      </div>
    </div>
  )
}
