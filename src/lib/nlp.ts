// MetroResolve — deterministic, explainable triage engine.
// No AI model required. Every decision is traceable to matched
// keywords and fired rules. Multilingual detection is heuristic
// and explicitly labelled with confidence levels — it is NOT
// presented as reliable.

export type LanguageCode = 'en' | 'hi' | 'gu' | 'gujlish' | 'hinglish';
export type Department =
  | 'Safety'
  | 'Cleanliness'
  | 'Fare'
  | 'Lifts'
  | 'Staff Behaviour';
export type DepartmentOrUnclassified = Department | 'Unclassified';

export const DEPARTMENTS: Department[] = [
  'Safety',
  'Cleanliness',
  'Fare',
  'Lifts',
  'Staff Behaviour',
];

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'Hindi',
  gu: 'Gujarati',
  gujlish: 'Gujlish (Gujarati + English)',
  hinglish: 'Hinglish (Hindi + English)',
};

// ---------------------------------------------------------------------------
// Language detection (script-share heuristic)
// ---------------------------------------------------------------------------

export interface LanguageResult {
  language: LanguageCode;
  confidence: 'high' | 'medium' | 'low';
  note: string;
}

const GUJARATI_CHARS = /[઀-૿]/g;
const DEVANAGARI_CHARS = /[ऀ-ॿ]/g;
const LATIN_CHARS = /[A-Za-z]/g;

export function detectLanguage(text: string): LanguageResult {
  const gu = (text.match(GUJARATI_CHARS) || []).length;
  const hi = (text.match(DEVANAGARI_CHARS) || []).length;
  const la = (text.match(LATIN_CHARS) || []).length;
  const total = gu + hi + la;

  if (total === 0) {
    return {
      language: 'en',
      confidence: 'low',
      note: 'No script characters found; English template used as a guess.',
    };
  }

  const guShare = gu / total;
  const hiShare = hi / total;
  const laShare = la / total;

  if (laShare >= 0.5 && (guShare > 0 || hiShare > 0)) {
    // Mixed Latin + Indic scripts → transliterated mixed language
    if (guShare >= hiShare) {
      return {
        language: 'gujlish',
        confidence: 'medium',
        note: 'Mixed Gujarati and Latin scripts detected (Gujlish). Fully romanized Gujarati cannot be distinguished from English.',
      };
    }
    return {
      language: 'hinglish',
      confidence: 'medium',
      note: 'Mixed Hindi and Latin scripts detected (Hinglish). Fully romanized Hindi cannot be distinguished from English.',
    };
  }

  if (guShare > 0 && guShare >= hiShare) {
    return {
      language: 'gu',
      confidence: guShare > 0.6 ? 'high' : 'medium',
      note: 'Gujarati script detected.',
    };
  }

  if (hiShare > 0) {
    return {
      language: 'hi',
      confidence: hiShare > 0.6 ? 'high' : 'medium',
      note: 'Devanagari script detected (Hindi).',
    };
  }

  return {
    language: 'en',
    confidence: 'low',
    note: 'Latin script only. Fully romanized Gujlish/Hinglish cannot be distinguished from English reliably; English template used.',
  };
}

// ---------------------------------------------------------------------------
// Department classification (weighted keywords per language)
// ---------------------------------------------------------------------------

interface Keyword {
  term: string;
  weight: number;
}

