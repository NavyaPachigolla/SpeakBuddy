import React from 'react';
import { Coffee, Briefcase, GraduationCap, Plane, UserCheck, ArrowRight, BookOpen } from 'lucide-react';

const ICON_MAP = {
  Coffee: Coffee,
  Briefcase: Briefcase,
  GraduationCap: GraduationCap,
  Plane: Plane,
  UserCheck: UserCheck,
};

export default function ScenarioCard({ scenario, isSelected, onSelect }) {
  const IconComponent = ICON_MAP[scenario.icon] || BookOpen;

  return (
    <div
      onClick={() => onSelect(scenario)}
      className={`relative rounded-2xl p-6 transition-all cursor-pointer border text-left flex flex-col justify-between ${
        isSelected
          ? 'bg-indigo-50/60 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div>
        {/* Header with Icon and Level badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {scenario.level}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {scenario.title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          {scenario.description}
        </p>

        {/* Sample Topics */}
        {scenario.sample_topics && scenario.sample_topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {scenario.sample_topics.map((topic, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Select button footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
          {isSelected ? 'Selected' : 'Practice Scenario'}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600'
        }`}>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
