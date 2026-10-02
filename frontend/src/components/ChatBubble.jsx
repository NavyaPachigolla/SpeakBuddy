import React from 'react';
import { Volume2, VolumeX, Bot, User, Sparkles } from 'lucide-react';
import FeedbackCard from './FeedbackCard';

export default function ChatBubble({ message, onSpeak, isSpeaking, isLatestAi }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} my-3 w-full`}>
      
      <div className={`flex items-start gap-2.5 max-w-[92%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
          isUser 
            ? 'bg-slate-800 text-white' 
            : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Bubble Body */}
        <div className={`rounded-2xl px-4 py-3 text-sm shadow-xs ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-xs'
            : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
        }`}>
          
          {/* Header row for AI */}
          {!isUser && (
            <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-slate-100 text-[11px] text-slate-500">
              <span className="font-bold text-indigo-700 flex items-center gap-1">
                SpeakBuddy AI
                {message.isFallback && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-1 rounded border border-amber-200">
                    Local Tutor
                  </span>
                )}
              </span>

              {/* TTS Listen Button */}
              {onSpeak && (
                <button
                  onClick={() => onSpeak(message.content)}
                  title="Listen to pronunciation"
                  className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 cursor-pointer font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              )}
            </div>
          )}

          {/* Main message text */}
          <div className="leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {/* AI Follow-up Question Callout */}
          {message.followUpQuestion && (
            <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100/90 text-indigo-950 font-medium text-xs flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wide">
                  Your Turn to Answer:
                </span>
                <span>{message.followUpQuestion}</span>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-[10px] mt-1.5 ${isUser ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'}`}>
            {message.timestamp || 'Just now'}
          </div>

        </div>

      </div>

      {/* User's Speaking Feedback Card */}
      {isUser && message.feedback && (
        <div className="w-full max-w-[92%] sm:max-w-[80%]">
          <FeedbackCard feedback={message.feedback} />
        </div>
      )}

    </div>
  );
}
