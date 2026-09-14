"use client";

import React, { useState, useEffect } from "react";

interface PrioritySlidersProps {
  initialWeights: { w1: number; w2: number; w3: number };
  onWeightsChange: (weights: { w1: number; w2: number; w3: number }) => void;
}

export default function PrioritySliders({
  initialWeights,
  onWeightsChange,
}: PrioritySlidersProps) {
  const [w1, setW1] = useState(initialWeights.w1);
  const [w2, setW2] = useState(initialWeights.w2);
  const [w3, setW3] = useState(initialWeights.w3);

  // Debounced notification to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      onWeightsChange({ w1, w2, w3 });
    }, 250);
    return () => clearTimeout(timer);
  }, [w1, w2, w3, onWeightsChange]);

  const applyPreset = (presetW1: number, presetW2: number, presetW3: number) => {
    setW1(presetW1);
    setW2(presetW2);
    setW3(presetW3);
  };

  return (
    <div className="bg-[var(--panel)] border border-[var(--panel-border)] rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-serif text-lg text-[var(--text-main)] font-semibold tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-blue)] inline-block" />
            Allocation Priorities (Multi-Objective Proxy)
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manually tunes what the system optimizes for — Phase 2 replaces this with Prof. Pramod Kumar Singh&apos;s Hybrid GA/Grey-Wolf Pareto optimizer.
          </p>
        </div>

        {/* Preset profiles */}
        <div className="flex gap-1.5">
          <button
            onClick={() => applyPreset(1.0, 0.01, 2.0)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--panel-alt)] hover:bg-[rgba(124,147,255,0.2)] text-[var(--text-main)] border border-[var(--panel-border)] transition"
          >
            Default
          </button>
          <button
            onClick={() => applyPreset(1.0, 0.005, 4.5)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--panel-alt)] hover:bg-[rgba(242,166,90,0.2)] text-[var(--accent-amber)] border border-[var(--panel-border)] transition"
          >
            Strict SLA
          </button>
          <button
            onClick={() => applyPreset(0.8, 0.08, 1.0)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--panel-alt)] hover:bg-[rgba(16,185,129,0.2)] text-[var(--success)] border border-[var(--panel-border)] transition"
          >
            Eco Power
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        {/* Slider w1: Task Value Weight */}
        <div className="bg-[var(--panel-alt)] p-3.5 rounded-xl border border-[var(--panel-border)]">
          <div className="flex justify-between items-center mb-1 text-xs font-mono">
            <span className="text-[var(--text-main)] font-semibold">w1: Task Value Priority</span>
            <span className="text-[var(--accent-blue)] font-bold">{w1.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={w1}
            onChange={(e) => setW1(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[var(--background)] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-mono">
            <span>0.1 (Flat)</span>
            <span>5.0 (High Value Dominance)</span>
          </div>
        </div>

        {/* Slider w2: CPU Dynamic Power Cost */}
        <div className="bg-[var(--panel-alt)] p-3.5 rounded-xl border border-[var(--panel-border)]">
          <div className="flex justify-between items-center mb-1 text-xs font-mono">
            <span className="text-[var(--text-main)] font-semibold">w2: CPU Cost (f_i²)</span>
            <span className="text-[var(--accent-blue)] font-bold">{w2.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="0.100"
            step="0.002"
            value={w2}
            onChange={(e) => setW2(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[var(--background)] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-mono">
            <span>0.001 (Aggressive)</span>
            <span>0.100 (Conservative DVFS)</span>
          </div>
        </div>

        {/* Slider w3: Deadline SLA Penalty */}
        <div className="bg-[var(--panel-alt)] p-3.5 rounded-xl border border-[var(--panel-border)]">
          <div className="flex justify-between items-center mb-1 text-xs font-mono">
            <span className="text-[var(--text-main)] font-semibold">w3: SLA Breach Penalty</span>
            <span className="text-[var(--accent-amber)] font-bold">{w3.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={w3}
            onChange={(e) => setW3(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[var(--background)] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-mono">
            <span>0.1 (Lenient)</span>
            <span>5.0 (Zero-Tolerance)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
