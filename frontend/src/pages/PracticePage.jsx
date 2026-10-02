import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  StopCircle, 
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import VoiceInput from '../components/VoiceInput';
import SummaryModal from '../components/SummaryModal';
import { sendChatMessage, endSession } from '../services/api';

export default function PracticePage({
  scenario,
  level,
  initialSessionData,
  onExit,
  onViewProgress,
  audioEnabled,
}) {
  const [messages, setMessages] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('SpeakBuddy is thinking...');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize with the starter prompt from the API
  useEffect(() => {
    if (initialSessionData?.starter_message) {
      setMessages([
        {
          id: 'starter',
          sender: 'ai',
          content: initialSessionData.starter_message,
          followUpQuestion: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Speak starter message if audio is enabled
      if (audioEnabled && 'speechSynthesis' in window) {
        speakText(initialSessionData.starter_message);
      }
    }

    // Start session timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [initialSessionData]);

  // Modern scroll target effect
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiThinking]);

  // Browser Text-To-Speech helper
  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel(); // stop any active speech
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = level === 'Beginner' ? 0.9 : 1.0;
      utterance.pitch = 1.05;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Handle user message submission
  const handleSendMessage = async (userText) => {
    if (!userText.trim() || isAiThinking) return;

    setErrorNotice(null);
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: userText,
      feedback: null, // will be updated when AI responds
      timestamp: userTimestamp,
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setIsAiThinking(true);
    setThinkingMessage('SpeakBuddy is listening & analyzing...');

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        content: m.content,
      }));

      const responseData = await sendChatMessage({
        sessionId: initialSessionData.session_id,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        level: level,
        userMessage: userText,
        conversationHistory: historyPayload,
      });

      // Update feedback on the user's message
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === userMsgObj.id) {
            return {
              ...m,
              feedback: {
                grammar_feedback: responseData.grammar_feedback || [],
                better_sentence: responseData.better_sentence,
                vocabulary_suggestion: responseData.vocabulary_suggestion || [],
                confidence_tip: responseData.confidence_tip,
              },
            };
          }
          return m;
        })
      );

      // Add AI response message
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMsgObj = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: responseData.response,
        followUpQuestion: responseData.follow_up_question,
        isFallback: responseData.is_fallback,
        timestamp: aiTimestamp,
      };

      setMessages((prev) => [...prev, aiMsgObj]);

      // Speak AI response if voice audio is enabled
      if (audioEnabled) {
        const fullSpeech = `${responseData.response} ${responseData.follow_up_question || ''}`;
        speakText(fullSpeech);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setErrorNotice('Connection hiccup with the AI service. Please try repeating or rephrasing.');
    } finally {
      setIsAiThinking(false);
    }
  };

  // End Practice Session and Fetch AI Summary
  const handleEndPractice = async () => {
    if (isEndingSession) return;
    setIsEndingSession(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    try {
      const summary = await endSession(initialSessionData.session_id, messages);
      setSessionSummary(summary);
    } catch (err) {
      console.error('Failed to end session:', err);
      // Fallback summary if request failed
      setSessionSummary({
        session_id: initialSessionData.session_id,
        duration_seconds: elapsedSeconds,
        exchange_count: messages.filter((m) => m.sender === 'user').length,
        practice_score: 82,
        strengths: ['Actively spoke during the scenario', 'Demonstrated great conversational effort'],
        areas_to_improve: ['Keep practicing daily to build muscle memory'],
        vocabulary_learned: [],
        overall_feedback: 'You put in solid effort practicing spoken English today!',
        encouraging_message: 'Keep going! Every conversation makes you more fluent.',
      });
    } finally {
      setIsEndingSession(false);
    }
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 flex flex-col h-[calc(100vh-5rem)]">
      
      {/* Session Top Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3 shrink-0">
        
        {/* Back and Scenario info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Return to scenarios"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {scenario.title}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {level}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {scenario.description.slice(0, 75)}...
            </p>
          </div>
        </div>

        {/* Live Timer & End Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs sm:text-sm font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{timeFormatted}</span>
          </div>

          <button
            onClick={handleEndPractice}
            disabled={isEndingSession}
            className="px-3 sm:px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isEndingSession ? (
              <div className="loading-spinner" style={{ '--size': '16px', '--thickness': '2px', '--spinner-color': '#be123c' }} />
            ) : (
              <StopCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>End Practice</span>
          </button>
        </div>

      </div>

      {/* Connection Notice / Error alert */}
      {errorNotice && (
        <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-amber-700 hover:text-amber-900 font-bold ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 px-1 sm:px-2 space-y-1">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onSpeak={(txt) => speakText(txt)}
            isSpeaking={false}
          />
        ))}

        {/* AI Loading Bubble */}
        {isAiThinking && (
          <div className="flex items-start gap-2.5 my-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-white border border-slate-200 shadow-xs flex items-center gap-2.5">
              <div className="loading-spinner" style={{ '--size': '18px', '--thickness': '2.5px' }} />
              <span className="text-xs font-medium text-slate-600">{thinkingMessage}</span>
            </div>
          </div>
        )}

        {/* Modern scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice & Text Input Controls */}
      <div className="pt-2 shrink-0">
        <VoiceInput
          onSendMessage={handleSendMessage}
          isAiThinking={isAiThinking}
          disabled={isEndingSession}
        />
      </div>

      {/* Session Summary Modal */}
      {sessionSummary && (
        <SummaryModal
          summary={sessionSummary}
          scenarioTitle={scenario.title}
          onClose={() => setSessionSummary(null)}
          onViewProgress={() => {
            setSessionSummary(null);
            onViewProgress();
          }}
          onRestart={() => {
            setSessionSummary(null);
            onExit();
          }}
        />
      )}

    </div>
  );
}
