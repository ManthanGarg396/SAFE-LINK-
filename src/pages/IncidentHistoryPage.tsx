import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Trash2,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { IncidentHistoryItem, EmergencySeverity } from '../types.ts';
import { StorageService } from '../services/storage.ts';

export const IncidentHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<IncidentHistoryItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentHistoryItem | null>(null);

  useEffect(() => {
    StorageService.getHistory().then(setHistory);
  }, []);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your local incident history?')) {
      await StorageService.clearHistory();
      setHistory([]);
      setSelectedIncident(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const updated = await StorageService.deleteHistoryItem(id);
    setHistory(updated);
    if (selectedIncident?.id === id) {
      setSelectedIncident(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `safelink_incidents_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportText = () => {
    const textLines = history.map(
      (item, idx) =>
        `INCIDENT #${idx + 1}\nTitle: ${item.title}\nSeverity: ${item.severity}\nTime: ${new Date(
          item.timestamp
        ).toLocaleString()}\nLocation: ${item.location || 'Campus'}\nSummary: ${item.inputSummary}\nActions: ${item.immediateActions.join(
          ', '
        )}\n----------------------------------------\n`
    );
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textLines.join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `safelink_report_${Date.now()}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSeverityBadge = (severity: EmergencySeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MODERATE':
        return 'bg-amber-500 text-white';
      case 'LOW':
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>Local Incident Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Incident Activity History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Records of first-aid responses and safety analyses saved locally on this device.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Export Text</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Clear all history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* History Items or Empty State */}
      {history.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-700">No Incidents Logged Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you analyze emergencies in the AI Assistant or file hazard reports, you can save them here for documentation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of Incidents */}
          <div className="lg:col-span-6 space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedIncident(item)}
                className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs space-y-2 ${
                  selectedIncident?.id === item.id
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getSeverityBadge(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="text-slate-300 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>

                <p className="text-xs text-slate-500 line-clamp-2">{item.inputSummary}</p>

                {item.location && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Incident Detail Card (Right) */}
          <div className="lg:col-span-6">
            {selectedIncident ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4 sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(
                        selectedIncident.severity
                      )}`}
                    >
                      {selectedIncident.severity}
                    </span>
                    <h2 className="text-base font-bold font-display text-slate-900 mt-1">
                      {selectedIncident.title}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {new Date(selectedIncident.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Incident Description
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedIncident.inputSummary}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Immediate Actions Followed
                  </div>
                  <ul className="space-y-1">
                    {selectedIncident.immediateActions.map((act, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedIncident.avoidances?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">
                      Avoided Harmful Steps
                    </div>
                    <ul className="space-y-1">
                      {selectedIncident.avoidances.map((avoid, idx) => (
                        <li key={idx} className="text-xs text-rose-900 flex items-start gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{avoid}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center text-xs text-slate-400">
                Select an incident from the list to view its complete safety steps and history.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
