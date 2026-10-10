// MetroResolve — case model and factory.

import {
  assessUrgency,
  classify,
  detectLanguage,
  draftResponse,
  type DepartmentOrUnclassified,
  type LanguageCode,
  type UrgencyBand,
} from './nlp';

export type CaseStatus = 'pending' | 'in-progress' | 'resolved';
export type SyncStatus = 'pending' | 'synced' | 'failed';
export type CaseOrigin = 'sample-batch' | 'manual';

export interface CaseRecord {
  id: string;
  sourceText: string;
  channel: string;
  station: string;
  language: LanguageCode;
  languageConfidence: 'high' | 'medium' | 'low';
  languageNote: string;
  department: DepartmentOrUnclassified;
  departmentScores: Record<string, number>;
  matchedSignals: { department: string; term: string; weight: number }[];
  urgencyScore: number;
  urgencyBand: UrgencyBand;
  urgencyReasons: { ruleId: string; description: string; points: number }[];
  responseDraft: string;
  responseLanguage: 'en' | 'hi' | 'gu';
  responseNote: string;
  status: CaseStatus;
  origin: CaseOrigin;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  syncAttempts: number;
  lastSyncError?: string;
  acknowledgedAt?: string;
  aiNote?: string;
}

export interface NewCaseInput {
  sourceText: string;
  channel: string;
  station: string;
  origin?: CaseOrigin;
}

export function createCase(input: NewCaseInput): CaseRecord {
  const lang = detectLanguage(input.sourceText);
  const cls = classify(input.sourceText);
  const urgency = assessUrgency(input.sourceText, cls.department, input.channel);
  const now = new Date().toISOString();

  return {
    id: '', // assigned by the caller (id sequencing lives in App)
    sourceText: input.sourceText.trim(),
    channel: input.channel,
    station: input.station,
    language: lang.language,
    languageConfidence: lang.confidence,
    languageNote: lang.note,
    department: cls.department,
    departmentScores: cls.scores,
    matchedSignals: cls.matchedSignals,
    urgencyScore: urgency.score,
    urgencyBand: urgency.band,
    urgencyReasons: urgency.reasons,
    responseDraft: '', // filled by assignCaseId below
    responseLanguage: 'en',
    responseNote: '',
    status: 'pending',
    origin: input.origin ?? 'manual',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    syncAttempts: 0,
  };
}

// The draft template needs the final case id, so it is applied
// after the id is assigned. An already-present draft (e.g. from
// the optional local model) is preserved.
export function finalizeCase(record: CaseRecord): CaseRecord {
  if (record.responseDraft) return record;
  const draft = draftResponse({
    language: record.language,
    department: record.department,
    station: record.station,
    caseId: record.id,
  });
  return {
    ...record,
    responseDraft: draft.text,
    responseLanguage: draft.languageUsed,
    responseNote: draft.note,
  };
}

export function nextCaseId(cases: CaseRecord[]): string {
  let max = 0;
  for (const c of cases) {
    const m = /^MR-(\d+)$/.exec(c.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `MR-${String(max + 1).padStart(4, '0')}`;
}
