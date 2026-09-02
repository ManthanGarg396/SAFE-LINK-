import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  Award,
  Cpu,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-red-950 text-white p-8 sm:p-10 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30">
          <Award className="w-3.5 h-3.5 text-amber-300" />
          <span>Hackathon Submission</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          SAFE-LINK AI
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Multimodal Campus Health & Emergency Safety Companion built for:
          <br />
          <strong className="text-white">Google for Developers | H2S PromptWars × WIE-IEEE</strong> {`{ Build with AI }`}
        </p>
      </div>

      {/* Challenge Theme */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold font-display text-slate-900">
          Challenge: Assistive Health & Emergency Safety
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          In stressful campus situations, students and staff often panic or hesitate. Safe-Link AI delivers immediate, structured, step-by-step first-aid protocols, translates regional safety signage, scans visual hazards with Gemini Vision, and empowers one-touch escalation to 112 and designated campus responders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Multimodal Architecture</span>
            </div>
            <p className="text-slate-600">
              Combines text descriptions, camera captures, and speech input with Gemini 3.7 Flash structured outputs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
              <span>Safety & Ethical Guardrails</span>
            </div>
            <p className="text-slate-600">
              Clear medical disclaimer, non-diagnostic phrasing, and hardcoded direct-dial escalation to national 112 emergency services.
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture Overview */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span>Technology Stack & Integrations</span>
        </h2>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-semibold">AI Intelligence</span>
            <span className="font-mono text-slate-600">Gemini 3.7 Flash via @google/genai SDK (Server-Side)</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-semibold">Frontend Framework</span>
            <span className="font-mono text-slate-600">React 19 • TypeScript • Tailwind CSS</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-semibold">Voice & Accessibility</span>
            <span className="font-mono text-slate-600">Web Speech Synthesis & Speech Recognition</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-semibold">PWA Offline Mode</span>
            <span className="font-mono text-slate-600">Web Manifest • Local Caching • Service Worker</span>
          </div>
        </div>
      </div>
    </div>
  );
};
