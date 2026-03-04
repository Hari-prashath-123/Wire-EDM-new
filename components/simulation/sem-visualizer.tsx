"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"
import { Card } from "@/components/ui/card"
import type { EDMParameters } from "./types"

interface SEMVisualizerProps {
  parameters: EDMParameters
}

// Calculate discharge energy from Wire EDM parameters
function calculateDischargeEnergy(params: EDMParameters): number {
  const ton = params.pulseOnTime // Pulse on time (µs)
  const toff = params.pulseOffTime // Pulse off time (µs)
  const ip = params.current // Peak current (A)
  
  // Discharge energy formula: E = (Ton * Ip) / Toff
  // Higher values indicate more energy, deeper craters, rougher surface
  return (ton * ip) / Math.max(toff, 1) // Avoid division by zero
}

// Analyze surface condition based on discharge energy
function analyzeSurfaceCondition(energy: number) {
  if (energy > 15) {
    return {
      condition: "Very High Discharge Energy",
      description: "Deep craters with significant recast layer and extensive microcracks. Very rough surface morphology.",
      severity: "critical",
      roughness: "Very Rough (Ra > 4.0 µm)",
      features: ["Deep discharge craters", "Thick recast layer", "Extensive microcracks", "Debris particles"]
    }
  } else if (energy > 8) {
    return {
      condition: "High Discharge Energy",
      description: "Moderate craters with visible recast layer and microcracks. Rough surface texture.",
      severity: "high",
      roughness: "Rough (Ra 2.5-4.0 µm)",
      features: ["Moderate craters", "Visible recast layer", "Some microcracks", "Irregular surface"]
    }
  } else if (energy > 4) {
    return {
      condition: "Medium Discharge Energy",
      description: "Shallow craters with thin recast layer. Acceptable surface finish.",
      severity: "medium",
      roughness: "Medium (Ra 1.5-2.5 µm)",
      features: ["Shallow craters", "Thin recast layer", "Few microcracks", "Moderate smoothness"]
    }
  } else {
    return {
      condition: "Low Discharge Energy",
      description: "Very shallow pits with minimal recast layer. Smooth surface finish with fine texture.",
      severity: "low",
      roughness: "Smooth (Ra < 1.5 µm)",
      features: ["Shallow pits", "Minimal recast layer", "Negligible cracks", "Fine surface finish"]
    }
  }
}

// SEM Surface Mesh Component
function SEMSurface({ energy }: { energy: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)
  
  // Generate displacement map based on energy
  const displacementTexture = useMemo(() => {
    const size = 256
    const data = new Float32Array(size * size)
    
    // Calculate surface roughness parameters
    const craterDepth = energy > 15 ? 0.8 : energy > 8 ? 0.5 : energy > 4 ? 0.3 : 0.15
    const craterFrequency = energy > 15 ? 0.15 : energy > 8 ? 0.1 : energy > 4 ? 0.05 : 0.02
    const microcrackDensity = energy > 8 ? 0.3 : energy > 4 ? 0.1 : 0
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const x = i / size
        const y = j / size
        const idx = i * size + j
        
        // Base surface with multiple frequency components
        let height = 0
        
        // Large craters (discharge craters)
        height += Math.sin(x * Math.PI * 8 * craterFrequency) * 
                  Math.cos(y * Math.PI * 8 * craterFrequency) * 
                  craterDepth
        
        // Medium-scale roughness (recast layer irregularities)
        height += Math.sin(x * Math.PI * 32) * Math.cos(y * Math.PI * 32) * craterDepth * 0.3
        
        // Fine-scale texture
        height += (Math.random() - 0.5) * craterDepth * 0.2
        
        // Add microcracks (linear features)
        if (microcrackDensity > 0) {
          const crackPattern = Math.sin(x * Math.PI * 20 + y * Math.PI * 15) > 0.95 ? 1 : 0
          height -= crackPattern * microcrackDensity
        }
        
        // Add debris particles for high energy
        if (energy > 10) {
          const debris = Math.random() > 0.98 ? Math.random() * 0.2 : 0
          height += debris
        }
        
        data[idx] = height
      }
    }
    
    const texture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RedFormat,
      THREE.FloatType
    )
    texture.needsUpdate = true
    return texture
  }, [energy])
  
  // Generate normal map for lighting effects
  const normalTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    const imageData = ctx.createImageData(256, 256)
    const data = imageData.data
    
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 256; j++) {
        const idx = (i * 256 + j) * 4
        
        // Create normal variation based on energy
        const variation = energy > 10 ? 50 : energy > 5 ? 30 : 15
        
        data[idx] = 128 + (Math.random() - 0.5) * variation     // R (X normal)
        data[idx + 1] = 128 + (Math.random() - 0.5) * variation // G (Y normal)
        data[idx + 2] = 255 - variation / 2                      // B (Z normal, mostly up)
        data[idx + 3] = 255                                       // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [energy])
  
  // Surface color varies with recast layer thickness
  const surfaceColor = useMemo(() => {
    // High energy: darker (thick recast layer, oxidation)
    // Low energy: lighter (minimal recast, clean surface)
    if (energy > 15) return "#3a3a3a"
    if (energy > 8) return "#4a4a4a"
    if (energy > 4) return "#6a6a6a"
    return "#8a8a8a"
  }, [energy])
  
  // Animate subtle surface scanning effect
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle rotation for better view
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
    }
  })
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 10, 256, 256]} />
      <meshStandardMaterial
        ref={materialRef}
        color={surfaceColor}
        displacementMap={displacementTexture}
        displacementScale={energy > 15 ? 1.5 : energy > 8 ? 1.0 : energy > 4 ? 0.6 : 0.3}
        normalMap={normalTexture}
        normalScale={new THREE.Vector2(1, 1)}
        roughness={energy > 10 ? 0.9 : energy > 5 ? 0.7 : 0.5}
        metalness={energy > 10 ? 0.6 : energy > 5 ? 0.4 : 0.2}
      />
    </mesh>
  )
}

