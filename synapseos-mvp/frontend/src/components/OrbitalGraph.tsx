"use client";

import React, { useState } from "react";
import { QueenAllocationResult } from "../types";

interface OrbitalGraphProps {
  allocations: QueenAllocationResult[];
  F_max: number;
  onSelectQueen?: (name: string) => void;
  selectedQueen?: string | null;
}

export default function OrbitalGraph({
  allocations,
  F_max,
  onSelectQueen,
  selectedQueen,
}: OrbitalGraphProps) {
  const [hoveredQueen, setHoveredQueen] = useState<string | null>(null);

  const width = 520;
  const height = 440;
  const cx = width / 2;
  const cy = height / 2;
  const orbitRadius = 155;

  const n = allocations.length;

  const getReputationColor = (rep: number) => {
    if (rep >= 0.85) return "#10B981"; // healthy green
    if (rep >= 0.5) return "#F2A65A"; // degraded amber
    return "#EF4444"; // penalized red
  };

  const activeAlloc = allocations.find(
    (a) => a.name === (hoveredQueen || selectedQueen)
  );

  return (
    <div className="relative flex flex-col items-center bg-[var(--panel)] border border-[var(--panel-border)] rounded-2xl p-5 shadow-2xl overflow-hidden">
      {/* Background ambient radial grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,147,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full flex items-center justify-between mb-2 z-10">
        <div>
          <h3 className="font-serif text-lg text-[var(--text-main)] font-semibold tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-blue)] animate-ping inline-block" />
            Active Topology: Nash Cycle Flow
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Vector thickness scales with allocated rate $f_i$; node ring reflects trust $R_i$
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--panel-alt)] border border-[var(--panel-border)] text-[var(--accent-blue)] font-mono">
          F_max = {F_max} k-cyc/s
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[500px] h-[380px] select-none"
      >
        <defs>
          <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-center" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="vector-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C93FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F2A65A" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Orbit track ring */}
        <circle
          cx={cx}
          cy={cy}
          r={orbitRadius}
          fill="none"
          stroke="rgba(124, 147, 255, 0.15)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* Inner boundary indicator */}
        <circle
          cx={cx}
          cy={cy}
          r={orbitRadius * 0.55}
          fill="none"
          stroke="rgba(124, 147, 255, 0.08)"
          strokeWidth="1"
        />

        {/* Connecting energy vectors to Queens */}
        {allocations.map((alloc, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          const qx = cx + orbitRadius * Math.cos(angle);
          const qy = cy + orbitRadius * Math.sin(angle);

          // Thickness scales with f_i (range roughly 1 to 15 => stroke 2 to 9)
          const strokeWidth = Math.max(2, Math.min(9, (alloc.f_i / (F_max / n)) * 3.5));
          const opacity = Math.max(0.35, Math.min(0.95, alloc.f_i / 12));
          const isHighlighted = hoveredQueen === alloc.name || selectedQueen === alloc.name;

          return (
            <g key={`vector-${alloc.name}`}>
              <line
                x1={cx}
                y1={cy}
                x2={qx}
                y2={qy}
                stroke="#7C93FF"
                strokeWidth={isHighlighted ? strokeWidth + 2 : strokeWidth}
                strokeOpacity={opacity}
                className="transition-all duration-500"
              />
              {/* Animated cycle particle dash */}
              <line
                x1={cx}
                y1={cy}
                x2={qx}
                y2={qy}
                stroke="#F5F6FA"
                strokeWidth={Math.max(1.5, strokeWidth * 0.4)}
                strokeDasharray="6 14"
                strokeOpacity={isHighlighted ? 0.9 : 0.6}
                className="animate-dash-flow pointer-events-none"
              />
            </g>
          );
        })}

        {/* Central Allocator Node */}
        <g className="cursor-pointer" filter="url(#glow-center)">
          <circle
            cx={cx}
            cy={cy}
            r={38}
            fill="#1B2154"
            stroke="#7C93FF"
            strokeWidth="2.5"
            className="transition-all duration-300 hover:stroke-[var(--accent-amber)]"
          />
          <circle
            cx={cx}
            cy={cy}
            r={29}
            fill="#222B63"
            opacity="0.8"
          />
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill="#F5F6FA"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="0.05em"
          >
            NASH
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill="#7C93FF"
            fontSize="8"
            fontFamily="monospace"
          >
            ALLOCATOR
          </text>
          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            fill="#9AA2C9"
            fontSize="7"
            fontFamily="monospace"
          >
            ECOS/CLARABEL
          </text>
        </g>

        {/* Orbiting Queen Nodes */}
        {allocations.map((alloc, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          const qx = cx + orbitRadius * Math.cos(angle);
          const qy = cy + orbitRadius * Math.sin(angle);
          const repColor = getReputationColor(alloc.reputation);
          const isSelected = selectedQueen === alloc.name;
          const isHovered = hoveredQueen === alloc.name;

          return (
            <g
              key={`node-${alloc.name}`}
              className="cursor-pointer transition-transform duration-300"
              onMouseEnter={() => setHoveredQueen(alloc.name)}
              onMouseLeave={() => setHoveredQueen(null)}
              onClick={() => onSelectQueen && onSelectQueen(alloc.name)}
            >
              {/* Outer Trust/Reputation Ring */}
              <circle
                cx={qx}
                cy={qy}
                r={isSelected || isHovered ? 29 : 25}
                fill="none"
                stroke={repColor}
                strokeWidth={isSelected || isHovered ? 3 : 2}
                strokeDasharray={alloc.reputation < 0.85 ? "4 3" : undefined}
                className="transition-all duration-300"
              />

              {/* Node Body */}
              <circle
                cx={qx}
                cy={qy}
                r={isSelected || isHovered ? 25 : 21}
                fill="#1B2154"
                stroke="#222B63"
                strokeWidth="2"
              />

              {/* Queen Initials / Label */}
              <text
                x={qx}
                y={qy - 2}
                textAnchor="middle"
                fill="#F5F6FA"
                fontSize="9"
                fontWeight="600"
              >
                {alloc.name.substring(0, 5)}
              </text>
              <text
                x={qx}
                y={qy + 10}
                textAnchor="middle"
                fill="#7C93FF"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {alloc.f_i.toFixed(1)}k
              </text>
            </g>
          );
        })}
      </svg>

      {/* Dynamic Hover / Selection Badge */}
      <div className="w-full bg-[var(--panel-alt)] border border-[var(--panel-border)] rounded-xl px-4 py-2 mt-2 flex items-center justify-between text-xs font-mono">
        {activeAlloc ? (
          <>
            <span className="text-[var(--text-main)] font-semibold flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: getReputationColor(activeAlloc.reputation) }}
              />
              {activeAlloc.name} Queen
            </span>
            <span className="text-[var(--text-muted)]">
              f_i: <strong className="text-[var(--accent-blue)]">{activeAlloc.f_i}</strong>
            </span>
            <span className="text-[var(--text-muted)]">
              T_i: <strong className="text-[var(--text-main)]">{activeAlloc.T_i}s</strong> / D:{activeAlloc.D}s
            </span>
            <span className="text-[var(--text-muted)]">
              Utility:{" "}
              <strong className={activeAlloc.U_i >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                {activeAlloc.U_i}
              </strong>
            </span>
            <span className="text-[var(--text-muted)]">
              R_i: <strong className="text-[var(--accent-amber)]">{activeAlloc.reputation.toFixed(2)}</strong>
            </span>
          </>
        ) : (
          <span className="text-[var(--text-muted)] text-center w-full">
            Hover or click any Queen node to inspect allocated bandwidth & SLA breach metrics
          </span>
        )}
      </div>
    </div>
  );
}
