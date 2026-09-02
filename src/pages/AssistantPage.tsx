import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  Mic,
  MicOff,
  Image as ImageIcon,
  X,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  PhoneCall,
  Volume2,
} from 'lucide-react';
import { EmergencyAnalysis, LanguageCode } from '../types.ts';
import { requestEmergencyAnalysis } from '../services/apiClient.ts';
import { StructuredResponseCard } from '../components/StructuredResponseCard.tsx';

interface AssistantPageProps {
  currentLanguage: LanguageCode;
  onOpenEmergencyModal: () => void;
  onOpenAlertModal: () => void;
  initialQuery?: string;
  initialImage?: { data: string; mimeType: string };
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  currentLanguage,
  onOpenEmergencyModal,
  onOpenAlertModal,
  initialQuery = '',
  initialImage,
}) => {
  const [textInput, setTextInput] = useState(initialQuery);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(
    initialImage || null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EmergencyAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setTextInput(initialQuery);
    }
    if (initialImage) {
      setSelectedImage(initialImage);
    }
  }, [initialQuery, initialImage]);

  const quickChips = [
    { label: '🩹 Sliced finger while chopping', text: 'Friend cut finger with kitchen knife while slicing fruit in hostel. It is bleeding steadily.' },
    { label: '🦶 Twisted ankle playing football', text: 'Twisted ankle during sports; severe swelling, pain when putting weight on it.' },
    { label: '⚡ Sparks near wall plug', text: 'Sparks and burning smell coming from wall socket behind desk in hostel room.' },
    { label: '😵 Roommate collapsed unconscious', text: 'Roommate suddenly collapsed on the floor, not responding when called or shaken.' },
    { label: '🧪 Acid splash on forearm in lab', text: 'Accidental splash of dilute hydrochloric acid on forearm in chemistry laboratory.' },
    { label: '🔥 Smoke from bin in corridor', text: 'Small flame and thick smoke coming from trash bin near stairwell.' },
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

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by this browser. Please type your situation.');
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTextInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleAnalyze = async () => {
    if (!textInput.trim() && !selectedImage) {
      setErrorMsg('Please describe the situation or provide an image to analyze.');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      const result = await requestEmergencyAnalysis({
        text: textInput,
        image: selectedImage || undefined,
        language: currentLanguage,
      });

      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setErrorMsg('Unable to reach safety analysis server. Please try again or call emergency services directly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setTextInput('');
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Title & Introduction */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Multimodal Gemini Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          What is happening right now?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Describe the situation, upload a photo of the injury/hazard, or use voice input for immediate structured first-aid guidance.
        </p>
      </div>

      {/* Input Box Card */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        {/* Quick prompt chips */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Situation Templates
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setTextInput(chip.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="emergency-text-input"
            rows={4}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Describe what happened... (e.g., 'Student fainted in the computer lab, breathing but unresponsive' or 'Cut hand on broken beaker in science hall')"
            className="w-full p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-slate-800 placeholder-slate-400 resize-none transition"
          />

          {/* Voice Input Floating Trigger */}
          <button
            type="button"
            onClick={handleVoiceInput}
            title="Speech to Text"
            className={`absolute right-3 bottom-3 p-2 rounded-xl border transition ${
              isListening
                ? 'bg-red-600 text-white border-red-600 animate-pulse'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {isListening && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Listening... Speak clearly into your microphone in {currentLanguage}.</span>
          </div>
        )}

        {/* Image Attachment Preview & Upload */}
        <div className="space-y-2">
          {selectedImage ? (
            <div className="relative inline-block rounded-xl border-2 border-slate-300 overflow-hidden bg-slate-50">
              <img
                src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`}
                alt="Uploaded situation"
                className="h-32 w-auto object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="px-2 py-0.5 bg-slate-900/90 text-[10px] text-white font-mono text-center">
                Photo attached for AI vision
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                <Camera className="w-4 h-4 text-slate-600" />
                <span>Upload / Take Photo</span>
              </button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Clear Form
          </button>

          <div className="flex items-center gap-2">
            <button
              id="analyze-situation-submit-btn"
              type="button"
              disabled={isAnalyzing || (!textInput.trim() && !selectedImage)}
              onClick={handleAnalyze}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze & Get First-Aid</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Structured Result Display */}
      {analysisResult && (
        <StructuredResponseCard
          analysis={analysisResult}
          currentLanguage={currentLanguage}
          onOpenEmergencyModal={onOpenEmergencyModal}
          onOpenAlertModal={onOpenAlertModal}
        />
      )}
    </div>
  );
};
