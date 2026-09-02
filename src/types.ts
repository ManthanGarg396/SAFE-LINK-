export type EmergencySeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type LanguageCode =
  | 'English'
  | 'Hindi'
  | 'Hinglish'
  | 'Bengali'
  | 'Tamil'
  | 'Telugu'
  | 'Marathi'
  | 'Gujarati'
  | 'Kannada'
  | 'Malayalam'
  | 'Punjabi';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  native: string;
  speechLocale: string;
}

export interface EmergencyAnalysis {
  title: string;
  category: string;
  severity: EmergencySeverity;
  confidence_note: string;
  immediate_actions: string[];
  avoid: string[];
  warning_signs: string[];
  seek_professional_help: string;
  emergency_required: boolean;
  summary: string;
  language: string;
  translated_title?: string;
  translated_immediate_actions?: string[];
  translated_avoid?: string[];
  translated_summary?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: 'Parent' | 'Guardian' | 'Friend' | 'Teacher' | 'Campus Security' | 'Hostel Warden' | 'Medical Doctor' | 'Other';
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface IncidentHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  category: string;
  severity: EmergencySeverity;
  inputSummary: string;
  imageUrl?: string;
  immediateActions: string[];
  avoidances: string[];
  actionTaken?: string;
  location?: string;
}

export interface CampusResource {
  id: string;
  name: string;
  type: 'medical' | 'security' | 'fire' | 'exit' | 'extinguisher' | 'first_aid' | 'call_box';
  building: string;
  floor: string;
  room: string;
  phone?: string;
  hours: string;
  description: string;
  coordinates: { x: number; y: number }; // percentage on campus map 0-100
}

export interface HazardReport {
  id: string;
  timestamp: number;
  photoUrl?: string;
  description: string;
  category: 'Electrical' | 'Fire' | 'Chemical' | 'Slip/Fall' | 'Structural' | 'Security' | 'Water' | 'Laboratory' | 'Other';
  location: string;
  severity: EmergencySeverity;
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Resolved';
  reportedBy?: string;
  aiSuggestedAction?: string;
}

export interface SafetyGuideArticle {
  id: string;
  title: string;
  category: string;
  severity: EmergencySeverity;
  icon: string;
  summary: string;
  whatToDo: string[];
  whatToAvoid: string[];
  whenToSeekHelp: string[];
  emergencyWarningSigns: string[];
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  voiceAutoPlay: boolean;
  simpleLanguageMode: boolean;
}

export type AppTab =
  | 'home'
  | 'assistant'
  | 'hazard-vision'
  | 'translate'
  | 'chat'
  | 'map'
  | 'first-aid'
  | 'contacts'
  | 'history'
  | 'settings'
  | 'privacy'
  | 'about'
  | 'scan'
  | 'admin'
  | 'demo'
  | 'guardian'
  | 'medical'
  | 'notifications';
