import asyncio
import logging
import random
import time
from collections import deque
from typing import Dict, List, Optional
from app.models import Queen, AllocationResponse
from app.allocator import compare_allocations
from app.reputation import get_reputation

logger = logging.getLogger("synapseos.simulator")

# 5 Defined Queens with realistic operational distributions
QUEEN_PROFILES = {
    "Sales": {
        "description": "Sales Orchestrator (Lead scrapers, CRM enrichment)",
        "V_range": (8.5, 12.0),
        "W_range": (35.0, 48.0),
        "D_range": (0.9, 1.4),
        "color": "#7C93FF"
    },
    "Marketing": {
        "description": "Campaign Director (SEO strategist, content engine)",
        "V_range": (5.5, 8.5),
        "W_range": (24.0, 36.0),
        "D_range": (1.2, 1.8),
        "color": "#A78BFA"
    },
    "Operations": {
        "description": "Operations Director (Workflow execution, health triage)",
        "V_range": (6.0, 9.5),
        "W_range": (20.0, 32.0),
        "D_range": (1.0, 1.5),
        "color": "#38BDF8"
    },
    "Intelligence": {
        "description": "Research Nexus (Competitor diff, market synthesis)",
        "V_range": (3.5, 6.0),
        "W_range": (18.0, 26.0),
        "D_range": (1.6, 2.4),
        "color": "#34D399"
    },
    "Customer": {
        "description": "Customer Success (Ticket triage, sentiment classification)",
        "V_range": (2.5, 5.0),
        "W_range": (12.0, 22.0),
        "D_range": (1.8, 3.0),
        "color": "#F472B6"
    }
}


class SimulationHarness:
    def __init__(self, max_history: int = 50):
        self.history = deque(maxlen=max_history)
        self.round_number = 0
        self.is_running = False
        self.interval_seconds = 4.0
        self.F_max = 35.0  # Capacity sized appropriately for 5 queens
        self.w1 = 1.0
        self.w2 = 0.01
        self.w3 = 2.0
        self.broadcast_callback = None

    def set_weights(self, w1: float, w2: float, w3: float):
        self.w1 = w1
        self.w2 = w2
        self.w3 = w3

    def sample_current_queens(self) -> List[Queen]:
        queens = []
        for name, profile in QUEEN_PROFILES.items():
            rep = get_reputation(name)
            v = round(random.uniform(*profile["V_range"]), 2)
            w = round(random.uniform(*profile["W_range"]), 2)
            d = round(random.uniform(*profile["D_range"]), 2)
            queens.append(Queen(name=name, V=v, W=w, D=d, reputation=rep))
        return queens

    def tick(self) -> Dict:
        self.round_number += 1
        queens = self.sample_current_queens()
        
        comparison = compare_allocations(
            F_max=self.F_max,
            queens=queens,
            w1=self.w1,
            w2=self.w2,
            w3=self.w3
        )

        round_data = {
            "round": self.round_number,
            "timestamp": time.time(),
            "F_max": self.F_max,
            "weights": {"w1": self.w1, "w2": self.w2, "w3": self.w3},
            "comparison": comparison.model_dump(),
            "profiles": QUEEN_PROFILES
        }

        self.history.append(round_data)
        return round_data

    async def run_loop(self):
        self.is_running = True
        logger.info("Simulation harness loop started")
        while self.is_running:
            try:
                round_data = self.tick()
                if self.broadcast_callback:
                    await self.broadcast_callback(round_data)
            except Exception as e:
                logger.error(f"Error in simulation tick: {e}", exc_info=True)
            await asyncio.sleep(self.interval_seconds)

    def stop(self):
        self.is_running = False


# Global simulator instance
simulator = SimulationHarness()
