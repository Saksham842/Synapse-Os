'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSynapseStore, DEPARTMENTS_DATA } from '@/lib/store';
import { SimulationRound } from '../types';
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
  Cpu
} from 'lucide-react';

// Single WebGL Canvas — no duplicate swarms!
const CinematicCanvas = dynamic(() => import('@/components/CinematicCanvas'), { ssr: false });
const SwarmInspectorDeck = dynamic(() => import('@/components/SwarmInspectorDeck'), { ssr: false });
const ContentPanel = dynamic(
  () => import('@/components/experience/ContentPanel').then((m) => ({ default: m.ContentPanel })),
  { ssr: false }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL   = API_BASE.replace(/^http/, 'ws') + '/ws/live';

const SCENES = [
  { id: 1, title: 'The Big Bang',       subtitle: 'Quantum Ignition',          range: [0.00, 0.15] as [number, number] },
  { id: 2, title: 'The Constellation',  subtitle: 'Harmonic Topology',         range: [0.15, 0.35] as [number, number] },
  { id: 3, title: 'Departmental Bloom', subtitle: 'Swarm Specialization',      range: [0.35, 0.55] as [number, number] },
  { id: 4, title: 'Synaptic Conduits',  subtitle: 'Streaming Telemetry',       range: [0.55, 0.70] as [number, number] },
  { id: 5, title: 'Priority Wave',      subtitle: 'Dynamic Orchestration',     range: [0.70, 0.85] as [number, number] },
  { id: 6, title: 'Equilibrium',        subtitle: 'Autonomous Enterprise OS',  range: [0.85, 1.00] as [number, number] },
];

const SWARM_OPTIONS = [
  { id: 'overview',   label: '✦ Swarm Orbit',       color: '#7C93FF' },
  { id: 'core',       label: '✦ Nash Core',         color: '#A3B4FF' },
  { id: 'Sales',      label: '✦ Sales',             color: '#7C93FF' },
  { id: 'Marketing',  label: '✦ Marketing',         color: '#F2A65A' },
  { id: 'Operations', label: '✦ Operations',        color: '#38EF7D' },
  { id: 'Intelligence', label: '✦ Intelligence',    color: '#B088FF' },
  { id: 'Customer',   label: '✦ Customer',          color: '#00F0FF' },
  { id: 'Back Office',label: '✦ Back Office',       color: '#FF6584' },
  { id: 'Deals',      label: '✦ Deals',             color: '#FFD166' },
  { id: 'benchmark',  label: '✦ Benchmarks',        color: '#10B981' },
  { id: 'weights',    label: '✦ Priority Weights',  color: '#F2A65A' },
  { id: 'reputation', label: '✦ Byzantine Test',    color: '#EF4444' },
];

function FeedBadge({ mode }: { mode: 'ws' | 'polling' | 'connecting' }) {
  const live = mode === 'ws';
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border backdrop-blur-md"
      style={{
        background: 'rgba(20,24,64,0.85)',
        borderColor: live ? 'rgba(16,185,129,0.4)' : 'rgba(242,166,90,0.4)',
      }}
    >
      <span className={`w-2 h-2 rounded-full ${live ? 'bg-[#10B981] animate-pulse' : 'bg-[#F2A65A] animate-ping'}`} />
      <span className="font-semibold uppercase" style={{ color: live ? '#10B981' : '#F2A65A' }}>
        {live ? 'WS Live' : mode === 'connecting' ? 'Connecting…' : 'Polling'}
      </span>
    </div>
  );
}

