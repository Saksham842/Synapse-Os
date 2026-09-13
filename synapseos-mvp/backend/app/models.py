from typing import List, Optional
from pydantic import BaseModel, Field


class Queen(BaseModel):
    name: str = Field(..., description="Name of the Queen/Department agent")
    V: float = Field(..., description="Business priority / task value")
    W: float = Field(..., description="Workload demand in cycles (or k-cycles)")
    D: float = Field(..., description="Deadline for task completion in seconds")
    reputation: Optional[float] = Field(default=1.0, description="Reputation multiplier (0.0 to 1.0)")


class AllocationRequest(BaseModel):
    F_max: float = Field(default=25.0, description="Total shared CPU capacity (cycles/sec)")
    queens: List[Queen] = Field(..., description="List of competing Queen agents")
    w1: float = Field(default=1.0, description="Task value weight")
    w2: float = Field(default=0.01, description="Dynamic CPU power/cost weight")
    w3: float = Field(default=2.0, description="SLA deadline penalty weight")


class QueenAllocationResult(BaseModel):
    name: str
    raw_V: float
    reputation: float
    effective_V: float
    W: float
    D: float
    f_i: float
    T_i: float
    breach: float
    U_i: float


class MethodComparison(BaseModel):
    method: str
    allocations: List[QueenAllocationResult]
    total_utility: float
    total_cpu_used: float


class AllocationResponse(BaseModel):
    F_max: float
    w1: float
    w2: float
    w3: float
    nash: MethodComparison
    equal_split: MethodComparison
    fcfs: MethodComparison
    utility_gap_fcfs: float  # Nash utility minus FCFS utility
    utility_gap_equal: float  # Nash utility minus Equal Split utility


class OutcomeReportRequest(BaseModel):
    queen_name: str
    claimed_value: float
    actual_value: float
    alpha: Optional[float] = 0.9


class ReputationItem(BaseModel):
    queen_name: str
    score: float
    last_claimed: Optional[float] = None
    last_actual: Optional[float] = None
    update_count: int = 0


class SalesRunRequest(BaseModel):
    goal: str = Field(default="Enterprise outbound lead generation", description="High-level campaign goal")
    target_desc: str = Field(default="B2B SaaS companies with 50-200 employees", description="Target buyer description")
    num_leads: int = Field(default=3, ge=1, le=10, description="Number of leads to generate and draft outreach for")
    deadline_s: float = Field(default=20.0, gt=0, description="Caller-supplied deadline in seconds")
    forced_f_max: Optional[float] = Field(default=None, description="Optional override for F_max to test contention effects")
