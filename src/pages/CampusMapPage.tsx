import React, { useState } from 'react';
import {
  MapPin,
  HeartPulse,
  Shield,
  Flame,
  DoorOpen,
  PhoneCall,
  Search,
  Filter,
  Navigation,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { CampusResource } from '../types.ts';
import { INITIAL_CAMPUS_RESOURCES } from '../data/mockData.ts';

export const CampusMapPage: React.FC = () => {
  const [resources] = useState<CampusResource[]>(INITIAL_CAMPUS_RESOURCES);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<CampusResource | null>(resources[0]);

  const filterTabs = [
    { id: 'ALL', label: 'All Resources', icon: '📍' },
    { id: 'medical', label: 'Medical & Clinic', icon: '🏥' },
    { id: 'security', label: 'Security Posts', icon: '🛡️' },
    { id: 'first_aid', label: 'AED & Eyewash', icon: '⚡' },
    { id: 'fire', label: 'Fire Hydrants', icon: '🚒' },
    { id: 'exit', label: 'Emergency Exits', icon: '🚪' },
  ];

  const filteredResources = resources.filter((res) => {
    const matchesType = selectedType === 'ALL' || res.type === selectedType;
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getPinIcon = (type: CampusResource['type']) => {
    switch (type) {
      case 'medical':
        return '🏥';
      case 'security':
        return '🛡️';
      case 'first_aid':
        return '⚡';
      case 'fire':
        return '🚒';
      case 'exit':
        return '🚪';
      case 'extinguisher':
        return '🧯';
      case 'call_box':
        return '📞';
      default:
        return '📍';
    }
  };

  const getPinColor = (type: CampusResource['type']) => {
    switch (type) {
      case 'medical':
        return 'bg-emerald-600 border-emerald-300';
      case 'security':
        return 'bg-slate-900 border-amber-400';
      case 'first_aid':
        return 'bg-blue-600 border-blue-300';
      case 'fire':
        return 'bg-red-600 border-red-300';
      default:
        return 'bg-indigo-600 border-indigo-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider">
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive Campus Safety Map</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Find Nearest Medical Bays, AEDs & Safety Stations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Locate campus emergency infrastructure, defibrillators, chemical showers, and security posts with direct phone links.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by building, AED, first aid, clinic room..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                  selectedType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Layout Grid: Visual Interactive Map (Left) + Detail & List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Simulated Campus Stage Map */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative min-h-[420px] overflow-hidden flex flex-col justify-between">
          {/* Map Grid Background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

          {/* Campus Zones Legend */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
              CAMPUS SAFETY GRID — NORTH QUAD
            </span>
            <span className="text-[11px] text-slate-400">Showing {filteredResources.length} stations</span>
          </div>

          {/* Interactive Visual Pins Area */}
          <div className="relative z-10 w-full h-72 my-4">
            {/* Campus Structural Blocks (Visual landmarks) */}
            <div className="absolute left-[15%] top-[70%] w-32 h-16 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-400 p-1.5 font-mono flex flex-col justify-between">
              <span>ADMIN & GATE 1</span>
            </div>

            <div className="absolute left-[25%] top-[40%] w-36 h-20 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-400 p-1.5 font-mono flex flex-col justify-between">
              <span>HEALTH COMPLEX (H)</span>
            </div>

            <div className="absolute left-[45%] top-[20%] w-36 h-20 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-400 p-1.5 font-mono flex flex-col justify-between">
              <span>SCIENCE LABS (C)</span>
            </div>

            <div className="absolute left-[65%] top-[25%] w-32 h-24 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-400 p-1.5 font-mono flex flex-col justify-between">
              <span>ENGINEERING (E)</span>
            </div>

            {/* Clickable Resource Pins */}
            {filteredResources.map((res) => {
              const isSelected = selectedResource?.id === res.id;
              return (
                <button
                  key={res.id}
                  onClick={() => setSelectedResource(res)}
                  style={{
                    left: `${res.coordinates.x}%`,
                    top: `${res.coordinates.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl shadow-lg border-2 flex items-center justify-center transition-all transform hover:scale-125 focus:outline-none ${getPinColor(
                    res.type
                  )} ${isSelected ? 'scale-125 ring-4 ring-white/60 z-20' : 'z-10'}`}
                >
                  <span className="text-base">{getPinIcon(res.type)}</span>
                  {isSelected && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-white text-slate-900 text-[10px] font-bold whitespace-nowrap shadow-md">
                      {res.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Map Footer status */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
            <span>Click any pin to inspect station details</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              All Units Active
            </span>
          </div>
        </div>

        {/* Right Detail Panel + Resource List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Resource Detail Card */}
          {selectedResource && (
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {selectedResource.type}
                  </span>
                  <h2 className="text-base font-bold font-display text-slate-900 mt-1">
                    {selectedResource.name}
                  </h2>
                </div>
                <div className="text-2xl">{getPinIcon(selectedResource.type)}</div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    {selectedResource.building} • {selectedResource.floor} • {selectedResource.room}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedResource.hours}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedResource.description}
              </p>

              {selectedResource.phone && (
                <button
                  onClick={() => {
                    window.location.href = `tel:${selectedResource.phone?.replace(/\s+/g, '')}`;
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Desk ({selectedResource.phone})</span>
                </button>
              )}
            </div>
          )}

          {/* Quick List */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm space-y-2 max-h-72 overflow-y-auto">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Station Index ({filteredResources.length})
            </div>
            {filteredResources.map((res) => (
              <button
                key={res.id}
                onClick={() => setSelectedResource(res)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition text-xs ${
                  selectedResource?.id === res.id
                    ? 'border-emerald-500 bg-emerald-50/60 font-semibold text-emerald-950'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-base">{getPinIcon(res.type)}</span>
                <div className="flex-1 truncate">
                  <div className="font-bold truncate">{res.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{res.building}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
