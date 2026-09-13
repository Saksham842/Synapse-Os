import asyncio
import logging
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    AllocationRequest,
    AllocationResponse,
    OutcomeReportRequest,
    SalesRunRequest,
    Queen
)
from app.allocator import compare_allocations
from app.reputation import (
    get_reputation,
    update_reputation,
    list_reputations,
    reset_all_reputations
)
from app.simulator import simulator
from app.agents.sales_queen import sales_queen

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("synapseos.api")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send to client, disconnecting: {e}")
                self.disconnect(connection)


manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Wire simulator broadcast
    simulator.broadcast_callback = manager.broadcast
    # Start simulation loop in background
    sim_task = asyncio.create_task(simulator.run_loop())
    logger.info("SynapseOS Allocator Backend Initialized.")
    yield
    simulator.stop()
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass
    logger.info("SynapseOS Allocator Backend Shutdown.")


app = FastAPI(
    title="SynapseOS Resource Allocator API",
    description="Nash Bargaining CPU Allocation & Trust Verification Layer",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SynapseOS Allocator", "simulator_running": simulator.is_running}


@app.post("/allocate", response_model=AllocationResponse)
def allocate_resources(request: AllocationRequest):
    """
    Computes CPU-cycle resource allocation using Nash Bargaining Solution,
    and returns comparative benchmarks against Equal Split and FCFS baselines.
    Reputation scores are applied automatically to discount effective priority.
    """
    # Enrich queens with current reputation if not already supplied
    queens_with_rep = []
    for q in request.queens:
        rep = q.reputation if q.reputation is not None else get_reputation(q.name)
        queens_with_rep.append(Queen(
            name=q.name,
            V=q.V,
            W=q.W,
            D=q.D,
            reputation=rep
        ))

    return compare_allocations(
        F_max=request.F_max,
        queens=queens_with_rep,
        w1=request.w1,
        w2=request.w2,
        w3=request.w3
    )


@app.post("/report_outcome")
def report_outcome(request: OutcomeReportRequest):
    """
    Records an agent's realized outcome against its claimed value.
    Updates the Queen's reputation score via R(t+1) = alpha * R(t) + (1-alpha)*accuracy.
    """
    new_score = update_reputation(
        queen_name=request.queen_name,
        claimed_value=request.claimed_value,
        actual_value=request.actual_value,
        alpha=request.alpha or 0.9
    )
    return {
        "status": "success",
        "queen_name": request.queen_name,
        "new_reputation": new_score,
        "claimed_value": request.claimed_value,
        "actual_value": request.actual_value
    }


@app.get("/reputation")
def get_all_reputations():
    return {"reputations": list_reputations()}


@app.post("/reputation/reset")
def reset_reputations():
    reset_all_reputations()
    return {"status": "reset_complete"}


@app.get("/simulation/latest")
def get_latest_simulation():
    if not simulator.history:
        return simulator.tick()
    return simulator.history[-1]


@app.get("/simulation/history")
def get_simulation_history():
    return {"rounds": list(simulator.history)}


@app.post("/simulation/weights")
def update_simulation_weights(w1: float = 1.0, w2: float = 0.01, w3: float = 2.0):
    simulator.set_weights(w1, w2, w3)
    return {"status": "updated", "weights": {"w1": w1, "w2": w2, "w3": w3}}


@app.post("/agents/sales/run")
async def run_sales_agent(request: SalesRunRequest):
    """
    Executes a real goal for the Sales Queen (Lead Scraper + Outbound Drafter workers)
    under game-theoretic Nash allocation constraints.
    Returns generated leads, emails, telemetry, and allocation details.
    """
    result = await sales_queen.run_sales_goal(
        goal=request.goal,
        target_desc=request.target_desc,
        num_leads=request.num_leads,
        deadline_s=request.deadline_s,
        forced_f_max=request.forced_f_max,
    )
    # Broadcast agent run completion event over WebSocket so dashboard updates in real time
    await manager.broadcast({
        "type": "agent_run",
        "agent": "Sales",
        "mode": result["mode"],
        "elapsed_seconds": result["elapsed_seconds"],
        "tokens_used": result["tokens_used"],
        "allocation": result["allocation"],
    })
    return result


@app.get("/agents/sales/status")
def get_sales_agent_status():
    """
    Returns the Sales Queen's operational status and most recent run mode ('live' vs 'mock').
    """
    return {
        "department": "Sales",
        "status": "ready",
        "last_run_mode": sales_queen.last_run_mode,
        "last_run_telemetry": sales_queen.last_run_telemetry,
    }


@app.websocket("/ws/live")
async def websocket_live_feed(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Immediately send latest round on connect if available
        if simulator.history:
            await websocket.send_json(simulator.history[-1])
        while True:
            # Keep connection alive; accept optional messages (e.g., ping or client weight overrides)
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket exception: {e}")
        manager.disconnect(websocket)
