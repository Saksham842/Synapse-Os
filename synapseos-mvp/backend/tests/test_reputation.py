import pytest
from app.reputation import update_reputation, get_reputation, reset_all_reputations


def test_reputation_decay_on_dishonest_claim():
    reset_all_reputations()

    # Initial reputation defaults to 1.0
    initial = get_reputation("Sales")
    assert initial == 1.0

    # Sales inflates claimed value: claims 20.0, actual realized is 4.0
    # accuracy = 4.0 / 20.0 = 0.2
    # new_score = 0.9 * 1.0 + 0.1 * 0.2 = 0.92
    score_1 = update_reputation("Sales", claimed_value=20.0, actual_value=4.0)
    assert abs(score_1 - 0.92) < 0.01

    # Repeat dishonest reporting
    # accuracy = 5.0 / 25.0 = 0.2
    # new_score = 0.9 * 0.92 + 0.1 * 0.2 = 0.828 + 0.02 = 0.848
    score_2 = update_reputation("Sales", claimed_value=25.0, actual_value=5.0)
    assert abs(score_2 - 0.848) < 0.01

    # Another severe inflation
    score_3 = update_reputation("Sales", claimed_value=50.0, actual_value=2.0)
    assert score_3 < score_2
    assert score_3 < 0.80

    # Accurate reporting begins rehabilitation
    # accuracy = 10.0 / 10.0 = 1.0
    # new_score = 0.9 * score_3 + 0.1 * 1.0 > score_3
    score_4 = update_reputation("Sales", claimed_value=10.0, actual_value=10.0)
    assert score_4 > score_3
