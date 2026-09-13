import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.llm_client import LLMClient
from app.agents.sales_queen import sales_queen
from app.reputation import get_reputation


client = TestClient(app)


def test_llm_client_mock_mode():
    """Verify LLM client strictly returns mode='mock' when API key is missing."""
    mock_client = LLMClient(api_key=None)
    assert not mock_client.is_live_configured()
    
    result = asyncio.run(mock_client.generate("Generate 2 sales leads"))
    assert result["mode"] == "mock"
    assert "text" in result and len(result["text"]) > 10
    assert result["tokens_used"] > 0
    assert result["elapsed_s"] >= 0.9


def test_sales_queen_execution():
    """Verify Sales Queen executes Lead Scraper and Outbound Drafter workers under Nash allocation."""
    result = asyncio.run(sales_queen.run_sales_goal(
        goal="Series A fintech pipeline",
        target_desc="Fintech startups with 20-50 employees",
        num_leads=2,
        deadline_s=15.0,
    ))

    assert result["department"] == "Sales"
    assert result["mode"] in ["live", "mock"]
    assert len(result["leads"]) == 2
    assert len(result["emails"]) == 2
    assert result["tokens_used"] > 0
    assert result["elapsed_seconds"] > 0

    # Verify allocation structure
    alloc = result["allocation"]
    assert "f_i" in alloc and alloc["f_i"] > 0
    assert "claimed_W" in alloc and "actual_W" in alloc
    assert "reputation_after" in alloc


def test_sales_queen_pacing_variation():
    """
    Verify that constrained F_max (force contention) yields lower f_i and
    higher pacing delay than unconstrained F_max.
    """
    # Run under severe compute constraint
    constrained_result = asyncio.run(sales_queen.run_sales_goal(
        goal="Test pacing",
        target_desc="SaaS",
        num_leads=1,
        forced_f_max=15.0,
    ))

    # Run under high compute capacity
    unconstrained_result = asyncio.run(sales_queen.run_sales_goal(
        goal="Test pacing",
        target_desc="SaaS",
        num_leads=1,
        forced_f_max=50.0,
    ))

    f_low = constrained_result["allocation"]["f_i"]
    f_high = unconstrained_result["allocation"]["f_i"]
    delay_low = constrained_result["allocation"]["pacing_delay_s"]
    delay_high = unconstrained_result["allocation"]["pacing_delay_s"]

    # Lower F_max must give lower f_i and greater or equal pacing delay
    assert f_low < f_high
    assert delay_low >= delay_high


def test_sales_api_endpoints():
    """Verify POST /agents/sales/run and GET /agents/sales/status API endpoints."""
    # Test run endpoint
    payload = {
        "goal": "Q4 Enterprise Push",
        "target_desc": "B2B SaaS with 50-200 employees",
        "num_leads": 2,
        "deadline_s": 25.0
    }
    response = client.post("/agents/sales/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["department"] == "Sales"
    assert len(data["leads"]) == 2
    assert len(data["emails"]) == 2
    assert data["mode"] in ["live", "mock"]

    # Test status endpoint
    status_resp = client.get("/agents/sales/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["department"] == "Sales"
    assert status_data["status"] == "ready"
    assert status_data["last_run_mode"] in ["live", "mock"]
    assert status_data["last_run_telemetry"] is not None
