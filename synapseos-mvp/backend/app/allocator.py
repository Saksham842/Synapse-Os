import logging
from typing import List, Dict, Any, Optional
import numpy as np
import cvxpy as cp
from app.models import Queen, QueenAllocationResult, MethodComparison, AllocationResponse

logger = logging.getLogger("synapseos.allocator")


def calculate_utility(
    V: float,
    W: float,
    D: float,
    f_i: float,
    w1: float,
    w2: float,
    w3: float
) -> tuple[float, float, float]:
    """
    Returns (T_i, breach, U_i) for a single Queen given allocated f_i.
    """
    f_safe = max(f_i, 1e-4)
    T_i = W / f_safe
    breach = max(0.0, T_i - D)
    U_i = (w1 * V) - (w2 * (f_safe ** 2)) - (w3 * breach)
    return round(T_i, 3), round(breach, 3), round(U_i, 3)


def solve_nash_allocation(
    F_max: float,
    queens: List[Queen],
    w1: float = 1.0,
    w2: float = 0.01,
    w3: float = 2.0,
    f_min: float = 1.0,
    d_i: float = 0.0
) -> MethodComparison:
    """
    Solves the Nash Bargaining Solution (NBS) for CPU-cycle resource allocation.
    Objective: maximize sum(log(U_i - d_i)) subject to sum(f_i) <= F_max, f_i >= f_min.
    """
    n = len(queens)
    if n == 0:
        return MethodComparison(method="Nash Bargaining", allocations=[], total_utility=0.0, total_cpu_used=0.0)

    # Effective V takes into account reputation if present
    effective_V = [q.V * (q.reputation if q.reputation is not None else 1.0) for q in queens]

    f = cp.Variable(n, pos=True)
    utilities = []

    for i, q in enumerate(queens):
        eff_v = effective_V[i]
        T_i = q.W * cp.inv_pos(f[i])
        breach = cp.maximum(0, T_i - q.D)
        U_i = (w1 * eff_v) - (w2 * cp.square(f[i])) - (w3 * breach)
        utilities.append(U_i)

    objective = cp.Maximize(cp.sum([cp.log(u - d_i) for u in utilities]))
    constraints = [cp.sum(f) <= F_max, f >= f_min]
    prob = cp.Problem(objective, constraints)

    # Try solvers in order: Clarabel -> SCS -> ECOS
    solved = False
    for solver in [cp.CLARABEL, cp.SCS]:
        try:
            prob.solve(solver=solver)
            if prob.status in ["optimal", "optimal_inaccurate"]:
                solved = True
                break
        except Exception as e:
            logger.warning(f"Solver {solver} failed: {e}")

    allocations: List[QueenAllocationResult] = []
    total_utility = 0.0
    total_cpu = 0.0

    if solved and f.value is not None:
        f_vals = [float(val) for val in f.value]
    else:
        # Fallback to equal split if solver fails for numerical edge cases
        logger.error(f"Convex solver failed or infeasible (status: {prob.status}). Using fallback.")
        f_vals = [F_max / n] * n

    for i, q in enumerate(queens):
        f_i = round(f_vals[i], 3)
        eff_v = round(effective_V[i], 3)
        T_i, breach, U_i = calculate_utility(eff_v, q.W, q.D, f_i, w1, w2, w3)
        total_utility += U_i
        total_cpu += f_i

        allocations.append(QueenAllocationResult(
            name=q.name,
            raw_V=q.V,
            reputation=q.reputation if q.reputation is not None else 1.0,
            effective_V=eff_v,
            W=q.W,
            D=q.D,
            f_i=f_i,
            T_i=T_i,
            breach=breach,
            U_i=U_i
        ))

    return MethodComparison(
        method="Nash Bargaining",
        allocations=allocations,
        total_utility=round(total_utility, 3),
        total_cpu_used=round(total_cpu, 3)
    )