const DEPARTMENT_KEYWORDS: Record<Department, Keyword[]> = {
  Safety: [
    // English
    { term: 'smoke', weight: 3 },
    { term: 'fire', weight: 3 },
    { term: 'smoking', weight: 2 },
    { term: 'spark', weight: 2 },
    { term: 'alarm', weight: 2 },
    { term: 'emergency', weight: 2 },
    { term: 'accident', weight: 3 },
    { term: 'injur', weight: 3 },
    { term: 'hurt', weight: 2 },
    { term: 'assault', weight: 3 },
    { term: 'harass', weight: 3 },
    { term: 'theft', weight: 2 },
    { term: 'robbery', weight: 3 },
    { term: 'steal', weight: 2 },
    { term: 'fight', weight: 2 },
    { term: 'threat', weight: 2 },
    { term: 'dangerous', weight: 3 },
    { term: 'safety', weight: 1 },
    { term: 'trapped', weight: 3 },
    { term: 'stuck', weight: 2 },
    { term: 'collapse', weight: 3 },
    { term: 'hazard', weight: 2 },
    { term: 'weapon', weight: 3 },
    { term: 'brawl', weight: 2 },
    { term: 'panic', weight: 2 },
    { term: 'electrical', weight: 1 },
    // Hindi (Devanagari)
    { term: 'आग', weight: 3 },
    { term: 'धुआं', weight: 3 },
    { term: 'आपातकाल', weight: 2 },
    { term: 'आपातकालीन', weight: 2 },
    { term: 'फंस', weight: 2 },
    { term: 'चोरी', weight: 2 },
    { term: 'चिंगाड़ी', weight: 3 },
    { term: 'दुर्घटना', weight: 3 },
    { term: 'चोट', weight: 2 },
    { term: 'खतर', weight: 2 },
    { term: 'सुरक्षा', weight: 1 },
    { term: 'हमला', weight: 3 },
    { term: 'उपद्रव', weight: 2 },
    // Gujarati
    { term: 'આગ', weight: 3 },
    { term: 'ધુમ્મસ', weight: 3 },
    { term: 'ધુમ', weight: 2 },
    { term: 'આપત્કાળ', weight: 2 },
    { term: 'ફંસ', weight: 2 },
    { term: 'ચોરી', weight: 2 },
    { term: 'દુર્ઘટના', weight: 3 },
    { term: 'જોખમ', weight: 2 },
    { term: 'સુરક્ષા', weight: 1 },
    { term: 'અપઘાત', weight: 3 },
  ],
  Cleanliness: [
    // English
    { term: 'dirty', weight: 3 },
    { term: 'clean', weight: 2 },
    { term: 'cleanliness', weight: 2 },
    { term: 'litter', weight: 3 },
    { term: 'garbage', weight: 3 },
    { term: 'trash', weight: 3 },
    { term: 'rubbish', weight: 3 },
    { term: 'smell', weight: 2 },
    { term: 'spill', weight: 2 },
    { term: 'spilled', weight: 2 },
    { term: 'dust', weight: 2 },
    { term: 'toilet', weight: 3 },
    { term: 'washroom', weight: 3 },
    { term: 'restroom', weight: 3 },
    { term: 'stain', weight: 2 },
    { term: 'fungus', weight: 2 },
    { term: 'mosquito', weight: 2 },
    { term: 'pest', weight: 2 },
    { term: 'cobweb', weight: 2 },
    { term: 'vomit', weight: 2 },
    { term: 'urat', weight: 1 },
    { term: 'clog', weight: 2 },
    { term: 'leakage', weight: 2 },
    { term: 'leak', weight: 2 },
    { term: 'wet', weight: 1 },
    { term: 'slippery', weight: 2 },
    { term: 'slip', weight: 2 },
    { term: 'clutter', weight: 1 },
    // Hindi
    { term: 'गंदगी', weight: 3 },
    { term: 'सफाई', weight: 2 },
    { term: 'कचरा', weight: 3 },
    { term: 'गंदा', weight: 3 },
    { term: 'गंदी', weight: 3 },
    { term: 'टॉयलेट', weight: 3 },
    { term: 'शौचालय', weight: 3 },
    { term: 'गंध', weight: 2 },
    { term: 'कीड़ा', weight: 2 },
    { term: 'मक्खी', weight: 2 },
    { term: 'उल्टी', weight: 2 },
    { term: 'रिसाव', weight: 2 },
    { term: 'गीला', weight: 1 },
    { term: 'फैला हुआ', weight: 2 },
    // Gujarati
    { term: 'ગંદતા', weight: 3 },
    { term: 'ગંદા', weight: 3 },
    { term: 'ગંદી', weight: 3 },
    { term: 'સાફ', weight: 2 },
    { term: 'સફાઈ', weight: 2 },
    { term: 'કચરો', weight: 3 },
    { term: 'કચરા', weight: 3 },
    { term: 'ગંધ', weight: 2 },
    { term: 'ટોઈલેટ', weight: 3 },
    { term: 'શૌચાલય', weight: 3 },
    { term: 'ફરશ', weight: 2 },
    { term: 'રિસાવ', weight: 2 },
    { term: 'ગીળો', weight: 1 },
    { term: 'કીડું', weight: 2 },
    { term: 'મક્ખી', weight: 2 },
    { term: 'ઉલ્ટી', weight: 2 },
    { term: 'ટપકી', weight: 2 },
  ],
  Fare: [
    // English
    { term: 'fare', weight: 3 },
    { term: 'ticket', weight: 2 },
    { term: 'token', weight: 2 },
    { term: 'price', weight: 2 },
    { term: 'cost', weight: 1 },
    { term: 'charge', weight: 2 },
    { term: 'charged', weight: 2 },
    { term: 'overcharge', weight: 3 },
    { term: 'refund', weight: 3 },
    { term: 'payment', weight: 2 },
    { term: 'm-card', weight: 2 },
    { term: 'mcard', weight: 2 },
    { term: 'card', weight: 1 },
    { term: 'recharge', weight: 2 },
    { term: 'balance', weight: 2 },
    { term: 'money', weight: 1 },
    { term: 'cash', weight: 1 },
    { term: 'discount', weight: 1 },
    { term: 'fine', weight: 2 },
    { term: 'penalty', weight: 2 },
    { term: 'receipt', weight: 1 },
    { term: 'kiosk', weight: 1 },
    // Hindi
    { term: 'टिकट', weight: 2 },
    { term: 'किराया', weight: 3 },
    { term: 'फेयर', weight: 3 },
    { term: 'टोकन', weight: 2 },
    { term: 'भुगतान', weight: 2 },
    { term: 'रिफंड', weight: 3 },
    { term: 'शुल्क', weight: 2 },
    { term: 'कीमत', weight: 2 },
    { term: 'कार्ड', weight: 1 },
    { term: 'रिचार्ज', weight: 2 },
    { term: 'बैलेंस', weight: 2 },
    { term: 'पैसा', weight: 1 },
    { term: 'नकद', weight: 1 },
    { term: 'जुर्माना', weight: 2 },
    // Gujarati
    { term: 'ટિકિટ', weight: 2 },
    { term: 'કિંમત', weight: 3 },
    { term: 'ભાડું', weight: 3 },
    { term: 'ફેર', weight: 3 },
    { term: 'ટોકન', weight: 2 },
    { term: 'ચુકવણી', weight: 2 },
    { term: 'રદ્દિકરણ', weight: 3 },
    { term: 'શુલ્ક', weight: 2 },
    { term: 'કાર્ડ', weight: 1 },
    { term: 'રિચાર્જ', weight: 2 },
    { term: 'બેલન્સ', weight: 2 },
    { term: 'પૈસા', weight: 1 },
    { term: 'નકદ', weight: 1 },
    { term: 'જરમાણું', weight: 2 },
  ],
  Lifts: [
    // English
    { term: 'lift', weight: 3 },
    { term: 'elevator', weight: 3 },
    { term: 'escalator', weight: 3 },
    { term: 'escalators', weight: 3 },
    { term: 'wheelchair', weight: 2 },
    { term: 'disabled', weight: 2 },
    { term: 'accessibility', weight: 2 },
    { term: 'broken', weight: 2 },
    { term: 'jammed', weight: 2 },
    { term: 'buttons', weight: 1 },
    // Hindi
    { term: 'लिफ्ट', weight: 3 },
    { term: 'एस्केलेटर', weight: 3 },
    { term: 'व्हीलचेयर', weight: 2 },
    { term: 'दिव्यांग', weight: 2 },
    { term: 'अपंग', weight: 2 },
    { term: 'टूटा', weight: 2 },
    { term: 'काम नहीं', weight: 2 },
    { term: 'जाम', weight: 2 },
    // Gujarati
    { term: 'લિફ્ટ', weight: 3 },
    { term: 'એસ્કેલેટર', weight: 3 },
    { term: 'વ્હીલચેર', weight: 2 },
    { term: 'દિવ્યાંગ', weight: 2 },
    { term: 'અપંગ', weight: 2 },
    { term: 'ટૂટી', weight: 2 },
    { term: 'કામ નથી', weight: 2 },
    { term: 'જામ', weight: 2 },
  ],
  'Staff Behaviour': [
    // English
    { term: 'rude', weight: 3 },
    { term: 'staff', weight: 2 },
    { term: 'behaviour', weight: 3 },
    { term: 'behavior', weight: 3 },
    { term: 'officer', weight: 2 },
    { term: 'attendant', weight: 2 },
    { term: 'employee', weight: 2 },
    { term: 'guard', weight: 2 },
    { term: 'security', weight: 1 },
    { term: 'ignored', weight: 2 },
    { term: 'ignore', weight: 2 },
    { term: 'unhelpful', weight: 3 },
    { term: 'abusive', weight: 3 },
    { term: 'shouting', weight: 2 },
    { term: 'shouted', weight: 2 },
    { term: 'yelled', weight: 2 },
    { term: 'argument', weight: 2 },
    { term: 'refused', weight: 2 },
    { term: 'negligent', weight: 2 },
    { term: 'senior', weight: 1 },
    // Hindi
    { term: 'कर्मचारी', weight: 3 },
    { term: 'व्यवहार', weight: 3 },
    { term: 'रुख', weight: 3 },
    { term: 'गार्ड', weight: 2 },
    { term: 'सुरक्षाकर्मी', weight: 2 },
    { term: 'मदद', weight: 1 },
    { term: 'नज़रअंदाज़', weight: 2 },
    { term: 'असभ्य', weight: 3 },
    { term: 'गाली', weight: 3 },
    { term: 'चिल्लाया', weight: 2 },
    { term: 'अनदेखी', weight: 2 },
    { term: 'इनकार', weight: 2 },
    // Gujarati
    { term: 'કર્મચારી', weight: 3 },
    { term: 'વર્તન', weight: 3 },
    { term: 'અસભ્ય', weight: 3 },
    { term: 'ગાળી', weight: 3 },
    { term: 'ગાર્ડ', weight: 2 },
    { term: 'સુરક્ષાકર્મી', weight: 2 },
    { term: 'મદદ', weight: 1 },
    { term: 'અવહેલન', weight: 2 },
    { term: 'અનદેખી', weight: 2 },
    { term: 'ઇનકાર', weight: 2 },
    { term: 'અધિકારી', weight: 2 },
  ],
};