// Lighting setup for SEM-like appearance
function SEMLighting() {
  return (
    <>
      {/* Main key light (simulating SEM electron beam) */}
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      
      {/* Fill light from opposite side */}
      <directionalLight position={[-3, 5, -3]} intensity={0.5} color="#b0c4de" />
      
      {/* Rim light to highlight surface features */}
      <spotLight position={[0, 10, -5]} intensity={0.8} angle={0.5} penumbra={0.5} />
      
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.3} />
    </>
  )
}

export default function SEMVisualizer({ parameters }: SEMVisualizerProps) {
  const energy = calculateDischargeEnergy(parameters)
  const analysis = analyzeSurfaceCondition(energy)
  
  const severityColors = {
    critical: "border-red-500/50 bg-red-950/20",
    high: "border-orange-500/50 bg-orange-950/20",
    medium: "border-yellow-500/50 bg-yellow-950/20",
    low: "border-green-500/50 bg-green-950/20"
  }
  
  const severityTextColors = {
    critical: "text-red-400",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-green-400"
  }
  
  return (
    <div className="relative w-full h-[600px] bg-background rounded-lg overflow-hidden border border-border">
      {/* 3D Canvas */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 8, 8]} fov={50} />
        <SEMLighting />
        <SEMSurface energy={energy} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Grid for scale reference */}
        <gridHelper args={[20, 20, "#333333", "#1a1a1a"]} position={[0, -1, 0]} />
      </Canvas>
      
      {/* Overlay UI Card */}
      <Card className={`absolute top-4 right-4 w-80 border-2 ${severityColors[analysis.severity as keyof typeof severityColors]} backdrop-blur-sm`}>
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">SEM Surface Analysis</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Magnification:</span>
              <span className="font-mono text-accent">500×</span>
            </div>
          </div>
          
          {/* Discharge Energy */}
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-xs text-muted-foreground">Discharge Energy:</span>
            <span className={`text-lg font-bold ${severityTextColors[analysis.severity as keyof typeof severityTextColors]}`}>
              {energy.toFixed(2)}
            </span>
          </div>
          
          {/* Condition */}
          <div>
            <div className={`text-sm font-semibold ${severityTextColors[analysis.severity as keyof typeof severityTextColors]}`}>
              {analysis.condition}
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {analysis.description}
            </p>
          </div>
          
          {/* Surface Roughness */}
          <div className="bg-background/50 rounded p-2">
            <div className="text-xs text-muted-foreground">Surface Roughness (Ra)</div>
            <div className="text-sm font-semibold text-foreground mt-0.5">
              {analysis.roughness}
            </div>
          </div>
          
          {/* Surface Features */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">Observable Features:</div>
            <div className="space-y-1">
              {analysis.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    analysis.severity === 'critical' ? 'bg-red-500' :
                    analysis.severity === 'high' ? 'bg-orange-500' :
                    analysis.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <span className="text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Parameter Reference */}
          <div className="pt-2 border-t border-border/50 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ton (Pulse On):</span>
              <span className="font-mono text-foreground">{parameters.pulseOnTime} µs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toff (Pulse Off):</span>
              <span className="font-mono text-foreground">{parameters.pulseOffTime} µs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ip (Current):</span>
              <span className="font-mono text-foreground">{parameters.current} A</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Bottom Info Bar */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Use mouse to <span className="text-foreground font-medium">orbit</span>, 
          <span className="text-foreground font-medium"> zoom</span>, and 
          <span className="text-foreground font-medium"> pan</span> around the surface
        </p>
      </div>
    </div>
  )
}
