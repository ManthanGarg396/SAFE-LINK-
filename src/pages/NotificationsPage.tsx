import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Cpu,
  BookmarkCheck,
  Trash2,
  Sliders,
  ShieldCheck,
  Megaphone
} from 'lucide-react';

interface NotificationItem {
  id: string;
  category: 'emergency' | 'hazard' | 'campus' | 'medical' | 'ai';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'not-1',
      category: 'emergency',
      title: '🚨 Possible Earthquake Reported - India North Zone',
      description: 'Minor earth tremor simulated near the hostel block. All students drop, cover, and hold on until safety signals clear.',
      timestamp: '5 mins ago',
      isRead: false,
    },
    {
      id: 'not-2',
      category: 'hazard',
      title: '⚠️ Frayed Live Cable Corridor Block C',
      description: 'An electrical hazard report has been reviewed and assigned to maintenance crews near Room 204.',
      timestamp: '1 hour ago',
      isRead: false,
    },
    {
      id: 'not-3',
      category: 'campus',
      title: '🏫 Maintenance Closure - Gate 2',
      description: 'Campus administration announced temporary pathway repairs around Gate 2. Please access campus via Gate 1.',
      timestamp: '3 hours ago',
      isRead: true,
    },
    {
      id: 'not-4',
      category: 'medical',
      title: '🏥 Pulse Ox Device Configured',
      description: 'The simulated wearable Bluetooth protocol successfully initialized. Ready for triage logging.',
      timestamp: '1 day ago',
      isRead: true,
    },
    {
      id: 'not-5',
      category: 'ai',
      title: '🤖 Sign Translations Rendered',
      description: 'Gemini visual translator successfully rendered OCR alerts to Tamil & Hindi scripts.',
      timestamp: '2 days ago',
      isRead: true,
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    return n.category.toUpperCase() === activeFilter.toUpperCase();
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <Megaphone className="w-4 h-4 text-red-600 animate-bounce" />;
      case 'hazard':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'campus':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'medical':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'ai':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300" id="notifications-page">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5 text-slate-700" />
            <span>Safety Alerts Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Safety Communications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review active emergency warning messages, maintenance statuses, and AI assistance confirmations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Categories Toolbar Filter */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
        {['ALL', 'EMERGENCY', 'HAZARD', 'CAMPUS', 'MEDICAL', 'AI'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase transition ${
              activeFilter === cat
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications Index */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4.5 rounded-2xl border transition flex items-start gap-4 ${
                notif.isRead
                  ? 'bg-white border-slate-200 text-slate-600'
                  : 'bg-slate-50 border-slate-300 font-semibold text-slate-950 shadow-xs'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                {getCategoryIcon(notif.category)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {notif.category} alerts • {notif.timestamp}
                  </span>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-950 font-display">
                  {notif.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {notif.description}
                </p>

                <div className="flex gap-2 pt-2">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-[10px] text-indigo-600 font-extrabold hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="text-[10px] text-rose-600 font-extrabold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span>No notifications loaded inside this category filter.</span>
          </div>
        )}
      </div>
    </div>
  );
};
