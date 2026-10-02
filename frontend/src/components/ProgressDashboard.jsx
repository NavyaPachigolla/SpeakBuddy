import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Clock, 
  MessageSquare, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { fetchProgress } from '../services/api';

export default function ProgressDashboard({ onStartPractice }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProgress();
      setProgress(data);
    } catch (err) {
      console.error(err);
      setError('Could not load progress data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="loading-spinner mb-4" style={{ '--size': '36px', '--thickness': '3px' }} />
        <p className="text-sm text-slate-500 font-medium">Loading your progress history...</p>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
        <p className="text-sm text-slate-600 mb-4">{error || 'No progress data found.'}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Speaking Progress Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Personalized
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tracking your practice consistency, vocabulary growth, and grammar reflexes.
          </p>
        </div>

        <button
          onClick={onStartPractice}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Start Practice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sessions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Practice Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {progress.total_sessions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Completed dialogues</div>
        </div>

        {/* Total Spoken Exchanges */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Spoken Responses</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {progress.total_exchanges}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Interactive speaking turns</div>
        </div>

        {/* Practice Time */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Practice Time</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {progress.total_practice_minutes} <span className="text-sm font-normal text-slate-500">mins</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dedicated speaking effort</div>
        </div>

        {/* Practice Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Practice Score</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">
            {progress.average_score || 0}<span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 italic">Approx. practice indicator</div>
        </div>

      </div>

      {/* Scenarios Practiced & Improvement Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scenarios Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Scenarios Practiced</span>
          </h2>

          {Object.keys(progress.scenarios_practiced || {}).length === 0 ? (
            <p className="text-xs text-slate-500 italic">No scenarios practiced yet. Start your first session!</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(progress.scenarios_practiced).map(([title, count]) => {
                const pct = Math.min(100, Math.round((count / (progress.total_sessions || 1)) * 100));
                return (
                  <div key={title}>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>{title}</span>
                      <span className="font-semibold text-slate-900">{count} {count === 1 ? 'session' : 'sessions'}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Common Improvement Areas */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span>Common Focus Areas</span>
          </h2>
          
          <ul className="space-y-2.5">
            {progress.common_improvement_areas?.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-700">
                <span className="w-5 h-5 rounded-full bg-amber-200/70 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{area}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Vocabulary Bank */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Learned Vocabulary Bank</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {progress.recent_vocabulary ? progress.recent_vocabulary.length : 0} Words Saved
          </span>
        </div>

        {progress.recent_vocabulary && progress.recent_vocabulary.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {progress.recent_vocabulary.map((v, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
                <div className="font-bold text-purple-900">{v.word}</div>
                <div className="text-[11px] text-slate-600 mt-1">{v.definition}</div>
                {v.example && (
                  <div className="text-[10px] text-slate-400 italic mt-1.5">
                    "{v.example}"
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Words introduced by SpeakBuddy during practice will automatically be recorded here.
          </p>
        )}
      </div>

      {/* Recent Sessions History */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span>Recent Practice History</span>
        </h2>

        {progress.recent_sessions && progress.recent_sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Scenario</th>
                  <th className="pb-3">Level</th>
                  <th className="pb-3">Exchanges</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Coach Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progress.recent_sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">{s.scenario_title}</td>
                    <td className="py-3 text-slate-600">{s.level}</td>
                    <td className="py-3 text-slate-600">{s.exchange_count} turns</td>
                    <td className="py-3 text-slate-600">
                      {Math.floor((s.duration_seconds || 0) / 60)}m {(s.duration_seconds || 0) % 60}s
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        {s.practice_score}/100
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 max-w-xs truncate" title={s.overall_feedback}>
                      {s.overall_feedback || 'Completed practice.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No past sessions found. Start a practice session today!</p>
        )}
      </div>

    </div>
  );
}
