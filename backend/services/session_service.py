import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from collections import Counter

from backend.database import get_db_connection
from backend.models import (
    GrammarItem,
    VocabItem,
    ChatMessage,
    SessionSummary,
    ProgressSummary
)

def start_session(scenario_id: str, scenario_title: str, level: str, starter_message: str) -> str:
    session_id = str(uuid.uuid4())
    started_at = datetime.utcnow().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO sessions (id, scenario_id, scenario_title, level, started_at)
        VALUES (?, ?, ?, ?, ?)
    """, (session_id, scenario_id, scenario_title, level, started_at))
    
    # Store initial AI starter message
    cursor.execute("""
        INSERT INTO messages (session_id, sender, content, timestamp)
        VALUES (?, ?, ?, ?)
    """, (session_id, "ai", starter_message, started_at))
    
    conn.commit()
    conn.close()
    return session_id

def record_message(session_id: str, sender: str, content: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO messages (session_id, sender, content, timestamp)
        VALUES (?, ?, ?, ?)
    """, (session_id, sender, content, now))
    conn.commit()
    conn.close()

def record_feedback(session_id: str, grammar_items: List[GrammarItem], vocab_items: List[VocabItem]):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    for g in grammar_items:
        cursor.execute("""
            INSERT INTO grammar_mistakes (session_id, original, corrected, explanation, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, g.original, g.corrected, g.explanation, now))
        
    for v in vocab_items:
        cursor.execute("""
            INSERT INTO vocabulary_bank (session_id, word, definition, example, learned_at)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, v.word, v.definition, v.example or "", now))
        
    conn.commit()
    conn.close()

def get_session_feedback(session_id: str) -> tuple[List[GrammarItem], List[VocabItem]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT original, corrected, explanation FROM grammar_mistakes WHERE session_id = ?", (session_id,))
    grammar_rows = cursor.fetchall()
    grammar_items = [GrammarItem(original=r["original"], corrected=r["corrected"], explanation=r["explanation"]) for r in grammar_rows]
    
    cursor.execute("SELECT word, definition, example FROM vocabulary_bank WHERE session_id = ?", (session_id,))
    vocab_rows = cursor.fetchall()
    vocab_items = [VocabItem(word=r["word"], definition=r["definition"], example=r["example"]) for r in vocab_rows]
    
    conn.close()
    return grammar_items, vocab_items

def save_session_end(session_id: str, summary: SessionSummary):
    conn = get_db_connection()
    cursor = conn.cursor()
    ended_at = datetime.utcnow().isoformat()
    
    summary_data = summary.model_dump() if hasattr(summary, "model_dump") else summary.dict()
    
    cursor.execute("""
        UPDATE sessions
        SET ended_at = ?,
            duration_seconds = ?,
            exchange_count = ?,
            practice_score = ?,
            overall_feedback = ?,
            summary_json = ?
        WHERE id = ?
    """, (
        ended_at,
        summary.duration_seconds,
        summary.exchange_count,
        summary.practice_score,
        summary.overall_feedback,
        json.dumps(summary_data),
        session_id
    ))
    conn.commit()
    conn.close()

def get_session_by_id(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_progress_data() -> ProgressSummary:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Sessions stats
    cursor.execute("SELECT * FROM sessions WHERE ended_at IS NOT NULL ORDER BY started_at DESC")
    sessions_rows = cursor.fetchall()
    
    total_sessions = len(sessions_rows)
    total_exchanges = sum(r["exchange_count"] or 0 for r in sessions_rows)
    total_duration_sec = sum(r["duration_seconds"] or 0 for r in sessions_rows)
    total_practice_minutes = round(total_duration_sec / 60.0, 1)
    
    scores = [r["practice_score"] for r in sessions_rows if r["practice_score"] and r["practice_score"] > 0]
    average_score = round(sum(scores) / len(scores)) if scores else 0
    
    # Scenarios breakdown
    scenario_counts: Dict[str, int] = {}
    for r in sessions_rows:
        title = r["scenario_title"]
        scenario_counts[title] = scenario_counts.get(title, 0) + 1
        
    recent_sessions = []
    for r in sessions_rows[:5]:
        recent_sessions.append({
            "id": r["id"],
            "scenario_title": r["scenario_title"],
            "level": r["level"],
            "started_at": r["started_at"],
            "duration_seconds": r["duration_seconds"],
            "exchange_count": r["exchange_count"],
            "practice_score": r["practice_score"],
            "overall_feedback": r["overall_feedback"]
        })
        
    # Common grammar points / improvement areas
    cursor.execute("SELECT explanation FROM grammar_mistakes ORDER BY created_at DESC LIMIT 50")
    g_rows = cursor.fetchall()
    expls = [r["explanation"] for r in g_rows if r["explanation"]]
    
    common_areas = []
    if expls:
        # Pick top unique explanations or high-frequency themes
        seen = set()
        for exp in expls:
            if exp not in seen and len(common_areas) < 4:
                seen.add(exp)
                common_areas.append(exp)
    if not common_areas:
        common_areas = [
            "Past vs Present tense consistency",
            "Natural conversational prepositions ('at' vs 'in')",
            "Forming complete sentences during fast speech"
        ]
        
    # Recent vocabulary
    cursor.execute("SELECT DISTINCT word, definition, example FROM vocabulary_bank ORDER BY learned_at DESC LIMIT 12")
    vocab_rows = cursor.fetchall()
    recent_vocab = [VocabItem(word=r["word"], definition=r["definition"], example=r["example"]) for r in vocab_rows]
    
    conn.close()
    
    return ProgressSummary(
        total_sessions=total_sessions,
        total_exchanges=total_exchanges,
        total_practice_minutes=total_practice_minutes,
        average_score=average_score,
        scenarios_practiced=scenario_counts,
        recent_sessions=recent_sessions,
        common_improvement_areas=common_areas,
        recent_vocabulary=recent_vocab
    )
