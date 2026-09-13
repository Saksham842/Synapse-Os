"""
SynapseOS Sales Queen — Real Working Department Orchestrator.

Architecture:
The Sales Queen delegates work to two specialized autonomous worker agents:
1. Lead Scraper Worker: Generates plausible prospect target profiles matching the
   caller's target description. (Note: LLM-generated placeholder profiles; external
   web scraping and domain enrichment are stubbed for now).
2. Outbound Drafter Worker: Crafts hyper-personalized 3-4 sentence outreach emails
   tailored to each prospect's business context.

Resource Governance & Modeling Gap:
- In the theoretical literature (Kumar et al., 2023), allocated rate f_i represents
  physical CPU cycle rates (k-cycles/sec).
- Real LLM agent execution is bottlenecked by network I/O, LLM API latency, and provider
  rate limits rather than local CPU cycles.
- Modeling Bridge: The allocated f_i is mapped to an execution concurrency / pacing budget.
  If the Nash allocator grants Sales a low f_i (high contention from other Queens or low F_max),
  the Queen inserts deliberate pacing delays between worker steps, visibly throttling task
  completion time. When f_i is high, the pipeline runs unconstrained with minimal pacing delay.
"""

import time
import json
import asyncio
import logging
from typing import Dict, Any, List, Optional
from app.llm_client import llm_client
from app.models import Queen
from app.allocator import solve_nash_allocation
from app.reputation import get_reputation, update_reputation
from app.simulator import simulator, QUEEN_PROFILES

logger = logging.getLogger("synapseos.sales_queen")


