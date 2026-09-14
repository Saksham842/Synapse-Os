'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { QueenAllocationResult } from '../types';
import { RotateCcw, Compass } from 'lucide-react';

interface SwarmProps {
  allocations: QueenAllocationResult[];
  F_max: number;
  activeOption: string;
  onSelectOption: (option: string) => void;
}

// Department Color Palette
const QUEEN_COLORS: Record<string, string> = {
  Sales: '#7C93FF',
  Marketing: '#F2A65A',
  Operations: '#38EF7D',
  Intelligence: '#B088FF',
  Customer: '#00F0FF',
  'Back Office': '#FF6584',
  Deals: '#FFD166',
};

function getTrustColor(r: number) {
  if (r >= 0.85) return '#10B981';
  if (r >= 0.5) return '#F2A65A';
  return '#EF4444';
}

// ----------------------------------------------------
// 1. Central Nash Arbitrator Core
// ----------------------------------------------------
function CentralNashCore({
  F_max,
  totalUsed,
  isCoreFocused,
  onSelectCore,
}: {
  F_max: number;
  totalUsed: number;
  isCoreFocused: boolean;
  onSelectCore: () => void;
}) {
  const outerCageRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerCageRef.current) {
      outerCageRef.current.rotation.x = t * 0.22;
      outerCageRef.current.rotation.y = t * 0.32;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z = t * 0.35;
      ringRef1.current.rotation.x = Math.sin(t * 0.5) * 0.28;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = -t * 0.28;
      ringRef2.current.rotation.z = Math.cos(t * 0.4) * 0.28;
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.08;
      const baseScale = isCoreFocused ? 1.25 : 1.0;
      coreRef.current.scale.set(
        pulse * baseScale,
        pulse * baseScale,
        pulse * baseScale
      );
    }
  });

  return (
    <group position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onSelectCore(); }}>
      <pointLight color="#7C93FF" intensity={isCoreFocused ? 4.5 : 2.8} distance={14} />
      <pointLight color="#F2A65A" intensity={1.5} distance={9} />

      {/* Inner pulsating core */}
      <mesh ref={coreRef} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'default')}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="#7C93FF"
          emissive="#7C93FF"
          emissiveIntensity={isCoreFocused ? 1.8 : 1.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Geodesic wireframe cage */}
      <mesh ref={outerCageRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          color="#A3B4FF"
          wireframe
          transparent
          opacity={isCoreFocused ? 0.6 : 0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Rotating energy ring 1 */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.9, 0.035, 16, 64]} />
        <meshBasicMaterial
          color="#7C93FF"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Rotating energy ring 2 */}
      <mesh ref={ringRef2}>
        <torusGeometry args={[2.2, 0.025, 16, 64]} />
        <meshBasicMaterial
          color="#F2A65A"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Billboarded Core Info HTML */}
      <Html position={[0, -2.4, 0]} center distanceFactor={14}>
        <div className="pointer-events-none select-none text-center whitespace-nowrap">
          <div className="px-2.5 py-1 rounded-lg bg-[#141840]/90 border border-[#7C93FF]/40 backdrop-blur-md shadow-[0_0_15px_rgba(124,147,255,0.4)]">
            <div className="text-[10px] font-mono tracking-widest text-[#7C93FF] font-bold">
              NASH ARBITRATOR
            </div>
            <div className="text-[9px] font-mono text-[#9AA2C9]">
              {totalUsed.toFixed(1)} / {F_max} k-cyc/s
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ----------------------------------------------------
// 2. Individual 3D Queen Node
// ----------------------------------------------------
function SwarmQueenNode({
  alloc,
  pos,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  alloc: QueenAllocationResult;
  pos: THREE.Vector3;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  const baseColor = QUEEN_COLORS[alloc.name] || '#7C93FF';
  const trustColor = getTrustColor(alloc.reputation);

  // Scale: enlarged when selected or hovered
  const targetScale = useMemo(() => {
    const base = 0.52 + Math.min(0.4, (alloc.f_i / 15) * 0.4);
    return isSelected ? base * 1.45 : isHovered ? base * 1.25 : base;
  }, [alloc.f_i, isSelected, isHovered]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 10
      );
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (isSelected ? 0.3 : 0.6);
    }
    if (auraRef.current) {
      auraRef.current.rotation.x += delta * 0.25;
      auraRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group position={pos}>
      <pointLight
        color={baseColor}
        intensity={isSelected ? 3.0 : isHovered ? 2.0 : 0.8}
        distance={5}
      />

      {/* Main Interactive Sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          onHover(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          onHover(false);
        }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isSelected ? 1.6 : isHovered ? 1.2 : 0.65}
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Trust ring around node */}
      <mesh ref={ringRef}>
        <torusGeometry args={[targetScale * 1.65, 0.04, 16, 48]} />
        <meshBasicMaterial
          color={trustColor}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Wire Aura for active or hovered node */}
      {(isSelected || isHovered) && (
        <mesh ref={auraRef}>
          <icosahedronGeometry args={[targetScale * 2.2, 1]} />
          <meshBasicMaterial
            color={baseColor}
            wireframe
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Floating 3D Label & Status Badge */}
      <Html position={[0, targetScale * 1.8 + 0.45, 0]} center distanceFactor={14}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`cursor-pointer transition-all duration-300 select-none text-center px-2.5 py-1.5 rounded-xl border backdrop-blur-md shadow-lg ${
            isSelected
              ? 'bg-[#1B2154]/95 border-[#7C93FF] ring-2 ring-[#7C93FF]/50 scale-110 shadow-[0_0_20px_rgba(124,147,255,0.4)]'
              : 'bg-[#141840]/85 border-[#7C93FF]/25 hover:border-[#7C93FF]/60 hover:scale-105'
          }`}
          style={{ minWidth: '95px' }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shadow-[0_0_6px]"
              style={{ backgroundColor: baseColor, boxShadow: `0 0 8px ${baseColor}` }}
            />
            <span className="text-[11px] font-serif font-bold text-white tracking-wide">
              {alloc.name}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-1 text-[9px] font-mono">
            <span className="text-[#7C93FF] font-bold">{alloc.f_i.toFixed(1)}k</span>
            <span
              className="px-1 rounded text-[8px] font-semibold"
              style={{
                color: trustColor,
                backgroundColor: `${trustColor}25`,
              }}
            >
              R:{alloc.reputation.toFixed(2)}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ----------------------------------------------------
// 3. Flowing 3D Particle Packets along Conduits
// ----------------------------------------------------
function FlowingPacketConduits({
  allocations,
  deptPositions,
  isSlowed,
}: {
  allocations: QueenAllocationResult[];
  deptPositions: Record<string, THREE.Vector3>;
  isSlowed: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const totalPackets = 120;

  const packetSetup = useMemo(() => {
    const count = allocations.length;
    if (count === 0) return null;

    const positions = new Float32Array(totalPackets * 3);
    const colors = new Float32Array(totalPackets * 3);
    const offsets = new Float32Array(totalPackets);
    const speeds = new Float32Array(totalPackets);
    const targetQueens: string[] = [];

    allocations.forEach((alloc, qIdx) => {
      const packetsPerQueen = Math.floor(totalPackets / count);
      const qColor = new THREE.Color(QUEEN_COLORS[alloc.name] || '#7C93FF');

      for (let i = 0; i < packetsPerQueen; i++) {
        const idx = qIdx * packetsPerQueen + i;
        offsets[idx] = i / packetsPerQueen + Math.random() * 0.1;
        speeds[idx] = 0.25 + (alloc.f_i / 15) * 0.65;
        targetQueens[idx] = alloc.name;

        colors[idx * 3] = qColor.r;
        colors[idx * 3 + 1] = qColor.g;
        colors[idx * 3 + 2] = qColor.b;
      }
    });

    return { positions, colors, offsets, speeds, targetQueens };
  }, [allocations]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !packetSetup) return;
    const t = clock.getElapsedTime() * (isSlowed ? 0.35 : 1.0);
    const posAttr = pointsRef.current.geometry.attributes.position;

    for (let i = 0; i < totalPackets; i++) {
      const qName = packetSetup.targetQueens[i];
      const targetPos = deptPositions[qName];
      if (!targetPos) continue;

      const prog = (t * packetSetup.speeds[i] + packetSetup.offsets[i]) % 1;
      const arcHeight = Math.sin(prog * Math.PI) * 0.5;

      const x = targetPos.x * prog;
      const y = targetPos.y * prog + arcHeight;
      const z = targetPos.z * prog;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  });

  if (!packetSetup) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[packetSetup.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[packetSetup.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ----------------------------------------------------
// 4. Static / Dynamic Lattice Web Lines
// ----------------------------------------------------
function SwarmWebLines({
  allocations,
  deptPositions,
}: {
  allocations: QueenAllocationResult[];
  deptPositions: Record<string, THREE.Vector3>;
}) {
  const lineGeometry = useMemo(() => {
    const coords: number[] = [];
    const keys = allocations.map((a) => a.name);

    keys.forEach((key) => {
      const p = deptPositions[key];
      if (p) {
        coords.push(0, 0, 0, p.x, p.y, p.z);
      }
    });

    for (let i = 0; i < keys.length; i++) {
      const p1 = deptPositions[keys[i]];
      if (!p1) continue;
      for (let j = i + 1; j < keys.length; j++) {
        const p2 = deptPositions[keys[j]];
        if (!p2) continue;
        coords.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
    return geo;
  }, [allocations, deptPositions]);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial
        color="#7C93FF"
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// ----------------------------------------------------
// 5. Dynamic Camera Swoop & Swarm Deceleration Rig
// ----------------------------------------------------
function SwarmSceneRig({
  allocations,
  F_max,
  activeOption,
  onSelectOption,
}: SwarmProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredQueen, setHoveredQueen] = useState<string | null>(null);
  const { gl } = useThree();

  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.12, y: 0 });
  const currentRotSpeed = useRef(0.14);
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Compute 3D node positions
  const deptPositions = useMemo(() => {
    const radius = 5.2;
    const positions: Record<string, THREE.Vector3> = {};
    const n = allocations.length;

    allocations.forEach((alloc, idx) => {
      const angle = (idx / n) * Math.PI * 2 - Math.PI / 2;
      positions[alloc.name] = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.72,
        Math.sin(angle * 2) * 0.85
      );
    });

    return positions;
  }, [allocations]);

  const totalUsed = useMemo(() => {
    return allocations.reduce((acc, a) => acc + a.f_i, 0);
  }, [allocations]);

  // Determine if active option is a specific Queen or Core
  const isQueenSelected = allocations.some((a) => a.name === activeOption);
  const isCoreSelected = activeOption === 'core';
  const isAnalyticsView = ['benchmark', 'weights', 'stress'].includes(activeOption);

  // Target Camera Position & LookAt depending on selected option
  const { targetCamPos, targetLookAt, targetSpeed } = useMemo(() => {
    if (isQueenSelected && deptPositions[activeOption]) {
      const p = deptPositions[activeOption];
      // Swoop close to the Queen with an offset angle
      return {
        targetCamPos: new THREE.Vector3(p.x * 0.72 + 1.2, p.y * 0.72 + 0.8, 5.0),
        targetLookAt: new THREE.Vector3(p.x, p.y, p.z),
        targetSpeed: 0.018, // SWARM SLOWS DOWN!
      };
    }
    if (isCoreSelected) {
      return {
        targetCamPos: new THREE.Vector3(0, 0.6, 4.4),
        targetLookAt: new THREE.Vector3(0, 0, 0),
        targetSpeed: 0.03, // SWARM SLOWS DOWN!
      };
    }
    if (isAnalyticsView) {
      return {
        targetCamPos: new THREE.Vector3(-4.8, 3.4, 8.8),
        targetLookAt: new THREE.Vector3(0, 0, 0),
        targetSpeed: 0.04, // Dramatic tilted view behind the analytics
      };
    }
    // Default 'overview' / free roam
    return {
      targetCamPos: new THREE.Vector3(0, 1.2, 10.5),
      targetLookAt: new THREE.Vector3(0, 0, 0),
      targetSpeed: 0.14, // Lively standard rotation
    };
  }, [activeOption, isQueenSelected, isCoreSelected, isAnalyticsView, deptPositions]);

  // Pointer drag controls for manual orbit
  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      rotRef.current.y += dx * 0.005;
      rotRef.current.x += dy * 0.005;
      rotRef.current.x = Math.max(-0.65, Math.min(0.65, rotRef.current.x));
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl]);

  // Frame Loop: Smooth camera swoop + smooth rotation speed transition
  useFrame(({ camera }, delta) => {
    if (!groupRef.current) return;

    // 1. Dynamic Camera Swoop (lerp position and lookAt)
    camera.position.lerp(targetCamPos, delta * 3.2);
    currentLookAt.current.lerp(targetLookAt, delta * 3.8);
    camera.lookAt(currentLookAt.current);

    // 2. Smoothly adjust rotation speed: slows down when inspecting a node!
    currentRotSpeed.current = THREE.MathUtils.lerp(
      currentRotSpeed.current,
      targetSpeed,
      delta * 3.5
    );

    if (!isDraggingRef.current) {
      rotRef.current.y += delta * currentRotSpeed.current;
    }

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      rotRef.current.y,
      delta * 8
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      rotRef.current.x,
      delta * 8
    );
  });

  return (
    <group ref={groupRef}>
      {/* Central Nash Arbitrator Core */}
      <CentralNashCore
        F_max={F_max}
        totalUsed={totalUsed}
        isCoreFocused={isCoreSelected}
        onSelectCore={() => onSelectOption('core')}
      />

      {/* Connecting Web Conduits */}
      <SwarmWebLines allocations={allocations} deptPositions={deptPositions} />

      {/* Flowing Packets */}
      <FlowingPacketConduits
        allocations={allocations}
        deptPositions={deptPositions}
        isSlowed={isQueenSelected || isCoreSelected}
      />

      {/* Orbiting Queen Nodes */}
      {allocations.map((alloc) => {
        const pos = deptPositions[alloc.name] || new THREE.Vector3(0, 0, 0);
        return (
          <SwarmQueenNode
            key={alloc.name}
            alloc={alloc}
            pos={pos}
            isSelected={activeOption === alloc.name}
            isHovered={hoveredQueen === alloc.name}
            onSelect={() => onSelectOption(alloc.name)}
            onHover={(h) => setHoveredQueen(h ? alloc.name : null)}
          />
        );
      })}
    </group>
  );
}

// ----------------------------------------------------
// 6. Master Container with Interactive Options Deck
// ----------------------------------------------------
export default function Interactive3DSwarm({
  allocations,
  F_max,
  activeOption,
  onSelectOption,
}: SwarmProps) {
  const isQueenSelected = allocations.some((a) => a.name === activeOption);
  const isCoreSelected = activeOption === 'core';
  const isAnalyticsView = ['benchmark', 'weights', 'stress'].includes(activeOption);
  const isFocused = isQueenSelected || isCoreSelected;

  return (
    <div className="relative flex flex-col items-center bg-[rgba(16,20,52,0.85)] border border-[rgba(124,147,255,0.3)] rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-2xl group transition-all">
      {/* Hologram Scan Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(124,147,255,0.2) 0%, transparent 75%), linear-gradient(rgba(124,147,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,147,255,0.08) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        }}
      />

      {/* ── TOP INTERACTIVE OPTIONS SELECTOR BAR ─────────────── */}
      <div className="w-full z-10 flex flex-col gap-3 mb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-serif text-lg sm:text-xl text-white font-semibold tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C93FF] animate-ping inline-block" />
              Living 3D Swarm Topology
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              Select an option below to re-orient the 3D perspective, focus the camera, and reveal real-time swarm intelligence
            </p>
          </div>

          {/* Quick Camera Reset / Status Pill */}
          <div className="flex items-center gap-2">
            {isFocused && (
              <button
                onClick={() => onSelectOption('overview')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono bg-[#7C93FF]/20 border border-[#7C93FF] text-white hover:bg-[#7C93FF]/35 transition shadow-[0_0_12px_rgba(124,147,255,0.35)]"
              >
                <Compass className="w-3.5 h-3.5 text-[#7C93FF]" />
                <span>Reset to Swarm Orbit</span>
              </button>
            )}

            <span className="text-xs px-2.5 py-1 rounded-xl bg-[#141840] border border-[#7C93FF]/30 text-[#7C93FF] font-mono">
              F_max: {F_max} k-cyc
            </span>
          </div>
        </div>

        {/* ── SELECTABLE OPTIONS DECK (Department Queens & System Focus) ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* Swarm Overview Option */}
          <button
            onClick={() => onSelectOption('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeOption === 'overview'
                ? 'bg-[#7C93FF] text-white font-bold shadow-[0_0_14px_rgba(124,147,255,0.5)] border border-[#7C93FF]'
                : 'bg-[#141840]/90 text-[var(--text-muted)] border border-[#7C93FF]/20 hover:text-white hover:border-[#7C93FF]/40'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>✦ Swarm Orbit</span>
          </button>

          {/* Central Core Focus Option */}
          <button
            onClick={() => onSelectOption('core')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeOption === 'core'
                ? 'bg-[#7C93FF] text-white font-bold shadow-[0_0_14px_rgba(124,147,255,0.5)] border border-[#7C93FF]'
                : 'bg-[#141840]/90 text-[var(--text-muted)] border border-[#7C93FF]/20 hover:text-white hover:border-[#7C93FF]/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#7C93FF] animate-pulse" />
            <span>✦ Nash Core</span>
          </button>

          {/* Department Queens Options */}
          {allocations.map((alloc) => {
            const isSelected = activeOption === alloc.name;
            const qColor = QUEEN_COLORS[alloc.name] || '#7C93FF';
            return (
              <button
                key={alloc.name}
                onClick={() => onSelectOption(alloc.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'text-white font-bold border'
                    : 'bg-[#141840]/90 text-[var(--text-muted)] border border-[#7C93FF]/20 hover:text-white hover:border-[#7C93FF]/40'
                }`}
                style={{
                  backgroundColor: isSelected ? `${qColor}30` : undefined,
                  borderColor: isSelected ? qColor : undefined,
                  boxShadow: isSelected ? `0 0 16px ${qColor}60` : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shadow-[0_0_6px]"
                  style={{ backgroundColor: qColor }}
                />
                <span>{alloc.name} Queen</span>
                {isSelected && (
                  <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-white">
                    {alloc.f_i.toFixed(1)}k
                  </span>
                )}
              </button>
            );
          })}

          {/* System Analytics Options */}
          <div className="h-4 w-[1px] bg-[#7C93FF]/30 mx-1 shrink-0" />

          <button
            onClick={() => onSelectOption('benchmark')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
              activeOption === 'benchmark'
                ? 'bg-[#10B981] text-white font-bold shadow-[0_0_14px_rgba(16,185,129,0.5)] border border-[#10B981]'
                : 'bg-[#141840]/90 text-[var(--text-muted)] border border-[#7C93FF]/20 hover:text-white'
            }`}
          >
            ✦ Utility Benchmark
          </button>

          <button
            onClick={() => onSelectOption('weights')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
              activeOption === 'weights'
                ? 'bg-[#F2A65A] text-white font-bold shadow-[0_0_14px_rgba(242,166,90,0.5)] border border-[#F2A65A]'
                : 'bg-[#141840]/90 text-[var(--text-muted)] border border-[#7C93FF]/20 hover:text-white'
            }`}
          >
            ✦ Priority Weights
          </button>

          <button
            onClick={() => onSelectOption('stress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
              activeOption === 'stress'
                ? 'bg-[#EF4444] text-white font-bold shadow-[0_0_14px_rgba(239,68,68,0.5)] border border-[#EF4444]'
                : 'bg-[#141840]/90 text-[var(--text-muted)] border border-[#7C93FF]/20 hover:text-white'
            }`}
          >
            ✦ Byzantine Stress Test
          </button>
        </div>
      </div>

      {/* ── 3D WEBGL STAGE (SWOOPS & SLOWS DOWN ON SELECTION) ── */}
      <div className="relative w-full h-[460px] sm:h-[500px] select-none rounded-2xl overflow-hidden border border-[#7C93FF]/20 bg-[#0B0E20]/80 shadow-inner">
        <Canvas
          camera={{ position: [0, 1.2, 10.5], fov: 46 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={0.85} />
          <SwarmSceneRig
            allocations={allocations}
            F_max={F_max}
            activeOption={activeOption}
            onSelectOption={onSelectOption}
          />
        </Canvas>

        {/* Dynamic HUD Status Tag */}
        <div className="absolute top-3 left-4 pointer-events-none text-xs font-mono text-[#7C93FF] flex items-center gap-2 bg-[#10142B]/80 px-3 py-1 rounded-xl border border-[#7C93FF]/30 backdrop-blur-md">
          <span className={`w-2 h-2 rounded-full ${isFocused ? 'bg-[#F2A65A]' : 'bg-[#10B981]'} animate-pulse`} />
          <span>
            {isQueenSelected
              ? `ORIENTATION: FOCUSED ON ${activeOption.toUpperCase()} QUEEN // ROTATION DECELERATED`
              : isCoreSelected
              ? 'ORIENTATION: FOCUSED ON NASH ARBITRATOR CORE // HIGH TORUS DYNAMICS'
              : isAnalyticsView
              ? `ORIENTATION: ELEVATED ANALYTICAL PERSPECTIVE // ${activeOption.toUpperCase()}`
              : 'ORIENTATION: GLOBAL SWARM ORBIT // CONTINUOUS LATTICE FLOW'}
          </span>
        </div>

        {/* Drag Hint Footer */}
        <div className="absolute bottom-3 left-4 pointer-events-none text-[10px] font-mono text-[#9AA2C9]/80 flex items-center gap-2 bg-[#10142B]/70 px-2.5 py-1 rounded-lg border border-[#7C93FF]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7C93FF]" />
          <span>Drag to orbit camera in 3D · Click any node to focus &amp; inspect</span>
        </div>
      </div>
    </div>
  );
}
