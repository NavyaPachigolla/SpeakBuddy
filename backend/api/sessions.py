import json
import logging
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException
from backend.models import (
    SessionStartRequest,
    SessionStartResponse,
    SessionEndRequest,
    SessionSummary,
    ProgressSummary
)
from backend.services.session_service import (
    start_session,
    save_session_end,
    get_session_by_id,
    get_session_feedback,
    get_progress_data
)
from backend.services.llm_service import generate_session_summary_ai

logger = logging.getLogger("speakbuddy.sessions")
router = APIRouter(tags=["Sessions"])

SCENARIOS_PATH = Path(__file__).resolve().parent.parent.parent / "ai" / "prompts" / "scenarios.json"

def get_starter_prompt(scenario_id: str) -> str:
    try:
        data = json.loads(SCENARIOS_PATH.read_text(encoding="utf-8"))
        for s in data:
            if s["id"] == scenario_id:
                return s.get("starter_prompt", "Hello! Let's practice English together. What would you like to discuss?")
    except Exception:
        pass
    return "Hi there! I'm your SpeakBuddy English partner. Let's practice together! How are you doing today?"

@router.post("/sessions/start", response_model=SessionStartResponse)
def api_start_session(req: SessionStartRequest):
    try:
        starter_prompt = get_starter_prompt(req.scenario_id)
        session_id = start_session(
            scenario_id=req.scenario_id,
            scenario_title=req.scenario_title,
            level=req.level,
            starter_message=starter_prompt
        )
        return SessionStartResponse(
            session_id=session_id,
            scenario_id=req.scenario_id,
            scenario_title=req.scenario_title,
            level=req.level,
            starter_message=starter_prompt
        )
    except Exception as e:
        logger.error(f"Failed to start session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

@router.post("/sessions/{session_id}/end", response_model=SessionSummary)
async def api_end_session(session_id: str, req: SessionEndRequest):
    try:
        session = get_session_by_id(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")
            
        started_at = datetime.fromisoformat(session["started_at"])
        duration_seconds = max(10, int((datetime.utcnow() - started_at).total_seconds()))
        
        # Get all grammar and vocab recorded during this session
        all_grammar, all_vocab = get_session_feedback(session_id)
        
        # Generate comprehensive AI summary
        summary = await generate_session_summary_ai(
            session_id=session_id,
            scenario_title=session["scenario_title"],
            duration_seconds=duration_seconds,
            messages=req.messages,
            all_grammar=all_grammar,
            all_vocab=all_vocab
        )
        
        # Save session in database
        save_session_end(session_id, summary)
        
        return summary
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to end session {session_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate session summary: {str(e)}")

@router.get("/progress", response_model=ProgressSummary)
def api_get_progress():
    try:
        return get_progress_data()
    except Exception as e:
        logger.error(f"Failed to fetch progress metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress: {str(e)}")