export interface MatchedSignal {
  department: Department;
  term: string;
  weight: number;
}

export interface ClassificationResult {
  department: DepartmentOrUnclassified;
  scores: Record<string, number>;
  matchedSignals: MatchedSignal[];
}

function termMatches(text: string, term: string): boolean {
  // Latin terms use word boundaries (avoids false hits like "aag" in "again").
  // Indic-script terms use substring matching.
  if (/^[a-z0-9 .-]+$/i.test(term)) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  return text.toLowerCase().includes(term.toLowerCase());
}

export function classify(text: string): ClassificationResult {
  const scores: Record<string, number> = {};
  const matchedSignals: MatchedSignal[] = [];

  for (const department of DEPARTMENTS) {
    let score = 0;
    for (const { term, weight } of DEPARTMENT_KEYWORDS[department]) {
      if (termMatches(text, term)) {
        score += weight;
        matchedSignals.push({ department, term, weight });
      }
    }
    scores[department] = score;
  }

  const best = DEPARTMENTS.reduce((a, b) => (scores[b] > scores[a] ? b : a));
  return {
    department: scores[best] > 0 ? best : 'Unclassified',
    scores,
    matchedSignals: matchedSignals.sort((a, b) => b.weight - a.weight),
  };
}

// ---------------------------------------------------------------------------
// Urgency assessment (transparent, configurable rules)
// ---------------------------------------------------------------------------

