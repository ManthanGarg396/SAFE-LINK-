import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Heart,
  Activity,
  Compass,
  MapPin,
  Mic,
  Settings,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Timer,
  Play,
  Pause,
  AlertOctagon,
  ChevronRight,
  ShieldCheck,
  Zap,
  Smartphone
} from 'lucide-react';
import { StorageService } from '../services/storage.ts';

interface GuardianPageProps {
  onOpenEmergencyModal: () => void;
  onShareLocation: () => void;
  onAlertContact: () => void;
}

export const GuardianPage: React.FC<GuardianPageProps> = ({
  onOpenEmergencyModal,
  onShareLocation,
  onAlertContact,
}) => {
  const [guardianActive, setGuardianActive] = useState<boolean>(() => {
    return localStorage.getItem('safelink_guardian_active') === 'true';
  });

  // Device capability states
  const [hasMotion, setHasMotion] = useState<boolean>(false);
  const [hasOrientation, setHasOrientation] = useState<boolean>(false);
  const [hasGeolocation, setHasGeolocation] = useState<boolean>(false);
  const [hasSpeechRec, setHasSpeechRec] = useState<boolean>(false);
  const [hasWearable, setHasWearable] = useState<boolean>(false);

  // Simulated state
  const [fallSimulated, setFallSimulated] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [alertUnconfirmed, setAlertUnconfirmed] = useState<boolean>(false);

  // Wearable Simulator state
  const [wearableConnected, setWearableConnected] = useState<boolean>(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [unusualHrAlert, setUnusualHrAlert] = useState<boolean>(false);

  // Check device support on load
  useEffect(() => {
    setHasMotion(typeof window !== 'undefined' && 'DeviceMotionEvent' in window);
    setHasOrientation(typeof window !== 'undefined' && 'DeviceOrientationEvent' in window);
    setHasGeolocation(typeof navigator !== 'undefined' && 'geolocation' in navigator);
    setHasSpeechRec(typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window));
    setHasWearable(typeof navigator !== 'undefined' && 'bluetooth' in navigator); // Web Bluetooth used as health device integration signal
  }, []);

  // Sync guardian status
  useEffect(() => {
    localStorage.setItem('safelink_guardian_active', String(guardianActive));
    if (!guardianActive) {
      stopMotionTracking();
    } else {
      startMotionTracking();
    }
  }, [guardianActive]);

  // Handle countdown timer
  useEffect(() => {
    let interval: any = null;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && timerActive) {
      setTimerActive(false);
      setAlertUnconfirmed(true);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const startMotionTracking = () => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      // In a real mobile browser, we ask permission or start listening
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  const stopMotionTracking = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', handleMotion);
    }
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    if (!guardianActive) return;
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    
    // Simple fall detection rule: total acceleration exceeds a high threshold (impact)
    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;
    const totalAcc = Math.sqrt(x*x + y*y + z*z);
    
    if (totalAcc > 25) { // Roughly 2.5G impact
      triggerPossibleFall();
    }
  };

  const triggerPossibleFall = () => {
    if (fallSimulated || alertUnconfirmed) return;
    setFallSimulated(true);
    setCountdown(10);
    setTimerActive(true);
    setAlertUnconfirmed(false);
  };

  const handleImOkay = () => {
    setFallSimulated(false);
    setTimerActive(false);
    setAlertUnconfirmed(false);
  };

  const handleINeedHelp = () => {
    setFallSimulated(false);
    setTimerActive(false);
    setAlertUnconfirmed(false);
    onOpenEmergencyModal();
  };

  // Simulated Wearable Connection
  const handleConnectWearable = () => {
    if (wearableConnected) {
      setWearableConnected(false);
      setHeartRate(null);
      setUnusualHrAlert(false);
    } else {
      setWearableConnected(true);
      setHeartRate(72);
      // Simulate random fluctuations
      const hrInterval = setInterval(() => {
        setHeartRate((prev) => {
          if (prev === null) {
            clearInterval(hrInterval);
            return null;
          }
          const change = Math.floor(Math.random() * 7) - 3;
          const next = prev + change;
          // Guard heart rate range
          return next > 60 && next < 100 ? next : 75;
        });
      }, 4000);
    }
  };

  // Simulated unusual spike for demonstrating triage/guidance (Part 5)
  const triggerUnusualHeartRate = () => {
    if (!wearableConnected) return;
    setHeartRate(145);
    setUnusualHrAlert(true);
  };

  const getSeverityBadge = (status: boolean) => {
    return status ? (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        🟢 Supported
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
        ⚪ Unavailable
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300" id="guardian-page">
      {/* Disclaimer Eye-brow banner */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed font-semibold flex items-start gap-2.5 shadow-2xs">
        <span className="text-sm">🛡️</span>
        <div>
          <span className="font-extrabold uppercase text-[10px] text-blue-700 tracking-wider block">Assistive Safety Tool Notification</span>
          Safe-Link Guardian is an assistive sensor-alert tool and is **not a medical device**. It does not diagnose medical conditions, and sensor streams may be incomplete. Do not rely on mobile sensors to detect life-threatening cardiac symptoms.
        </div>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-slate-900 text-amber-400 font-bold text-xs uppercase px-2 py-0.5 rounded">
            <span>Guardian Shield</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-950">
            Safe-Link Guardian™ Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Harness available mobile accelerometers, safety signals, and smart connections to automatically alert contacts of unusual fall-like impacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {guardianActive ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>🟢 ACTIVE</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-black text-xs flex items-center gap-1">
              <span>⚪ PAUSED</span>
            </span>
          )}
        </div>
      </div>

      {/* Primary Action Panel */}
      <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <h2 className="text-base sm:text-lg font-black text-slate-950 font-display">
            Activate Automated Impact Alerts
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            When enabled, Safe-Link AI monitors device motion in the background. Sudden high-g drops initiate a countdown dialog before triggering contact alerts.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {!guardianActive ? (
              <button
                onClick={() => setGuardianActive(true)}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>START GUARDIAN SYSTEM</span>
              </button>
            ) : (
              <button
                onClick={() => setGuardianActive(false)}
                className="px-5 py-2.5 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 font-black text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE GUARDIAN ACTIVE STATE</span>
              </button>
            )}
            
            {guardianActive && (
              <button
                onClick={triggerPossibleFall}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Impact G-Force</span>
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sensory Signal Status
          </div>
          <div className="space-y-1.5 text-[11px] font-medium text-slate-700">
            <div className="flex items-center justify-between">
              <span>📱 Motion Sensor</span>
              <span>{getSeverityBadge(hasMotion)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>🧭 Orientation</span>
              <span>{getSeverityBadge(hasOrientation)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>📍 Geolocation</span>
              <span>{getSeverityBadge(hasGeolocation)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>🎙️ Voice Listener</span>
              <span>{getSeverityBadge(hasSpeechRec)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fall Alerts Dialog / Counter */}
      {fallSimulated && (
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-3xl shadow-lg space-y-4 animate-in zoom-in duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 tracking-wide uppercase border border-amber-200">
                Possible fall-like event detected
              </span>
              <h3 className="text-lg font-black text-slate-950 font-display">
                ⚠️ ARE YOU OKAY?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Safe-Link AI detected a sudden impact acceleration. If you do not respond, we will present emergency contact and location options.
              </p>
            </div>
          </div>

          {/* Countdown timer */}
          {timerActive && (
            <div className="p-3 bg-white/70 rounded-xl border border-amber-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Timer className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Auto-resolution response window closing in:</span>
              </span>
              <span className="text-xl font-mono font-black text-red-600">
                {countdown}s
              </span>
            </div>
          )}

          {/* User Confirmation actions (Part 4) */}
          <div className="flex flex-wrap gap-2 pt-2 justify-end">
            <button
              onClick={handleImOkay}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition"
            >
              🟢 I'M OKAY
            </button>

            <button
              onClick={handleINeedHelp}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs transition"
            >
              🆘 I NEED HELP
            </button>

            <button
              onClick={onAlertContact}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-extrabold text-xs rounded-xl transition"
            >
              ALERT CONTACTS
            </button>
          </div>
        </div>
      )}

      {/* Unconfirmed Alert options */}
      {alertUnconfirmed && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-3xl shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-black text-red-950 font-display">
                Emergency Response Has Not Been Confirmed
              </h3>
              <p className="text-xs text-red-800 leading-relaxed font-semibold">
                No confirmation signal was logged. Use the options below immediately to alert first responders or campus security.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href="tel:112"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center gap-1 shadow-sm"
            >
              📞 CALL 112
            </a>
            <button
              onClick={onAlertContact}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl"
            >
              ALERT SOS CONTACT
            </button>
            <button
              onClick={onShareLocation}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl"
            >
              SHARE LOCAL COORDINATES
            </button>
            <button
              onClick={handleImOkay}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Heart Rate integration (Part 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Connected Wearable / Pulse integration card */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Connect Wearable Health Device</span>
            </h3>

            <button
              onClick={handleConnectWearable}
              className={`px-3 py-1 rounded-lg font-bold text-[10px] transition ${
                wearableConnected
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {wearableConnected ? 'DISCONNECT' : 'CONNECT VIA BLE'}
            </button>
          </div>

          {wearableConnected ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Current Heart Rate
                  </div>
                  <div className="text-2xl font-mono font-black text-slate-950 flex items-baseline gap-1">
                    <span>{heartRate}</span>
                    <span className="text-xs text-slate-400">BPM</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Source Protocol
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    Simulated Wearable Band
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={triggerUnusualHeartRate}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold hover:bg-amber-100 transition"
                >
                  Simulate High HR Spike (145 BPM)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>No health device connected. Connect to log simulated pulse data.</span>
            </div>
          )}

          {unusualHrAlert && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-950 space-y-2.5">
              <div className="font-extrabold flex items-center gap-1">
                <span>⚠️</span>
                <span>Unusual heart-rate reading may require attention</span>
              </div>
              <p className="leading-relaxed font-semibold">
                An elevated heart rate of 145 BPM was logged. If you feel symptoms like chest pressure, severe breathing struggles, or dizziness, seek immediate professional medical attention.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onOpenEmergencyModal}
                  className="px-3 py-1 bg-red-600 text-white font-bold text-[10px] rounded"
                >
                  GET EMERGENCY HELP
                </button>
                <button
                  onClick={() => setUnusualHrAlert(false)}
                  className="px-3 py-1 bg-white border border-slate-200 text-slate-700 font-semibold text-[10px] rounded"
                >
                  DISMISS
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Responsible AI Compliance Block */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Responsible AI Compliance Center</span>
          </h3>

          <div className="text-[11px] text-slate-600 space-y-2 leading-relaxed">
            <p>
              ● <strong>Assistive Limits:</strong> Sensor signals, accelerometers, and optical streams can be inaccurate or incomplete depending on device status.
            </p>
            <p>
              ● <strong>Zero Diagnosis:</strong> Safe-Link AI provides real-time containment suggestions and coordination pathways. It does not diagnose medical conditions.
            </p>
            <p>
              ● <strong>Professional Authority:</strong> Always prioritize calling 112 or relying on trained campus medical personnel for serious health situations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
