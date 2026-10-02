import logging
from fastapi import APIRouter, HTTPException
from backend.models import ChatRequest, ChatResponse
from backend.services.llm_service import generate_chat_response
from backend.services.session_service import record_message, record_feedback

logger = logging.getLogger("speakbuddy.chat")
router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/message", response_model=ChatResponse)
async def chat_message(req: ChatRequest):
    user_text = req.user_message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="User message cannot be empty.")
        
    try:
        # 1. Record user's incoming message in SQLite
        record_message(req.session_id, "user", user_text)
        
        # 2. Call local Ollama LLM to generate response & feedback
        chat_resp = await generate_chat_response(
            scenario_title=req.scenario_title,
            level=req.level,
            history=req.conversation_history,
            user_message=user_text
        )
        
        # 3. Record AI message and feedback in SQLite
        full_ai_text = f"{chat_resp.response} {chat_resp.follow_up_question}"
        record_message(req.session_id, "ai", full_ai_text)
        
        if chat_resp.grammar_feedback or chat_resp.vocabulary_suggestion:
            record_feedback(
                req.session_id,
                chat_resp.grammar_feedback,
                chat_resp.vocabulary_suggestion
            )
            
        return chat_resp
    except Exception as e:
        logger.error(f"Error handling chat message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")
