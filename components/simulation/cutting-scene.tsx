"use client"

function getMethodVisuals(cuttingMethod: string) {
  switch (cuttingMethod) {
    case "wire-edm": return { toolColor: '#fbbf24', sparkColor: '#ef4444', toolWidth: 0.1, showSparks: true, showFluid: true, fluidColor: '#3b82f6' };
    case "water-jet": return { toolColor: '#06b6d4', sparkColor: '#ffffff', toolWidth: 0.2, showSparks: true, showFluid: true, fluidColor: '#06b6d4' };
    case "laser-cutting": return { toolColor: '#dc2626', sparkColor: '#fbbf24', toolWidth: 0.15, showSparks: true, showFluid: false, fluidColor: 'red' };
    case "cnc-milling": return { toolColor: '#94a3b8', sparkColor: '#f59e0b', toolWidth: 4, showSparks: true, showFluid: false, fluidColor: 'gray' };
    default: return { toolColor: '#fbbf24', sparkColor: '#ef4444', toolWidth: 0.1, showSparks: true, showFluid: true, fluidColor: '#3b82f6' };
  }
}

import React, { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Line, Cylinder, Box as DreiBox } from "@react-three/drei"
import * as THREE from "three"

// Types
import type { ShapeData, Point2D } from './types'

interface SceneProps {
  shapeData?: ShapeData | null
  isRunning: boolean
  cuttingSpeed: number
  cuttingMethod: string
}

function CuttingPath({ points }: { points: Point2D[] }) {
  const pathPoints = useMemo(() => {
    // Points are now pre-normalized, just convert to 3D
    return points.map(p => new THREE.Vector3(p.x, p.y, 5.1));
  }, [points]);

  if (pathPoints.length < 2) return null;

  return (
    <Line
      points={pathPoints}
      color="#f43f5e" // Use a bright pink/red
      lineWidth={2}
      dashed
      dashScale={5}
      gapSize={2}
      dashSize={3}
    />
  );
}

