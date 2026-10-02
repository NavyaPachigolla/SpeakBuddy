# SpeakBuddy 🎙️

> **Personal AI English Speaking Partner — Built with Open-Weight AI for Hacktoberfest 2026: “Build for a Friend” Challenge**

---

## 1. Problem

Learning to speak a new language fluently requires regular conversational practice. My friend has been learning English for several months and understands grammar rules on paper, but struggles with **speaking confidence** in spontaneous conversations.

The core hurdles my friend faces:
1. **Lack of a Practice Partner:** They do not always have an English-speaking friend or tutor available to practice dialogues with.
2. **Fear of Judgment:** Speaking with native speakers or peers often triggers anxiety about making embarrassing grammar mistakes or pronunciation slips.
3. **Passive Chatbots Fail to Build Spoken Fluency:** Standard conversational chatbots give long, overwhelming essays rather than keeping dialogues short, asking dynamic follow-ups, and encouraging oral answers.

My friend needed a **patient, friendly, always-available conversation partner** who simulates realistic situations, asks one focused question at a time, listens to voice responses, and delivers gentle, actionable speaking feedback.

---

## 2. Solution: SpeakBuddy

**SpeakBuddy** is a full-stack, voice-first AI English conversational tutor built specifically to solve this problem. 

With SpeakBuddy, the user selects a realistic scenario (such as a Job Interview, Casual Coffee Chat, or Travel Transit), listens to the AI's question, and speaks their response directly into their microphone. 

SpeakBuddy:
- Automatically transcribes speech to text in real time.
- Lets the learner review or edit the recognized sentence before sending.
- Processes the message through an **open-weight Large Language Model (Llama 3 8B via Ollama)** running entirely locally.
- Formulates a natural, concise conversational reply and exactly **one engaging follow-up question**.
- Evaluates grammar gently (showing "Your sentence" vs. "Better sentence" with a clear 1-line reason).
- Highlights 1–2 practical vocabulary alternatives and an uplifting confidence tip.
- Speaks back aloud using natural browser speech synthesis.
- Tracks sessions, vocabulary, and improvement areas in a local SQLite database without exposing user thoughts to third-party cloud data harvesting.

---

## 3. Features

- **🎯 Scenario Selection:** 5 tailored real-life scenarios:
  - *Daily Conversation:* Casual chit-chat about hobbies, routines, and food.
  - *Job Interview:* Professional interview questions, handling challenges, and background pitch.
  - *College Conversation:* Campus discussions, courses, exams, and team projects.
  - *Travel & Exploration:* Airport check-in, ordering food, asking directions, and transit.
  - *Confident Introduction:* Crafting a strong 60-second personal self-introduction.
- **🎙️ Voice Input & Real-Time STT:** Click-to-speak voice recognition with live audio wave pulses, editable transcript area, and microphone error handling.
- **⚡ Dual Speech Recognition Pipeline:** Real-time browser Web Speech API for instantaneous live transcription, complemented by an offline backend `faster-whisper` endpoint for local audio file transcription.
- **🧠 Open-Weight AI Conversation Partner:** Concise, friendly 1–2 sentence replies powered by Meta's Llama 3 8B with strict JSON-constrained structured outputs.
- **📝 Targeted Speaking Feedback Panel:**
  - *Grammar Corrections:* Direct before/after comparison with friendly explanations.
  - *Fluent Alternative:* Natural phrasing used by fluent English speakers.
  - *Vocabulary Boost:* Practical everyday synonyms with concise definitions and sample usage.
  - *Confidence Tip:* Uplifting speaking advice for every turn.
- **🔊 Natural Text-to-Speech (TTS):** Browser Speech Synthesis integration allows learners to listen to SpeakBuddy's pronunciation with adjustable pacing.
- **🏆 Session Summary & Approximate Practice Indicator:** End-of-session breakdown with duration, turn count, strengths, focus areas, vocabulary learned, and an encouraging closing message.
- **📊 Progress Dashboard:** Local SQLite persistence tracking historical sessions, practice minutes, scenario breakdown, common improvement areas, and saved vocabulary bank.
- **🛡️ 100% Private & Offline-Capable:** Voice recordings and personal thoughts never leave the learner's computer.

---

## 4. Architecture

