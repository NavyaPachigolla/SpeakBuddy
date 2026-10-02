import json
import logging
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import httpx

from backend.config import settings
from backend.models import ChatMessage, ChatResponse, GrammarItem, VocabItem, SessionSummary

logger = logging.getLogger("speakbuddy.llm")

SYSTEM_PROMPT_PATH = Path(__file__).resolve().parent.parent.parent / "ai" / "prompts" / "system_prompt.txt"

def load_system_prompt() -> str:
    if SYSTEM_PROMPT_PATH.exists():
        return SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")
    return (
        "You are SpeakBuddy, a warm, patient, and encouraging personal English speaking partner. "
        "Keep responses simple, ask one follow-up question at a time, and provide beginner-friendly grammar feedback."
    )

def build_conversation_context(history: List[ChatMessage], latest_message: str) -> str:
    lines = []
    # Include up to last 10 messages for relevant context without bloat
    recent_history = history[-10:] if len(history) > 10 else history
    for msg in recent_history:
        prefix = "Learner" if msg.sender == "user" else "SpeakBuddy"
        lines.append(f"{prefix}: {msg.content}")
    lines.append(f"Learner: {latest_message}")
    return "\n".join(lines)

def build_prompt(scenario_title: str, level: str, history: List[ChatMessage], user_message: str) -> str:
    system_text = load_system_prompt()
    conversation_text = build_conversation_context(history, user_message)
    
    prompt = f"""{system_text}

---
CURRENT PRACTICE CONTEXT:
Scenario: {scenario_title}
Learner Level: {level}

CONVERSATION TRANSCRIPT:
{conversation_text}

SpeakBuddy: Evaluate the learner's latest message and reply strictly with valid JSON.
"""
    return prompt

def extract_json(raw_text: str) -> Optional[Dict[str, Any]]:
    """Cleanly parse JSON even if surrounded by markdown code fences or conversational preambles."""
    raw_text = raw_text.strip()
    
    # Try direct parse
    try:
        return json.loads(raw_text)
    except Exception:
        pass
    
    # Try finding markdown json fence
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
    if fence_match:
        try:
            return json.loads(fence_match.group(1).strip())
        except Exception:
            pass
            
    # Try finding first { and last }
    first_brace = raw_text.find("{")
    last_brace = raw_text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(raw_text[first_brace : last_brace + 1])
        except Exception:
            pass
            
    return None

def fallback_chat_response(scenario_title: str, user_message: str) -> ChatResponse:
    """Intelligent rule-based fallback if the local Ollama LLM is unavailable or loading."""
    lower_msg = user_message.lower()
    
    # Simple heuristic conversational feedback
    grammar_items: List[GrammarItem] = []
    better_sentence = None
    vocab_items: List[VocabItem] = []
    
    # Common English learner checks
    if "i am agree" in lower_msg:
        grammar_items.append(
            GrammarItem(
                original="I am agree",
                corrected="I agree",
                explanation="In English, 'agree' is already a verb, so you do not need 'am'."
            )
        )
        better_sentence = user_message.replace("i am agree", "I agree").replace("I am agree", "I agree")
    elif "yesterday i go" in lower_msg:
        grammar_items.append(
            GrammarItem(
                original="yesterday I go",
                corrected="yesterday I went",
                explanation="Use the past tense 'went' because you are talking about yesterday."
            )
        )
        better_sentence = user_message.replace("yesterday i go", "yesterday I went").replace("yesterday I go", "yesterday I went")
        
    vocab_items.append(
        VocabItem(
            word="Confident",
            definition="Feeling self-assured and positive about your abilities.",
            example="You speak with confident pronunciation!"
        )
    )
    
    return ChatResponse(
        response=f"Thank you for sharing that! That is a great point in our {scenario_title} practice.",
        follow_up_question="Could you tell me a little more about what you think or how you felt about that?",
        grammar_feedback=grammar_items,
        better_sentence=better_sentence or f"You could also say: \"{user_message}\" with enthusiasm!",
        vocabulary_suggestion=vocab_items,
        confidence_tip="Take a gentle pause before speaking to organize your thoughts smoothly.",
        model_used="rule-based-fallback",
        is_fallback=True
    )

