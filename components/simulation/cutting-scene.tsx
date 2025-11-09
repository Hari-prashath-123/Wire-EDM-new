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
import { extend } from '@react-three/fiber';
import { PointsMaterial } from 'three';
extend({ PointsMaterial });
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Line, Cylinder, Box as DreiBox } from "@react-three/drei"
import * as THREE from "three"

// Types
import type { ShapeData, Point2D } from './types'
import type { EDMParameters } from "@/components/simulation/types"

interface SceneProps {
  shapeData?: ShapeData | null
  isRunning: boolean
  cuttingSpeed: number
  cuttingMethod: string
  parameters: EDMParameters
  material: string
}

function CuttingPath({ points }: { points: Point2D[] }) {
  const pathPoints = useMemo(() => {
    // Points come in world space matching workpiece X/Y. Place them on the top surface z=5.
    return points.map(p => new THREE.Vector3(p.x, p.y, 5));
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

function CuttingTool({ points, isRunning, cuttingSpeed, cuttingMethod, parameters, material, onToolMove }: { points: Point2D[]; isRunning: boolean; cuttingSpeed: number; cuttingMethod: string; parameters: EDMParameters; material: string; onToolMove?: (position: THREE.Vector3) => void }) {
  const toolRef = useRef<THREE.Group>(null!);
  const [progress, setProgress] = useState(0);
  const visuals = useMemo(() => getMethodVisuals(cuttingMethod), [cuttingMethod]);

  const pathVectors = useMemo(() => points.map(p => new THREE.Vector3(p.x, p.y, 5)), [points]);

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
        if (onToolMove) onToolMove(initialPos);
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
        if (onToolMove) onToolMove(newPosition);
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
      {/* Render the tool: orient along Z so the tip sits on the path plane */}
      <mesh position={[0, 0, 0]}>
        {cuttingMethod === 'cnc-milling' ? (
          <Cylinder
            args={[visuals.toolWidth, visuals.toolWidth, 10, 32]}
            position={[0, 0, 5]} // tip at z=0, height along +Z
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial color={visuals.toolColor} />
          </Cylinder>
        ) : (
          <Cylinder
            args={[visuals.toolWidth, visuals.toolWidth, 12, 16]}
            position={[0, 0, 6]} // base at z=0, wire rises along +Z
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color={visuals.toolColor}
              emissive={cuttingMethod === 'laser-cutting' ? visuals.toolColor : '#000000'}
              emissiveIntensity={cuttingMethod === 'laser-cutting' ? 2 : 0}
            />
          </Cylinder>
        )}
      </mesh>

      {/* Render fluid effect around the contact point */}
      {visuals.showFluid && isRunning && (
        <Cylinder
          args={[visuals.toolWidth * 1.5, visuals.toolWidth * 1.5, 0.2]}
          position={[0, 0, 0.1]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial color={visuals.fluidColor} transparent opacity={0.3} />
        </Cylinder>
      )}
    </group>
  );
}

function SparkParticles({ position, color, show }: { position: THREE.Vector3, color: string, show: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const workpieceSurfaceZ = 5;
  const particlePool = useMemo(() => new Array(800).fill(0).map(() => ({
    position: new THREE.Vector3(1000, 1000, 1000),
    velocity: new THREE.Vector3(),
    life: 0,
    maxLife: 60,
  })), []);
  const positions = useMemo(() => new Float32Array(800 * 3), []);
  const sizes = useMemo(() => new Float32Array(800), []);
  let particleIndex = 0;

  useFrame(() => {
    if (!pointsRef.current) return;

    if (!show) {
      let needsUpdate = false;
      for (let i = 0; i < particlePool.length; i++) {
        if (particlePool[i].life > 0) {
          particlePool[i].life = 0;
          positions[i * 3] = 1000;
          positions[i * 3 + 1] = 1000;
          positions[i * 3 + 2] = 1000;
          sizes[i] = 0;
          needsUpdate = true;
        }
      }
      if (needsUpdate) {
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.geometry.attributes.size.needsUpdate = true;
      }
      return;
    }
    if (!position) return;
    for (let i = 0; i < particlePool.length; i++) {
      const particle = particlePool[i];
      if (particle.life > 0) {
        particle.position.add(particle.velocity);
        particle.velocity.z -= 0.004;
        particle.velocity.multiplyScalar(0.97);
        particle.life -= 1;
        sizes[i] = Math.max(0, (particle.life / particle.maxLife) * 0.2);
        if (particle.position.z < workpieceSurfaceZ) {
          particle.position.z = workpieceSurfaceZ;
          particle.velocity.z *= -0.3;
          particle.velocity.x *= 0.5;
          particle.velocity.y *= 0.5;
        }
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;
      } else {
        sizes[i] = 0;
      }
    }
    if (Math.random() > 0.3) {
      const particle = particlePool[particleIndex];
      particle.position.copy(position);
      const spread = 0.5;
      particle.velocity.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() * 0.8) * spread
      );
      particle.life = particle.maxLife;
      particleIndex = (particleIndex + 1) % particlePool.length;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        color={color}
        size={1}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        vertexColors={false}
      />
    </points>
  );
}

export default function CuttingScene({ shapeData = null, isRunning, cuttingSpeed, cuttingMethod, parameters, material }: SceneProps) {
  const points = useMemo(() => {
    const defaultPoints = [
      { x: -40, y: -30 }, { x: 40, y: -30 }, { x: 40, y: 30 }, { x: -40, y: 30 }, { x: -40, y: -30 },
    ];
    if (shapeData && 'type' in shapeData) {
      if ((shapeData.type === 'drawn' || shapeData.type === 'coordinates') && Array.isArray((shapeData as any).points) && (shapeData as any).points.length > 1) {
        return (shapeData as any).points as { x: number; y: number }[]; // Use provided world-space points
      }
    }
    // Fallback to a built-in rectangle
    return defaultPoints.map(p => ({ x: p.x / 5, y: p.y / 5 }));
  }, [shapeData]);

  const [toolPosition, setToolPosition] = useState(new THREE.Vector3(0, 0, 0));

  return (
    <div style={{ width: "100%", height: 400 }}>
  <Canvas camera={{ position: [0, -70, 40], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        {/* Workpiece (box) */}
        <DreiBox args={[100, 80, 10]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#64748b" />
        </DreiBox>

        <CuttingPath points={points} />
        <CuttingTool
          points={points}
          isRunning={isRunning}
          cuttingSpeed={cuttingSpeed}
          cuttingMethod={cuttingMethod}
          parameters={parameters}
          material={material}
          onToolMove={setToolPosition}
        />
        <SparkParticles
          position={new THREE.Vector3(toolPosition.x, toolPosition.y, toolPosition.z)}
          color={getMethodVisuals(cuttingMethod).sparkColor}
          show={isRunning && getMethodVisuals(cuttingMethod).showSparks}
        />

        <OrbitControls />
      </Canvas>
    </div>
  );
}
