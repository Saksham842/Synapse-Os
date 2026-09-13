# SynapseOS MVP — Backend

Game-theoretic CPU-Cycle Resource Allocator using the Nash Bargaining Solution (CVXPY convex programming), reputation-tracking trust layer (SQLite), and live simulation WebSocket stream.

## Setup & Execution

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run test suite:
   ```bash
   python -m pytest -v
   ```

3. Start backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Key Endpoints
- `GET /health` — Service health and simulator status
- `POST /allocate` — Solves Nash Bargaining allocation and baseline comparisons (Equal Split, FCFS)
- `POST /report_outcome` — Realized outcome tracking and Bayesian-style reputation decay
- `GET /reputation` — Current reputation scores
- `GET /simulation/latest` — Most recent simulation round
- `GET /simulation/history` — Last 50 simulation rounds
- `WS /ws/live` — Real-time WebSocket broadcasting each simulation tick (every 4s)
