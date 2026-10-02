import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  Target, 
  Clock, 
  MessageSquare, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Info,
  RotateCcw
} from 'lucide-react';

export default function SummaryModal({ summary, scenarioTitle, onClose, onViewProgress, onRestart }) {
  useEffect(() => {
    // Fire celebratory confetti for session completion
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b']
      });
    } catch (e) {
      // safe fallback if canvas is not ready
    }
  }, []);

  if (!summary) return null;

  const minutes = Math.floor((summary.duration_seconds || 0) / 60);
  const seconds = (summary.duration_seconds || 0) % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 text-left">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Great Practice Session!
              </h2>
              <p className="text-xs text-slate-500">
                Scenario: <span className="font-semibold text-indigo-700">{scenarioTitle}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Practice Score
            </div>
            <div className="text-2xl font-black text-indigo-600">
              {summary.practice_score || 85}<span className="text-sm font-medium text-slate-400">/100</span>
            </div>
          </div>
        </div>

        {/* Practice indicator disclaimer */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {summary.score_disclaimer || "This score is an approximate practice indicator to help gauge session effort, not an official English certification."}
          </span>
        </div>

        {/* Key Stats Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
            <div className="text-xs font-medium text-indigo-700 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Duration
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{timeFormatted}</div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
            <div className="text-xs font-medium text-purple-700 flex items-center justify-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Responses
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{summary.exchange_count || 0}</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center col-span-2 sm:col-span-1">
            <div className="text-xs font-medium text-emerald-700 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Words Explored
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {summary.vocabulary_learned ? summary.vocabulary_learned.length : 0}
            </div>
          </div>
        </div>

        {/* Strengths & Areas to Improve */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* What you did well */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What You Did Well</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {summary.strengths?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Work on */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider mb-2">
              <Target className="w-4 h-4 text-amber-600" />
              <span>Areas to Focus On</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {summary.areas_to_improve?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Vocabulary learned bank */}
        {summary.vocabulary_learned && summary.vocabulary_learned.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Vocabulary Bank from this Session</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.vocabulary_learned.map((v, idx) => (
                <div key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs shadow-xs">
                  <span className="font-bold text-indigo-700">{v.word}</span>: <span className="text-slate-600">{v.definition}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Encouraging closing message */}
        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
          <span className="font-bold">Coach SpeakBuddy: </span>
          <span>{summary.encouraging_message}</span>
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Practice Another</span>
          </button>

          <button
            onClick={onViewProgress}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Progress Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
