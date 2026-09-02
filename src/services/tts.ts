import { LANGUAGES } from '../data/mockData.ts';
import { LanguageCode } from '../types.ts';

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState: boolean = false;
  private isPausedState: boolean = false;
  private listeners: Array<(isSpeaking: boolean, isPaused: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(fn: (isSpeaking: boolean, isPaused: boolean) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isSpeakingState, this.isPausedState));
  }

  public speak(text: string, language: LanguageCode = 'English', onEnd?: () => void) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported on this device');
      return;
    }

    this.stop();

    if (!text.trim()) return;

    const langConfig = LANGUAGES.find((l) => l.code === language);
    const locale = langConfig?.speechLocale || 'en-US';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = 0.95; // slightly calmer rate for stress relief
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.isPausedState = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('TTS playback issue:', e);
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.isSpeakingState && !this.isPausedState) {
      this.synth.pause();
      this.isPausedState = true;
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.isSpeakingState && this.isPausedState) {
      this.synth.resume();
      this.isPausedState = false;
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify();
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }
}

export const tts = new TTSService();
