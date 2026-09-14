'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Floating particle cluster — lightweight ambient 3D background
function AmbientParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 320;

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Spread across a wide thin plane behind the UI
      positions[i * 3]     = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
      speeds[i] = 0.12 + Math.random() * 0.18;
    }
    return { positions, speeds };
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) + speeds[i] * 0.008;
      // Wrap at top
      pos.setY(i, y > 6.5 ? -6.5 : y);
      // Gentle horizontal drift
      const x = pos.getX(i) + Math.sin(t * 0.3 + i) * 0.002;
      pos.setX(i, x);
    }
    pos.needsUpdate = true;
    meshRef.current.rotation.z = Math.sin(t * 0.05) * 0.04;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#7C93FF"
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Spinning torus ring — subtle idle background accent
function IdleRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * 0.18;
    ref.current.rotation.y = t * 0.09;
    ref.current.rotation.z = t * 0.06;
  });
  return (
    <mesh ref={ref} position={[9, -2, -3]}>
      <torusGeometry args={[2.4, 0.06, 16, 80]} />
      <meshBasicMaterial color="#7C93FF" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// Slowly rotating icosahedron wireframe
function WireIco() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * 0.08;
    ref.current.rotation.y = t * 0.13;
  });
  return (
    <mesh ref={ref} position={[-9, 2, -4]}>
      <icosahedronGeometry args={[2.2, 1]} />
      <meshBasicMaterial color="#F2A65A" wireframe transparent opacity={0.15} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export function DashboardBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        onCreated={({ gl }) => gl.setClearColor('#10142B', 1)}
      >
        <AmbientParticles />
        <IdleRing />
        <WireIco />
      </Canvas>
    </div>
  );
}
