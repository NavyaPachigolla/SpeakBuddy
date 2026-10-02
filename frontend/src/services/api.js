const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch health:', err);
    return { status: 'offline', ollama: { connected: false } };
  }
}

export async function fetchScenarios() {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error(`Failed to load scenarios (${res.status})`);
  return await res.json();
}

export async function startSession(scenarioId, scenarioTitle, level = 'Intermediate') {
  const res = await fetch(`${API_BASE}/sessions/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario_id: scenarioId,
      scenario_title: scenarioTitle,
      level,
    }),
  });
  if (!res.ok) throw new Error(`Failed to start session (${res.status})`);
  return await res.json();
}

export async function sendChatMessage({
  sessionId,
  scenarioId,
  scenarioTitle,
  level,
  userMessage,
  conversationHistory,
}) {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      scenario_id: scenarioId,
      scenario_title: scenarioTitle,
      level,
      user_message: userMessage,
      conversation_history: conversationHistory,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Server error (${res.status})`);
  }
  return await res.json();
}

export async function endSession(sessionId, messages) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      messages: messages.map(m => ({ sender: m.sender, content: m.content })),
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to generate summary (${res.status})`);
  }
  return await res.json();
}

export async function fetchProgress() {
  const res = await fetch(`${API_BASE}/progress`);
  if (!res.ok) throw new Error(`Failed to fetch progress (${res.status})`);
  return await res.json();
}

export async function uploadAudioToWhisper(audioBlob, filename = 'speech.wav') {
  const formData = new FormData();
  formData.append('audio', audioBlob, filename);
  const res = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Whisper transcription error (${res.status})`);
  }
  return await res.json();
}