```
                                  USER
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
          [Voice Spoken into Mic]     [Types / Edits Text]
                     │                           │
                     ▼                           ▼
        ┌───────────────────────────────────────────────┐
        │             React + Vite Frontend             │
        │  • Web Speech API (Client-side real-time STT) │
        │  • Web Speech Synthesis (TTS voice playback)  │
        │  • Interactive Chat & Real-Time Feedback Panel│
        │  • Progress Dashboard & Confetti Celebration  │
        └───────────────────────┬───────────────────────┘
                                │ HTTP REST (JSON / Audio)
                                ▼
        ┌───────────────────────────────────────────────┐
        │             FastAPI Backend (Python)          │
        │  • /api/health (Health check & Ollama status) │
        │  • /api/scenarios (Practice scenarios catalog)│
        │  • /api/chat/message (Conversation manager)   │
        │  • /api/transcribe (faster-whisper STT)       │
        │  • /api/sessions/* (Lifecycle & AI summary)   │
        │  • /api/progress (Analytics & vocab bank)     │
        └───────────────┬───────────────────────┬───────┘
                        │                       │
      Local REST (11434)│                       │ Local SQL
                        ▼                       ▼
        ┌────────────────────────┐    ┌────────────────────────┐
        │   Ollama Local Engine  │    │   SQLite Database      │
        │  • Model: Llama 3 8B   │    │  • sessions            │
        │  • Format: Native JSON │    │  • messages            │
        │  • Zero Cloud API Cost │    │  • grammar_mistakes    │
        │  • 100% Private Local  │    │  • vocabulary_bank     │
        └────────────────────────┘    └────────────────────────┘
```

---

## 5. AI Model

