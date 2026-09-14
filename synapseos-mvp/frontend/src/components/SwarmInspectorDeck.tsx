'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueenAllocationResult, AllocationResponse } from '../types';
import { DEPARTMENTS_DATA, useSynapseStore } from '@/lib/store';
import UtilityComparisonChart from './UtilityComparisonChart';
import PrioritySliders from './PrioritySliders';
import ReputationTester from './ReputationTester';
import { Cpu, ShieldCheck, Activity, ArrowRight, Zap, Layers, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SwarmInspectorDeckProps {
  activeOption: string;
  allocations: QueenAllocationResult[];
  F_max: number;
  comparison: AllocationResponse;
  weights: { w1: number; w2: number; w3: number };
  onWeightsChange: (w: { w1: number; w2: number; w3: number }) => void;
  apiBaseUrl: string;
  onActionComplete: () => void;
  onResetToOverview: () => void;
  onSelectQueen: (name: string) => void;
}

const QUEEN_COLORS: Record<string, string> = {
  Sales: '#7C93FF',
  Marketing: '#F2A65A',
  Operations: '#38EF7D',
  Intelligence: '#B088FF',
  Customer: '#00F0FF',
  'Back Office': '#FF6584',
  Deals: '#FFD166',
};

export default function SwarmInspectorDeck({
  activeOption,
  allocations,
  F_max,
  comparison,
  weights,
  onWeightsChange,
  apiBaseUrl,
  onActionComplete,
  onResetToOverview,
  onSelectQueen,
}: SwarmInspectorDeckProps) {
  const { setActiveNode } = useSynapseStore();

  const selectedAlloc = allocations.find((a) => a.name === activeOption);
  const deptData = DEPARTMENTS_DATA[activeOption];
  const accentColor = QUEEN_COLORS[activeOption] || '#7C93FF';

  return (
    <div className="w-full relative z-20">
      <AnimatePresence mode="wait">
        {/* ── 1. FOCUSED QUEEN INSPECTION CARD & WORKER DECK ────── */}
        {selectedAlloc && (
          <motion.div
            key={`queen-${activeOption}`}
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-3xl border p-5 sm:p-7 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(20,24,64,0.92) 0%, rgba(13,16,42,0.96) 100%)',
              borderColor: `${accentColor}50`,
              boxShadow: `0 0 45px -5px ${accentColor}25`,
            }}
          >
            {/* Top glowing accent line */}
            <span
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              }}
            />

            {/* Header: Queen Name & Trust Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#7C93FF]/20">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-[0_0_12px]"
                  style={{ backgroundColor: accentColor, boxShadow: `0 0 16px ${accentColor}` }}
                />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
                      {selectedAlloc.name} Queen Swarm
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#7C93FF]/15 text-[#7C93FF] border border-[#7C93FF]/30">
                      AUTONOMOUS ORCHESTRATOR
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                    {deptData?.tagline || 'Specialized Swarm Department'}
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold border"
                  style={{
                    backgroundColor: selectedAlloc.reputation >= 0.85 ? 'rgba(16,185,129,0.15)' : 'rgba(242,166,90,0.15)',
                    borderColor: selectedAlloc.reputation >= 0.85 ? 'rgba(16,185,129,0.35)' : 'rgba(242,166,90,0.35)',
                    color: selectedAlloc.reputation >= 0.85 ? '#10B981' : '#F2A65A',
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Trust Factor R_i: {selectedAlloc.reputation.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => setActiveNode(selectedAlloc.name)}
                  className="flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-xs font-mono bg-[#7C93FF]/20 hover:bg-[#7C93FF]/35 text-white border border-[#7C93FF]/40 transition shadow-[0_0_12px_rgba(124,147,255,0.25)]"
                >
                  <span>Open Drilldown Drawer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 Telemetry Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-5">
              <div className="bg-[#141840]/80 p-3.5 rounded-2xl border border-[#7C93FF]/20">
                <span className="text-[10px] text-[var(--text-muted)] font-mono block uppercase">
                  Allocated CPU Rate (f_i)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-[#7C93FF]">
                    {selectedAlloc.f_i.toFixed(2)}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">k-cyc/s</span>
                </div>
                <div className="w-full bg-[#7C93FF]/10 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (selectedAlloc.f_i / 15) * 100)}%`,
                      backgroundColor: accentColor,
                      boxShadow: `0 0 10px ${accentColor}`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-[#141840]/80 p-3.5 rounded-2xl border border-[#7C93FF]/20">
                <span className="text-[10px] text-[var(--text-muted)] font-mono block uppercase">
                  Task Execution Time (T_i)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-white">
                    {selectedAlloc.T_i.toFixed(2)}s
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">/ {selectedAlloc.D}s SLA</span>
                </div>
                <span className={`text-[10px] font-mono mt-2 block ${selectedAlloc.breach > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                  {selectedAlloc.breach > 0 ? `⚠ SLA Miss: +${selectedAlloc.breach.toFixed(2)}s` : '✓ Deadline Satisfied'}
                </span>
              </div>

              <div className="bg-[#141840]/80 p-3.5 rounded-2xl border border-[#7C93FF]/20">
                <span className="text-[10px] text-[var(--text-muted)] font-mono block uppercase">
                  Workload &amp; Effective Priority
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-white">
                    {selectedAlloc.W}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">k-cyc · V: {selectedAlloc.raw_V}</span>
                </div>
                <span className="text-[10px] font-mono text-[#F2A65A] mt-2 block">
                  Effective V: {selectedAlloc.effective_V.toFixed(2)} (R_i Discount)
                </span>
              </div>

              <div className="bg-[#141840]/80 p-3.5 rounded-2xl border border-[#7C93FF]/20">
                <span className="text-[10px] text-[var(--text-muted)] font-mono block uppercase">
                  Realized Swarm Utility (U_i)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-bold font-mono ${selectedAlloc.U_i >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {selectedAlloc.U_i >= 0 ? `+${selectedAlloc.U_i.toFixed(2)}` : selectedAlloc.U_i.toFixed(2)}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">pts</span>
                </div>
                <span className="text-[10px] font-mono text-[#9AA2C9] mt-2 block">
                  U = w1·V - w2·f² - w3·breach
                </span>
              </div>
            </div>

            {/* Autonomous Worker Agents Deck */}
            {deptData && deptData.workers && deptData.workers.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#7C93FF]/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif text-base font-semibold text-white tracking-wide flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#7C93FF]" />
                    <span>Autonomous Worker Sub-Agents ({deptData.workers.length})</span>
                  </h4>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    Cycle-allocated execution nodes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {deptData.workers.map((worker) => (
                    <div
                      key={worker.name}
                      onClick={() => setActiveNode(worker.name)}
                      className="cursor-pointer bg-[#141840]/90 hover:bg-[#1B2154] border border-[#7C93FF]/20 hover:border-[#7C93FF]/60 rounded-2xl p-4 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-serif font-bold text-white group-hover:text-[#7C93FF] transition-colors">
                            {worker.name}
                          </div>
                          <div className="text-[10px] text-[#9AA2C9] font-mono mt-0.5">
                            {worker.role}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C93FF]/15 text-[#7C93FF] border border-[#7C93FF]/30">
                          {worker.load}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2">
                        {worker.description}
                      </p>

                      <div className="flex items-center gap-1 flex-wrap mt-3 pt-2 border-t border-[#7C93FF]/10">
                        {worker.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-[#9AA2C9] border border-[#7C93FF]/20"
                          >
                            #{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── 2. FOCUSED CENTRAL NASH ARBITRATOR CORE DECK ───────── */}
        {activeOption === 'core' && (
          <motion.div
            key="core-focus"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl border border-[#7C93FF]/40 p-6 sm:p-8 backdrop-blur-2xl bg-[#141840]/95 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#7C93FF]/20 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-[#7C93FF] animate-pulse" />
                  <span>Nash Bargaining Arbitrator Core</span>
                </h3>
                <p className="text-xs text-[#9AA2C9] font-mono mt-1">
                  Global cycle allocator maximizing collective utility product &prod; (U_i - d_i)
                </p>
              </div>
              <button
                onClick={onResetToOverview}
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-[#7C93FF]/20 text-white border border-[#7C93FF]/40 hover:bg-[#7C93FF]/30"
              >
                Return to Swarm Orbit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#0B0E20] p-4 rounded-xl border border-[#7C93FF]/20">
                <span className="text-[#9AA2C9] block mb-1">Total Capacity</span>
                <span className="text-xl font-bold text-[#7C93FF]">{F_max} k-cyc/s</span>
                <p className="text-[11px] text-[#9AA2C9] mt-2">Shared dynamic DVFS envelope</p>
              </div>
              <div className="bg-[#0B0E20] p-4 rounded-xl border border-[#7C93FF]/20">
                <span className="text-[#9AA2C9] block mb-1">Nash System Utility</span>
                <span className="text-xl font-bold text-[#10B981]">+{comparison.nash.total_utility.toFixed(2)} pts</span>
                <p className="text-[11px] text-[#9AA2C9] mt-2">Pareto-optimal axiomatic agreement</p>
              </div>
              <div className="bg-[#0B0E20] p-4 rounded-xl border border-[#7C93FF]/20">
                <span className="text-[#9AA2C9] block mb-1">Convex Solver</span>
                <span className="text-xl font-bold text-[#F2A65A]">CLARABEL / ECOS</span>
                <p className="text-[11px] text-[#9AA2C9] mt-2">Log-barrier interior point method (12ms)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 3. UTILITY BENCHMARK MODE ──────────────────────────── */}
        {activeOption === 'benchmark' && (
          <motion.div
            key="benchmark-focus"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-white font-semibold">
                  Game-Theoretic Comparison: Nash vs Equal Split vs Greedy FCFS
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Proving mathematical avoidance of starvation and collective surplus
                </p>
              </div>
              <button
                onClick={onResetToOverview}
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-[#7C93FF]/20 text-white border border-[#7C93FF]/40 hover:bg-[#7C93FF]/30"
              >
                Return to Swarm Orbit
              </button>
            </div>
            <UtilityComparisonChart comparison={comparison} />
          </motion.div>
        )}

        {/* ── 4. MULTI-OBJECTIVE WEIGHT TUNER MODE ───────────────── */}
        {activeOption === 'weights' && (
          <motion.div
            key="weights-focus"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-white font-semibold">
                  Multi-Objective Optimization Weights (w1, w2, w3)
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Proxy for Prof. Pramod Kumar Singh&apos;s Hybrid GA / Grey Wolf Pareto frontier search
                </p>
              </div>
              <button
                onClick={onResetToOverview}
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-[#7C93FF]/20 text-white border border-[#7C93FF]/40 hover:bg-[#7C93FF]/30"
              >
                Return to Swarm Orbit
              </button>
            </div>
            <PrioritySliders initialWeights={weights} onWeightsChange={onWeightsChange} />
          </motion.div>
        )}

        {/* ── 5. BYZANTINE TRUST STRESS TEST MODE ────────────────── */}
        {activeOption === 'stress' && (
          <motion.div
            key="stress-focus"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-white font-semibold">
                  Byzantine Swarm Trust &amp; Reputation Stress-Tester
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Inject misreported bids (V=25) to witness Bayesian reputation decay and self-enforcing honesty
                </p>
              </div>
              <button
                onClick={onResetToOverview}
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-[#7C93FF]/20 text-white border border-[#7C93FF]/40 hover:bg-[#7C93FF]/30"
              >
                Return to Swarm Orbit
              </button>
            </div>
            <ReputationTester apiBaseUrl={apiBaseUrl} onActionComplete={onActionComplete} />
          </motion.div>
        )}

        {/* ── 6. OVERVIEW MODE: ALL QUEENS CARDS CAROUSEL ────────── */}
        {activeOption === 'overview' && (
          <motion.div
            key="overview-deck"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-white font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C93FF] animate-pulse" />
                  <span>Autonomous Swarm Departments</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Click any department card or 3D node above to re-orient camera, slow swarm, and inspect live workers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {allocations.map((alloc) => {
                const qColor = QUEEN_COLORS[alloc.name] || '#7C93FF';
                return (
                  <div
                    key={alloc.name}
                    onClick={() => onSelectQueen(alloc.name)}
                    className="cursor-pointer group p-4 rounded-2xl border border-[#7C93FF]/20 hover:border-[#7C93FF]/60 bg-[#141840]/70 hover:bg-[#1B2154]/90 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] shadow-lg"
                    style={{ boxShadow: `0 0 20px -6px ${qColor}30` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px]"
                          style={{ backgroundColor: qColor }}
                        />
                        <span className="font-serif font-bold text-white text-sm group-hover:text-[#7C93FF] transition-colors">
                          {alloc.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-[#7C93FF] border border-[#7C93FF]/20">
                        {alloc.f_i.toFixed(1)}k
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-[#9AA2C9] space-y-1">
                      <div className="flex justify-between">
                        <span>Trust R_i:</span>
                        <span className={alloc.reputation >= 0.85 ? 'text-[#10B981]' : 'text-[#F2A65A]'}>
                          {alloc.reputation.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exec Time:</span>
                        <span className="text-white">{alloc.T_i.toFixed(2)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utility U_i:</span>
                        <span className={alloc.U_i >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                          {alloc.U_i >= 0 ? `+${alloc.U_i.toFixed(2)}` : alloc.U_i.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#7C93FF]/10 flex items-center justify-between text-[10px] font-mono text-[#7C93FF] group-hover:text-white">
                      <span>Focus 3D View</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
