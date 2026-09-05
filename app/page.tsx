/* eslint-disable @next/next/no-img-element -- local SVG sprites and generated QR data URLs are already optimized/offline assets */
"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Download,
  Flame,
  Grid2X2,
  Headphones,
  Home,
  LockKeyhole,
  Map,
  Mic,
  Music2,
  Play,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Trophy,
  Upload,
  UserRound,
  Volume2,
} from "lucide-react";
import QRCode from "qrcode";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  lessonToSession,
  lessonToWeek,
  programFacts,
  sessionKinds,
  weeks,
  worlds,
  type WeekPlan,
  type WordCard,
} from "./english-curriculum";

type View =
  | { kind: "home" }
  | { kind: "roadmap" }
  | { kind: "assessment" }
  | { kind: "parent" }
  | { kind: "week"; id: number }
  | { kind: "lesson"; id: number };

type LessonRecord = {
  score: number;
  confidence: number;
  firstTry: number;
  completedAt: string;
};

type Profile = {
  schemaVersion: 2;
  profileId: string;
  nickname: string;
  createdAt: string;
  savedAt: string;
  diagnostic?: { score: number; band: "Gỡ nút" | "Vừa sức" | "Bứt phá"; takenAt: string };
  completedLessons: Record<string, LessonRecord>;
  wordMemory: Record<string, { strength: number; dueAt: string; seen: number }>;
  activityDates: string[];
  settings: { soundEffects: boolean };
};

const STORAGE_KEY = "english-raccoon-learning-v1";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function newProfile(): Profile {
  const now = new Date().toISOString();
  return {
    schemaVersion: 2,
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

function localDay(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function migrateProfile(value: unknown): Profile | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<Profile> & { schemaVersion?: number };
  if (!raw.completedLessons || !raw.wordMemory) return undefined;
  const datesFromLessons = Object.values(raw.completedLessons)
    .map((record) => record?.completedAt)
    .filter((date): date is string => Boolean(date))
    .map((date) => localDay(new Date(date)));
  return {
    ...newProfile(),
    ...raw,
    schemaVersion: 2,
    completedLessons: raw.completedLessons,
    wordMemory: raw.wordMemory,
    activityDates: [...new Set(raw.activityDates?.length ? raw.activityDates : datesFromLessons)].sort(),
    settings: { soundEffects: raw.settings?.soundEffects !== false },
  };
}

function safeNumber(value: string | undefined, min: number, max: number) {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : min;
}

function routeFromPath(pathname: string): View {
  const normalized = pathname.replace(BASE_PATH, "").replace(/\/+$/, "") || "/";
  if (normalized === "/roadmap") return { kind: "roadmap" };
  if (normalized === "/assessment") return { kind: "assessment" };
  if (normalized === "/parent") return { kind: "parent" };
  const weekMatch = normalized.match(/^\/week\/(\d+)$/);
  if (weekMatch) return { kind: "week", id: safeNumber(weekMatch[1], 1, 36) };
  const lessonMatch = normalized.match(/^\/lesson\/(\d+)$/);
  if (lessonMatch) return { kind: "lesson", id: safeNumber(lessonMatch[1], 1, 180) };
  return { kind: "home" };
}

function routeFromBrowser(): View {
  const redirected = new URLSearchParams(window.location.search).get("route");
  if (redirected) {
    const target = `${BASE_PATH}${redirected.startsWith("/") ? redirected : `/${redirected}`}`;
    window.history.replaceState({}, "", target);
    return routeFromPath(target);
  }
  return routeFromPath(window.location.pathname);
}

function pathFor(view: View) {
  if (view.kind === "home") return "/";
  if (view.kind === "week" || view.kind === "lesson") return `/${view.kind}/${view.id}/`;
  return `/${view.kind}/`;
}

function useProfile() {
  const [profile, setProfile] = useState<Profile>(() => newProfile());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = migrateProfile(JSON.parse(stored));
          if (parsed) setProfile(parsed);
        }
      } catch {
        // A damaged local value must never block the child from opening the app.
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const next = { ...profile, savedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [profile, ready]);

  return { profile, setProfile, ready };
}

function speak(text: string, slow = false) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = slow ? 0.7 : 0.88;
  utterance.pitch = 1.02;
  const voices = window.speechSynthesis.getVoices();
  const preferred = /samantha|ava|aria|jenny|zira|google.*english|serena|daniel/i;
  const english = voices.find((voice) => voice.lang.startsWith("en") && voice.localService && preferred.test(voice.name))
    ?? voices.find((voice) => voice.lang.startsWith("en") && voice.localService)
    ?? voices.find((voice) => voice.lang.startsWith("en"));
  if (english) utterance.voice = english;
  window.speechSynthesis.speak(utterance);
  return true;
}

function playFeedback(kind: "correct" | "try" | "complete") {
  if (typeof window === "undefined" || document.documentElement.dataset.sfx === "off") return;
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const notes = kind === "correct" ? [523, 659] : kind === "complete" ? [523, 659, 784] : [220, 196];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "try" ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.1, context.currentTime + index * 0.1 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.1 + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + index * 0.1);
    oscillator.stop(context.currentTime + index * 0.1 + 0.18);
  });
  window.setTimeout(() => void context.close(), 650);
}

function illustrationFile(symbol: string) {
  return Array.from(symbol)
    .map((character) => character.codePointAt(0)?.toString(16))
    .filter((code) => code && code !== "fe0f")
    .join("-");
}

function VocabularyArt({ symbol, label, size = "medium" }: { symbol: string; label: string; size?: "small" | "medium" | "large" }) {
  const [fallback, setFallback] = useState(false);
  if (fallback) return <span className={`art-fallback art-${size}`} role="img" aria-label={label}>{symbol}</span>;
  return <img className={`vocabulary-art art-${size}`} src={`${BASE_PATH}/illustrations/${illustrationFile(symbol)}.svg`} alt={label} draggable={false} onError={() => setFallback(true)} />;
}

function Rory({ mood = "listen" }: { mood?: "listen" | "celebrate" | "brave" }) {
  return <div className={`rory rory-${mood}`} aria-label={mood === "celebrate" ? "Rory đang vỗ tay chúc mừng" : mood === "brave" ? "Rory đang giơ cờ cổ vũ" : "Rory đang lắng nghe"}><VocabularyArt symbol="🦝" label="Rory" size="large" /><span className="rory-action" aria-hidden="true">{mood === "celebrate" ? <Trophy /> : mood === "brave" ? "🚩" : <Headphones />}</span></div>;
}