export type UrgencyBand = 'low' | 'normal' | 'high' | 'urgent';

export interface UrgencyReason {
  ruleId: string;
  description: string;
  points: number;
}

export interface UrgencyResult {
  score: number;
  band: UrgencyBand;
  reasons: UrgencyReason[];
}

interface UrgencyContext {
  text: string;
  department: DepartmentOrUnclassified;
  channel: string;
}

interface UrgencyRule {
  id: string;
  description: string;
  points: number;
  pattern: RegExp;
  appliesTo?: (ctx: UrgencyContext) => boolean;
}

// NOTE: these rules are the single source of truth for urgency scoring.
// They are exported so they can be reviewed, and edited to re-tune the
// prototype. Scores are prototype decision support, NOT official
// operational severity ratings.
export const URGENCY_RULES: UrgencyRule[] = [
  {
    id: 'fire-signal',
    description: 'Fire/smoke signal in complaint text',
    points: 50,
    pattern: /\b(fire|smoke|smoking|flame|flames)\b|आग|धुआं|धुंध|આગ|ધુમ્મસ|ધુમ/i,
  },
  {
    id: 'trapped-signal',
    description: 'Person trapped/stuck/blocked-egress signal',
    points: 50,
    pattern: /\b(trapped|stuck|locked)\b|फंस|जाम|ફંસ|જામ|બંધ/i,
  },
  {
    id: 'harm-signal',
    description: 'Personal harm / crime signal',
    points: 40,
    pattern:
      /\b(accident|injur|hurt|assault|harass|theft|robbery|steal|fight|weapon|brawl|collapse)\b|दुर्घटना|चोट|चिंगाड़ी|हमला|चोरी|દુર્ઘટના|અપઘાત|જોખમ|ચોરી/i,
  },
  {
    id: 'hazard-signal',
    description: 'Slip/fall/water hazard signal',
    points: 20,
    pattern: /\b(spill|spilled|slippery|slip|leak|leakage|wet floor|warning)\b|रिसाव|गीला|રિસાવ|ગીળો|સ્લિપ|ટપકી/i,
  },
  {
    id: 'safety-category',
    description: 'Classified into the Safety department',
    points: 15,
    pattern: /./,
    appliesTo: (ctx) => ctx.department === 'Safety',
  },
  {
    id: 'urgent-language',
    description: 'Explicit urgency language ("urgent", "jaldi", "please help")',
    points: 20,
    pattern:
      /\b(urgent|urgently|immediately|emergency|asap|help|jaldi|turant|madad)\b|जल्दी|तुरंत|मदद|જલદ|તુરંત|મદદ/i,
  },
  {
    id: 'in-person-channel',
    description: 'Reported in person at the station',
    points: 10,
    pattern: /./,
    appliesTo: (ctx) => ctx.channel === 'in-person',
  },
  {
    id: 'accessibility-impact',
    description: 'Accessibility impact (wheelchair / disabled / senior passengers)',
    points: 30,
    pattern: /\b(wheelchair|disabled|accessibility|senior)\b|व्हीलचेयर|दिव्यांग|વ્હીલચેર|દિવ્યાંગ/i,
  },
  {
    id: 'service-outage',
    description: 'Service outage ("not working", "broken", "jammed")',
    points: 10,
    pattern: /\b(not working|broken|jammed|out of order)\b|काम नहीं|टूटा|કામ નથી|ટૂટી/i,
  },
];

