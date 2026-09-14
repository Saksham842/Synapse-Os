"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";
import { AllocationResponse } from "../types";

interface UtilityComparisonChartProps {
  comparison: AllocationResponse;
}

export default function UtilityComparisonChart({
  comparison,
}: UtilityComparisonChartProps) {
  const { nash, equal_split, fcfs, utility_gap_fcfs, utility_gap_equal } = comparison;

  // Overview data for total system utility
  const totalData = [
    {
      name: "Nash Bargaining",
      utility: nash.total_utility,
      cpu: nash.total_cpu_used,
      fill: "#7C93FF",
      isBest: true,
      description: "Convex Game-Theoretic Solution"
    },
    {
      name: "Equal Split",
      utility: equal_split.total_utility,
      cpu: equal_split.total_cpu_used,
      fill: "#222B63",
      isBest: false,
      description: "Naive F_max / n"
    },
    {
      name: "First-Come-First-Served",
      utility: fcfs.total_utility,
      cpu: fcfs.total_cpu_used,
      fill: "#2D3748",
      isBest: false,
      description: "Greedy Unconstrained Optimum"
    },
  ];

  // Per-Queen comparison data
  const perQueenData = nash.allocations.map((nashAlloc, idx) => {
    const eqAlloc = equal_split.allocations[idx];
    const fcfsAlloc = fcfs.allocations[idx];
    return {
      name: nashAlloc.name,
      Nash: nashAlloc.U_i,
      Equal: eqAlloc ? eqAlloc.U_i : 0,
      FCFS: fcfsAlloc ? fcfsAlloc.U_i : 0,
    };
  });

  return (
    <div className="bg-[var(--panel)] border border-[var(--panel-border)] rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-serif text-lg text-[var(--text-main)] font-semibold tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-amber)] inline-block" />
              Allocation Method Benchmark
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Comparison across Game-Theoretic Nash Bargaining vs. Naive Baselines
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(124,147,255,0.15)] text-[var(--accent-blue)] border border-[var(--panel-border)] font-semibold">
            Slide 11 Baseline
          </span>
        </div>

        {/* Total System Utility Grouped Bar Chart */}
        <div className="h-[220px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={totalData}
              margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                stroke="rgba(242, 166, 90, 0.15)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9AA2C9", fontSize: 11 }}
                axisLine={{ stroke: "rgba(124, 147, 255, 0.2)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9AA2C9", fontSize: 11 }}
                axisLine={{ stroke: "rgba(124, 147, 255, 0.2)" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1B2154",
                  borderColor: "rgba(124, 147, 255, 0.3)",
                  borderRadius: "8px",
                  color: "#F5F6FA",
                  fontSize: "12px",
                }}
                formatter={(value: any, name: any, props: any) => [
                  `Utility: ${value} (CPU: ${props.payload.cpu} k-cyc/s)`,
                  props.payload.description,
                ]}
              />
              <Bar dataKey="utility" radius={[6, 6, 0, 0]}>
                {totalData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke={entry.isBest ? "#7C93FF" : "rgba(124, 147, 255, 0.3)"}
                    strokeWidth={entry.isBest ? 2 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Numeric Utility Gap Callout Banner */}
      <div className="mt-4 pt-4 border-t border-[var(--panel-border)]">
        <div className="bg-[var(--panel-alt)] border border-[rgba(242,166,90,0.3)] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(242,166,90,0.15)] flex items-center justify-center text-[var(--accent-amber)] font-bold text-base font-mono">
              ΔU
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider">
                Nash vs. FCFS Efficiency Advantage
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                Nash Bargaining prevents tail-agent starvation, boosting system utility by
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-[var(--accent-amber)]">
              +{utility_gap_fcfs.toFixed(2)} pts
            </div>
            <div className="text-[10px] text-[var(--accent-blue)]">
              (+{utility_gap_equal.toFixed(2)} pts over Equal Split)
            </div>
          </div>
        </div>

        {/* FCFS Starvation Warning if FCFS is negative */}
        {fcfs.total_utility < 0 && (
          <div className="mt-2 text-[11px] text-[var(--danger)] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>FCFS Tragedy of the Commons:</strong> Greedy unconstrained optimums depleted capacity, causing later Queens to miss deadlines by large margins and cratering utility.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
