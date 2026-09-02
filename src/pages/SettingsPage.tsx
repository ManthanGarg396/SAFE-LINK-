import React from 'react';
import {
  Settings,
  Eye,
  Type,
  Activity,
  Volume2,
  Globe,
  Trash2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AccessibilitySettings, LanguageCode } from '../types.ts';
import { LANGUAGES } from '../data/mockData.ts';
import { StorageService } from '../services/storage.ts';

interface SettingsPageProps {
  settings: AccessibilitySettings;
  setSettings: (settings: AccessibilitySettings) => void;
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  setSettings,
  currentLanguage,
  setLanguage,
}) => {
  const handleToggle = (key: keyof AccessibilitySettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleResetStorage = async () => {
    if (window.confirm('Reset all saved data, contacts, and preferences to defaults?')) {
      await StorageService.clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider">
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>App Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Accessibility & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Personalize language, visual contrast, text readability, and speech assistance.
        </p>
      </div>

      {/* Language Preference Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>Primary Language</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                StorageService.saveLanguage(lang.code);
              }}
              className={`p-3 rounded-xl border text-left transition text-xs flex items-center justify-between ${
                currentLanguage === lang.code
                  ? 'border-blue-500 bg-blue-50 text-blue-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <div className="font-bold">{lang.native}</div>
                <div className="text-[10px] text-slate-400 font-mono">{lang.label}</div>
              </div>
              {currentLanguage === lang.code && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility Toggles Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <Eye className="w-4 h-4 text-amber-600" />
          <span>Visual & Interaction Accessibility</span>
        </div>

        <div className="space-y-3">
          {/* High Contrast */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-slate-900">High Contrast Mode</div>
              <p className="text-[11px] text-slate-500">
                Enhances text edges and darkens borders for low-vision environments.
              </p>
            </div>
            <button
              onClick={() => handleToggle('highContrast')}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                settings.highContrast ? 'bg-slate-900' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.highContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Large Text */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-slate-900">Large Typography Scale</div>
              <p className="text-[11px] text-slate-500">
                Increases base text size by 15% across all guidance cards.
              </p>
            </div>
            <button
              onClick={() => handleToggle('largeText')}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                settings.largeText ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.largeText ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-slate-900">Reduced Motion</div>
              <p className="text-[11px] text-slate-500">
                Disables pulsating glows and animated transitions for vestibular comfort.
              </p>
            </div>
            <button
              onClick={() => handleToggle('reducedMotion')}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                settings.reducedMotion ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Auto-Play */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-slate-900">Voice Guidance Readiness</div>
              <p className="text-[11px] text-slate-500">
                Preloads Text-to-Speech audio synthesizers for immediate playback.
              </p>
            </div>
            <button
              onClick={() => handleToggle('voiceAutoPlay')}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                settings.voiceAutoPlay ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.voiceAutoPlay ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* NEW INTERACTIVE PERMISSION CENTER (settings/permissions) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4" id="permission-center">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Interactive Permission & Device Capability Center</span>
        </div>
        <p className="text-xs text-slate-500">
          Manage system authorizations and see device integration status. Permissions are requested only when you trigger relevant features.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Location */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex flex-col justify-between text-xs space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">📍 Geolocation API</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-150">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                Used strictly to find nearest hospitals and coordinates during critical SOS requests.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition(() => alert('Location permission verified successfully!'));
              }}
              className="w-full text-center py-1.5 bg-white border border-slate-250 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50"
            >
              Trigger Location Authorization
            </button>
          </div>

          {/* Microphone */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex flex-col justify-between text-xs space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">🎙️ Microphone Input</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-150">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                Enables hands-free voice command emergency keywords and translation helper listening.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.mediaDevices?.getUserMedia?.({ audio: true }).then(() => alert('Microphone verification successful!'));
              }}
              className="w-full text-center py-1.5 bg-white border border-slate-250 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50"
            >
              Request Microphone Access
            </button>
          </div>

          {/* Camera */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex flex-col justify-between text-xs space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">📷 Device Camera</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-150">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                Power signs translation OCR scans and physical hazard detection feeds.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.mediaDevices?.getUserMedia?.({ video: true }).then(() => alert('Camera verification successful!'));
              }}
              className="w-full text-center py-1.5 bg-white border border-slate-250 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50"
            >
              Test Camera Permission
            </button>
          </div>

          {/* Motion Sensors */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex flex-col justify-between text-xs space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">📱 G-Sensor Motion</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-150">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                Monitors rapid impact g-force thresholds for the Safe-Link Guardian fall warning systems.
              </p>
            </div>
            <button
              onClick={() => alert('Motion and Accelerometer streams are bound inside the Guardian console locally.')}
              className="w-full text-center py-1.5 bg-white border border-slate-250 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50"
            >
              Initialize Accelerometer Tracking
            </button>
          </div>
        </div>
      </div>

      {/* Data Storage & Privacy */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local Device Storage</span>
        </div>
        <p className="text-xs text-slate-600">
          All your contacts and saved incident history stay in local browser memory. No photos are permanently stored on remote databases.
        </p>
        <button
          onClick={handleResetStorage}
          className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset All App Data to Defaults</span>
        </button>
      </div>
    </div>
  );
};
