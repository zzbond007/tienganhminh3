import { averageSpeakingConfidence } from "./learning-integrity";
import { worlds } from "./english-curriculum";
import type { LessonRecord, Profile } from "./app-types";

export function newProfile(): Profile {
  const now = new Date().toISOString();
  return {
    schemaVersion: 3,
    profileId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `er-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nickname: "Nhà thám hiểm",
    createdAt: now,
    savedAt: now,
    completedLessons: {},
    wordMemory: {},
    activityDates: [],
    settings: { soundEffects: true },
  };
}

export function localDay(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function migrateProfile(value: unknown): Profile | undefined {
  if (!value || typeof value !== "object") return undefined;
  type StoredRecord = Partial<LessonRecord> & { confidence?: number };
  const raw = value as Partial<Omit<Profile, "completedLessons">> & { schemaVersion?: number; completedLessons?: Record<string, StoredRecord> };
  if (!raw.completedLessons || !raw.wordMemory) return undefined;
  const currentMeasurement = raw.schemaVersion === 3;
  const completedLessons = Object.fromEntries(Object.entries(raw.completedLessons).flatMap(([id, record]) => {
    if (typeof record.score !== "number" || typeof record.firstTry !== "number" || !record.completedAt) return [];
    const normalized: LessonRecord = {
      score: record.score,
      firstTry: record.firstTry,
      completedAt: record.completedAt,
      measurementVersion: currentMeasurement && record.measurementVersion === 3 ? 3 : 2,
    };
    if (normalized.measurementVersion === 3 && typeof record.speakingConfidence === "number" && (record.speakingSamples ?? 0) > 0) {
      normalized.speakingConfidence = record.speakingConfidence;
      normalized.speakingSamples = record.speakingSamples;
    }
    return [[id, normalized]];
  }));
  const datesFromLessons = Object.values(completedLessons)
    .map((record) => record?.completedAt)
    .filter((date): date is string => Boolean(date))
    .map((date) => localDay(new Date(date)));
  return {
    ...newProfile(),
    ...raw,
    schemaVersion: 3,
    diagnostic: currentMeasurement && raw.diagnostic?.measurementVersion === 3 ? raw.diagnostic : undefined,
    completedLessons,
    wordMemory: raw.wordMemory,
    activityDates: [...new Set(raw.activityDates?.length ? raw.activityDates : datesFromLessons)].sort(),
    settings: { soundEffects: raw.settings?.soundEffects !== false },
  };
}

export function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

export function calculateStreak(profile: Profile) {
  const days = new Set(profile.activityDates);
  const cursor = new Date();
  if (!days.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDay(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

export function earnedWorlds(profile: Profile) {
  return worlds.filter((_, worldIndex) => Array.from({ length: 20 }, (_, index) => worldIndex * 20 + index + 1).every((lesson) => profile.completedLessons[lesson]));
}

export function trackFromProfile(profile: Profile) {
  const recent = Object.values(profile.completedLessons)
    .filter((record) => record.measurementVersion === 3)
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
    .slice(0, 8);
  if (!recent.length) return profile.diagnostic?.band ?? "Vừa sức";
  const score = average(recent.map((record) => record.score));
  const confidence = averageSpeakingConfidence(recent);
  if (score < 60 || (confidence !== undefined && confidence < 45)) return "Gỡ nút";
  if (score >= 86 && confidence !== undefined && confidence >= 75) return "Bứt phá";
  return "Vừa sức";
}
