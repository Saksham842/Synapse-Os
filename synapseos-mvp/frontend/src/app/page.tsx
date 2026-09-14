'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSynapseStore, DEPARTMENTS_DATA } from '@/lib/store';
import { SimulationRound, QueenAllocationResult } from '../types';
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
  { id: 1, title: '01 Telemetry HUD',    subtitle: 'Ignition & KPIs',           range: [0.00, 0.17] as [number, number] },
  { id: 2, title: '02 Constellation',    subtitle: '7 Department Queens',       range: [0.17, 0.34] as [number, number] },
  { id: 3, title: '03 Worker Fleet',     subtitle: 'Sub-Agent Hierarchy',       range: [0.34, 0.51] as [number, number] },
  { id: 4, title: '04 Solver Benchmark', subtitle: 'Nash vs Baselines',         range: [0.51, 0.68] as [number, number] },
  { id: 5, title: '05 Priority Wave',    subtitle: 'Multi-Objective Sliders',   range: [0.68, 0.84] as [number, number] },
  { id: 6, title: '06 Trust Defense',    subtitle: 'Byzantine Reputation',      range: [0.84, 1.00] as [number, number] },
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

  // Section refs for direct jump
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

  return (
    <main style={{ background: '#0B0E20', color: '#F5F6FA', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* ── UNIFIED FIXED 3D CINEMATIC CANVAS (Single swarm, persistent) ── */}
      {canvasReady && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'auto',
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

      {/* ── TOP HUD HEADER ──────────────────────────────────────────────── */}
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
              background: 'rgba(20,24,64,0.88)',
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
              background: 'rgba(20,24,64,0.88)',
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
              background: 'rgba(20,24,64,0.88)',
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

      {/* ── RIGHT-SIDE SCENE NAVIGATION ─────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          right: 24,
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

      {/* ContentPanel Drawer for direct worker detail inspection */}
      {canvasReady && <ContentPanel />}

      {/* ═════════════════════════════════════════════════════════════════════
          INTEGRATED DASHBOARD SECTIONS (DRIVEN BY SCROLL)
      ═════════════════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── § 1: QUANTUM IGNITION & SYSTEM TELEMETRY HUD ───────────────── */}
        <section
          ref={sectionRefs[0]}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '100px 24px 60px',
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <div style={{ maxWidth: 840, marginBottom: 32 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '5px 14px',
                borderRadius: 999,
                fontSize: 11,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                background: 'rgba(124,147,255,0.18)',
                color: '#7C93FF',
                border: '1px solid rgba(124,147,255,0.35)',
                marginBottom: 16,
                backdropFilter: 'blur(8px)',
              }}
            >
              Phase 01 // Quantum Ignition & Telemetry
            </span>
            <h1
              style={{
                fontSize: 'clamp(44px, 7vw, 88px)',
                fontFamily: 'serif',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#fff',
                textShadow: '0 0 60px rgba(124,147,255,0.5)',
                margin: '0 0 16px',
                lineHeight: 1.08,
              }}
            >
              SynapseOS
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#CAD4FF', fontWeight: 300, lineHeight: 1.7, margin: '0 0 16px' }}>
              The AI Workforce Operating System: 7 autonomous department Queens delegating to specialized worker swarms, coordinated through a shared Second Brain and governed by Nash compute allocation.
            </p>
          </div>

          {/* 4 Live KPI Cards */}
          {nash && comp ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginBottom: 32 }}>
              {[
                {
                  label: 'Shared Capacity',
                  val: `${F_max.toFixed(1)}`,
                  unit: 'k-cyc/s',
                  sub: `${nash.total_cpu_used.toFixed(1)} utilized (${((nash.total_cpu_used / F_max) * 100).toFixed(0)}%)`,
                  color: '#7C93FF',
                  action: () => scrollToSection(1),
                },
                {
                  label: 'Nash Utility Gain',
                  val: `+${nash.total_utility.toFixed(2)}`,
                  unit: 'pts',
                  sub: 'Convex Global Maximum',
                  color: '#10B981',
                  action: () => scrollToSection(3),
                },
                {
                  label: 'FCFS Starvation Gap',
                  val: `+${comp.utility_gap_fcfs.toFixed(2)}`,
                  unit: 'pts',
                  sub: 'Starvation Prevented',
                  color: '#F2A65A',
                  action: () => scrollToSection(3),
                },
                {
                  label: 'Equal-Split Surplus',
                  val: `+${comp.utility_gap_equal.toFixed(2)}`,
                  unit: 'pts',
                  sub: 'Heterogeneous Surplus',
                  color: '#00F0FF',
                  action: () => scrollToSection(4),
                },
              ].map((k) => (
                <div
                  key={k.label}
                  onClick={k.action}
                  style={{
                    cursor: 'pointer',
                    padding: '20px 22px',
                    borderRadius: 20,
                    border: '1px solid rgba(124,147,255,0.25)',
                    background: 'rgba(20,24,64,0.85)',
                    backdropFilter: 'blur(16px)',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = k.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(124,147,255,0.25)';
                  }}
                >
                  <span style={{ fontSize: 10, color: '#9AA2C9', fontFamily: 'monospace', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    {k.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'monospace', color: k.color }}>{k.val}</span>
                    <span style={{ fontSize: 11, color: '#9AA2C9', fontFamily: 'monospace' }}>{k.unit}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: k.color, marginTop: 6, display: 'block' }}>{k.sub}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'monospace', color: 'rgba(184,197,255,0.85)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C93FF', display: 'inline-block', animation: 'ping 1.5s infinite' }} />
            Scroll down to inspect the 7 Department Queens ↓
          </div>
        </section>

        {/* ── § 2: THE 7 DEPARTMENT QUEENS & SWARM ORBIT ─────────────────── */}
        <section
          ref={sectionRefs[1]}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 24px',
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: 24 }}>
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
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
              The 7 Department Queens
            </h2>
            <p style={{ fontSize: 15, color: '#D3D8EF', maxWidth: 720, margin: 0, lineHeight: 1.7 }}>
              Seven autonomous departmental orchestrators orbit the central Nash Core. Click any Queen below (or directly in the 3D constellation) to swoop the camera and inspect workers.
            </p>
          </div>

          {/* Quick 3D Option Selector Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              overflowX: 'auto',
              padding: '10px 14px',
              borderRadius: 16,
              background: 'rgba(20,24,64,0.85)',
              border: '1px solid rgba(124,147,255,0.3)',
              backdropFilter: 'blur(16px)',
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9AA2C9', textTransform: 'uppercase', paddingRight: 6 }}>
              3D Focus:
            </span>
            {SWARM_OPTIONS.map((opt) => {
              const isSel = activeOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '6px 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: isSel ? 700 : 500,
                    color: isSel ? '#10142B' : '#CAD4FF',
                    background: isSel ? opt.color : 'rgba(124,147,255,0.08)',
                    border: `1px solid ${isSel ? opt.color : 'rgba(124,147,255,0.25)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSel ? `0 0 16px ${opt.color}88` : 'none',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
            {activeOption !== 'overview' && (
              <button
                onClick={() => handleSelectOption('overview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: '#CAD4FF',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                <RotateCcw style={{ width: 12, height: 12 }} />
                Reset Orbit
              </button>
            )}
          </div>

          {/* 7-Queen Live Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
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
                    padding: '18px 20px',
                    borderRadius: 18,
                    border: `1px solid ${isSelected ? dept.color : 'rgba(124,147,255,0.2)'}`,
                    background: isSelected ? 'rgba(25,32,84,0.92)' : 'rgba(20,24,64,0.85)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: isSelected ? `0 0 24px ${dept.color}40` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: dept.color }} />
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{dept.name}</span>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'monospace',
                        padding: '2px 8px',
                        borderRadius: 999,
                        color: trust.color,
                        background: trust.bg,
                        border: `1px solid ${trust.border}`,
                      }}
                    >
                      {trust.label} (R={rep.toFixed(2)})
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#CAD4FF', margin: '0 0 12px', minHeight: 32, lineHeight: 1.5 }}>
                    {dept.tagline}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'monospace', color: '#9AA2C9', borderTop: '1px solid rgba(124,147,255,0.15)', paddingTop: 10 }}>
                    <span>Allocation: <strong style={{ color: dept.color }}>{alloc ? `${alloc.f_i.toFixed(1)}k` : '—'}</strong></span>
                    <span>Workers: <strong style={{ color: '#fff' }}>{dept.workers.length}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── § 3: AUTONOMOUS WORKER FLEET & SPECIALIZATION ───────────────── */}
        <section
          ref={sectionRefs[2]}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 24px',
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: 24 }}>
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
                marginBottom: 12,
              }}
            >
              Phase 03 // Swarm Specialization
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
              Autonomous Worker Sub-Agents
            </h2>
            <p style={{ fontSize: 15, color: '#D3D8EF', maxWidth: 720, margin: 0, lineHeight: 1.7 }}>
              Queens delegate real enterprise tasks to specialized sub-agents. Select any department to view its active worker fleet and execution SLAs.
            </p>
          </div>

          {/* Department Filter Pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20 }}>
            {Object.keys(DEPARTMENTS_DATA).map((d) => {
              const active = selectedDept === d;
              const color = QUEEN_COLORS[d] || '#7C93FF';
              return (
                <button
                  key={d}
                  onClick={() => handleSelectOption(d)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#10142B' : '#CAD4FF',
                    background: active ? color : 'rgba(20,24,64,0.85)',
                    border: `1px solid ${active ? color : 'rgba(124,147,255,0.25)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
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
              padding: '24px 28px',
              borderRadius: 24,
              border: `1px solid ${activeDeptData.color}40`,
              background: 'rgba(20,24,64,0.88)',
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 40px ${activeDeptData.color}20`,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: activeDeptData.color }} />
                  {activeDeptData.name} Department Fleet
                </h3>
                <p style={{ fontSize: 12, color: '#9AA2C9', margin: '4px 0 0', fontFamily: 'monospace' }}>
                  {activeDeptData.description}
                </p>
              </div>
              {activeAlloc && (
                <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'monospace' }}>
                  <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(124,147,255,0.1)', border: '1px solid rgba(124,147,255,0.25)' }}>
                    <span style={{ color: '#9AA2C9' }}>Cycle Rate: </span>
                    <strong style={{ color: activeDeptData.color }}>{activeAlloc.f_i.toFixed(2)} k-cyc/s</strong>
                  </div>
                  <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <span style={{ color: '#9AA2C9' }}>Latency T_i: </span>
                    <strong style={{ color: '#10B981' }}>{activeAlloc.T_i.toFixed(2)}s</strong> / {activeAlloc.D.toFixed(1)}s
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
              {activeDeptData.workers.map((w) => (
                <div
                  key={w.name}
                  onClick={() => setActiveNode(w.name)}
                  style={{
                    cursor: 'pointer',
                    padding: '18px 20px',
                    borderRadius: 16,
                    background: 'rgba(16,20,43,0.85)',
                    border: '1px solid rgba(124,147,255,0.2)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = activeDeptData.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(124,147,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{w.name}</h4>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'monospace',
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: w.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(242,166,90,0.15)',
                        color: w.status === 'active' ? '#10B981' : '#F2A65A',
                        border: `1px solid ${w.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(242,166,90,0.3)'}`,
                      }}
                    >
                      {w.load}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: activeDeptData.color, display: 'block', marginBottom: 8 }}>
                    {w.role}
                  </span>
                  <p style={{ fontSize: 12, color: '#CAD4FF', lineHeight: 1.5, margin: '0 0 12px' }}>
                    {w.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {w.skills.map((s) => (
                      <span key={s} style={{ fontSize: 10, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 4, background: 'rgba(124,147,255,0.1)', color: '#CAD4FF' }}>
                        #{s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── § 4: NASH ALLOCATOR VS BASELINE BENCHMARKS ─────────────────── */}
        <section
          ref={sectionRefs[3]}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 24px',
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: 24 }}>
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
                marginBottom: 12,
              }}
            >
              Phase 04 // Mathematical Optimization
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
              Nash Bargaining vs Baseline Benchmarks
            </h2>
            <p style={{ fontSize: 15, color: '#D3D8EF', maxWidth: 720, margin: 0, lineHeight: 1.7 }}>
              Solves the Tragedy of the Commons by formulating resource allocation as a cooperative game. Nash Bargaining guarantees positive utility (+5.61 pts) while unconstrained FCFS drives starvation (-25.98 pts).
            </p>
          </div>

          {comp ? (
            <div style={{ background: 'rgba(20,24,64,0.85)', padding: 24, borderRadius: 24, border: '1px solid rgba(124,147,255,0.3)', backdropFilter: 'blur(16px)' }}>
              <UtilityComparisonChart comparison={comp} />
            </div>
          ) : null}
        </section>

        {/* ── § 5: DYNAMIC PRIORITY ORCHESTRATION SLIDERS ────────────────── */}
        <section
          ref={sectionRefs[4]}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 24px',
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: 24 }}>
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
                marginBottom: 12,
              }}
            >
              Phase 05 // Dynamic Orchestration
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
              Multi-Objective Priority Wave
            </h2>
            <p style={{ fontSize: 15, color: '#D3D8EF', maxWidth: 720, margin: 0, lineHeight: 1.7 }}>
              Adjust the multi-objective Pareto trade-offs in real time. Modify task value sensitivity ($w_1$), CPU cost dampening ($w_2$), and SLA latency penalties ($w_3$).
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

        {/* ── § 6: BYZANTINE TRUST LAYER & REPUTATION STRESS TEST ────────── */}
        <section
          ref={sectionRefs[5]}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 24px',
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: 24 }}>
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
                marginBottom: 12,
              }}
            >
              Phase 06 // Byzantine Trust Defense
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
              Bayesian Reputation & Social Dilemma Defense
            </h2>
            <p style={{ fontSize: 15, color: '#D3D8EF', maxWidth: 720, margin: 0, lineHeight: 1.7 }}>
              Cryptographic signing proves provenance, not honesty. Inject a dishonest bid below to observe Bayesian decay discount that Queen&apos;s priority and turn its 3D halo ring from green to red.
            </p>
          </div>

          <ReputationTester
            apiBaseUrl={API_BASE}
            onActionComplete={fetchRound}
          />

          {/* Academic Foundations & Footer */}
          <footer
            style={{
              paddingTop: 36,
              borderTop: '1px solid rgba(124,147,255,0.2)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 24,
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#9AA2C9',
              marginTop: 48,
            }}
          >
            <div>
              <strong style={{ color: '#fff' }}>Theoretical Foundations:</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.9 }}>
                <li><span style={{ color: '#7C93FF' }}>Nash Bargaining Solution (NBS)</span>: Cooperative game theory, Nash 1950</li>
                <li><span style={{ color: '#F2A65A' }}>Multi-Objective Tuning</span>: Hybrid GA/GWO Pareto frontier (Jain et al. 2022)</li>
                <li><span style={{ color: '#10B981' }}>Byzantine Trust Layer</span>: P2P Bayesian reputation decay $R_i$ (Kishor & Niyogi 2023)</li>
              </ul>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#7C93FF', fontWeight: 600, display: 'block', marginBottom: 4 }}>SynapseOS Enterprise Substrate</span>
              <span>Convex Optimization via CVXPY [Clarabel / ECOS]</span><br />
              <button
                onClick={() => scrollToSection(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#7C93FF',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  marginTop: 8,
                }}
              >
                ↑ Return to Top
              </button>
            </div>
          </footer>
        </section>

      </div>

      {/* Global CSS animations */}
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
      `}</style>
    </main>
  );
}
