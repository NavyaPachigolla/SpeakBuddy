import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import ScenarioCard from './components/ScenarioCard';
import { fetchHealth, fetchScenarios, startSession } from './services/api';
import { Sparkles, AlertCircle, RefreshCw, Cpu, BookOpen } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'scenarios' | 'practice' | 'progress'
  const [health, setHealth] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active practice session state
  const [activeScenario, setActiveScenario] = useState(null);
  const [activeLevel, setActiveLevel] = useState('Intermediate');
  const [activeSessionData, setActiveSessionData] = useState(null);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Global audio TTS voice setting
  const [audioEnabled, setAudioEnabled] = useState(true);

  const initData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hData, sData] = await Promise.all([
        fetchHealth(),
        fetchScenarios().catch(() => []),
      ]);
      setHealth(hData);
      setScenarios(sData);
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Could not connect to SpeakBuddy backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleStartPracticeScenario = async (scenario, level = 'Intermediate') => {
    setIsStartingSession(true);
    setActiveScenario(scenario);
    setActiveLevel(level);

    try {
      const sessionData = await startSession(scenario.id, scenario.title, level);
      setActiveSessionData(sessionData);
      setCurrentView('practice');
    } catch (err) {
      console.error('Failed to start practice session:', err);
      // Fallback local session if API had a brief glitch
      setActiveSessionData({
        session_id: `local-${Date.now()}`,
        scenario_id: scenario.id,
        scenario_title: scenario.title,
        level,
        starter_message: scenario.starter_prompt || "Hi! Let's practice English together. How are you doing today?",
      });
      setCurrentView('practice');
    } finally {
      setIsStartingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="loading-spinner mb-4" style={{ '--size': '42px', '--thickness': '3.5px' }} />
        <h2 className="text-lg font-bold text-slate-800">Starting SpeakBuddy...</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to local AI inference engine</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        health={health}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
      />

      {/* Starting session loader overlay */}
      {isStartingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 flex items-center gap-3">
            <div className="loading-spinner" style={{ '--size': '24px', '--thickness': '3px' }} />
            <span className="text-sm font-semibold text-slate-800">
              Preparing your conversational partner...
            </span>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            scenarios={scenarios}
            onSelectScenario={(sc, lvl) => handleStartPracticeScenario(sc, lvl)}
            onViewScenarios={() => setCurrentView('scenarios')}
            setView={setCurrentView}
          />
        )}

        {currentView === 'scenarios' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Practice Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                All English Practice Scenarios
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Select any scenario below to start an interactive dialogue with SpeakBuddy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((sc) => (
                <ScenarioCard
                  key={sc.id}
                  scenario={sc}
                  isSelected={false}
                  onSelect={(selected) => handleStartPracticeScenario(selected, 'Intermediate')}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'practice' && activeScenario && activeSessionData && (
          <PracticePage
            scenario={activeScenario}
            level={activeLevel}
            initialSessionData={activeSessionData}
            onExit={() => setCurrentView('home')}
            onViewProgress={() => setCurrentView('progress')}
            audioEnabled={audioEnabled}
          />
        )}

        {currentView === 'progress' && (
          <ProgressPage
            onStartPractice={() => {
              if (scenarios.length > 0) {
                handleStartPracticeScenario(scenarios[0], 'Intermediate');
              } else {
                setCurrentView('home');
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">SpeakBuddy</span>
            <span>—</span>
            <span>Built with ❤️ for a friend learning English (Hacktoberfest 2026)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Powered by Open-Source AI (Llama 3 & Whisper)</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
