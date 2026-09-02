import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Sparkles,
  Camera,
  Globe,
  MapPin,
  MessageSquare,
  BookOpen,
  Users,
  History,
  Settings,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { AppTab, LanguageCode, AccessibilitySettings } from './types.ts';
import { StorageService, DEFAULT_SETTINGS } from './services/storage.ts';
import { Navbar } from './components/Navbar.tsx';
import { EmergencyEscalationModal } from './components/EmergencyEscalationModal.tsx';
import { AlertContactModal } from './components/AlertContactModal.tsx';
import { OfflineSafetyBanner } from './components/OfflineSafetyBanner.tsx';
import { PWAInstallButton } from './components/PWAInstallButton.tsx';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { AssistantPage } from './pages/AssistantPage.tsx';
import { HazardVisionPage } from './pages/HazardVisionPage.tsx';
import { TranslateWarningPage } from './pages/TranslateWarningPage.tsx';
import { SafetyChatPage } from './pages/SafetyChatPage.tsx';
import { CampusMapPage } from './pages/CampusMapPage.tsx';
import { FirstAidLibraryPage } from './pages/FirstAidLibraryPage.tsx';
import { EmergencyContactsPage } from './pages/EmergencyContactsPage.tsx';
import { IncidentHistoryPage } from './pages/IncidentHistoryPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { DemoCenterPage } from './pages/DemoCenterPage.tsx';

// New Pages
import { GuardianPage } from './pages/GuardianPage.tsx';
import { MedicalHelpPage } from './pages/MedicalHelpPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';

