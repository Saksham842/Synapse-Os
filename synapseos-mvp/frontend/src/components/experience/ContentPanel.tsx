'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Cpu, Activity, ShieldCheck, Sparkles, Wrench, Layers } from 'lucide-react';
import { useSynapseStore, DEPARTMENTS_DATA, WorkerInfo, DepartmentInfo } from '@/lib/store';

export const ContentPanel: React.FC = () => {
  const { activeNode, setActiveNode } = useSynapseStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveNode]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Only trigger if activeNode is currently open
        if (activeNode) {
          setActiveNode(null);
        }
      }
    };
    // Use capture or slight delay to not conflict with the 3D raycasting click
    const timer = setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [activeNode, setActiveNode]);

  // Find if activeNode is a department or a worker
  let deptData: DepartmentInfo | null = null;
  let workerData: WorkerInfo | null = null;

  if (activeNode) {
    if (DEPARTMENTS_DATA[activeNode]) {
      deptData = DEPARTMENTS_DATA[activeNode];
    } else {
      // Search in workers across all departments
      for (const dept of Object.values(DEPARTMENTS_DATA)) {
        const found = dept.workers.find((w) => w.name === activeNode);
        if (found) {
          workerData = found;
          deptData = dept;
          break;
        }
      }
    }
  }

  const isOpen = Boolean(activeNode && (deptData || workerData));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          ref={panelRef}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] md:w-[480px] z-50 pointer-events-auto bg-[#1B2154]/95 backdrop-blur-xl border-l-2 border-[#7C93FF] shadow-2xl shadow-[#10142B]/80 flex flex-col overflow-hidden text-[#F5F6FA]"
          aria-label="Node Details Panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#7C93FF]/20 bg-[#141840]/60">
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px]"
                style={{
                  backgroundColor: deptData?.color || '#7C93FF',
                  boxShadow: `0 0 12px ${deptData?.color || '#7C93FF'}`
                }}
              />
              <span className="text-xs uppercase tracking-widest font-mono text-[#9AA2C9]">
                {workerData ? `Worker Node // ${workerData.department}` : 'Department Swarm'}
              </span>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="p-2 rounded-lg text-[#9AA2C9] hover:text-[#F5F6FA] hover:bg-[#7C93FF]/15 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
            {/* WORKER VIEW */}
            {workerData && deptData && (
              <div className="space-y-6">
                {/* Back to Department link */}
                <button
                  onClick={() => setActiveNode(deptData!.name)}
                  className="inline-flex items-center gap-2 text-sm text-[#7C93FF] hover:text-white font-medium group transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span>Back to {deptData.name}</span>
                </button>

                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-[#7C93FF]/15 text-[#7C93FF] border border-[#7C93FF]/30 mb-3">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Autonomous Worker Agent</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#F5F6FA] font-bold">
                    {workerData.name}
                  </h2>
                  <p className="text-sm text-[#7C93FF] font-medium mt-1">
                    {workerData.role}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#10142B]/70 border border-[#7C93FF]/20 space-y-2">
                  <span className="text-xs font-mono uppercase text-[#9AA2C9] tracking-wider block">Operational Mandate</span>
                  <p className="text-sm text-[#E2E6F5] leading-relaxed">
                    {workerData.description}
                  </p>
                </div>

                {/* Skill & Tool Bindings */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9AA2C9]">
                    <Wrench className="w-3.5 h-3.5 text-[#7C93FF]" />
                    <span>Skill & Tool Bindings</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {workerData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#252C6E] text-[#B8C5FF] border border-[#7C93FF]/30 shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#141840]/80 border border-[#7C93FF]/20">
                    <div className="flex items-center gap-2 text-xs text-[#9AA2C9] mb-1">
                      <Activity className="w-3.5 h-3.5 text-[#38EF7D]" />
                      <span>Compute Load</span>
                    </div>
                    <span className="text-base font-semibold text-[#F5F6FA]">{workerData.load}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#141840]/80 border border-[#7C93FF]/20">
                    <div className="flex items-center gap-2 text-xs text-[#9AA2C9] mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#7C93FF]" />
                      <span>Runtime State</span>
                    </div>
                    <span className="text-base font-semibold capitalize text-[#38EF7D]">
                      {workerData.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DEPARTMENT VIEW */}
            {!workerData && deptData && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono mb-3 bg-[#7C93FF]/15 text-[#7C93FF] border border-[#7C93FF]/30">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Core Department Node</span>
                  </div>
                  <h2
                    className="text-3xl font-serif font-bold tracking-tight"
                    style={{ color: deptData.color }}
                  >
                    {deptData.name}
                  </h2>
                  <p className="text-sm text-[#E2E6F5] font-medium mt-1">
                    {deptData.tagline}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#10142B]/70 border border-[#7C93FF]/20">
                  <span className="text-xs font-mono uppercase text-[#9AA2C9] tracking-wider block mb-1">Swarm Purpose</span>
                  <p className="text-sm text-[#D3D8EF] leading-relaxed">
                    {deptData.description}
                  </p>
                </div>

                {/* Worker Agents List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#9AA2C9] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F2A65A]" />
                      Specialized Worker Swarms ({deptData.workers.length})
                    </span>
                    <span className="text-[11px] text-[#7C93FF] font-mono">Click to inspect</span>
                  </div>

                  <div className="space-y-2.5">
                    {deptData.workers.map((worker) => (
                      <button
                        key={worker.name}
                        onClick={() => setActiveNode(worker.name)}
                        className="w-full text-left p-3.5 rounded-xl bg-[#141840]/90 hover:bg-[#202766] border border-[#7C93FF]/25 hover:border-[#7C93FF] transition-all duration-200 group flex items-center justify-between shadow-sm"
                      >
                        <div className="space-y-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#F5F6FA] group-hover:text-[#7C93FF] transition-colors">
                              {worker.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#38EF7D]/15 text-[#38EF7D] border border-[#38EF7D]/30">
                              {worker.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#9AA2C9] line-clamp-1">
                            {worker.role}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-[#7C93FF] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="px-6 py-4 border-t border-[#7C93FF]/20 bg-[#141840]/70 flex items-center justify-between text-xs font-mono text-[#9AA2C9]">
            <span>SynapseOS v2.4 Runtime</span>
            <span className="text-[#38EF7D] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38EF7D] animate-ping" />
              Connected
            </span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
