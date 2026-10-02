import pytest
import os
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db
from backend.config import settings

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    yield

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ollama" in data
    assert "database" in data

def test_get_scenarios():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    scenario_ids = [s["id"] for s in data]
    assert "daily_conversation" in scenario_ids
    assert "job_interview" in scenario_ids
    assert "college_conversation" in scenario_ids
    assert "travel" in scenario_ids
    assert "introduction" in scenario_ids

def test_session_lifecycle_and_chat():
    # 1. Start a session
    start_resp = client.post("/api/sessions/start", json={
        "scenario_id": "job_interview",
        "scenario_title": "Job Interview",
        "level": "Intermediate"
    })
    assert start_resp.status_code == 200
    session_data = start_resp.json()
    assert "session_id" in session_data
    session_id = session_data["session_id"]
    assert len(session_data["starter_message"]) > 0

    # 2. Send a user chat message
    chat_resp = client.post("/api/chat/message", json={
        "session_id": session_id,
        "scenario_id": "job_interview",
        "scenario_title": "Job Interview",
        "user_message": "Hi, my name is Navya. I am studying computer science and I like programming.",
        "level": "Intermediate",
        "conversation_history": [
            {"sender": "ai", "content": session_data["starter_message"]}
        ]
    })
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "response" in chat_data
    assert "follow_up_question" in chat_data
    assert "confidence_tip" in chat_data
    assert "vocabulary_suggestion" in chat_data

    # 3. End session and get summary
    end_resp = client.post(f"/api/sessions/{session_id}/end", json={
        "session_id": session_id,
        "messages": [
            {"sender": "ai", "content": session_data["starter_message"]},
            {"sender": "user", "content": "Hi, my name is Navya. I am studying computer science and I like programming."},
            {"sender": "ai", "content": chat_data["response"]}
        ]
    })
    assert end_resp.status_code == 200
    summary = end_resp.json()
    assert summary["session_id"] == session_id
    assert summary["exchange_count"] >= 1
    assert "practice_score" in summary
    assert "strengths" in summary
    assert "areas_to_improve" in summary
    assert "encouraging_message" in summary

def test_progress_endpoint():
    response = client.get("/api/progress")
    assert response.status_code == 200
    data = response.json()
    assert "total_sessions" in data
    assert "total_exchanges" in data
    assert "scenarios_practiced" in data
    assert "common_improvement_areas" in data
    assert "recent_vocabulary" in data
