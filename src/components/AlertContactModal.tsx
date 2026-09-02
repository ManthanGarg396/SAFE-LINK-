import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Send,
  MessageSquare,
  Mail,
  Copy,
  Check,
  X,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { EmergencyContact } from '../types.ts';
import { StorageService } from '../services/storage.ts';
import { LocationService, GeoCoordinates } from '../services/locationService.ts';

interface AlertContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  situationTitle?: string;
  severity?: string;
  summaryText?: string;
}

export const AlertContactModal: React.FC<AlertContactModalProps> = ({
  isOpen,
  onClose,
  situationTitle = 'Campus Health Emergency',
  severity = 'HIGH',
  summaryText = 'The user may require assistance on campus.',
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [copiedAlert, setCopiedAlert] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      StorageService.getContacts().then((stored) => {
        setContacts(stored);
        // Select all primary contacts by default
        const primaries = stored.filter((c) => c.isPrimary).map((c) => c.id);
        setSelectedContactIds(primaries.length > 0 ? primaries : stored.map((c) => c.id));
      });


      LocationService.getCurrentLocation().then(setCoords).catch(console.warn);
      setDispatchStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generatedAlertText = `🚨 SAFE-LINK AI EMERGENCY ALERT
===============================
Situation: ${situationTitle}
Risk Level: ${severity}
Time: ${new Date().toLocaleTimeString()} (${new Date().toLocaleDateString()})
Location: ${coords?.campusZone || 'Campus Premises'}
GPS Coords: ${coords ? LocationService.formatCoordinates(coords) : 'Available via app'}
Map: ${coords ? LocationService.getGoogleMapsUrl(coords) : ''}

AI Summary:
${summaryText}
${customNote ? `\nUser Note: ${customNote}` : ''}

(Dispatched via Safe-Link AI Multimodal Campus Safety)`;

  const toggleSelectContact = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((cId) => cId !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedAlertText);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 3000);
  };

  const handleSendViaWhatsApp = () => {
    const selected = contacts.filter((c) => selectedContactIds.includes(c.id));
    const firstPhone = selected[0]?.phone.replace(/[^0-9]/g, '') || '';
    const encoded = encodeURIComponent(generatedAlertText);
    const url = firstPhone ? `https://wa.me/${firstPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
    setDispatchStatus(`WhatsApp alert opened for ${selected.length} recipient(s).`);
  };

  const handleSendViaSMS = () => {
    const selected = contacts.filter((c) => selectedContactIds.includes(c.id));
    const firstPhone = selected[0]?.phone.replace(/[^0-9]/g, '') || '';
    const encoded = encodeURIComponent(generatedAlertText);
    window.location.href = `sms:${firstPhone}?body=${encoded}`;
    setDispatchStatus(`SMS message drafted for native mobile messaging.`);
  };

  const handleSimulateDispatch = () => {
    const selected = contacts.filter((c) => selectedContactIds.includes(c.id));
    setDispatchStatus(`✅ Alert simulated & logged! Notified ${selected.length} designated contact(s).`);
  };

  return (
    <div
      id="alert-contact-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <BellRing className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight">Alert Designated Contacts</h2>
              <p className="text-xs text-blue-100">
                Notify parent, guardian, warden, or friend with live incident details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Target Contacts Select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Recipients ({selectedContactIds.length}/{contacts.length})
              </label>
              <button
                onClick={() =>
                  setSelectedContactIds(
                    selectedContactIds.length === contacts.length ? [] : contacts.map((c) => c.id)
                  )
                }
                className="text-[11px] text-blue-600 font-semibold hover:underline"
              >
                {selectedContactIds.length === contacts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {contacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);
                return (
                  <button
                    key={contact.id}
                    onClick={() => toggleSelectContact(contact.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start justify-between transition text-xs ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{contact.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{contact.phone}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-white rounded text-[9px] text-slate-600 border border-slate-200">
                        {contact.relationship}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Note input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Add Personal Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. I am in Room 204 with Professor Anita..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Generated Alert Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Generated Alert Message
              </label>
              <button
                onClick={handleCopy}
                className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline"
              >
                {copiedAlert ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAlert ? 'Copied to clipboard!' : 'Copy message text'}</span>
              </button>
            </div>

            <textarea
              readOnly
              rows={4}
              value={generatedAlertText}
              className="w-full p-2.5 text-[11px] font-mono rounded-lg bg-slate-900 text-slate-100 border border-slate-700 resize-none"
            />
          </div>

          {dispatchStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{dispatchStatus}</span>
            </div>
          )}

          {/* Dispatch Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleSendViaWhatsApp}
              disabled={selectedContactIds.length === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleSendViaSMS}
              disabled={selectedContactIds.length === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>SMS Dispatch</span>
            </button>

            <button
              onClick={handleSimulateDispatch}
              disabled={selectedContactIds.length === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Log & Confirm</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
          <span>Safe mock notification system (Demo ready)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
