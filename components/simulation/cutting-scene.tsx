"use client"
// 1. ADD THIS HELPER FUNCTION
function getMaterialColor(materialName: string): string {
  switch (materialName?.toLowerCase()) {
    case "aluminum":
      return "#B0B0B0" // Light gray
    case "steel":
      return "#7A7A7A" // Darker gray
    case "copper":
      return "#B87333" // Coppery brown
    case "titanium":
      return "#878681" // Grayish
    case "d2 tool steel":
      return "#64748b" // Default slate gray
    default:
      return "#64748b" // Default slate gray
  }
}

function getMethodVisuals(cuttingMethod: string) {
  switch (cuttingMethod) {
    case "wire-edm":
      return {
        toolColor: "#fbbf24",
        sparkColor: "#ef4444",
        toolWidth: 0.1,
        showSparks: true,
        showFluid: true,
        fluidColor: "#3b82f6",
      }
    case "water-jet":
      return {
        toolColor: "#06b6d4",
        sparkColor: "#ffffff",
        toolWidth: 0.2,
        showSparks: true,
        showFluid: true,
        fluidColor: "#06b6d4",
      }
    case "laser-cutting":
      return {
        toolColor: "#dc2626",
        sparkColor: "#fbbf24",
        toolWidth: 0.15,
        showSparks: true,
        showFluid: false,
        fluidColor: "red",
      }
    case "cnc-milling":
      return {
        toolColor: "#94a3b8",
        sparkColor: "#f59e0b",
        toolWidth: 4,
        showSparks: true,
        showFluid: false,
        fluidColor: "gray",
      }
    default:
      return {
        toolColor: "#fbbf24",
        sparkColor: "#ef4444",
        toolWidth: 0.1,
        showSparks: true,
        showFluid: true,
        fluidColor: "#3b82f6",
      }
  }
}

import { useRef, useMemo, useEffect, useState } from "react"
import CutoutShape from "./CutoutShape"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Cylinder, Box as DreiBox } from "@react-three/drei"
import * as THREE from "three"

// Types
import type { ShapeData, Point2D } from "./types"
import type { EDMParameters } from "@/components/simulation/types"

export interface CuttingSceneProps extends SceneProps {
  showCutout?: boolean
}

interface SceneProps {
  shapeData?: ShapeData | null
  isRunning: boolean
  cuttingSpeed: number
  cuttingMethod: string
  parameters: EDMParameters
  material: string
  onLoop?: () => void
  materialThickness?: number
}

function CuttingPath({ points, materialThickness = 10 }: { points: Point2D[]; materialThickness?: number }) {
  const pathPoints = useMemo(() => {
    if (!points || points.length < 2) {
      console.log("[v0] CuttingPath: Invalid points", points)
      return []
    }

    const validPoints = points
      .filter((p) => p && typeof p.x === "number" && typeof p.y === "number" && !isNaN(p.x) && !isNaN(p.y))
      .map((p) => new THREE.Vector3(p.x, p.y, materialThickness / 2))

    if (validPoints.length < 2) {
      console.log("[v0] CuttingPath: Not enough valid points after filtering")
      return []
    }

    console.log("[v0] CuttingPath: Generated", validPoints.length, "valid points")

    const allFinite = validPoints.every((p) => isFinite(p.x) && isFinite(p.y) && isFinite(p.z))
    if (!allFinite) {
      console.log("[v0] CuttingPath: Some points have non-finite values")
      return []
    }

    return validPoints
  }, [points, materialThickness])

  const lineGeometry = useMemo(() => {
    try {
      const geometry = new THREE.BufferGeometry()
      if (pathPoints.length === 0) return null
      const positions = new Float32Array(pathPoints.length * 3 + 3)
      pathPoints.forEach((point, i) => {
        positions[i * 3] = point.x
        positions[i * 3 + 1] = point.y
        positions[i * 3 + 2] = point.z
      })
      positions[pathPoints.length * 3] = pathPoints[0].x
      positions[pathPoints.length * 3 + 1] = pathPoints[0].y
      positions[pathPoints.length * 3 + 2] = pathPoints[0].z

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      return geometry
    } catch (error) {
      console.error("[v0] CuttingPath: Error creating geometry:", error)
      return null
    }
  }, [pathPoints])

  if (pathPoints.length < 2 || !lineGeometry) {
    return null
  }

  console.log("[v0] CuttingPath: Rendering line with", pathPoints.length, "points")

  return (
    <group>
      <lineSegments args={[lineGeometry]}>
        <lineBasicMaterial color="#ff0080" linewidth={3} />
      </lineSegments>
    </group>
  )
}

