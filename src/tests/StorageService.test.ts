import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService, DEFAULT_SETTINGS } from '../services/storage';
import { supabase } from '../services/supabaseClient';

vi.mock('../services/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Supabase mock error') }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
  };
});

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('getSettings should return DEFAULT_SETTINGS if localstorage and supabase are empty', async () => {
    const settings = await StorageService.getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('saveSettings should update local storage cache and attempt cloud sync', async () => {
    const mockSettings = {
      highContrast: true,
      largeText: true,
      reducedMotion: false,
      voiceAutoPlay: true,
      simpleLanguageMode: false,
    };

    await StorageService.saveSettings(mockSettings);

    const savedLocal = localStorage.getItem('safelink_settings');
    expect(savedLocal).not.toBeNull();
    expect(JSON.parse(savedLocal!)).toEqual(mockSettings);

    // Should also call supabase upsert
    expect(supabase.from).toHaveBeenCalledWith('safelink_data');
  });

  it('addHistory should store a new incident item into the history array', async () => {
    const originalHistory = await StorageService.getHistory();
    const mockItem = {
      title: 'Simulated Earthquake',
      category: 'earthquake',
      severity: 'HIGH' as const,
      inputSummary: 'Simulated earth tremor in northern sector.',
      immediateActions: ['Drop', 'Cover', 'Hold on'],
      avoidances: ['Do not use elevators'],
    };

    const addedItem = await StorageService.addHistory(mockItem);
    expect(addedItem.id).toContain('inc-');
    expect(addedItem.title).toBe(mockItem.title);

    const updatedHistory = await StorageService.getHistory();
    expect(updatedHistory.length).toBe(originalHistory.length + 1);
    expect(updatedHistory[0].title).toBe(mockItem.title);
  });

  it('getLanguage should return English by default', async () => {
    const lang = await StorageService.getLanguage();
    expect(lang).toBe('English');
  });

  it('saveLanguage should correctly cache selected language', async () => {
    await StorageService.saveLanguage('Hindi');
    const saved = localStorage.getItem('safelink_language');
    expect(JSON.parse(saved!)).toBe('Hindi');
  });
});
