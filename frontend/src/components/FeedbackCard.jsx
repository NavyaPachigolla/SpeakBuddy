import React from 'react';
import { CheckCircle2, AlertCircle, BookA, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';

export default function FeedbackCard({ feedback }) {
  if (!feedback) return null;

  const hasGrammar = feedback.grammar_feedback && feedback.grammar_feedback.length > 0;
  const hasBetter = !!feedback.better_sentence;
  const hasVocab = feedback.vocabulary_suggestion && feedback.vocabulary_suggestion.length > 0;
  const hasTip = !!feedback.confidence_tip;

  if (!hasGrammar && !hasBetter && !hasVocab && !hasTip) return null;

  return (
    <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-indigo-100/80 shadow-xs space-y-3 text-left">
      
      {/* Top Header Badge */}
      <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Speaking Feedback</span>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          Personalized Coaching
        </span>
      </div>

      {/* Grammar Corrections */}
      {hasGrammar ? (
        <div className="space-y-2">
          {feedback.grammar_feedback.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-white border border-rose-100 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">❌</span>
                <span className="text-slate-600 line-through">{item.original}</span>
              </div>
              <div className="flex items-start gap-2 mt-1">
                <span className="text-emerald-600 font-bold shrink-0">✅</span>
                <span className="font-semibold text-emerald-800">{item.corrected}</span>
              </div>
              {item.explanation && (
                <p className="mt-1.5 text-[11px] text-slate-500 pl-5 leading-normal">
                  <span className="font-medium text-slate-700">Why:</span> {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Great grammatical structure! Your sentence was clear and natural.</span>
        </div>
      )}

      {/* Better Sentence */}
      {hasBetter && (
        <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs">
          <span className="font-bold text-indigo-900 block mb-1">💡 Fluent Way to Say It:</span>
          <p className="text-slate-800 italic">"{feedback.better_sentence}"</p>
        </div>
      )}

      {/* Vocabulary Suggestions */}
      {hasVocab && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
            <BookA className="w-3.5 h-3.5 text-purple-600" />
            <span>Vocabulary Boost</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {feedback.vocabulary_suggestion.map((v, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-white border border-purple-100 text-xs">
                <div className="font-bold text-purple-900">{v.word}</div>
                <div className="text-[11px] text-slate-600 mt-0.5">{v.definition}</div>
                {v.example && (
                  <div className="text-[10px] text-slate-400 italic mt-1">
                    "{v.example}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Tip */}
      {hasTip && (
        <div className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/80">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-950">Confidence Tip: </span>
            <span className="text-amber-900">{feedback.confidence_tip}</span>
          </div>
        </div>
      )}

    </div>
  );
}