function CuttingTool({ points, isRunning, cuttingSpeed, cuttingMethod }: { points: Point2D[]; isRunning: boolean; cuttingSpeed: number; cuttingMethod: string }) {
  const toolRef = useRef<THREE.Group>(null!);
  const [progress, setProgress] = useState(0);
  const visuals = useMemo(() => getMethodVisuals(cuttingMethod), [cuttingMethod]);

    const pathVectors = useMemo(() => points.map(p => new THREE.Vector3(p.x, p.y, 5.1)), [points]);

  const totalPathLength = useMemo(() => {
    let length = 0;
    for (let i = 0; i < pathVectors.length - 1; i++) {
      length += pathVectors[i].distanceTo(pathVectors[i + 1]);
    }
    return length;
  }, [pathVectors]);

  useFrame((_, delta) => {
    if (!isRunning || pathVectors.length < 2 || totalPathLength === 0) {
      if (progress !== 0 && !isRunning) setProgress(0);
      // Reset position when not running
      if (toolRef.current) {
        const initialPos = pathVectors.length > 0 ? pathVectors[0] : new THREE.Vector3(0, 0, 15);
        toolRef.current.position.set(initialPos.x, initialPos.y, initialPos.z);
      }
      return;
    }

    // Use total path length to make speed consistent
    let newProgress = progress + (delta * (cuttingSpeed / 100) * 2); // Adjusted speed factor
    if (newProgress > totalPathLength) newProgress = 0; // Loop
    setProgress(newProgress);

    const targetLength = newProgress;
    let currentLength = 0;
    for (let i = 0; i < pathVectors.length - 1; i++) {
      const segmentStart = pathVectors[i];
      const segmentEnd = pathVectors[i + 1];
      const segmentLength = segmentStart.distanceTo(segmentEnd);
      if (currentLength + segmentLength >= targetLength) {
        const segmentProgress = (targetLength - currentLength) / segmentLength;
        const newPosition = new THREE.Vector3().lerpVectors(segmentStart, segmentEnd, segmentProgress);
        toolRef.current.position.set(newPosition.x, newPosition.y, newPosition.z);

        if (cuttingMethod === 'cnc-milling' && toolRef.current.children[0]) {
          toolRef.current.children[0].rotation.z += 0.5; // Spin the tool
        }
        return;
      }
      currentLength += segmentLength;
    }
  });

  return (
    <group ref={toolRef}>
      {/* Render the tool */}
      <mesh>
        {cuttingMethod === 'cnc-milling' ? (
          <Cylinder args={[visuals.toolWidth, visuals.toolWidth, 10, 32]} position={[0, 0, 5]}>
            <meshStandardMaterial color={visuals.toolColor} />
          </Cylinder>
        ) : (
          <Cylinder args={[visuals.toolWidth, visuals.toolWidth, 20, 16]} position={[0, 0, 10]}>
            <meshStandardMaterial color={visuals.toolColor} emissive={cuttingMethod === 'laser-cutting' ? visuals.toolColor : '#000000'} emissiveIntensity={cuttingMethod === 'laser-cutting' ? 2 : 0} />
          </Cylinder>
        )}
      </mesh>

      {/* Render fluid effect */}
      {visuals.showFluid && isRunning && (
        <Cylinder args={[visuals.toolWidth * 1.5, visuals.toolWidth * 1.5, 0.2]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color={visuals.fluidColor}
            transparent
            opacity={0.3}
          />
        </Cylinder>
      )}
      {/* Render sparks */}
      <SparkParticles
        position={new THREE.Vector3(0, 0, 0)}
        color={visuals.sparkColor}
        show={isRunning && visuals.showSparks}
      />
    </group>
  );
}

function SparkParticles({ position, color, show }: { position: THREE.Vector3 | null, color: string, show: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const bufferRef = useRef<THREE.BufferAttribute>(null!);

  const particlePool = useMemo(() =>
    new Array(300).fill(0).map(() => ({
      position: new THREE.Vector3(1000, 1000, 1000), // Start off-screen
      velocity: new THREE.Vector3(),
      life: 0,
    })),
  []);

  useFrame(() => {
    if (!show || !position || !bufferRef.current) return;

    let particleIndex = 0;
    const positions = bufferRef.current.array as Float32Array;

    // Update live particles
    for (const particle of particlePool) {
      if (particle.life > 0) {
        particle.position.add(particle.velocity);
        particle.velocity.y -= 0.002; // gravity
        particle.life -= 1;
      }
    }
    // Spawn new particles
    if (Math.random() > 0.3) {
      const particle = particlePool[particleIndex];
      particle.position.copy(position);
      const spread = 0.4;
      particle.velocity.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.2) * spread
      );
      particle.life = 40;
      particleIndex = (particleIndex + 1) % particlePool.length;
    }
    // Update geometry
    for (let i = 0; i < particlePool.length; i++) {
      const p = particlePool[i];
      if (p.life > 0) {
        positions[i * 3] = p.position.x;
        positions[i * 3 + 1] = p.position.y;
        positions[i * 3 + 2] = p.position.z;
      } else {
        positions[i * 3] = 1000;
        positions[i * 3 + 1] = 1000;
        positions[i * 3 + 2] = 1000;
      }
    }
    bufferRef.current.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={bufferRef}
          attach="attributes-position"
          count={particlePool.length}
          array={new Float32Array(particlePool.length * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.05} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function CuttingScene({ shapeData = null, isRunning, cuttingSpeed, cuttingMethod }: SceneProps) {
  const points = useMemo(() => {
    const defaultPoints = [
      { x: -40, y: -30 }, { x: 40, y: -30 }, { x: 40, y: 30 }, { x: -40, y: 30 }, { x: -40, y: -30 },
    ];
    if (shapeData?.type === 'drawn' && shapeData.points.length > 1) {
      return shapeData.points; // Use normalized points directly
    }
    // Scale the default points to match the normalized scale
    return defaultPoints.map(p => ({ x: p.x / 5, y: p.y / 5 }));
  }, [shapeData]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <Canvas camera={{ position: [0, -60, 80], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        {/* Workpiece (box) */}
        <DreiBox args={[100, 80, 10]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#64748b" />
        </DreiBox>

        <CuttingPath points={points} />
        <CuttingTool points={points} isRunning={isRunning} cuttingSpeed={cuttingSpeed} cuttingMethod={cuttingMethod} />

        <OrbitControls />
      </Canvas>
    </div>
  );
}
