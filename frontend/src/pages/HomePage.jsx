import React, { useState } from 'react';
import Hero from '../components/Hero';
import ScenarioCard from '../components/ScenarioCard';
import { 
  Sparkles, 
  Mic, 
  MessageSquare, 
  BrainCircuit, 
  Award, 
  Lock, 
  Check, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function HomePage({ scenarios, onSelectScenario, onViewScenarios, setView }) {
  const [selectedLevel, setSelectedLevel] = useState('Intermediate');

  const levels = [
    { id: 'Beginner', label: 'Beginner', desc: 'Simple words, gentle pacing' },
    { id: 'Intermediate', label: 'Intermediate', desc: 'Realistic conversational rhythm' },
    { id: 'Advanced', label: 'Advanced', desc: 'Nuanced vocabulary & expressions' },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero section */}
      <Hero
        onStartPractice={() => {
          if (scenarios && scenarios.length > 0) {
            onSelectScenario(scenarios[0], selectedLevel);
          }
        }}
        onExploreScenarios={() => {
          const el = document.getElementById('scenarios-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* English Level Selector Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <span>Select Your Speaking Target Level</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                SpeakBuddy adapts sentence vocabulary and speed to keep you comfortable.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 self-start sm:self-auto">
              Current: {selectedLevel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedLevel === lvl.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{lvl.label}</span>
                  {selectedLevel === lvl.id && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{lvl.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Available Scenarios Section */}
      <section id="scenarios-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Real-Life English</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Choose a Practice Scenario
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select any real-world situation to start an interactive dialogue right away.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios?.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isSelected={false}
              onSelect={(sc) => onSelectScenario(sc, selectedLevel)}
            />
          ))}
        </div>
      </section>

      {/* How it Works Walkthrough */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Simple 4-Step Method
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-2">
              How SpeakBuddy Builds Your English Confidence
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h4 className="font-bold text-base text-white">Pick a Situation</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Choose everyday conversation, a job interview drill, travel transit, or college campus life.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h4 className="font-bold text-base text-white">Speak Naturally</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Click 🎙️ Speak to practice speaking aloud. You can edit the transcribed text before sending.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h4 className="font-bold text-base text-white">Gentle Feedback</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Receive natural corrected phrasing, helpful vocabulary, and encouraging tips without harsh criticism.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h4 className="font-bold text-base text-white">Track Progress</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Review your session summaries, common improvement themes, and vocabulary bank over time.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
