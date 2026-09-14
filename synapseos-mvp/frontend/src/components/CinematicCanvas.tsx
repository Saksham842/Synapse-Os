'use client';

/**
 * CinematicCanvas — single, persistent WebGL Canvas mounting the unified SynapseScene.
 * Dynamically loaded with { ssr: false } to guarantee zero server-side WebGL execution.
 */

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { SynapseScene } from './experience/SynapseScene';
import { QueenAllocationResult } from '@/types';

export interface CinematicCanvasProps {
  allocations?: QueenAllocationResult[];
  activeOption?: string;
  onSelectOption?: (option: string) => void;
  isInDashboard?: boolean;
}

export default function CinematicCanvas({
  allocations = [],
  activeOption = 'overview',
  onSelectOption = () => {},
  isInDashboard = false,
}: CinematicCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 13], fov: 45 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor('#0B0E20', 1)}
      style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
    >
      <SynapseScene
        allocations={allocations}
        activeOption={activeOption}
        onSelectOption={onSelectOption}
        isInDashboard={isInDashboard}
      />
    </Canvas>
  );
}
