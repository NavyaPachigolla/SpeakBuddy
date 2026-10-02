import React from 'react';
import { Mic, ArrowRight, ShieldCheck, Cpu, Sparkles, MessageSquareHeart, CheckCircle2 } from 'lucide-react';

export default function Hero({ onStartPractice, onExploreScenarios }) {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
      {/* Background soft blur accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Hacktoberfest badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Hacktoberfest 2026 “Build for a Friend” Challenge</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
          Your Friendly AI <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">English Speaking Partner</span>
        </h1>

        {/* Problem & Purpose Subtitle */}
        <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Built for a friend who wants to speak English with confidence without the fear of judgment. 
          Practice realistic dialogues, speak aloud with your microphone, and receive warm, actionable guidance.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartPractice}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Mic className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" />
            <span>Start Practice Now</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreScenarios}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold shadow-sm transition-all cursor-pointer"
          >
            Explore 5 Scenarios
          </button>
        </div>

        {/* Trust & Open Source Highlights */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% Open-Weight AI</h4>
              <p className="text-xs text-slate-500 mt-1">
                Powered locally by Llama 3 8B via Ollama. No expensive or closed proprietary APIs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Private & Local</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your voice and spoken thoughts stay on your laptop. Safe and zero data harvesting.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Patient & Encouraging</h4>
              <p className="text-xs text-slate-500 mt-1">
                Never gives textbook lectures. Asks one question at a time and builds your confidence.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
