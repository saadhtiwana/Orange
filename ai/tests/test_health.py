"""Health endpoint."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_reports_ok(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "orange-ai"


def test_health_never_leaks_the_api_key(client: TestClient) -> None:
    body = client.get("/health").json()

    # It reports *whether* a key is configured, never any part of the key.
    assert isinstance(body["llm"]["configured"], bool)
    assert "key" not in str(body["llm"]).lower().replace("configured", "")
