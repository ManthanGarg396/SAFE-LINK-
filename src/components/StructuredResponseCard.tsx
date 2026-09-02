import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  BellRing,
  MapPin,
  BookmarkPlus,
  Check,
  Globe,
  Share2,
  HelpCircle,
} from 'lucide-react';
import { EmergencyAnalysis, EmergencySeverity, LanguageCode } from '../types.ts';
import { tts } from '../services/tts.ts';
import { StorageService } from '../services/storage.ts';

interface StructuredResponseCardProps {
  analysis: EmergencyAnalysis;
  currentLanguage: LanguageCode;
  onOpenEmergencyModal: () => void;
  onOpenAlertModal: () => void;
}

export const StructuredResponseCard: React.FC<StructuredResponseCardProps> = ({
  analysis,
  currentLanguage,
  onOpenEmergencyModal,
  onOpenAlertModal,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTranslated, setShowTranslated] = useState(true);
  const [savedToHistory, setSavedToHistory] = useState(false);

  useEffect(() => {
    const unsub = tts.subscribe((speaking, paused) => {
      setIsSpeaking(speaking);
      setIsPaused(paused);
    });
    return () => {
      unsub();
      tts.stop();
    };
  }, []);

  const severityConfigs: Record<
    EmergencySeverity,
    {
      label: string;
      colorBg: string;
      colorText: string;
      colorBorder: string;
      badgeBg: string;
      icon: string;
      description: string;
    }
  > = {
    LOW: {
      label: 'LOW RISK',
      colorBg: 'bg-emerald-50',
      colorText: 'text-emerald-900',
      colorBorder: 'border-emerald-300',
      badgeBg: 'bg-emerald-600 text-white',
      icon: '🟢',
      description: 'Basic first-aid assistance and local monitoring.',
    },
    MODERATE: {
      label: 'MODERATE RISK',
      colorBg: 'bg-amber-50',
      colorText: 'text-amber-900',
      colorBorder: 'border-amber-300',
      badgeBg: 'bg-amber-600 text-white',
      icon: '🟡',
      description: 'First aid + consider visiting the campus health center.',
    },
    HIGH: {
      label: 'HIGH RISK',
      colorBg: 'bg-orange-50',
      colorText: 'text-orange-950',
      colorBorder: 'border-orange-400',
      badgeBg: 'bg-orange-600 text-white',
      icon: '🟠',
      description: 'Seek professional campus medical/safety help promptly.',
    },
    CRITICAL: {
      label: 'CRITICAL EMERGENCY',
      colorBg: 'bg-red-50',
      colorText: 'text-red-950',
      colorBorder: 'border-red-500',
      badgeBg: 'bg-red-600 text-white animate-pulse',
      icon: '🔴',
      description: 'Contact 112 emergency services and campus security immediately.',
    },
  };

  const currentSev = severityConfigs[analysis.severity] || severityConfigs.MODERATE;

  // Determine displayed language texts
  const displayTitle =
    showTranslated && analysis.translated_title ? analysis.translated_title : analysis.title;
  const displayActions =
    showTranslated && analysis.translated_immediate_actions?.length
      ? analysis.translated_immediate_actions
      : analysis.immediate_actions;
  const displayAvoid =
    showTranslated && analysis.translated_avoid?.length
      ? analysis.translated_avoid
      : analysis.avoid;
  const displaySummary =
    showTranslated && analysis.translated_summary ? analysis.translated_summary : analysis.summary;

  const handleReadAloud = () => {
    if (isSpeaking) {
      if (isPaused) {
        tts.resume();
      } else {
        tts.pause();
      }
    } else {
      const fullSpeech = `${displayTitle}. Risk level: ${currentSev.label}. Steps to follow: ${displayActions.join(
        '. '
      )}. Avoid the following: ${displayAvoid.join('. ')}.`;
      tts.speak(fullSpeech, currentLanguage);
    }
  };

  const handleStopSpeech = () => {
    tts.stop();
  };

  const handleSaveHistory = async () => {
    await StorageService.addHistory({
      title: analysis.title,
      category: analysis.category,
      severity: analysis.severity,
      inputSummary: analysis.summary,
      immediateActions: analysis.immediate_actions,
      avoidances: analysis.avoid,
      actionTaken: 'Guidance viewed and applied.',
      location: 'Campus Premises',
    });
    setSavedToHistory(true);
    setTimeout(() => setSavedToHistory(false), 3000);
  };

  return (
    <div
      id="structured-response-container"
      className="rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden space-y-0 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Critical Attention Banner if High/Critical */}
      {(analysis.severity === 'CRITICAL' || analysis.severity === 'HIGH' || analysis.emergency_required) && (
        <div className="bg-red-600 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-emergency">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="font-extrabold text-sm tracking-wide uppercase">
                URGENT EMERGENCY ESCALATION
              </div>
              <div className="text-xs text-red-100">
                This situation requires immediate professional emergency assistance.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEmergencyModal}
              className="px-3.5 py-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 text-xs font-bold shadow-md transition whitespace-nowrap"
            >
              📞 CALL 112 NOW
            </button>
            <button
              onClick={onOpenAlertModal}
              className="px-3.5 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-bold transition whitespace-nowrap"
            >
              🔔 Alert Contacts
            </button>
          </div>
        </div>
      )}

      {/* Main Analysis Header Card */}
      <div className={`p-5 sm:p-6 ${currentSev.colorBg} border-b ${currentSev.colorBorder}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide ${currentSev.badgeBg}`}
              >
                <span>{currentSev.icon}</span>
                <span>{currentSev.label}</span>
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {analysis.category || 'First Aid Assessment'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 leading-tight">
              {displayTitle}
            </h2>

            <p className="text-xs text-slate-600 italic">
              ℹ️ {analysis.confidence_note}
            </p>
          </div>

          {/* Quick Action Tools: TTS, Language Toggle, Save */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Read Aloud TTS button */}
            <button
              id="tts-read-aloud-btn"
              onClick={handleReadAloud}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                isSpeaking
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              {isSpeaking ? (
                isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5" /> <span>Resume Audio</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 animate-pulse" /> <span>Pause Audio</span>
                  </>
                )
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" /> <span>🔊 Read Aloud</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                onClick={handleStopSpeech}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-600"
                title="Stop Audio"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}

            {/* Translation Toggle if target language has translation */}
            {analysis.translated_title && currentLanguage !== 'English' && (
              <button
                onClick={() => setShowTranslated(!showTranslated)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>{showTranslated ? 'Show English' : `Show ${currentLanguage}`}</span>
              </button>
            )}

            {/* Save to History */}
            <button
              onClick={handleSaveHistory}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700"
            >
              {savedToHistory ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Saved!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save Log</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content: DO THIS NOW & AVOID */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* DO THIS NOW SECTION */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-sm">
              ✓
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-tight">
              DO THIS NOW — Immediate Step-by-Step Action
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {displayActions.map((action, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-start gap-3 transition"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AVOID / WHAT NOT TO DO SECTION */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-extrabold text-sm">
              ✕
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-tight">
              AVOID — Critical Things NOT to Do
            </h3>
          </div>

          <div className="rounded-xl bg-rose-50/70 border border-rose-200 p-4 space-y-2">
            {displayAvoid.map((avoidItem, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-950 font-medium">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{avoidItem}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WARNING SIGNS & PROFESSIONAL MEDICAL HELP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Seek Help If */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Get Professional Help If</span>
            </div>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              {analysis.seek_professional_help}
            </p>
          </div>

          {/* Red Flag Warning Signs */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Red Flag Signs to Monitor</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              {analysis.warning_signs.map((sign, idx) => (
                <li key={idx}>{sign}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Summary for Emergency Alert */}
        <div className="rounded-xl bg-slate-900 text-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Dispatched Incident Summary
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">{displaySummary}</p>
          </div>
          <button
            onClick={onOpenAlertModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs whitespace-nowrap shadow-md transition"
          >
            🔔 Alert Contacts
          </button>
        </div>
      </div>
    </div>
  );
};