export default function HomePage() {
  const { scrollProgress, setScrollProgress, setActiveNode } = useSynapseStore();
  const cinematicRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [isInDashboard, setIsInDashboard] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  // Live simulation telemetry state
  const [currentRound, setCurrentRound] = useState<SimulationRound | null>(null);
  const [activeOption, setActiveOption] = useState('overview');
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
    const cinematicEl = cinematicRef.current;
    const dashboardEl = dashboardRef.current;
    if (!cinematicEl || !dashboardEl) return;

    const onScroll = () => {
      const scrolled = window.scrollY;
      const maxCin = cinematicEl.offsetHeight - window.innerHeight;
      const prog = Math.min(Math.max(scrolled / Math.max(maxCin, 1), 0), 1);
      setScrollProgress(prog);

      // Trigger dashboard dock when reaching the dashboard boundary
      const dashTop = dashboardEl.getBoundingClientRect().top;
      setIsInDashboard(dashTop <= window.innerHeight * 0.45);

      const idx = SCENES.findIndex((s) => prog >= s.range[0] && prog <= s.range[1]);
      if (idx !== -1) setSceneIdx(idx);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [setScrollProgress]);

  const goToDashboard = () => dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  const goToTop       = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
      setActiveNode(opt);
    }
  };

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
            isInDashboard={isInDashboard}
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
            onClick={goToTop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(20,24,64,0.85)',
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
          {isInDashboard && <FeedBadge mode={connMode} />}
        </div>

        <div style={{ pointerEvents: 'auto' }}>
          {!isInDashboard ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(20,24,64,0.85)',
                border: '1px solid rgba(124,147,255,0.3)',
                backdropFilter: 'blur(12px)',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            >
              <Compass style={{ width: 14, height: 14, color: '#7C93FF' }} />
              <span style={{ color: '#9AA2C9' }}>PHASE {sceneIdx + 1}/6:</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{SCENES[sceneIdx]?.title}</span>
              <span style={{ color: '#7C93FF', fontWeight: 700 }}>{Math.round(scrollProgress * 100)}%</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(20,24,64,0.9)',
                border: '1px solid rgba(16,185,129,0.4)',
                backdropFilter: 'blur(12px)',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ color: '#9AA2C9' }}>LIVE CONSOLE</span>
              {currentRound && <span style={{ color: '#10B981', fontWeight: 700 }}>Cycle #{round}</span>}
              <button
                onClick={goToTop}
                style={{
                  background: 'rgba(124,147,255,0.15)',
                  border: '1px solid rgba(124,147,255,0.3)',
                  borderRadius: 6,
                  padding: '2px 8px',
                  color: '#7C93FF',
                  cursor: 'pointer',
                  fontSize: 10,
                  marginLeft: 4,
                }}
              >
                Replay Odyssey
              </button>
            </div>
          )}
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
          const active = !isInDashboard && i === sceneIdx;
          return (
            <button
              key={s.id}
              onClick={() => {
                const max = (cinematicRef.current?.offsetHeight ?? 0) - window.innerHeight;
                window.scrollTo({ top: Math.max(0, (s.range[0] + 0.01) * max), behavior: 'smooth' });
              }}
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
        <div style={{ height: 1, background: 'rgba(124,147,255,0.2)', margin: '4px 0' }} />
        <button
          onClick={goToDashboard}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}
          title="Live Command Dashboard"
        >
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#10B981', opacity: isInDashboard ? 1 : 0, transition: 'opacity 0.3s' }}>
            Live Console
          </span>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: `1px solid ${isInDashboard ? '#10B981' : 'rgba(16,185,129,0.4)'}`,
              background: isInDashboard ? '#10B981' : 'transparent',
              boxShadow: isInDashboard ? '0 0 10px #10B981' : 'none',
              transition: 'all 0.3s',
            }}
          />
        </button>
      </nav>

      {/* ContentPanel Drawer for direct worker detail inspection */}
      {canvasReady && <ContentPanel />}

      {/* ═════════════════════════════════════════════════════════════════════
          SCROLL CONTENT CONTAINER
      ═════════════════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── CINEMATIC ODYSSEY (SECTIONS 1–6) ───────────────────────────── */}
        <div ref={cinematicRef}>

          {/* § 1 THE BIG BANG */}
          <section
            style={{
              minHeight: '135vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ maxWidth: 840, paddingTop: 60 }}>
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
                  marginBottom: 20,
                  backdropFilter: 'blur(8px)',
                }}
              >
                Phase 01 // Quantum Ignition
              </span>
              <h1
                style={{
                  fontSize: 'clamp(52px, 9vw, 108px)',
                  fontFamily: 'serif',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#fff',
                  textShadow: '0 0 60px rgba(124,147,255,0.6)',
                  margin: '0 0 20px',
                  lineHeight: 1.05,
                }}
              >
                SynapseOS
              </h1>
              <p
                style={{
                  fontSize: 'clamp(16px, 2.2vw, 21px)',
                  color: '#CAD4FF',
                  fontWeight: 300,
                  maxWidth: 620,
                  margin: '0 auto 32px',
                  lineHeight: 1.7,
                }}
              >
                The AI Workforce Operating System: 7 autonomous department Queens delegating to specialized worker swarms, coordinated through a shared Second Brain and governed by game-theoretic Nash compute allocation.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: 'rgba(184,197,255,0.85)',
                  background: 'rgba(20,24,64,0.6)',
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: '1px solid rgba(124,147,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C93FF', display: 'inline-block', animation: 'ping 1.5s infinite' }} />
                Scroll down to initiate the 6-phase architectural odyssey
              </div>
            </div>
          </section>

          {/* § 2 THE CONSTELLATION */}
          <section
            style={{
              minHeight: '145vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 6vw',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                maxWidth: 520,
                background: 'rgba(16,20,43,0.65)',
                padding: '36px 40px',
                borderRadius: 24,
                border: '1px solid rgba(124,147,255,0.3)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 0 40px rgba(124,147,255,0.15)',
              }}
            >
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
                  marginBottom: 16,
                }}
              >
                Phase 02 // Harmonic Topology
              </span>
              <h2 style={{ fontSize: 'clamp(30px,4.5vw,52px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                The Constellation
              </h2>
              <p style={{ fontSize: 16, color: '#D3D8EF', lineHeight: 1.75, margin: '0 0 20px' }}>
                Seven autonomous departmental Queens orbit a unified core. Every node is bound by a multi-directional neural web, permanently dismantling enterprise information silos.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'monospace', color: '#7C93FF' }}>
                <Sparkles style={{ width: 14, height: 14 }} />
                Interactive 3D: Click any Queen sphere to inspect its sub-agent hierarchy
              </div>
            </div>
          </section>

          {/* § 3 DEPARTMENTAL BLOOM */}
          <section
            style={{
              minHeight: '145vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              padding: '0 6vw',
              textAlign: 'right',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                maxWidth: 520,
                background: 'rgba(16,20,43,0.65)',
                padding: '36px 40px',
                borderRadius: 24,
                border: '1px solid rgba(56,239,125,0.3)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 0 40px rgba(56,239,125,0.12)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  background: 'rgba(56,239,125,0.15)',
                  color: '#38EF7D',
                  border: '1px solid rgba(56,239,125,0.35)',
                  marginBottom: 16,
                }}
              >
                Phase 03 // Swarm Specialization
              </span>
              <h2 style={{ fontSize: 'clamp(30px,4.5vw,52px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Departmental Bloom
              </h2>
              <p style={{ fontSize: 16, color: '#D3D8EF', lineHeight: 1.75 }}>
                Each Queen blossoms into fractal clusters of specialized worker sub-agents — from{' '}
                <span style={{ color: '#F2A65A', fontWeight: 600 }}>Lead Scrapers</span> and{' '}
                <span style={{ color: '#F2A65A', fontWeight: 600 }}>Outbound Drafters</span> to predictive{' '}
                <span style={{ color: '#38EF7D', fontWeight: 600 }}>Pipeline Scorers</span>.
              </p>
            </div>
          </section>

          {/* § 4 SYNAPTIC CONDUITS */}
          <section
            style={{
              minHeight: '140vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 6vw',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                maxWidth: 520,
                background: 'rgba(16,20,43,0.65)',
                padding: '36px 40px',
                borderRadius: 24,
                border: '1px solid rgba(124,147,255,0.3)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 0 40px rgba(124,147,255,0.15)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  background: 'rgba(124,147,255,0.15)',
                  color: '#7C93FF',
                  border: '1px solid rgba(124,147,255,0.35)',
                  marginBottom: 16,
                }}
              >
                Phase 04 // Synaptic Streaming
              </span>
              <h2 style={{ fontSize: 'clamp(30px,4.5vw,52px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Synaptic Conduits
              </h2>
              <p style={{ fontSize: 16, color: '#D3D8EF', lineHeight: 1.75 }}>
                Sub-millisecond data packets pulse continuously between worker agents, Queens, and the core. Zero batch exports, zero stale state — intelligence radiates live across the entire workforce graph.
              </p>
            </div>
          </section>

          {/* § 5 PRIORITY WAVE */}
          <section
            style={{
              minHeight: '145vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0 6vw',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                maxWidth: 640,
                background: 'rgba(16,20,43,0.65)',
                padding: '36px 44px',
                borderRadius: 24,
                border: '1px solid rgba(0,242,254,0.3)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 0 40px rgba(0,242,254,0.12)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  background: 'rgba(0,242,254,0.12)',
                  color: '#00F2FE',
                  border: '1px solid rgba(0,242,254,0.35)',
                  marginBottom: 16,
                }}
              >
                Phase 05 // Dynamic Orchestration
              </span>
              <h2 style={{ fontSize: 'clamp(30px,4.5vw,52px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Global Priority Wave
              </h2>
              <p style={{ fontSize: 16, color: '#D3D8EF', lineHeight: 1.75 }}>
                A macroscopic priority wave sweeps through the 46-node matrix — intersected nodes ignite with elevated compute cycle budgets and token velocity in real time.
              </p>
            </div>
          </section>

          {/* § 6 EQUILIBRIUM & LAUNCH INTO COMMAND DASHBOARD */}
          <section
            style={{
              minHeight: '135vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                maxWidth: 680,
                background: 'rgba(16,20,43,0.75)',
                padding: '44px 48px',
                borderRadius: 28,
                border: '1px solid rgba(124,147,255,0.4)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 60px rgba(124,147,255,0.2)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '5px 14px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  background: 'rgba(124,147,255,0.18)',
                  color: '#7C93FF',
                  border: '1px solid rgba(124,147,255,0.35)',
                  marginBottom: 20,
                }}
              >
                Phase 06 // Equilibrium
              </span>
              <h2 style={{ fontSize: 'clamp(36px,6vw,72px)', fontFamily: 'serif', fontWeight: 700, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
                SynapseOS
              </h2>
              <p style={{ fontSize: 18, color: '#CAD4FF', fontWeight: 500, letterSpacing: '0.04em', margin: '0 0 12px' }}>
                The AI Workforce Operating System
              </p>
              <p style={{ fontSize: 14, color: '#9AA2C9', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 32px' }}>
                7 department swarms coordinated and balanced through game-theoretic Nash bargaining. Scroll down to enter the Live Command Console.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={goToDashboard}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 28px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg,#7C93FF,#5A6FE8)',
                    color: '#10142B',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(124,147,255,0.6)',
                  }}
                >
                  <BarChart2 style={{ width: 16, height: 16 }} />
                  Enter Live Command Center
                  <ChevronDown style={{ width: 16, height: 16 }} />
                </button>
                <button
                  onClick={goToTop}
                  style={{
                    padding: '14px 24px',
                    borderRadius: 12,
                    background: '#1B2154',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    border: '1px solid rgba(124,147,255,0.4)',
                    cursor: 'pointer',
                  }}
                >
                  Replay Odyssey
                </button>
              </div>
            </div>
          </section>

        </div>
        {/* END CINEMATIC ODYSSEY */}

        {/* ═══════════════════════════════════════════════════════════════════
            LIVE COMMAND DASHBOARD (Integrated with the single 3D swarm)
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          ref={dashboardRef}
          style={{
            position: 'relative',
            minHeight: '100vh',
            paddingTop: 32,
            paddingBottom: 64,
          }}
        >
          {/* Visual Transition Separator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingBottom: 24, position: 'relative', zIndex: 10 }}>
            <div style={{ width: 1, height: 50, background: 'linear-gradient(to bottom, transparent, rgba(124,147,255,0.8), transparent)' }} />
            <span
              style={{
                padding: '6px 18px',
                borderRadius: 999,
                fontSize: 11,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#7C93FF',
                background: 'rgba(20,24,64,0.9)',
                border: '1px solid rgba(124,147,255,0.4)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 20px rgba(124,147,255,0.25)',
              }}
            >
              ✦ Live Command Dashboard ✦
            </span>
            <div style={{ width: 1, height: 24, background: 'linear-gradient(to bottom, rgba(124,147,255,0.5), transparent)' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 10, padding: '0 24px', maxWidth: 1600, margin: '0 auto' }}>

            {/* Dashboard Telemetry Header */}
            <header
              style={{
                position: 'relative',
                borderRadius: 18,
                overflow: 'hidden',
                padding: '20px 28px',
                border: '1px solid rgba(124,147,255,0.35)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                background: 'linear-gradient(135deg,rgba(20,24,64,0.92),rgba(14,17,45,0.95))',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 50px rgba(124,147,255,0.12)',
                marginBottom: 20,
              }}
            >
              <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#7C93FF,#F2A65A,#38EF7D,#00F0FF,#7C93FF)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    position: 'relative',
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    border: '1px solid rgba(124,147,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(124,147,255,0.12)',
                    boxShadow: '0 0 20px rgba(124,147,255,0.35)',
                  }}
                >
                  <Cpu style={{ width: 22, height: 22, color: '#7C93FF' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(20px,2.6vw,26px)', fontWeight: 700, color: '#fff', margin: 0 }}>
                    SynapseOS <span style={{ color: '#7C93FF', fontFamily: 'sans-serif', fontSize: 16, fontWeight: 400 }}>| Autonomous Workforce Allocator</span>
                  </h2>
                  <p style={{ fontSize: 11, color: '#9AA2C9', fontFamily: 'monospace', margin: '4px 0 0' }}>
                    Game-theoretic CPU cycle bargaining · Bayesian trust decay · 7 Queen department swarms
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <FeedBadge mode={connMode} />
                {currentRound && (
                  <div style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontFamily: 'monospace', background: 'rgba(20,24,64,0.85)', border: '1px solid rgba(124,147,255,0.3)' }}>
                    <span style={{ color: '#9AA2C9' }}>Cycle: </span>
                    <span style={{ color: '#7C93FF', fontWeight: 700 }}>#{round}</span>
                  </div>
                )}
              </div>
            </header>

            {/* 4 KPI Metric Tiles */}
            {currentRound && nash && comp ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 20 }}>
                {[
                  {
                    label: 'Shared Capacity',
                    val: `${F_max.toFixed(1)}`,
                    unit: 'k-cyc/s',
                    sub: `${nash.total_cpu_used.toFixed(1)} utilized`,
                    color: '#7C93FF',
                    click: () => handleSelectOption('core'),
                  },
                  {
                    label: 'Nash Utility Gain',
                    val: `+${nash.total_utility.toFixed(2)}`,
                    unit: 'pts',
                    sub: 'Convex Global Maximum',
                    color: '#10B981',
                    click: () => handleSelectOption('benchmark'),
                  },
                  {
                    label: 'FCFS Gap',
                    val: `+${comp.utility_gap_fcfs.toFixed(2)}`,
                    unit: 'pts',
                    sub: 'Starvation Prevented',
                    color: '#F2A65A',
                    click: () => handleSelectOption('benchmark'),
                  },
                  {
                    label: 'Equal-Split Surplus',
                    val: `+${comp.utility_gap_equal.toFixed(2)}`,
                    unit: 'pts',
                    sub: 'Heterogeneous Surplus',
                    color: '#00F0FF',
                    click: () => handleSelectOption('weights'),
                  },
                ].map((k) => (
                  <div
                    key={k.label}
                    onClick={k.click}
                    style={{
                      cursor: 'pointer',
                      padding: '16px 18px',
                      borderRadius: 16,
                      border: '1px solid rgba(124,147,255,0.25)',
                      background: 'rgba(20,24,64,0.82)',
                      backdropFilter: 'blur(16px)',
                      transition: 'transform 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = k.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(124,147,255,0.25)';
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#9AA2C9', fontFamily: 'monospace', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      {k.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: k.color }}>{k.val}</span>
                      <span style={{ fontSize: 11, color: '#9AA2C9', fontFamily: 'monospace' }}>{k.unit}</span>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: k.color, marginTop: 4, display: 'block' }}>{k.sub}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Quick 3D Swarm Option Selector Bar */}
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
                Inspect 3D:
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

            {/* Dynamic Swarm Inspector Deck */}
            {currentRound && nash && comp ? (
              <div style={{ marginTop: 8 }}>
                <SwarmInspectorDeck
                  activeOption={activeOption}
                  allocations={nash.allocations}
                  F_max={F_max}
                  comparison={comp}
                  weights={weights}
                  onWeightsChange={async (w) => {
                    try {
                      await fetch(`${API_BASE}/simulation/weights?w1=${w.w1}&w2=${w.w2}&w3=${w.w3}`, { method: 'POST' });
                      fetchRound();
                    } catch {}
                  }}
                  apiBaseUrl={API_BASE}
                  onActionComplete={fetchRound}
                  onResetToOverview={() => handleSelectOption('overview')}
                  onSelectQueen={handleSelectOption}
                />
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '80px 0',
                  gap: 20,
                  background: 'rgba(20,24,64,0.6)',
                  borderRadius: 24,
                  border: '1px solid rgba(124,147,255,0.2)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '1px solid rgba(124,147,255,0.6)',
                        animation: `ping 1.6s ${i * 0.4}s infinite`,
                        opacity: 0.6 - i * 0.18,
                      }}
                    />
                  ))}
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(124,147,255,0.2)',
                      border: '2px solid #7C93FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#7C93FF', boxShadow: '0 0 12px #7C93FF' }} />
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                    Connecting to SynapseOS Swarm Engine
                  </h3>
                  <p style={{ fontSize: 12, color: '#9AA2C9', fontFamily: 'monospace', margin: '0 0 6px' }}>
                    WebSocket: <span style={{ color: '#7C93FF' }}>{WS_URL}</span>
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(154,162,201,0.6)', fontFamily: 'monospace' }}>
                    Backend command: <span style={{ color: '#fff' }}>python -m uvicorn app.main:app --host 127.0.0.1 --port 8000</span>
                  </p>
                </div>
              </div>
            )}

            {/* Platform Footer */}
            <footer
              style={{
                paddingTop: 32,
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
                  <li><span style={{ color: '#F2A65A' }}>Multi-Objective Tuning</span>: Hybrid GA/GWO Pareto frontier</li>
                  <li><span style={{ color: '#10B981' }}>Byzantine Trust Layer</span>: P2P Bayesian reputation decay $R_i$</li>
                </ul>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#7C93FF', fontWeight: 600, display: 'block', marginBottom: 4 }}>SynapseOS Core Platform</span>
                <span>Convex Optimization via CVXPY [Clarabel / ECOS]</span><br />
                <button
                  onClick={goToTop}
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
                  ↑ Replay Cinematic Journey
                </button>
              </div>
            </footer>
          </div>
        </div>

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
