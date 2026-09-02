import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  FileWarning,
  Sparkles,
  MapPin,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  Send,
  Building2,
  Filter,
} from 'lucide-react';
import { HazardReport, LanguageCode, EmergencySeverity } from '../types.ts';
import { requestHazardAnalysis } from '../services/apiClient.ts';
import { StorageService } from '../services/storage.ts';
import { LocationService, GeoCoordinates } from '../services/locationService.ts';

interface HazardVisionPageProps {
  currentLanguage: LanguageCode;
  onOpenEmergencyModal: () => void;
  initialPreset?: {
    category: string;
    description: string;
    photoUrl?: string;
  };
}

export const HazardVisionPage: React.FC<HazardVisionPageProps> = ({
  currentLanguage,
  onOpenEmergencyModal,
  initialPreset,
}) => {
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [description, setDescription] = useState(initialPreset?.description || '');
  const [category, setCategory] = useState<HazardReport['category']>(
    (initialPreset?.category as HazardReport['category']) || 'Electrical'
  );
  const [locationStr, setLocationStr] = useState('Engineering Block North — Workshop Entrance Door 2');
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [hazardsList, setHazardsList] = useState<HazardReport[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('ALL');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    StorageService.getHazards().then(setHazardsList);
    LocationService.getCurrentLocation().then(setCoords).catch(console.warn);

    if (initialPreset) {
      setDescription(initialPreset.description);
      setCategory(initialPreset.category as any);
    }
  }, [initialPreset]);

  const hazardPresets = [
    {
      title: '⚡ Exposed High-Voltage Wires',
      cat: 'Electrical' as const,
      desc: 'Severely frayed copper cable hanging from conduit near student pathway.',
      loc: 'Engineering Block North, Workshop Entrance',
    },
    {
      title: '🧪 Chemical Acid Spill',
      cat: 'Chemical' as const,
      desc: 'Solvent puddle with pungent vapors leaking from storage cabinet.',
      loc: 'Science Block C, Chemistry Lab 204',
    },
    {
      title: '💧 Wet Slippery Cafeteria Ramp',
      cat: 'Slip/Fall' as const,
      desc: 'Mossy wet surface on concrete access ramp causing slip hazards.',
      loc: 'Central Dining Hall, Ramp A',
    },
    {
      title: '🔥 Blocked Fire Exit Stairwell',
      cat: 'Fire' as const,
      desc: 'Discarded furniture and boxes obstructing primary fire exit door.',
      loc: 'Auditorium West Stairwell',
    },
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

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await requestHazardAnalysis({
        image: selectedImage || undefined,
        description,
        category,
        location: locationStr,
        language: currentLanguage,
      });
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitReport = async () => {
    const newReport = await StorageService.addHazard({
      description,
      category,
      location: locationStr,
      severity: aiAnalysis?.severity || ('HIGH' as EmergencySeverity),
      aiSuggestedAction: aiAnalysis?.immediate_safety_actions?.join(' ') || 'Reported to campus safety desk.',
      reportedBy: 'Student Safety Patrol (Self)',
    });

    StorageService.getHazards().then(setHazardsList);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  const filteredHazards =
    filterCat === 'ALL' ? hazardsList : hazardsList.filter((h) => h.category === filterCat);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-bold text-xs uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5 text-amber-600" />
          <span>Multimodal Hazard Vision</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Campus Hazard Scanner & Reporting Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload a photo of damaged infrastructure, chemical spills, or safety risks. Gemini AI identifies hazards and suggests containment steps.
        </p>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Demo Hazard Presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {hazardPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCategory(preset.cat);
                setDescription(preset.desc);
                setLocationStr(preset.loc);
              }}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition text-xs space-y-1"
            >
              <div className="font-bold text-slate-900">{preset.title}</div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Scanner & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Photo & Description */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold font-display text-slate-900">
            Submit Hazard Observation
          </h2>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hazard Photo / Camera Capture
            </label>

            {selectedImage ? (
              <div className="relative rounded-xl border-2 border-dashed border-slate-300 p-2 bg-slate-50 text-center">
                <img
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`}
                  alt="Hazard preview"
                  className="max-h-48 mx-auto rounded-lg object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 p-1 rounded-full bg-slate-900 text-white hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 p-6 bg-slate-50/70 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Click to capture or upload photo</span>
                <span className="text-[11px] text-slate-400">JPG, PNG, WebP supported</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Category Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hazard Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="Electrical">⚡ Electrical / Wiring</option>
                <option value="Fire">🔥 Fire / Flammable Risk</option>
                <option value="Chemical">🧪 Chemical / Toxic Spill</option>
                <option value="Slip/Fall">💧 Slip / Trip / Fall</option>
                <option value="Structural">🧱 Structural / Broken Glass</option>
                <option value="Laboratory">🔬 Laboratory Equipment</option>
                <option value="Security">🛡️ Campus Security / Door Issue</option>
                <option value="Other">⚠️ Other Safety Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus Location / Room
              </label>
              <input
                type="text"
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                placeholder="e.g. Science Block C, Room 204"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Observations & Visual Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hazard (e.g. sparks, dripping liquid, exposed live terminals, smell)..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* GPS Coordinates Tag */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>
                GPS: {coords ? LocationService.formatCoordinates(coords) : 'Detecting...'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Auto-tagged</span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing || (!description && !selectedImage)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini Vision Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Run AI Vision Analysis</span>
                </>
              )}
            </button>

            <button
              onClick={handleSubmitReport}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit to Campus Desk</span>
            </button>
          </div>

          {isSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Hazard report logged successfully and queued for maintenance dispatch!</span>
            </div>
          )}
        </div>

        {/* Right Output: AI Vision Analysis Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>AI Vision Analysis</span>
              </h2>
              {aiAnalysis && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    aiAnalysis.severity === 'CRITICAL'
                      ? 'bg-red-600 text-white'
                      : aiAnalysis.severity === 'HIGH'
                      ? 'bg-orange-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {aiAnalysis.severity} RISK
                </span>
              )}
            </div>

            {aiAnalysis ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Detected Hazard
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {aiAnalysis.hazard_type || 'Identified Hazard'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Immediate Safety Containment
                  </div>
                  <ul className="mt-1 space-y-1">
                    {aiAnalysis.immediate_safety_actions?.map((act: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-950">
                  <div className="font-bold text-[11px] uppercase text-rose-800">
                    Strict Avoidance
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {aiAnalysis.do_not?.map((dn: string, idx: number) => (
                      <li key={idx}>✕ {dn}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                  <span className="font-bold text-slate-800">Responsible Dept: </span>
                  <span>{aiAnalysis.reporting_recommendation || 'Campus Facilities'}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <FileWarning className="w-8 h-8 mx-auto text-slate-300" />
                <p>Click "Run AI Vision Analysis" to process image and description with Gemini.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Campus Hazard Reports Feed */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">
              Live Campus Hazard Feed
            </h2>
            <p className="text-xs text-slate-500">
              Community and patrol reported issues with real-time maintenance status
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'Electrical', 'Chemical', 'Slip/Fall', 'Fire'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterCat === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredHazards.map((hazard) => (
            <div
              key={hazard.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {hazard.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hazard.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : hazard.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    ● {hazard.status}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {hazard.description}
                </p>

                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="truncate">{hazard.location}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{new Date(hazard.timestamp).toLocaleTimeString()}</span>
                <span>{hazard.reportedBy || 'Student Report'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
