import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Camera,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  AlertTriangle,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { LanguageCode } from '../types.ts';
import { LANGUAGES } from '../data/mockData.ts';
import { requestWarningTranslation } from '../services/apiClient.ts';
import { tts } from '../services/tts.ts';

interface TranslateWarningPageProps {
  currentLanguage: LanguageCode;
  initialPreset?: {
    text: string;
    lang: LanguageCode;
  };
}

export const TranslateWarningPage: React.FC<TranslateWarningPageProps> = ({
  currentLanguage,
  initialPreset,
}) => {
  const [targetLang, setTargetLang] = useState<LanguageCode>(initialPreset?.lang || currentLanguage || 'Hindi');
  const [signText, setSignText] = useState(initialPreset?.text || 'DANGER — HIGH VOLTAGE — 11,000 VOLTS');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = tts.subscribe((speaking) => setIsSpeaking(speaking));
    return () => {
      unsub();
      tts.stop();
    };
  }, []);

  useEffect(() => {
    if (initialPreset) {
      setSignText(initialPreset.text);
      if (initialPreset.lang) setTargetLang(initialPreset.lang);
    }
  }, [initialPreset]);

  const presetSigns = [
    {
      title: '⚡ High Voltage',
      text: 'DANGER: HIGH VOLTAGE 11,000V — KEEP AWAY. UNAUTHORIZED ENTRY STRICTLY PROHIBITED.',
      icon: '⚡',
    },
    {
      title: '☣️ Biohazard',
      text: 'BIOHAZARD: INFECTIOUS WASTE STORAGE. AUTHORIZED PERSONNEL ONLY. WEAR FULL PPE.',
      icon: '☣️',
    },
    {
      title: '🔥 Flammable Gas',
      text: 'CAUTION: FLAMMABLE COMPRESSED GAS CYLINDERS. NO OPEN FLAMES OR SMOKING WITHIN 15M.',
      icon: '🔥',
    },
    {
      title: '🧪 Corrosive Acid',
      text: 'WARNING: CONCENTRATED CORROSIVE ACID. WEAR CHEMICAL SPLASH GOGGLES AND HEAVY APRON.',
      icon: '🧪',
    },
    {
      title: '🥽 Laser Radiation',
      text: 'DANGER: CLASS 4 INVISIBLE LASER RADIATION. AVOID EYE OR SKIN EXPOSURE TO DIRECT BEAM.',
      icon: '🥽',
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedImage({
        data: base64,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const result = await requestWarningTranslation({
        text: signText,
        image: selectedImage || undefined,
        targetLanguage: targetLang,
      });
      setTranslationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeech = () => {
    if (!translationResult) return;
    if (isSpeaking) {
      tts.stop();
    } else {
      const spoken = `${translationResult.translated_text || translationResult.extracted_text}. ${
        translationResult.translated_meaning || translationResult.meaning
      }. ${translationResult.translated_action || translationResult.required_action}`;
      tts.speak(spoken, targetLang);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>Multilingual Safety Translator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Translate Safety Warnings & Chemical Labels
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Capture or paste laboratory safety signs, caution placards, and electrical warnings to instantly get translated meanings and required safety actions.
        </p>
      </div>

      {/* Preset Signs Selection */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Common Campus Warning Signs
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {presetSigns.map((sign, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSignText(sign.text);
                setSelectedImage(null);
              }}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left transition text-xs space-y-1 shadow-2xs"
            >
              <div className="text-base">{sign.icon}</div>
              <div className="font-bold text-slate-900">{sign.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        {/* Target Language Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Language:
            </label>
          </div>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} ({l.label})
              </option>
            ))}
          </select>
        </div>

        {/* Text of Sign */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Sign Text / Warning Label
          </label>
          <textarea
            rows={3}
            value={signText}
            onChange={(e) => setSignText(e.target.value)}
            placeholder="Type warning sign text or upload photo for OCR..."
            className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        {/* Photo Attachment */}
        <div>
          {selectedImage ? (
            <div className="relative inline-block rounded-xl border-2 border-slate-300 overflow-hidden bg-slate-50">
              <img
                src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`}
                alt="Sign preview"
                className="max-h-36 w-auto object-cover"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                <Camera className="w-3.5 h-3.5 text-slate-600" />
                <span>Upload Sign Photo (OCR)</span>
              </button>
            </div>
          )}
        </div>

        {/* Translate Trigger CTA */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleTranslate}
            disabled={isTranslating || (!signText.trim() && !selectedImage)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Translating with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Translate & Explain in {targetLang}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Translation Output Card */}
      {translationResult && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200 space-y-0">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-mono font-bold uppercase">
                {translationResult.target_language || targetLang} Translation
              </span>
              <h2 className="text-xl font-bold font-display tracking-tight">
                {translationResult.translated_text || translationResult.extracted_text}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeech}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
              </button>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-4">
            {/* Translated Meaning */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
              <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                Translated Meaning / व्याख्या
              </div>
              <p className="text-sm text-blue-950 font-medium leading-relaxed">
                {translationResult.translated_meaning || translationResult.meaning}
              </p>
            </div>

            {/* Required Action in Local Language */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Immediate Required Action / आवश्यक सुरक्षा कदम</span>
              </div>
              <p className="text-sm text-emerald-950 font-bold leading-relaxed">
                {translationResult.translated_action || translationResult.required_action}
              </p>
            </div>

            {/* Original English Text reference */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-700">Original Text: </span>
                <span className="font-mono text-slate-800">{translationResult.extracted_text}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] font-mono">
                Risk: {translationResult.risk_level || 'HIGH'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
