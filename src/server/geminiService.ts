import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini with safety header
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface EmergencyAnalysisRequest {
  text?: string;
  image?: {
    data: string; // base64 without prefix
    mimeType: string;
  };
  language?: string;
}

export interface EmergencyAnalysisResult {
  title: string;
  category: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
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

export async function analyzeEmergency(
  req: EmergencyAnalysisRequest
): Promise<EmergencyAnalysisResult> {
  const ai = getGeminiClient();
  const lang = req.language || 'English';

  if (!ai) {
    // High-fidelity fallback for offline or zero-key mode
    return getOfflineEmergencyAnalysis(req.text || '', req.image ? true : false, lang);
  }

  try {
    const prompt = `You are SAFE-LINK AI, a multimodal campus health and emergency first-aid safety companion.
CRITICAL SAFETY INSTRUCTIONS:
1. You are an assistive safety tool, NOT a doctor. NEVER confidently diagnose a disease or injury.
2. Use cautious phrases: "This may be consistent with...", "This could indicate...", "An image alone cannot confirm the condition."
3. Determine SEVERITY strictly:
   - "LOW": Minor cuts, small scrapes, mild bruise, basic monitoring.
   - "MODERATE": Sprain, non-severe burn, nosebleed, dizziness, first aid + consider medical visit.
   - "HIGH": Deep cut with bleeding, intense pain, chemical exposure on skin, smoke in lab, prompt medical help required.
   - "CRITICAL": Unconscious, severe bleeding, difficulty breathing, major burns, anaphylaxis, chest pain, electrical shock, open fracture, active fire -> Set emergency_required to TRUE immediately!
4. Provide immediate, structured, step-by-step first-aid actions.
5. Provide clear "AVOID / DO NOT" actions.
6. Provide specific warning signs to watch for.
7. Also provide the translation in the user's requested language (${lang}) for title, immediate_actions, avoid, and summary.

User description: "${req.text || 'Evaluate the provided image or emergency context.'}"
Target Language: ${lang}`;

    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];
    if (req.image && req.image.data) {
      parts.push({
        inlineData: {
          data: req.image.data,
          mimeType: req.image.mimeType || 'image/jpeg',
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Short descriptive title in English' },
            category: { type: Type.STRING, description: 'Category: Injury, Hazard, Illness, Environmental' },
            severity: { type: Type.STRING, description: 'LOW, MODERATE, HIGH, or CRITICAL' },
            confidence_note: { type: Type.STRING, description: 'Cautious disclaimer regarding assistive observation' },
            immediate_actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step by step immediate first aid actions',
            },
            avoid: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Things to avoid or NOT do',
            },
            warning_signs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Red flag warning signs for escalation',
            },
            seek_professional_help: { type: Type.STRING, description: 'When to seek professional medical help' },
            emergency_required: { type: Type.BOOLEAN, description: 'Whether 112 emergency services are urgently needed' },
            summary: { type: Type.STRING, description: 'Brief 1-2 sentence summary for emergency contact alert' },
            translated_title: { type: Type.STRING, description: `Title translated into ${lang}` },
            translated_immediate_actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Actions translated into ${lang}`,
            },
            translated_avoid: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Avoidances translated into ${lang}`,
            },
            translated_summary: { type: Type.STRING, description: `Summary translated into ${lang}` },
          },
          required: [
            'title',
            'category',
            'severity',
            'confidence_note',
            'immediate_actions',
            'avoid',
            'warning_signs',
            'seek_professional_help',
            'emergency_required',
            'summary',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as EmergencyAnalysisResult;
    parsed.language = lang;
    // Sanitize severity
    if (!['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].includes(parsed.severity)) {
      parsed.severity = 'MODERATE';
    }
    return parsed;
  } catch (error) {
    console.error('Gemini Emergency Analysis error:', error);
    return getOfflineEmergencyAnalysis(req.text || '', req.image ? true : false, lang);
  }
}

export interface HazardAnalysisResult {
  hazard_type: string;
  detected_category: 'Electrical' | 'Fire' | 'Chemical' | 'Slip/Fall' | 'Structural' | 'Security' | 'Water' | 'Laboratory' | 'Other';
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  visual_observations: string[];
  immediate_safety_actions: string[];
  do_not: string[];
  reporting_recommendation: string;
  safe_summary: string;
  translated_summary?: string;
}

export async function analyzeHazard(
  req: { image?: { data: string; mimeType: string }; description?: string; category?: string; location?: string; language?: string }
): Promise<HazardAnalysisResult> {
  const ai = getGeminiClient();
  const lang = req.language || 'English';

  if (!ai) {
    return getOfflineHazardAnalysis(req.description || '', req.category || 'Other', lang);
  }

  try {
    const prompt = `Analyze this campus hazard report.
Examine the image and/or description to identify hazards (damaged wiring, fire risks, chemical spills, wet slippery floors, broken structural elements, laboratory safety issues).
Provide actionable safety advice and campus reporting escalation.
Target language for translations: ${lang}
User provided details: "${req.description || ''}", category hint: "${req.category || 'Unknown'}", location: "${req.location || 'Campus'}".`;

    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];
    if (req.image && req.image.data) {
      parts.push({
        inlineData: {
          data: req.image.data,
          mimeType: req.image.mimeType || 'image/jpeg',
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hazard_type: { type: Type.STRING },
            detected_category: { type: Type.STRING },
            severity: { type: Type.STRING },
            visual_observations: { type: Type.ARRAY, items: { type: Type.STRING } },
            immediate_safety_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            do_not: { type: Type.ARRAY, items: { type: Type.STRING } },
            reporting_recommendation: { type: Type.STRING },
            safe_summary: { type: Type.STRING },
            translated_summary: { type: Type.STRING },
          },
          required: [
            'hazard_type',
            'detected_category',
            'severity',
            'visual_observations',
            'immediate_safety_actions',
            'do_not',
            'reporting_recommendation',
            'safe_summary',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as HazardAnalysisResult;
    return parsed;
  } catch (error) {
    console.error('Gemini Hazard Analysis error:', error);
    return getOfflineHazardAnalysis(req.description || '', req.category || 'Other', lang);
  }
}

export interface WarningTranslationResult {
  extracted_text: string;
  original_language: string;
  meaning: string;
  target_language: string;
  translated_text: string;
  translated_meaning: string;
  required_action: string;
  translated_action: string;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export async function translateWarningSign(
  req: { image?: { data: string; mimeType: string }; text?: string; targetLanguage: string }
): Promise<WarningTranslationResult> {
  const ai = getGeminiClient();
  const targetLang = req.targetLanguage || 'Hindi';

  if (!ai) {
    return getOfflineWarningTranslation(req.text || 'DANGER — HIGH VOLTAGE', targetLang);
  }

  try {
    const prompt = `You are SAFE-LINK AI Safety Warning Translator.
1. Extract any text from this warning sign/image or use the text: "${req.text || ''}".
2. Explain what the safety hazard/warning means clearly.
3. Translate the warning sign and its safety instructions into ${targetLang}.
4. Provide the immediate required safety action in English and ${targetLang}.
5. Rate risk level: LOW, MODERATE, HIGH, CRITICAL.`;

    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];
    if (req.image && req.image.data) {
      parts.push({
        inlineData: {
          data: req.image.data,
          mimeType: req.image.mimeType || 'image/jpeg',
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extracted_text: { type: Type.STRING },
            original_language: { type: Type.STRING },
            meaning: { type: Type.STRING },
            target_language: { type: Type.STRING },
            translated_text: { type: Type.STRING },
            translated_meaning: { type: Type.STRING },
            required_action: { type: Type.STRING },
            translated_action: { type: Type.STRING },
            risk_level: { type: Type.STRING },
          },
          required: [
            'extracted_text',
            'original_language',
            'meaning',
            'target_language',
            'translated_text',
            'translated_meaning',
            'required_action',
            'translated_action',
            'risk_level',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as WarningTranslationResult;
    return parsed;
  } catch (error) {
    console.error('Gemini Warning Translation error:', error);
    return getOfflineWarningTranslation(req.text || 'DANGER — HIGH VOLTAGE', targetLang);
  }
}

export async function chatSafety(
  messages: Array<{ role: 'user' | 'model'; text: string }>,
  language: string = 'English'
): Promise<{ reply: string }> {
  const ai = getGeminiClient();
  if (!ai) {
    const lastUserMsg = messages[messages.length - 1]?.text.toLowerCase() || '';
    if (lastUserMsg.includes('burn')) {
      return { reply: 'For minor burns: Cool the burn immediately with cool (not icy) running water for 10-20 minutes. Do NOT apply ice, butter, or break blisters. Cover with clean, sterile, non-adherent dressing.' };
    }
    if (lastUserMsg.includes('cut') || lastUserMsg.includes('bleed')) {
      return { reply: 'For cuts: Wash hands, apply firm direct pressure with clean gauze or cloth for 5-10 minutes. Clean gently with cool water, apply antibiotic ointment if available, and cover with a sterile bandage.' };
    }
    if (lastUserMsg.includes('unconscious') || lastUserMsg.includes('emergency')) {
      return { reply: '🚨 URGENT: Check responsiveness and breathing. Immediately call emergency services (112) or campus security. If breathing normally, place in recovery position on their side. Do not leave unattended.' };
    }
    return { reply: 'Safe-Link AI Safety Companion: Please provide details about what happened or any symptoms observed. For any life-threatening emergency, please call 112 immediately.' };
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-3.7-flash',
      config: {
        systemInstruction: `You are Safe-Link AI, an empathetic, calm, safety-first campus safety companion.
Respond concisely with structured bullet points, clear DOs and DO NOTs.
NEVER give medical diagnosis. If symptoms are severe (unconsciousness, chest pain, major bleeding, severe burn, difficulty breathing), immediately instruct to call 112 or campus security.
Respond in the language requested: ${language}.`,
      },
    });

    // Send history
    for (let i = 0; i < messages.length - 1; i++) {
      await chat.sendMessage({ message: messages[i].text });
    }

    const last = messages[messages.length - 1];
    const response = await chat.sendMessage({ message: last.text });
    return { reply: response.text || 'Please consult campus medical personnel for proper care.' };
  } catch (error) {
    console.error('Gemini Safety Chat error:', error);
    return { reply: 'Safe-Link AI: For any safety or first-aid question, prioritize calling emergency services (112) if anyone is in distress or injured.' };
  }
}

// Fallback logic for offline / zero-key resilience
function getOfflineEmergencyAnalysis(
  text: string,
  hasImage: boolean,
  language: string
): EmergencyAnalysisResult {
  const lower = text.toLowerCase();
  const isUnconscious = lower.includes('unconscious') || lower.includes('not responding') || lower.includes('fainted') || lower.includes('collapsed');
  const isSevereBleeding = lower.includes('severe bleed') || lower.includes('artery') || lower.includes('spurting') || lower.includes('deep cut');
  const isSmokeOrFire = lower.includes('smoke') || lower.includes('fire') || lower.includes('flame') || lower.includes('explosion');
  const isChemical = lower.includes('chemical') || lower.includes('acid') || lower.includes('spill') || lower.includes('toxic');
  const isSprain = lower.includes('ankle') || lower.includes('sprain') || lower.includes('swollen') || lower.includes('fell');

  if (isUnconscious) {
    return {
      title: 'Loss of Consciousness / Unresponsive Person',
      category: 'Medical Emergency',
      severity: 'CRITICAL',
      confidence_note: 'Unresponsiveness is a critical emergency. An AI cannot substitute emergency medical intervention.',
      immediate_actions: [
        'Call 112 (National Emergency Number) and Campus Security immediately.',
        'Check for normal breathing and clear airways.',
        'If breathing normally, gently turn the person onto their side into the recovery position.',
        'If not breathing or only gasping, immediately begin CPR (30 chest compressions, 2 rescue breaths) and request an AED.',
        'Do not give food, water, or medication.',
      ],
      avoid: [
        'Do not shake or slap the person forcefully.',
        'Do not place a pillow under their head if there is any suspicion of neck/spinal injury.',
        'Do not leave the person alone.',
      ],
      warning_signs: [
        'No pulse or irregular breathing',
        'Cyanosis (blue or pale lips/face)',
        'Seizure activity or head trauma',
      ],
      seek_professional_help: 'Immediate emergency responder dispatch required.',
      emergency_required: true,
      summary: 'CRITICAL: Unresponsive person reported on campus. Emergency services and campus medical dispatched.',
      language,
      translated_title: language === 'Hindi' ? 'बेहोशी / अनुत्तरदायी व्यक्ति' : language === 'Hinglish' ? 'Behoshi / Unresponsive person' : 'Loss of Consciousness',
      translated_immediate_actions: [
        language === 'Hindi' ? 'तुरंत 112 और कैंपस सुरक्षा को कॉल करें।' : 'Call 112 immediately.',
        language === 'Hindi' ? 'सांस और वायुमार्ग की जांच करें।' : 'Check breathing.',
      ],
      translated_avoid: [language === 'Hindi' ? 'व्यक्ति को अकेला न छोड़ें।' : 'Do not leave alone.'],
      translated_summary: language === 'Hindi' ? 'गंभीर स्थिति: कैंपस में बेहोश व्यक्ति की सूचना मिली है। तुरंत आपातकालीन सहायता लें।' : 'Critical: Unresponsive person reported.',
    };
  }

  if (isSmokeOrFire) {
    return {
      title: 'Smoke or Fire Hazard in Facility',
      category: 'Environmental Hazard',
      severity: 'HIGH',
      confidence_note: 'Visual and text indications point to smoke or fire hazard.',
      immediate_actions: [
        'Activate the nearest campus fire alarm pull station.',
        'Evacuate the area immediately using the nearest marked emergency exit.',
        'Do NOT use elevators under any circumstances.',
        'Call Campus Fire Safety and 112 once you reach a safe outdoor assembly area.',
        'Close doors behind you to slow smoke and fire spread.',
      ],
      avoid: [
        'Do not re-enter the building for personal items.',
        'Do not inhale smoke; stay low to the ground if smoke is present.',
        'Do not use water on electrical or chemical laboratory fires.',
      ],
      warning_signs: [
        'Heavy black smoke or rapid flame spread',
        'Chemical odors or sparking electrical equipment',
        'Trapped individuals or blocked exit pathways',
      ],
      seek_professional_help: 'Campus Fire Department and 112 emergency response.',
      emergency_required: true,
      summary: 'URGENT: Smoke/fire reported in campus facility. Building evacuation and fire response required.',
      language,
    };
  }

  if (isChemical) {
    return {
      title: 'Chemical Spill / Hazardous Exposure',
      category: 'Laboratory Hazard',
      severity: 'HIGH',
      confidence_note: 'Chemical exposure requires careful decontamination and safety protocol.',
      immediate_actions: [
        'Evacuate the immediate spill area and warn nearby lab personnel.',
        'If skin contact occurred, immediately flush the affected area with water from emergency safety shower or eyewash for 15+ minutes.',
        'Remove contaminated clothing carefully while flushing.',
        'Alert the Laboratory Safety Officer and Campus Emergency Response.',
        'Ventilate the area if safe to do so.',
      ],
      avoid: [
        'Do not attempt to clean up unknown chemicals without appropriate PPE.',
        'Do not touch or walk through spilled liquids or powders.',
        'Do not neutralize acids or bases with opposite chemicals without expert guidance.',
      ],
      warning_signs: [
        'Skin burning, blistering, or chemical fumes inhalation',
        'Difficulty breathing or dizziness',
        'Flammable or reactive chemical vapors',
      ],
      seek_professional_help: 'Campus Hazmat / Emergency Medical Center.',
      emergency_required: true,
      summary: 'HIGH RISK: Chemical spill/exposure reported. Safety shower flushing and lab emergency response initiated.',
      language,
    };
  }

  if (isSprain) {
    return {
      title: 'Possible Ankle Sprain / Musculoskeletal Injury',
      category: 'Injury',
      severity: 'MODERATE',
      confidence_note: 'Symptoms suggest ligament strain or sprain. X-ray is required to rule out fracture.',
      immediate_actions: [
        'Apply the R.I.C.E. protocol:',
        'Rest: Stop putting weight on the injured limb immediately.',
        'Ice: Apply cold compress or ice pack wrapped in a cloth for 15-20 minutes every 2-3 hours.',
        'Compress: Gently wrap with an elastic bandage to support the joint (not too tight).',
        'Elevate: Keep the injured ankle propped up above heart level when resting.',
      ],
      avoid: [
        'Do not apply direct heat (hot water, heating pads) during the first 48 hours.',
        'Do not force walking or weight-bearing on severe pain.',
        'Do not massage violently or try to "pop" the joint back.',
      ],
      warning_signs: [
        'Inability to bear any weight even after resting',
        'Visible bone deformity or extreme sudden swelling',
        'Numbness, loss of sensation, or pale cold toes',
      ],
      seek_professional_help: 'Visit the Campus Health Center or clinic for an evaluation/X-ray if unable to walk.',
      emergency_required: false,
      summary: 'MODERATE: Ankle injury reported. R.I.C.E. protocol recommended; campus clinic visit advised.',
      language,
    };
  }

  // Default: Minor cut / injury
  return {
    title: 'Minor Cut / Soft Tissue Injury',
    category: 'First Aid',
    severity: 'LOW',
    confidence_note: 'Indications are consistent with a minor superficial laceration. Keep clean to prevent infection.',
    immediate_actions: [
      'Wash your hands thoroughly with clean soap and water before touching the area.',
      'Apply gentle, steady pressure with clean sterile gauze or a clean cloth to stop any bleeding.',
      'Rinse the cut under cool running tap water to remove dirt.',
      'Apply a thin layer of antibacterial ointment or petroleum jelly.',
      'Cover with a clean adhesive bandage or sterile dressing.',
    ],
    avoid: [
      'Do not touch the open wound with dirty hands.',
      'Do not apply harsh chemicals like hydrogen peroxide or alcohol directly into open tissue.',
      'Do not pick at scabs or remove deeply embedded debris yourself.',
    ],
    warning_signs: [
      'Bleeding does not stop after 10 minutes of direct pressure',
      'The wound is deep, gaping, or caused by a rusty or dirty object (tetanus risk)',
      'Increasing redness, warmth, swelling, or pus leakage after 24 hours',
    ],
    seek_professional_help: 'Campus Health Center if stitches are required or if signs of infection develop.',
    emergency_required: false,
    summary: 'LOW: Minor cut treated with clean pressure and sterile dressing. Monitor for healing.',
    language,
  };
}

function getOfflineHazardAnalysis(
  description: string,
  categoryHint: string,
  language: string
): HazardAnalysisResult {
  const lower = (description + ' ' + categoryHint).toLowerCase();
  if (lower.includes('electric') || lower.includes('wire')) {
    return {
      hazard_type: 'Exposed Electrical Wiring / Sparking Equipment',
      detected_category: 'Electrical',
      severity: 'HIGH',
      visual_observations: [
        'Damaged cable insulation with exposed copper conductors',
        'Potential electrical shock and fire hazard in proximity to pedestrians',
      ],
      immediate_safety_actions: [
        'Keep a safe perimeter distance of at least 3 meters (10 feet).',
        'Warn others in the area and prevent anyone from touching nearby metal fixtures.',
        'Report immediately to Campus Electrical Maintenance and Security.',
      ],
      do_not: [
        'Do not touch the exposed wire with bare hands or metal objects.',
        'Do not pour water near the electrical hazard.',
        'Do not attempt DIY repairs without certified lockout/tagout procedures.',
      ],
      reporting_recommendation: 'Campus Facilities & Electrical Maintenance (Urgent Priority)',
      safe_summary: 'HIGH: Exposed electrical wiring identified. Area cordoned off and maintenance notified.',
      translated_summary: language === 'Hindi' ? 'उच्च जोखिम: खुला बिजली का तार पाया गया। कृपया दूरी बनाए रखें।' : undefined,
    };
  }

  return {
    hazard_type: 'Physical Campus Hazard',
    detected_category: 'Slip/Fall',
    severity: 'MODERATE',
    visual_observations: [
      'Unsafe surface condition or structural anomaly detected',
      'Potential slip, trip, or impact hazard for students and staff',
    ],
    immediate_safety_actions: [
      'Place a warning sign or temporary barrier if available.',
      'Use an alternate walking route.',
      'Submit this report to Campus Facilities for immediate remediation.',
    ],
    do_not: [
      'Do not ignore the hazard without warning others.',
      'Do not run or rush across hazardous surfaces.',
    ],
    reporting_recommendation: 'Campus Maintenance & Safety Services',
    safe_summary: 'MODERATE: Campus hazard reported. Facilities dispatch requested.',
    translated_summary: undefined,
  };
}

function getOfflineWarningTranslation(
  text: string,
  targetLanguage: string
): WarningTranslationResult {
  return {
    extracted_text: text || 'DANGER — HIGH VOLTAGE',
    original_language: 'English',
    meaning: 'This sign warns of high electrical voltage capable of causing severe electric shock, electrocution, or death.',
    target_language: targetLanguage,
    translated_text: targetLanguage === 'Hindi' ? 'खतरा — उच्च वोल्टेज' : targetLanguage === 'Hinglish' ? 'Khatra — High Voltage' : targetLanguage === 'Tamil' ? 'ஆபத்து — உயர் மின்னழுத்தம்' : 'DANGER — HIGH VOLTAGE',
    translated_meaning: targetLanguage === 'Hindi' ? 'यह संकेत अत्यधिक विद्युत वोल्टेज की चेतावनी देता है जिससे जानलेवा करंट लग सकता है।' : 'Warns of severe electrical shock risk.',
    required_action: 'Keep a safe distance, do not touch electrical equipment or fencing, and notify authorized personnel only.',
    translated_action: targetLanguage === 'Hindi' ? 'सुरक्षित दूरी बनाए रखें, उपकरण को न छुएं और केवल अधिकृत कर्मचारियों को सूचित करें।' : 'Maintain safe distance and avoid touching.',
    risk_level: 'HIGH',
  };
}
