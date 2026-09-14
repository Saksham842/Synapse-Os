"use client";

import React, { useState } from "react";

interface ReputationTesterProps {
  apiBaseUrl: string;
  onActionComplete?: () => void;
}

export default function ReputationTester({
  apiBaseUrl,
  onActionComplete,
}: ReputationTesterProps) {
  const [loading, setLoading] = useState(false);
  const [lastLog, setLastLog] = useState<string | null>(null);

  const reportOutcome = async (
    queenName: string,
    claimed: number,
    actual: number
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/report_outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queen_name: queenName,
          claimed_value: claimed,
          actual_value: actual,
          alpha: 0.9,
        }),
      });
      const data = await res.json();
      setLastLog(
        `Reported ${queenName}: Claimed ${claimed}, Actual ${actual} → New Trust Score R = ${data.new_reputation}`
      );
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setLastLog(`Error reporting outcome: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetReputations = async () => {
    setLoading(true);
    try {
      await fetch(`${apiBaseUrl}/reputation/reset`, { method: "POST" });
      setLastLog("All Queen reputations reset to 1.0 baseline.");
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setLastLog(`Error resetting: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--panel)] border border-[var(--panel-border)] rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-serif text-lg text-[var(--text-main)] font-semibold tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-amber)] inline-block" />
            Trust & Reputation Stress-Tester (Section 4 & 7.1)
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Demonstrates why cryptographic signing alone is insufficient: dishonest bids trigger reputation decay R_i(t+1) = &alpha; &middot; R_i + (1 - &alpha;) &middot; accuracy, penalizing future CPU allocation.
          </p>
        </div>
        <button
          onClick={resetReputations}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--panel-alt)] hover:bg-[rgba(239,68,68,0.2)] text-[var(--text-muted)] hover:text-[var(--danger)] border border-[var(--panel-border)] transition"
        >
          Reset All to 1.0
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        <button
          onClick={() => reportOutcome("Sales", 25.0, 4.0)}
          disabled={loading}
          className="flex flex-col text-left p-3 rounded-xl bg-[var(--panel-alt)] hover:border-[var(--accent-amber)] border border-[var(--panel-border)] transition group"
        >
          <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-amber)]">
            Inject Dishonest Bid (Sales)
          </span>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
            Claimed V=25.0, Realized=4.0
          </span>
          <span className="text-[10px] text-[var(--danger)] mt-2 font-mono">
            Accuracy 0.16 → Rapid Decay
          </span>
        </button>

        <button
          onClick={() => reportOutcome("Marketing", 16.0, 8.0)}
          disabled={loading}
          className="flex flex-col text-left p-3 rounded-xl bg-[var(--panel-alt)] hover:border-[var(--accent-amber)] border border-[var(--panel-border)] transition group"
        >
          <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-amber)]">
            Inject Moderate Overbid (Marketing)
          </span>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
            Claimed V=16.0, Realized=8.0
          </span>
          <span className="text-[10px] text-[var(--accent-amber)] mt-2 font-mono">
            Accuracy 0.50 → Mild Decay
          </span>
        </button>

        <button
          onClick={() => reportOutcome("Sales", 10.0, 10.0)}
          disabled={loading}
          className="flex flex-col text-left p-3 rounded-xl bg-[var(--panel-alt)] hover:border-[var(--success)] border border-[var(--panel-border)] transition group"
        >
          <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--success)]">
            Report Honest Outcome (Sales)
          </span>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
            Claimed V=10.0, Realized=10.0
          </span>
          <span className="text-[10px] text-[var(--success)] mt-2 font-mono">
            Accuracy 1.00 → Rehabilitation
          </span>
        </button>
      </div>

      {lastLog && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-[var(--panel-alt)] border border-[var(--panel-border)] text-xs font-mono text-[var(--accent-amber)] flex items-center justify-between">
          <span>{lastLog}</span>
          <span className="text-[10px] text-[var(--text-muted)]">Live SQLite Update</span>
        </div>
      )}
    </div>
  );
}