def solve_equal_split(
    F_max: float,
    queens: List[Queen],
    w1: float = 1.0,
    w2: float = 0.01,
    w3: float = 2.0
) -> MethodComparison:
    """
    Baseline 1: Equal split (F_max / n each).
    """
    n = len(queens)
    if n == 0:
        return MethodComparison(method="Equal Split", allocations=[], total_utility=0.0, total_cpu_used=0.0)

    f_each = round(F_max / n, 3)
    allocations: List[QueenAllocationResult] = []
    total_utility = 0.0
    total_cpu = 0.0

    for q in queens:
        eff_v = round(q.V * (q.reputation if q.reputation is not None else 1.0), 3)
        T_i, breach, U_i = calculate_utility(eff_v, q.W, q.D, f_each, w1, w2, w3)
        total_utility += U_i
        total_cpu += f_each

        allocations.append(QueenAllocationResult(
            name=q.name,
            raw_V=q.V,
            reputation=q.reputation if q.reputation is not None else 1.0,
            effective_V=eff_v,
            W=q.W,
            D=q.D,
            f_i=f_each,
            T_i=T_i,
            breach=breach,
            U_i=U_i
        ))

    return MethodComparison(
        method="Equal Split",
        allocations=allocations,
        total_utility=round(total_utility, 3),
        total_cpu_used=round(total_cpu, 3)
    )


def solve_fcfs(
    F_max: float,
    queens: List[Queen],
    w1: float = 1.0,
    w2: float = 0.01,
    w3: float = 2.0,
    f_min: float = 1.0,
    order: Optional[List[str]] = None
) -> MethodComparison:
    """
    Baseline 2: First-Come-First-Served (FCFS).
    Each queen in priority/arrival order claims its unconstrained optimum:
    f_des = min(W / D, (w3 * W / (2 * w2))^(1/3))
    subject to remaining capacity, with a floor of f_min.
    """
    n = len(queens)
    if n == 0:
        return MethodComparison(method="First-Come-First-Served", allocations=[], total_utility=0.0, total_cpu_used=0.0)

    queen_map = {q.name: q for q in queens}
    queen_list = [queen_map[name] for name in order] if order else queens

    remaining = F_max
    allocations: List[QueenAllocationResult] = []
    total_utility = 0.0
    total_cpu = 0.0

    for i, q in enumerate(queen_list):
        eff_v = round(q.V * (q.reputation if q.reputation is not None else 1.0), 3)

        # Unconstrained optimum derived from dU/df = -2*w2*f + w3*W/f^2 = 0 => f = (w3*W / (2*w2))^(1/3)
        if w2 > 0:
            unconstrained_opt = (w3 * q.W / (2.0 * w2)) ** (1.0 / 3.0)
        else:
            unconstrained_opt = q.W / max(q.D, 0.001)

        # In SLA regime without breach: f = W / D
        f_no_breach = q.W / max(q.D, 0.001)
        f_des = min(f_no_breach, unconstrained_opt) if unconstrained_opt > f_no_breach else unconstrained_opt

        # Reserve at least f_min for remaining agents if possible
        unallocated_agents_after = len(queen_list) - (i + 1)
        min_reserve = unallocated_agents_after * f_min
        available_for_q = max(f_min, remaining - min_reserve)

        f_i = min(f_des, available_for_q)
        f_i = max(f_i, f_min)
        f_i = min(f_i, remaining) if remaining >= f_min else f_min
        f_i = round(f_i, 3)

        remaining = max(0.0, remaining - f_i)
        T_i, breach, U_i = calculate_utility(eff_v, q.W, q.D, f_i, w1, w2, w3)
        total_utility += U_i
        total_cpu += f_i

        allocations.append(QueenAllocationResult(
            name=q.name,
            raw_V=q.V,
            reputation=q.reputation if q.reputation is not None else 1.0,
            effective_V=eff_v,
            W=q.W,
            D=q.D,
            f_i=f_i,
            T_i=T_i,
            breach=breach,
            U_i=U_i
        ))

    return MethodComparison(
        method="First-Come-First-Served",
        allocations=allocations,
        total_utility=round(total_utility, 3),
        total_cpu_used=round(total_cpu, 3)
    )


def compare_allocations(
    F_max: float,
    queens: List[Queen],
    w1: float = 1.0,
    w2: float = 0.01,
    w3: float = 2.0,
    f_min: float = 1.0
) -> AllocationResponse:
    """
    Executes Nash Bargaining, Equal Split, and FCFS and returns full comparison.
    """
    nash = solve_nash_allocation(F_max, queens, w1, w2, w3, f_min)
    equal = solve_equal_split(F_max, queens, w1, w2, w3)
    fcfs = solve_fcfs(F_max, queens, w1, w2, w3, f_min)

    gap_fcfs = round(nash.total_utility - fcfs.total_utility, 3)
    gap_equal = round(nash.total_utility - equal.total_utility, 3)

    return AllocationResponse(
        F_max=F_max,
        w1=w1,
        w2=w2,
        w3=w3,
        nash=nash,
        equal_split=equal,
        fcfs=fcfs,
        utility_gap_fcfs=gap_fcfs,
        utility_gap_equal=gap_equal
    )