export function assessUrgency(
  text: string,
  department: DepartmentOrUnclassified,
  channel: string,
): UrgencyResult {
  const ctx: UrgencyContext = { text, department, channel };
  const reasons: UrgencyReason[] = [];
  let score = 0;

  for (const rule of URGENCY_RULES) {
    if (rule.appliesTo && !rule.appliesTo(ctx)) continue;
    if (!rule.appliesTo && !rule.pattern.test(text)) continue;
    score += rule.points;
    reasons.push({
      ruleId: rule.id,
      description: rule.description,
      points: rule.points,
    });
  }

  score = Math.min(100, score);
  const band: UrgencyBand =
    score >= 65 ? 'urgent' : score >= 40 ? 'high' : score >= 20 ? 'normal' : 'low';

  return { score, band, reasons };
}

// ---------------------------------------------------------------------------
// Response drafting (explicit templates per language)
// ---------------------------------------------------------------------------

const DEPARTMENT_HI: Record<Department, string> = {
  Safety: 'सुरक्षा',
  Cleanliness: 'स्वच्छता',
  Fare: 'किराया',
  Lifts: 'लिफ्ट',
  'Staff Behaviour': 'कर्मचारी व्यवहार',
};

const DEPARTMENT_GU: Record<Department, string> = {
  Safety: 'સુરક્ષા',
  Cleanliness: 'સ્વચ્છતા',
  Fare: 'કિંમત',
  Lifts: 'લિફ્ટ',
  'Staff Behaviour': 'કર્મચારી વર્તન',
};

