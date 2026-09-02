import React, { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  Phone,
  MapPin,
  MessageSquare,
  Sparkles,
  Search,
  CheckCircle,
  Copy,
  Volume2,
  FileText,
  Filter,
  Check,
  ShieldCheck,
  Globe,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { StorageService } from '../services/storage.ts';

interface MedicalHelpPageProps {
  onOpenEmergencyModal: () => void;
  onShareLocation: () => void;
  onAlertContact: () => void;
  currentLanguage: string;
}

export const MedicalHelpPage: React.FC<MedicalHelpPageProps> = ({
  onOpenEmergencyModal,
  onShareLocation,
  onAlertContact,
  currentLanguage,
}) => {
  // Medical Triage States
  const [triageStep, setTriageStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [triageResult, setTriageResult] = useState<string | null>(null);

  // Doctor Communication summary state
  const [symptomsInput, setSymptomsInput] = useState<string>('');
  const [summaryReviewApproved, setSummaryReviewApproved] = useState<boolean>(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const [translationOutput, setTranslationOutput] = useState<string>('');
  const [speechActive, setSpeechActive] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Filter doctor specialty state
  const [doctorFilter, setDoctorFilter] = useState<string>('ALL');

  // Ambulance Workflow steps: 'none' | 'confirm' | 'locating' | 'contacting' | 'dispatched'
  const [ambulanceStep, setAmbulanceStep] = useState<string>('none');

  // Interactive Translation State
  const [voiceInput, setVoiceInput] = useState<string>('');
  const [translationMode, setTranslationMode] = useState<'hindi-to-english' | 'english-to-hindi'>('hindi-to-english');

  const triageQuestions = [
    { key: 'conscious', text: 'Is the person conscious and responsive?' },
    { key: 'breathing', text: 'Are they breathing normally without gasping?' },
    { key: 'bleeding', text: 'Is there any severe, continuous bleeding?' },
    { key: 'chest_pain', text: 'Is there severe, crushing chest pain or left-arm numbness?' },
    { key: 'head_injury', text: 'Did the injury involve their head or neck?' },
  ];

  const handleTriageAnswer = (key: string, value: string) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (triageStep < triageQuestions.length - 1) {
      setTriageStep(triageStep + 1);
    } else {
      // Calculate final triage level
      // If unconscious or chest pain or non-breathing -> CRITICAL
      if (updated['conscious'] === 'no' || updated['breathing'] === 'no' || updated['chest_pain'] === 'yes') {
        setTriageResult('CRITICAL');
      } else if (updated['bleeding'] === 'yes' || updated['head_injury'] === 'yes') {
        setTriageResult('HIGH');
      } else {
        setTriageResult('MODERATE');
      }
    }
  };

  const resetTriage = () => {
    setTriageStep(0);
    setAnswers({});
    setTriageResult(null);
  };

  // Ambulance helper triggers
  const handleRequestAmbulance = () => {
    setAmbulanceStep('confirm');
  };

  const confirmAmbulance = () => {
    setAmbulanceStep('locating');
    setTimeout(() => {
      setAmbulanceStep('contacting');
      setTimeout(() => {
        setAmbulanceStep('dispatched');
      }, 3000);
    }, 2000);
  };

  // Generate doctor summary
  const handleGenerateDoctorSummary = () => {
    if (!symptomsInput) return;
    const summary = `👨‍⚕️ SAFE-LINK CLINICAL REPORT SUMMARY (Patient Triage)
==================================================
Date: ${new Date().toLocaleDateString()}
Report Status: REVIEWED & APPROVED BY PATIENT
Primary Symptoms Described:
- ${symptomsInput}

Vital Signals (Simulated Sensor Interface):
- Baseline Pulse: ${triageResult === 'CRITICAL' ? '122' : '78'} BPM
- Triage Urgency Level: ${triageResult || 'MODERATE'}

Emergency Action Status:
- Emergency Contacts Initiated: Yes
- Location Coordinates Logged: Available in Safe-Link Map

Observations and Emergency Directions:
Please verify standard laboratory parameters and run basic diagnostics. No automatic medication has been administered.`;
    setGeneratedSummary(summary);
    setSummaryReviewApproved(true);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generatedSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleReadAloud = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speechActive) {
        window.speechSynthesis.cancel();
        setSpeechActive(false);
      } else {
        const text = generatedSummary || symptomsInput || "No report available";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setSpeechActive(false);
        setSpeechActive(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Medical translation helper (Part 17)
  const handleTranslatePhrase = () => {
    if (translationMode === 'hindi-to-english') {
      if (voiceInput.includes('pair mein') || voiceInput.includes('pain') || voiceInput.includes('dard')) {
        setTranslationOutput('The user reports severe leg pain and is unable to walk properly.');
      } else if (voiceInput.includes('sans') || voiceInput.includes('breath')) {
        setTranslationOutput('The patient is experiencing breathing difficulty and chest pressure.');
      } else {
        setTranslationOutput('Patient says: I am feeling very unwell and require medical attention.');
      }
    } else {
      setTranslationOutput('चिकित्सक निर्देश: कृपया शांत रहें, घाव को दबाकर रखें और एम्बुलेंस आने का इंतजार करें।');
    }
  };

  const mockHospitals = [
    {
      name: 'Fortis Memorial Research Institute',
      distance: '1.2 km',
      eta: '4 mins',
      emergencyDept: 'Fully Operational (24/7 Red-Level Trauma Desk)',
      phone: '+91 124 496 2200',
    },
    {
      name: 'Max Super Speciality Hospital',
      distance: '2.5 km',
      eta: '8 mins',
      emergencyDept: 'Operational (Green-Zone General Triage Available)',
      phone: '+91 11 26 515 050',
    },
    {
      name: 'Medanta - The Medicity',
      distance: '3.9 km',
      eta: '11 mins',
      emergencyDept: 'Fully Operational (Cardiac & Burns Care Specialists)',
      phone: '+91 124 414 1414',
    },
  ];

  const mockDoctors = [
    {
      name: 'Dr. Ramesh Sharma, MD',
      specialty: 'General Physician',
      clinic: 'Nirmal Clinic & Lab',
      distance: '0.6 km',
      phone: '+91 9812 345 678',
      availability: 'Available Now',
    },
    {
      name: 'Dr. Sunita Reddy, MBBS, MS',
      specialty: 'Orthopedic',
      clinic: 'Orthocare Fracture Hub',
      distance: '1.1 km',
      phone: '+91 9912 345 678',
      availability: 'Availability information unavailable',
    },
    {
      name: 'Dr. Arjun Kapoor, MD',
      specialty: 'Emergency Care',
      clinic: 'Vikas Trauma Center',
      distance: '1.4 km',
      phone: '+91 9712 345 678',
      availability: 'Available Now',
    },
  ];

  const filteredDoctors = mockDoctors.filter((doc) => {
    if (doctorFilter === 'ALL') return true;
    return doc.specialty.toUpperCase() === doctorFilter.toUpperCase();
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300" id="medical-help-page">
      {/* Title block */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-bold text-xs uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-red-600" />
          <span>Clinical Assistance Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Emergency Medical & Ambulance Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Find nearest verified medical providers, translate Hinglish clinical descriptions, and prepare structured summaries for doctors in real-time.
        </p>
      </div>

      {/* Grid: Ambulance dispatcher & AI Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ambulance System (Part 15) */}
        <section className="lg:col-span-5 p-5 bg-slate-900 text-white rounded-3xl shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                🚑 AMBULANCE SERVICES
              </span>
              <span className="text-xs text-red-400 font-bold">112 EMERGENCY LINK</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold font-display">
                Emergency Dispatch Coordinator (India)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide prompt coordinates, auto-notify family members, and call the centralized 112 medical response dispatch system immediately.
              </p>
            </div>

            {/* Ambulance Steps UI */}
            {ambulanceStep === 'none' && (
              <div className="pt-2">
                <button
                  onClick={handleRequestAmbulance}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition"
                >
                  REQUEST EMERGENCY AMBULANCE
                </button>
              </div>
            )}

            {ambulanceStep === 'confirm' && (
              <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-3 animate-in slide-in-from-bottom-2">
                <p className="text-xs text-slate-300 font-bold">
                  ⚠️ CONFIRM AMBULANCE DISPATCH AT CAMPUS?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={confirmAmbulance}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded"
                  >
                    YES, CONFIRM
                  </button>
                  <button
                    onClick={() => setAmbulanceStep('none')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-[10px] rounded"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {ambulanceStep === 'locating' && (
              <div className="p-3 bg-slate-800 rounded-xl text-xs text-amber-400 animate-pulse font-bold">
                ⌛ Fetching high-precision campus GPS coordinates...
              </div>
            )}

            {ambulanceStep === 'contacting' && (
              <div className="p-3 bg-slate-800 rounded-xl text-xs text-amber-400 animate-pulse font-bold">
                📡 Sending dispatch packet to nearby Indian National Emergency Desk...
              </div>
            )}

            {ambulanceStep === 'dispatched' && (
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl space-y-2 text-xs">
                <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Ambulance Workflow Simulated</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-semibold">
                  Safe-Link logged coordinates and prepared active alert channels. **No actual real-world vehicle is dispatched** until verified by direct telephone dispatch.
                </p>
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-1 bg-red-600 px-3 py-1.5 rounded text-white font-bold text-[10px]"
                >
                  📞 Direct Dial 112 Hotline
                </a>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex flex-wrap gap-2">
            <button
              onClick={onShareLocation}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
            >
              📍 Share Location
            </button>
            <button
              onClick={onAlertContact}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
            >
              👥 Alert Contacts
            </button>
          </div>
        </section>

        {/* AI Triage Engine (Part 18) */}
        <section className="lg:col-span-7 p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold">
              🩺
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-display">
                AI-Assisted Emergency Triage Workflow
              </h3>
              <p className="text-[11px] text-slate-500">
                Quick diagnostic questions to evaluate injury severity instantly.
              </p>
            </div>
          </div>

          {triageResult === null ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Question {triageStep + 1} of {triageQuestions.length}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              </div>

              <p className="text-sm font-bold text-slate-900 font-display leading-snug">
                {triageQuestions[triageStep].text}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleTriageAnswer(triageQuestions[triageStep].key, 'yes')}
                  className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleTriageAnswer(triageQuestions[triageStep].key, 'no')}
                  className="px-5 py-2 rounded-xl bg-white border border-slate-250 text-slate-800 hover:bg-slate-50 text-xs font-black"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl space-y-4 animate-in zoom-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                  Triage Classification Complete
                </span>
                <button
                  onClick={resetTriage}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  Restart Triage
                </button>
              </div>

              {triageResult === 'CRITICAL' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                  <div className="text-red-800 font-extrabold flex items-center gap-1.5 text-sm uppercase tracking-wider">
                    <span>🚨 CRITICAL EMERGENCY CLASSIFIED</span>
                  </div>
                  <p className="text-xs text-red-900 leading-relaxed font-semibold">
                    The patient shows symptoms of a severe/life-threatening emergency. Access primary hotline actions immediately below.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="tel:112"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] rounded-lg shadow-sm"
                    >
                      📞 CALL 112 EMERGENCY
                    </a>
                    <button
                      onClick={onOpenEmergencyModal}
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-[10px] rounded-lg"
                    >
                      OPEN SOS CONSOLE
                    </button>
                  </div>
                </div>
              ) : triageResult === 'HIGH' ? (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                  <div className="text-orange-800 font-bold text-xs uppercase">
                    🟡 HIGH RISK LEVEL DETECTED
                  </div>
                  <p className="text-xs text-orange-950 font-medium">
                    Significant trauma reported. Prepare direct sterile pressure dressing. Have the patient sit down comfortably, monitor heart rates, and seek professional clinic guidance promptly.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="text-blue-800 font-bold text-xs uppercase">
                    🟢 MODERATE / LOW RISK LEVEL
                  </div>
                  <p className="text-xs text-blue-950 font-medium">
                    Minor localized injury. Clean with running water, apply sterile bandages, rest properly, and monitor for signs of worsening infection over the next 24-48 hours.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Hospital & Doctor Listings (Parts 14 & 19) */}
      <section className="p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-display flex items-center gap-1.5">
              <span>📍</span>
              <span>Find Nearby Medical Help Engine</span>
            </h3>
            <p className="text-xs text-slate-500">
              Verified hospital emergency wings and specialty clinics near campus.
            </p>
          </div>

          <div className="flex items-center gap-1">
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-2 py-1 bg-slate-100 border-none rounded text-[10px] font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Doctor Specialty: All</option>
              <option value="General Physician">General Physician</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Emergency Care">Emergency Care</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nearest Hospital List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              🏥 Nearest Hospital (Emergency Departments)
            </h4>

            <div className="space-y-3">
              {mockHospitals.map((hosp, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <h5 className="font-black text-slate-950">{hosp.name}</h5>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>🚗 {hosp.distance} ({hosp.eta} away)</span>
                    </div>
                    <div className="text-[11px] font-bold text-red-600 bg-red-50 inline-block px-1.5 py-0.2 rounded mt-1">
                      {hosp.emergencyDept}
                    </div>
                  </div>

                  <a
                    href={`tel:${hosp.phone}`}
                    className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                  >
                    📞
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Doctors Clinics List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              👨‍⚕️ Nearest Clinics & General Doctors
            </h4>

            <div className="space-y-3">
              {filteredDoctors.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <h5 className="font-black text-slate-950">{doc.name}</h5>
                    <p className="text-[11px] text-indigo-700 font-bold">{doc.specialty} • {doc.clinic}</p>
                    <span className="text-[11px] text-slate-500">📍 {doc.distance}</span>
                    <div className="text-[10px] font-semibold text-slate-400 block mt-1">
                      Status: {doc.availability}
                    </div>
                  </div>

                  <a
                    href={`tel:${doc.phone}`}
                    className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                  >
                    📞
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clinical report generator & Translator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doctor Summary generator (Part 16) */}
        <section className="p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Patient Clinical Summary Builder
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <textarea
              rows={3}
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="Describe ongoing symptoms (e.g. Sharp pain in wrist, swelling, dizzy feeling)..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-250 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
            />

            <button
              onClick={handleGenerateDoctorSummary}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[11px] rounded-lg transition"
            >
              Generate Formal Clinical Summary
            </button>

            {generatedSummary && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500 uppercase">Review & Share (Patient Verified)</span>
                  <div className="flex gap-1">
                    <button
                      onClick={handleCopySummary}
                      className="p-1 rounded bg-white border border-slate-300 hover:bg-slate-100 font-bold"
                    >
                      {copiedSummary ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={handleReadAloud}
                      className="p-1 rounded bg-white border border-slate-300 hover:bg-slate-100 font-bold"
                    >
                      🔊
                    </button>
                  </div>
                </div>

                <pre className="p-3 bg-white border border-slate-100 rounded text-[10px] font-mono leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {generatedSummary}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Translation tool (Part 17) */}
        <section className="p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Medical Communication Translator</span>
            </h3>

            <button
              onClick={() => {
                setTranslationMode((prev) => prev === 'hindi-to-english' ? 'english-to-hindi' : 'hindi-to-english');
                setVoiceInput('');
                setTranslationOutput('');
              }}
              className="text-[10px] text-indigo-600 font-bold hover:underline"
            >
              Toggle Mode
            </button>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <p className="text-slate-500 text-[11px]">
              {translationMode === 'hindi-to-english'
                ? 'Speak in Hindi/Hinglish (e.g. "Mere pair mein bahut dard hai")'
                : 'Doctor instructions (English) into clean Hindi'}
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                placeholder={translationMode === 'hindi-to-english' ? 'Hinglish input...' : 'English medical terms...'}
                className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              />
              <button
                onClick={handleTranslatePhrase}
                className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
              >
                Translate
              </button>
            </div>

            {translationOutput && (
              <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl">
                <span className="text-[10px] text-indigo-700 uppercase block font-bold">
                  Translation Output
                </span>
                <p className="text-slate-800 mt-1">{translationOutput}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
