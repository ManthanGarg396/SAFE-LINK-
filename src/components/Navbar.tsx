import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Globe,
  Eye,
  Sparkles,
  Wifi,
  WifiOff,
  Menu,
  X,
  Volume2,
  AlertTriangle,
} from 'lucide-react';
import { AppTab, LanguageCode } from '../types.ts';
import { LANGUAGES } from '../data/mockData.ts';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

interface NavbarProps {
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  onOpenEmergencyModal: () => void;
  onSelectDemoScenario: (scenarioId: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  currentLanguage,
  setLanguage,
  highContrast,
  setHighContrast,
  largeText,
  setLargeText,
  onOpenEmergencyModal,
  onSelectDemoScenario,
}) => {
  const isOnline = useOnlineStatus();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentLangObj = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  const navLinks: Array<{ id: AppTab; label: string; icon: string }> = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'assistant', label: 'AI Assistant', icon: '🤖' },
    { id: 'hazard-vision', label: 'Hazard Vision', icon: '📷' },
    { id: 'translate', label: 'Translate Signs', icon: '🌐' },
    { id: 'chat', label: 'Safety Chat', icon: '💬' },
    { id: 'map', label: 'Campus Map', icon: '🗺️' },
    { id: 'first-aid', label: 'First-Aid Library', icon: '📚' },
    { id: 'contacts', label: 'Contacts', icon: '👥' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top micro-bar for Hackathon / Status */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/80 text-red-300 font-semibold border border-red-800/50">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Google for Developers | H2S PromptWars × WIE-IEEE
          </span>
          <span className="hidden md:inline text-slate-400">
            Multimodal Campus Health & Emergency Safety Companion
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-slate-400">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <WifiOff className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Offline Mode</span>
              </span>
            )}
          </div>

          {/* Demo Scenarios Quick Launcher */}
          <div className="relative">
            <button
              id="demo-scenarios-btn"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Judge Demos</span>
            </button>

            {showDemoMenu && (
              <div
                id="demo-scenarios-menu"
                className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800"
              >
                <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Competition Scenarios
                </div>
                <button
                  onClick={() => {
                    onSelectDemoScenario(1);
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-start gap-2 border-b border-slate-100"
                >
                  <span className="text-base">🩹</span>
                  <div>
                    <div className="font-semibold text-slate-900">Demo 1: Minor Injury First-Aid</div>
                    <div className="text-slate-500">Structured AI step-by-step guidance</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectDemoScenario(2);
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-start gap-2 border-b border-slate-100"
                >
                  <span className="text-base">⚡</span>
                  <div>
                    <div className="font-semibold text-slate-900">Demo 2: Image Hazard Vision</div>
                    <div className="text-slate-500">Exposed high-voltage wire analysis</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectDemoScenario(3);
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-start gap-2 border-b border-slate-100"
                >
                  <span className="text-base">🌐</span>
                  <div>
                    <div className="font-semibold text-slate-900">Demo 3: Multilingual Switch</div>
                    <div className="text-slate-500">English → Hindi → Hinglish instructions</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectDemoScenario(4);
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 flex items-start gap-2 border-b border-slate-100"
                >
                  <span className="text-base">🚨</span>
                  <div>
                    <div className="font-semibold text-red-700">Demo 4: Critical Escalation</div>
                    <div className="text-slate-500">Unconscious person → 112 Urgent Action</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectDemoScenario(5);
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-start gap-2 border-b border-slate-100"
                >
                  <span className="text-base">⚠️</span>
                  <div>
                    <div className="font-semibold text-slate-900">Demo 5: Sign Translator</div>
                    <div className="text-slate-500">Warning sign OCR & local translation</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectDemoScenario(6);
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-start gap-2"
                >
                  <span className="text-base">🧪</span>
                  <div>
                    <div className="font-semibold text-slate-900">Demo 6: Campus Hazard Report</div>
                    <div className="text-slate-500">Chemical lab spill with GPS & photo</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <button
            id="brand-logo-btn"
            onClick={() => setTab('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-display font-extrabold text-xl tracking-tight text-slate-900">
                <span>SAFE-LINK</span>
                <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-xs rounded font-mono font-bold">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Multimodal Campus Safety Companion
              </p>
            </div>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 7).map((item) => (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  currentTab === item.id
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                id="language-select-btn"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentLangObj.native}</span>
              </button>

              {showLangMenu && (
                <div
                  id="language-dropdown-menu"
                  className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 max-h-80 overflow-y-auto"
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase">
                    Select Language ({LANGUAGES.length})
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 transition ${
                        currentLanguage === lang.code ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({lang.label})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accessibility Quick Toggle */}
            <button
              id="accessibility-quick-toggle"
              onClick={() => {
                setHighContrast(!highContrast);
              }}
              title="Toggle High Contrast"
              className={`p-2 rounded-lg border text-xs transition ${
                highContrast
                  ? 'bg-slate-900 text-yellow-300 border-slate-900 shadow-inner'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Emergency Escalation Button (Always Prominent) */}
            <button
              id="global-emergency-call-btn"
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 transition transform hover:scale-[1.02] active:scale-[0.98] animate-emergency"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden sm:inline">🚨 EMERGENCY</span>
              <span className="sm:hidden font-mono">112</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setShowMobileMenu(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  currentTab === item.id
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>High Contrast: {highContrast ? 'ON' : 'OFF'}</span>
            <button
              onClick={() => setLargeText(!largeText)}
              className="px-2 py-1 rounded bg-slate-100 font-medium text-slate-700"
            >
              Text Size: {largeText ? 'Large' : 'Normal'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
