from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_allocate_endpoint():
    payload = {
        "F_max": 25.0,
        "w1": 1.0,
        "w2": 0.01,
        "w3": 2.0,
        "queens": [
            {"name": "Sales", "V": 10.0, "W": 40.0, "D": 1.0},
            {"name": "Marketing", "V": 6.0, "W": 30.0, "D": 1.5},
            {"name": "Intelligence", "V": 4.0, "W": 20.0, "D": 2.0}
        ]
    }
    response = client.post("/allocate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "nash" in data
    assert "equal_split" in data
    assert "fcfs" in data
    assert data["nash"]["total_utility"] > data["equal_split"]["total_utility"]


def test_outcome_report_and_reputation():
    report = {
        "queen_name": "TestQueen",
        "claimed_value": 30.0,
        "actual_value": 3.0
    }
    response = client.post("/report_outcome", json=report)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["new_reputation"] < 1.0

    rep_list = client.get("/reputation").json()
    names = [r["queen_name"] for r in rep_list["reputations"]]
    assert "TestQueen" in names


def test_simulation_latest_endpoint():
    response = client.get("/simulation/latest")
    assert response.status_code == 200
    data = response.json()
    assert "round" in data
    assert "comparison" in data
