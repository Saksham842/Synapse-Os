export interface Queen {
  name: string;
  V: number;
  W: number;
  D: number;
  reputation?: number;
}

export interface QueenAllocationResult {
  name: string;
  raw_V: number;
  reputation: number;
  effective_V: number;
  W: number;
  D: number;
  f_i: number;
  T_i: number;
  breach: number;
  U_i: number;
}

export interface MethodComparison {
  method: string;
  allocations: QueenAllocationResult[];
  total_utility: number;
  total_cpu_used: number;
}

export interface AllocationResponse {
  F_max: number;
  w1: number;
  w2: number;
  w3: number;
  nash: MethodComparison;
  equal_split: MethodComparison;
  fcfs: MethodComparison;
  utility_gap_fcfs: number;
  utility_gap_equal: number;
}

export interface SimulationRound {
  round: number;
  timestamp: number;
  F_max: number;
  weights: {
    w1: number;
    w2: number;
    w3: number;
  };
  comparison: AllocationResponse;
  profiles: Record<
    string,
    {
      description: string;
      V_range: [number, number];
      W_range: [number, number];
      D_range: [number, number];
      color: string;
    }
  >;
}
