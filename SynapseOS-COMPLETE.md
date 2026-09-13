# SynapseOS
### The AI Workforce Operating System
**Complete Specification — v3 (Final Master Document)**
*PRD · TRD · App Flow · UI/UX Design Brief · Backend Schema · Database Schema · Swarm Hierarchy · Neural Intelligence Layer · Testing Strategy · Implementation Plan · Full Agent Catalog*

**Stack basis:** 100% free / open-source / self-hostable. LLM provider: Google Gemini. No paid vendor required to build, run, or scale this to a real product.
**Architecture:** Queen-led department swarms (7 Queens) orchestrating 96 specialized worker agents — not a flat prompt catalog.

---

## Table of Contents

1. [Product Requirements Document (PRD)](#1-product-requirements-document-prd)
2. [Technical Requirements Document (TRD)](#2-technical-requirements-document-trd)
3. [Application Flow](#3-application-flow)
4. [UI/UX Design Brief](#4-uiux-design-brief)
5. [Backend Schema & API Contracts](#5-backend-schema--api-contracts)
6. [Database Schema](#6-database-schema)
7. [Swarm Hierarchy — Queens & Workers](#7-swarm-hierarchy--queens--workers)
8. [Neural Intelligence Layer](#8-neural-intelligence-layer)
9. [Testing Strategy](#9-testing-strategy)
10. [Infrastructure — Redis & Kubernetes](#10-infrastructure--redis--kubernetes)
11. [Implementation Plan](#11-implementation-plan)
12. [Complete Agent Catalog — 96 Workers, 7 Queens](#12-complete-agent-catalog--96-workers-7-queens)
13. [Appendix: Non-Functional Requirements & Risk Register](#13-appendix)

---

# 1. Product Requirements Document (PRD)

## 1.1 Executive Summary

SynapseOS is a visual, force-directed "org chart" of AI agents that a business can see, understand, and deploy without writing code. It fuses two patterns that currently exist only separately in the market:

- **The Map** — a radial graph of 96 specialized agent "nodes" across a business's departments, each with a plain-language job description, an autonomy setting, and a live status (idle / running / needs review / error).
- **The Engine** — a durable execution layer that actually runs those agents against the business's own data, with retries, human-approval checkpoints, persistent memory, and (unlike anything comparable on the market) a **neural intelligence layer** that learns each tenant's automation priorities instead of following a static rulebook.

The product exists because every "AI agent" tool in 2026 asks the buyer to already know what to automate. SynapseOS answers that question visually first, executes it durably, and gets smarter about the answer the longer a tenant uses it.

## 1.2 Problem Statement

| Problem | Evidence | Cost to the business |
|---|---|---|
| Business owners don't know **which** jobs AI can already do | Repeated founder feedback: "what should AI actually do in my company?" asked job-by-job, not in the abstract | Analysis paralysis; AI subscriptions bought and abandoned |
| Prompt-pack products require manual copy-paste into a chat tool for every run | No persistence, no scheduling, no approval flow, no memory of what worked | Time saved on drafting is lost re-running the same prompt weekly |
| Agent-orchestration frameworks are developer tools | Require code, hosting, and an engineer to maintain | Inaccessible to the SMB/non-technical founder segment |
| No product tells you *which agent to activate next* | Static catalogs list everything with equal weight | Wasted effort automating low-value jobs first |
| No product learns from your outcomes | Every "AI agent" today runs the same way on day 1 and day 100 | No compounding advantage from continued use |

## 1.3 Goals

**Primary goal:** Let a non-technical founder go from "sign up" to "one real agent has completed one real job using our own business context" in under 15 minutes, on infrastructure that costs nothing to run at small scale.

**Secondary goals:**
- Give agencies a white-label audit tool that converts into paid implementation work.
- Build a compounding data moat: the longer a tenant uses the product, the smarter and cheaper their agents get (memory reuse, learned routing, learned prioritization).
- Keep unit economics sane — and provable — by routing cheap jobs to cheap models and reserving frontier-tier calls for high-stakes writing, learned automatically rather than hardcoded.

## 1.4 Non-Goals (v1 launch)

- Not building a general-purpose agent framework/IDE — SynapseOS is opinionated and vertical.
- Not shipping all 96 agents at launch. Ship a real, working slice; expand weekly post-launch, label the rest honestly as "coming soon."
- Not supporting fully offline/air-gapped deployment at launch (self-hosted, yes; zero-internet, not yet).
- Not building a user-authored custom-agent builder at launch (planned v2 of the *product*, distinct from this v2 architecture doc).

## 1.5 Target Users & Personas

**Persona A — "Dana," Founder/Operator, 3–15 person services business**
Non-technical, spends 10+ hrs/week on repetitive writing/research tasks. Wants results, not infrastructure. Success = "an agent did a real job for me this week, and the product told me it was the *right* job to automate first."

**Persona B — "Marcus," AI Implementation Consultant / Agency Owner**
Technical enough to configure, not enough to build from scratch. Sells AI transformation to SMB clients. Needs the Audit Engine as a sales tool and the Map as a delivery artifact.

**Persona C — "Priya," Ops Lead at a scaling startup (50–200 people)**
Owns the second brain long-term. Needs approval queues, audit trails, and role-based access as the team grows past one person.

## 1.6 Core Features (v1 scope)

| # | Feature | Description | Priority |
|---|---|---|---|
| F1 | **The Map** | Interactive radial/force-directed graph, departments around a central Second Brain node | P0 |
| F2 | **Second Brain** | Structured onboarding + document upload → chunked, embedded, retrievable knowledge base | P0 |
| F3 | **Agent Detail Panel** | Slide-over with overview, editable instructions, run history/logs | P0 |
| F4 | **Run Engine** | Durable execution: retries, memoized steps, real Gemini calls, real output | P0 |
| F5 | **Autonomy Ladder** | Human-led / Human-assisted / Autonomous, enforced functionally | P0 |
| F6 | **Approval Queue** | Inbox of "needs review" outputs awaiting human sign-off | P0 |
| F7 | **Audit Engine (deterministic)** | Rule-based scan of second-brain completeness → marks nodes ready/blocked | P0 |
| F8 | **Live Status / Realtime** | Node color + state updates in real time as agents run | P1 |
| F9 | **GNN Priority Ranking** | Learned "activate this next" ranking layered on top of F7 | P1 |
| F10 | **Learned Model Router** | Contextual bandit picks cheap/standard/frontier tier per tenant per agent | P1 |
| F11 | **Anomaly Detection** | Autoencoder flags unusual outputs before they hit the Approval Queue | P2 |
| F12 | **Dashboards** | Roll-up views fed by real `agent_runs` data | P2 |
| F13 | **Scheduling / Cron triggers** | Autonomous-tier agents run on a schedule | P2 |
| F14 | **Agency / white-label mode** | Run the Audit Engine against a client's business, branded | P2 |

## 1.7 User Stories (representative sample)

- As Dana, I want to upload a few docs about my business so agents know my offer and voice without re-explaining it every time.
- As Dana, I want to see at a glance which jobs AI can do for my business today, vs. what's missing — and which one matters *most* to do first.
- As Dana, I want to click one node and get a real draft back, grounded in my own business data, not a generic prompt.
- As Dana, I want to approve or reject an agent's output before anything gets sent to a real client.
- As Dana, I want the system to get cheaper and more accurate over time as it learns what "good" looks like for my business.
- As Marcus, I want to point the Audit Engine at a prospect's business and generate a visual, ranked report for a sales call.
- As Priya, I want an audit trail of every agent run — who approved what, when, which model produced it, and what it cost.
- As any user, I want an agent's failure or anomaly to be visible and explained, never silently swallowed.

## 1.8 Success Metrics

| Metric | Target (90 days post-launch) |
|---|---|
| Time from signup → first completed agent run | < 15 minutes (median) |
| % of new signups who activate ≥1 agent in week 1 | > 40% |
| Agent output approval rate (human-assisted tier) | > 70% approved without edits |
| Weekly active tenants running ≥1 autonomous-tier agent | > 25% of active base |
| Blended cost per agent run, after 30 days of bandit learning | ≥ 30% lower than day-1 static routing |
| Monthly infra cost at < 500 tenants | $0 beyond a single VM/small cluster + Gemini free-tier usage |
| Monthly churn | < 5% |

---

# 2. Technical Requirements Document (TRD)

## 2.1 Technology Stack — 100% free / open-source

| Layer | Choice | Rationale |
|---|---|---|
| Frontend framework | **Next.js 15 (App Router)**, React 19 | Server Components reduce client bundle for a data-heavy dashboard; Actions simplify mutation flows |
| Styling | **Tailwind CSS v4**, shadcn/ui | Utility-first + accessible unstyled primitives (Radix) — free, no license |
| Motion | **Framer Motion** | One orchestrated panel transition, not scattered hover effects |
| Graph rendering | **react-force-graph-2d** (Canvas) | Canvas, not SVG/DOM — required to keep 100+ nodes at 60fps; physics-based radial clustering built in |
| State/data fetching | **TanStack Query** + Redis pub/sub relay | Query for imperative fetches/mutations; Redis pub/sub → lightweight WS gateway for live node-state push |
| **LLM generation** | **Google Gemini API** — `gemini-2.5-flash` (cheap/standard tier), `gemini-2.5-pro` (frontier tier) | Free tier with usable daily quota, strong function-calling, native long-context (fits large second-brain payloads without aggressive truncation) |
| **Embeddings** | **Gemini `text-embedding-004`** (768-dim) | Free-tier embeddings, strong multilingual quality |
| Agent orchestration | **Temporal** (self-hosted, Apache 2.0 OSS) | Workflow/Activity/Signal model maps directly to durable steps + human-approval pauses; free at any self-hosted scale, battle-tested |
| Cache / queue / pub-sub | **Redis** (OSS) | Per-tenant Gemini rate-limiting, node-state pub/sub, hot second-brain query cache |
| Database + Auth + Realtime + Storage | **Supabase, self-hosted** (Docker/Helm — the same OSS stack Supabase Cloud runs) | Postgres 16 + pgvector + GoTrue (auth) + Realtime + Storage, entirely free, entirely yours |
| Vector index | **pgvector HNSW** | Best recall/speed tradeoff for this data scale; industry-standard ANN index for pgvector |
| **ML/DL service language** | **Python 3.12 + PyTorch + PyTorch Geometric + FastAPI** | Best-in-class DL ecosystem — no serious TypeScript equivalent for GNN/autoencoder work. A deliberate, scoped polyglot boundary, not sprawl |
| Backend/API language | **TypeScript** (Next.js Route Handlers + Server Actions, Temporal Workers in TS) | Keeps the app cohesive; only the ML service breaks out into Python |
| Reranking | **Open-source cross-encoder** (`cross-encoder/ms-marco-MiniLM-L-6-v2`, CPU-friendly) | Improves RAG precision over raw vector search at near-zero cost |
| Document parsing | **Unstructured.io (OSS self-hosted mode)** or **pdfplumber/python-docx** for lighter needs | Free parsing path for PDFs/DOCX uploaded to the Second Brain |
| Containerization | **Docker** (every service); **Kubernetes** (k3s/kind locally, any cluster in prod) | Portable, no vendor lock, matches the multi-service (web/orchestrator/ml/redis) architecture |
| CI/CD | **GitHub Actions** | Free at this usage tier |
| Observability | **OpenTelemetry + self-hosted Grafana + Prometheus + Loki** ("LGTM" stack) | Full tracing across TS + Python services, zero vendor lock |
| Payments (only paid line item, and only once you have revenue) | **Stripe** | Subscription tiers, usage metering on `agent_runs` |
| Integrations | **Model Context Protocol (MCP) servers** (Gmail, HubSpot, Slack, Calendar) | Standardized tool-calling surface for agents that act, not just draft |

## 2.2 System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                          │
│  Next.js App Router · React 19 · react-force-graph-2d             │
│  WebSocket ← Redis pub/sub relay → node state (color/pulse)        │
└───────────────┬───────────────────────────────┬───────────────────┘
                │ Server Actions / Route Handlers │
                ▼                                 │
┌─────────────────────────────┐                   │
│   API LAYER (Next.js)       │                   │
│  - Auth guard (Supabase)    │                   │
│  - Rate-limit check (Redis) │                   │
│  - Starts Temporal Workflow │                   │
└───────────────┬──────────────┘                   │
                │ workflow.start("runAgentWorkflow")│
                ▼                                   │
┌─────────────────────────────────────────────────┐│
│              TEMPORAL (Durable Execution)         ││
│  Activity: fetch-second-brain  ──► pgvector + Redis cache
│  Activity: rerank-context      ──► cross-encoder (ml-service)
│  Activity: select-model-tier   ──► bandit (ml-service)
│  Activity: generate-draft      ──► Gemini API
│  Activity: check-anomaly       ──► autoencoder (ml-service)
│  Signal:   wait-for-approval   ──► pauses (0 compute) up to 7d
│  Activity: execute-action      ──► MCP tool call (Gmail/CRM/etc)
│  Activity: write-result        ──► writes to Postgres, publishes to Redis
└───────────────┬───────────────────────────────────┘
                │                                     
                ▼                                     
┌─────────────────────────────┐   ┌─────────────────────────────┐
│   POSTGRES (self-hosted      │   │   ML SERVICE (Python/FastAPI)│
│   Supabase, pgvector+HNSW)   │◄──┤  GNN priority ranking         │
│  agent_nodes, user_agents,   │   │  Bandit router                │
│  agent_runs, second_brain,   │   │  Autoencoder anomaly detector │
│  ml_agent_scores,             │   │  Reranker                     │
│  router_bandit_state          │   │  Department clustering (batch)│
└───────────────────────────────┘   └───────────────────────────────┘
```

## 2.3 Non-Functional Requirements Summary

- **Latency:** Node click → workflow-started acknowledgment < 500ms; generation streamed async.
- **Availability:** 99.5% target for the app layer; agent execution failures degrade to a visible `error` state, never a silent hang (Temporal retries handle transient failures automatically).
- **Scalability:** 100+ nodes rendered client-side without frame drops; Temporal Workers scale horizontally by adding pods.
- **Multi-tenancy isolation:** Enforced at the database layer via Postgres RLS, not application logic alone.
- **Auditability:** Every state-changing action is an immutable row in `agent_runs` / `agent_run_events`.
- **Cost:** Runs entirely free at small scale on a single 4vCPU/8GB VM; every "paid" component only starts costing money once genuine scale (or Gemini free-tier quota) is exceeded.

---

# 3. Application Flow

## 3.1 High-Level User Journey

```
Sign Up ──► Onboarding Interview ──► Second Brain Built ──► Map Renders
   │                                                              │
   │                                                              ▼
   │                                   Deterministic Audit Engine scores all nodes
   │                                   (ready / blocked) — GNN re-ranks "ready" set
   │                                   by learned priority once tenant has history
   │                                                              │
   │                                                              ▼
   │                                            User clicks a "ready" node
   │                                                              │
   │                                                              ▼
   │                                          Detail Panel slides in (Overview)
   │                                                              │
   │                                                              ▼
   │                                              User clicks "Run Agent"
   │                                                              │
   │                                          ┌───────────────────┴───────────────────┐
   │                                          ▼                                       ▼
   │                              Human-led: draft shown            Human/Autonomous: Temporal
   │                              instantly, no execution            Workflow runs durably, node
   │                              until user clicks "Send"           pulses "running"
   │                                          │                                       │
   │                                          │           Bandit selects model tier → Gemini call
   │                                          │           Autoencoder scores the output
   │                                          │                     │
   │                                          │                     ▼
   │                                          │        ┌────────────┴────────────┐
   │                                          │        ▼                         ▼
   │                                          │   Human-assisted: pauses,   Autonomous: executes
   │                                          │   node → "needs review",    action directly, node
   │                                          │   Approval Queue entry       → "completed", logged
   │                                          │   (anomaly flag shown if any)
   │                                          │                     │
   │                                          │                     ▼
   │                                          │        User approves/rejects
   │                                          │        → feeds bandit + GNN training signal
   │                                          └─────────────────────┴──────────► agent_runs finalized
   │                                                                              Node returns to idle/ready
   ▼
Dashboards aggregate agent_runs across all nodes over time; nightly job retrains
per-tenant bandit state and periodically retrains the global GNN
```

## 3.2 Detailed Flow: Onboarding & Second Brain Construction

Two distinct UI surfaces feed the Second Brain — build both, they serve different moments:

- **The Onboarding Interview** (chat-style component, shown once at signup): "What does your business sell? Who's it for? How should AI sound when it writes for you?" Answers save directly as structured `company`/`offer`/`voice` docs — this is the fast path to a usable Second Brain in under 5 minutes.
- **The Knowledge Dropzone** (persistent component in Second Brain settings, used anytime after): drag-and-drop for existing business context — past proposals, brand guidelines, product specs — as PDF/DOCX/plain text. This is how the Second Brain keeps growing after day one, not just at signup.

1. User signs up (Supabase Auth — email or OAuth).
2. Guided interview (chat-style): "What does your business sell? Who's it for? How should AI sound when it writes for you?"
3. Each answer stored as a structured doc (`document_type`: `company`, `offer`, `voice`).
4. Optional/ongoing upload via the Knowledge Dropzone (PDF/DOCX/plain text) — parsed via Unstructured.io (self-hosted) or `pdfplumber`/`python-docx`, triggered by `POST /api/second-brain/ingest` (§5.1).
5. Temporal Workflow `ingestSecondBrainWorkflow`:
   - Splits by markdown headers, then sliding-window chunks (~500 tokens, 15% overlap).
   - Embeds each chunk via Gemini `text-embedding-004`.
   - Writes to `second_brain` with `source_doc_id` + `chunk_index`.
6. On completion, triggers the deterministic Audit Engine rescoring, then (if the tenant has enough history) the GNN re-ranking pass.
7. Map renders with nodes colored by readiness state, brightness modulated by learned priority.

## 3.3 Detailed Flow: Agent Execution (Human-Assisted tier — default)

1. User clicks node → Detail Panel opens → **Run Agent**.
2. Server Action validates ownership → starts `runAgentWorkflow` in Temporal.
3. Row inserted into `agent_runs` (`run_status = 'running'`); Redis publishes the change → node pulses.
4. Temporal Activities execute in order:
   - `fetch-second-brain`: vector search (pgvector) + cross-encoder rerank → top-5 relevant chunks.
   - `select-model-tier`: bandit call to ml-service → returns `cheap`/`standard`/`frontier`.
   - `generate-draft`: Gemini call with system prompt + reranked context.
   - `check-anomaly`: autoencoder scores the output against the tenant's historical distribution; flags if above threshold.
   - Writes draft to `agent_runs.output_data`, sets `run_status = 'needs_review'`.
5. Redis/WS push → node shows "needs review"; entry appears in Approval Queue (with an anomaly badge if flagged).
6. User reviews → **Approve** or **Reject (with feedback)**.
7. Approve → Temporal Signal resumes the paused workflow → `execute-action` (e.g., send email via Gmail MCP server) → `run_status = 'completed'`. Outcome recorded in `router_bandit_state` (success).
8. Reject → `run_status = 'rejected'`, feedback stored, node returns to `idle`; outcome recorded in `router_bandit_state` (failure) and queued as a GNN training signal.

## 3.4 Detailed Flow: Audit Engine (Agency Mode)

1. Agency user creates a Client Workspace (separate tenant under their org).
2. Uploads/connects the prospect's info.
3. Deterministic scoring runs immediately; GNN ranking runs once minimal signal exists (or falls back to global-prior ranking for a cold-start client).
4. Output: branded, shareable report — "X of 96 jobs ready today," ranked by predicted priority, grouped by department, exportable as PDF.

---

# 4. UI/UX Design Brief

## 4.1 Positioning & Tone

SynapseOS is infrastructure that happens to be beautiful, not a toy. Precise, calm, legible — closer to mission control than a marketing page. Status states are informational, never celebratory or gamified.

## 4.2 Design Plan

**Color** (6 base tokens):
- `--bg-base`: `#0B0D12`
- `--surface`: `#13161D`
- `--line`: `#242832`
- `--text-primary`: `#E8E9ED`
- `--text-muted`: `#8A8F9C`
- `--accent`: `#5B8DEF` — reserved for the Second Brain node and primary actions only
- State colors: `--state-ready: #4ADE80` · `--state-running: #F5A623` (pulsing) · `--state-review: #5B8DEF` (reuses accent) · `--state-error: #EF5350`
- Learned-priority glow: a soft radial highlight intensity (not a new hue) scaled by `ml_agent_scores.predicted_priority` — the map literally gets brighter where the model thinks the tenant should focus next.

**Type:**
- UI/display: **Inter** (or Söhne if licensing allows), disciplined type scale, no decorative treatment.
- Data/logs/prompts: **JetBrains Mono**, reserved strictly for the Runs/Logs tab and system-prompt editor.
- Sentence case throughout. No tracked-out all-caps eyebrows.

**Layout concept:**
- The Map is the hero, full-viewport — the first thing the user sees post-onboarding is their own business rendered as a graph.

```
                    OPERATIONS
                        │
      MARKETING ────────┼──────── INTELLIGENCE
             \          │          /
              \    ┌─────────┐    /
               \   │ SECOND  │   /
    SALES ────────  │  BRAIN  │  ─────── CUSTOMER
    (+ Deals)  /    └─────────┘   \
              /          │        \
     BACK OFFICE ────────┴──── FINANCE
     (Admin/HR)        (if clustering confirms the split — §8.4)
```
- Detail Panel: slide-over from the right (420px desktop, full-screen sheet mobile), never a blocking modal.
- Dashboards on a separate route.

**Principles:**
1. Node state understandable at a glance — carried by shape/motion as well as color (accessibility).
2. One motion moment: the department → agent "bloom" on first load, not per-hover animations everywhere.
3. Every number on screen is real, pulled from `agent_runs`/`ml_agent_scores` — never a static marketing claim.

## 4.3 Component Inventory

| Component | Behavior |
|---|---|
| **Graph Canvas** | Canvas-rendered via `react-force-graph-2d`; node radius scales with department agent count; click → Detail Panel; hover → one-line description tooltip; glow intensity → learned priority |
| **Node state indicator** | Idle: dimmed outline · Ready: solid outline · Running: pulsing ring · Needs review: badge (+ anomaly icon if flagged) · Error: badge + icon |
| **Detail Panel (Sheet)** | Tabs: Overview / System Prompt / Runs & Logs. Autonomy-level stepper; "why this priority" tooltip surfacing the GNN's top contributing factors |
| **Approval Queue** | Lists all `needs_review` runs; inline approve/reject; anomaly-flagged runs visually distinguished; diff view vs. last approved run |
| **Second Brain manager** | Document list, upload dropzone, chunk count, last-embedded timestamp |
| **Audit report view** | Read-only, exportable, grouped by department, ranked by priority within each ready group |
| **Dashboards** | recharts components fed by aggregate `agent_runs` queries; filterable by department/date; cost-over-time chart showing bandit-driven savings |

## 4.4 Accessibility & Quality Floor

- All color-coded state also conveyed by shape/icon.
- Full keyboard navigation for Detail Panel and Approval Queue; list-view fallback for the Map.
- `prefers-reduced-motion` respected.
- Responsive to mobile: pinch-zoom/pan Map with department filter chips; full-screen Detail Panel sheet.

---

# 5. Backend Schema & API Contracts

## 5.1 API Surface

### Agent execution & AI routes

| Endpoint / Action | Method | Purpose | Auth |
|---|---|---|---|
| `POST /api/second-brain/ingest` | Route Handler | Accepts uploaded doc, starts `ingestSecondBrainWorkflow` | Session required |
| `runAgent(userAgentId)` | Server Action | Validates ownership, starts `runAgentWorkflow` in Temporal | Session required |
| `approveRun(runId)` | Server Action | Signals the paused Temporal workflow to resume | Session required |
| `rejectRun(runId, feedback)` | Server Action | Sets run to rejected, stores feedback, signals bandit update | Session required |
| `GET /api/audit/score` | Route Handler | Returns deterministic readiness + GNN priority (cached) for the tenant | Session required |
| `POST /api/audit/run-external` | Route Handler | Agency mode: scores a client workspace | Session + agency role |
| `GET /api/agents` | Route Handler | Returns catalog + tenant's `user_agents` state joined | Session required |
| `ml-service: POST /rank` | Internal | GNN priority scoring, called by the Audit rescoring Activity | Service-to-service auth |
| `ml-service: POST /route` | Internal | Bandit tier selection | Service-to-service auth |
| `ml-service: POST /anomaly-check` | Internal | Autoencoder scoring | Service-to-service auth |
| Redis channel `tenant:<id>:agent_runs` | Pub/Sub | Pushes state changes to the WS relay → client | Server-side only |

### Standard CRUD & app-shell routes

The AI-execution surface above is not the whole app. These are the routes the rest of §4's UI actually calls — the "boring but necessary" 80% of any real product:

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `GET /api/workspaces` | Route Handler | Fetches the current user's organization/tenant context | Session required |
| `GET /api/agents/catalog` | Route Handler | Fetches the 96 workers + 7 Queens from `agent_nodes`, joined with this tenant's `user_agents`, `audit_snapshots`, and `ml_agent_scores` — this is the single call that feeds the Map | Session required |
| `POST /api/agents/user-config` | Route Handler | Saves `custom_instructions` and `autonomy_override` to `user_agents`; server-side validated against the agent's `max_autonomy_level` ceiling (§7.3) before write — the DB trigger is the backstop, this check is the fast-fail | Session required |
| `GET /api/runs/approval-queue` | Route Handler | Fetches all `agent_runs`/`swarms` rows with `run_status = 'needs_review'` for this tenant | Session required |
| `GET /api/runs/history` | Route Handler | Paginated `agent_runs` for the Dashboards view (§4.3) | Session required |
| `GET /api/second-brain/documents` | Route Handler | Lists uploaded/entered documents for the Second Brain manager UI, with chunk counts and last-embedded timestamps | Session required |
| `DELETE /api/second-brain/documents/:id` | Route Handler | Removes a document and its chunks (cascades via FK); triggers `audit.rescore` | Session required |
| `POST /api/webhooks/stripe` | Route Handler | Stripe billing events (subscription changes, payment failures, usage-based overage) | Stripe signature verification — not session-based |
| `POST /api/webhooks/[provider]` | Route Handler | MCP-integration inbound events — e.g. a new Gmail message firing the Customer Swarm's Support Triage, the `Event` trigger type from §12.2 | Provider signature/HMAC verification, mapped to the owning tenant via the connected-account record — never trust the payload's own tenant claim |

### Internal admin routes (see §5.6)

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `GET /admin/metrics` | Route Handler | Platform-wide counts: signups, active tenants, Queen usage, Gemini cost | **Superadmin role check + service-role DB access — see §5.6, this is not a normal session-gated route** |
| `GET /admin/tenants/:id` | Route Handler | Support view into a single tenant's state (read-only) | Superadmin role check |

## 5.2 Temporal Workflow & Activity Contracts

```typescript
// workflows/runAgentWorkflow.ts
import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
  loadAgentNode, loadUserAgent, createAgentRun,
  fetchSecondBrainContext, rerankContext, selectModelTier,
  generateDraft, checkAnomaly, updateAgentRun, executeAction,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
  retry: { maximumAttempts: 3, backoffCoefficient: 2 },
});

export const approvalSignal = defineSignal<[{ approvedBy: string }]>('approval');
export const rejectionSignal = defineSignal<[{ rejectedBy: string; feedback: string }]>('rejection');

export async function runAgentWorkflow(input: {
  userAgentId: string; agentNodeId: string; tenantId: string;
}) {
  const agentNode = await loadAgentNode(input.agentNodeId);
  const userAgent = await loadUserAgent(input.userAgentId);
  const runId = await createAgentRun({ userAgentId: input.userAgentId, status: 'running' });

  const rawContext = await fetchSecondBrainContext({ tenantId: input.tenantId, query: agentNode.description });
  const context = await rerankContext({ query: agentNode.description, candidates: rawContext });
  const tier = await selectModelTier({ tenantId: input.tenantId, agentId: agentNode.id });

  const draft = await generateDraft({
    systemPrompt: agentNode.system_prompt,
    context,
    instructions: userAgent.custom_instructions ?? 'Execute your primary function.',
    tier,
  });

  const anomaly = await checkAnomaly({ tenantId: input.tenantId, agentId: agentNode.id, draft });
  await updateAgentRun(runId, { output_data: { draft }, run_status: 'needs_review', anomaly });

  if (agentNode.autonomy_level !== 'human-led') {
    if (agentNode.autonomy_level === 'human-assisted') {
      let approved = false;
      let rejected: { feedback: string } | null = null;
      setHandler(approvalSignal, () => { approved = true; });
      setHandler(rejectionSignal, (data) => { rejected = data; });

      await condition(() => approved || rejected !== null, '7 days');

      if (rejected) {
        await updateAgentRun(runId, { run_status: 'rejected', rejection_feedback: rejected.feedback });
        return { runId, status: 'rejected' };
      }
      if (!approved) {
        await updateAgentRun(runId, { run_status: 'error', error_message: 'Approval timed out' });
        return { runId, status: 'timed_out' };
      }
    }

    await executeAction({ agentNode, draft });
    await updateAgentRun(runId, { run_status: 'completed' });
  }

  return { runId, status: 'completed' };
}
```

```typescript
// activities/generateDraft.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const TIER_MODEL_MAP = {
  cheap: 'gemini-2.5-flash',
  standard: 'gemini-2.5-flash',
  frontier: 'gemini-2.5-pro',
} as const;

export async function generateDraft(input: {
  systemPrompt: string; context: string; instructions: string; tier: 'cheap' | 'standard' | 'frontier';
}) {
  const model = genAI.getGenerativeModel({ model: TIER_MODEL_MAP[input.tier] });
  const result = await model.generateContent(
    `${input.systemPrompt}\n\nContext:\n${input.context}\n\nTask:\n${input.instructions}`
  );
  return result.response.text();
}
```

## 5.3 ML Service Contracts (FastAPI, Python)

```python
# ml_service/main.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RankRequest(BaseModel):
    tenant_id: str
    ready_agent_ids: list[str]

class RankResponse(BaseModel):
    scores: dict[str, float]  # agent_id -> predicted_priority

@app.post("/rank", response_model=RankResponse)
async def rank_agents(req: RankRequest) -> RankResponse:
    # falls back to uniform scores if tenant has < 5 completed runs (cold start)
    ...

class RouteRequest(BaseModel):
    tenant_id: str
    agent_id: str

class RouteResponse(BaseModel):
    tier: str  # 'cheap' | 'standard' | 'frontier'

@app.post("/route", response_model=RouteResponse)
async def select_tier(req: RouteRequest) -> RouteResponse:
    ...

class AnomalyRequest(BaseModel):
    tenant_id: str
    agent_id: str
    draft_text: str
    latency_ms: float
    token_count: int

class AnomalyResponse(BaseModel):
    anomaly_score: float
    is_anomalous: bool
    reason: str | None

@app.post("/anomaly-check", response_model=AnomalyResponse)
async def check_anomaly(req: AnomalyRequest) -> AnomalyResponse:
    ...
```

## 5.4 Deterministic Audit Engine (baseline, always runs first)

```typescript
// lib/audit/score.ts
type Readiness = "ready" | "blocked";

export function scoreAgentReadiness(
  agent: AgentNode,
  tenantDocTypes: Set<string>,
  activeAgentIds: Set<string>
): { status: Readiness; blockedReasons: string[] } {
  const reasons: string[] = [];
  const missingDocs = agent.requires_doc_types.filter((t) => !tenantDocTypes.has(t));
  if (missingDocs.length > 0) reasons.push(`Missing knowledge: ${missingDocs.join(", ")}`);
  const missingDeps = agent.dependencies.filter((depId) => !activeAgentIds.has(depId));
  if (missingDeps.length > 0) reasons.push(`Depends on ${missingDeps.length} inactive agent(s)`);
  return { status: reasons.length === 0 ? "ready" : "blocked", blockedReasons: reasons };
}
```
This is the trust floor — always computed, always explainable, never dependent on a model being trained or available. The GNN (§8.1) only re-ranks *within* the "ready" set; it never overrides a "blocked" determination.

## 5.5 Row-Level Security

```sql
ALTER TABLE second_brain ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_agent_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE router_bandit_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_anomaly_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_second_brain" ON second_brain FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_user_agents" ON user_agents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_agent_runs" ON agent_runs FOR ALL USING (
  auth.uid() = (SELECT user_id FROM user_agents WHERE id = agent_runs.user_agent_id)
);
CREATE POLICY "read_agent_catalog" ON agent_nodes FOR SELECT USING (true);
CREATE POLICY "own_ml_scores" ON ml_agent_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_bandit_state" ON router_bandit_state FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_anomaly_flags" ON run_anomaly_flags FOR ALL USING (
  auth.uid() = (SELECT ua.user_id FROM user_agents ua
                JOIN agent_runs ar ON ar.user_agent_id = ua.id
                WHERE ar.id = run_anomaly_flags.run_id)
);
```
All writes that mutate external systems execute **server-side only**, inside a Temporal Activity using the Supabase service-role key — never shipped to the client.

---

## 5.6 Admin & Operations Dashboard — how you see and run the platform

The spec above covers tenant-facing routes. This covers the one thing every SaaS needs that tenants never see: how *you*, the operator, know how many people signed up, which Queens are actually getting used, and what your Gemini bill looks like.

**Day 1 (pre-admin-UI):** don't build this yet. Query self-hosted Supabase Studio directly — `auth.users` and `organizations` give a live signup/workspace count, `agent_runs` and `swarms` give real usage, with zero extra code. This is the right answer until you have enough users that manual SQL becomes a bottleneck, not before.

**Once it's worth building — `/admin` route, with an explicit security model:**

The source idea ("build a dashboard that bypasses RLS with the service-role key") is correct in spirit but dangerous stated that plainly — the service-role key bypasses *every* tenant's RLS simultaneously. That key must never be reachable from a route that only checks "is there a session," because any authenticated tenant hitting that route would see all tenants' data. The actual gate:

```typescript
// app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { ADMIN_USER_IDS } from '@/lib/admin-allowlist'; // explicit allowlist, not a role column a bug could flip

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session || !ADMIN_USER_IDS.includes(session.user.id)) {
    redirect('/'); // fails closed — unknown/unlisted user never sees so much as a 403 hinting the route exists
  }
  return <>{children}</>;
}
```
The service-role Supabase client is instantiated **only** inside `/admin` route handlers, never exported anywhere a tenant-facing route could accidentally import it — enforce this with an ESLint import-boundary rule (`no-restricted-imports` scoped to `app/admin/**`), not just code review discipline.

**What the dashboard actually shows**, all read-only aggregate queries over `agent_runs`, `swarms`, `router_bandit_state`, and Stripe's own dashboard for billing specifics:
- Signups and active-tenant counts over time
- Which Queens/departments are seeing real usage vs. sitting idle (directly informs which departments get real system-prompt investment next, per the Implementation Plan's department-by-department rollout in §11.1)
- Blended Gemini cost per run, per tier, tracked against the bandit's cost-reduction claim from §1.8
- Anomaly-flag rate (`run_anomaly_flags`) — a spike here across many tenants at once is a signal the autoencoder or a Gemini model version change needs attention, before individual tenants even notice

This is explicitly **v1.1+ scope** — not part of the Phase 1–6 build in §11. Building it before you have the first real cohort of users is solving a problem you don't have yet.

# 6. Database Schema

## 6.1 Entity-Relationship Overview

```
auth.users ──1:N── user_agents ──N:1── agent_nodes
     │                   │                   │
     │                   │                   └──1:N── ml_agent_scores
     │                   │                   └──1:N── router_bandit_state
     │                   └──1:N── agent_runs ──1:N── agent_run_events
     │                                    └──1:N── run_anomaly_flags
     │
     └──1:N── second_brain_documents ──1:N── second_brain (chunks)
     │
     └──1:N── organizations (agency multi-tenant, v1.1+)
```

## 6.2 Full DDL

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE run_status AS ENUM (
  'idle', 'running', 'needs_review', 'completed', 'rejected', 'error'
);
CREATE TYPE autonomy_level AS ENUM ('human-led', 'human-assisted', 'autonomous');
CREATE TYPE model_tier AS ENUM ('cheap', 'standard', 'frontier');
CREATE TYPE readiness_status AS ENUM ('ready', 'blocked');

-- ============================================================
-- 1. AGENT CATALOG (shared, the 96 worker nodes + 7 Queens — not tenant-scoped)
-- ============================================================
CREATE TABLE agent_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,               -- free text; department taxonomy may evolve — see §8.4
    description TEXT NOT NULL,
    replaces TEXT,
    autonomy_level autonomy_level DEFAULT 'human-led',
    model_tier model_tier DEFAULT 'standard', -- initial default; bandit overrides per-tenant at runtime
    system_prompt TEXT NOT NULL,
    requires_doc_types TEXT[] DEFAULT '{}',
    dependencies UUID[] DEFAULT '{}',
    breaks_into TEXT[] DEFAULT '{}',
    description_embedding vector(768),       -- Gemini text-embedding-004, used by the GNN + department clustering
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_agent_nodes_department ON agent_nodes(department);
CREATE INDEX idx_agent_nodes_embedding ON agent_nodes USING hnsw (description_embedding vector_cosine_ops);

-- ============================================================
-- 2. TENANT / USER AGENT STATE
-- ============================================================
CREATE TABLE user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agent_nodes(id),
    custom_instructions TEXT,
    autonomy_override autonomy_level,        -- may only reduce, never exceed, the catalog default
    current_status run_status DEFAULT 'idle',
    is_active BOOLEAN DEFAULT false,
    schedule_cron TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);
CREATE INDEX idx_user_agents_user ON user_agents(user_id);
CREATE INDEX idx_user_agents_status ON user_agents(current_status);

-- ============================================================
-- 3. SECOND BRAIN (pgvector, HNSW-indexed, 768-dim for Gemini)
-- ============================================================
CREATE TABLE second_brain_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,             -- 'company' | 'offer' | 'voice' | 'client' | 'custom'
    title TEXT NOT NULL,
    raw_content TEXT,
    source_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE second_brain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_doc_id UUID REFERENCES second_brain_documents(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,          -- Gemini text-embedding-004
    token_count INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_second_brain_hnsw ON second_brain USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_second_brain_user_doctype ON second_brain(user_id, document_type);

-- ============================================================
-- 4. EXECUTION RUNS (telemetry + audit trail)
-- ============================================================
CREATE TABLE agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_agent_id UUID NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
    run_status run_status DEFAULT 'running',
    triggered_by TEXT NOT NULL DEFAULT 'manual',
    input_data JSONB,
    output_data JSONB,
    model_used TEXT,
    model_tier_selected model_tier,
    cost_usd NUMERIC(10,4),
    temporal_workflow_id TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    rejection_feedback TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_agent_runs_user_agent ON agent_runs(user_agent_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(run_status);
CREATE INDEX idx_agent_runs_started ON agent_runs(started_at DESC);

CREATE TABLE agent_run_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    event_type TEXT NOT NULL,                -- 'started' | 'completed' | 'failed' | 'waiting'
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_run_events_run ON agent_run_events(run_id, created_at);

-- ============================================================
-- 5. AUDIT SNAPSHOTS (deterministic, cached)
-- ============================================================
CREATE TABLE audit_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agent_nodes(id),
    status readiness_status NOT NULL,
    blocked_reasons TEXT[],
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- ============================================================
-- 6. ML LAYER TABLES
-- ============================================================
CREATE TABLE ml_agent_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agent_nodes(id),
    predicted_priority REAL NOT NULL,        -- 0.0–1.0
    predicted_success_prob REAL,
    model_version TEXT NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id, model_version)
);

CREATE TABLE router_bandit_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agent_nodes(id),
    tier model_tier NOT NULL,
    successes INT DEFAULT 0,
    failures INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id, tier)
);

CREATE TABLE run_anomaly_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
    anomaly_score REAL NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. ORGANIZATIONS (agency / multi-seat — v1.1)
-- ============================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    plan TEXT DEFAULT 'starter',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    PRIMARY KEY (org_id, user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY — see §5.5 for full policy set
-- ============================================================
ALTER TABLE second_brain ENABLE ROW LEVEL SECURITY;
ALTER TABLE second_brain_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_run_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_agent_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE router_bandit_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_anomaly_flags ENABLE ROW LEVEL SECURITY;
```

## 6.3 Indexing & Performance Notes

- HNSW on both `second_brain.embedding` and `agent_nodes.description_embedding` — the latter is what powers the department-clustering analysis and GNN node features.
- `agent_runs.started_at DESC` supports Dashboards' recent-activity queries without a full scan.
- `dependencies UUID[]` on `agent_nodes` queried via `&&` overlap — fine at 96 rows; would move to a join table well before that becomes a bottleneck.

---

# 7. Swarm Hierarchy — Queens & Workers

This section defines how the 96 worker agents are organized under 7 department "Queens" — autonomous managers that decompose a human's goal into parallel/sequential worker tasks, apply a consensus quality check, and only then surface results to the human Approval Queue. This replaces a flat "click one node at a time" model with goal-oriented delegation, while keeping every safety property from §5-6 (RLS, the deterministic Audit Engine as trust floor, and human sign-off as final authority) fully intact.

## 7.1 What's changing and why


The original model: 137 flat agent nodes, each independently clickable, dependencies expressed as a DAG the human walks manually. Simple, traceable, low-risk — and still the right MVP (see the honest tradeoffs at the end of this doc).

The new model: **7 department Queens**, each owning a set of specialized worker agents. A user (or the Meta-Router) gives a Queen a *goal*, not a single task. The Queen decomposes it, runs workers in parallel where possible, applies a consensus check against the Second Brain, and only then surfaces a result to the human Approval Queue.

```
Level 1 — Meta-Router          "Launch a campaign for our new pricing model"
              │
              ▼ intent extraction, routes to the right Queen(s)
Level 2 — Department Queens    Sales Orchestrator · Pipeline Commander · Campaign Director ·
                                Delivery Master · Research Nexus · Success Orchestrator · Admin Controller
              │
              ▼ decomposes goal → delegates to workers, in parallel where possible
Level 3 — Worker Agents        The 137 specialized nodes (Lead Scraper, Content Engine, Invoice Generator, ...)
```

**What stays the same:** the Second Brain, the deterministic Audit Engine as the trust floor, the Autonomy Ladder, RLS-enforced multi-tenancy, the Neural Intelligence Layer (GNN/bandit/autoencoder — these now operate at both the worker level *and* the Queen level, see §6).

**What's new:** a `parent_agent_id` relationship, a `swarms` execution model sitting above `agent_runs`, Queen-level consensus as a distinct pipeline step before human approval, and cross-Queen "federation" requests (e.g., Campaign Director asking Research Nexus for competitor data mid-task).

---

## 7.2 The 7 Queens — roles and worker rosters

| Department | Queen | Queen's job | Example workers (not exhaustive — full 137 catalog follows this template) |
|---|---|---|---|
| **Sales** | Sales Orchestrator | Owns outbound pipeline; decides which leads are worth pursuing using trajectory memory; orchestrates outreach sequences | Lead Scraper, Firmographic Appender, Outbound Drafter, LinkedIn Outreach Specialist |
| **Deals** | Pipeline Commander | Monitors CRM state; on a reply/event, spins up the swarm to handle objections, scheduling, contracts | Meeting Recapper, Proposal Generator, Objection Handler, Contract Drafter |
| **Marketing** | Campaign Director | Owns content calendar and distribution; enforces brand-voice consistency before human review | SEO Strategist, Content Engine, Social Slicer, Hook Writer |
| **Operations** | Delivery Master | Takes over post-close; coordinates internal setup, client onboarding, project tracking | Onboarding Specialist, Process Auditor, Status Reporter |
| **Intelligence** | Research Nexus | Central intelligence hub; serves federated data requests *from* other Queens | Competitor Watch, Buying-Committee Mapper, Sentiment Analyzer, Prospect Dossier Builder |
| **Customer** | Success Orchestrator | Defends retention; monitors support queues and usage telemetry to preempt churn | Support Triage, FAQ Engine, Churn Predictor |
| **Back Office** | Admin Controller | Handles money-in/money-out and HR compliance; **narrowest autonomy of all 7 Queens — every action requires explicit human sign-off, no exceptions** | Invoice Generator, Expense Reconciler, HR Screener |

**Note on Back Office:** this Queen does not get the same consensus-then-autonomous-execute privilege as the others. Given what it touches (money, compliance, personal data in resumes), every single worker output — Queen-reviewed or not — lands in the human Approval Queue with `autonomy_level` capped at `human-assisted`, never `autonomous`, at the catalog level. This cap is enforced in the schema (§3), not just convention.

---

## 7.3 Database Schema Additions

### 3.1 `agent_nodes` — add hierarchy fields

```sql
-- New enum: distinguishes Queens from workers
CREATE TYPE agent_role AS ENUM ('queen', 'worker');

ALTER TABLE agent_nodes
  ADD COLUMN agent_role agent_role NOT NULL DEFAULT 'worker',
  ADD COLUMN parent_agent_id UUID REFERENCES agent_nodes(id),  -- worker's Queen; NULL for Queens themselves
  ADD COLUMN max_autonomy_level autonomy_level DEFAULT 'autonomous', -- hard ceiling; Back Office Queen/workers set this to 'human-assisted'
  ADD COLUMN can_request_federation BOOLEAN DEFAULT false; -- can this Queen call other Queens for data (e.g. Research Nexus)?

CREATE INDEX idx_agent_nodes_parent ON agent_nodes(parent_agent_id);
CREATE INDEX idx_agent_nodes_role ON agent_nodes(agent_role);

-- Constraint: a worker's autonomy_level (and any tenant override) can never exceed its own max_autonomy_level
ALTER TABLE user_agents
  ADD CONSTRAINT autonomy_within_ceiling
  CHECK (true); -- enforced in application layer via trigger below, since it needs a cross-table lookup

CREATE OR REPLACE FUNCTION enforce_autonomy_ceiling() RETURNS TRIGGER AS $$
DECLARE
  ceiling autonomy_level;
BEGIN
  SELECT max_autonomy_level INTO ceiling FROM agent_nodes WHERE id = NEW.agent_id;
  IF NEW.autonomy_override IS NOT NULL AND NEW.autonomy_override > ceiling THEN
    RAISE EXCEPTION 'autonomy_override exceeds this agent''s max_autonomy_level (%)', ceiling;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_autonomy_ceiling
  BEFORE INSERT OR UPDATE ON user_agents
  FOR EACH ROW EXECUTE FUNCTION enforce_autonomy_ceiling();
```
*(Note: Postgres enums don't support `>` comparison out of the box — in the real migration, cast to an explicit ordinal via a small lookup `CASE` expression: `human-led=0, human-assisted=1, autonomous=2`. Shown here in prose form for clarity; the actual migration file will include the ordinal mapping function.)*

### 3.2 New table: `swarms` — the Queen-level execution record

This sits *above* `agent_runs`. One `swarms` row = one goal handed to a Queen. It fans out into multiple `agent_runs` rows (one per worker invoked), then converges back for the consensus check.

```sql
CREATE TYPE swarm_status AS ENUM (
  'planning', 'delegating', 'running_workers', 'consensus_review',
  'needs_review', 'completed', 'rejected', 'error'
);

CREATE TABLE swarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    queen_agent_id UUID NOT NULL REFERENCES agent_nodes(id), -- must be agent_role = 'queen'
    goal_text TEXT NOT NULL,                     -- the raw user goal, e.g. "Launch a campaign for our new pricing"
    decomposition_plan JSONB,                     -- Queen's plan: which workers, what order, what's parallel
    status swarm_status DEFAULT 'planning',
    consensus_passed BOOLEAN,
    consensus_notes TEXT,                          -- Queen's own reasoning for pass/fail, shown to the human
    temporal_workflow_id TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_swarms_user ON swarms(user_id);
CREATE INDEX idx_swarms_status ON swarms(status);

-- Link agent_runs (worker-level) back to the swarm that spawned them
ALTER TABLE agent_runs ADD COLUMN swarm_id UUID REFERENCES swarms(id) ON DELETE CASCADE;
CREATE INDEX idx_agent_runs_swarm ON agent_runs(swarm_id);

-- Cross-Queen federation requests (e.g. Campaign Director asking Research Nexus for data)
CREATE TABLE swarm_federation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requesting_swarm_id UUID NOT NULL REFERENCES swarms(id) ON DELETE CASCADE,
    target_queen_agent_id UUID NOT NULL REFERENCES agent_nodes(id),
    request_payload JSONB NOT NULL,
    response_payload JSONB,
    status TEXT DEFAULT 'pending',                -- 'pending' | 'fulfilled' | 'declined'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_federation_requesting_swarm ON swarm_federation_requests(requesting_swarm_id);
```

### 3.3 RLS for the new tables

```sql
ALTER TABLE swarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarm_federation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_swarms" ON swarms FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own_federation_requests" ON swarm_federation_requests FOR ALL USING (
  auth.uid() = (SELECT user_id FROM swarms WHERE id = swarm_federation_requests.requesting_swarm_id)
);
```

### 3.4 Updated ERD

```
auth.users ──1:N── swarms ──N:1── agent_nodes (agent_role='queen')
     │                │
     │                ├──1:N── agent_runs ──N:1── agent_nodes (agent_role='worker', parent_agent_id → Queen)
     │                │              └──1:N── agent_run_events
     │                │              └──1:N── run_anomaly_flags
     │                └──1:N── swarm_federation_requests ──N:1── agent_nodes (target Queen)
     │
     └──1:N── user_agents ──N:1── agent_nodes
     └──1:N── second_brain_documents ──1:N── second_brain (chunks)
```

---

## 7.4 Orchestration — the Queen Run Loop in Temporal

The Queen's decomposition and consensus steps are themselves Activities — critically, they're **cheap-tier Gemini calls** (structured JSON output: "which workers, what order"), not the expensive generation calls the workers make. This keeps the added orchestration overhead small relative to the value.

```typescript
// workflows/runSwarmWorkflow.ts
import { proxyActivities, defineSignal, setHandler, condition, executeChild } from '@temporalio/workflow';
import type * as activities from '../activities';
import { runAgentWorkflow } from './runAgentWorkflow'; // the existing single-worker workflow, reused as a child

const {
  loadQueenAgent, createSwarmRecord, decomposeGoal,
  fetchSecondBrainContext, runConsensusCheck, updateSwarmRecord,
  requestFederation,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
  retry: { maximumAttempts: 3, backoffCoefficient: 2 },
});

export const swarmApprovalSignal = defineSignal<[{ approvedBy: string }]>('swarm-approval');
export const swarmRejectionSignal = defineSignal<[{ rejectedBy: string; feedback: string }]>('swarm-rejection');

export async function runSwarmWorkflow(input: {
  userId: string; queenAgentId: string; goalText: string;
}) {
  const queen = await loadQueenAgent(input.queenAgentId);
  const swarmId = await createSwarmRecord({ userId: input.userId, queenAgentId: queen.id, goalText: input.goalText, status: 'planning' });

  // Step 1: Queen decomposes the goal into a worker plan (cheap-tier Gemini call, structured output)
  const context = await fetchSecondBrainContext({ tenantId: input.userId, query: input.goalText });
  const plan = await decomposeGoal({ queen, goalText: input.goalText, context });
  await updateSwarmRecord(swarmId, { decomposition_plan: plan, status: 'delegating' });

  // Step 2: Optional cross-Queen federation (e.g. Campaign Director → Research Nexus)
  if (queen.can_request_federation && plan.federationNeeded) {
    for (const req of plan.federationRequests) {
      await requestFederation({ swarmId, targetQueenAgentId: req.targetQueenId, payload: req.payload });
    }
  }

  // Step 3: Execute worker steps — parallel where the plan marks them independent,
  // sequential where one depends on another's output (e.g. research → draft)
  await updateSwarmRecord(swarmId, { status: 'running_workers' });
  const parallelGroups = plan.executionGroups; // [[workerIdA, workerIdB], [workerIdC]] — array of arrays

  const results: Record<string, unknown> = {};
  for (const group of parallelGroups) {
    const groupResults = await Promise.all(
      group.map((workerAgentId: string) =>
        executeChild(runAgentWorkflow, {
          workflowId: `${swarmId}-${workerAgentId}`,
          args: [{ userAgentId: workerAgentId, agentNodeId: workerAgentId, tenantId: input.userId, swarmId }],
        })
      )
    );
    group.forEach((id: string, i: number) => { results[id] = groupResults[i]; });
  }

  // Step 4: Queen consensus check — does the combined output match brand voice / second-brain facts?
  await updateSwarmRecord(swarmId, { status: 'consensus_review' });
  const consensus = await runConsensusCheck({ queen, results, context });

  if (!consensus.passed) {
    // Queen sends it back to the relevant worker(s) — one retry loop, then escalate to human either way
    await updateSwarmRecord(swarmId, {
      status: 'needs_review',
      consensus_passed: false,
      consensus_notes: consensus.reasoning, // ALWAYS shown to the human — a failed Queen check is a flag, not a silent redo
    });
  } else {
    await updateSwarmRecord(swarmId, { status: 'needs_review', consensus_passed: true, consensus_notes: consensus.reasoning });
  }

  // Step 5: Human approval — same Signal pattern as the single-agent workflow, non-negotiable regardless of consensus result
  let approved = false;
  let rejected: { feedback: string } | null = null;
  setHandler(swarmApprovalSignal, () => { approved = true; });
  setHandler(swarmRejectionSignal, (data) => { rejected = data; });
  await condition(() => approved || rejected !== null, '7 days');

  if (rejected) {
    await updateSwarmRecord(swarmId, { status: 'rejected' });
    return { swarmId, status: 'rejected' };
  }
  if (!approved) {
    await updateSwarmRecord(swarmId, { status: 'error' });
    return { swarmId, status: 'timed_out' };
  }

  await updateSwarmRecord(swarmId, { status: 'completed', completed_at: new Date().toISOString() });
  return { swarmId, status: 'completed' };
}
```

**Key design decision worth calling out explicitly:** the Queen's consensus check is a *quality signal shown alongside the human review*, never a bypass of human review. Even a full-consensus-pass swarm still lands in the Approval Queue for human-assisted tier agents. This directly addresses the "who governs the Queen's judgment" risk raised earlier — the answer is: the human always sees the Queen's reasoning, pass or fail, and always makes the final call. Only `autonomous`-tier workers (and never any Back Office worker, per the ceiling in §7.3) skip straight to `execute-action` after a consensus pass.

---

## 7.5 Map UI Implications

- Queens render as a **second visual tier** — larger nodes, one per department, positioned where the department label currently sits, with worker nodes orbiting them (was: worker nodes orbiting an abstract department label with no agent behind it).
- Clicking a Queen node opens a **Swarm Console** (not the standard Detail Panel): a goal input box, a live view of `decomposition_plan` as it's produced, and a real-time tree of which workers are running/done/failed — this is the "visual plan tree" pattern.
- The existing single-node Detail Panel still exists for workers — a user can still click "Lead Scraper" directly and run it standalone (flat mode preserved), or let a Queen invoke it as part of a larger goal. Both paths write to `agent_runs`; only the Queen-invoked path also gets a `swarm_id`.

---

## 7.6 Neural Intelligence Layer — Extended for Swarms

- **GNN (§8.1):** now also scores *Queens*, not just workers — "which department should this tenant hand a goal to next" becomes a first-class prediction, using the same co-activation signal mined from `swarms` instead of only `agent_runs`.
- **Bandit router:** unchanged at the worker level; a second, separate bandit instance can (v2 of this addendum) learn *decomposition plan quality* — did this Queen's chosen worker grouping/ordering lead to a consensus pass and human approval, or repeated rejection? Out of scope for the current build; flagged for later.
- **Autoencoder:** now also scores the Queen's `consensus_notes` — a Queen that passes consensus on outputs that are later rejected by 80%+ of humans is itself anomalous and should be flagged for prompt-tuning review.

---

## 7.7 Honest Tradeoffs — Read Before Committing to the Full Build

Everything above is real and buildable, but three things are true simultaneously:

1. **Cost and latency roughly triple per goal.** A single-worker task was 1 Gemini call. A Queen-orchestrated goal is: 1 decomposition call + N worker calls (parallelizable, so latency is bounded by the slowest branch, not the sum) + 1 consensus call. Budget for it in the bandit's tier selection — decomposition and consensus should almost always route to `cheap` tier, since they're structured/classification tasks, not creative generation.
2. **Debugging surface grows.** A failed swarm could be a bad decomposition, a bad worker output, or a bad consensus judgment. The `agent_run_events` log (master spec §6.2) needs to capture *which* step failed — this is already schema-compatible via `swarm_id` on `agent_runs`, but the Runs & Logs UI needs a swarm-aware view, not just a flat event list.
3. **This roughly doubles Phase 3–4 engineering time** from the original plan. My recommendation stands: build and ship the flat single-agent model first (workers only, no Queens, `agent_role` defaults to `worker` for everything, `swarms` table exists but unused) — get real usage data — then activate Queens for the 2-3 departments where the data shows multi-agent coordination actually helps (my prediction: Marketing and Sales first; Back Office should probably *never* get full Queen autonomy given the human-assisted ceiling already baked into §7.3). The schema in this document supports that incremental rollout natively — nothing here requires Queens to exist on day one.

---

*This addendum is complete and buildable as specified. It does not replace the Master Specification's flat-model MVP path — it extends it. The recommended sequencing is: ship flat, prove usage, activate Queens department-by-department using this schema.*


---

# 8. Neural Intelligence Layer

This is what makes SynapseOS structurally different from a prompt catalog with a UI. Three trained models plus one analysis script, all served from the Python `ml-service`.

## 8.1 Graph Neural Network — "what should this business automate next?"

**Problem it solves:** the deterministic Audit Engine only knows binary ready/blocked. It can't tell a tenant that activating "Lead Sourcing" matters more *right now* than "Invoicing," even if both are technically ready. A GNN trained on real activation patterns across tenants can.

**Model:** GraphSAGE (inductive — required, since new agents ship weekly and the graph must generalize to unseen nodes without retraining from scratch).
- **Nodes** = agents, features = [Gemini description embedding, department one-hot, autonomy level, tenant's current activation state].
- **Edges** = `agent_nodes.dependencies`, plus a learned "co-activation" edge mined from `agent_runs` history across all tenants.
- **Training signal:** implicit — the sequence in which tenants activated agents, and whether each activation led to sustained use (a proxy for "this was the right thing to automate next"). No manual labeling required.
- **Output:** `ml_agent_scores.predicted_priority` per tenant per agent — drives the Map's glow intensity and the Audit report's ranking.

```python
# ml_service/models/gnn_priority.py
import torch
from torch_geometric.nn import SAGEConv

class AgentPriorityGNN(torch.nn.Module):
    def __init__(self, in_channels: int, hidden_channels: int = 128):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, hidden_channels)
        self.head = torch.nn.Linear(hidden_channels, 1)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index).relu()
        return torch.sigmoid(self.head(x)).squeeze(-1)
```
**Cold start:** tenants with < 5 completed runs get the deterministic ranking only (uniform priority within the ready set) — the GNN only activates once there's enough signal to trust it, and it never overrides a "blocked" status from §5.4.

## 8.2 Contextual Bandit — the model router learns instead of following a static map

**Problem it solves:** a hardcoded tier map can't know that "Cold Email Drafting" needs `frontier` for one tenant's complex ICP and is fine on `cheap` for another's simple offer. Thompson sampling learns this per tenant, per agent, from real approval outcomes.

```python
# ml_service/routing/bandit.py
import numpy as np

def select_tier(successes: dict[str, int], failures: dict[str, int]) -> str:
    """Thompson sampling over {cheap, standard, frontier} using Beta(success+1, failure+1)."""
    samples = {
        tier: np.random.beta(successes.get(tier, 0) + 1, failures.get(tier, 0) + 1)
        for tier in ("cheap", "standard", "frontier")
    }
    return max(samples, key=samples.get)
```
Every approval/rejection updates `router_bandit_state`. Over ~20–30 runs per agent, the router converges on the cheapest tier that still gets approved — directly reduces Gemini spend without manual tuning, and is the mechanism behind the "≥30% cost reduction after 30 days" success metric in §1.8.

## 8.3 Autoencoder — catches bad outputs before a human has to

**Problem it solves:** approval queues get skimmed, not carefully read, after a few weeks of trust. An autoencoder trained on each tenant's "normal" run metadata (output length, latency, embedding distance from second-brain context) flags outliers before they reach the queue.

```python
# ml_service/models/anomaly.py
import torch.nn as nn

class RunAutoencoder(nn.Module):
    def __init__(self, input_dim: int = 32, latent_dim: int = 8):
        super().__init__()
        self.encoder = nn.Sequential(nn.Linear(input_dim, 16), nn.ReLU(), nn.Linear(16, latent_dim))
        self.decoder = nn.Sequential(nn.Linear(latent_dim, 16), nn.ReLU(), nn.Linear(16, input_dim))

    def forward(self, x):
        return self.decoder(self.encoder(x))
    # anomaly_score = MSE(x, forward(x))
```
Cold-started on a global prior, fine-tuned per tenant after ~30 runs. Retrained nightly via a scheduled Temporal Workflow (Temporal's native cron support — no separate scheduler needed).

## 8.4 Retrieval Reranker

Bi-encoder (Gemini embeddings) retrieves top-20 candidate second-brain chunks; a small open-source cross-encoder (`cross-encoder/ms-marco-MiniLM-L-6-v2`, CPU-friendly) reranks to the top-5 actually sent to Gemini. Standard, well-proven RAG-quality technique, near-zero marginal cost.

## 8.5 Department Structure — validated by clustering, not assumed

```python
# ml_service/analysis/department_clustering.py
# 1. Use agent_nodes.description_embedding (already stored, Gemini text-embedding-004)
# 2. Build a similarity graph (cosine similarity > threshold = edge)
# 3. Run Louvain community detection (python-louvain, free/OSS)
# 4. Compare detected communities against the current department labels
#    (adjusted Rand index) to quantify agreement/disagreement
```
Hypothesis to test, not assume: **Sales and Deals likely merge** (heavy pipeline-stage overlap), and **Back Office commonly splits into Finance + Admin/HR** once a catalog passes ~100 nodes. `agent_nodes.department` is free text specifically so this can be corrected without a schema migration. Run this analysis in Phase 1, before the Map's visual department layout is locked in.

---

# 9. Testing Strategy

Full pyramid, every layer, all free/OSS tooling.

| Test type | Tool | Scope | When it runs |
|---|---|---|---|
| **Unit — TypeScript** | **Vitest** | Model-tier fallback logic, audit scoring function, chunking algorithm, React component logic, Temporal Activity pure functions | Every commit (pre-commit hook + CI) |
| **Unit — Python** | **pytest** | GNN forward-pass shape checks, bandit tier-selection distribution over many trials, autoencoder reconstruction on synthetic data, chunking edge cases | Every commit |
| **Integration** | **Testcontainers** (real ephemeral Postgres + Redis in CI — not mocks) | Second-brain ingestion → real pgvector query returns expected chunks; Temporal Workflow executes against a recorded/fixture Gemini response; Redis pub/sub round-trip | Every PR |
| **Database / RLS** | **pgTAP** | Every RLS policy gets both an allow-case and a deny-case test: user A cannot read user B's `second_brain`, `agent_runs`, `ml_agent_scores`, etc. | Every migration |
| **Contract** | **Zod (TS) ↔ Pydantic (Python)**, kept in sync via a shared OpenAPI spec generated from the FastAPI service | Prevents payload-shape drift between the two languages at the `ml-service` boundary | Every PR touching either service's API |
| **Workflow / durability** | **Temporal's testing SDK** (`TestWorkflowEnvironment`) | Simulates the 7-day approval timeout without waiting 7 days; verifies retries actually retry; verifies Signal handling | Every PR touching workflow code |
| **End-to-end** | **Playwright** | Full journey: sign up → onboarding → upload doc → click node → run agent → approve → completed state visible | Nightly + pre-release |
| **Load** | **k6** (free, OSS, JS-scriptable) | 150-node Map render performance; 50 concurrent Temporal workflow executions; Redis pub/sub fan-out under load | Before each phase's exit-criteria sign-off |
| **ML model evaluation** | **pytest + a held-out fixed eval set** | GNN: precision@3 against real tenant activation sequences held out from training. Bandit: simulated convergence test (does it reach the cheap tier when cheap-tier success is simulated as guaranteed). Autoencoder: false-positive rate on known-normal runs | Whenever a model is retrained, gating promotion to serve live traffic |
| **Security** | `npm audit` / `pip-audit`, dependency scanning (free tier of tools like Trivy for container images) | Every dependency bump, every image build | CI on every PR + weekly scheduled scan |

**Discipline:** every phase in §10 requires — as part of its exit criteria — unit tests for new logic, at least one integration test against a real containerized dependency, and (for anything touching RLS) a passing pgTAP suite. Nothing ships to "done" on manual browser testing alone.

---

# 10. Infrastructure — Redis & Kubernetes

## 9.1 Redis — two concrete jobs, not decoration

1. **Per-tenant Gemini rate limiting / cost control** — sliding-window counter (`INCR` + `EXPIRE`) checked by a Temporal Activity *before* any Gemini call fires. Directly implements the cost-control NFR.
2. **Node-state pub/sub** — Temporal Activities publish state changes to a Redis channel (`tenant:<id>:agent_runs`); a lightweight WebSocket gateway relays to connected clients. Avoids polling Postgres from every open tab.

## 9.2 Kubernetes layout

```
k8s/
├── web-deployment.yaml            # Next.js app, 2+ replicas, HPA on CPU
├── temporal-deployment.yaml       # Temporal server + worker pods (TS workers)
├── ml-service-deployment.yaml     # FastAPI + PyTorch (CPU is sufficient at this model scale)
├── postgres-statefulset.yaml      # or point at self-hosted Supabase's own Helm chart
├── redis-deployment.yaml
├── ws-gateway-deployment.yaml     # Redis pub/sub → WebSocket relay
├── ingress.yaml                   # nginx-ingress, TLS via cert-manager (free, Let's Encrypt)
└── secrets/                       # Gemini API key, DB creds — K8s Secrets or sealed-secrets for GitOps
```
Local dev: `docker-compose.yml` covers everything without a cluster. `k3d`/`kind` gives a real local K8s cluster to validate manifests before any cloud spend — nothing here is thrown away when you eventually scale to paid infra.

## 9.3 Reference `docker-compose.yml` (local/dev)

```yaml
services:
  web:
    build: ./apps/web
    ports: ["3000:3000"]
    depends_on: [postgres, redis, temporal]
  ml-service:
    build: ./apps/ml-service
    ports: ["8000:8000"]
  temporal:
    image: temporalio/auto-setup:latest
    depends_on: [postgres]
    ports: ["7233:7233"]
  postgres:
    image: supabase/postgres:15.1.0.117  # ships pgvector preinstalled
    environment:
      POSTGRES_PASSWORD: devpassword
    ports: ["5432:5432"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

---

# 11. Implementation Plan

## 10.1 Phased Roadmap

### Phase 0 — Foundations (Week 0)
- Repo scaffold: Next.js 15 + TS + Tailwind + shadcn/ui; Python `ml-service` skeleton (FastAPI, health-check only).
- `docker-compose.yml` up: Postgres (pgvector) + Redis + Temporal dev server.
- CI: lint + typecheck + build + unit tests on every PR (GitHub Actions).
- Gemini API key provisioned (free tier).

### Phase 1 — Visual MVP + Department Validation (Weeks 1–2)
- `react-force-graph-2d` with ~30 seed agents across departments (JSON fixture matching `agent_nodes`).
- Radial physics layout; Detail Panel (shadcn `Sheet`) with static content.
- Design tokens implemented (§7.4.2).
- **Run the department-clustering script (§8.5) against the real 96-agent content** — lock the final department taxonomy before the graph layout is treated as final.
- **Exit criteria:** Map navigable, keyboard nav + reduced-motion pass, Vitest coverage on layout/state logic, department taxonomy decision documented with clustering output attached.

### Phase 2 — Second Brain & RAG (Weeks 3–4)
- Self-hosted Supabase Auth wired; RLS policies applied — **pgTAP suite proving cross-tenant denial** for every table.
- Onboarding interview UI → `second_brain_documents`.
- `ingestSecondBrainWorkflow` (Temporal): chunk → embed (Gemini) → store.
- Second Brain manager UI.
- **Exit criteria:** Upload → chunks appear with valid 768-dim embeddings → a test vector query returns relevant chunks; integration test (Testcontainers) covers this end-to-end; pgTAP passes.

### Phase 3 — The Engine (Weeks 5–6)
- `runAgentWorkflow` implemented per §5.2, wired to 3 real agents (Lead Sourcing, Cold Email Drafting, Meeting Recap).
- Gemini integration via `@google/generative-ai`; static tier map as the pre-bandit default.
- Redis pub/sub + WS gateway for live node state.
- **Exit criteria:** end-to-end click → pulse → real Gemini-generated draft grounded in the tenant's second brain; Temporal test-SDK coverage of the workflow; k6 smoke test at 10 concurrent runs.

### Phase 4 — Autonomy, Audit & ML v1 (Weeks 7–8)
- Temporal Signal-based approval flow; Approval Queue UI.
- MCP integration for at least one real "commit" action (e.g., Gmail send), gated behind human-assisted approval.
- Deterministic Audit Engine (§5.4) live, cached in `audit_snapshots`.
- **Bandit router (§8.2) goes live**, replacing the static tier map — `router_bandit_state` starts accumulating.
- **Exit criteria:** approved human-assisted runs produce a real external side effect; Audit Engine correctly marks a controlled seeded test set ready/blocked; bandit simulation test confirms convergence behavior.

### Phase 5 — Intelligence Layer (Weeks 9–10)
- GNN (§8.1) trained on whatever real activation data exists by this point (bootstrap with synthetic sequences if needed pre-launch); served via `ml-service /rank`.
- Autoencoder (§8.3) trained on global prior; anomaly badges live in the Approval Queue.
- Reranker (§8.4) wired into `fetchSecondBrainContext` → `rerankContext`.
- **Exit criteria:** GNN evaluation (precision@3) passes a minimum bar on held-out sequences; autoencoder false-positive rate on known-normal runs is acceptable; reranked RAG demonstrably improves answer relevance on a fixed eval set vs. raw vector search.

### Phase 6 — Hardening & Launch Prep (Weeks 11–12)
- Observability: OpenTelemetry traces across TS + Python; Grafana/Prometheus/Loki dashboards.
- Billing: Stripe subscription tiers with usage metering on `agent_runs`.
- Load test: 150-node render + 50 concurrent Temporal workflows + WS fan-out under k6.
- Security review: RLS pgTAP suite re-run against every migration since Phase 2; dependency scan (Trivy/`npm audit`/`pip-audit`); secrets audit.
- K8s manifests validated on a local `k3d` cluster; deployment runbook written.
- Expand agent catalog toward launch set (target: 20–30 fully wired agents across the validated department set; remaining catalog visible as "coming soon," never faked).

## 10.2 Team & Ownership

| Role | Owns |
|---|---|
| Frontend eng | Map, Detail Panel, Dashboards, design tokens |
| Backend/platform eng | Temporal workflows, Postgres/RLS, Redis, K8s manifests, MCP integrations |
| ML eng | GNN, bandit, autoencoder, reranker, department clustering, model eval harness |
| Founder/PM | Agent catalog content, onboarding copy, department taxonomy sign-off |

## 10.3 Definition of Done (every phase)

A phase is not complete until: the feature works end-to-end with real data (no mocked happy paths), RLS-verified via pgTAP where tenant data is touched, covered by at least one automated integration test, and manually walked through on a mobile viewport.

---

# 12. Complete Agent Catalog — 96 Workers, 7 Queens

This is the full content layer: every worker agent's role, trigger, tool integration, autonomy setting, and dependencies, organized under its Queen. This is the seed data for the `agent_nodes` table defined in §6 and §7.3.

## 12.1 Why 96, not 137
 — 137 → 96

You're right to push on this. 137 across exactly 7 departments (22/24/23/19/17/14/18) is SkillTree's specific number, and keeping it made SynapseOS look like a reskin regardless of the Queen architecture underneath. Two honest problems with 137, beyond optics:

1. **Real duplication.** The original list had near-identical agents doing the same job under different names (e.g., a separate "PTO Request Router" and "Office Supply Reorder Agent" that are both just "route a simple internal request," or five different Deals-stage workers — Verbal Agreement Logger, Follow-Up Scheduler, Reference Customer Finder — that a single well-scoped worker handles better than three narrow ones). Splitting a job into more nodes than it needs doesn't make the product more capable, it makes the map noisier and each node individually low-value.
2. **More nodes ≠ more automation.** What actually matters is how much real work gets automated, not how many boxes are on the map. A consolidated worker with a well-designed system prompt does the job of 2-3 narrow ones without the seams between them (and without 2-3x the LLM calls, cost, and failure surface for a job that's really one coherent task).

**The new number is 96**, arrived at by merging genuinely redundant workers into single, more capable ones (each merge is noted where it happened) — not by cutting capability, by removing the artificial fragmentation. Department split: **Sales 16 · Deals 17 · Marketing 16 · Operations 13 · Intelligence 12 · Customer 10 · Back Office 12.**

This number is also *not* meant to be permanent or sacred the way 137 was for SkillTree — the catalog is designed to grow or shrink per the department-clustering analysis (Master Spec §7.5) and real usage data. 96 is where the content is honest today, not a marketing target.

---

## 12.2 New Columns — What Tech Runs Each Agent, and Who Decides

Every worker below now carries two new fields the previous catalog didn't have:

- **Trigger** — what actually causes this agent to run. Five kinds:
  - `Human click` — a person opens the node/Swarm Console and runs it directly.
  - `Queen delegation` — a Queen's goal decomposition assigns it as part of a larger swarm (see Swarm Addendum §4).
  - `Event` — an external event fires it (CRM stage change, inbound email, webhook) via a Temporal Signal.
  - `Cron` — scheduled (e.g., nightly re-enrichment, weekly competitor scan) via Temporal's native cron scheduling.
  - `Chained` — automatically runs the moment its `dependencies` complete, no separate trigger needed.
- **Primary Tool** — the actual MCP server, API, or internal capability the agent calls, beyond the base Gemini generation call every agent makes. This is what makes each node a real integration, not just a prompt.

**Who decides the trigger type for a given agent?** Set once, at the catalog level, by whoever owns the agent definition (initially you, as the founder/PM role in the Master Spec's team table — Master Spec §10.2) — it's a property of `agent_nodes`, not something a tenant configures per-run. A tenant *can* override `autonomy_override` (how much approval it needs) but not *when* it's eligible to fire — that's catalog design, kept consistent across all tenants for predictability and easier debugging.

---

## 12.3 Sales Swarm — 16 Workers

## Queen: Sales Orchestrator
**Decomposes goals like:** "fill the pipeline with 50 qualified leads this month" into a sourcing → enrichment → outreach chain, sequenced and partly parallelized.
**Consensus checks:** outbound copy vs. `voice.md`; targeting vs. `offer.md`'s ICP; no duplicate outreach to already-contacted accounts.

| Worker | Replaces | Trigger | Primary Tool | Autonomy | Builds on |
|---|---|---|---|---|---|
| ICP Definer | Founder's mental model of "who we sell to" | Human click | Gemini only (structured Q&A) | HL | — |
| Lead Sourcing Coordinator | SDR's manual list-building rotation | Queen delegation | Orchestrates workers below | HA/A | ICP Definer |
| List Building Agent | Manual prospect list assembly | Chained | Apollo/Clay MCP connector | HA/A | Lead Sourcing Coordinator |
| Web & Maps Scraper | Junior researcher pulling listings | Chained | Firecrawl + Google Maps API | HA/A | List Building Agent |
| Social Mining Agent | SDR browsing LinkedIn manually (absorbs Warm Intro Finder) | Chained | LinkedIn Sales Navigator MCP | HA/A | ICP Definer |
| Database Miner | Paid data-vendor exports, manually filtered | Chained | Exa / ZoomInfo API | HA/A | ICP Definer |
| Prospect Qualifier | SDR manually scoring leads | Chained | Gemini scoring call | HA/A | Lead Sourcing Coordinator |
| Firmographic Appender | Manual company research per lead | Chained | Exa + Firecrawl | A | Prospect Qualifier |
| Trigger Event Monitor | SDR checking news/job-change signals manually (absorbs Job Change Alert) | Cron (daily) | News API + LinkedIn MCP | A | Firmographic Appender |
| Outbound Drafter | $60–80k/yr SDR's cold-email output | Queen delegation | Gemini generation | HA | Firmographic Appender, ICP Definer |
| Subject Line Generator | Copywriter's A/B subject testing | Chained | Gemini generation | A | Outbound Drafter |
| Cold Email Sequencer | SDR manually spacing follow-ups | Chained | Gmail/Outlook MCP (draft only until approved) | HA/A | Outbound Drafter, Subject Line Generator |
| LinkedIn Outreach Specialist | SDR's manual connection requests + DMs | Human click or Queen delegation | HeyReach/LinkedIn MCP | HA | Outbound Drafter |
| Outreach Cadence Optimizer | Sales ops tuning send timing (absorbs A/B Tester, Referral Tracker) | Cron (weekly) | Gemini analysis over `agent_runs` outcomes | A | Cold Email Sequencer |
| Reply Classifier | SDR manually triaging inbox replies | Event (inbound email) | Gmail MCP webhook | A | Cold Email Sequencer |
| Meeting Booker | SDR manually coordinating calendars | Event (positive reply) | Google Calendar MCP | HA/A | Reply Classifier |

---

## 12.4 Deals Swarm — 17 Workers

## Queen: Pipeline Commander
**Decomposes goals like:** "move this reply through to a signed deal" — triggered automatically by CRM events, not usually a manual goal.
**Consensus checks:** proposal pricing vs. `offer.md` approved tiers; contract language vs. legal-approved templates; no open objection before a proposal ships.

| Worker | Replaces | Trigger | Primary Tool | Autonomy | Builds on |
|---|---|---|---|---|---|
| Meeting Recapper | Rep's manual call notes | Event (call ends) | Fireflies/Otter MCP transcript ingestion | HA/A | — |
| Next-Step Extractor | Rep manually identifying action items | Chained | Gemini extraction | A | Meeting Recapper |
| CRM Updater | Rep manually logging outcomes | Chained | HubSpot/Salesforce MCP | A | Meeting Recapper, Next-Step Extractor |
| Champion Mapper | Rep tracking the internal advocate | Chained | Gemini extraction over transcript | HA | Meeting Recapper |
| Objection Handler | Rep drafting pushback replies from memory | Event (objection detected) | Gemini generation + Second Brain RAG | HA | Meeting Recapper |
| Competitive Battlecard Generator | Sales enablement's manual battlecards | Human click / Cron (monthly refresh) | Gemini + Research Nexus federation | HA/A | — |
| Pricing Calculator | Rep manually assembling quotes | Human click | Internal pricing rules engine | HA/A | — |
| SOW Builder | Ops manually drafting statements of work | Chained | Gemini generation | HA | Pricing Calculator |
| Proposal Generator | $60–80k/yr AE's core deliverable | Queen delegation | Gemini generation | HA | Pricing Calculator, SOW Builder, Champion Mapper |
| Redline Reviewer | Legal manually checking contract changes (absorbs Legal Clause Checker) | Event (redline received) | Gemini diff analysis | HA | Proposal Generator |
| Contract Drafter | Legal drafting standard agreements | Chained | DocuSign/PandaDoc MCP | HA | Redline Reviewer, Proposal Generator |
| E-signature Chaser | Rep manually following up unsigned docs | Cron (every 3 days) | DocuSign MCP status check | A | Contract Drafter |
| Discount Approval Router | Sales manager approving discounts manually (absorbs Deal Desk Assistant) | Event (discount requested) | Slack MCP for manager ping | HA | Pricing Calculator |
| Deal Risk Scorer | Sales manager's gut-check on deal health | Cron (daily) | Gemini scoring over CRM signals | A | Meeting Recapper, Champion Mapper |
| Pipeline Stage Updater | Rep manually moving CRM stages | Chained | HubSpot/Salesforce MCP | A | CRM Updater, Deal Risk Scorer |
| Deal Slippage Alerter | Sales manager noticing stalled deals late | Cron (daily) | Slack MCP alert | A | Pipeline Stage Updater |
| Win/Loss Analyzer | Sales ops' quarterly review (absorbs Verbal Agreement Logger, Follow-Up Scheduler, Reference Customer Finder, Negotiation Coach, Renewal Flagger/Upsell Spotter) | Cron (monthly) | Gemini analysis over closed deals | HA | Pipeline Stage Updater |

---

## 12.5 Marketing Swarm — 16 Workers

## Queen: Campaign Director
**Decomposes goals like:** "launch a campaign for our new pricing model" into research → brief → draft → repurpose, federating to Research Nexus for competitive context.
**Consensus checks:** brand-voice consistency across formats; factual claims checked against `company.md`.

| Worker | Replaces | Trigger | Primary Tool | Autonomy | Builds on |
|---|---|---|---|---|---|
| Keyword Researcher | SEO's manual search-intent mining | Human click | Ahrefs/SEMrush MCP (or free-tier equivalent) | A | — |
| SEO Strategist | Content strategist's brief-writing | Chained | Gemini + Keyword Researcher output | HA | Keyword Researcher |
| Content Calendar Planner | Marketing manager's manual calendar | Human click | Internal calendar model | HA/A | SEO Strategist |
| Content Engine | $70–90k/yr writer's long-form output (absorbs SEO Meta Writer) | Queen delegation | Gemini generation | HA | SEO Strategist |
| Hook Writer | Copywriter's opening-line brainstorming | Chained | Gemini generation | HA/A | Content Engine |
| Landing Page Copywriter | Conversion copywriter's page drafts | Human click | Gemini generation | HA | Content Engine, Hook Writer |
| Ad Copy Generator | Paid media copywriter's variants (absorbs A/B Headline Tester) | Human click | Gemini generation + Google/Meta Ads MCP | HA | Hook Writer |
| Newsletter Drafter | Marketing manager's weekly send | Cron (weekly) | Gemini + ConvertKit/Mailchimp MCP | HA | Content Engine |
| Social Slicer | Social media manager's repurposing (absorbs Community Post Drafter) | Chained | Gemini generation | HA/A | Content Engine |
| Video Script Writer | Video producer's scripts (absorbs Podcast Show Notes Writer) | Human click | Gemini generation | HA | Content Engine |
| Case Study Writer | Customer marketing's manual write-ups | Human click | Gemini + client interview notes (cl doc-type) | HA | — |
| Press Release Drafter | PR agency's boilerplate drafting | Human click | Gemini generation | HA | — |
| Backlink Prospector | SEO's manual link-building outreach | Cron (weekly) | Exa search + email draft | HA/A | Keyword Researcher |
| Brand Voice Auditor | Brand manager's manual consistency review | Cron (weekly) | Gemini + embedding drift check vs. `voice.md` | A | — |
| Content Repurposer | Content manager's cross-format adaptation | Chained | Gemini generation | A | Content Engine |
| Campaign Performance Summarizer | Marketing analyst's weekly report | Cron (weekly) | Google Analytics/HubSpot MCP | A | Content Calendar Planner |

---

## 12.6 Operations Swarm — 13 Workers

## Queen: Delivery Master
**Decomposes goals like:** "onboard this new client" — triggered automatically the moment the Pipeline Commander marks a deal closed-won.
**Consensus checks:** onboarding packet matches signed SOW; internal handoff notes complete before client-facing kickoff.

| Worker | Replaces | Trigger | Primary Tool | Autonomy | Builds on |
|---|---|---|---|---|---|
| Client Kickoff Scheduler | PM's manual first-call coordination | Event (deal closed-won) | Google Calendar MCP | HA/A | — |
| Onboarding Specialist | Ops coordinator's manual welcome packet | Queen delegation | Gemini generation | HA | Client Kickoff Scheduler |
| Client Portal Provisioner | IT/ops manually setting up access | Chained | Internal auth API | A | Onboarding Specialist |
| SOP Writer | Ops manager documenting from scratch | Human click | Gemini generation | HA | — |
| Handoff Note Generator | Sales-to-delivery handoff, manually written | Event (deal closed-won, reads Deals Swarm output) | Gemini extraction | A | — |
| Task Assigner | PM's manual work distribution | Chained | Asana/Linear MCP | HA/A | Handoff Note Generator |
| Resource Allocator | Ops manager balancing capacity (absorbs Capacity Planner) | Cron (weekly) | Gemini + team calendar data | HA | Task Assigner |
| Project Tracker | PM's manual status-board updates | Chained | Asana/Linear MCP | A | Task Assigner |
| Bottleneck Detector | PM noticing delays late, manually | Cron (daily) | Gemini analysis over Project Tracker data | A | Project Tracker |
| Status Reporter | PM's weekly client update emails | Cron (weekly) | Gemini + Gmail MCP | HA | Project Tracker |
| Deliverable QA Checker | QA lead's manual review against spec | Event (deliverable submitted) | Gemini review vs. SOW | HA | Project Tracker |
| Escalation Router | Ops manager triaging urgent issues | Event (SLA breach) | Slack MCP alert | A | Bottleneck Detector |
| Process Auditor | Ops consultant's periodic review (absorbs Post-Mortem Writer, Time Tracking Auditor, Internal Wiki Updater, Vendor Coordinator, Meeting Agenda Builder) | Cron (monthly) | Gemini analysis over full Ops history | HA | Bottleneck Detector, Deliverable QA Checker |

---

## 12.7 Intelligence Swarm — 12 Workers

## Queen: Research Nexus
**Decomposes goals like:** she's usually the *responder*, not the initiator — most of her work is fulfilling federation requests from the other six Queens.
**Consensus checks:** every factual claim traceable to a cited source; data freshness flagged if >90 days old.

| Worker | Replaces | Trigger | Primary Tool | Autonomy | Builds on |
|---|---|---|---|---|---|
| Company Deep-Dive Analyst | Analyst's manual account research | Human click / Federation request | Exa + Firecrawl | HA | — |
| Account Enrichment Agent | Manual firmographic lookup, bulk (absorbs Growth Signal Scorer) | Federation request / Chained | Exa + Firecrawl | A | Company Deep-Dive Analyst |
| Contact Enrichment Agent | Manual contact-detail lookup | Chained | Apollo/Clay MCP | A | Account Enrichment Agent |
| Email Verification Agent | Manual bounce-checking before send | Chained | NeverBounce/ZeroBounce API | A | Contact Enrichment Agent |
| Fit Scoring Agent | Analyst's manual ICP-fit scoring | Chained | Gemini scoring | A | Account Enrichment Agent |
| Tech Stack Detector | Manual BuiltWith-style lookups (single shared instance, consumed by Sales) | Chained / Federation request | BuiltWith API | A | Account Enrichment Agent |
| Buying-Committee Mapper | Analyst's manual org-charting | Human click / Federation request | LinkedIn MCP + Gemini | HA | Contact Enrichment Agent |
| Prospect Dossier Builder | $80k+/yr research analyst's account brief | Federation request | Gemini synthesis | HA | Company Deep-Dive Analyst, Buying-Committee Mapper |
| Competitor Watch | Analyst's manual weekly competitor check (absorbs Patent/Funding Tracker) | Cron (weekly) | Firecrawl + Gemini diff | A | — |
| Market Trend Scanner | Analyst's manual industry-news roundup (absorbs News Monitor, Regulatory Change Monitor) | Cron (daily) | News API + Gemini summarization | A | — |
| Sentiment Analyzer | Brand analyst's manual social-mention scan | Cron (daily) | Social listening API | A | — |
| TAM Estimator | Strategy consultant's manual market-sizing (absorbs Industry Report Summarizer) | Human click | Gemini + Market Trend Scanner data | HA | Market Trend Scanner |

---

## 12.8 Customer Swarm — 10 Workers

## Queen: Success Orchestrator
**Decomposes goals like:** "check in on at-risk accounts this week" — usually self-initiated on a cron, not a human-typed goal.
**Consensus checks:** response tone matches `voice.md`; churn-risk backed by ≥2 independent signals, not one noisy metric.

| Worker | Replaces | Trigger | Primary Tool | Autonomy | Builds on |
|---|---|---|---|---|---|
| Support Triage | Support lead's manual tagging/prioritizing | Event (ticket created) | Zendesk/Intercom MCP | A | — |
| Ticket Summarizer | Agent manually condensing threads (absorbs Knowledge Base Gap Finder) | Chained | Gemini summarization | A | Support Triage |
| FAQ Engine | Support content writer, reactive | Cron (weekly, from ticket patterns) | Gemini generation + help-center CMS | HA/A | Ticket Summarizer |
| Escalation Drafter | Senior agent's manual escalation write-up | Event (escalation flagged) | Gemini generation | HA | Support Triage |
| Community Moderator | Community manager's manual moderation | Event (new post/comment) | Discord/Slack community MCP | HA/A | — |
| Feedback Categorizer | PM's manual feedback tagging (absorbs NPS Survey Analyzer) | Chained | Gemini classification | A | Ticket Summarizer |
| Customer Health Scorer | CSM's manual health spreadsheet | Cron (daily) | Gemini + product usage API | A | Feedback Categorizer |
| Churn Predictor | CS ops' manual at-risk review (absorbs Renewal Risk Flagger, Onboarding Health Checker) | Cron (weekly) | Gemini scoring over Health Scorer data | HA | Customer Health Scorer |
| Usage Report Generator | CSM's manual monthly usage summary | Cron (monthly) | Product analytics API + Gemini | A | Customer Health Scorer |
| Success Plan Builder | CSM's manual quarterly plan drafting | Human click / Queen delegation | Gemini generation | HA | Usage Report Generator, Churn Predictor |

---

## 12.9 Back Office Swarm — 12 Workers

## Queen: Admin Controller
**Autonomy ceiling:** every worker below is hard-capped at `max_autonomy_level = human-assisted` in the schema — never autonomous, regardless of tenant trust level.
**Decomposes goals like:** "run month-end close" — a scheduled, not spontaneous, goal.
**Consensus checks:** every number reconciles against its source system before reaching a human; zero tolerance for unexplained discrepancies.

| Worker | Replaces | Trigger | Primary Tool | Autonomy | Builds on |
|---|---|---|---|---|---|
| Invoice Generator | Bookkeeper's manual monthly billing | Cron (monthly) | Stripe/QuickBooks MCP | HA (ceiling: HA) | — |
| Receipt Scanner | Bookkeeper's manual receipt entry | Event (receipt uploaded) | OCR + QuickBooks MCP | HA | — |
| Expense Reconciler | Bookkeeper's manual transaction matching | Chained | QuickBooks MCP | HA | Receipt Scanner |
| Bank Reconciliation Agent | Bookkeeper's manual bank-feed matching | Cron (weekly) | Plaid/bank feed API | HA | Expense Reconciler |
| Budget Variance Reporter | Finance manager's manual variance analysis | Cron (monthly) | QuickBooks MCP + Gemini | HA | Bank Reconciliation Agent |
| Vendor Payment Scheduler | AP clerk's manual payment scheduling | Cron (weekly) | QuickBooks/bill.com MCP | HA | Bank Reconciliation Agent |
| Bookkeeping Assistant | Junior bookkeeper's ledger entry (absorbs Tax Document Organizer, Contract Filer) | Chained | QuickBooks MCP | HA | Expense Reconciler, Bank Reconciliation Agent |
| Compliance Checklist Tracker | Ops/legal's manual deadline tracking (absorbs Policy Document Updater) | Cron (weekly) | Gemini + calendar API | HA | — |
| HR Screener | Recruiter's manual resume screening | Event (application received) | ATS MCP (Greenhouse/Lever) | HA | — |
| Interview Question Drafter | Hiring manager's manual question prep | Chained | Gemini generation | HA | HR Screener |
| Employee Onboarding Paperwork Agent | HR admin's manual paperwork (absorbs Reference Check Assistant) | Event (offer accepted) | HRIS MCP (Gusto/Rippling) | HA | HR Screener |
| Payroll Checker | Bookkeeper's manual payroll pre-run review (absorbs PTO Request Router, Office Supply Reorder Agent) | Cron (bi-weekly, before payroll run) | Gusto/Rippling MCP | HA | Bank Reconciliation Agent |

---

## 12.10 Decision-Authority Summary — Who Actually Decides What, End to End

| Decision | Who/what decides | Where it's enforced |
|---|---|---|
| Which agent exists at all, and its default trigger type | Catalog owner (founder/PM), set once in `agent_nodes` | Database — not tenant-configurable |
| Whether a specific tenant can activate an agent | Deterministic Audit Engine (Second Brain completeness + dependencies) | `audit_snapshots`, Master Spec §5.4 |
| Which "ready" agent to activate *next* | GNN priority score, once enough history exists; deterministic fallback otherwise | `ml_agent_scores`, Master Spec §7.1 |
| Which model tier (cheap/standard/frontier) runs a given call | Bandit router, learned per tenant per agent | `router_bandit_state`, Master Spec §7.2 |
| Whether a worker's output needs human approval before acting | The worker's `autonomy_level` (tenant-overridable downward only, capped by `max_autonomy_level`) | `user_agents.autonomy_override`, Swarm Addendum §3.1 |
| Whether a Queen's consensus check passes | The Queen's own Gemini-backed consensus Activity, using criteria listed per-Queen above | `swarms.consensus_passed` — always shown to the human, never a silent bypass |
| Final go/no-go on any output that reaches a human | The human, always — no exceptions, including full-consensus-pass swarms | Temporal Signal (`approvalSignal`/`rejectionSignal`) |

---

*This is the seed content for 96 worker rows + 7 Queen rows = 103 total `agent_nodes` records. Next layer of depth: actual system-prompt text per agent, written as each is wired for real execution — starting with the Phase 3 MVP trio (Lead Sourcing chain, Outbound Drafter, Meeting Recapper) per the Master Specification's implementation plan.*


---

# 13. Appendix

## 13.1 Non-Functional Requirements (full list)

- **Security:** RLS on every tenant-scoped table; service-role key never client-side; secrets via K8s Secrets/sealed-secrets; audit trail immutable at the DB permission level.
- **Privacy:** Second Brain content is tenant-owned; no cross-tenant training or retrieval ever — the GNN and bandit train on *behavioral patterns* (sequences, outcomes), never on raw second-brain content, so no tenant's business data leaks into another tenant's model inputs.
- **Reliability:** all Gemini calls wrapped in Temporal Activities with automatic retry (3x, exponential backoff) before surfacing an `error` state.
- **Cost control:** Redis-enforced per-tenant rate limits; bandit-driven tier selection; `agent_runs.cost_usd` tracked per run.
- **Performance:** Map interactive within 1s of first paint with the full catalog loaded.

## 13.2 Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini output quality inconsistent across 96 agent types | High | Medium | Launch narrow (20–30 agents), expand only after per-agent prompt tuning + eval |
| Tenant data leakage across RLS misconfiguration | Low (if tested) | Critical | pgTAP suite run in CI against every migration, both allow and deny cases |
| GNN cold-start gives bad early rankings | Medium | Low (falls back to deterministic) | Explicit minimum-history gate before GNN output is trusted (§8.1) |
| Bandit converges to a *cheap* tier that quietly produces worse output | Medium | Medium | Approval outcome, not just "ran successfully," is the bandit's success signal — bad-but-completed output still counts as failure if rejected/edited |
| Self-hosted Temporal/Postgres/Redis operational burden vs. managed services | Medium | Medium | Start on a single VM via docker-compose; only move to K8s once traffic actually requires it — manifests are ready either way |
| Gemini free-tier quota exceeded at scale | Medium (post-growth) | Medium | Bandit's cost-minimization directly delays this; usage dashboards give early warning before hard limits hit |
| "96 agents" promise undersells if only 20–30 are real at launch | Medium | Reputational | UI honestly labels non-wired nodes "coming soon," never fakes a run |
| Department taxonomy assumed wrong pre-launch | Low (now mitigated) | Low | §8.5 clustering analysis runs in Phase 1, before layout is locked |

## 13.3 Glossary

- **Second Brain** — the tenant's embedded, retrievable knowledge base.
- **Autonomy Ladder** — human-led / human-assisted / autonomous execution tiers.
- **Durable Execution** — Temporal's guarantee that each workflow step's result is memoized so a crash or pause never re-runs completed work or loses state.
- **Node** — one agent definition in `agent_nodes`, rendered as a point on the Map.
- **Deterministic Audit Engine** — the rule-based scorer (§5.4), always the trust floor.
- **GNN Priority** — the learned re-ranking layer on top of the deterministic engine (§8.1).
- **Bandit Router** — the Thompson-sampling model-tier selector (§8.2).

---

*End of specification. This is the single source of truth for the build. Update in place as scope evolves rather than forking new versions.*
