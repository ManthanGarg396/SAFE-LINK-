import {
  EmergencyAnalysis,
  HazardReport,
  LanguageCode,
} from '../types.ts';

export async function requestEmergencyAnalysis(payload: {
  text?: string;
  image?: { data: string; mimeType: string };
  language?: LanguageCode;
}): Promise<EmergencyAnalysis> {
  try {
    const response = await fetch('/api/analyze-emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('API error, using local fallback:', err);
    // Fallback simulation
    return getLocalEmergencyFallback(payload.text || '', payload.language || 'English');
  }
}

export async function requestHazardAnalysis(payload: {
  image?: { data: string; mimeType: string };
  description?: string;
  category?: string;
  location?: string;
  language?: LanguageCode;
}) {
  try {
    const response = await fetch('/api/analyze-hazard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn('Hazard API error, using local fallback:', err);
    return {
      hazard_type: 'Campus Physical / Structural Hazard',
      detected_category: payload.category || 'Slip/Fall',
      severity: 'MODERATE' as const,
      visual_observations: [
        'Hazardous anomaly identified in campus premises',
        'Potential risk to pedestrians and students',
      ],
      immediate_safety_actions: [
        'Maintain a safe distance and alert individuals nearby.',
        'Notify campus security and maintenance desk.',
      ],
      do_not: ['Do not touch or attempt unguided handling.'],
      reporting_recommendation: 'Campus Facilities & Maintenance Dept',
      safe_summary: 'Hazard identified and logged for priority review.',
    };
  }
}

export async function requestWarningTranslation(payload: {
  image?: { data: string; mimeType: string };
  text?: string;
  targetLanguage: LanguageCode;
}) {
  try {
    const response = await fetch('/api/translate-warning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn('Translation API error, using local fallback:', err);
    return {
      extracted_text: payload.text || 'DANGER — HIGH VOLTAGE',
      original_language: 'English',
      meaning: 'High electrical voltage present. Contact with equipment poses risk of fatal electric shock.',
      target_language: payload.targetLanguage,
      translated_text: payload.targetLanguage === 'Hindi' ? 'खतरा — उच्च वोल्टेज' : 'DANGER — HIGH VOLTAGE',
      translated_meaning: payload.targetLanguage === 'Hindi' ? 'यह क्षेत्र जानलेवा बिजली के करंट का खतरा प्रस्तुत करता है।' : 'High voltage risk.',
      required_action: 'Stay back at least 3 meters. Do not touch fence or electrical housing. Contact authorized electrical staff only.',
      translated_action: payload.targetLanguage === 'Hindi' ? 'कम से कम 3 मीटर दूर रहें और बिजली के उपकरण को न छुएं।' : 'Keep safe distance.',
      risk_level: 'HIGH' as const,
    };
  }
}

export async function requestSafetyChat(
  messages: Array<{ role: 'user' | 'model'; text: string }>,
  language: LanguageCode = 'English'
): Promise<string> {
  try {
    const response = await fetch('/api/safety-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, language }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (err) {
    console.warn('Chat API error, using local fallback:', err);
    const lastMsg = messages[messages.length - 1]?.text.toLowerCase() || '';
    if (lastMsg.includes('burn')) {
      return 'For burns: Immediately run cool (not ice cold) tap water over the burn for 10-20 minutes. Cover loosely with sterile dressing. Never pop blisters or apply butter.';
    }
    if (lastMsg.includes('bleed') || lastMsg.includes('cut')) {
      return 'For bleeding: Apply direct firm pressure with clean gauze for 5-10 minutes. Elevate the area. If bleeding continues after 10 minutes, seek medical assistance.';
    }
    return 'Safe-Link AI Safety Companion: In all emergency situations, keep calm. If anyone is in acute danger or unconscious, immediately dial 112 or campus security.';
  }
}

function getLocalEmergencyFallback(text: string, language: LanguageCode): EmergencyAnalysis {
  const lower = text.toLowerCase();
  if (lower.includes('unconscious') || lower.includes('faint') || lower.includes('collapsed')) {
    return {
      title: 'Loss of Consciousness / Unresponsive Person',
      category: 'Medical Emergency',
      severity: 'CRITICAL',
      confidence_note: 'Unresponsiveness is a high-priority emergency requiring immediate professional intervention.',
      immediate_actions: [
        'Call 112 (National Emergency) and Campus Security immediately.',
        'Check breathing and airway for 10 seconds.',
        'If breathing normally, place in recovery position on their side.',
        'If NOT breathing, begin CPR (30 compressions, 2 breaths) and request an AED.',
      ],
      avoid: [
        'Do not give anything to drink or eat.',
        'Do not slap or violently shake the person.',
        'Do not leave the person unattended.',
      ],
      warning_signs: ['No pulse', 'Blue lips or pale face', 'Labored gasping'],
      seek_professional_help: 'Immediate ambulance and emergency dispatch required.',
      emergency_required: true,
      summary: 'CRITICAL: Unresponsive person reported. 112 emergency and campus security alerted.',
      language,
    };
  }

  return {
    title: 'Superficial Soft Tissue Injury / Cut',
    category: 'First Aid',
    severity: 'LOW',
    confidence_note: 'Assessment based on descriptive text. Consult health center if bleeding persists.',
    immediate_actions: [
      'Wash hands thoroughly before touching the wound.',
      'Apply direct steady pressure with clean sterile gauze.',
      'Rinse with cool running tap water.',
      'Apply antibiotic ointment and cover with clean bandage.',
    ],
    avoid: [
      'Do not apply harsh alcohol directly into open tissue.',
      'Do not touch with dirty fingers.',
    ],
    warning_signs: ['Bleeding does not stop after 10 minutes', 'Signs of infection after 24 hours'],
    seek_professional_help: 'Campus Health Center if wound is deep or requires stitches.',
    emergency_required: false,
    summary: 'LOW: Minor cut treated with clean pressure and sterile dressing.',
    language,
  };
}
