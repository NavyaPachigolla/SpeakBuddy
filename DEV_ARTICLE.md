---
title: "SpeakBuddy: A Voice-First AI English Speaking Partner Powered by Open-Weight LLMs"
published: true
tags: devchallenge, weekendchallenge, hf26challenge
---

# SpeakBuddy: A Voice-First AI English Speaking Partner Powered by Open-Weight LLMs

*This project is submitted for the Hacktoberfest 2026 DEV Challenge: **“Build for a Friend”**.*

---

## 💡 Who I Built It For & The Real-World Problem

I built **SpeakBuddy** for a friend who is learning English.

My friend understands written grammar and can read textbooks comfortably, but freezes up whenever it comes time to speak in real-life English conversations. They want to improve their spoken confidence for college seminars and job interviews, but face three major obstacles:

1. **No Constant Practice Partner:** They don't always have a friend or language tutor available to practice dialogues with whenever they have free time.
2. **Fear of Judgment:** Practicing with native speakers or peers makes them feel self-conscious and anxious about making grammar mistakes or mispronouncing common words.
3. **Generic Chatbots Fail Spoken Learners:** Regular AI chatbots respond with long, dense paragraphs of text. They don't feel like a human speaking partner who keeps responses concise, asks one focused question at a time, and encourages oral speaking.

My friend needed a **friendly, patient speaking partner** who can hold realistic conversations, ask natural follow-up questions, and deliver constructive, gentle feedback without making them feel embarrassed.

---

## 🚀 What I Built

**SpeakBuddy** is a personal AI English speaking practice partner built from the ground up with **open-source and open-weight AI at its core**.

Instead of typing back and forth with an essay-generating bot, the learner:
1. **Selects a Realistic Situation:** Chooses between *Daily Conversation*, *Job Interview*, *College Campus Life*, *Travel Transit*, or *60-Second Confident Introduction*.
2. **Speaks Aloud with Voice Input:** Clicks **🎙️ Speak** to talk directly into the microphone. SpeakBuddy transcribes speech in real time and lets the learner edit the words if needed before submitting.
3. **Converses with an Open-Weight AI Partner:** Meta's **Llama 3 8B** (running locally via Ollama) processes the conversation turn, generating a warm, concise conversational response and exactly **one relevant follow-up question**.
4. **Receives Gentle Speaking Feedback:** Every turn displays:
   - ❌ **Grammar Correction:** Direct, friendly before/after with a simple 1-line rule explanation.
   - 💡 **Fluent Alternative:** How a native speaker would naturally express the idea.
   - 📖 **Vocabulary Boost:** 1–2 practical everyday words with definitions and sample sentences.
   - 🌟 **Confidence Tip:** An encouraging tip to boost speaking momentum.
5. **Listens to Natural Pronunciation:** Integrated text-to-speech audio speaks SpeakBuddy's reply back to the learner with adjustable pacing.
6. **Views Session Summaries & Progress:** At the end of a session, SpeakBuddy generates an encouraging wrap-up with duration, turn count, strengths, focus areas, and saves newly learned vocabulary into a local SQLite bank.

---

## 🛠️ How I Built It

### Architecture Overview

```
User Speaks (Microphone)
       ↓
Browser Web Speech API / faster-whisper STT
       ↓
FastAPI Backend (Python 3.11)
       ↓
Local Ollama Engine (Llama 3 8B Instruct)
       ↓
Strict JSON Structured Output (Response + Follow-Up + Feedback)
       ↓
FastAPI -> SQLite Local DB (History, Analytics, Vocab Bank)
       ↓
React + Tailwind CSS Frontend + Browser Speech Synthesis
```

### Key Technical Stack:
- **Core AI Intelligence:** Meta's **Llama 3 8B Instruct** (`llama3:latest`), running 100% locally via **Ollama**. We configured Ollama with `format: "json"` and `num_predict: 250` for swift, deterministic parsing.
- **Speech-to-Text (STT):** Dual pipeline featuring the **Web Speech API** for instant streaming transcription in the browser, complemented by **faster-whisper** (`tiny.en`, CTranslate2 int8) on the FastAPI backend for offline audio processing.
- **Backend:** **FastAPI** + **Uvicorn** + **Pydantic v2** + **HTTPX**.
- **Frontend:** **React 19** + **Vite** + **Tailwind CSS v4** + **Lucide Icons** + **canvas-confetti**.
- **Database:** **SQLite3** for zero-configuration, completely private local storage.
- **Testing:** Automated **pytest** test suite verifying health checks, scenarios, LLM generation, and database analytics.

### Structured AI Prompt Design
Rather than just asking the LLM to "talk to the user," we developed a strict system prompt that instructs SpeakBuddy to:
- Keep the conversational reply under 2 sentences.
- Always ask exactly ONE relevant follow-up question.
- Avoid linguistic jargon.
- Format output as a validated JSON object with `response`, `follow_up_question`, `grammar_feedback`, `better_sentence`, `vocabulary_suggestion`, and `confidence_tip`.

---

## 🌍 Why Does Open Innovation Matter?

Open-source and open-weight AI is not just a nice-to-have for SpeakBuddy — it is the **fundamental foundation** of why this app works for my friend:

1. **Absolute Privacy for Vulnerable Learning:** Language practice is deeply personal. Learners talk about their lives, fears, and job aspirations while making clumsy mistakes. By running **Llama 3 8B and faster-whisper locally**, zero audio or transcripts leave my friend's laptop. There is no cloud data harvesting, no tracking, and no third-party model training on their voice.
2. **Zero Cost & Financial Accessibility:** Proprietary cloud APIs charge per token. A learner practicing for 30 minutes a day would accumulate continuous subscription or API costs. Open-weight models running on consumer hardware make unlimited conversational tutoring available to every student for free.
3. **Offline Resilience:** A friend living in a dorm or studying on a train doesn't have reliable high-speed internet. SpeakBuddy runs entirely on localhost without requiring internet connectivity.
4. **Model Sovereignty & Independence:** The architecture is vendor-agnostic. If my friend needs an ultra-lightweight model on an older laptop, we can switch from `llama3:latest` to `qwen2.5:3b` or `gemma:2b` by updating a single environment variable in `.env`.

---

## 🧪 Testing & Validation

We validated SpeakBuddy through automated and end-to-end tests:
- **Pytest Suite:** 4 automated integration tests covering the `/api/health`, `/api/scenarios`, `/api/chat/message`, and `/api/progress` endpoints.
- **Inference Verification:** Confirmed that Ollama generates structured JSON with appropriate grammar corrections and vocabulary suggestions.
- **Speech-to-Text Verification:** Verified `faster-whisper` transcription on CPU with audio inputs.
- **Microphone Error Handling:** Tested browser permission denials, empty inputs, and audio device disconnections with friendly UI fallbacks.

---

## 🎥 Demo & Code

- **GitHub Repository:** [https://github.com/your-username/speakbuddy](https://github.com/your-username/speakbuddy) *(replace with your repository URL)*
- **Demo Walkthrough Video:** *(Link to your 2-minute demo recording)*

---

## 🏆 Prize Categories

- **Hacktoberfest 2026: Build for a Friend** (Primary challenge category)
- **Open-Source / Open-Weight AI Innovation** (Genuinely powered by Meta's open-weight Llama 3 8B and faster-whisper)

---

*Built with ❤️ for a friend who is discovering the joy of speaking English with confidence.*
