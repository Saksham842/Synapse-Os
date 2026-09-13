import pytest
from app.models import Queen
from app.allocator import (
    solve_nash_allocation,
    solve_equal_split,
    solve_fcfs,
    compare_allocations
)


def test_nash_known_case_verification():
    """
    Asserts known-correct numbers from Section 5.5 of design spec:
    F_max=25, w1=1, w2=0.01, w3=2
    Sales: V=10, W=40, D=1.0 -> f_i approx 8.94, U_i approx 2.25
    Marketing: V=6, W=30, D=1.5 -> f_i approx 9.01, U_i approx 1.53
    Intelligence: V=4, W=20, D=2.0 -> f_i approx 7.04, U_i approx 1.83
    Total utility: approx 5.61
    """
    queens = [
        Queen(name="Sales", V=10.0, W=40.0, D=1.0),
        Queen(name="Marketing", V=6.0, W=30.0, D=1.5),
        Queen(name="Intelligence", V=4.0, W=20.0, D=2.0)
    ]

    result = solve_nash_allocation(
        F_max=25.0,
        queens=queens,
        w1=1.0,
        w2=0.01,
        w3=2.0
    )

    alloc_map = {a.name: a for a in result.allocations}

    # Assert f_i values are within 0.1 of known-correct case
    assert abs(alloc_map["Sales"].f_i - 8.94) < 0.15, f"Sales f_i was {alloc_map['Sales'].f_i}"
    assert abs(alloc_map["Marketing"].f_i - 9.01) < 0.15, f"Marketing f_i was {alloc_map['Marketing'].f_i}"
    assert abs(alloc_map["Intelligence"].f_i - 7.04) < 0.15, f"Intelligence f_i was {alloc_map['Intelligence'].f_i}"

    # Total CPU used should be approx 25.0
    assert abs(result.total_cpu_used - 25.0) < 0.2

    # Total utility should be approx 5.61
    assert abs(result.total_utility - 5.61) < 0.25


def test_comparison_baselines_hierarchy():
    """
    Verifies that Nash Bargaining achieves higher overall utility than Equal Split
    and vastly outperforms FCFS which starves the tail agent.
    """
    queens = [
        Queen(name="Sales", V=10.0, W=40.0, D=1.0),
        Queen(name="Marketing", V=6.0, W=30.0, D=1.5),
        Queen(name="Intelligence", V=4.0, W=20.0, D=2.0)
    ]

    comparison = compare_allocations(
        F_max=25.0,
        queens=queens,
        w1=1.0,
        w2=0.01,
        w3=2.0
    )

    # Nash should beat equal split and crush FCFS
    assert comparison.nash.total_utility > comparison.equal_split.total_utility
    assert comparison.nash.total_utility > comparison.fcfs.total_utility
    # FCFS should have severely negative utility due to Intelligence starvation
    assert comparison.fcfs.total_utility < 0.0
    assert comparison.utility_gap_fcfs > 25.0
