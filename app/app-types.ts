export type View =
  | { kind: "home" }
  | { kind: "roadmap" }
  | { kind: "assessment" }
  | { kind: "parent" }
  | { kind: "week"; id: number }
  | { kind: "lesson"; id: number };

export type LessonRecord = {
  score: number;
  firstTry: number;
  completedAt: string;
  measurementVersion: 2 | 3;
  speakingConfidence?: number;
  speakingSamples?: number;
};

export type Profile = {
  schemaVersion: 3;
  profileId: string;
  nickname: string;
  createdAt: string;
  savedAt: string;
  diagnostic?: { score: number; band: LearningBand; takenAt: string; measurementVersion: 3 };
  completedLessons: Record<string, LessonRecord>;
  wordMemory: Record<string, { strength: number; dueAt: string; seen: number }>;
  activityDates: string[];
  settings: { soundEffects: boolean };
};

export type LearningBand = "Gỡ nút" | "Vừa sức" | "Bứt phá";
