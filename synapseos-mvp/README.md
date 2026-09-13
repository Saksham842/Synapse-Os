# SynapseOS — AI Workforce Operating System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-049EF4?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![CVXPY](https://img.shields.io/badge/CVXPY-Nash_Bargaining-FF6C37?style=for-the-badge)](https://www.cvxpy.org/)
[![Tests](https://img.shields.io/badge/Tests-7%2F7%20Passed-brightgreen?style=for-the-badge)](./backend)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

---

> **SynapseOS** is an AI Workforce Operating System: 7 department Queens delegating to specialized worker agents that do real work (lead generation, outreach drafting, competitive intelligence, etc.), coordinated through a shared Second Brain. SynapseOS coordinates autonomous department agents; a Nash Bargaining allocator and reputation layer govern how they share compute.

---

## Table of Contents

1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [Interactive 3D Swarm Dashboard (`/`)](#2-interactive-3d-swarm-dashboard-)
3. [Cinematic 6-Scene Scroll Odyssey (`/experience`)](#3-cinematic-6-scene-scroll-odyssey-experience)
4. [Autonomous Department Swarms & Worker Catalog](#4-autonomous-department-swarms--worker-catalog)
5. [Mathematical Formulation: Nash Bargaining Solution](#5-mathematical-formulation-nash-bargaining-solution)
6. [The Trust Layer: Signing ≠ Honesty](#6-the-trust-layer-signing--honesty)
7. [Multi-Objective Optimization: Bridge to Phase 2](#7-multi-objective-optimization-bridge-to-phase-2)
8. [End-to-End System Architecture](#8-end-to-end-system-architecture)
9. [REST API & WebSocket Protocol](#9-rest-api--websocket-protocol)
10. [Automated Verification & Test Suite](#10-automated-verification--test-suite)
11. [Quickstart & Deployment Guide](#11-quickstart--deployment-guide)
12. [Academic Research Mapping](#12-academic-research-mapping)

---

## 1. Executive Summary & Core Philosophy

In a multi-agent enterprise operating system, autonomous department orchestrators ("Queens") manage specialized fleets of sub-agents (workers). Each department continuously competes for bounded physical hardware resources (CPU cycle rate $F_{\max}$, GPU memory, network bandwidth):

```
                                  ┌────────────────────────┐
                                  │   Shared Compute Pool  │
                                  │  F_max = 25.0 k-cyc/s  │
                                  └───────────┬────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
         Greedy FCFS / PSNE                                   Cooperative Nash Solution
   ┌─────────────────────────────┐                     ┌───────────────────────────────────┐
   │ Early aggressive Queens hog │                     │ Convex optimization maximizes     │
   │ CPU; late Queens starve:    │                     │ log-utility product ∏ (U_i - d_i) │
   │   f_i → f_min               │                     │ Guaranteed f_min, SLA preserved,  │
   │   Total Utility: -25.98 pts │                     │ Total Utility: +5.61 pts (+31.59) │
   └─────────────────────────────┘                     └───────────────────────────────────┘
```

### The Three Structural Bottlenecks Solved:

1. **Tragedy of the Commons (Greedy FCFS)**:
   In Pure Strategy Nash Equilibrium (PSNE) without mediation, early Queens claim unconstrained optima $f_i^*$, exhausting shared capacity. Later Queens starve ($f_i \to f_{\min}$), missing execution deadlines by large margins and driving total system utility deeply negative.
2. **Suboptimality of Static Equal Split**:
   Dividing resources blindly ($F_{\max}/n$) ignores task value ($V_i$), workload size in k-cycles ($W_i$), and latency deadlines ($D_i$).
3. **The Authenticated Misreporting Problem**:
   Standard cryptography (mTLS, JWT, ECDSA) proves message provenance, not bid honesty. An authenticated Queen can exaggerate task importance ($V=25$) to capture disproportionate CPU. SynapseOS integrates a dynamic Bayesian reputation factor ($R_i$) that discounts future priority when realized outcomes deviate from claimed bids.

---

## 2. Interactive 3D Swarm Dashboard (`/`)

The primary command console at `http://localhost:3000` is built on a **3D Swarm-first, camera-reactive architecture**:

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                      TOP COMMAND HEADER & TELEMETRY                         │
 │  WebSocket Feed: LIVE  ·  Cycle: #142  ·  Solver: CLARABEL (11ms)           │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
 ┌──────────────────────────────────────▼──────────────────────────────────────┐
 │                  LIVING 3D SWARM TOPOLOGY (HERO STAGE)                     │
 │                                                                             │
 │  Options: [✦ Orbit] [✦ Core] [✦ Sales] [✦ Marketing] [✦ Bench] [✦ Sliders]  │
 │                                                                             │
 │       (Selecting an option swoops camera & slows swarm to inspect)         │
 │                                                                             │
 │             [Sales Node] ◄══= 120 Streaming Energy Packets ===► [Mkt Node]   │
 │                                       ▲                                     │
 │                          [Pulsating Nash Generator]                         │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
 ┌──────────────────────────────────────▼──────────────────────────────────────┐
 │                DYNAMIC SWARM INSPECTOR DECK (ANIMATED)                      │
 │                                                                             │
 │  ✦ Focused Queen Telemetry (Cycle f_i, Workload W, Exec T_i, Trust R_i)     │
 │  ✦ Autonomous Worker Agents Deck (Lead Scraper, Outbound Drafter, ...)      │
 │  ✦ Real-Time SLA Monitoring & Exact Payoff Equation Breakdown               │
 └─────────────────────────────────────────────────────────────────────────────┘
```

### Dynamic Camera & Deceleration Features:
- **Interactive Options Deck**: Floating selector chips above the 3D swarm (`✦ Swarm Orbit`, `✦ Nash Core`, `✦ Sales`, `✦ Marketing`, `✦ Operations`, `✦ Intelligence`, `✦ Customer`, `✦ Utility Benchmark`, `✦ Priority Weights`, `✦ Byzantine Stress Test`).
- **Dynamic Camera Swooping**: Selecting any Queen or Core immediately triggers an interpolated camera lerp (`delta * 3.2`) in azimuth, elevation, and focal zoom directly to that node's 3D coordinates.
- **Dynamic Swarm Deceleration**: When exploring an option, swarm rotation automatically slows down from `0.14 rad/s` down to `0.018 rad/s`, stabilizing the node and eliminating motion blur so users can inspect conduits and trust rings.
- **Dynamic Inspector Deck (`SwarmInspectorDeck.tsx`)**: Slides in seamlessly via Framer Motion `AnimatePresence`, revealing department roles, autonomous worker agents with live load badges (`88% load`), and skill tokens (`#parse_dom`, `#extract_schema`, `#context_inject`).
- **1-Click Reset**: Click `Reset to Swarm Orbit` to swoop the camera back out, restore full rotation speed, and bring back the overview carousel.

---

## 3. Cinematic 6-Scene Scroll Odyssey (`/experience`)

Accessible directly from the header via **"Cinematic Odyssey ↗"**, `/experience` provides a 6-scene scroll-driven WebGL narrative:

```
Scroll Range    Scene Name              Visual Orchestration
──────────────────────────────────────────────────────────────────────────────────────────
0.00 – 0.15     The Big Bang            6,500-point noise-perturbed particle cloud expands
                                        from an off-center seed via easePower3Out.
0.15 – 0.35     The Constellation       7 colored department nodes expand outward along a
                                        trigonometric ring; interconnected lattice forms.
0.35 – 0.55     Departmental Bloom      Selected department bursts into 18 fractal satellite
                                        worker nodes. Clickable "Lead Scraper" & "Outbound Drafter".
0.55 – 0.70     Synaptic Data Sharing   80 luminous energy packets stream continuously along
                                        active network conduits (time-based living animation).
0.70 – 0.85     Global Priority Wave    46-node spherical cage swept by a translucent sine-wave
                                        ribbon mesh; intersected nodes flash bright white.
0.85 – 1.00     Logo Resolve            Camera pulls back; "SynapseOS" wordmark & tagline fade in.
                                        Stable hold at ≥98% scroll with smooth replay trigger.
```

### Technologies Powering `/experience`:
- **Three.js + @react-three/fiber v9**: Declarative WebGL graph with low-power draw buffers.
- **GSAP + ScrollTrigger**: Smooth scroll scrubbing with custom scroller proxies.
- **Locomotive Scroll + Lenis**: Double-layered smooth scroll fallback ensuring 60fps across platforms.
- **Framer Motion**: Spring-driven slide-out drawers (`ContentPanel.tsx`).
- **Zustand Store**: Bridges 3D raycast interactions and DOM drawers.

---

## 4. Autonomous Department Swarms & Worker Catalog

Each department Queen manages specialized sub-agents with dedicated capabilities:

| Department | Queen Role | Key Autonomous Worker Agents | Specialized Capabilities & Tool Skills |
|---|---|---|---|
| **Sales** | Revenue Pipeline Engine | `Lead Scraper`, `Outbound Drafter`, `Pipeline Scorer` | `parse_dom`, `extract_schema`, `enrich_company`, `context_inject`, `llm_generate`, `crm_sync` |
| **Marketing** | Brand Synthesis & Reach | `Audience Modeler`, `Copy Matrix Generator`, `Channel Allocator` | `cluster_embeddings`, `variant_matrix`, `ad_spend_optimizer`, `token_stream` |
| **Operations** | System Reliability & Mesh | `Compute Balancer`, `Cache Coordinator`, `Latency Sentinel` | `profiler_hook`, `lru_evict`, `ping_mesh`, `circuit_breaker`, `load_shedder` |
| **Intelligence**| Competitive Signal Graph | `Signal Harvester`, `Competitor Watcher`, `Synthesis Node` | `rss_poll`, `sec_edgar_parse`, `graph_link_prediction`, `sentiment_check` |
| **Customer** | Retention & SLA Sentinel | `Sentiment Radar`, `Retention Agent`, `Resolution Synthesizer` | `nlp_emotion`, `churn_risk_score`, `knowledge_rag`, `ticket_escalator` |
| **Back Office** | Autonomous Compliance | `Invoice Reconciler`, `Ledger Validator`, `Compliance Auditor` | `ocr_table_extract`, `double_entry_check`, `audit_trail_hash`, `pci_dss_scan` |
| **Deals** | M&A & Enterprise Contracts | `Term Sheet Analyzer`, `Valuation Modeler`, `Concession Arbiter` | `legal_ner`, `dcf_sensitivity`, `redline_diff`, `pareto_frontier_bargaining` |

---

## 5. Mathematical Formulation: Nash Bargaining Solution

### 5.1 The Individual Queen Payoff Function

For Queen $i$, given allocated CPU cycle rate $f_i$ (in k-cycles/sec):

$$T_i = \frac{W_i}{f_i} \quad \text{(Task Execution Latency in seconds)}$$

$$\text{breach}_i = \max\left(0, \frac{W_i}{f_i} - D_i\right) \quad \text{(SLA Miss Duration)}$$

$$U_i(f_i) = w_1 \cdot V_i^{\text{eff}} - w_2 \cdot f_i^2 - w_3 \cdot \text{breach}_i$$

- **Why Quadratic $f_i^2$**: Dynamic CPU power dissipation scales with $f^2$ under fixed supply voltage (standard DVFS energy models).
- **Strict Concavity**: Since $W_i/f_i$ is convex for $f_i > 0$, $\max(0, W_i/f_i - D_i)$ is convex, so its negation is concave. The sum of strictly concave terms yields a strictly concave utility $U_i(f_i)$.

### 5.2 The Logarithmic Convex Optimization Problem

The Nash Bargaining Solution maximizes the product of net utility gains above disagreement fallback $d_i$:

$$\max_{f} \prod_{i=1}^{n} (U_i(f_i) - d_i)$$

Taking natural logarithms transforms this into an equivalent convex optimization problem:

$$\max_{f} \sum_{i=1}^{n} \ln\left(U_i(f_i) - d_i\right)$$

$$\text{subject to:} \quad \sum_{i=1}^{n} f_i \le F_{\max}, \quad f_i \ge f_{\min} \quad \forall i$$

In SynapseOS, this is solved in real-time ($<15\text{ms}$) via **CVXPY** using the interior-point conic solver **Clarabel** with fallbacks to **ECOS** and **SCS**.

### 5.3 Verified Experimental Benchmark ($F_{\max} = 25.0, w_1=1.0, w_2=0.01, w_3=2.0$)

| Queen | $V_i$ | Workload $W_i$ | Deadline $D_i$ | Nash $f_i$ ($U_i$) | Equal Split ($U_i$) | FCFS Greedy ($U_i$) |
|---|---|---|---|---|---|---|
| **Sales** | 10.0 | 40.0 k-cyc | 1.0 s | **8.94** (+2.25) | 8.33 (+1.71) | 15.87 (+4.44) |
| **Marketing** | 6.0 | 30.0 k-cyc | 1.5 s | **9.01** (+1.53) | 8.33 (+1.11) | 8.13 (+1.59) |
| **Intelligence** | 4.0 | 20.0 k-cyc | 2.0 s | **7.04** (+1.83) | 8.33 (+2.51) | 1.00 (**-32.01**) |
| **Total System Utility** | — | — | — | **+5.61 pts** | **+5.32 pts** | **-25.98 pts** |

- **FCFS Starvation Margin**: $\Delta U_{\text{FCFS}} = +5.61 - (-25.98) = \mathbf{+31.59\text{ pts}}$ *(Greedy FCFS plunges Intelligence into massive SLA penalties)*
- **Equal Split Margin**: $\Delta U_{\text{Equal}} = +5.61 - (+5.32) = \mathbf{+0.29\text{ pts}}$ *(Nash provides Pareto-optimal resource reallocation)*

---

## 6. The Trust Layer: Signing ≠ Honesty

> **Core Insight**: Cryptographic signatures (ECDSA/JWT) prove who signed a bid, but not whether the claim is honest. An authenticated Queen can sign a bid claiming $V=25.0$ when the true value is $4.0$.

SynapseOS adds a **Bayesian Trust Multiplier** $R_i \in [0.05, 1.0]$:

1. **Outcome Verification**:
   When a completed task is reviewed, realized utility is compared to the claimed bid:

   $$\text{accuracy}_i(t) = \frac{\min(\text{claimed}_i, \text{actual}_i)}{\max(\text{claimed}_i, \text{actual}_i)}$$

2. **Exponential Moving Average Decay**:
   Reputation scores are persisted and updated with forgetting factor $\alpha = 0.90$:

   $$R_i(t+1) = \alpha \cdot R_i(t) + (1-\alpha) \cdot \text{accuracy}_i(t)$$

3. **Effective Priority Weighting**:

   $$V_i^{\text{eff}} = R_i \cdot V_i^{\text{claimed}}$$

When an agent exaggerates value, its trust score decays, automatically discounting its effective priority in subsequent allocation rounds. Honest bidding becomes self-enforcing in a game-theoretic sense.

---

## 7. Multi-Objective Optimization: Bridge to Phase 2

The objective weights $(w_1, w_2, w_3)$ balance fundamental tradeoffs:

- **Cost Minimization**: $C = \sum_{i=1}^n f_i^2$ (Dynamic power dissipation)
- **Latency & SLA Minimization**: $L = \sum_{i=1}^n \max(0, T_i - D_i)$ (Breach penalties)
- **Quality Maximization**: $Q = \sum_{i=1}^n (V_i \cdot \text{confidence}_i)$ (Realized business value)

### Phase 2 Roadmap:
In Phase 2, manual weight sliders are replaced by **Prof. Pramod Kumar Singh's Hybrid Genetic Algorithm + Grey Wolf Optimizer (Soft Computing 2022)**, dynamically searching for the non-dominated Pareto front:
- **$\alpha$ Wolf**: Best candidate solution balancing cost and latency.
- **$\beta$ & $\delta$ Wolves**: Second and third tier Pareto frontiers guiding genetic mutations.

---

## 8. End-to-End System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NEXT.JS 16 FRONTEND                              │
│                                                                             │
│  ┌── / (Dynamic 3D Swarm Console) ───────────────────────────────────────┐  │
│  │  Three.js WebGL Constellation Stage  ·  Interactive Camera Swoop Rig  │  │
│  │  120 Dynamic Streaming Particle Conduits  ·  Swarm Deceleration Hook  │  │
│  │  SwarmInspectorDeck  ·  Framer Motion Worker Console                  │  │
│  │  Priority Sliders (w1, w2, w3)  ·  Byzantine Stress-Tester            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌── /experience (Cinematic 6-Scene Odyssey) ────────────────────────────┐  │
│  │  6,500-pt Big Bang Sphere  ·  7-Node Constellation  ·  Fractal Bloom  │  │
│  │  Synaptic Conduits  ·  46-Node Priority Wave  ·  Logo Resolve Hold    │  │
│  │  GSAP ScrollTrigger Scroller Proxy  ·  Locomotive Scroll + Lenis      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │  WebSocket /ws/live (every 4s)
                                       │  HTTP POST /allocate, /report_outcome
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                             FASTAPI BACKEND                                 │
│                                                                             │
│  app.allocator   : CVXPY Nash Bargaining Solver (Clarabel/ECOS/SCS)         │
│  app.reputation  : SQLite Bayesian R_i persistence, decay, & rehabilitation  │
│  app.simulator   : 5-Queen rolling ring buffer & realistic traffic gen       │
│  app.main        : REST endpoints + WebSocket Broadcaster                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. REST API & WebSocket Protocol

### 9.1 Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | System status, simulator state, and solver availability |
| `POST` | `/allocate` | Solves NBS, Equal Split, and FCFS for custom Queen bids |
| `POST` | `/report_outcome` | Submits realized vs claimed outcome; updates trust score |
| `GET` | `/reputation` | Lists current Bayesian reputation scores for all Queens |
| `POST` | `/reputation/reset` | Resets all reputation scores to baseline ($1.00$) |
| `GET` | `/simulation/latest` | Returns most recent simulation round from ring buffer |
| `GET` | `/simulation/history` | Returns last 50 historical simulation rounds |
| `POST` | `/simulation/weights` | Updates active $(w_1, w_2, w_3)$ optimization weights |
| `WS` | `/ws/live` | Real-time WebSocket broadcasting each simulation tick |

### 9.2 Sample Allocation Request (`POST /allocate`)

```json
{
  "F_max": 25.0,
  "w1": 1.0,
  "w2": 0.01,
  "w3": 2.0,
  "queens": [
    { "name": "Sales", "V": 10.0, "W": 40.0, "D": 1.0 },
    { "name": "Marketing", "V": 6.0, "W": 30.0, "D": 1.5 },
    { "name": "Intelligence", "V": 4.0, "W": 20.0, "D": 2.0 }
  ]
}
```

---

## 10. Automated Verification & Test Suite

The test suite validates both mathematical correctness and service reliability:

```bash
cd synapseos-mvp/backend
python -m pytest -v
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.9, pytest-8.4.2
collected 7 items

tests/test_allocator.py::test_nash_known_case_verification PASSED        [ 14%]
tests/test_allocator.py::test_comparison_baselines_hierarchy PASSED      [ 28%]
tests/test_api.py::test_health_endpoint PASSED                           [ 42%]
tests/test_api.py::test_allocate_endpoint PASSED                         [ 57%]
tests/test_api.py::test_outcome_report_and_reputation PASSED             [ 71%]
tests/test_api.py::test_simulation_latest_endpoint PASSED                [ 85%]
tests/test_reputation.py::test_reputation_decay_on_dishonest_claim PASSED [100%]

============================== 7 passed in 2.54s ==============================
```

### What Each Test Verifies:
1. `test_nash_known_case_verification`: Confirms CVXPY reproduces the academic paper benchmark numbers within $\pm 0.1$.
2. `test_comparison_baselines_hierarchy`: Confirms the strict utility inequality $U_{\text{NBS}} > U_{\text{Equal}} \gg U_{\text{FCFS}}$.
3. `test_health_endpoint`: Verifies service health check and active background simulator status.
4. `test_allocate_endpoint`: Verifies JSON contract conformity and non-negative cycle allocations.
5. `test_outcome_report_and_reputation`: Verifies SQLite write operations and accurate reputation updates.
6. `test_simulation_latest_endpoint`: Verifies rolling ring buffer payload delivery.
7. `test_reputation_decay_on_dishonest_claim`: Validates Bayesian decay and rehabilitation dynamics under dishonest overclaims.

---

## 11. Quickstart & Deployment Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ & npm

### Terminal 1 — Start Backend
```powershell
cd c:\Users\acer\Desktop\SynapseOS\synapseos-mvp\backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*Health Check:* `http://localhost:8000/health`

### Terminal 2 — Start Frontend
```powershell
cd c:\Users\acer\Desktop\SynapseOS\synapseos-mvp\frontend
npm install
npm run dev
```

### Open in Browser:
- **`http://localhost:3000`**: Dynamic 3D Swarm Dashboard with interactive camera swooping, rotation deceleration, and worker inspector decks.
- **`http://localhost:3000/experience`**: 6-Scene Cinematic Scroll Odyssey.

---

## 12. Academic Research Mapping

| Concept | Implementation | Correct source |
|---|---|---|
| P2P trust / social dilemma framing | Reputation decay R_i discounting bid weight | Kishor & Niyogi, "An Efficient Approach to Resolve Social Dilemma in P2P Networks," AINA 2023 |
| CPU-cycle offloading model (W_i, f_i, T_i=W_i/f_i) | Nash allocator payoff structure | Kumar, Kishor, Samariya, Zomaya, "An Autonomic Workload Prediction and Resource Allocation Framework for Fog-Enabled Industrial IoT," IEEE IoT Journal 2023 |
| Nash Bargaining Solution | Convex log-sum program | Classical cooperative game theory (Nash, 1950) — not from either professor's own papers, say so if asked |
| Hybrid GA + Grey Wolf Optimizer | Phase 2 multi-objective search | Jain, Nagar, Singh, Dhar, "A Hybrid Learning-Based Genetic and Grey-Wolf Optimizer for Global Optimization," Soft Computing 2022 |

