import React from 'react';
import { WifiOff, PhoneCall, BookOpen, ShieldAlert } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { AppTab } from '../types.ts';

interface OfflineSafetyBannerProps {
  setTab: (tab: AppTab) => void;
  onOpenEmergencyModal: () => void;
}

export const OfflineSafetyBanner: React.FC<OfflineSafetyBannerProps> = ({
  setTab,
  onOpenEmergencyModal,
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-safety-banner"
      className="bg-amber-600 text-white px-4 py-2.5 text-xs shadow-md border-b border-amber-700 animate-in fade-in duration-200"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
          <div>
            <span className="font-bold">Offline Safety Mode Active:</span> Cached emergency hotlines, saved contacts, and essential first-aid guides are fully available. (AI cloud scanning resumes upon reconnection).
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setTab('first-aid')}
            className="px-2.5 py-1 rounded-md bg-amber-700 hover:bg-amber-800 text-white font-medium text-[11px] transition flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3" />
            <span>Cached First-Aid</span>
          </button>
          <button
            onClick={onOpenEmergencyModal}
            className="px-2.5 py-1 rounded-md bg-white text-red-700 hover:bg-red-50 font-bold text-[11px] transition flex items-center gap-1 shadow-xs"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Emergency 112</span>
          </button>
        </div>
      </div>
    </div>
  );
};
