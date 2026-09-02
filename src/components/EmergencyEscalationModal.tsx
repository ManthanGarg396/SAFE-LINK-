import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Shield,
  HeartPulse,
  Flame,
  MapPin,
  Share2,
  Copy,
  Check,
  X,
  BellRing,
  AlertOctagon,
  ExternalLink,
} from 'lucide-react';
import { LocationService, GeoCoordinates } from '../services/locationService.ts';

interface EmergencyEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAlertModal: () => void;
  initialSeverity?: string;
  contextSummary?: string;
}

export const EmergencyEscalationModal: React.FC<EmergencyEscalationModalProps> = ({
  isOpen,
  onClose,
  onOpenAlertModal,
  initialSeverity = 'CRITICAL',
  contextSummary = 'Emergency assistance requested via Safe-Link AI.',
}) => {
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [callInitiated, setCallInitiated] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingLoc(true);
      LocationService.getCurrentLocation()
        .then((loc) => {
          setCoords(loc);
          setIsLoadingLoc(false);
        })
        .catch(() => setIsLoadingLoc(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLocation = () => {
    if (!coords) return;
    const text = `🚨 EMERGENCY LOCATION ALERT\nZone: ${coords.campusZone}\nCoords: ${LocationService.formatCoordinates(
      coords
    )}\nMap: ${LocationService.getGoogleMapsUrl(coords)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 3000);
  };

  const handleShareLocation = async () => {
    if (!coords) return;
    const shareData = {
      title: 'Safe-Link AI — Emergency Alert',
      text: `🚨 URGENT CAMPUS ASSISTANCE NEEDED\nLocation: ${coords.campusZone}\nCoords: ${LocationService.formatCoordinates(
        coords
      )}`,
      url: LocationService.getGoogleMapsUrl(coords),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyLocation();
      }
    } else {
      handleCopyLocation();
    }
  };

  const handleDial = (number: string, label: string) => {
    setCallInitiated(`Connecting to ${label} (${number})...`);
    window.location.href = `tel:${number.replace(/\s+/g, '')}`;
    setTimeout(() => setCallInitiated(null), 6000);
  };

  return (
    <div
      id="emergency-escalation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border-2 border-red-500 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Urgent Header */}
        <div className="bg-red-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight leading-tight">
                URGENT EMERGENCY ACTION
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Immediate Response • Dial directly or notify contacts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Situation Context Notice */}
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-900 flex items-start gap-2.5">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-bold text-red-800">
                Safety Priority: Professional Responders First
              </div>
              <p className="mt-0.5 text-red-700">
                If someone is unconscious, severely bleeding, in respiratory distress, or in an active fire/chemical hazard, call emergency services immediately without delay.
              </p>
            </div>
          </div>

          {callInitiated && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 flex items-center justify-between">
              <span>📞 {callInitiated}</span>
              <span className="text-[10px] text-amber-700">(Triggering native dialer)</span>
            </div>
          )}

          {/* Primary 1-Touch Dial Buttons */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Direct Dial Emergency Hotlines
            </div>

            {/* National 112 Button */}
            <button
              id="call-112-btn"
              onClick={() => handleDial('112', '112 National Emergency')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 transition transform hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-base tracking-wide">CALL 112 (National Emergency)</div>
                  <div className="text-xs text-red-100 font-normal">Police • Medical Ambulance • Fire Services</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-white text-red-600 text-xs font-mono font-extrabold">
                DIAL NOW
              </span>
            </button>

            {/* Campus Security */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="call-campus-security-btn"
                onClick={() => handleDial('+91 11 2345 6789', 'Campus Security Control')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition text-left"
              >
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold">Campus Security HQ</div>
                  <div className="text-[11px] text-slate-300 font-mono">+91 11 2345 6789</div>
                </div>
              </button>

              <button
                id="call-campus-medical-btn"
                onClick={() => handleDial('+91 11 2345 6790', 'Campus Health Center')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition text-left"
              >
                <HeartPulse className="w-4 h-4 text-emerald-200 shrink-0" />
                <div>
                  <div className="font-bold">Campus Clinic (24x7)</div>
                  <div className="text-[11px] text-emerald-100 font-mono">+91 11 2345 6790</div>
                </div>
              </button>
            </div>
          </div>

          {/* Alert Emergency Contact CTA */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Designated Safety Contacts
            </div>
            <button
              id="open-alert-contact-modal-btn"
              onClick={() => {
                onClose();
                onOpenAlertModal();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <BellRing className="w-5 h-5 text-amber-300 animate-bounce" />
                <div className="text-left">
                  <div>ALERT EMERGENCY CONTACTS</div>
                  <div className="text-xs text-blue-100 font-normal">
                    Dispatches instant SMS / WhatsApp with GPS Coordinates
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium underline">Configure & Send →</span>
            </button>
          </div>

          {/* Live GPS Coordinates Box */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Current Location for Responders
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{isLoadingLoc ? 'Detecting GPS...' : coords?.campusZone || 'Main Campus'}</span>
                </div>
                {coords?.accuracy && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Accurate to ±{coords.accuracy}m
                  </span>
                )}
              </div>

              {coords && (
                <div className="font-mono text-slate-600 bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                  <span>{LocationService.formatCoordinates(coords)}</span>
                  <a
                    href={LocationService.getGoogleMapsUrl(coords)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCopyLocation}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition"
                >
                  {copiedCoords ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Coordinates</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareLocation}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Share Location</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition"
          >
            Close Action Window
          </button>
        </div>
      </div>
    </div>
  );
};
