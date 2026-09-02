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

export function App() {
  const [currentTab, setTab] = useState<AppTab>('home');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('English');
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

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
      case 1:
        // Demo 1: Minor Injury First-Aid
        setAssistantQuery('My friend sliced his finger while slicing an apple in the hostel kitchen. It is bleeding steadily. What should I do?');
        setAssistantImage(undefined);
        setTab('assistant');
        break;
      case 2:
        // Demo 2: Image Hazard Vision (Exposed wires)
        setHazardPreset({
          category: 'Electrical',
          description: 'Sparks and frayed copper wires hanging near the student workshop entrance. Poses immediate electric shock hazard.',
          photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
        });
        setTab('hazard-vision');
        break;
      case 3:
        // Demo 3: Multilingual Real-time Switch
        setCurrentLanguage('Hindi');
        StorageService.saveLanguage('Hindi');
        setAssistantQuery('हाथ में गर्म चाय गिरने से तेज जलन हो रही है और लाल निशान बन गया है। तुरंत क्या करें?');
        setTab('assistant');
        break;
      case 4:
        // Demo 4: Critical Emergency Escalation
        setAssistantQuery('A student suddenly collapsed unconscious in the computer lab. Not responding to calling or shoulder taps.');
        setTab('assistant');
        setIsEmergencyModalOpen(true);
        break;
      case 5:
        // Demo 5: Sign Translation
        setTranslatePreset({
          text: 'DANGER: HIGH VOLTAGE 11,000V — KEEP AWAY. DO NOT TOUCH EQUIPMENT.',
          lang: 'Hindi' as LanguageCode,
        });
        setTab('translate');
        break;
      case 6:
        // Demo 6: Chemical Hazard Report
        setHazardPreset({
          category: 'Chemical',
          description: 'Strong pungent chemical acid odor leaking from solvent cabinet near Chemistry Lab 204. Need immediate containment.',
        });
        setTab('hazard-vision');
        break;
      default:
        setTab('assistant');
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

        {currentTab === 'hazard-vision' && (
          <HazardVisionPage
            currentLanguage={currentLanguage}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            initialPreset={hazardPreset}
          />
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

