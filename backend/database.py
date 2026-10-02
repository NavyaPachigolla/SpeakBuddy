import sqlite3
import json
from datetime import datetime
from pathlib import Path
from backend.config import settings

def get_db_connection():
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        scenario_title TEXT NOT NULL,
        level TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration_seconds INTEGER DEFAULT 0,
        exchange_count INTEGER DEFAULT 0,
        practice_score INTEGER DEFAULT 0,
        overall_feedback TEXT,
        summary_json TEXT
    );
    """)
    
    # 2. Messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    );
    """)
    
    # 3. Grammar feedback history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS grammar_mistakes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        original TEXT NOT NULL,
        corrected TEXT NOT NULL,
        explanation TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    );
    """)
    
    # 4. Vocabulary bank table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vocabulary_bank (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        word TEXT NOT NULL,
        definition TEXT NOT NULL,
        example TEXT,
        learned_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    );
    """)
    
    conn.commit()
    conn.close()
