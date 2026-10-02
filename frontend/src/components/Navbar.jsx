import React from 'react';
import { MessageSquare, Sparkles, Activity, Award, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentView, setView, health, audioEnabled, setAudioEnabled }) {
  const isAiConnected = health?.ollama?.connected;
  const modelName = health?.ollama?.target_model || 'llama3:latest';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setView('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                SpeakBuddy
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                HF26
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Your AI English Speaking Partner</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setView('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'home'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setView('scenarios')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'scenarios'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Scenarios
          </button>
          <button
            onClick={() => setView('progress')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'progress'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Progress
          </button>
        </nav>

        {/* Status Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Speech Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'AI Voice Enabled (Click to Mute)' : 'AI Voice Muted (Click to Unmute)'}
            className={`p-2 rounded-lg border text-sm transition-colors flex items-center gap-1.5 ${
              audioEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline text-xs font-medium">
              {audioEnabled ? 'Voice On' : 'Voice Off'}
            </span>
          </button>

          {/* Model Status Indicator */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isAiConnected 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
            title={isAiConnected ? `Connected to local ${modelName} via Ollama` : 'Ollama not detected; using intelligent fallback tutor'}
          >
            <span className={`w-2 h-2 rounded-full ${isAiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="hidden sm:inline font-mono">
              {isAiConnected ? 'Open LLM (Llama 3)' : 'Local Fallback'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
