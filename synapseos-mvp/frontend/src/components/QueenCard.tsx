"use client";

import React from "react";
import { QueenAllocationResult } from "../types";
import { useSynapseStore } from "@/lib/store";
import { ExternalLink } from "lucide-react";

interface QueenCardProps {
  alloc: QueenAllocationResult;
  isSelected?: boolean;
  onSelect?: () => void;
  description?: string;
  accentColor?: string;
}

export default function QueenCard({
  alloc,
  isSelected,
  onSelect,
  description,
  accentColor = "#7C93FF",
}: QueenCardProps) {
  const { name, raw_V, reputation, effective_V, W, D, f_i, T_i, breach, U_i } = alloc;
  const { setActiveNode } = useSynapseStore();

  const getRepBadge = (score: number) => {
    if (score >= 0.85) {
      return {
        label: "Honest",
        bg: "bg-[rgba(16,185,129,0.15)]",
        border: "border-[rgba(16,185,129,0.35)]",
        text: "text-[#10B981]",
      };
    }
    if (score >= 0.5) {
      return {
        label: "Degraded",
        bg: "bg-[rgba(242,166,90,0.15)]",
        border: "border-[rgba(242,166,90,0.35)]",
        text: "text-[#F2A65A]",
      };
    }
    return {
      label: "Penalized",
      bg: "bg-[rgba(239,68,68,0.15)]",
      border: "border-[rgba(239,68,68,0.35)]",
      text: "text-[#EF4444]",
    };
  };

  const badge = getRepBadge(reputation);
  const isBreached = breach > 0;

  const handleClick = () => {
    if (onSelect) onSelect();
  };

  const handleInspect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect();
    setActiveNode(name);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-4 border backdrop-blur-md shadow-lg hover:shadow-2xl hover:scale-[1.02] group ${
        isSelected
          ? "border-[#7C93FF] ring-2 ring-[#7C93FF]/40 bg-[rgba(27,33,84,0.85)]"
          : "border-[rgba(124,147,255,0.2)] bg-[rgba(20,24,64,0.7)] hover:border-[rgba(124,147,255,0.4)]"
      }`}
      style={{
        boxShadow: isSelected
          ? `0 0 24px -4px ${accentColor}40`
          : undefined,
      }}
    >
      {/* Top Accent Indicator */}
      <span
        className="absolute top-0 left-4 right-4 h-[1px] opacity-40 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }}
      />

      {/* Top Header */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full shadow-[0_0_8px]"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
          <div>
            <h4 className="font-serif font-bold text-white text-sm tracking-wide group-hover:text-[#7C93FF] transition-colors">
              {name}
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 font-mono">
              {description || "Autonomous Queen Swarm"}
            </p>
          </div>
        </div>

        {/* Reputation Badge */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${badge.bg} ${badge.border} ${badge.text}`}
          title={`Trust score: ${reputation.toFixed(2)}. Claim accuracy discounts priority.`}
        >
          <span>R:{reputation.toFixed(2)}</span>
          <span className="text-[8px] uppercase">({badge.label})</span>
        </div>
      </div>

      {/* Primary Decision Metric: Allocated CPU */}
      <div className="my-2.5 bg-[rgba(16,20,43,0.7)] rounded-xl p-2.5 border border-[rgba(124,147,255,0.15)]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[var(--text-muted)] font-mono text-[10px]">Cycle Rate (f_i)</span>
          <span className="text-[#7C93FF] font-mono font-bold text-sm">
            {f_i.toFixed(2)}{" "}
            <span className="text-[10px] font-normal text-[var(--text-muted)]">k-cyc/s</span>
          </span>
        </div>
        {/* Dynamic progress meter */}
        <div className="w-full bg-[rgba(124,147,255,0.1)] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (f_i / 15) * 100)}%`,
              backgroundColor: accentColor,
              boxShadow: `0 0 8px ${accentColor}`,
            }}
          />
        </div>
      </div>

      {/* Bid Parameters & Realization Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
        <div className="bg-[rgba(14,17,38,0.7)] p-2 rounded-lg border border-[rgba(124,147,255,0.12)]">
          <span className="text-[var(--text-muted)] block text-[9px]">Priority (V)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-bold text-white">{raw_V}</span>
            {reputation < 0.99 && (
              <span className="text-[#F2A65A] text-[9px]" title="Discounted by reputation">
                → {effective_V}
              </span>
            )}
          </div>
        </div>

        <div className="bg-[rgba(14,17,38,0.7)] p-2 rounded-lg border border-[rgba(124,147,255,0.12)]">
          <span className="text-[var(--text-muted)] block text-[9px]">Workload (W)</span>
          <span className="font-bold text-white block mt-0.5">{W} k-cyc</span>
        </div>

        <div className="bg-[rgba(14,17,38,0.7)] p-2 rounded-lg border border-[rgba(124,147,255,0.12)]">
          <span className="text-[var(--text-muted)] block text-[9px]">Exec vs. Deadline</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={isBreached ? "text-[#EF4444] font-bold" : "text-white"}>
              {T_i.toFixed(2)}s
            </span>
            <span className="text-[var(--text-muted)]">/ {D}s</span>
          </div>
        </div>

        <div className="bg-[rgba(14,17,38,0.7)] p-2 rounded-lg border border-[rgba(124,147,255,0.12)]">
          <span className="text-[var(--text-muted)] block text-[9px]">Realized Utility</span>
          <span
            className={`font-bold block mt-0.5 ${
              U_i >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
            }`}
          >
            {U_i >= 0 ? `+${U_i}` : U_i}
          </span>
        </div>
      </div>

      {/* Card Footer: SLA status + Inspect Button */}
      <div className="mt-2.5 pt-2 border-t border-[rgba(124,147,255,0.1)] flex items-center justify-between text-[10px] font-mono">
        {isBreached ? (
          <span className="text-[#EF4444] font-bold">SLA: +{breach.toFixed(2)}s Miss</span>
        ) : (
          <span className="text-[#10B981]">SLA Fulfilled</span>
        )}

        <button
          onClick={handleInspect}
          className="flex items-center gap-1 text-[#7C93FF] hover:text-white px-2 py-0.5 rounded hover:bg-[#7C93FF]/20 transition"
        >
          <span>Inspect</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