class SalesQueen:
    """
    Autonomous Sales Department Queen.
    Coordinates Lead Scraper and Outbound Drafter workers under game-theoretic
    resource allocation constraints.
    """

    def __init__(self):
        self.department_name = "Sales"
        self.last_run_mode: str = "mock"
        self.last_run_telemetry: Optional[Dict[str, Any]] = None

    async def run_sales_goal(
        self,
        goal: str = "Enterprise SaaS outbound pipeline generation",
        target_desc: str = "B2B SaaS companies with 50-200 employees",
        num_leads: int = 3,
        deadline_s: float = 20.0,
        forced_f_max: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Executes a real sales pipeline goal under mediated Nash resource allocation.

        Steps:
        1. Pre-estimate workload (W_i) and task value (V_i) from goal metadata.
        2. Solicit cycle allocation f_i from the Nash allocator alongside competitor Queens.
        3. Map f_i to pacing delay (lower f_i forces slower step pacing).
        4. Worker 1 (Lead Scraper): generate num_leads candidate prospects.
        5. Worker 2 (Outbound Drafter): draft personalized outreach for each prospect.
        6. Report outcome (claimed W_i vs actual LLM tokens used) to update Sales reputation.

        Returns:
            {
                "department": "Sales",
                "goal": goal,
                "target_desc": target_desc,
                "leads": List[dict],
                "emails": List[dict],
                "elapsed_seconds": float,
                "tokens_used": int,
                "mode": "live" | "mock",
                "allocation": {
                    "f_i": float,
                    "claimed_V": float,
                    "claimed_W": float,
                    "actual_W": int,
                    "deadline_s": float,
                    "reputation_before": float,
                    "reputation_after": float,
                    "pacing_delay_s": float,
                    "F_max": float
                }
            }
        """
        start_wall_clock = time.time()
        num_leads = max(1, min(10, int(num_leads)))

        # -------------------------------------------------------------
        # STEP 1: Pre-Execution Bidding Estimation
        # -------------------------------------------------------------
        # Value heuristic: urgent or strategic deals claim higher V
        goal_lower = goal.lower()
        if any(w in goal_lower for w in ["urgent", "critical", "asap", "tier-1", "q4"]):
            claimed_V = 13.0
        elif any(w in goal_lower for w in ["low", "exploratory", "passive"]):
            claimed_V = 6.0
        else:
            claimed_V = 10.0  # standard medium priority

        # Workload heuristic: ~800 tokens per lead expected
        tokens_per_lead_est = 800
        claimed_W = float(num_leads * tokens_per_lead_est)
        rep_before = get_reputation(self.department_name)

        # -------------------------------------------------------------
        # STEP 2: Resource Allocation via Nash Bargaining
        # -------------------------------------------------------------
        f_max = forced_f_max if forced_f_max is not None else simulator.F_max
        allocator_W = float(num_leads * 12.0)
        allocator_D = max(0.9, min(2.0, float(deadline_s) / max(1, num_leads * 2)))

        sales_queen_bid = Queen(
            name=self.department_name,
            V=claimed_V,
            W=allocator_W,
            D=allocator_D,
            reputation=rep_before,
        )

        # Build competitor Queen bids from simulator's active queued distributions
        competitor_queens = []
        for name, profile in QUEEN_PROFILES.items():
            if name == self.department_name:
                continue
            rep = get_reputation(name)
            v_mid = (profile["V_range"][0] + profile["V_range"][1]) / 2.0
            w_mid = (profile["W_range"][0] + profile["W_range"][1]) / 2.0
            d_mid = (profile["D_range"][0] + profile["D_range"][1]) / 2.0
            competitor_queens.append(Queen(name=name, V=v_mid, W=w_mid, D=d_mid, reputation=rep))

        # Solve cooperative Nash Bargaining
        all_queens = [sales_queen_bid] + competitor_queens
        nash_solution = solve_nash_allocation(
            F_max=f_max,
            queens=all_queens,
            w1=simulator.w1,
            w2=simulator.w2,
            w3=simulator.w3,
        )

        # Extract Sales's allocated rate f_i
        sales_alloc = next(
            (a for a in nash_solution.allocations if a.name == self.department_name),
            None,
        )
        allocated_f_i = sales_alloc.f_i if sales_alloc else (f_max / len(all_queens))

        # -------------------------------------------------------------
        # STEP 3: Map f_i to Concurrency / Pacing Delay Budget
        # Modeling gap bridge: low allocation throttles pipeline pace
        # -------------------------------------------------------------
        # Baseline ideal f_i for Sales is ~8-10 k-cyc/s.
        # If f_i is low (e.g. 2.0 under low F_max), pacing delay increases to throttle execution.
        if allocated_f_i < 6.0:
            pacing_delay_s = round(max(0.6, (8.0 - allocated_f_i) * 0.35), 2)
        elif allocated_f_i < 8.5:
            pacing_delay_s = round(max(0.2, (8.5 - allocated_f_i) * 0.15), 2)
        else:
            pacing_delay_s = 0.05  # high capacity: minimal pacing friction

        logger.info(
            f"Sales Queen resource allocation: f_i={allocated_f_i:.2f} (F_max={f_max}). "
            f"Mapped pacing delay: {pacing_delay_s}s per worker step."
        )

        total_tokens_used = 0
        step_modes: List[str] = []

        # -------------------------------------------------------------
        # STEP 4: Worker Agent 1 — Lead Scraper Worker
        # -------------------------------------------------------------
        lead_prompt = (
            f"Generate exactly {num_leads} realistic B2B target company lead profiles for the following criteria:\n"
            f"Target Description: {target_desc}\n"
            f"Goal: {goal}\n\n"
            f"Return a strict JSON array of objects with keys: 'name', 'title', 'company', 'fit_reason'. "
            f"No markdown fences, no explanatory text, just the raw JSON array."
        )

        lead_result = await llm_client.generate(
            prompt=lead_prompt,
            system_prompt="You are an enterprise sales intelligence worker. Output only valid JSON arrays.",
        )
        total_tokens_used += lead_result.get("tokens_used", 350)
        step_modes.append(lead_result.get("mode", "mock"))

        # Parse generated lead profiles (LLM placeholder data)
        raw_text = lead_result.get("text", "")
        leads: List[Dict[str, Any]] = []
        try:
            # Clean possible markdown wrapping
            clean_json = raw_text.strip()
            if clean_json.startswith("```"):
                clean_json = clean_json.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            leads = json.loads(clean_json)
            if not isinstance(leads, list):
                leads = [leads]
        except Exception:
            leads = []

        # Ensure exact count of leads
        leads = leads[:num_leads]
        while len(leads) < num_leads:
            i = len(leads)
            leads.append({
                "name": f"Enterprise Prospect {i+1}",
                "title": "VP of Revenue Operations",
                "company": f"Nexus Tech {i+1}",
                "fit_reason": f"Matches criteria: {target_desc}",
            })

        # Apply allocator pacing delay before transitioning to next worker
        if pacing_delay_s > 0:
            await asyncio.sleep(pacing_delay_s)

        # -------------------------------------------------------------
        # STEP 5: Worker Agent 2 — Outbound Drafter Worker
        # -------------------------------------------------------------
        emails: List[Dict[str, Any]] = []
        for lead in leads[:num_leads]:
            draft_prompt = (
                f"Write a concise, high-converting 3-sentence B2B outbound email from Alex at SynapseOS to:\n"
                f"Prospect: {lead.get('name')} ({lead.get('title')} at {lead.get('company')})\n"
                f"Context: {lead.get('fit_reason')}\n"
                f"Value proposition: SynapseOS coordinates autonomous AI department swarms under cooperative "
                f"game-theoretic CPU allocation, ensuring mission-critical workflows never starve.\n"
                f"Include a soft call to action."
            )

            email_result = await llm_client.generate(
                prompt=draft_prompt,
                system_prompt="You are an expert executive copywriter. Keep it to 3-4 impactful sentences.",
            )
            total_tokens_used += email_result.get("tokens_used", 250)
            step_modes.append(email_result.get("mode", "mock"))

            emails.append({
                "recipient": f"{lead.get('name')} <{lead.get('company', 'Enterprise')}>",
                "subject": f"Autonomous agent orchestration for {lead.get('company')}",
                "body": email_result.get("text", ""),
                "tokens": email_result.get("tokens_used", 0),
            })

            # Pacing delay between sequential email generations if allocated bandwidth is low
            if pacing_delay_s > 0:
                await asyncio.sleep(pacing_delay_s)

        # -------------------------------------------------------------
        # STEP 6: Outcome Reporting & Bayesian Reputation Update
        # -------------------------------------------------------------
        # Claimed W vs Actual tokens used
        rep_after = update_reputation(
            queen_name=self.department_name,
            claimed_value=claimed_W,
            actual_value=float(total_tokens_used),
        )

        overall_mode = "live" if all(m == "live" for m in step_modes) else "mock"
        elapsed_seconds = round(time.time() - start_wall_clock, 2)

        self.last_run_mode = overall_mode
        self.last_run_telemetry = {
            "department": self.department_name,
            "goal": goal,
            "target_desc": target_desc,
            "num_leads": len(leads),
            "elapsed_seconds": elapsed_seconds,
            "tokens_used": total_tokens_used,
            "mode": overall_mode,
            "allocation": {
                "f_i": round(allocated_f_i, 2),
                "claimed_V": claimed_V,
                "claimed_W": claimed_W,
                "actual_W": total_tokens_used,
                "deadline_s": deadline_s,
                "reputation_before": round(rep_before, 3),
                "reputation_after": round(rep_after, 3),
                "pacing_delay_s": pacing_delay_s,
                "F_max": f_max,
            },
        }

        return {
            "department": self.department_name,
            "goal": goal,
            "target_desc": target_desc,
            "leads": leads,
            "emails": emails,
            "elapsed_seconds": elapsed_seconds,
            "tokens_used": total_tokens_used,
            "mode": overall_mode,
            "allocation": self.last_run_telemetry["allocation"],
        }


# Singleton instance
sales_queen = SalesQueen()
