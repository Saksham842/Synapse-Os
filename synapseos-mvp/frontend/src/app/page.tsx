'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSynapseStore, DEPARTMENTS_DATA } from '@/lib/store';
import { SimulationRound } from '../types';
import UtilityComparisonChart from '@/components/UtilityComparisonChart';
import PrioritySliders from '@/components/PrioritySliders';
import ReputationTester from '@/components/ReputationTester';
import {
  Compass,
  Sparkles,
  Network,
  GitBranch,
  Zap,
  Radio,
  Activity,
  BarChart2,
  ChevronDown,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Single WebGL Canvas — no duplicate swarms!
const CinematicCanvas = dynamic(() => import('@/components/CinematicCanvas'), { ssr: false });
const ContentPanel = dynamic(
  () => import('@/components/experience/ContentPanel').then((m) => ({ default: m.ContentPanel })),
  { ssr: false }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL   = API_BASE.replace(/^http/, 'ws') + '/ws/live';

const SCENES = [
  { id: 1, title: '01 Ignition',      subtitle: 'Central Swarm & KPIs',       range: [0.00, 0.16] as [number, number] },
  { id: 2, title: '02 Constellation', subtitle: '7 Queens (Left Column)',      range: [0.16, 0.34] as [number, number] },
  { id: 3, title: '03 Worker Fleet',  subtitle: 'Sub-Agents (Left Column)',    range: [0.34, 0.52] as [number, number] },
  { id: 4, title: '04 Benchmark',     subtitle: 'Solver Chart (Right Column)', range: [0.52, 0.68] as [number, number] },
  { id: 5, title: '05 Sliders',       subtitle: 'Priority Wave (Right Column)',range: [0.68, 0.84] as [number, number] },
  { id: 6, title: '06 Trust Defense', subtitle: 'Byzantine Test (Right Column)',range: [0.84, 1.00] as [number, number] },
];

const QUEEN_COLORS: Record<string, string> = {
  Sales: '#7C93FF',
  Marketing: '#F2A65A',
  Operations: '#38EF7D',
  Intelligence: '#B088FF',
  Customer: '#00F0FF',
  'Back Office': '#FF6584',
  Deals: '#FFD166',
};

const SWARM_OPTIONS = [
  { id: 'overview',     label: '✦ Swarm Orbit',       color: '#7C93FF' },
  { id: 'core',         label: '✦ Nash Core',         color: '#A3B4FF' },
  { id: 'Sales',        label: '✦ Sales',             color: '#7C93FF' },
  { id: 'Marketing',    label: '✦ Marketing',         color: '#F2A65A' },
  { id: 'Operations',   label: '✦ Operations',        color: '#38EF7D' },
  { id: 'Intelligence', label: '✦ Intelligence',    color: '#B088FF' },
  { id: 'Customer',     label: '✦ Customer',          color: '#00F0FF' },
  { id: 'Back Office',  label: '✦ Back Office',       color: '#FF6584' },
  { id: 'Deals',        label: '✦ Deals',             color: '#FFD166' },
  { id: 'benchmark',    label: '✦ Benchmarks',        color: '#10B981' },
  { id: 'weights',      label: '✦ Priority Weights',  color: '#F2A65A' },
  { id: 'reputation',   label: '✦ Byzantine Test',    color: '#EF4444' },
];

function getTrustBadge(rep: number) {
  if (rep >= 0.85) return { label: 'Honest', color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' };
  if (rep >= 0.5)  return { label: 'Cautious', color: '#F2A65A', bg: 'rgba(242,166,90,0.15)', border: 'rgba(242,166,90,0.4)' };
  return { label: 'Penalized', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' };
}

export default function HomePage() {
  const { scrollProgress, setScrollProgress, setActiveNode } = useSynapseStore();
  const [sceneIdx, setSceneIdx] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  // Section refs for direct scrolling
  const sectionRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Live simulation telemetry state
  const [currentRound, setCurrentRound] = useState<SimulationRound | null>(null);
  const [activeOption, setActiveOption] = useState('overview');
  const [selectedDept, setSelectedDept] = useState('Sales');
  const [connMode, setConnMode] = useState<'ws' | 'polling' | 'connecting'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setCanvasReady(true);
  }, []);

  // ── WebSocket Telemetry Feed ────────────────────────────────────────────────
  const fetchRound = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/simulation/latest`);
      if (r.ok) {
        setCurrentRound(await r.json());
        setConnMode('polling');
      }
    } catch {}
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;
        ws.onopen = () => {
          setConnMode('ws');
          if (t) clearInterval(t);
        };
        ws.onmessage = (e) => {
          try {
            setCurrentRound(JSON.parse(e.data));
          } catch {}
        };
        ws.onclose = () => {
          setConnMode('polling');
          if (!t) {
            fetchRound();
            t = setInterval(fetchRound, 3500);
          }
          setTimeout(connect, 5000);
        };
        ws.onerror = () => ws.close();
      } catch {
        setConnMode('polling');
        if (!t) {
          fetchRound();
          t = setInterval(fetchRound, 3500);
        }
      }
    };
    connect();
    return () => {
      wsRef.current?.close();
      if (t) clearInterval(t);
    };
  }, [fetchRound]);

  // ── High-Performance Scroll Tracker ─────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const prog = Math.min(Math.max(window.scrollY / Math.max(maxScroll, 1), 0), 1);
      setScrollProgress(prog);

      const idx = SCENES.findIndex((s) => prog >= s.range[0] && prog <= s.range[1]);
      if (idx !== -1) setSceneIdx(idx);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [setScrollProgress]);

  const scrollToSection = (idx: number) => {
    sectionRefs[idx]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const comp = currentRound?.comparison;
  const nash = comp?.nash;
  const { round, F_max, weights } = currentRound ?? {
    round: 0,
    F_max: 25.0,
    weights: { w1: 1, w2: 1, w3: 1 },
  };

  const handleSelectOption = (opt: string) => {
    setActiveOption(opt);
    if (DEPARTMENTS_DATA[opt]) {
      setSelectedDept(opt);
      setActiveNode(opt);
    }
  };

  const activeDeptData = DEPARTMENTS_DATA[selectedDept] || DEPARTMENTS_DATA['Sales'];
  const activeAlloc = nash?.allocations.find((a) => a.name === selectedDept);

  // Dynamic layout stage:
  // 1. Initial: 'center' (Swarm in center, SynapseOS title in center)
  // 2. Scroll: 'right' (Swarm slides to right 50%, content on left 50%)
  // 3. Further Scroll: 'left' (Swarm slides to left 50%, content on right 50%)
  const swarmStage: 'center' | 'right' | 'left' =
    scrollProgress < 0.16 ? 'center' : scrollProgress < 0.52 ? 'right' : 'left';

  return (
    <main style={{ background: '#0B0E20', color: '#F5F6FA', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* ── DYNAMIC 3D CANVAS STAGE (Center → Right → Left) ─────────────── */}
      {canvasReady && (
        <div
          className="swarm-viewport-container"
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            zIndex: 5,
            pointerEvents: 'auto',
            transition: 'left 0.75s cubic-bezier(0.16, 1, 0.3, 1), width 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
            ...(swarmStage === 'center'
              ? { left: 0, width: '100%' }
              : swarmStage === 'right'
              ? { left: '50%', width: '50%' }
              : { left: 0, width: '50%' }),
          }}
        >
          <CinematicCanvas
            allocations={nash?.allocations ?? []}
            activeOption={activeOption}
            onSelectOption={handleSelectOption}
            isInDashboard={true}
          />
        </div>
      )}

      {/* ── FIXED TOP HUD ───────────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'auto' }}>
          <button
            onClick={() => scrollToSection(0)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(20,24,64,0.9)',
              border: '1px solid rgba(124,147,255,0.3)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38EF7D', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fff', fontWeight: 700 }}>
              SynapseOS
            </span>
          </button>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border backdrop-blur-md"
            style={{
              background: 'rgba(20,24,64,0.9)',
              borderColor: connMode === 'ws' ? 'rgba(16,185,129,0.4)' : 'rgba(242,166,90,0.4)',
            }}
          >
            <span className={`w-2 h-2 rounded-full ${connMode === 'ws' ? 'bg-[#10B981] animate-pulse' : 'bg-[#F2A65A] animate-ping'}`} />
            <span className="font-semibold uppercase" style={{ color: connMode === 'ws' ? '#10B981' : '#F2A65A' }}>
              {connMode === 'ws' ? 'WS Live' : connMode === 'connecting' ? 'Connecting…' : 'Polling'}
            </span>
            {currentRound && <span style={{ color: '#7C93FF', marginLeft: 4 }}>Cycle #{round}</span>}
          </div>
        </div>

        <div style={{ pointerEvents: 'auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 16px',
              borderRadius: 999,
              background: 'rgba(20,24,64,0.9)',
              border: '1px solid rgba(124,147,255,0.3)',
              backdropFilter: 'blur(12px)',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            <Compass style={{ width: 14, height: 14, color: '#7C93FF' }} />
            <span style={{ color: '#9AA2C9' }}>STAGE {sceneIdx + 1}/6:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{SCENES[sceneIdx]?.subtitle}</span>
            <span style={{ color: '#7C93FF', fontWeight: 700 }}>{Math.round(scrollProgress * 100)}%</span>
          </div>
        </div>
      </header>

      {/* ── FIXED RIGHT-SIDE NAVIGATION BULLETS ─────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          pointerEvents: 'auto',
        }}
      >
        {SCENES.map((s, i) => {
          const active = i === sceneIdx;
          return (
            <button
              key={s.id}
              onClick={() => scrollToSection(i)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}
              title={`${s.title} — ${s.subtitle}`}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: active ? '#7C93FF' : '#9AA2C9',
                  opacity: active ? 1 : 0,
                  transition: 'opacity 0.3s',
                  textShadow: '0 0 8px rgba(0,0,0,0.8)',
                }}
              >
                {s.title}
              </span>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  border: `1px solid ${active ? '#7C93FF' : 'rgba(124,147,255,0.4)'}`,
                  background: active ? '#7C93FF' : 'transparent',
                  transform: active ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: active ? '0 0 10px #7C93FF' : 'none',
                  transition: 'all 0.3s',
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* ContentPanel Drawer */}
      {canvasReady && <ContentPanel />}

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN SCROLL CONTAINER
      ═════════════════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 15 }}>

        {/* ── § 1: INITIAL STAGE — SWARM IN CENTER + SYNAPSEOS HERO ──────── */}
        <section
          ref={sectionRefs[0]}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '100px 24px 60px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ maxWidth: 760, pointerEvents: 'auto' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 999,
                fontSize: 11,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                background: 'rgba(124,147,255,0.2)',
                color: '#7C93FF',
                border: '1px solid rgba(124,147,255,0.4)',
                marginBottom: 20,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 30px rgba(124,147,255,0.25)',
              }}
            >
              Phase 01 // Quantum Ignition
            </span>
            <h1
              style={{
                fontSize: 'clamp(54px, 9vw, 104px)',
                fontFamily: 'serif',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#fff',
                textShadow: '0 0 60px rgba(124,147,255,0.6)',
                margin: '0 0 16px',
                lineHeight: 1.05,
              }}
            >
              SynapseOS
            </h1>
            <p style={{ fontSize: 'clamp(17px, 2.2vw, 22px)', color: '#CAD4FF', fontWeight: 400, lineHeight: 1.6, margin: '0 auto 28px', maxWidth: 620 }}>
              The AI Workforce Operating System: 7 department Queens delegating to specialized worker swarms, coordinated via a shared Second Brain and Nash compute governance.
            </p>

            {/* 4 Compact Telemetry Chips */}
            {nash && (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
                {[
                  { label: 'Compute Pool', val: `${F_max.toFixed(1)} k-cyc/s`, color: '#7C93FF' },
                  { label: 'Nash Gain', val: `+${nash.total_utility.toFixed(2)} pts`, color: '#10B981' },
                  { label: 'FCFS Gap', val: `+${comp?.utility_gap_fcfs.toFixed(2)} pts`, color: '#F2A65A' },
                  { label: 'Equal Surplus', val: `+${comp?.utility_gap_equal.toFixed(2)} pts`, color: '#00F0FF' },
                ].map((k) => (
                  <div
                    key={k.label}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 12,
                      background: 'rgba(20,24,64,0.85)',
                      border: '1px solid rgba(124,147,255,0.3)',
                      backdropFilter: 'blur(12px)',
                      fontSize: 11,
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ color: '#9AA2C9' }}>{k.label}: </span>
                    <strong style={{ color: k.color }}>{k.val}</strong>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => scrollToSection(1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 999,
                background: 'linear-gradient(135deg,rgba(124,147,255,0.25),rgba(90,111,232,0.35))',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                fontFamily: 'monospace',
                border: '1px solid rgba(124,147,255,0.4)',
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 24px rgba(124,147,255,0.3)',
              }}
            >
              Scroll down to inspect department swarms
              <ChevronDown style={{ width: 14, height: 14, color: '#7C93FF' }} />
            </button>
          </div>
        </section>

        {/* ── STAGE 2: SWARM MOVES TO RIGHT // CONTENT ON LEFT ────────────── */}
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 24px' }}>

          {/* § 2: THE 7 DEPARTMENT QUEENS (LEFT 50%) */}
          <section
            ref={sectionRefs[1]}
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '80px 0',
              maxWidth: '48%', // Leaves right 50% clear for the 3D Swarm!
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  background: 'rgba(242,166,90,0.18)',
                  color: '#F2A65A',
                  border: '1px solid rgba(242,166,90,0.35)',
                  marginBottom: 12,
                }}
              >
                Phase 02 // Harmonic Topology
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
                The 7 Department Queens
              </h2>
              <p style={{ fontSize: 14, color: '#D3D8EF', lineHeight: 1.6, margin: 0 }}>
                Seven autonomous departmental orchestrators orbit the core. The 3D swarm on the right reflects live cycle rates and trust rings. Click any Queen to inspect.
              </p>
            </div>

            {/* Quick 3D Focus Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap',
                padding: '8px 12px',
                borderRadius: 14,
                background: 'rgba(20,24,64,0.85)',
                border: '1px solid rgba(124,147,255,0.25)',
                backdropFilter: 'blur(16px)',
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9AA2C9', textTransform: 'uppercase', paddingRight: 4 }}>
                3D Focus:
              </span>
              {SWARM_OPTIONS.slice(0, 9).map((opt) => {
                const isSel = activeOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 10,
                      fontFamily: 'monospace',
                      fontWeight: isSel ? 700 : 500,
                      color: isSel ? '#10142B' : '#CAD4FF',
                      background: isSel ? opt.color : 'rgba(124,147,255,0.08)',
                      border: `1px solid ${isSel ? opt.color : 'rgba(124,147,255,0.25)'}`,
                      cursor: 'pointer',
                      boxShadow: isSel ? `0 0 14px ${opt.color}88` : 'none',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* 7-Queen Live Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
              {Object.keys(DEPARTMENTS_DATA).map((deptKey) => {
                const dept = DEPARTMENTS_DATA[deptKey];
                const alloc = nash?.allocations.find((a) => a.name === deptKey);
                const isSelected = selectedDept === deptKey;
                const rep = alloc ? alloc.reputation : 1.0;
                const trust = getTrustBadge(rep);

                return (
                  <div
                    key={deptKey}
                    onClick={() => handleSelectOption(deptKey)}
                    style={{
                      cursor: 'pointer',
                      padding: '14px 16px',
                      borderRadius: 16,
                      border: `1px solid ${isSelected ? dept.color : 'rgba(124,147,255,0.2)'}`,
                      background: isSelected ? 'rgba(25,32,84,0.92)' : 'rgba(20,24,64,0.85)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: isSelected ? `0 0 20px ${dept.color}35` : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dept.color }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{dept.name}</span>
                      </div>
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: 'monospace',
                          padding: '2px 6px',
                          borderRadius: 999,
                          color: trust.color,
                          background: trust.bg,
                          border: `1px solid ${trust.border}`,
                        }}
                      >
                        {trust.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'monospace', color: '#9AA2C9' }}>
                      <span>Allocation: <strong style={{ color: dept.color }}>{alloc ? `${alloc.f_i.toFixed(1)}k` : '—'}</strong></span>
                      <span>Workers: <strong style={{ color: '#fff' }}>{dept.workers.length}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* § 3: AUTONOMOUS WORKER FLEET (LEFT 50%) */}
          <section
            ref={sectionRefs[2]}
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '80px 0',
              maxWidth: '48%', // Leaves right 50% clear for the 3D Swarm!
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  background: 'rgba(56,239,125,0.18)',
                  color: '#38EF7D',
                  border: '1px solid rgba(56,239,125,0.35)',
                  marginBottom: 10,
                }}
              >
                Phase 03 // Swarm Specialization
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                Autonomous Worker Fleet
              </h2>
              <p style={{ fontSize: 14, color: '#D3D8EF', lineHeight: 1.6, margin: 0 }}>
                Specialized sub-agents execute tasks under bounded SLA deadlines. Inspect worker skills and latency budgets.
              </p>
            </div>

            {/* Department Filter Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {Object.keys(DEPARTMENTS_DATA).map((d) => {
                const active = selectedDept === d;
                const color = QUEEN_COLORS[d] || '#7C93FF';
                return (
                  <button
                    key={d}
                    onClick={() => handleSelectOption(d)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 10,
                      fontFamily: 'monospace',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#10142B' : '#CAD4FF',
                      background: active ? color : 'rgba(20,24,64,0.85)',
                      border: `1px solid ${active ? color : 'rgba(124,147,255,0.25)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Active Department Worker Deck */}
            <div
              style={{
                padding: '20px 22px',
                borderRadius: 20,
                border: `1px solid ${activeDeptData.color}40`,
                background: 'rgba(20,24,64,0.9)',
                backdropFilter: 'blur(20px)',
                boxShadow: `0 0 30px ${activeDeptData.color}20`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: activeDeptData.color }} />
                  {activeDeptData.name} Sub-Agents
                </h3>
                {activeAlloc && (
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#10B981' }}>
                    T_i: {activeAlloc.T_i.toFixed(2)}s / SLA {activeAlloc.D.toFixed(1)}s
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeDeptData.workers.map((w) => (
                  <div
                    key={w.name}
                    onClick={() => setActiveNode(w.name)}
                    style={{
                      cursor: 'pointer',
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(16,20,43,0.85)',
                      border: '1px solid rgba(124,147,255,0.2)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = activeDeptData.color)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(124,147,255,0.2)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{w.name}</h4>
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: 'monospace',
                          padding: '2px 6px',
                          borderRadius: 999,
                          background: w.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(242,166,90,0.15)',
                          color: w.status === 'active' ? '#10B981' : '#F2A65A',
                        }}
                      >
                        {w.load}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: activeDeptData.color, display: 'block', marginBottom: 6 }}>
                      {w.role}
                    </span>
                    <p style={{ fontSize: 11, color: '#CAD4FF', lineHeight: 1.4, margin: '0 0 8px' }}>
                      {w.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {w.skills.map((s) => (
                        <span key={s} style={{ fontSize: 9, fontFamily: 'monospace', padding: '1px 5px', borderRadius: 4, background: 'rgba(124,147,255,0.1)', color: '#CAD4FF' }}>
                          #{s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── STAGE 3: SWARM MOVES TO LEFT // CONTENT ON RIGHT ───────────── */}

          {/* § 4: SOLVER BENCHMARK (RIGHT 50%) */}
          <section
            ref={sectionRefs[3]}
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '80px 0',
              marginLeft: 'auto',
              maxWidth: '48%', // Leaves left 50% clear for the 3D Swarm!
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  background: 'rgba(124,147,255,0.18)',
                  color: '#7C93FF',
                  border: '1px solid rgba(124,147,255,0.35)',
                  marginBottom: 10,
                }}
              >
                Phase 04 // Mathematical Optimization
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                Nash vs Baseline Benchmarks
              </h2>
              <p style={{ fontSize: 14, color: '#D3D8EF', lineHeight: 1.6, margin: 0 }}>
                Formulated as a cooperative game. Nash Bargaining guarantees positive utility (+5.61 pts) while greedy FCFS drives starvation (-25.98 pts).
              </p>
            </div>

            {comp ? (
              <div style={{ background: 'rgba(20,24,64,0.9)', padding: 20, borderRadius: 20, border: '1px solid rgba(124,147,255,0.3)', backdropFilter: 'blur(20px)' }}>
                <UtilityComparisonChart comparison={comp} />
              </div>
            ) : null}
          </section>

          {/* § 5: PRIORITY WAVE SLIDERS (RIGHT 50%) */}
          <section
            ref={sectionRefs[4]}
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '80px 0',
              marginLeft: 'auto',
              maxWidth: '48%', // Leaves left 50% clear for the 3D Swarm!
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  background: 'rgba(0,242,254,0.18)',
                  color: '#00F2FE',
                  border: '1px solid rgba(0,242,254,0.35)',
                  marginBottom: 10,
                }}
              >
                Phase 05 // Dynamic Priority Wave
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                Multi-Objective Priority Wave
              </h2>
              <p style={{ fontSize: 14, color: '#D3D8EF', lineHeight: 1.6, margin: 0 }}>
                The priority wave on the left redistributes compute dynamically. Tune task value ($w_1$), CPU cost dampening ($w_2$), and SLA latency penalties ($w_3$).
              </p>
            </div>

            <PrioritySliders
              initialWeights={weights}
              onWeightsChange={async (newW) => {
                try {
                  await fetch(`${API_BASE}/simulation/weights?w1=${newW.w1}&w2=${newW.w2}&w3=${newW.w3}`, { method: 'POST' });
                  fetchRound();
                } catch {}
              }}
            />
          </section>

          {/* § 6: BYZANTINE TRUST & REPUTATION TESTER (RIGHT 50%) */}
          <section
            ref={sectionRefs[5]}
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '80px 0',
              marginLeft: 'auto',
              maxWidth: '48%', // Leaves left 50% clear for the 3D Swarm!
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  background: 'rgba(239,68,68,0.18)',
                  color: '#EF4444',
                  border: '1px solid rgba(239,68,68,0.35)',
                  marginBottom: 10,
                }}
              >
                Phase 06 // Byzantine Trust Defense
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                Bayesian Reputation & Social Dilemma
              </h2>
              <p style={{ fontSize: 14, color: '#D3D8EF', lineHeight: 1.6, margin: 0 }}>
                Inject a dishonest bid below to observe Bayesian decay discount that Queen&apos;s priority and turn its 3D trust halo on the left from green to red.
              </p>
            </div>

            <ReputationTester
              apiBaseUrl={API_BASE}
              onActionComplete={fetchRound}
            />

            {/* Academic Foundations & Footer */}
            <footer
              style={{
                paddingTop: 28,
                borderTop: '1px solid rgba(124,147,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                fontSize: 10,
                fontFamily: 'monospace',
                color: '#9AA2C9',
                marginTop: 36,
              }}
            >
              <div>
                <strong style={{ color: '#fff' }}>Theoretical Foundations:</strong>
                <ul style={{ marginTop: 6, paddingLeft: 16, lineHeight: 1.8 }}>
                  <li><span style={{ color: '#7C93FF' }}>Nash Bargaining (NBS)</span>: Classical cooperative game theory (Nash 1950)</li>
                  <li><span style={{ color: '#F2A65A' }}>Multi-Objective Tuning</span>: Hybrid GA/GWO Pareto frontier (Jain et al. 2022)</li>
                  <li><span style={{ color: '#10B981' }}>Byzantine Trust Layer</span>: Bayesian reputation decay $R_i$ (Kishor & Niyogi 2023)</li>
                </ul>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>SynapseOS Core Platform · CVXPY [Clarabel / ECOS]</span>
                <button
                  onClick={() => scrollToSection(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#7C93FF',
                    fontFamily: 'monospace',
                    fontSize: 10,
                  }}
                >
                  ↑ Return to Top
                </button>
              </div>
            </footer>
          </section>

        </div>

      </div>

      {/* Global CSS animations & Responsive Media Queries */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.45;
          }
        }
        @media (max-width: 1024px) {
          .swarm-viewport-container {
            width: 100% !important;
            left: 0 !important;
            opacity: 0.35 !important;
            pointer-events: none !important;
          }
          section {
            max-width: 100% !important;
            margin-left: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}
