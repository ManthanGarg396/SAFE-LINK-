import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  AlertTriangle,
  Megaphone,
  CheckCircle2,
  Clock,
  MapPin,
  Trash2,
  Copy,
  Printer,
  Sparkles,
  BarChart,
  Filter,
  Check
} from 'lucide-react';
import { HazardReport, EmergencySeverity } from '../types.ts';
import { StorageService } from '../services/storage.ts';

export const AdminDashboardPage: React.FC = () => {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [broadcastType, setBroadcastType] = useState<string>('fire');
  const [customBroadcast, setCustomBroadcast] = useState<string>('');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');

  useEffect(() => {
    StorageService.getHazards().then((data) => {
      setReports(data);
      if (data.length > 0) {
        setSelectedReport(data[0]);
      }
    });
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: HazardReport['status']) => {
    const updated = reports.map((r) => {
      if (r.id === id) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    setReports(updated);
    if (selectedReport?.id === id) {
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
    // Sync with local storage
    localStorage.setItem('safelink_hazards', JSON.stringify(updated));
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this safety report log?')) {
      const updated = reports.filter((r) => r.id !== id);
      setReports(updated);
      setSelectedReport(updated.length > 0 ? updated[0] : null);
      localStorage.setItem('safelink_hazards', JSON.stringify(updated));
    }
  };

  const handleSendBroadcast = () => {
    let alertMessage = '';
    switch (broadcastType) {
      case 'fire':
        alertMessage = '🚨 EMERGENCY EVACUATION WARNING: Small localized flame reported in Chemistry Block corridor. Please vacate the zone calmly and assemble at Quadrangle A.';
        break;
      case 'chemical':
        alertMessage = '⚠️ HAZARDOUS CHEMICAL SPILL: Concentrated organic solvents detected leaking in Chemistry Lab 204. Authorized personnel containing now. Avoid Room 204 and surrounding hallways.';
        break;
      case 'weather':
        alertMessage = '⛈️ SEVERE WEATHER BROADCAST: Highly localized wind gusts and rapid cloudburst warning. Stay indoors, secure laboratory ventilation hoods, and avoid open outdoor platforms.';
        break;
      case 'security':
        alertMessage = '🛡️ SECURITY NOTICE: Minor infrastructure issue at Gate 2 under maintenance review. Use Main Gate 1 for all student access and transport drops.';
        break;
      default:
        alertMessage = customBroadcast || '🚨 CAMPUS SECURITY ALERT: High-priority responder monitoring in progress.';
    }

    localStorage.setItem('safelink_global_broadcast', alertMessage);
    localStorage.setItem('safelink_global_broadcast_time', Date.now().toString());
    setBroadcastSent(true);
    setCustomBroadcast('');
    setTimeout(() => setBroadcastSent(false), 5000);

    // Trigger storage event so Home Page updates immediately
    window.dispatchEvent(new Event('storage'));
  };

  const handleClearBroadcast = () => {
    localStorage.removeItem('safelink_global_broadcast');
    localStorage.removeItem('safelink_global_broadcast_time');
    window.dispatchEvent(new Event('storage'));
    alert('Active global announcement cleared successfully.');
  };

  const handleGenerateSummary = () => {
    if (!selectedReport) return;
    const summary = `🚨 SAFE-LINK AI OFFICIAL INCIDENT REPORT SUMMARY
==================================================
Report ID: ${selectedReport.id.toUpperCase()}
Timestamp: ${new Date(selectedReport.timestamp).toLocaleString()}
Incident Category: ${selectedReport.category.toUpperCase()}
Reported Severity: ${selectedReport.severity}
Current Resolution Status: ${selectedReport.status.toUpperCase()}
Primary Location: ${selectedReport.location}

Incident Overview Details:
${selectedReport.description}

Responders Prompt Intervention & Safety Actions:
${selectedReport.aiSuggestedAction || 'Monitor parameters regularly and maintain distance.'}

Report Logged By: ${selectedReport.reportedBy || 'Student Patrol Monitor'}
Authorized Action Verified By: Campus Security Control Center`;

    setGeneratedSummary(summary);
  };

  const handleCopySummary = () => {
    if (!generatedSummary) return;
    navigator.clipboard.writeText(generatedSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Incident Report Summary</title></head><body style="font-family: monospace; white-space: pre; padding: 24px;">${generatedSummary}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredReports = reports.filter((r) => {
    const statusMatch = filterStatus === 'ALL' || r.status === filterStatus;
    const severityMatch = filterSeverity === 'ALL' || r.severity === filterSeverity;
    return statusMatch && severityMatch;
  });

  // Calculate metrics
  const activeEmergencies = reports.filter((r) => r.severity === 'CRITICAL' && r.status !== 'Resolved').length;
  const openHazards = reports.filter((r) => r.status !== 'Resolved').length;
  const resolvedHazards = reports.filter((r) => r.status === 'Resolved').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300" id="admin-dashboard-page">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Security Command Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Campus Safety & Incident Control Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review emergency and physical hazard logs, update action workflows, and issue real-time critical broadcasts onto student devices.
        </p>
      </div>

      {/* Overview Metrics Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl shrink-0">
            🚨
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Critical Threats
            </div>
            <div className="text-2xl font-extrabold text-slate-950 font-mono">
              {activeEmergencies}
            </div>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            ⚠️
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Open Hazard Alerts
            </div>
            <div className="text-2xl font-extrabold text-slate-950 font-mono">
              {openHazards}
            </div>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            ✅
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Resolved Reports
            </div>
            <div className="text-2xl font-extrabold text-slate-950 font-mono">
              {resolvedHazards}
            </div>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            📊
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Safety Score Rating
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono">
              98.4%
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Broadcast Panel */}
      <section className="p-5 sm:p-6 rounded-2xl bg-slate-900 text-white shadow-lg space-y-4">
        <h2 className="text-base font-extrabold font-display tracking-tight flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-400 animate-bounce" />
          <span>Issue Global Emergency Campus Broadcast</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              1. Preset Emergency Alert
            </label>
            <div className="space-y-1.5 text-xs text-slate-300">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 cursor-pointer">
                <input
                  type="radio"
                  name="btype"
                  value="fire"
                  checked={broadcastType === 'fire'}
                  onChange={() => setBroadcastType('fire')}
                />
                <span>🔥 Fire Evacuation</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 cursor-pointer">
                <input
                  type="radio"
                  name="btype"
                  value="chemical"
                  checked={broadcastType === 'chemical'}
                  onChange={() => setBroadcastType('chemical')}
                />
                <span>🧪 Toxic Chemical Leak</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 cursor-pointer">
                <input
                  type="radio"
                  name="btype"
                  value="weather"
                  checked={broadcastType === 'weather'}
                  onChange={() => setBroadcastType('weather')}
                />
                <span>⛈️ Severe Weather / Storm</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 cursor-pointer">
                <input
                  type="radio"
                  name="btype"
                  value="security"
                  checked={broadcastType === 'security'}
                  onChange={() => setBroadcastType('security')}
                />
                <span>🛡️ Gate Closure / Security Notice</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                2. Custom Alert Text Override (Or preview preset alert message)
              </label>
              <textarea
                rows={3}
                value={customBroadcast}
                onChange={(e) => {
                  setBroadcastType('custom');
                  setCustomBroadcast(e.target.value);
                }}
                placeholder="Type custom broadcast warning description..."
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleClearBroadcast}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-extrabold text-xs transition"
              >
                Clear Current Alert
              </button>

              <button
                onClick={handleSendBroadcast}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5 shrink-0" />
                <span>BROADCAST LIVE ANNOUNCEMENT</span>
              </button>
            </div>
          </div>
        </div>

        {broadcastSent && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-bold flex items-center gap-2 animate-in fade-in">
            <span>● BROADCAST DISPATCHED: Safety broadcast successfully active across all campus client view devices.</span>
          </div>
        )}
      </section>

      {/* Layout Grid: Safety Logs List + Incident Workflow Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reports Index List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-4.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Safety Report Logs ({filteredReports.length})
              </h2>

              <div className="flex items-center gap-1">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2 py-1 bg-slate-100 border-none rounded text-[10px] font-bold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">Status: All</option>
                  <option value="Reported">Reported</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredReports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedReport(r);
                    setGeneratedSummary('');
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition text-xs ${
                    selectedReport?.id === r.id
                      ? 'border-slate-900 bg-slate-50 font-bold'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="text-xl">
                    {r.category === 'Electrical'
                      ? '⚡'
                      : r.category === 'Chemical'
                      ? '🧪'
                      : r.category === 'Fire'
                      ? '🔥'
                      : '⚠️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-slate-900 truncate">{r.category}</span>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {new Date(r.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{r.description}</p>
                    <div className="flex items-center justify-between gap-1 mt-2">
                      <span className="text-[10px] font-mono text-slate-400">{r.location}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          r.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Incident Control Console */}
        <div className="lg:col-span-7">
          {selectedReport ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white font-mono uppercase">
                      ID: {selectedReport.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Reported by {selectedReport.reportedBy || 'Student'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-display text-slate-900">
                    {selectedReport.category} Observation Alert
                  </h3>
                </div>

                {/* State Transition buttons */}
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Transition Resolution Status
                  </span>
                  <div className="flex flex-wrap items-center gap-1 mt-1 justify-end">
                    {(['Reviewing', 'Assigned', 'In Progress', 'Resolved'] as HazardReport['status'][]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(selectedReport.id, st)}
                          className={`px-2 py-1 rounded text-[10px] font-extrabold transition border ${
                            selectedReport.status === st
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Location Zone</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{selectedReport.location}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Severity Risk</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="text-sm">⚠️</span>
                    <span>{selectedReport.severity} RISK LEVEL</span>
                  </div>
                </div>
              </div>

              {/* Description Details */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Observations Detail</span>
                <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed font-medium">
                  {selectedReport.description}
                </p>
              </div>

              {/* AI Guidance Suggestions */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">AI Containment Recommendations</span>
                <p className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 font-semibold leading-relaxed">
                  {selectedReport.aiSuggestedAction || 'No primary actions configured. Please check visual scanners.'}
                </p>
              </div>

              {/* Actions & Report Summary (Part 15) */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handleDeleteReport(selectedReport.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-extrabold text-xs flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Log</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateSummary}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Generate AI Report Summary</span>
                  </button>
                </div>
              </div>

              {/* Report Summary Display */}
              {generatedSummary && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Prepared Incident Summary (Ready for Printing/Filing)
                    </span>
                    <div className="flex gap-1.5 text-xs">
                      <button
                        onClick={handleCopySummary}
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1 transition"
                      >
                        {copiedSummary ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1 transition"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-3 bg-white rounded border border-slate-200 text-[10px] font-mono leading-relaxed text-slate-700 whitespace-pre-wrap overflow-x-auto">
                    {generatedSummary}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs">
              <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
              <span>No incident reports loaded in memory database.</span>
            </div>
          )}
        </div>
      </div>

      {/* Safety Analytics Section (Part 14) */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold font-display tracking-tight text-slate-950 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-indigo-600" />
              <span>Interactive Safety Diagnostics & Hotspots</span>
            </h2>
            <p className="text-xs text-slate-500">
              Response trend and physical hazard density across North Campus zones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hazard Categories distribution chart using pristine CSS/SVG bars */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Physical Hazard Distribution by Category
            </h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>⚡ Electrical / Wiring Hazards</span>
                  <span className="font-bold text-slate-900">42% (High Frequency)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>🧪 Chemical & Solvent Spills</span>
                  <span className="font-bold text-slate-900">24%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>💧 Slip, Trip & Fall Obstructions</span>
                  <span className="font-bold text-slate-900">18%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>🔥 Combustible Materials / Fire Risks</span>
                  <span className="font-bold text-slate-900">11%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '11%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>🧱 Structural & Broken Elements</span>
                  <span className="font-bold text-slate-900">5%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Hotspots mapping */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Reported Hotspot Densities (Zone Monitoring)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🔬</span>
                  <div>
                    <div className="font-bold text-slate-900">Science Labs Block C</div>
                    <div className="text-[10px] text-slate-500">Primarily Chemical Spills & Equipment issues</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-md">
                  24 Reports
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">⚙️</span>
                  <div>
                    <div className="font-bold text-slate-900">Engineering North Workshop</div>
                    <div className="text-[10px] text-slate-500">Primarily Electrical Sparks & Exposed cables</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-md">
                  18 Reports
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🍔</span>
                  <div>
                    <div className="font-bold text-slate-900">Central Dining Ramp Area</div>
                    <div className="text-[10px] text-slate-500">Primarily Slippery Ramp / Obstruction risks</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md">
                  12 Reports
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