function CuttingTool({
  points,
  isRunning,
  cuttingSpeed,
  cuttingMethod,
  parameters,
  material,
  onToolMove,
  onLoop,
  materialThickness = 10,
}: {
  points: Point2D[]
  isRunning: boolean
  cuttingSpeed: number
  cuttingMethod: string
  parameters: EDMParameters
  material: string
  onToolMove?: (position: THREE.Vector3) => void
  onLoop?: () => void
  materialThickness?: number
}) {
  const toolRef = useRef<THREE.Group>(null!)
  const [progress, setProgress] = useState(0)
  const [finished, setFinished] = useState(false)
  const visuals = useMemo(() => getMethodVisuals(cuttingMethod), [cuttingMethod])

  const pathVectors = useMemo(() => {
    if (!points || points.length < 2) return []
    return points
      .filter((p) => p && typeof p.x === "number" && typeof p.y === "number" && !isNaN(p.x) && !isNaN(p.y))
      .map((p) => new THREE.Vector3(p.x, p.y, materialThickness / 2))
  }, [points, materialThickness])

  const totalPathLength = useMemo(() => {
    let length = 0
    for (let i = 0; i < pathVectors.length - 1; i++) {
      length += pathVectors[i].distanceTo(pathVectors[i + 1])
    }
    return length
  }, [pathVectors])

  // Reset progress when points change (new shape selected)
  useEffect(() => {
    setProgress(0)
    setFinished(false)
  }, [points])

  useFrame((_, delta) => {
    if (!isRunning || pathVectors.length < 2 || totalPathLength === 0) {
      if (progress !== 0 && !isRunning) setProgress(0)
      if (finished) setFinished(false)
      // Reset position when not running
      if (toolRef.current) {
        const initialPos = pathVectors.length > 0 ? pathVectors[0] : new THREE.Vector3(0, 0, 15)
        toolRef.current.position.set(initialPos.x, initialPos.y, initialPos.z)
        if (onToolMove) onToolMove(initialPos)
      }
      return
    }

    if (finished) return

    // Use total path length to make speed consistent
    const newProgress = progress + delta * (cuttingSpeed / 100) * 2 // Adjusted speed factor
    if (newProgress >= totalPathLength) {
      setProgress(totalPathLength)
      setFinished(true)
      if (typeof onLoop === "function") {
        onLoop()
      }
      return
    }
    setProgress(newProgress)

    const targetLength = newProgress
    let currentLength = 0
    for (let i = 0; i < pathVectors.length - 1; i++) {
      const segmentStart = pathVectors[i]
      const segmentEnd = pathVectors[i + 1]
      const segmentLength = segmentStart.distanceTo(segmentEnd)
      if (currentLength + segmentLength >= targetLength) {
        const segmentProgress = (targetLength - currentLength) / segmentLength
        const newPosition = new THREE.Vector3().lerpVectors(segmentStart, segmentEnd, segmentProgress)
        toolRef.current.position.set(newPosition.x, newPosition.y, newPosition.z)
        if (onToolMove) onToolMove(newPosition)
        if (cuttingMethod === "cnc-milling" && toolRef.current.children[0]) {
          toolRef.current.children[0].rotation.z += 0.5 // Spin the tool
        }
        return
      }
      currentLength += segmentLength
    }
  })

  if (finished) return null
  return (
    <group ref={toolRef}>
      {/* Render the tool: visually distinct for each method */}
      <mesh position={[0, 0, 0]}>
        {/* Wire EDM: glowing wire, animated sparks, swirling fluid */}
        {cuttingMethod === "wire-edm" && (
          <>
            <Cylinder
              args={[visuals.toolWidth, visuals.toolWidth, 12, 32]}
              position={[0, 0, 6]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial color={visuals.toolColor} emissive={visuals.toolColor} emissiveIntensity={1.5} />
            </Cylinder>
            {/* Swirling fluid */}
            {isRunning && (
              <Cylinder
                args={[visuals.toolWidth * 2, visuals.toolWidth * 2, 0.3]}
                position={[0, 0, 0.2]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <meshStandardMaterial color={visuals.fluidColor} transparent opacity={0.4} />
              </Cylinder>
            )}
          </>
        )}
        {/* Water Jet: animated water spray, splash effect */}
        {cuttingMethod === "water-jet" && (
          <>
            <Cylinder
              args={[visuals.toolWidth, visuals.toolWidth, 10, 32]}
              position={[0, 0, 5]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial color={visuals.toolColor} />
            </Cylinder>
            {/* Water spray effect */}
            {isRunning && (
              <Cylinder
                args={[visuals.toolWidth * 2.5, visuals.toolWidth * 2.5, 0.4]}
                position={[0, 0, 0.2]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <meshStandardMaterial color={visuals.fluidColor} transparent opacity={0.5} />
              </Cylinder>
            )}
          </>
        )}
        {/* Laser Cutting: animated laser beam, glow, heat distortion */}
        {cuttingMethod === "laser-cutting" && (
          <>
            <Cylinder
              args={[visuals.toolWidth, visuals.toolWidth, 12, 16]}
              position={[0, 0, 6]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial color={visuals.toolColor} emissive={visuals.toolColor} emissiveIntensity={2} />
            </Cylinder>
            {/* Laser beam effect */}
            {isRunning && (
              <mesh position={[0, 0, 6]}>
                <cylinderGeometry args={[0.03, 0.03, 8, 16]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
              </mesh>
            )}
          </>
        )}
        {/* CNC Milling: rotating tool, chip particles */}
        {cuttingMethod === "cnc-milling" && (
          <>
            <Cylinder
              args={[visuals.toolWidth, visuals.toolWidth, 10, 32]}
              position={[0, 0, 5]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial color={visuals.toolColor} />
            </Cylinder>
            {/* Toolpath highlight (subtle) */}
            {isRunning && (
              <Cylinder
                args={[visuals.toolWidth * 1.2, visuals.toolWidth * 1.2, 0.2]}
                position={[0, 0, 0.1]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <meshStandardMaterial color="#f59e0b" transparent opacity={0.2} />
              </Cylinder>
            )}
          </>
        )}
      </mesh>
    </group>
  )
}

function SparkParticles({
  position,
  color,
  show,
  materialThickness = 10,
}: { position: THREE.Vector3; color: string; show: boolean; materialThickness?: number }) {
  const pointsRef = useRef<THREE.Points>(null!)
  const workpieceSurfaceZ = materialThickness / 2
  const particlePool = useMemo(
    () =>
      new Array(800).fill(0).map(() => ({
        position: new THREE.Vector3(1000, 1000, 1000),
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 60,
      })),
    [],
  )

  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const positionAttributeRef = useRef<THREE.BufferAttribute | null>(null)
  const sizeAttributeRef = useRef<THREE.BufferAttribute | null>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(800 * 3)
    for (let i = 0; i < 800; i++) {
      arr[i * 3] = 1000
      arr[i * 3 + 1] = 1000
      arr[i * 3 + 2] = 1000
    }
    return arr
  }, [])

  const sizes = useMemo(() => {
    const arr = new Float32Array(800)
    arr.fill(0)
    return arr
  }, [])

  let particleIndex = 0

  useEffect(() => {
    if (!pointsRef.current) return
    try {
      const geometry = pointsRef.current.geometry
      if (!geometry) return
      if (!geometry.attributes.position) {
        const posAttr = new THREE.BufferAttribute(positions, 3)
        geometry.setAttribute("position", posAttr)
        positionAttributeRef.current = posAttr
      }
      if (!geometry.attributes.size) {
        const sizeAttr = new THREE.BufferAttribute(sizes, 1)
        geometry.setAttribute("size", sizeAttr)
        sizeAttributeRef.current = sizeAttr
      }
    } catch (error) {
      console.error("[v0] SparkParticles: Error initializing geometry:", error)
    }
  }, [positions, sizes])

  useFrame(() => {
    if (!pointsRef.current) return
    const geometry = pointsRef.current.geometry
    if (!geometry) return

    const posAttr = positionAttributeRef.current || (geometry.attributes.position as THREE.BufferAttribute)
    const sizeAttr = sizeAttributeRef.current || (geometry.attributes.size as THREE.BufferAttribute)

    if (!posAttr || !sizeAttr) return

    if (!show) {
      let needsUpdate = false
      for (let i = 0; i < particlePool.length; i++) {
        if (particlePool[i].life > 0) {
          particlePool[i].life = 0
          positions[i * 3] = 1000
          positions[i * 3 + 1] = 1000
          positions[i * 3 + 2] = 1000
          sizes[i] = 0
          needsUpdate = true
        }
      }
      if (needsUpdate) {
        posAttr.needsUpdate = true
        sizeAttr.needsUpdate = true
      }
      return
    }
    if (!position) return
    for (let i = 0; i < particlePool.length; i++) {
      const particle = particlePool[i]
      if (particle.life > 0) {
        particle.position.add(particle.velocity)
        particle.velocity.z -= 0.004
        particle.velocity.multiplyScalar(0.97)
        particle.life -= 1
        sizes[i] = Math.max(0, (particle.life / particle.maxLife) * 0.2)
        if (particle.position.z < workpieceSurfaceZ) {
          particle.position.z = workpieceSurfaceZ
          particle.velocity.z *= -0.3
          particle.velocity.x *= 0.5
          particle.velocity.y *= 0.5
        }
        positions[i * 3] = particle.position.x
        positions[i * 3 + 1] = particle.position.y
        positions[i * 3 + 2] = particle.position.z
      } else {
        sizes[i] = 0
      }
    }
    if (Math.random() > 0.3) {
      const particle = particlePool[particleIndex]
      particle.position.copy(position)
      const spread = 0.5
      particle.velocity.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        Math.random() * 0.8 * spread,
      )
      particle.life = particle.maxLife
      particleIndex = (particleIndex + 1) % particlePool.length
    }
    posAttr.needsUpdate = true
    sizeAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial color={color} size={1} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  )
}

export default function CuttingScene({
  shapeData = null,
  isRunning,
  cuttingSpeed,
  cuttingMethod,
  parameters,
  material,
  onLoop,
  showCutout = false,
  materialThickness = 10,
}: CuttingSceneProps) {
  const points = useMemo(() => {
    console.log("[v0] CuttingScene: Processing shapeData:", shapeData)

    const defaultPoints = [
      { x: -4, y: -3 },
      { x: 4, y: -3 },
      { x: 4, y: 3 },
      { x: -4, y: 3 },
      { x: -4, y: -3 },
    ]

    if (!shapeData) {
      console.log("[v0] CuttingScene: Using default rectangle")
      return defaultPoints
    }

    // Handle different shape data types
    if (shapeData && "type" in shapeData && "points" in shapeData) {
      const shapePoints = (shapeData as any).points

      if (Array.isArray(shapePoints) && shapePoints.length > 1) {
        // Validate all points before returning
        const validPoints = shapePoints.filter(
          (p: any) => p && typeof p.x === "number" && typeof p.y === "number" && !isNaN(p.x) && !isNaN(p.y),
        )

        console.log(
          "[v0] CuttingScene: Valid points count:",
          validPoints.length,
          "from shape type:",
          (shapeData as any).type,
        )

        if (validPoints.length > 1) {
          return validPoints
        }
      }
    }

    console.log("[v0] CuttingScene: Fallback to default rectangle")
    return defaultPoints
  }, [shapeData])

  console.log("[v0] CuttingScene: Final points to render:", points.length, "points")

  const [toolPosition, setToolPosition] = useState(new THREE.Vector3(0, 0, 0))
  const [showCutoutState, setShowCutoutState] = useState(showCutout)

  // Reset showCutoutState when simulation starts
  useEffect(() => {
    if (isRunning) {
      setShowCutoutState(false)
    }
  }, [isRunning])

  // Reset cutting state when shape changes
  useEffect(() => {
    setShowCutoutState(false)
  }, [shapeData])

  // 2. ADD THIS useMemo
  const materialColor = useMemo(() => getMaterialColor(material), [material])

  return (
    <div style={{ width: "100%", height: 400 }}>
      <Canvas camera={{ position: [0, -70, 40], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        {showCutoutState ? (
          <>
            {/* 4. PASS THE PROP HERE */}
            <CutoutShape points={points} materialThickness={materialThickness} materialColor={materialColor} />
            <OrbitControls />
          </>
        ) : (
          <>
            <DreiBox args={[100, 80, materialThickness]} position={[0, 0, 0]}>
              {/* 3. USE THE COLOR HERE */}
              <meshStandardMaterial color={materialColor} />
            </DreiBox>
            <CuttingPath points={points} materialThickness={materialThickness} />
            <CuttingTool
              points={points}
              isRunning={isRunning}
              cuttingSpeed={cuttingSpeed}
              cuttingMethod={cuttingMethod}
              parameters={parameters}
              material={material}
              onToolMove={setToolPosition}
              onLoop={() => {
                setShowCutoutState(true)
                if (onLoop) onLoop()
              }}
              materialThickness={materialThickness}
            />
            <SparkParticles
              position={new THREE.Vector3(toolPosition.x, toolPosition.y, toolPosition.z)}
              color={getMethodVisuals(cuttingMethod).sparkColor}
              show={isRunning && getMethodVisuals(cuttingMethod).showSparks}
              materialThickness={materialThickness}
            />
            <OrbitControls />
          </>
        )}
      </Canvas>
    </div>
  )
}
