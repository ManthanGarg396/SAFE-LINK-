import {
  AccessibilitySettings,
  EmergencyContact,
  HazardReport,
  IncidentHistoryItem,
  LanguageCode,
} from '../types.ts';
import {
  INITIAL_CONTACTS,
  INITIAL_HAZARDS,
  INITIAL_INCIDENT_HISTORY,
} from '../data/mockData.ts';
import { supabase } from './supabaseClient.ts';

const KEYS = {
  CONTACTS: 'safelink_contacts',
  HISTORY: 'safelink_history',
  HAZARDS: 'safelink_hazards',
  SETTINGS: 'safelink_settings',
  LANGUAGE: 'safelink_language',
  CAMPUS_NAME: 'safelink_campus_name',
};

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  voiceAutoPlay: false,
  simpleLanguageMode: false,
};

async function getSupabaseItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const { data, error } = await supabase.from('safelink_data').select('value').eq('key', key).single();
    if (error || !data) {
      // Fallback to local storage if not in supabase
      const local = localStorage.getItem(key);
      if (local) return JSON.parse(local) as T;
      return defaultValue;
    }
    // Update local storage cache
    localStorage.setItem(key, JSON.stringify(data.value));
    return data.value as T;
  } catch {
    const local = localStorage.getItem(key);
    if (local) return JSON.parse(local) as T;
    return defaultValue;
  }
}

async function setSupabaseItem<T>(key: string, value: T) {
  // Optimistically update local storage
  localStorage.setItem(key, JSON.stringify(value));
  try {
    await supabase.from('safelink_data').upsert({ key, value });
  } catch (err) {
    console.error('Supabase sync error:', err);
  }
}

export const StorageService = {
  async getContacts(): Promise<EmergencyContact[]> {
    return getSupabaseItem<EmergencyContact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
  },

  async saveContacts(contacts: EmergencyContact[]) {
    await setSupabaseItem(KEYS.CONTACTS, contacts);
  },

  async getHistory(): Promise<IncidentHistoryItem[]> {
    return getSupabaseItem<IncidentHistoryItem[]>(KEYS.HISTORY, INITIAL_INCIDENT_HISTORY);
  },

  async addHistory(item: Omit<IncidentHistoryItem, 'id' | 'timestamp'>): Promise<IncidentHistoryItem> {
    const history = await this.getHistory();
    const newItem: IncidentHistoryItem = {
      ...item,
      id: 'inc-' + Date.now(),
      timestamp: Date.now(),
    };
    const updated = [newItem, ...history];
    await setSupabaseItem(KEYS.HISTORY, updated);
    return newItem;
  },

  async deleteHistoryItem(id: string): Promise<IncidentHistoryItem[]> {
    const history = await this.getHistory();
    const updated = history.filter((item) => item.id !== id);
    await setSupabaseItem(KEYS.HISTORY, updated);
    return updated;
  },

  async clearHistory() {
    await setSupabaseItem(KEYS.HISTORY, []);
  },

  async getHazards(): Promise<HazardReport[]> {
    return getSupabaseItem<HazardReport[]>(KEYS.HAZARDS, INITIAL_HAZARDS);
  },

  async addHazard(hazard: Omit<HazardReport, 'id' | 'timestamp' | 'status'>): Promise<HazardReport> {
    const hazards = await this.getHazards();
    const newHazard: HazardReport = {
      ...hazard,
      id: 'haz-' + Date.now(),
      timestamp: Date.now(),
      status: 'Reported',
    };
    const updated = [newHazard, ...hazards];
    await setSupabaseItem(KEYS.HAZARDS, updated);
    return newHazard;
  },

  async getSettings(): Promise<AccessibilitySettings> {
    const settings = await getSupabaseItem<AccessibilitySettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...settings };
  },

  async saveSettings(settings: AccessibilitySettings) {
    await setSupabaseItem(KEYS.SETTINGS, settings);
  },

  async getLanguage(): Promise<LanguageCode> {
    return getSupabaseItem<LanguageCode>(KEYS.LANGUAGE, 'English');
  },

  async saveLanguage(lang: LanguageCode) {
    await setSupabaseItem(KEYS.LANGUAGE, lang);
  },

  async clearAllData() {
    localStorage.clear();
    // For a single user context, we could delete rows from Supabase, but let's just reset
    await setSupabaseItem(KEYS.CONTACTS, INITIAL_CONTACTS);
    await setSupabaseItem(KEYS.HISTORY, INITIAL_INCIDENT_HISTORY);
    await setSupabaseItem(KEYS.HAZARDS, INITIAL_HAZARDS);
    await setSupabaseItem(KEYS.SETTINGS, DEFAULT_SETTINGS);
    await setSupabaseItem(KEYS.LANGUAGE, 'English');
  },
};