function calculateStreak(profile: Profile) {
  const days = new Set(profile.activityDates);
  const cursor = new Date();
  if (!days.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDay(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

function earnedWorlds(profile: Profile) {
  return worlds.filter((_, worldIndex) => Array.from({ length: 20 }, (_, index) => worldIndex * 20 + index + 1).every((lesson) => profile.completedLessons[lesson]));
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function trackFromProfile(profile: Profile): LearningBand {
  const recent = Object.values(profile.completedLessons).slice(-8);
  if (!recent.length) return profile.diagnostic?.band ?? "Vừa sức";
  const score = average(recent.map((record) => record.score));
  const confidence = average(recent.map((record) => record.confidence));
  if (score < 60 || confidence < 45) return "Gỡ nút";
  if (score >= 86 && confidence >= 75) return "Bứt phá";
  return "Vừa sức";
}

function AppShell({ active, profile, children, navigate }: { active: View["kind"]; profile: Profile; children: React.ReactNode; navigate: (view: View) => void }) {
  const completed = Object.keys(profile.completedLessons).length;
  const streak = calculateStreak(profile);
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate({ kind: "home" })} aria-label="Về trang chính">
          <span className="brand-mark" aria-hidden="true"><VocabularyArt symbol="🦝" label="" size="small" /></span>
          <span><strong>English Raccoon</strong><small>Tiếng Anh thực hành lớp 3</small></span>
        </button>
        <div className="top-stats">
          <span className="streak-pill" aria-label={`Chuỗi học ${streak} ngày`}><Flame aria-hidden="true" /><b>{streak}</b></span>
          <div className="top-progress" aria-label={`${completed} trên 180 buổi đã hoàn thành`}>
            <Sparkles size={18} aria-hidden="true" /><span><b>{completed}</b>/180 buổi</span>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <nav className="bottom-nav" aria-label="Điều hướng chính">
        <NavButton active={active === "home"} icon={<Home />} label="Hôm nay" onClick={() => navigate({ kind: "home" })} />
        <NavButton active={active === "roadmap" || active === "week" || active === "lesson"} icon={<Map />} label="Lộ trình" onClick={() => navigate({ kind: "roadmap" })} />
        <NavButton active={active === "assessment"} icon={<BookOpen />} label="Khám phá" onClick={() => navigate({ kind: "assessment" })} />
        <NavButton active={active === "parent"} icon={<UserRound />} label="Đồng hành" onClick={() => navigate({ kind: "parent" })} />
      </nav>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? "nav-button active" : "nav-button"} onClick={onClick} aria-current={active ? "page" : undefined}>{icon}<span>{label}</span></button>;
}

function HomeView({ profile, navigate }: { profile: Profile; navigate: (view: View) => void }) {
  const completed = Object.keys(profile.completedLessons).map(Number);
  const nextLesson = Math.min(180, Array.from({ length: 180 }, (_, index) => index + 1).find((id) => !completed.includes(id)) ?? 180);
  const weekNumber = lessonToWeek(nextLesson);
  const sessionIndex = lessonToSession(nextLesson);
  const week = weeks[weekNumber - 1];
  const session = sessionKinds[sessionIndex];
  const track = trackFromProfile(profile);
  const dueWords = Object.values(profile.wordMemory).filter((item) => item.dueAt <= profile.savedAt).length;
  const streak = calculateStreak(profile);
  const badges = earnedWorlds(profile);

  return (
    <div className="page home-page">
      <section className="welcome-row">
        <div><p className="eyebrow">Xin chào, {profile.nickname}!</p><h1>Ready for English?</h1><p>Mỗi ngày một chút: nghe rõ hơn, nói tự tin hơn, nhớ từ lâu hơn.</p></div>
        <div className="welcome-stats"><div className="level-chip"><span>Nhịp hiện tại</span><b>{track}</b></div><div className="level-chip streak-chip"><span>Chuỗi học</span><b><Flame /> {streak} ngày</b></div></div>
      </section>
      <section className="today-card" style={{ "--world": worlds[week.world - 1].color } as React.CSSProperties}>
        <div className="today-copy">
          <p className="eyebrow">Tuần {week.week} · Buổi {sessionIndex + 1}</p>
          <h2>{session.icon} {session.title}</h2>
          <p className="today-title">{week.title}</p>
          <p>{session.subtitle}. Khoảng {programFacts.minutes} phút.</p>
          <div className="word-peek" aria-label="Từ của tuần">{week.words.slice(0, 4).map((word) => <span key={word.en}><VocabularyArt symbol={word.icon} label={word.vi} size="small" /> {word.en}</span>)}</div>
          <Button className="primary-action" onClick={() => navigate({ kind: "lesson", id: nextLesson })}>Học buổi hôm nay <ArrowRight aria-hidden="true" /></Button>
        </div>
        <div className="mascot-scene"><span className="sound-wave">listen · think · speak!</span><Rory mood="listen" /></div>
      </section>
      <section className="quick-grid" aria-label="Hoạt động nhanh">
        <button className="quick-card coral" onClick={() => speak(week.model)}><span className="quick-icon"><Volume2 /></span><span><b>Nghe câu hôm nay</b><small>{week.model}</small></span></button>
        <button className="quick-card teal" onClick={() => navigate({ kind: "week", id: weekNumber })}><span className="quick-icon"><RotateCcw /></span><span><b>{dueWords ? `${dueWords} từ đến lượt ôn` : "Ôn đúng lúc"}</b><small>Xem từ và hoạt động của tuần {weekNumber}</small></span></button>
      </section>
      <section className="progress-panel">
        <div className="section-heading"><div><p className="eyebrow">Hành trình 9 thế giới</p><h2>Con đang tiến về phía trước</h2></div><button className="text-button" onClick={() => navigate({ kind: "roadmap" })}>Xem đủ 36 tuần <ArrowRight /></button></div>
        <Progress value={(completed.length / 180) * 100} aria-label="Tiến độ năm học" />
        <div className="world-strip">
          {worlds.map((world, index) => {
            const worldCompleted = completed.filter((lesson) => lessonToWeek(lesson) > index * 4 && lessonToWeek(lesson) <= index * 4 + 4).length;
            return <button key={world.title} onClick={() => navigate({ kind: "week", id: index * 4 + 1 })}><i style={{ background: world.color }}>{index + 1}</i><span>{world.title}</span><small>{worldCompleted}/20</small></button>;
          })}
        </div>
      </section>
      <section className="badge-shelf" aria-label="Bộ sưu tập huy hiệu">
        <div><p className="eyebrow">Bộ sưu tập của con</p><h2>{badges.length ? `${badges.length} huy hiệu thế giới` : "Huy hiệu đầu tiên đang chờ"}</h2><p>Hoàn thành trọn 20 buổi của một thế giới để mở khóa huy hiệu.</p></div>
        <div className="badge-row">{worlds.map((world, index) => { const earned = badges.includes(world); return <span key={world.title} className={earned ? "world-medal earned" : "world-medal"} style={{ "--medal": world.color } as React.CSSProperties} title={world.title}><Trophy />{index + 1}</span>; })}</div>
      </section>
    </div>
  );
}

function RoadmapView({ profile, navigate }: { profile: Profile; navigate: (view: View) => void }) {
  return (
    <div className="page roadmap-page">
      <div className="page-intro"><p className="eyebrow">36 tuần · 180 buổi</p><h1>Bản đồ English Raccoon</h1><p>Mỗi thế giới gồm bốn tuần. Mỗi tuần đi qua đủ nghe, nói, đọc, nhớ từ và giao tiếp.</p></div>
      <div className="world-list">
        {worlds.map((world, worldIndex) => (
          <section className="world-section" key={world.title} style={{ "--world": world.color } as React.CSSProperties}>
            <div className="world-heading"><span>{worldIndex + 1}</span><div><p>Thế giới {worldIndex + 1}</p><h2>{world.title}</h2><small>{world.subtitle}</small></div></div>
            <div className="week-grid">
              {weeks.slice(worldIndex * 4, worldIndex * 4 + 4).map((week) => {
                const done = Array.from({ length: 5 }, (_, day) => week.week * 5 - 4 + day).filter((lesson) => profile.completedLessons[lesson]).length;
                return <button className="week-tile" key={week.week} onClick={() => navigate({ kind: "week", id: week.week })}><span className="week-number">Tuần {week.week}</span><b>{week.title}</b><small>{done}/5 buổi</small><Progress value={(done / 5) * 100} aria-label={`${done} trên 5 buổi`} /></button>;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function WeekView({ id, profile, navigate }: { id: number; profile: Profile; navigate: (view: View) => void }) {
  const week = weeks[id - 1];
  const world = worlds[week.world - 1];
  return (
    <div className="page week-page">
      <button className="back-button" onClick={() => navigate({ kind: "roadmap" })}><ArrowLeft /> Bản đồ 36 tuần</button>
      <section className="week-hero" style={{ "--world": world.color } as React.CSSProperties}>
        <div><p className="eyebrow">Thế giới {week.world} · Tuần {week.week}</p><h1>{week.title}</h1><p>{week.scene}</p><div className="model-sentence"><button onClick={() => speak(week.model)} aria-label="Nghe câu mẫu"><Volume2 /></button><span><small>Câu con sẽ dùng</small><b>{week.model}</b></span></div><button className="print-week" onClick={() => window.print()}><Printer /> In phiếu khám phá tuần</button></div>
        <div className="week-badge"><b>{week.words.length}</b><span>từ trọng tâm</span></div>
      </section>
      <section><div className="section-heading"><div><p className="eyebrow">Kho từ tuần này</p><h2>Nhìn tranh · đoán ý · nghe để kiểm tra</h2></div></div><div className="vocab-grid">{week.words.map((word) => <button className="vocab-card" key={word.en} onClick={() => speak(word.en, true)}><VocabularyArt symbol={word.icon} label={word.vi} /><b>{word.en}</b><small>{word.vi}</small><Volume2 /></button>)}</div></section>
      <section><div className="section-heading"><div><p className="eyebrow">Năm buổi ngắn</p><h2>Một vòng học trọn vẹn</h2></div></div><div className="session-list">{sessionKinds.map((session, index) => {
        const lessonId = (id - 1) * 5 + index + 1;
        const record = profile.completedLessons[lessonId];
        return <button key={session.key} className="session-row" onClick={() => navigate({ kind: "lesson", id: lessonId })}><span className="session-icon">{record ? "✓" : session.icon}</span><span><small>Buổi {index + 1}</small><b>{session.title}</b><em>{session.subtitle}</em></span><span className={record ? "done-pill" : "go-pill"}>{record ? `${record.score}%` : "Bắt đầu"}</span></button>;
      })}</div></section>
      <section className="print-sheet" aria-hidden="true"><h1>English Raccoon · Tuần {week.week}</h1><h2>{week.title}</h2><p>{week.scene}</p><div className="print-words">{week.words.map((word) => <div key={word.en}><VocabularyArt symbol={word.icon} label={word.vi} /><b>{word.en}</b><span>{word.vi}</span></div>)}</div><h3>Câu dùng trong đời sống</h3><p className="print-model">{week.model}</p><h3>Thử thách cùng gia đình</h3><p>Không nhìn màn hình: chọn ba đồ vật hoặc tình huống quanh nhà, dùng ít nhất hai từ trong tuần để nói một câu mới. Người lớn chỉ hỏi “Con muốn nói thêm gì?”, không sửa giữa lúc con đang nói.</p></section>
    </div>
  );
}

function optionsFor(words: WordCard[], targetIndex: number, count = 4) {
  const selected: WordCard[] = [words[targetIndex % words.length]];
  let cursor = (targetIndex * 3 + 1) % words.length;
  while (selected.length < Math.min(count, words.length)) {
    const candidate = words[cursor];
    if (!selected.some((word) => word.en === candidate.en)) selected.push(candidate);
    cursor = (cursor + 3) % words.length;
  }
  return selected.sort((a, b) => ((a.en.charCodeAt(0) + targetIndex) % 7) - ((b.en.charCodeAt(0) + targetIndex) % 7));
}

function Recorder({ onPractised }: { onPractised: (confidence: number) => void }) {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
      recorder.onstop = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(new Blob(chunksRef.current, { type: recorder.mimeType })));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Chưa mở được micro. Con vẫn có thể nói thành tiếng rồi tự đánh giá.");
    }
  }

  function stop() { mediaRef.current?.stop(); setRecording(false); }

  return (
    <div className="recorder">
      <div className="record-actions"><Button variant="outline" onClick={recording ? stop : start}>{recording ? <><Square /> Dừng ghi</> : <><Mic /> Ghi giọng của con</>}</Button>{audioUrl && <audio controls src={audioUrl} aria-label="Nghe lại giọng vừa ghi" />}</div>
      {error && <p className="inline-note">{error}</p>}
      <p className="privacy-note"><LockKeyhole /> Bản ghi chỉ ở tạm trên thiết bị và không được tải đi.</p>
      <div className="self-check"><span>Sau khi nghe lại, con thấy:</span><button onClick={() => onPractised(55)}>Cần thử lại</button><button onClick={() => onPractised(78)}>Đã nói trọn câu</button><button onClick={() => onPractised(92)}>Rõ và tự tin</button></div>
    </div>
  );
}

type LearningBand = "Gỡ nút" | "Vừa sức" | "Bứt phá";
type ChallengeProps = { week: WeekPlan; lessonId: number; sessionIndex: number; step: number; band: LearningBand; onDone: (score: number, confidence?: number, word?: string) => void };

function PhonicsLab({ week, onDone }: { week: WeekPlan; onDone: (score: number, confidence?: number, word?: string) => void }) {
  const [focus, focusWord] = week.sound.split(" trong ");
  const index = focusWord.toLowerCase().indexOf(focus.toLowerCase());
  const before = index >= 0 ? focusWord.slice(0, index) : "";
  const marked = index >= 0 ? focusWord.slice(index, index + focus.length) : focus;
  const after = index >= 0 ? focusWord.slice(index + focus.length) : focusWord;
  const [heardSlow, setHeardSlow] = useState(false);
  const [heardNatural, setHeardNatural] = useState(false);
  const [said, setSaid] = useState(false);
  function finish() { setSaid(true); playFeedback("correct"); onDone(heardSlow && heardNatural ? 100 : 75, 82, focusWord); }
  return <div className="challenge phonics-lab"><p className="challenge-kicker">Phòng âm thanh · nghe bằng tai, nhìn bằng mắt</p><h2>Khám phá cụm âm <mark>{focus}</mark></h2><div className="sound-word" aria-label={focusWord}><span>{before}</span><strong>{marked}</strong><span>{after}</span></div><div className="sound-track"><span className={heardSlow ? "done" : ""}>1 · Nghe chậm</span><i /><span className={heardNatural ? "done" : ""}>2 · Nối liền</span><i /><span className={said ? "done" : ""}>3 · Tự nói</span></div><div className="phonics-actions"><button onClick={() => { setHeardSlow(true); speak(focusWord, true); }}><Volume2 /> Kéo chậm cả từ</button><button onClick={() => { setHeardNatural(true); speak(focusWord); }}><Play /> Nghe tự nhiên</button><button className="say-it" onClick={finish}><Mic /> Con nói liền một hơi</button></div><p className="tip">Phần màu cam là cụm chữ cần để ý. Tai nghe cả từ trước; miệng nối âm liền mạch, không đọc tên từng chữ cái.</p></div>;
}

function RhythmChant({ words, onDone }: { words: WordCard[]; onDone: (score: number, confidence?: number, word?: string) => void }) {
  const chantWords = words.slice(0, 4);
  const [beat, setBeat] = useState(0);
  const [finished, setFinished] = useState(false);
  function tap() {
    if (finished) return;
    const next = beat + 1;
    setBeat(next);
    speak(chantWords[beat % chantWords.length].en);
    if (next === 4) { setFinished(true); playFeedback("complete"); onDone(100, 88, chantWords[3].en); }
  }
  return <div className="challenge chant-lab"><p className="challenge-kicker">Nhịp từ · không học thuộc lòng</p><h2>Nghe – vỗ – gọi từ theo nhịp</h2><div className="chant-cards">{chantWords.map((word, index) => <div key={word.en} className={index < beat ? "active" : ""}><VocabularyArt symbol={word.icon} label={word.vi} /><b>{word.en}</b><span>nhịp {index + 1}</span></div>)}</div><button className="beat-button" onClick={tap}><Music2 /> {finished ? "Con đã giữ đúng bốn nhịp!" : `Vỗ nhịp ${beat + 1} rồi nói từ`}</button><p className="tip">Không nhìn nghĩa tiếng Việt. Hãy nhìn tranh, vỗ một nhịp và gọi từ thật rõ.</p></div>;
}

function PictureDrop({ words, onDone }: { words: WordCard[]; onDone: (score: number, confidence?: number, word?: string) => void }) {
  const cards = words.slice(0, 3);
  const [selected, setSelected] = useState<string>();
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("Chạm một thẻ từ, rồi chạm tranh phù hợp.");
  function place(word: string, picture: string) {
    if (matched.includes(picture)) return;
    if (word === picture) {
      const next = [...matched, picture];
      setMatched(next); setSelected(undefined); setMessage("Đúng cặp! Tiếp tục nối các ý còn lại."); playFeedback("correct");
      if (next.length === cards.length) onDone(mistakes ? 75 : 100, undefined, cards.at(-1)?.en);
    } else { setMistakes((value) => value + 1); setMessage("Chưa khớp ý. Nhìn kỹ tranh và thử một thẻ khác."); playFeedback("try"); }
  }
  return <div className="challenge drop-challenge"><p className="challenge-kicker">Nối ý · kéo thả hoặc chạm</p><h2>Ghép từ với hình, không dịch từng chữ</h2><p className="interaction-note">{message}</p><div className="drop-pictures">{cards.map((word) => <button key={word.en} className={matched.includes(word.en) ? "drop-picture matched" : "drop-picture"} onClick={() => selected && place(selected, word.en)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); place(event.dataTransfer.getData("text/plain"), word.en); }}><VocabularyArt symbol={word.icon} label={word.vi} size="large" /><span>{matched.includes(word.en) ? word.en : "Thả từ vào đây"}</span></button>)}</div><div className="drag-words">{cards.map((word) => <button key={word.en} draggable={!matched.includes(word.en)} disabled={matched.includes(word.en)} className={selected === word.en ? "selected" : ""} onClick={() => setSelected(word.en)} onDragStart={(event) => event.dataTransfer.setData("text/plain", word.en)}>{word.en}</button>)}</div></div>;
}

type MemoryCard = { id: string; word: WordCard; side: "picture" | "word" };
function MemoryMatch({ words, onDone }: { words: WordCard[]; onDone: (score: number, confidence?: number, word?: string) => void }) {
  const set = words.slice(0, 3);
  const cards: MemoryCard[] = [
    { id: "0p", word: set[0], side: "picture" }, { id: "1w", word: set[1], side: "word" },
    { id: "2p", word: set[2], side: "picture" }, { id: "0w", word: set[0], side: "word" },
    { id: "2w", word: set[2], side: "word" }, { id: "1p", word: set[1], side: "picture" },
  ];
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [turns, setTurns] = useState(0);
  function reveal(card: MemoryCard) {
    if (locked || open.includes(card.id) || matched.includes(card.word.en)) return;
    if (!open.length) { setOpen([card.id]); return; }
    const first = cards.find((item) => item.id === open[0]);
    const nextTurns = turns + 1; setTurns(nextTurns); setOpen([open[0], card.id]); setLocked(true);
    if (first?.word.en === card.word.en && first.side !== card.side) {
      const next = [...matched, card.word.en];
      window.setTimeout(() => { setMatched(next); setOpen([]); setLocked(false); playFeedback("correct"); if (next.length === set.length) onDone(nextTurns <= 4 ? 100 : 75, undefined, card.word.en); }, 420);
    } else window.setTimeout(() => { setOpen([]); setLocked(false); playFeedback("try"); }, 620);
  }
  return <div className="challenge memory-game"><p className="challenge-kicker">Lật thẻ ký ức</p><h2>Tìm ba cặp tranh – từ</h2><div className="memory-grid">{cards.map((card) => { const visible = open.includes(card.id) || matched.includes(card.word.en); return <button key={card.id} className={matched.includes(card.word.en) ? "memory-card matched" : visible ? "memory-card open" : "memory-card"} onClick={() => reveal(card)} aria-label={visible ? (card.side === "word" ? card.word.en : card.word.vi) : "Thẻ đang úp"}>{visible ? (card.side === "picture" ? <VocabularyArt symbol={card.word.icon} label={card.word.vi} /> : <b>{card.word.en}</b>) : <><Grid2X2 /><span>Lật</span></>}</button>; })}</div><p className="tip">{matched.length}/3 cặp · {turns} lượt thử. Hãy nhớ vị trí, không đoán thật nhanh.</p></div>;
}

function SentenceBuilder({ sentence, words, onDone }: { sentence: string; words: WordCard[]; onDone: (score: number, confidence?: number, word?: string) => void }) {
  const tokens = sentence.match(/[A-Za-z]+(?:'[A-Za-z]+)?|[.,!?]/g) ?? sentence.split(" ");
  const source = tokens.map((token, index) => ({ id: index, token }));
  const shuffled = [...source.slice(1), source[0]].reverse();
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [wrong, setWrong] = useState(false);
  function add(id: number) { if (!placed.includes(id) && !checked) { setPlaced((value) => [...value, id]); setWrong(false); } }
  function verify() {
    if (placed.length !== source.length) return;
    const correct = placed.every((id, index) => id === index);
    if (correct) { setChecked(true); playFeedback("correct"); onDone(100, 84, words.find((word) => sentence.toLowerCase().includes(word.en.toLowerCase()))?.en); }
    else { setWrong(true); playFeedback("try"); }
  }
  return <div className="challenge sentence-builder"><p className="challenge-kicker">Xưởng tạo câu · viết bằng thẻ từ</p><h2>Ghép ý thành một câu trọn vẹn</h2><div className="sentence-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); add(Number(event.dataTransfer.getData("text/plain"))); }}>{placed.length ? placed.map((id) => <button key={id} onClick={() => !checked && setPlaced((value) => value.filter((item) => item !== id))}>{source[id].token}</button>) : <span>Kéo hoặc chạm các từ theo thứ tự câu con muốn nói</span>}</div><div className="sentence-tiles">{shuffled.filter((item) => !placed.includes(item.id)).map((item) => <button key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", String(item.id))} onClick={() => add(item.id)}>{item.token}</button>)}</div><div className="builder-actions"><button onClick={() => { setPlaced([]); setWrong(false); setChecked(false); }}><RefreshCw /> Làm lại</button><button className="check-sentence" disabled={placed.length !== source.length || checked} onClick={verify}><Check /> Kiểm tra ý</button></div>{wrong && <p className="feedback try">Câu chưa thành ý. Tìm từ mở đầu, rồi đọc thành tiếng từng cụm để sắp lại.</p>}{checked && <p className="feedback success"><Check /> Câu đã trọn ý. Bây giờ hãy nói lại và đổi một chi tiết theo ý con.</p>}</div>;
}

function SpellingBuilder({ word, onDone }: { word: WordCard; onDone: (score: number, confidence?: number, word?: string) => void }) {
  const source = Array.from(word.en).map((letter, index) => ({ id: index, letter }));
  const shuffled = [...source.slice(2), ...source.slice(0, 2)].reverse();
  const [placed, setPlaced] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const [complete, setComplete] = useState(false);
  function check() {
    const correct = placed.every((id, index) => id === index);
    if (correct) { setComplete(true); playFeedback("correct"); speak(word.en); onDone(100, 82, word.en); }
    else { setWrong(true); playFeedback("try"); }
  }
  return <div className="challenge spelling-builder"><p className="challenge-kicker">Xếp chữ từ trí nhớ</p><VocabularyArt symbol={word.icon} label={word.vi} size="large" /><h2>Tạo lại từ “{word.vi}”</h2><div className="letter-line">{placed.map((id) => <button key={id} onClick={() => !complete && setPlaced((value) => value.filter((item) => item !== id))}>{source[id].letter === " " ? "·" : source[id].letter}</button>)}{Array.from({ length: source.length - placed.length }, (_, index) => <i key={index} />)}</div><div className="letter-bank">{shuffled.filter((item) => !placed.includes(item.id)).map((item) => <button key={item.id} onClick={() => { setPlaced((value) => [...value, item.id]); setWrong(false); }}>{item.letter === " " ? "khoảng cách" : item.letter}</button>)}</div><Button disabled={placed.length !== source.length || complete} onClick={check}>Kiểm tra rồi nghe lại</Button>{wrong && <p className="feedback try">Chưa đúng thứ tự. Hãy đọc chậm từng phần và tìm cụm chữ con đã gặp.</p>}</div>;
}

function StorySequence({ passage, onDone }: { passage: string; onDone: (score: number) => void }) {
  const sentences = passage.match(/[^.!?]+[.!?]+/g)?.map((sentence) => sentence.trim()) ?? [passage];
  const source = sentences.map((sentence, index) => ({ sentence, index }));
  const shuffled = source.length > 1 ? [...source.slice(1), source[0]] : source;
  const [order, setOrder] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  function add(index: number) { if (!order.includes(index)) { setOrder((value) => [...value, index]); setWrong(false); } }
  function verify() {
    const correct = order.every((value, index) => value === index);
    if (correct) { playFeedback("correct"); onDone(100); } else { setWrong(true); playFeedback("try"); }
  }
  return <div className="challenge story-path"><p className="challenge-kicker">Đạo diễn câu chuyện</p><h2>Sự việc nào diễn ra trước?</h2><div className="story-timeline">{order.map((index, position) => <button key={index} onClick={() => setOrder((value) => value.filter((item) => item !== index))}><span>{position + 1}</span>{source[index].sentence}</button>)}</div><div className="story-cards">{shuffled.filter((item) => !order.includes(item.index)).map((item) => <button key={item.index} onClick={() => add(item.index)}>{item.sentence}</button>)}</div><Button disabled={order.length !== source.length} onClick={verify}>Kiểm tra mạch truyện</Button>{wrong && <p className="feedback try">Hãy tìm dấu hiệu mở đầu, sự việc tiếp theo và kết quả cuối.</p>}</div>;
}

function Challenge({ week, lessonId, sessionIndex, step, band, onDone }: ChallengeProps) {
  const targetIndex = (lessonId + step * 2) % week.words.length;
  const target = week.words[targetIndex];
  const choices = optionsFor(week.words, targetIndex, band === "Gỡ nút" || step === 0 ? 3 : 4);
  const [chosen, setChosen] = useState<string>();
  const [attempts, setAttempts] = useState(0);
  const [heard, setHeard] = useState(false);

  function choose(value: string, answer: string, word?: string) {
    if (chosen === answer) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setChosen(value);
    if (value === answer) { playFeedback("correct"); onDone(nextAttempts === 1 ? 100 : 65, undefined, word); }
    else playFeedback("try");
  }

  if (sessionIndex === 1) {
    if (step === 0) return <PhonicsLab week={week} onDone={onDone} />;
    const frameBlanks = week.frame.match(/___/g)?.length ?? 0;
    const practiceFrame = frameBlanks === 1 ? week.frame.replace("___", target.en) : week.model;
    const phrase = step < 3 ? `${target.en}. ${practiceFrame}` : step === 3 ? week.model : `In this scene: ${week.model}`;
    return <div className="challenge speaking-challenge"><p className="challenge-kicker">Nghe → nhẩm → nói</p><VocabularyArt symbol={target.icon} label={target.vi} size="large" /><h2>{step < 3 ? target.en : "Câu của con"}</h2><button className="listen-orb" onClick={() => speak(phrase)}><Volume2 /><span>Nghe mẫu</span></button><p className="big-phrase">{phrase}</p><p className="tip">Nghe một lần, nhìn sang chỗ khác, nói cả cụm; sau đó đổi một chi tiết để câu mang ý của con.</p><Recorder onPractised={(confidence) => onDone(confidence >= 75 ? 100 : 70, confidence, target.en)} /></div>;
  }

  if (sessionIndex === 2) {
    if (step === 0) return <PictureDrop words={choices} onDone={onDone} />;
    if (step === 3) return <StorySequence passage={week.passage} onDone={onDone} />;
    if (step === 4) return <SentenceBuilder sentence={week.model} words={week.words} onDone={onDone} />;
    if (step === 2) {
      return <div className="challenge reading-challenge"><p className="challenge-kicker">Đọc để tìm ý</p><div className="reading-card"><BookOpen /><p>{week.passage}</p></div><h2>{week.check.question}</h2><div className="choice-list">{week.check.options.map((option) => <button key={option} className={chosen === option ? (option === week.check.answer ? "correct" : "wrong") : ""} onClick={() => choose(option, week.check.answer)}>{option}</button>)}</div>{chosen && chosen !== week.check.answer && <p className="feedback try">Đọc lại câu có từ khóa. Con vẫn còn một lượt thử.</p>}{chosen === week.check.answer && <p className="feedback success"><Check /> Đúng rồi. Con đã tìm được ý quan trọng.</p>}</div>;
    }
    return <div className="challenge reading-challenge"><p className="challenge-kicker">Từ trong ngữ cảnh</p><h2>Tranh nào hoàn thiện ý “{target.vi}”?</h2><p className="mini-context">{week.scene}</p><div className="picture-choices">{choices.map((word) => <button key={word.en} className={chosen === word.en ? (word.en === target.en ? "correct" : "wrong") : ""} onClick={() => choose(word.en, target.en, target.en)}><VocabularyArt symbol={word.icon} label={word.vi} /><b>{word.en}</b></button>)}</div>{chosen === target.en && <p className="feedback success"><Check /> Con đã nối hình, nghĩa và từ trong cùng một ý.</p>}</div>;
  }

  if (sessionIndex === 3) {
    if (step === 1 || step === 4) return <MemoryMatch words={choices} onDone={onDone} />;
    if (step === 3) return <SpellingBuilder word={target} onDone={onDone} />;
    return <div className="challenge recall-challenge"><p className="challenge-kicker">Gọi lại từ · không nhìn danh sách · {band}</p>{band !== "Bứt phá" && <VocabularyArt symbol={target.icon} label={target.vi} size="large" />}<h2>Con nhớ từ “{target.vi}” là gì?</h2><div className="choice-list word-options">{choices.map((word) => <button key={word.en} className={chosen === word.en ? (word.en === target.en ? "correct" : "wrong") : ""} onClick={() => choose(word.en, target.en, target.en)}>{word.en}</button>)}</div>{chosen && chosen !== target.en && <p className="feedback try">Chưa đúng. Hãy hình dung lại tranh hoặc tình huống rồi thử tiếp.</p>}{chosen === target.en && <button className="hear-after" onClick={() => speak(target.en, true)}><Volume2 /> Nghe để khóa trí nhớ</button>}</div>;
  }

  if (sessionIndex === 4) {
    if (step === 1) return <PictureDrop words={choices} onDone={onDone} />;
    if (step === 3) return <SentenceBuilder sentence={week.model} words={week.words} onDone={onDone} />;
    if (step === 4) return <div className="challenge mission-challenge"><p className="challenge-kicker">Nhiệm vụ ngoài màn hình</p><Rory mood="brave" /><h2>Dùng tiếng Anh trong cảnh thật</h2><p className="mission-scene">{week.scene}</p><p className="big-phrase">Bắt đầu bằng: {week.frame}</p><p className="tip">Nhìn quanh con, chọn một người hoặc đồ vật thật, rồi thay chỗ trống bằng ý của chính con.</p><Recorder onPractised={(confidence) => onDone(confidence >= 75 ? 100 : 70, confidence, target.en)} /></div>;
    const missionPrompts = [
      { q: `Trong tình huống “${week.scene}”, câu nào giúp con bắt đầu giao tiếp?`, a: week.model, opts: [week.model, "Goodbye, chair!", "I am a pencil."] },
      { q: `Chọn từ đúng để dùng trong mẫu: ${week.frame}`, a: target.en, opts: [target.en, ...choices.filter((word) => word.en !== target.en).slice(0, 2).map((word) => word.en)] },
      { q: week.check.question, a: week.check.answer, opts: week.check.options },
      { q: `Câu nào dùng từ “${target.en}” tự nhiên nhất?`, a: week.frame.replace("___", target.en), opts: [week.frame.replace("___", target.en), `${target.en} is seven purple.`, `Goodbye ${target.en} because.`] },
      { q: "Nhiệm vụ cuối: chọn câu con muốn nói thành tiếng.", a: week.model, opts: [week.model, week.frame.replace("___", target.en), `I remember the word ${target.en}.`] },
    ];
    const mission = missionPrompts[step];
    return <div className="challenge mission-challenge"><p className="challenge-kicker">Mini mission · chọn ngôn ngữ có mục đích</p><div className="dialogue-rory"><Rory mood="listen" /><p>{mission.q}</p></div><div className="choice-list">{mission.opts.map((option) => <button key={option} className={chosen === option ? (option === mission.a ? "correct" : "wrong") : ""} onClick={() => choose(option, mission.a, target.en)}>{option}</button>)}</div>{chosen === mission.a && <div className="feedback success"><Check /> Câu này phù hợp với tình huống. <button onClick={() => speak(mission.a)}><Volume2 /> Nghe rồi đổi một chi tiết</button></div>}</div>;
  }

  if (step === 4) return <RhythmChant words={week.words} onDone={onDone} />;
  return <div className="challenge listening-challenge"><p className="challenge-kicker">Chỉ nghe trước · nhịp {band}</p><h2>Con nghe thấy ý nào?</h2><button className="listen-orb" onClick={() => { setHeard(true); speak(target.en, band === "Gỡ nút" || step < 2); }}><Headphones /><span>{heard ? "Nghe lại" : "Bấm để nghe"}</span></button><div className="picture-choices">{choices.map((word) => <button key={word.en} disabled={!heard} className={chosen === word.en ? (word.en === target.en ? "correct" : "wrong") : ""} onClick={() => choose(word.en, target.en, target.en)}><VocabularyArt symbol={word.icon} label={word.vi} /><b>{band === "Bứt phá" && step > 1 ? "?" : word.en}</b></button>)}</div>{!heard && <p className="tip">Hãy nghe trước rồi mới mở khóa các lựa chọn.</p>}{chosen && chosen !== target.en && <p className="feedback try">Âm chưa khớp. Nghe chậm lại và thử tiếp nhé.</p>}{chosen === target.en && <p className="feedback success"><Check /> Đúng âm rồi: <b>{target.en}</b> · {target.vi}</p>}</div>;
}

function LessonView({ id, profile, setProfile, navigate }: { id: number; profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>>; navigate: (view: View) => void }) {
  const weekNumber = lessonToWeek(id);
  const sessionIndex = lessonToSession(id);
  const week = weeks[weekNumber - 1];
  const session = sessionKinds[sessionIndex];
  const band = trackFromProfile(profile);
  const previous = profile.completedLessons[id];
  const [step, setStep] = useState(0);
  const [stageDone, setStageDone] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [confidences, setConfidences] = useState<number[]>([]);
  const [wordsSeen, setWordsSeen] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  function stageComplete(score: number, confidence = 75, word?: string) {
    if (stageDone) return;
    setStageDone(true);
    setScores((values) => [...values, score]);
    setConfidences((values) => [...values, confidence]);
    if (word) setWordsSeen((values) => [...new Set([...values, word])]);
  }

  function next() {
    if (!stageDone) return;
    if (step < 4) { setStep((value) => value + 1); setStageDone(false); return; }
    const score = average(scores);
    const confidence = average(confidences);
    const now = new Date();
    const dueDays = score >= 86 ? 7 : score >= 65 ? 3 : 1;
    const dueAt = new Date(now.getTime() + dueDays * 86_400_000).toISOString();
    setProfile((current) => {
      const wordMemory = { ...current.wordMemory };
      wordsSeen.forEach((word) => {
        const old = wordMemory[word] ?? { strength: 0, dueAt, seen: 0 };
        wordMemory[word] = { strength: Math.max(old.strength, score), dueAt, seen: old.seen + 1 };
      });
      return { ...current, completedLessons: { ...current.completedLessons, [id]: { score, confidence, firstTry: scores.filter((value) => value === 100).length, completedAt: now.toISOString() } }, wordMemory, activityDates: [...new Set([...current.activityDates, localDay(now)])].sort() };
    });
    playFeedback("complete");
    setFinished(true);
  }

  if (finished) {
    const score = average(scores);
    return <div className="page lesson-page result-page"><div className="celebration" aria-hidden="true"><i>★</i><i>●</i><i>★</i><i>●</i><i>★</i></div><div className="result-burst"><Rory mood="celebrate" /></div><p className="eyebrow">Buổi {sessionIndex + 1} đã hoàn thành</p><h1>Con vừa tạo ra tiếng Anh của mình!</h1><p>Điểm là dấu vết để chọn thử thách tiếp theo, không phải nhãn “giỏi” hay “yếu”.</p><div className="result-grid"><div><b>{score}%</b><span>hoàn thành thử thách</span></div><div><b>{scores.filter((value) => value === 100).length}/5</b><span>tự tìm ra ngay lần đầu</span></div><div><b>{wordsSeen.length}</b><span>từ được dùng chủ động</span></div></div><div className="result-actions"><Button onClick={() => navigate({ kind: "week", id: weekNumber })}>Về tuần {weekNumber}</Button>{id < 180 && <Button variant="outline" onClick={() => navigate({ kind: "lesson", id: id + 1 })}>Buổi tiếp theo <ArrowRight /></Button>}</div></div>;
  }

  return (
    <div className="lesson-layout">
      <aside className="lesson-sidebar"><button className="back-button" onClick={() => navigate({ kind: "week", id: weekNumber })}><ArrowLeft /> Tuần {weekNumber}</button><p className="eyebrow">Buổi {sessionIndex + 1} · {session.icon}</p><h1>{session.title}</h1><p>{session.subtitle}</p><div className="step-dots" aria-label={`Bước ${step + 1} trên 5`}>{Array.from({ length: 5 }, (_, index) => <i key={index} className={index < step ? "done" : index === step ? "current" : ""}>{index < step ? <Check /> : index + 1}</i>)}</div><Progress value={(step / 5) * 100} /><small>{week.title} · {band}</small></aside>
      <section className="lesson-stage">{previous && step === 0 && <p className="replay-note"><RotateCcw /> Con đã học buổi này. Học lại sẽ làm trí nhớ chắc hơn.</p>}<Challenge key={`${id}-${step}`} week={week} lessonId={id} sessionIndex={sessionIndex} step={step} band={band} onDone={stageComplete} /><Button className="next-stage" disabled={!stageDone} onClick={next}>{step === 4 ? "Hoàn thành buổi học" : "Tiếp tục"} <ArrowRight /></Button></section>
    </div>
  );
}

const diagnosticItems = [
  { mode: "listen", prompt: "Bấm nghe rồi chọn nghĩa đúng.", spoken: "book", options: ["quyển sách", "cái bàn", "quả bóng"], answer: "quyển sách" },
  { mode: "listen", prompt: "Bấm nghe rồi chọn hình đúng.", spoken: "green", options: ["🟢", "🔴", "🟡"], answer: "🟢" },
  { mode: "vocab", prompt: "‘gia đình’ trong tiếng Anh là gì?", options: ["family", "friend", "school"], answer: "family" },
  { mode: "vocab", prompt: "Chọn từ chỉ hành động ‘đọc’.", options: ["read", "write", "listen"], answer: "read" },
  { mode: "sentence", prompt: "Chọn câu giới thiệu tên đúng.", options: ["My name is Mai.", "I name Mai is.", "Name my Mai."], answer: "My name is Mai." },
  { mode: "sentence", prompt: "Chọn câu hỏi về sở thích.", options: ["Do you like music?", "You music do?", "Music is where?"], answer: "Do you like music?" },
  { mode: "read", prompt: "Tom has a red kite. What colour is the kite?", options: ["Red", "Blue", "Green"], answer: "Red" },
  { mode: "read", prompt: "Anna is hungry, so she eats an apple. Why does Anna eat?", options: ["She is hungry.", "She is tired.", "She is cold."], answer: "She is hungry." },
];

function AssessmentView({ setProfile, navigate }: { setProfile: React.Dispatch<React.SetStateAction<Profile>>; navigate: (view: View) => void }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string>();
  const [complete, setComplete] = useState(false);
  const item = diagnosticItems[index];
  function answer(option: string) { if (selected) return; setSelected(option); if (option === item.answer) setScore((value) => value + 1); }
  function next() {
    if (index < diagnosticItems.length - 1) { setIndex((value) => value + 1); setSelected(undefined); return; }
    const percent = Math.round((score / diagnosticItems.length) * 100);
    const band = percent < 50 ? "Gỡ nút" : percent >= 85 ? "Bứt phá" : "Vừa sức";
    setProfile((current) => ({ ...current, diagnostic: { score: percent, band, takenAt: new Date().toISOString() } }));
    setComplete(true);
  }
  if (complete) {
    const percent = Math.round((score / diagnosticItems.length) * 100);
    const band = percent < 50 ? "Gỡ nút" : percent >= 85 ? "Bứt phá" : "Vừa sức";
    return <div className="page assessment-result"><Rory mood="brave" /><p className="eyebrow">Khám phá năng lực</p><h1>Đã tìm được điểm bắt đầu</h1><div className="diagnostic-score"><b>{percent}%</b><span>Nhịp gợi ý: {band}</span></div><p>Đây chỉ là ảnh chụp hôm nay. Ứng dụng sẽ tiếp tục điều chỉnh theo cách con nghe, nhớ và dùng từ trong các buổi thật.</p><Button onClick={() => navigate({ kind: "lesson", id: 1 })}>Bắt đầu hành trình <ArrowRight /></Button></div>;
  }
  return <div className="page assessment-page"><div className="assessment-top"><div><p className="eyebrow">Không tính điểm thi</p><h1>Khám phá cách con đang học</h1></div><span>{index + 1}/{diagnosticItems.length}</span></div><Progress value={(index / diagnosticItems.length) * 100} /><div className="assessment-card"><p>{item.prompt}</p>{item.mode === "listen" && <button className="listen-orb compact" onClick={() => speak(item.spoken ?? "", true)}><Play /><span>Nghe</span></button>}<div className="choice-list">{item.options.map((option) => <button key={option} className={selected === option ? (option === item.answer ? "correct" : "wrong") : ""} onClick={() => answer(option)}>{option}</button>)}</div>{selected && <p className={selected === item.answer ? "feedback success" : "feedback try"}>{selected === item.answer ? "Con nghe/đọc đúng rồi." : `Đáp án phù hợp là: ${item.answer}`}</p>}<Button disabled={!selected} onClick={next}>{index === diagnosticItems.length - 1 ? "Xem điểm bắt đầu" : "Câu tiếp theo"} <ArrowRight /></Button></div></div>;
}

const vocabularyIndex = [...new Set(weeks.flatMap((week) => week.words.map((word) => word.en)))];
const dayNumber = (value: string) => Math.floor(new Date(value).getTime() / 86_400_000);
const dayFromNumber = (value: number) => new Date(value * 86_400_000).toISOString();

function compactProfile(profile: Profile) {
  const band = profile.diagnostic?.band === "Gỡ nút" ? 0 : profile.diagnostic?.band === "Bứt phá" ? 2 : 1;
  return {
    v: 2,
    n: profile.nickname,
    d: profile.diagnostic ? [profile.diagnostic.score, band, dayNumber(profile.diagnostic.takenAt)] : undefined,
    l: Object.entries(profile.completedLessons).map(([id, item]) => [Number(id), item.score, item.confidence, item.firstTry, dayNumber(item.completedAt)]),
    w: Object.entries(profile.wordMemory).map(([word, item]) => [vocabularyIndex.indexOf(word), item.strength, dayNumber(item.dueAt), item.seen]),
    a: profile.activityDates.map((date) => dayNumber(date)),
  };
}

function expandProfile(value: unknown): Profile | undefined {
  if (!value || typeof value !== "object") return undefined;
  const data = value as { v?: number; n?: string; d?: number[]; l?: number[][]; w?: number[][]; a?: number[] };
  if (data.v !== 2 || !Array.isArray(data.l)) return undefined;
  const base = newProfile();
  const bands: LearningBand[] = ["Gỡ nút", "Vừa sức", "Bứt phá"];
  return {
    ...base,
    nickname: data.n?.slice(0, 24) || base.nickname,
    diagnostic: data.d ? { score: data.d[0], band: bands[data.d[1]] ?? "Vừa sức", takenAt: dayFromNumber(data.d[2]) } : undefined,
    completedLessons: Object.fromEntries(data.l.map(([id, score, confidence, firstTry, day]) => [String(id), { score, confidence, firstTry, completedAt: dayFromNumber(day) }])),
    wordMemory: Object.fromEntries((data.w ?? []).filter(([index]) => vocabularyIndex[index]).map(([index, strength, due, seen]) => [vocabularyIndex[index], { strength, dueAt: dayFromNumber(due), seen }])),
    activityDates: (data.a ?? []).map((day) => localDay(new Date(dayFromNumber(day)))),
  };
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function encodeTransfer(profile: Profile) {
  const bytes = new TextEncoder().encode(JSON.stringify(compactProfile(profile)));
  if (!("CompressionStream" in window)) return `u.${base64Url(bytes)}`;
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return `d.${base64Url(new Uint8Array(await new Response(stream).arrayBuffer()))}`;
}

async function decodeTransfer(token: string) {
  const [mode, encoded] = token.split(".", 2);
  const bytes = fromBase64Url(encoded ?? "");
  let jsonBytes = bytes;
  if (mode === "d" && "DecompressionStream" in window) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    jsonBytes = new Uint8Array(await new Response(stream).arrayBuffer());
  }
  return expandProfile(JSON.parse(new TextDecoder().decode(jsonBytes)));
}

function ParentView({ profile, setProfile }: { profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const records = Object.values(profile.completedLessons);
  const total = records.length;
  const confidence = average(records.map((record) => record.confidence));
  const weakWords = Object.entries(profile.wordMemory).filter(([, word]) => word.strength < 65).sort((a, b) => a[1].strength - b[1].strength).slice(0, 6);
  const badges = earnedWorlds(profile);
  const streak = calculateStreak(profile);
  const [message, setMessage] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [transferLink, setTransferLink] = useState("");
  const [incoming, setIncoming] = useState<Profile>();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("transfer");
    if (!token) return;
    decodeTransfer(token).then((received) => received ? setIncoming(received) : setMessage("Mã chuyển tiến độ không hợp lệ hoặc đã bị thiếu dữ liệu.")).catch(() => setMessage("Chưa đọc được mã chuyển tiến độ này."));
  }, []);

  function download() {
    const payload = { product: "English Raccoon", schemaVersion: 2, exportedAt: new Date().toISOString(), profile };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = `english-raccoon-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); setMessage("Đã tạo bản sao lưu trên thiết bị.");
  }
  function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)); const restored = migrateProfile(parsed.profile ?? parsed);
        if (parsed.product !== "English Raccoon" || !restored) throw new Error();
        setProfile(restored); setMessage("Đã khôi phục đúng hồ sơ English Raccoon.");
      } catch { setMessage("Tệp này không phải bản sao lưu English Raccoon hợp lệ."); }
    };
    reader.readAsText(file); event.target.value = "";
  }
  async function makeQr() {
    try {
      const token = await encodeTransfer(profile);
      const url = new URL(`${BASE_PATH}/parent/`, window.location.origin);
      url.searchParams.set("transfer", token);
      const value = url.toString();
      const image = await QRCode.toDataURL(value, { width: 320, margin: 2, errorCorrectionLevel: "L", color: { dark: "#102a43", light: "#ffffff" } });
      setTransferLink(value); setQrImage(image); setMessage("Mở camera trên thiết bị mới và quét mã. Tiến độ chỉ được nhập sau khi xác nhận.");
    } catch { setMessage("H��� sơ hiện quá lớn cho một mã QR. Hãy dùng tệp JSON để giữ toàn bộ dữ liệu."); }
  }
  function acceptIncoming() {
    if (!incoming) return;
    setProfile(incoming); setIncoming(undefined); window.history.replaceState({}, "", `${BASE_PATH}/parent/`); setMessage("Đã chuyển tiến độ sang thiết bị này."); playFeedback("complete");
  }
  return <div className="page parent-page"><div className="page-intro"><p className="eyebrow">Góc đồng hành</p><h1>Nhìn tiến bộ, không gắn nhãn</h1><p>Dữ liệu nằm trên thiết bị này. Báo cáo tập trung vào thói quen, mức tự tin và từ cần dùng lại trong đời sống.</p></div>{incoming && <section className="incoming-transfer"><QrCode /><div><h2>Đã nhận một hành trình</h2><p>{incoming.nickname} · {Object.keys(incoming.completedLessons).length}/180 buổi. Chỉ nhập nếu đây là hồ sơ của bé.</p></div><Button onClick={acceptIncoming}>Xác nhận nhập</Button></section>}<section className="parent-summary"><div><span>Chuỗi học hiện tại</span><b>{streak} ngày</b></div><div><span>Buổi đã học</span><b>{total}/180</b></div><div><span>Tự tin khi nói</span><b>{confidence || "—"}{confidence ? "%" : ""}</b></div><div><span>Huy hiệu thế giới</span><b>{badges.length}/9</b></div></section><section className="parent-insight"><div><p className="eyebrow">Gợi ý tuần này</p><h2>{weakWords.length ? "Đưa từ còn yếu vào cuộc sống" : "Tạo thêm một câu mới ngoài màn hình"}</h2><p>{weakWords.length ? "Không kiểm tra lại bằng danh sách. Hãy chọn hai từ dưới đây, tìm vật hoặc tình huống thật và để bé tự đặt câu." : "Sau mỗi buổi, hỏi bé dùng một từ vừa học để nói về chính căn phòng, gia đình hoặc kế hoạch của mình."}</p></div><div className="weak-word-list">{weakWords.length ? weakWords.map(([word, item]) => <button key={word} onClick={() => speak(word, true)}><Volume2 /> {word}<small>{item.strength}%</small></button>) : <span>Chưa có từ nào cần hỗ trợ đặc biệt.</span>}</div></section><section className="parent-card"><div><p className="eyebrow">Hồ sơ của bé</p><h2>Tên gọi và âm phản hồi</h2></div><div className="profile-controls"><label className="name-field"><span>Tên thân mật</span><input value={profile.nickname} maxLength={24} onChange={(event) => setProfile((current) => ({ ...current, nickname: event.target.value || "Nhà thám hiểm" }))} /></label><label className="sound-toggle"><input type="checkbox" checked={profile.settings.soundEffects} onChange={(event) => setProfile((current) => ({ ...current, settings: { ...current.settings, soundEffects: event.target.checked } }))} /><span>Âm chúc mừng</span></label></div></section><section className="parent-card backup-card"><div><p className="eyebrow">Sao lưu riêng tư</p><h2>Giữ hành trình khi đổi thiết bị</h2><p>QR chuyển nhanh tiến độ giữa hai thiết bị. JSON là bản dự phòng đầy đủ và nên lưu mỗi tháng.</p></div><div className="backup-actions"><Button onClick={makeQr}><QrCode /> Tạo mã chuyển</Button><Button variant="outline" onClick={download}><Download /> Sao lưu JSON</Button><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Khôi phục</Button><input ref={fileRef} type="file" accept="application/json" hidden onChange={restore} /></div>{qrImage && <div className="qr-panel"><img src={qrImage} alt="Mã QR chuyển tiến độ English Raccoon" /><div><b>Quét bằng thiết bị mới</b><p>Mã chứa dữ liệu nén ngay trong liên kết; không tải hồ sơ lên máy chủ.</p><Button variant="outline" onClick={() => navigator.clipboard?.writeText(transferLink).then(() => setMessage("Đã sao chép liên kết chuyển tiến độ."))}><Copy /> Sao chép liên kết</Button></div></div>}{message && <p className="inline-note">{message}</p>}</section><section className="safety-card"><ShieldCheck /><div><h2>Nguyên tắc chấm nói</h2><p>English Raccoon không dùng nhận dạng giọng nói để phán “đúng/sai”. Bé nghe mẫu, ghi âm, nghe lại và tự đánh giá với phụ huynh. Điều này tránh đánh giá oan do micro, tiếng ồn hoặc giọng vùng miền.</p></div></section></div>;
}

export function EnglishRaccoonApp({ initialView }: { initialView?: View }) {
  const { profile, setProfile, ready } = useProfile();
  const [view, setView] = useState<View>(initialView ?? { kind: "home" });
  useEffect(() => {
    const pop = () => setView(routeFromBrowser());
    const redirectTimer = initialView ? undefined : window.setTimeout(pop, 0);
    window.addEventListener("popstate", pop);
    return () => {
      if (redirectTimer !== undefined) window.clearTimeout(redirectTimer);
      window.removeEventListener("popstate", pop);
    };
  }, [initialView]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${BASE_PATH}/sw.js`).catch(() => undefined);
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.sfx = profile.settings.soundEffects ? "on" : "off";
  }, [profile.settings.soundEffects]);
  function navigate(next: View) {
    window.history.pushState({}, "", `${BASE_PATH}${pathFor(next)}`);
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  let content: React.ReactNode;
  if (!ready) content = <div className="loading"><Rory mood="listen" /><p>Đang mở hành trình…</p></div>;
  else if (view.kind === "roadmap") content = <RoadmapView profile={profile} navigate={navigate} />;
  else if (view.kind === "assessment") content = <AssessmentView setProfile={setProfile} navigate={navigate} />;
  else if (view.kind === "parent") content = <ParentView profile={profile} setProfile={setProfile} />;
  else if (view.kind === "week") content = <WeekView id={view.id} profile={profile} navigate={navigate} />;
  else if (view.kind === "lesson") content = <LessonView key={view.id} id={view.id} profile={profile} setProfile={setProfile} navigate={navigate} />;
  else content = <HomeView profile={profile} navigate={navigate} />;
  return <AppShell active={view.kind} profile={profile} navigate={navigate}>{content}</AppShell>;
}

export default function Page() { return <EnglishRaccoonApp />; }