export interface DraftResult {
  text: string;
  languageUsed: 'en' | 'hi' | 'gu';
  note: string;
}

interface DraftInput {
  language: LanguageCode;
  department: DepartmentOrUnclassified;
  station: string;
  caseId: string;
}

export function draftResponse(input: DraftInput): DraftResult {
  const { language, department, station, caseId } = input;
  const deptLabel =
    department === 'Unclassified'
      ? null
      : { en: department, hi: DEPARTMENT_HI[department], gu: DEPARTMENT_GU[department] };

  const issueEn = deptLabel ? `a ${deptLabel.en} issue` : 'your complaint';
  const issueHi = deptLabel ? `${deptLabel.hi} संबंधी शिकायत` : 'शिकायत';
  const issueGu = deptLabel ? `${deptLabel.gu} સંબંધિત ફરિયાદ` : 'ફરિયાદ';

  switch (language) {
    case 'hi':
      return {
        languageUsed: 'hi',
        note: 'Hindi draft (template).',
        text: `${station} स्टेशन पर ${issueHi} के लिए धन्यवाद (केस ${caseId})। हमारी स्टेशन टीम को सूचित किया गया है और वे इसकी समीक्षा करेंगे। यह एक संपादन योग्य मसौदा है — यह भेजा या अनुमोदित नहीं गया है।`,
      };
    case 'gu':
      return {
        languageUsed: 'gu',
        note: 'Gujarati draft (template).',
        text: `${station} સ્ટેશન પર ${issueGu} માટે આભાર (કેસ ${caseId})। આમારી સ્ટેશન ટીમને જાહેર કરવામાં આવી છે અને તેની સમીક્ષા કરશે. આ એક સુધારી શકાય તેવો ડ્રાફ્ટ છે — તે મોકલવામાં અથવા મંજૂર કરવામાં નથી આવ્યો.`,
      };
    case 'gujlish':
      return {
        languageUsed: 'en',
        note: 'Gujlish complaint — no Gujlish template yet; English draft used.',
        text: `Thank you for contacting MetroResolve about ${issueEn} at ${station} (case ${caseId}). Our station team has been notified and will review it. This is an editable draft acknowledgement — it has not been sent or approved.`,
      };
    case 'hinglish':
      return {
        languageUsed: 'en',
        note: 'Hinglish complaint — no Hinglish template yet; English draft used.',
        text: `Thank you for contacting MetroResolve about ${issueEn} at ${station} (case ${caseId}). Our station team has been notified and will review it. This is an editable draft acknowledgement — it has not been sent or approved.`,
      };
    default:
      return {
        languageUsed: 'en',
        note: 'English draft (template).',
        text: `Thank you for contacting MetroResolve about ${issueEn} at ${station} (case ${caseId}). Our station team has been notified and will review it. This is an editable draft acknowledgement — it has not been sent or approved.`,
      };
  }
}
