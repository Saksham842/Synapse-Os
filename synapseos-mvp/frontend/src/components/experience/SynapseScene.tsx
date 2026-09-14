'use client';

import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSynapseStore, DEPARTMENTS_DATA } from '@/lib/store';
import { QueenAllocationResult } from '@/types';

// Helper easing function matching GSAP power3.out
function easePower3Out(t: number): number {
  return 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
}

// 7 Department Node Keys in clockwise order
const DEPT_KEYS = [
  'Sales',
  'Marketing',
  'Operations',
  'Intelligence',
  'Customer',
  'Back Office',
  'Deals'
];

function getTrustColor(rep: number) {
  if (rep >= 0.85) return '#10B981';
  if (rep >= 0.5) return '#F2A65A';
  return '#EF4444';
}

// Generate circular soft glow point texture
function createGlowPointTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(124, 147, 255, 0.9)');
    gradient.addColorStop(0.6, 'rgba(124, 147, 255, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export interface SynapseSceneProps {
  allocations?: QueenAllocationResult[];
  activeOption?: string;
  onSelectOption?: (option: string) => void;
  isInDashboard?: boolean;
}

export const SynapseScene: React.FC<SynapseSceneProps> = ({
  allocations = [],
  activeOption = 'overview',
  onSelectOption = () => {},
  isInDashboard = false,
}) => {
  const { scrollProgress, activeNode, bloomedDepartment, setActiveNode } = useSynapseStore();
  const { camera } = useThree();

  const glowTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createGlowPointTexture();
  }, []);

  const [hoveredNodeName, setHoveredNodeName] = useState<string | null>(null);

  // ----------------------------------------------------
  // SCENE 1: Big Bang Point Cloud (6,500 points)
  // ----------------------------------------------------
  const bigBangCount = 6500;
  const [bigBangPoints] = useMemo(() => {
    const positions = new Float32Array(bigBangCount * 3);
    for (let i = 0; i < bigBangCount; i++) {
      const y = 1 - (i / (bigBangCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = i * 2.3999632; // golden angle
      const noise = 0.85 + 0.3 * Math.sin(theta * 3) * Math.cos(y * 4) + 0.15 * Math.sin(theta * 7);

      positions[i * 3] = Math.cos(theta) * radiusAtY * noise;
      positions[i * 3 + 1] = y * noise;
      positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * noise;
    }
    return [positions];
  }, []);

  const bigBangPointsRef = useRef<THREE.Points>(null);
  const bigBangSeedRef   = useRef<THREE.Mesh>(null);

  // ----------------------------------------------------
  // SCENE 2: Constellation 7 Department Nodes & Lines
  // ----------------------------------------------------
  const deptPositions = useMemo(() => {
    // 4.1 radius gives generous padding inside 50% split viewports so nodes never get cropped
    const ringRadius = 4.1;
    const positions: Record<string, THREE.Vector3> = {};
    DEPT_KEYS.forEach((key, idx) => {
      const angle = (idx / DEPT_KEYS.length) * Math.PI * 2 - Math.PI / 2;
      positions[key] = new THREE.Vector3(
        Math.cos(angle) * ringRadius,
        Math.sin(angle) * ringRadius * 0.75,
        Math.sin(angle * 2) * 0.8
      );
    });
    return positions;
  }, []);

  // Web Lines between all node pairs + center
  const constellationLinePositions = useMemo(() => {
    const coords: number[] = [];
    const keys = DEPT_KEYS;
    keys.forEach((k) => {
      const pos = deptPositions[k];
      coords.push(0, 0, 0, pos.x, pos.y, pos.z);
    });
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const p1 = deptPositions[keys[i]];
        const p2 = deptPositions[keys[j]];
        coords.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }
    return new Float32Array(coords);
  }, [deptPositions]);

  // ----------------------------------------------------
  // SCENE 3: Departmental Bloom Satellites (18 nodes)
  // ----------------------------------------------------
  const currentDeptKey = DEPT_KEYS.includes(activeOption)
    ? activeOption
    : bloomedDepartment || 'Sales';

  const bloomSatellites = useMemo(() => {
    const count = 18;
    const sats = [];
    const currentDept = DEPARTMENTS_DATA[currentDeptKey] || DEPARTMENTS_DATA['Sales'];
    const workers = currentDept.workers;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.sin(i) * 0.3;
      const dist = 2.4 + (i % 3) * 1.3 + Math.sin(i * 1.7) * 0.8;
      const zOffset = Math.sin(i * 2.5) * 1.2;
      const isLead = i === 2;
      const isDrafter = i === 7;
      const isScorer = i === 12;
      const workerName = isLead && workers[0]
        ? workers[0].name
        : isDrafter && workers[1]
        ? workers[1].name
        : isScorer && workers[2]
        ? workers[2].name
        : null;

      sats.push({
        id: i,
        name: workerName,
        isNamedWorker: Boolean(workerName),
        offset: new THREE.Vector3(
          Math.cos(angle) * dist,
          Math.sin(angle) * dist * 0.8,
          zOffset
        ),
        scale: workerName ? 0.38 : 0.16 + (i % 3) * 0.05,
        color: workerName ? '#F2A65A' : '#7C93FF'
      });
    }
    return sats;
  }, [currentDeptKey]);

  const bloomLinePositions = useMemo(() => {
    const coords: number[] = [];
    bloomSatellites.forEach((sat) => {
      coords.push(0, 0, 0, sat.offset.x, sat.offset.y, sat.offset.z);
    });
    return new Float32Array(coords);
  }, [bloomSatellites]);

  // ----------------------------------------------------
  // SCENE 4: Synaptic Data Particles Streaming
  // ----------------------------------------------------
  const packetCount = 80;
  const packetLines = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    bloomSatellites.forEach((sat) => {
      lines.push({ start: sat.offset.clone(), end: new THREE.Vector3(0, 0, 0) });
    });
    DEPT_KEYS.forEach((k) => {
      lines.push({ start: deptPositions[k].clone(), end: new THREE.Vector3(0, 0, 0) });
    });
    return lines;
  }, [bloomSatellites, deptPositions]);

  const packetParticlesRef = useRef<THREE.Points>(null);
  const packetData = useMemo(() => {
    const positions = new Float32Array(packetCount * 3);
    const colors = new Float32Array(packetCount * 3);
    const speeds = new Float32Array(packetCount);
    const lineIndices = new Int32Array(packetCount);
    const offsets = new Float32Array(packetCount);

    const blue = new THREE.Color('#7C93FF');
    const amber = new THREE.Color('#F2A65A');

    for (let i = 0; i < packetCount; i++) {
      speeds[i] = 0.35 + Math.random() * 0.45;
      offsets[i] = Math.random();
      lineIndices[i] = i % packetLines.length;

      const c = i % 4 === 0 ? amber : blue;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors, speeds, lineIndices, offsets };
  }, [packetLines]);

  // ----------------------------------------------------
  // SCENE 5: Priority Wave Lattice (46 nodes)
  // ----------------------------------------------------
  const priorityNodes = useMemo(() => {
    const count = 46;
    const nodes = [];
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 4.6 + Math.sin(i * 1.5) * 0.3;
      nodes.push({
        pos: new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        ),
        id: i
      });
    }
    return nodes;
  }, []);

  const priorityLines = useMemo(() => {
    const coords: number[] = [];
    const maxDist = 3.2;
    for (let i = 0; i < priorityNodes.length; i++) {
      for (let j = i + 1; j < priorityNodes.length; j++) {
        const p1 = priorityNodes[i].pos;
        const p2 = priorityNodes[j].pos;
        if (p1.distanceTo(p2) < maxDist) {
          coords.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }
    return new Float32Array(coords);
  }, [priorityNodes]);

  const ribbonMeshRef = useRef<THREE.Mesh>(null);
  const nodeSpikesRef = useRef<Float32Array>(new Float32Array(priorityNodes.length).fill(0));

  // Root Groups
  const constellationGroupRef = useRef<THREE.Group>(null);
  const bloomGroupRef         = useRef<THREE.Group>(null);
  const waveGroupRef          = useRef<THREE.Group>(null);
  const coreSphereRef         = useRef<THREE.Mesh>(null);
  const coreCageRef           = useRef<THREE.Mesh>(null);
  const coreRing1Ref          = useRef<THREE.Mesh>(null);
  const coreRing2Ref          = useRef<THREE.Mesh>(null);

  const lookAtTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  // ----------------------------------------------------
  // useFrame: Smooth continuous animation & scroll interpolation
  // ----------------------------------------------------
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const progress = Math.min(Math.max(scrollProgress, 0), 1);
    const inDash = isInDashboard || progress >= 0.85;

    // ── 1. CAMERA INTERPOLATION ───────────────────────────────────────────
    let targetCamX = 0;
    let targetCamY = 0;
    let targetCamZ = 15.5;
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    if (inDash) {
      if (DEPT_KEYS.includes(activeOption)) {
        // Swoop camera directly to the selected Queen
        const qPos = deptPositions[activeOption];
        if (qPos) {
          targetCamX = qPos.x * 0.72 + 0.8;
          targetCamY = qPos.y * 0.72 + 0.5;
          targetCamZ = 6.4;
          targetLookAt.set(qPos.x, qPos.y, qPos.z);
        }
      } else if (activeOption === 'core') {
        // Zoom right into the Nash Arbitrator generator
        targetCamX = 0;
        targetCamY = 0.5;
        targetCamZ = 5.2;
        targetLookAt.set(0, 0, 0);
      } else if (['benchmark', 'weights', 'reputation'].includes(activeOption)) {
        // Elevated isometric overview
        targetCamX = -3.8;
        targetCamY = 2.8;
        targetCamZ = 12.0;
        targetLookAt.set(0, 0, 0);
      } else {
        // In starting stage (progress < 0.16), canvas is full width (100vw), camera at Z=12.2 gives a BIG, epic, centered swarm!
        // When scrolled into split view (progress >= 0.16), camera pulls back to Z=15.5 so all nodes fit comfortably in the 54% width without cropping!
        targetCamX = 0;
        targetCamY = progress < 0.16 ? 0.0 : 0.8;
        targetCamZ = progress < 0.16 ? 12.2 : 15.5;
        targetLookAt.set(0, 0, 0);
      }
    } else {
      // Cinematic Scroll Path
      if (progress <= 0.15) {
        // Scene 1: Big Bang cosmic ignition — start at distance 12.2 so it is immediately big and visible
        const s1 = progress / 0.15;
        targetCamZ = 12.2 - s1 * 1.2;
        targetCamY = 0.0;
        targetCamX = 0;
      } else if (progress <= 0.35) {
        // Scene 2: Constellation full view
        const s2 = (progress - 0.15) / 0.2;
        targetCamZ = THREE.MathUtils.lerp(12.2, 14.5, s2);
        targetCamY = THREE.MathUtils.lerp(0.0, 0.5, s2);
        targetCamX = 0;
      } else if (progress <= 0.55) {
        // Scene 3: Departmental Bloom zoom
        const s3 = (progress - 0.35) / 0.2;
        targetCamZ = THREE.MathUtils.lerp(14.5, 9.0, s3);
        targetCamX = THREE.MathUtils.lerp(0, 1.2, s3);
      } else if (progress <= 0.70) {
        // Scene 4: Synaptic conduits streaming
        const s4 = (progress - 0.55) / 0.15;
        targetCamZ = THREE.MathUtils.lerp(9.0, 13.5, s4);
        targetCamX = THREE.MathUtils.lerp(1.2, 0, s4);
      } else {
        // Scene 5 & 6: Priority Wave & Logo Resolve
        const s5 = Math.min((progress - 0.70) / 0.15, 1.0);
        targetCamZ = THREE.MathUtils.lerp(13.5, 16.5, s5);
        targetCamY = THREE.MathUtils.lerp(0.5, 0.2, s5);
        targetCamX = 0;
      }
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4.0, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4.0, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4.0, delta);

    lookAtTargetRef.current.x = THREE.MathUtils.damp(lookAtTargetRef.current.x, targetLookAt.x, 4.0, delta);
    lookAtTargetRef.current.y = THREE.MathUtils.damp(lookAtTargetRef.current.y, targetLookAt.y, 4.0, delta);
    lookAtTargetRef.current.z = THREE.MathUtils.damp(lookAtTargetRef.current.z, targetLookAt.z, 4.0, delta);
    camera.lookAt(lookAtTargetRef.current);

    // ── 2. SCENE 1: BIG BANG COSMIC POINT CLOUD ──────────────────────────
    if (bigBangPointsRef.current) {
      const s1Prog = Math.min(progress / 0.15, 1.0);
      const easedExpansion = easePower3Out(s1Prog);
      const pulse = 1.0 + Math.sin(time * 2.2) * 0.05;

      // Base radius of 3.2 ensures points form a large, expansive, vibrant cosmic swarm right on load!
      const currentRadius = THREE.MathUtils.lerp(3.2, 6.0, easedExpansion) * pulse;

      // Smooth opacity: prominent in Scene 1, then relaxes to an ambient cosmic dust backdrop
      let opacity = 0.95;
      if (progress > 0.15 && progress <= 0.40) {
        opacity = THREE.MathUtils.lerp(0.95, 0.28, (progress - 0.15) / 0.25);
      } else if (progress > 0.40) {
        opacity = inDash ? 0.15 : 0.22;
      }

      const mat = bigBangPointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = opacity;
      mat.size = THREE.MathUtils.lerp(0.24, 0.32, easedExpansion);

      bigBangPointsRef.current.scale.setScalar(currentRadius);
      bigBangPointsRef.current.rotation.y = time * 0.12;
      bigBangPointsRef.current.rotation.x = Math.sin(time * 0.08) * 0.1;

      if (bigBangSeedRef.current) {
        const seedPulse = 1.0 + Math.sin(time * 3.5) * 0.12;
        const seedScale = Math.max(0.2, 1.2 - easedExpansion * 0.8) * seedPulse;
        bigBangSeedRef.current.scale.setScalar(seedScale);
      }
    }

    // ── 3. SCENE 2 / DASHBOARD: CONSTELLATION NODES & LINES ──────────────
    if (constellationGroupRef.current) {
      // Rotation speed: slows to gentle inspection speed when a Queen is selected
      const isInspecting = inDash && DEPT_KEYS.includes(activeOption);
      const rotSpeed = isInspecting ? 0.015 : 0.07;
      constellationGroupRef.current.rotation.z += delta * rotSpeed;
      constellationGroupRef.current.rotation.y = Math.sin(time * 0.1) * 0.1;

      // Constellation is fully visible from start so there is an impressive big swarm immediately!
      constellationGroupRef.current.scale.setScalar(1.0);
    }

    // Central Core Animation
    if (coreSphereRef.current) {
      const corePulse = 1.0 + Math.sin(time * 3.0) * 0.08;
      const isCoreFocused = activeOption === 'core';
      coreSphereRef.current.scale.setScalar((isCoreFocused ? 1.3 : 0.95) * corePulse);
    }
    if (coreCageRef.current) {
      coreCageRef.current.rotation.x = time * 0.2;
      coreCageRef.current.rotation.y = time * 0.3;
    }
    if (coreRing1Ref.current) {
      coreRing1Ref.current.rotation.z = time * 0.35;
      coreRing1Ref.current.rotation.x = Math.sin(time * 0.5) * 0.28;
    }
    if (coreRing2Ref.current) {
      coreRing2Ref.current.rotation.y = -time * 0.28;
      coreRing2Ref.current.rotation.z = Math.cos(time * 0.4) * 0.28;
    }

    // ── 4. SCENE 3: DEPARTMENTAL BLOOM ───────────────────────────────────
    if (bloomGroupRef.current) {
      let bloomScale = 0;
      if (progress >= 0.30 && progress <= 0.65) {
        const inT = Math.min(1.0, (progress - 0.30) / 0.12);
        const outT = progress > 0.55 ? Math.max(0, 1 - (progress - 0.55) / 0.10) : 1.0;
        bloomScale = easePower3Out(inT) * outT;
      } else if (inDash && DEPT_KEYS.includes(activeOption)) {
        // Keep satellite workers blooming when inspecting in the dashboard!
        bloomScale = 1.0;
      }
      bloomGroupRef.current.scale.setScalar(bloomScale);
      bloomGroupRef.current.rotation.z = -time * 0.04;
    }

    // ── 5. SCENE 4: SYNAPTIC DATA PARTICLES STREAMING ────────────────────
    if (packetParticlesRef.current) {
      const showPackets = (progress >= 0.45 && progress <= 0.78) || inDash;
      if (showPackets) {
        const posAttr = packetParticlesRef.current.geometry.attributes.position;
        const { speeds, offsets, lineIndices } = packetData;
        for (let i = 0; i < packetCount; i++) {
          const param = (offsets[i] + time * speeds[i]) % 1.0;
          const line = packetLines[lineIndices[i]];
          if (line) {
            posAttr.setXYZ(
              i,
              THREE.MathUtils.lerp(line.start.x, line.end.x, param),
              THREE.MathUtils.lerp(line.start.y, line.end.y, param),
              THREE.MathUtils.lerp(line.start.z, line.end.z, param)
            );
          }
        }
        posAttr.needsUpdate = true;
        packetParticlesRef.current.visible = true;
      } else {
        packetParticlesRef.current.visible = false;
      }
    }

    // ── 6. SCENE 5: PRIORITY WAVE & RIBBON SWEEP ─────────────────────────
    if (waveGroupRef.current) {
      let waveVis = 0;
      if (progress >= 0.68 && progress <= 0.88) {
        const inT = Math.min(1.0, (progress - 0.68) / 0.08);
        const outT = progress > 0.82 ? Math.max(0, 1 - (progress - 0.82) / 0.06) : 1.0;
        waveVis = easePower3Out(inT) * outT;
      } else if (progress > 0.88 && !inDash) {
        waveVis = 0.5;
      }
      waveGroupRef.current.scale.setScalar(waveVis);
      waveGroupRef.current.rotation.y = time * 0.06;

      if (ribbonMeshRef.current && progress >= 0.68 && progress <= 0.86) {
        ribbonMeshRef.current.visible = true;
        const waveProgress = (progress - 0.68) / 0.18;
        ribbonMeshRef.current.position.x = THREE.MathUtils.lerp(-9.0, 9.0, waveProgress);

        const geom = ribbonMeshRef.current.geometry as THREE.PlaneGeometry;
        const posAttr = geom.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const u = posAttr.getX(i);
          const v = posAttr.getY(i);
          posAttr.setZ(i, Math.sin(u * 1.8 + time * 3.5) * 0.65 + Math.cos(v * 1.5 + time * 2.0) * 0.45);
        }
        posAttr.needsUpdate = true;

        const ribbonWorldX = ribbonMeshRef.current.position.x;
        const spikes = nodeSpikesRef.current;
        for (let i = 0; i < priorityNodes.length; i++) {
          const dist = Math.abs(priorityNodes[i].pos.x - ribbonWorldX);
          if (dist < 1.6) {
            spikes[i] = 1.0;
          } else {
            spikes[i] = Math.max(0, spikes[i] - delta * 2.5);
          }
        }
      } else if (ribbonMeshRef.current) {
        ribbonMeshRef.current.visible = false;
      }
    }
  });

  return (
    <>
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 0, 8]} intensity={2.2} color="#7C93FF" distance={30} />
      <pointLight position={[6, 4, 4]} intensity={1.5} color="#F2A65A" distance={24} />
      <pointLight position={[-6, -4, 4]} intensity={1.2} color="#38EF7D" distance={24} />

      {/* ── SCENE 1: THE BIG BANG COSMIC POINT CLOUD & SEED ──────────────── */}
      <points ref={bigBangPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[bigBangPoints, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          color="#7C93FF"
          map={glowTexture || undefined}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Radiant Central Singularity Seed */}
      <mesh ref={bigBangSeedRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* ── CENTRAL NASH ARBITRATOR CORE ─────────────────────────────────── */}
      <group
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectOption('core');
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        {/* Pulsating Core */}
        <mesh ref={coreSphereRef}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshStandardMaterial
            color="#7C93FF"
            emissive="#7C93FF"
            emissiveIntensity={activeOption === 'core' ? 2.0 : 1.1}
            roughness={0.2}
            wireframe={false}
          />
        </mesh>

        {/* Geodesic Outer Cage */}
        <mesh ref={coreCageRef}>
          <icosahedronGeometry args={[1.45, 1]} />
          <meshBasicMaterial color="#A3B4FF" wireframe transparent opacity={0.45} />
        </mesh>

        {/* Gyroscopic Gimbal Rings */}
        <mesh ref={coreRing1Ref} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.8, 0.025, 16, 64]} />
          <meshBasicMaterial color="#7C93FF" transparent opacity={0.6} />
        </mesh>
        <mesh ref={coreRing2Ref} rotation={[-Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.1, 0.02, 16, 64]} />
          <meshBasicMaterial color="#F2A65A" transparent opacity={0.4} />
        </mesh>

        {/* Central Core Label */}
        <Html position={[0, 1.4, 0]} center distanceFactor={14} style={{ pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>
          <div className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold border bg-[#10142B]/90 text-[#7C93FF] border-[#7C93FF]/40 backdrop-blur-sm">
            ✦ NASH ARBITRATOR ✦
          </div>
        </Html>
      </group>

      {/* ── SCENE 2 / DASHBOARD: CONSTELLATION OF 7 QUEENS ───────────────── */}
      <group ref={constellationGroupRef}>
        {/* Synaptic Web Lines */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[constellationLinePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#7C93FF" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
        </lineSegments>

        {/* 7 Department Queen Nodes */}
        {DEPT_KEYS.map((key) => {
          const dept = DEPARTMENTS_DATA[key];
          const pos = deptPositions[key];
          const isHovered = hoveredNodeName === key;
          const isActive = activeNode === key || activeOption === key;
          const alloc = allocations.find((a) => a.name === key);
          const rep = alloc ? alloc.reputation : 1.0;
          const trustColor = getTrustColor(rep);
          const nodeScale = isHovered ? 0.72 : isActive ? 0.65 : 0.52;

          return (
            <group key={key} position={[pos.x, pos.y, pos.z]}>
              {/* Queen Sphere */}
              <mesh
                scale={nodeScale}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredNodeName(key);
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setHoveredNodeName(null);
                  document.body.style.cursor = 'auto';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNode(key);
                  onSelectOption(key);
                }}
              >
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                  color={dept.color}
                  emissive={dept.color}
                  emissiveIntensity={isHovered ? 1.6 : isActive ? 1.2 : 0.7}
                  roughness={0.25}
                  metalness={0.4}
                />
              </mesh>

              {/* Dynamic Bayesian Trust Ring */}
              <mesh scale={nodeScale * 1.55} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 1.08, 32]} />
                <meshBasicMaterial
                  color={trustColor}
                  transparent
                  opacity={isHovered || isActive ? 0.9 : 0.45}
                  side={THREE.DoubleSide}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>

              {/* Projected 3D Billboard Label */}
              <Html
                position={[0, 0.95, 0]}
                center
                distanceFactor={15}
                style={{ pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                <div
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider font-semibold border transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1B2154] text-white border-white scale-110 shadow-lg shadow-[#7C93FF]/50'
                      : isHovered
                      ? 'bg-[#1B2154] text-white border-[#7C93FF] scale-105'
                      : 'bg-[#10142B]/90 text-[#D3D8EF] border-[#7C93FF]/40'
                  }`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: dept.color }} />
                  {dept.name}
                  {alloc && (
                    <span className="ml-1.5 text-[10px] opacity-80" style={{ color: trustColor }}>
                      · {alloc.f_i.toFixed(1)}k
                    </span>
                  )}
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* ── SCENE 3: DEPARTMENTAL BLOOM (SATELLITE WORKER FLEET) ─────────── */}
      <group ref={bloomGroupRef} position={[0, 0, 0]}>
        {/* Fractal Branch Lines */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[bloomLinePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#7C93FF" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
        </lineSegments>

        {/* Center Node representing the Bloomed Department */}
        <mesh scale={0.85}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={DEPARTMENTS_DATA[currentDeptKey]?.color || '#7C93FF'}
            emissive={DEPARTMENTS_DATA[currentDeptKey]?.color || '#7C93FF'}
            emissiveIntensity={0.9}
          />
        </mesh>

        {/* Satellite Worker Nodes */}
        {bloomSatellites.map((sat) => {
          const isHovered = hoveredNodeName === sat.name;
          const isActive = activeNode === sat.name;
          const scale = sat.scale * (isHovered ? 1.25 : isActive ? 1.15 : 1.0);

          return (
            <group key={sat.id} position={[sat.offset.x, sat.offset.y, sat.offset.z]}>
              <mesh
                scale={scale}
                onPointerOver={(e) => {
                  if (sat.name) {
                    e.stopPropagation();
                    setHoveredNodeName(sat.name);
                    document.body.style.cursor = 'pointer';
                  }
                }}
                onPointerOut={(e) => {
                  if (sat.name) {
                    e.stopPropagation();
                    setHoveredNodeName(null);
                    document.body.style.cursor = 'auto';
                  }
                }}
                onClick={(e) => {
                  if (sat.name) {
                    e.stopPropagation();
                    setActiveNode(sat.name);
                  }
                }}
              >
                <sphereGeometry args={[1, 24, 24]} />
                <meshStandardMaterial
                  color={sat.color}
                  emissive={sat.color}
                  emissiveIntensity={isHovered ? 1.5 : sat.isNamedWorker ? 1.0 : 0.5}
                  roughness={0.3}
                />
              </mesh>

              {sat.isNamedWorker && sat.name && (
                <Html
                  position={[0, 0.65, 0]}
                  center
                  distanceFactor={12}
                  style={{ pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}
                >
                  <div
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide font-medium border ${
                      isHovered
                        ? 'bg-[#1B2154] text-[#F2A65A] border-[#F2A65A] scale-110 shadow-md'
                        : 'bg-[#141840]/90 text-[#F5F6FA] border-[#F2A65A]/40'
                    }`}
                  >
                    {sat.name}
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>

      {/* ── SCENE 4: SYNAPTIC DATA PARTICLES STREAMING ───────────────────── */}
      <points ref={packetParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[packetData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[packetData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.24}
          vertexColors
          map={glowTexture || undefined}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* ── SCENE 5: GLOBAL PRIORITY WAVE & LATTICE ──────────────────────── */}
      <group ref={waveGroupRef}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[priorityLines, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#7C93FF" transparent opacity={0.28} blending={THREE.AdditiveBlending} />
        </lineSegments>

        {priorityNodes.map((node, idx) => {
          const spike = nodeSpikesRef.current[idx] || 0;
          const nodeScale = 0.22 + spike * 0.18;
          return (
            <mesh key={node.id} position={node.pos} scale={nodeScale}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial
                color={spike > 0.4 ? '#FFFFFF' : '#7C93FF'}
                emissive={spike > 0.4 ? '#00F2FE' : '#7C93FF'}
                emissiveIntensity={0.5 + spike * 2.2}
              />
            </mesh>
          );
        })}

        <mesh ref={ribbonMeshRef} rotation={[0, Math.PI / 4, 0]}>
          <planeGeometry args={[14, 8, 48, 24]} />
          <meshStandardMaterial
            color="#00F2FE"
            emissive="#7C93FF"
            emissiveIntensity={0.5}
            transparent
            opacity={0.32}
            side={THREE.DoubleSide}
            wireframe={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
};
