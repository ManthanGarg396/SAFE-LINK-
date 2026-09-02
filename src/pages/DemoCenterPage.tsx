import React from 'react';
import {
  Sparkles,
  Flame,
  AlertTriangle,
  Zap,
  Activity,
  Heart,
  Globe,
  PlusCircle,
  HelpCircle,
  Play,
  FileText,
  UserCheck
} from 'lucide-react';

interface DemoCenterPageProps {
  onSelectScenario: (id: number) => void;
}

export const DemoCenterPage: React.FC<DemoCenterPageProps> = ({ onSelectScenario }) => {
  const scenarios = [
    {
      id: 11,
      title: '📱 DEMO 1 — Possible Fall-like Motion',
      category: 'Guardian Impact',
      description: 'Simulates a sudden physical accelerometer fall impact. Triggers the "ARE YOU OKAY?" confirmation modal with a 10-second countdown and false-positive verification.',
      icon: <Activity className="w-5 h-5 text-amber-600" />,
      tag: 'GUARDIAN TEST',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 12,
      title: '🌎 DEMO 2 — Earthquake Alert Banner',
      category: 'Disaster Warning',
      description: 'Pushes an active campus-wide Earthquake alert banner. Demonstrates safety instructions, "I\'m Safe" status tracking, and safe-area guidance.',
      icon: <Globe className="w-5 h-5 text-red-600 animate-pulse" />,
      tag: 'SIMULATION MODE',
      tagColor: 'bg-red-50 text-red-700 border-red-200 animate-pulse'
    },
    {
      id: 13,
      title: '🌊 DEMO 3 — Campus Flood Warning',
      category: 'Disaster Warning',
      description: 'Pushes an active flood disaster warning banner to the student portal. Displays evacuation routes, nearby help engine filters, and offline readiness guidelines.',
      icon: <PlusCircle className="w-5 h-5 text-blue-600 animate-pulse" />,
      tag: 'SIMULATION MODE',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
    },
    {
      id: 14,
      title: '🏥 DEMO 4 — Critical Medical Emergency',
      category: 'Clinical Triage',
      description: 'Launches the AI-assisted emergency medical triage panel. Demonstrates question-based symptom risk level grouping (LOW, MODERATE, HIGH, CRITICAL).',
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      tag: 'CLINICAL TRIAGE',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 15,
      title: '⚡ DEMO 5 — Image-to-Hazard Recognition',
      category: 'Visual Detection',
      description: 'Simulates uploading a physical hazard image. Leverages server-side Gemini vision models to analyze dangers and draft responder containment procedures.',
      icon: <Zap className="w-5 h-5 text-purple-600" />,
      tag: 'VISION AI TEST',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 16,
      title: '👨‍⚕️ DEMO 6 — Doctor Summary & Translator',
      category: 'Hinglish Translating',
      description: 'Simulates speaking medical complaints in native Hindi/Hinglish ("Mere pair mein dard hai") and translates to formal clinical doctor summaries instantly.',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      tag: 'TRANSLATOR TEST',
      tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300" id="demo-center-page">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Interactive Simulation Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Scenario Simulation Playground
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select any preset safety event to test Safe-Link AI’s responsive guidance pathways, automatic alerts, multi-language translation, and security escalations.
        </p>
      </div>

      {/* Guide Card */}
      <div className="p-4.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Hands-Free Voice Commands
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            You can also activate voice monitoring globally! Simply click the microphone icon in the header and speak <strong>"Help me"</strong> to trigger the automated SOS Escalation directly.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-lg">
          🎙️
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scene) => (
          <div
            key={scene.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col justify-between animate-in fade-in"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {scene.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {scene.category}
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-950 font-display">
                      {scene.title}
                    </h3>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wide border ${scene.tagColor}`}>
                  {scene.tag}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {scene.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
              <button
                onClick={() => onSelectScenario(scene.id)}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs flex items-center gap-1.5 transition"
              >
                <Play className="w-3 h-3 fill-white text-white" />
                <span>Simulate Scenario</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
