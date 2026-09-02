import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Volume2,
  VolumeX,
  Share2,
} from 'lucide-react';
import { SafetyGuideArticle, LanguageCode } from '../types.ts';
import { INITIAL_SAFETY_GUIDES } from '../data/mockData.ts';
import { tts } from '../services/tts.ts';

interface FirstAidLibraryPageProps {
  currentLanguage: LanguageCode;
}

export const FirstAidLibraryPage: React.FC<FirstAidLibraryPageProps> = ({ currentLanguage }) => {
  const [guides] = useState<SafetyGuideArticle[]>(INITIAL_SAFETY_GUIDES);
  const [selectedGuideId, setSelectedGuideId] = useState<string>(guides[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const filteredGuides = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGuide = guides.find((g) => g.id === selectedGuideId) || guides[0];

  const handleSpeak = (guide: SafetyGuideArticle) => {
    if (isSpeaking) {
      tts.stop();
      setIsSpeaking(false);
    } else {
      const speech = `${guide.title}. Overview: ${guide.summary}. Steps to take: ${guide.whatToDo.join(
        '. '
      )}. Avoid: ${guide.whatToAvoid.join('. ')}.`;
      setIsSpeaking(true);
      tts.speak(speech, currentLanguage, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-bold text-xs uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Offline First-Aid Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Standard Campus First-Aid Procedures
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Medical protocols cached for 100% offline availability during connectivity loss or remote field trips.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search first aid topics (burns, choking, sprain, fainting, chemical, cuts)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Grid: Topic selector (Left) + Detail View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Topics List */}
        <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredGuides.map((guide) => {
            const isSelected = guide.id === selectedGuideId;
            return (
              <button
                key={guide.id}
                onClick={() => {
                  setSelectedGuideId(guide.id);
                  if (isSpeaking) {
                    tts.stop();
                    setIsSpeaking(false);
                  }
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-2xl shrink-0 mt-0.5">{guide.icon}</div>
                <div className="space-y-0.5 flex-1">
                  <div className="text-xs font-extrabold">{guide.title}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                    {guide.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Active Guide Detail View */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-6 animate-in fade-in">
          {/* Top Bar of Active Guide */}
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeGuide.icon}</span>
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                  {activeGuide.category}
                </span>
                <h2 className="text-xl font-bold font-display text-slate-900 mt-1">
                  {activeGuide.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeak(activeGuide)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-red-600">Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {activeGuide.summary}
          </p>

          {/* DO THIS (Immediate Protocol) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>DO THIS — Recommended First-Aid Steps</span>
            </h3>

            <div className="space-y-2">
              {activeGuide.whatToDo.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AVOID (Critical Prohibitions) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>AVOID — Dangerous Practices & Myths</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1.5">
              {activeGuide.whatToAvoid.map((avoid, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-rose-950 font-medium">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>{avoid}</span>
                </div>
              ))}
            </div>
          </div>

          {/* When to Seek Help & Red Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-xs text-amber-950">
              <div className="font-bold flex items-center gap-1.5 uppercase text-[10px] text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>When to Visit Clinic</span>
              </div>
              <ul className="space-y-1 list-disc list-inside mt-1 font-medium">
                {activeGuide.whenToSeekHelp.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 space-y-1 text-xs">
              <div className="font-bold flex items-center gap-1.5 uppercase text-[10px] text-red-400">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Call 112 if you see:</span>
              </div>
              <ul className="space-y-1 list-disc list-inside mt-1 font-mono text-slate-300 text-[11px]">
                {activeGuide.emergencyWarningSigns.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
