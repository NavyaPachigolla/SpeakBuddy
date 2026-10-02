from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class GrammarItem(BaseModel):
    original: str
    corrected: str
    explanation: str

class VocabItem(BaseModel):
    word: str
    definition: str
    example: Optional[str] = ""

class ChatMessage(BaseModel):
    sender: str  # 'user' | 'ai'
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    session_id: str
    scenario_id: str
    scenario_title: str
    user_message: str
    level: str = "Intermediate"
    conversation_history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    follow_up_question: str
    grammar_feedback: List[GrammarItem] = []
    better_sentence: Optional[str] = None
    vocabulary_suggestion: List[VocabItem] = []
    confidence_tip: str
    model_used: str = "llama3:latest"
    is_fallback: bool = False

class SessionStartRequest(BaseModel):
    scenario_id: str
    scenario_title: str
    level: str = "Intermediate"

class SessionStartResponse(BaseModel):
    session_id: str
    scenario_id: str
    scenario_title: str
    level: str
    starter_message: str

class SessionEndRequest(BaseModel):
    session_id: str
    messages: List[ChatMessage]

class SessionSummary(BaseModel):
    session_id: str
    duration_seconds: int
    exchange_count: int
    practice_score: int
    score_disclaimer: str = "This score is an approximate practice indicator to help gauge session effort, not an official English certification."
    strengths: List[str]
    areas_to_improve: List[str]
    vocabulary_learned: List[VocabItem]
    overall_feedback: str
    encouraging_message: str

class ProgressSummary(BaseModel):
    total_sessions: int
    total_exchanges: int
    total_practice_minutes: float
    average_score: int
    scenarios_practiced: Dict[str, int]
    recent_sessions: List[Dict[str, Any]]
    common_improvement_areas: List[str]
    recent_vocabulary: List[VocabItem]
