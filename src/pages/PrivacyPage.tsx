import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, HardDrive } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Trust & Safety</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Privacy & Medical Safety Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          How Safe-Link AI handles health queries, camera data, and local storage safely.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4 text-xs text-slate-700 leading-relaxed">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-medium">
          <strong className="block text-amber-900 font-bold mb-1">Medical Disclaimer:</strong>
          Safe-Link AI provides assistive first-aid guidance only and is NOT a licensed healthcare provider or medical diagnostic device. Always seek immediate professional emergency services (112) for critical symptoms.
        </div>

        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pt-2">
          1. Camera & Image Data
        </h2>
        <p>
          Images captured for hazard scanning or warning sign translation are transmitted securely over SSL to our server-side Gemini API proxy strictly for inference. Images are not retained or saved to permanent public cloud databases.
        </p>

        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pt-2">
          2. Local Storage
        </h2>
        <p>
          Your emergency contacts, incident logs, and accessibility preferences are stored locally in your browser’s localStorage. You can clear all data at any time via the Settings page.
        </p>

        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pt-2">
          3. Geolocation Access
        </h2>
        <p>
          GPS coordinates are queried locally via the browser Geolocation API solely to assist responders when you choose to share your location.
        </p>
      </div>
    </div>
  );
};
