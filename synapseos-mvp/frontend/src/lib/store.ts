import { create } from 'zustand';

export interface WorkerInfo {
  name: string;
  department: string;
  role: string;
  description: string;
  skills: string[];
  status: 'active' | 'syncing' | 'idle';
  load: string;
}

export interface DepartmentInfo {
  name: string;
  color: string;
  tagline: string;
  description: string;
  workers: WorkerInfo[];
}

export const DEPARTMENTS_DATA: Record<string, DepartmentInfo> = {
  Sales: {
    name: 'Sales',
    color: '#7C93FF',
    tagline: 'Autonomous Pipeline & Deal Intelligence',
    description: 'Deploys autonomous lead discovery, signal-driven prospecting, and multi-channel outreach workflows.',
    workers: [
      {
        name: 'Lead Scraper',
        department: 'Sales',
        role: 'Prospect Discovery Engine',
        description: 'Continuously monitors buying signals across professional graphs, tech stack changes, and hiring updates.',
        skills: ['parse_dom', 'extract_schema', 'rate_limiter', 'enrich_company'],
        status: 'active',
        load: '88% load'
      },
      {
        name: 'Outbound Drafter',
        department: 'Sales',
        role: 'Hyper-Personalized Copywriter',
        description: 'Synthesizes account intelligence into contextual emails, LinkedIn touchpoints, and executive memos.',
        skills: ['context_inject', 'llm_generate', 'sentiment_check', 'token_stream'],
        status: 'active',
        load: '74% load'
      },
      {
        name: 'Pipeline Scorer',
        department: 'Sales',
        role: 'Predictive Velocity Modeler',
        description: 'Calculates win probabilities, budget authority signals, and deal decay velocity in real time.',
        skills: ['logistic_regression', 'crm_sync', 'anomaly_detector'],
        status: 'syncing',
        load: '52% load'
      }
    ]
  },
  Marketing: {
    name: 'Marketing',
    color: '#F2A65A',
    tagline: 'Brand Synthesis & Audience Expansion',
    description: 'Generates cross-platform campaigns, analyzes market sentiment, and optimizes ad budget allocations.',
    workers: [
      {
        name: 'Audience Segmenter',
        department: 'Marketing',
        role: 'Behavioral Cluster Engine',
        description: 'Groups anonymous visitors by behavioral intent and technical sophistication markers.',
        skills: ['kmeans_vector', 'event_stream', 'identity_resolution'],
        status: 'active',
        load: '65% load'
      },
      {
        name: 'Campaign Optimizer',
        department: 'Marketing',
        role: 'Real-Time Bid & Copy Aligner',
        description: 'Auto-adjusts performance creative variations based on 10-minute micro-conversion telemetry.',
        skills: ['bid_optimizer', 'multivariate_eval', 'creatives_generator'],
        status: 'active',
        load: '81% load'
      }
    ]
  },
  Operations: {
    name: 'Operations',
    color: '#38EF7D',
    tagline: 'Autonomous Infrastructure & Workflow Orchestration',
    description: 'Schedules agent compute cycles, balances task queues, and enforces governance policies across swarms.',
    workers: [
      {
        name: 'Queue Dispatcher',
        department: 'Operations',
        role: 'Sub-second Task Scheduler',
        description: 'Prioritizes high-urgency agent invocations and routes payloads across edge compute clusters.',
        skills: ['priority_queue', 'token_budgeter', 'failover_router'],
        status: 'active',
        load: '92% load'
      },
      {
        name: 'Compute Scaler',
        department: 'Operations',
        role: 'Dynamic Capacity Allocator',
        description: 'Spins up ephemeral subagent sandboxes in response to incoming priority spikes.',
        skills: ['container_burst', 'memory_compactor', 'cost_guardrail'],
        status: 'syncing',
        load: '45% load'
      }
    ]
  },
  Intelligence: {
    name: 'Intelligence',
    color: '#9D4EDD',
    tagline: 'Global Knowledge Graph & Vector Memory',
    description: 'Maintains cross-departmental memory consolidation, semantic indexing, and factual verification.',
    workers: [
      {
        name: 'Graph Synthesizer',
        department: 'Intelligence',
        role: 'Entity Relationship Builder',
        description: 'Extracts latent connections between customers, market events, and internal agent outputs.',
        skills: ['neo4j_adapter', 'embedding_cos', 'relation_extractor'],
        status: 'active',
        load: '84% load'
      },
      {
        name: 'Fact Auditor',
        department: 'Intelligence',
        role: 'Zero-Hallucination Gatekeeper',
        description: 'Verifies external claims against verified ground-truth knowledge bases before deployment.',
        skills: ['source_verifier', 'semantic_consistency', 'grounding_eval'],
        status: 'active',
        load: '70% load'
      }
    ]
  },
  Customer: {
    name: 'Customer',
    color: '#FF6584',
    tagline: 'Proactive Success & Friction Resolution',
    description: 'Detects customer friction before tickets are filed and autonomously dispatches resolution agents.',
    workers: [
      {
        name: 'Telemetry Monitor',
        department: 'Customer',
        role: 'Friction Sentinel',
        description: 'Streams user interaction anomalies, latency regressions, and churn propensity signals.',
        skills: ['session_replay_ai', 'churn_regressor', 'webhook_emitter'],
        status: 'active',
        load: '76% load'
      },
      {
        name: 'Resolution Agent',
        department: 'Customer',
        role: 'Autonomous Action Solver',
        description: 'Triggers automated database corrections, invoice updates, and proactive executive check-ins.',
        skills: ['api_dispatch', 'workflow_patcher', 'summary_compiler'],
        status: 'idle',
        load: '31% load'
      }
    ]
  },
  'Back Office': {
    name: 'Back Office',
    color: '#00F2FE',
    tagline: 'Legal, Compliance & Financial Reconciliation',
    description: 'Ensures strict regulatory compliance, audits smart agent expenditures, and parses contracts.',
    workers: [
      {
        name: 'Ledger Reconciler',
        department: 'Back Office',
        role: 'Real-Time Bookkeeper',
        description: 'Matches bank feeds with agent-initiated SaaS billing and Stripe payment intents instantaneously.',
        skills: ['double_entry_engine', 'invoice_ocr', 'tax_calculator'],
        status: 'active',
        load: '59% load'
      },
      {
        name: 'Compliance Guard',
        department: 'Back Office',
        role: 'Regulatory Watchdog',
        description: 'Audits data handling practices against SOC-2, GDPR, and ISO-27001 continuously.',
        skills: ['pii_redactor', 'policy_linter', 'audit_trail_signer'],
        status: 'active',
        load: '64% load'
      }
    ]
  },
  Deals: {
    name: 'Deals',
    color: '#FFB703',
    tagline: 'Enterprise Deal Structuring & Negotiation',
    description: 'Evaluates custom enterprise contract redlines, concession trade-offs, and procurement approvals.',
    workers: [
      {
        name: 'Redline Negotiator',
        department: 'Deals',
        role: 'Contract Reviewer',
        description: 'Analyzes enterprise MSA variations against risk guidelines and drafts counter-clauses.',
        skills: ['legal_diff', 'liability_cap_model', 'clause_generator'],
        status: 'active',
        load: '67% load'
      },
      {
        name: 'Discount Gatekeeper',
        department: 'Deals',
        role: 'Margin Protector',
        description: 'Balances deal acceleration with multi-year gross margin and ARR impact calculations.',
        skills: ['pricing_elasticity', 'quota_allocator', 'approval_chain'],
        status: 'syncing',
        load: '40% load'
      }
    ]
  }
};

interface SynapseState {
  scrollProgress: number;
  activeNode: string | null;
  bloomedDepartment: string;
  hoveredNode: string | null;
  setScrollProgress: (progress: number) => void;
  setActiveNode: (node: string | null) => void;
  setBloomedDepartment: (dept: string) => void;
  setHoveredNode: (node: string | null) => void;
}

export const useSynapseStore = create<SynapseState>((set) => ({
  scrollProgress: 0,
  activeNode: null,
  bloomedDepartment: 'Sales',
  hoveredNode: null,
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setActiveNode: (activeNode) => {
    if (activeNode && DEPARTMENTS_DATA[activeNode]) {
      set({ activeNode, bloomedDepartment: activeNode });
    } else {
      set({ activeNode });
    }
  },
  setBloomedDepartment: (bloomedDepartment) => set({ bloomedDepartment }),
  setHoveredNode: (hoveredNode) => set({ hoveredNode })
}));