async def generate_chat_response(
    scenario_title: str,
    level: str,
    history: List[ChatMessage],
    user_message: str
) -> ChatResponse:
    """Send conversation to local Ollama open model and return structured feedback."""
    prompt = build_prompt(scenario_title, level, history, user_message)
    
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.65,
            "top_p": 0.9,
            "num_predict": 250,
            "stop": ["Learner:"]
        }
    }
    
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
    
    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                raw_response = data.get("response", "")
                parsed = extract_json(raw_response)
                
                if parsed:
                    # Sanitize grammar feedback items
                    raw_grammar = parsed.get("grammar_feedback", [])
                    grammar_items = []
                    if isinstance(raw_grammar, list):
                        for item in raw_grammar:
                            if isinstance(item, dict):
                                orig = item.get("original") or item.get("mistake") or ""
                                corr = item.get("corrected") or item.get("correction") or ""
                                expl = item.get("explanation") or ""
                                if orig or corr:
                                    grammar_items.append(GrammarItem(original=orig, corrected=corr, explanation=expl))
                                    
                    # Sanitize vocabulary items
                    raw_vocab = parsed.get("vocabulary_suggestion", [])
                    vocab_items = []
                    if isinstance(raw_vocab, list):
                        for item in raw_vocab:
                            if isinstance(item, dict):
                                w = item.get("word", "")
                                d = item.get("definition", "")
                                ex = item.get("example", "")
                                if w:
                                    vocab_items.append(VocabItem(word=w, definition=d, example=ex))
                                    
                    return ChatResponse(
                        response=parsed.get("response", "That sounds wonderful!"),
                        follow_up_question=parsed.get("follow_up_question", "What else would you like to share?"),
                        grammar_feedback=grammar_items,
                        better_sentence=parsed.get("better_sentence"),
                        vocabulary_suggestion=vocab_items,
                        confidence_tip=parsed.get("confidence_tip", "Keep speaking with courage and calm!"),
                        model_used=settings.OLLAMA_MODEL,
                        is_fallback=False
                    )
            logger.warning(f"Ollama returned non-200 status: {res.status_code}. Using fallback tutor.")
    except Exception as e:
        logger.warning(f"Failed to communicate with Ollama at {url}: {e}. Activating fallback tutor.")
        
    return fallback_chat_response(scenario_title, user_message)

async def generate_session_summary_ai(
    session_id: str,
    scenario_title: str,
    duration_seconds: int,
    messages: List[ChatMessage],
    all_grammar: List[GrammarItem],
    all_vocab: List[VocabItem]
) -> SessionSummary:
    """Generate comprehensive summary when user concludes a speaking session."""
    user_msgs = [m.content for m in messages if m.sender == "user"]
    exchange_count = len(user_msgs)
    
    # Calculate baseline practice score (approximate practice effort indicator, not certification)
    # 70 baseline + 5 points per exchange (max 95) - 3 per grammar mistake (min 60)
    calc_score = 72 + min(20, exchange_count * 4) - min(15, len(all_grammar) * 2)
    practice_score = max(60, min(95, calc_score)) if exchange_count > 0 else 70
    
    user_text_corpus = " | ".join(user_msgs)
    
    prompt = f"""You are SpeakBuddy analyzing a practice session.
Scenario: {scenario_title}
Total User Exchanges: {exchange_count}
User Spoke: {user_text_corpus[:1500]}
Grammar points noted: {[g.original + ' -> ' + g.corrected for g in all_grammar]}

Provide a friendly session wrap-up in valid JSON:
{{
  "strengths": ["List 2-3 specific things the learner did well (e.g. answered questions directly, tried new words)"],
  "areas_to_improve": ["List 2 constructive points to work on (e.g. past tense consistency, speaking in fuller sentences)"],
  "overall_feedback": "A concise 2-sentence encouraging summary of the practice session.",
  "encouraging_message": "An inspiring closing message cheering them on for their next practice session."
}}
"""
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {"temperature": 0.6, "num_predict": 300}
    }
    
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                parsed = extract_json(res.json().get("response", ""))
                if parsed:
                    return SessionSummary(
                        session_id=session_id,
                        duration_seconds=duration_seconds,
                        exchange_count=exchange_count,
                        practice_score=practice_score,
                        strengths=parsed.get("strengths", ["Maintained conversation rhythm", "Expressed ideas clearly"]),
                        areas_to_improve=parsed.get("areas_to_improve", ["Expand answers with more details", "Watch out for verb tenses"]),
                        vocabulary_learned=all_vocab,
                        overall_feedback=parsed.get("overall_feedback", "Great job practicing today! You showed good willingness to express yourself."),
                        encouraging_message=parsed.get("encouraging_message", "Every sentence you practice brings you closer to fluent, natural speaking!")
                    )
    except Exception as e:
        logger.warning(f"Session summary AI generation failed ({e}), using default smart summary.")
        
    return SessionSummary(
        session_id=session_id,
        duration_seconds=duration_seconds,
        exchange_count=exchange_count,
        practice_score=practice_score,
        strengths=[
            "Answered follow-up questions proactively",
            "Kept the conversation flowing smoothly",
            "Practiced realistic situational vocabulary"
        ],
        areas_to_improve=[
            "Continue practicing past and present tense consistency",
            "Try adding one extra descriptive sentence per answer"
        ],
        vocabulary_learned=all_vocab,
        overall_feedback="You completed a productive English speaking session! Consistent practice is the most effective way to build natural conversational reflexes.",
        encouraging_message="Fantastic effort today! Be proud of speaking up and taking time to practice."
    )