### Model Name & Source
- **Model:** Meta Llama 3 8B Instruct (`llama3:latest`)
- **Runtime:** [Ollama](https://ollama.com/) local inference engine
- **Weights Source:** Official Meta Llama 3 Open Weights (Community License)
- **Quantization:** Q4_0 (4-bit quantization, ~4.7 GB storage footprint)

### Why It Was Selected
1. **Truly Open-Weight:** Meta's Llama 3 weights are openly downloadable and runnable on consumer hardware.
2. **Exceptional Conversational & Tutoring Quality:** Strong instruction-following and empathy benchmarks for language tutoring without robotic or cold responses.
3. **Hardware Viability:** At 4.7 GB, it runs smoothly on consumer laptops (requires 6 GB+ RAM), utilizing CPU or Apple Silicon / CUDA GPU when present.
4. **Reliable JSON Mode Support:** Ollama enforces grammatical schema constraints via `format: "json"`, ensuring stable machine parsing of feedback keys (`response`, `follow_up_question`, `grammar_feedback`, `better_sentence`, `vocabulary_suggestion`, `confidence_tip`).
5. **No Token Metering or Costs:** The learner can practice for 2 hours daily without incurring a single cent in API billing.

### Limitations
- On pure CPU laptops without dedicated GPU acceleration, inference takes roughly 10–25 seconds per exchange. We mitigated this by setting `num_predict: 250` and maintaining concise system prompts.
- Complex idioms or colloquial regional slang occasionally receive literal corrections.

---

## 6. Speech Recognition (STT)

SpeakBuddy incorporates a **dual-engine speech-to-text strategy**:
1. **Client-Side Real-Time Recognition (Web Speech API):** Leverages native browser speech recognition (`webkitSpeechRecognition`) for immediate, zero-latency streaming text as the user talks.
2. **Server-Side Open Model (`faster-whisper`):** Integrates OpenAI's open-weight Whisper (`tiny.en`, 75 MB) via CTranslate2 on the FastAPI backend (`/api/transcribe`) for offline audio processing with int8 quantization.

---

## 7. Why Open Innovation Matters

Building SpeakBuddy with open-source and open-weight AI provides concrete, real-world advantages that proprietary closed APIs cannot match:

1. **Complete Privacy for Language Learners:** Practicing a language involves personal thoughts, clumsy mistakes, and vulnerable moments (e.g., job interview anxieties). With local Llama 3 and Whisper, audio and text stay 100% on the learner's device. No voice clips or conversations are uploaded to third-party cloud servers for model training or data logging.
2. **Zero Financial Barrier:** Commercial LLM APIs charge per token. A student or learner who practices for hours every week would quickly rack up bills. Open-source local models make high-quality language tutoring accessible to anyone with a computer.
3. **Offline Resilience & Independence:** Language learners frequently practice in dorms, libraries, or while commuting where Wi-Fi can be spotty. With local models, SpeakBuddy remains completely functional without internet connectivity.
4. **Model Swappability & Control:** The backend is decoupled from any proprietary vendor. If a lighter model (e.g. `gemma:2b`, `qwen2.5:3b`) or larger model (`mistral`, `llama3.1:8b`) is desired, switching models requires only changing one line in `.env` (`OLLAMA_MODEL=...`).

---

## 8. Installation

### Prerequisites
- **Python 3.10+** (Python 3.11 tested)
- **Node.js 18+** (Node v20+ recommended)
- **Ollama** installed on your machine ([ollama.com](https://ollama.com/))

### 1. Clone Repository
```bash
git clone https://github.com/your-username/speakbuddy.git
cd speakbuddy
```

### 2. Setup Backend
```bash
# Optional: create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install Python backend dependencies
pip install -r requirements.txt
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

---

## 9. Running the AI Model

Start Ollama and pull the open-weight Llama 3 model:

```bash
# Pull Llama 3 8B (4.7 GB)
ollama pull llama3:latest

# Verify Ollama is serving locally at http://localhost:11434
ollama list
```

---

## 10. Running the Application

### Option A: Unified Full-Stack Server (Recommended)
Because the frontend has been built into `frontend/dist`, FastAPI directly serves the entire application and API from a single command:

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser!

### Option B: Separate Development Servers
If you want hot-reloading on both frontend and backend:

**Terminal 1 (Backend):**
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend Dev Server):**
```bash
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. Requests to `/api/*` are automatically proxied to port 8000.

---

## 11. Testing

Run the automated pytest test suite to verify health, scenarios catalog, session lifecycle, Ollama response generation, database persistence, and progress endpoints:

```bash
# Ensure PYTHONPATH is set to workspace root
$env:PYTHONPATH="."   # Windows PowerShell
# or export PYTHONPATH="." # Linux / macOS

python -m pytest -v tests/test_backend.py
```

### Test Results

| Test Case | Component | Expected Outcome | Status |
|---|---|---|---|
| `test_health_check` | FastAPI + Ollama + SQLite | Returns healthy status, verifies Ollama connection & DB | **PASS** |
| `test_get_scenarios` | Scenarios Catalog | Loads all 5 practice scenarios with sample topics | **PASS** |
| `test_session_lifecycle_and_chat` | Llama 3 Conversation Loop | Starts session, sends message, receives structured JSON response & follow-up | **PASS** |
| `test_progress_endpoint` | SQLite Analytics | Calculates total practice sessions, minutes, vocab bank, and scores | **PASS** |

---

## 12. Screenshots

| Home Page & Scenarios | Interactive Conversation & Feedback |
|:---:|:---:|
| *(Landing hero, level selector, and 5 scenario cards)* | *(Voice input, live conversation bubbles, grammar correction)* |
| **Session Summary** | **Progress Dashboard** |
| *(Duration, turn count, strengths, vocabulary learned)* | *(Practice time, scenario breakdown, learned vocabulary bank)* |

*(Screenshots can be found in the `screenshots/` directory).*

---

## 13. Limitations

- **Inference Speed on Pure CPU:** While 4-bit Llama 3 8B runs well on normal laptops, CPU inference typically requires 10–25 seconds per turn. We've included clear loading messages ("SpeakBuddy is listening & analyzing...") so the interface never feels frozen.
- **Microphone Permissions:** Browser security requires user approval for microphone access. If blocked, SpeakBuddy provides a clear alert and allows typing.
- **Practice Score Disclaimer:** The practice score is an approximate motivational indicator of session engagement, not an accredited CEFR/IELTS language proficiency score.

---

## 14. Future Improvements

- [ ] **Voice Emotion Tone Analysis:** Adapt speaking partner responses if the learner sounds nervous or hesitant.
- [ ] **Accent & Pronunciation Phoneme Scoring:** Integrate localized acoustic models to highlight specific mispronounced phonemes.
- [ ] **Audio Speed Slider:** Allow learners to slow down AI speech playback to 0.75x or 0.5x for difficult words.
- [ ] **Custom Scenario Creator:** Let learners type their own customized scenario (e.g. "Discussing rent with a landlord in London").

---

## 15. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