export function App() {
  const [currentTab, setTab] = useState<AppTab>('home');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('English');
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Real-time Emergency Alert states
  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    title: string;
    category: string;
    severity: string;
    time: string;
    location: string;
    distance: string;
    description: string;
    instructions: string[];
    whatToAvoid: string[];
    safeArea: string;
    contact: string;
    source: string;
    isDemo: boolean;
  } | null>(null);

  const [alertSound, setAlertSound] = useState<boolean>(true);
  const [safeConfirmed, setSafeConfirmed] = useState<boolean | null>(null);

  const playAlertSound = () => {
    if (!alertSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, 250);
    } catch (e) {
      console.warn("AudioContext playback blocked:", e);
    }
  };

  // Demo presets context
  const [assistantQuery, setAssistantQuery] = useState<string>('');
  const [assistantImage, setAssistantImage] = useState<{ data: string; mimeType: string } | undefined>(undefined);
  const [hazardPreset, setHazardPreset] = useState<any>(undefined);
  const [translatePreset, setTranslatePreset] = useState<any>(undefined);

  useEffect(() => {
    StorageService.getLanguage().then(setCurrentLanguage);
    StorageService.getSettings().then(setSettings);

    // Register PWA service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(console.warn);
    }
  }, []);

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    StorageService.saveLanguage(lang);
  };

  const handleSelectDemoScenario = (scenarioId: number) => {
    switch (scenarioId) {
      case 11:
        // DEMO 1: Possible Fall
        localStorage.setItem('safelink_guardian_active', 'true');
        setTab('guardian');
        setTimeout(() => {
          const el = document.getElementById('guardian-page');
          if (el) {
            // Trigger fall impact simulation
            alert("Simulating Possible Fall-like Event with 10s countdown! G-Force Impact threshold exceeded.");
          }
        }, 300);
        break;
      case 12:
        // DEMO 2: Earthquake Alert
        setActiveAlert({
          id: 'alert-earthquake',
          title: '🌎 REGIONAL EARTHQUAKE EMERGENCY DISASTER WARNING',
          category: 'earthquake',
          severity: 'HIGH',
          time: new Date().toLocaleTimeString(),
          location: 'Delhi NCR Campus Perimeter',
          distance: '0.4 km',
          description: 'A moderate earth tremor was reported in northern zone sectors. Heavy structures may have shifted.',
          instructions: ['Drop, Cover, and Hold on under heavy desks.', 'Stay away from outer glass facades and utility columns.', 'Remain indoors until structural engineers declare pathways clear.'],
          whatToAvoid: ['Do NOT use building elevators under any circumstances.', 'Avoid standing near heavy storage shelves or tall laboratory equipment.'],
          safeArea: 'Open Sports Complex Ground',
          contact: 'Campus Safety desk (+91 112 456)',
          source: 'Indian Meteorological Department',
          isDemo: true,
        });
        playAlertSound();
        setTab('home');
        break;
      case 13:
        // DEMO 3: Flood Alert
        setActiveAlert({
          id: 'alert-flood',
          title: '🌊 SEVERE FLASH FLOOD & WATER INUNDATION IN PROGRESS',
          category: 'flood',
          severity: 'CRITICAL',
          time: new Date().toLocaleTimeString(),
          location: 'Science & Laboratory Basements',
          distance: '0.9 km',
          description: 'Sudden cloudburst monsoon rains caused immediate water logging in basement tunnels and power plant block entrances.',
          instructions: ['Evacuate basement halls and immediately climb to upper floor heights.', 'Stay away from high-voltage junction grids and street electrical lines.'],
          whatToAvoid: ['Do NOT wade through fast-flowing sewage or standing waters.', 'Do NOT touch electrical panels with wet boots or gloves.'],
          safeArea: 'Main Admin Block Level 3 Common Area',
          contact: 'National Disaster Response Force (NDRF)',
          source: 'Official National Disaster Portal (India)',
          isDemo: true,
        });
        playAlertSound();
        setTab('home');
        break;
      case 14:
        // DEMO 4: Medical Triage
        setTab('medical');
        break;
      case 15:
        // DEMO 5: Image Hazard Vision (Exposed wires)
        setHazardPreset({
          category: 'Electrical',
          description: 'Frayed copper wiring hanging from chemical lab ceilings. Constant electric sparks posing acute spark ignition hazard.',
          photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
        });
        setTab('hazard-vision');
        break;
      case 16:
        // DEMO 6: Doctor Summary Translator
        setTab('medical');
        break;
      default:
        setTab('home');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-100/70 text-slate-800 ${
        settings.highContrast ? 'high-contrast' : ''
      } ${settings.largeText ? 'large-text' : ''} ${
        settings.reducedMotion ? 'reduced-motion' : ''
      }`}
    >
      {/* Offline Safety Banner */}
      <OfflineSafetyBanner
        setTab={setTab}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* Primary Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setTab={setTab}
        currentLanguage={currentLanguage}
        setLanguage={handleLanguageChange}
        highContrast={settings.highContrast}
        setHighContrast={(val) => {
          const up = { ...settings, highContrast: val };
          setSettings(up);
          StorageService.saveSettings(up);
        }}
        largeText={settings.largeText}
        setLargeText={(val) => {
          const up = { ...settings, largeText: val };
          setSettings(up);
          StorageService.saveSettings(up);
        }}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onSelectDemoScenario={handleSelectDemoScenario}
      />

      {/* Real-time Emergency Alert Box */}
      {activeAlert && (
        <div className="bg-red-50 border-y border-red-200 text-slate-900 px-4 py-4 sm:px-6 shadow-md transition animate-in fade-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider animate-pulse">
                  🚨 {activeAlert.severity} — EMERGENCY ALERT
                </span>
                {activeAlert.isDemo && (
                  <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                    DEMO ALERT — NOT A REAL EMERGENCY
                  </span>
                )}
                <span className="text-xs text-slate-400 font-bold">
                  Received: {activeAlert.time} • Source: {activeAlert.source}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-black font-display text-slate-950">
                  {activeAlert.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {activeAlert.description}
                </p>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1 font-medium">
                  <span>📍 Area: <strong>{activeAlert.location}</strong></span>
                  <span>📏 Distance: <strong>{activeAlert.distance || "Campus Wide"}</strong></span>
                  <span>🚪 Recommendation: <strong>Avoid {activeAlert.location} and head towards {activeAlert.safeArea}</strong></span>
                </div>
              </div>

              {/* Instructions and Warnings inside the alert detail (Part 12) */}
              <div className="p-3 bg-white/80 rounded-xl border border-red-100 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-extrabold text-emerald-700 block uppercase tracking-wider text-[10px] mb-1">🟢 DO NOW</span>
                  <ul className="list-disc pl-4 space-y-0.5 font-medium leading-snug">
                    {activeAlert.instructions.map((ins, i) => <li key={i}>{ins}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="font-extrabold text-rose-700 block uppercase tracking-wider text-[10px] mb-1">🔴 DO NOT / AVOID</span>
                  <ul className="list-disc pl-4 space-y-0.5 font-medium leading-snug">
                    {activeAlert.whatToAvoid.map((av, i) => <li key={i}>{av}</li>)}
                  </ul>
                </div>
              </div>

              {/* Are you safe check (Part 13) */}
              <div className="p-2.5 bg-slate-950 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  🛡️ Are you safe? Let the control room know your status:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSafeConfirmed(true);
                      alert("Your safe status has been logged locally in active incident logs!");
                    }}
                    className={`px-3 py-1.5 rounded-lg font-black text-[10px] transition ${
                      safeConfirmed === true ? 'bg-emerald-600 text-white' : 'bg-white text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    ✅ I'M SAFE
                  </button>
                  <button
                    onClick={() => {
                      setSafeConfirmed(false);
                      setIsEmergencyModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-[10px] transition"
                  >
                    🆘 I NEED HELP
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
              <a
                href="tel:112"
                className="flex-1 md:flex-none px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs rounded-xl text-center"
              >
                📞 Call 112
              </a>
              <button
                onClick={() => setAlertSound(!alertSound)}
                className="flex-1 md:flex-none px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[10px] font-black rounded-lg"
              >
                {alertSound ? "🔊 Mute Alert" : "🔇 Sound Off"}
              </button>
              <button
                onClick={() => setActiveAlert(null)}
                className="flex-1 md:flex-none px-3 py-1.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded-lg hover:bg-slate-300"
              >
                Dismiss Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main App Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-12">
        {currentTab === 'home' && (
          <HomePage
            setTab={setTab}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onSelectDemoScenario={handleSelectDemoScenario}
          />
        )}

        {currentTab === 'assistant' && (
          <AssistantPage
            currentLanguage={currentLanguage}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
            initialQuery={assistantQuery}
            initialImage={assistantImage}
          />
        )}

        {(currentTab === 'hazard-vision' || currentTab === 'scan') && (
          <HazardVisionPage
            currentLanguage={currentLanguage}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            initialPreset={hazardPreset}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage />
        )}

        {currentTab === 'demo' && (
          <DemoCenterPage onSelectScenario={handleSelectDemoScenario} />
        )}

        {currentTab === 'translate' && (
          <TranslateWarningPage
            currentLanguage={currentLanguage}
            initialPreset={translatePreset}
          />
        )}

        {currentTab === 'chat' && (
          <SafetyChatPage
            currentLanguage={currentLanguage}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          />
        )}

        {currentTab === 'map' && <CampusMapPage />}

        {currentTab === 'first-aid' && (
          <FirstAidLibraryPage currentLanguage={currentLanguage} />
        )}

        {currentTab === 'contacts' && (
          <EmergencyContactsPage
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
          />
        )}

        {currentTab === 'history' && <IncidentHistoryPage />}

        {currentTab === 'settings' && (
          <SettingsPage
            settings={settings}
            setSettings={setSettings}
            currentLanguage={currentLanguage}
            setLanguage={handleLanguageChange}
          />
        )}

        {currentTab === 'guardian' && (
          <GuardianPage
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onShareLocation={() => alert("Current coordinates shared with safe contacts: 28.5355° N, 77.3910° E")}
            onAlertContact={() => setIsAlertModalOpen(true)}
          />
        )}

        {currentTab === 'medical' && (
          <MedicalHelpPage
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onShareLocation={() => alert("Simulated ambulance GPS payload uploaded successfully.")}
            onAlertContact={() => setIsAlertModalOpen(true)}
            currentLanguage={currentLanguage}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsPage />
        )}

        {currentTab === 'about' && <AboutPage />}

        {currentTab === 'privacy' && <PrivacyPage />}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => setTab('home')}
          className={`p-1.5 flex flex-col items-center text-[10px] font-bold ${
            currentTab === 'home' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <span className="text-base">🏠</span>
          <span>Home</span>
        </button>

        <button
          onClick={() => setTab('assistant')}
          className={`p-1.5 flex flex-col items-center text-[10px] font-bold ${
            currentTab === 'assistant' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <span className="text-base">🤖</span>
          <span>Assistant</span>
        </button>

        {/* Floating Emergency Center Action Button */}
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="-mt-5 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 border-2 border-white animate-emergency focus:outline-none"
        >
          <PhoneCall className="w-5 h-5" />
        </button>

        <button
          onClick={() => setTab('hazard-vision')}
          className={`p-1.5 flex flex-col items-center text-[10px] font-bold ${
            currentTab === 'hazard-vision' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <span className="text-base">📷</span>
          <span>Hazards</span>
        </button>

        <button
          onClick={() => setTab('map')}
          className={`p-1.5 flex flex-col items-center text-[10px] font-bold ${
            currentTab === 'map' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <span className="text-base">🗺️</span>
          <span>Map</span>
        </button>
      </nav>

      {/* Global Modals */}
      <EmergencyEscalationModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
      />

      <AlertContactModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />

      {/* App Footer */}
      <footer className="hidden lg:block bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SAFE-LINK AI</span>
            <span>•</span>
            <span>Google for Developers | H2S PromptWars × WIE-IEEE</span>
          </div>

          <div className="flex items-center gap-4">
            <PWAInstallButton />
            <button onClick={() => setTab('about')} className="hover:underline">
              About
            </button>
            <button onClick={() => setTab('privacy')} className="hover:underline">
              Medical Disclaimer & Privacy
            </button>
            <button onClick={() => setTab('settings')} className="hover:underline">
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

