"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Headphones,
  Home,
  LockKeyhole,
  Map,
  Mic,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Upload,
  UserRound,
  Volume2,
} from "lucide-react";
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
  schemaVersion: 1;
  profileId: string;
  nickname: string;
  createdAt: string;
  savedAt: string;
  diagnostic?: { score: number; band: "Gỡ nút" | "Vừa sức" | "Bứt phá"; takenAt: string };
  completedLessons: Record<string, LessonRecord>;
  wordMemory: Record<string, { strength: number; dueAt: string; seen: number }>;
};

const STORAGE_KEY = "english-raccoon-learning-v1";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function newProfile(): Profile {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    profileId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `er-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nickname: "Nhà thám hiểm",
    createdAt: now,
    savedAt: now,
    completedLessons: {},
    wordMemory: {},
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
          const parsed = JSON.parse(stored) as Profile;
          if (parsed.schemaVersion === 1 && parsed.completedLessons && parsed.wordMemory) setProfile(parsed);
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
  const english = voices.find((voice) => voice.lang.startsWith("en") && voice.localService);
  if (english) utterance.voice = english;
  window.speechSynthesis.speak(utterance);
  return true;
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
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate({ kind: "home" })} aria-label="Về trang chính">
          <span className="brand-mark" aria-hidden="true">🦝</span>
          <span><strong>English Raccoon</strong><small>Tiếng Anh thực hành lớp 3</small></span>
        </button>
        <div className="top-progress" aria-label={`${completed} trên 180 buổi đã hoàn thành`}>
          <Sparkles size={18} aria-hidden="true" /><span><b>{completed}</b>/180 buổi</span>
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

  return (
    <div className="page home-page">
      <section className="welcome-row">
        <div><p className="eyebrow">Xin chào, {profile.nickname}!</p><h1>Ready for English?</h1><p>Mỗi ngày một chút: nghe rõ hơn, nói tự tin hơn, nhớ từ lâu hơn.</p></div>
        <div className="level-chip"><span>Nhịp hiện tại</span><b>{track}</b></div>
      </section>
      <section className="today-card" style={{ "--world": worlds[week.world - 1].color } as React.CSSProperties}>
        <div className="today-copy">
          <p className="eyebrow">Tuần {week.week} · Buổi {sessionIndex + 1}</p>
          <h2>{session.icon} {session.title}</h2>
          <p className="today-title">{week.title}</p>
          <p>{session.subtitle}. Khoảng {programFacts.minutes} phút.</p>
          <div className="word-peek" aria-label="Từ của tuần">{week.words.slice(0, 4).map((word) => <span key={word.en}>{word.icon} {word.en}</span>)}</div>
          <Button className="primary-action" onClick={() => navigate({ kind: "lesson", id: nextLesson })}>Học buổi hôm nay <ArrowRight aria-hidden="true" /></Button>
        </div>
        <div className="mascot-scene" aria-label="Rory đang luyện nghe tiếng Anh"><span className="sound-wave">hello!</span><div className="mascot">🦝</div><div className="headphones">🎧</div></div>
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
        <div><p className="eyebrow">Thế giới {week.world} · Tuần {week.week}</p><h1>{week.title}</h1><p>{week.scene}</p><div className="model-sentence"><button onClick={() => speak(week.model)} aria-label="Nghe câu mẫu"><Volume2 /></button><span><small>Câu con sẽ dùng</small><b>{week.model}</b></span></div></div>
        <div className="week-badge"><b>{week.words.length}</b><span>từ trọng tâm</span></div>
      </section>
      <section><div className="section-heading"><div><p className="eyebrow">Kho từ tuần này</p><h2>Nhìn · nghe · nói thành tiếng</h2></div></div><div className="vocab-grid">{week.words.map((word) => <button className="vocab-card" key={word.en} onClick={() => speak(word.en, true)}><span>{word.icon}</span><b>{word.en}</b><small>{word.vi}</small><Volume2 /></button>)}</div></section>
      <section><div className="section-heading"><div><p className="eyebrow">Năm buổi ngắn</p><h2>Một vòng học trọn vẹn</h2></div></div><div className="session-list">{sessionKinds.map((session, index) => {
        const lessonId = (id - 1) * 5 + index + 1;
        const record = profile.completedLessons[lessonId];
        return <button key={session.key} className="session-row" onClick={() => navigate({ kind: "lesson", id: lessonId })}><span className="session-icon">{record ? "✓" : session.icon}</span><span><small>Buổi {index + 1}</small><b>{session.title}</b><em>{session.subtitle}</em></span><span className={record ? "done-pill" : "go-pill"}>{record ? `${record.score}%` : "Bắt đầu"}</span></button>;
      })}</div></section>
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
    if (value === answer) onDone(nextAttempts === 1 ? 100 : 65, undefined, word);
  }

  if (sessionIndex === 1) {
    const frameBlanks = week.frame.match(/___/g)?.length ?? 0;
    const practiceFrame = frameBlanks === 1 ? week.frame.replace("___", target.en) : week.model;
    const phrase = step < 3 ? `${target.en}. ${practiceFrame}` : step === 3 ? week.model : `This week I can say: ${week.model}`;
    return <div className="challenge speaking-challenge"><p className="challenge-kicker">Nghe → nhẩm → nói</p><h2>{step < 3 ? `${target.icon} ${target.en}` : "Câu của con"}</h2><button className="listen-orb" onClick={() => speak(phrase, step === 0)}><Volume2 /><span>Nghe mẫu</span></button><p className="big-phrase">{phrase}</p><p className="tip">Mẹo: nghe một lần, nhìn đi chỗ khác, rồi nói cả cụm—not từng từ rời.</p><Recorder onPractised={(confidence) => onDone(confidence >= 75 ? 100 : 70, confidence, target.en)} /></div>;
  }

  if (sessionIndex === 2) {
    if (step === 2 || step === 3) {
      return <div className="challenge reading-challenge"><p className="challenge-kicker">Đọc để tìm ý</p><div className="reading-card"><BookOpen /><p>{week.passage}</p></div><h2>{week.check.question}</h2><div className="choice-list">{week.check.options.map((option) => <button key={option} className={chosen === option ? (option === week.check.answer ? "correct" : "wrong") : ""} onClick={() => choose(option, week.check.answer)}>{option}</button>)}</div>{chosen && chosen !== week.check.answer && <p className="feedback try">Đọc lại câu có từ khóa. Con vẫn còn một lượt thử.</p>}{chosen === week.check.answer && <p className="feedback success"><Check /> Đúng rồi. Con đã tìm được ý quan trọng.</p>}</div>;
    }
    return <div className="challenge reading-challenge"><p className="challenge-kicker">Từ trong câu</p><h2>Từ nào có nghĩa là “{target.vi}”?</h2><p className="mini-context">{week.model}</p><div className="picture-choices">{choices.map((word) => <button key={word.en} className={chosen === word.en ? (word.en === target.en ? "correct" : "wrong") : ""} onClick={() => choose(word.en, target.en, target.en)}><span>{word.icon}</span><b>{word.en}</b></button>)}</div>{chosen === target.en && <p className="feedback success"><Check /> Con đã nối đúng nghĩa với từ.</p>}</div>;
  }

  if (sessionIndex === 3) {
    return <div className="challenge recall-challenge"><p className="challenge-kicker">Không nhìn lại danh sách · {band}</p>{band !== "Bứt phá" && <span className="memory-icon">{target.icon}</span>}<h2>Con nhớ từ “{target.vi}” là gì?</h2><div className="choice-list word-options">{choices.map((word) => <button key={word.en} className={chosen === word.en ? (word.en === target.en ? "correct" : "wrong") : ""} onClick={() => choose(word.en, target.en, target.en)}>{word.en}</button>)}</div>{chosen && chosen !== target.en && <p className="feedback try">Chưa đúng. Hãy nói nhỏ từng lựa chọn rồi thử lại.</p>}{chosen === target.en && <button className="hear-after" onClick={() => speak(target.en, true)}><Volume2 /> Nghe để khóa trí nhớ</button>}</div>;
  }

  if (sessionIndex === 4) {
    const missionPrompts = [
      { q: `Rory nói: “Hello! ${week.model}” Con đáp lại thế nào?`, a: week.model, opts: [week.model, "Goodbye, chair!", "I am a pencil."] },
      { q: `Chọn từ đúng để dùng trong mẫu: ${week.frame}`, a: target.en, opts: [target.en, ...choices.filter((word) => word.en !== target.en).slice(0, 2).map((word) => word.en)] },
      { q: week.check.question, a: week.check.answer, opts: week.check.options },
      { q: `Câu nào dùng từ “${target.en}” tự nhiên nhất?`, a: week.frame.replace("___", target.en), opts: [week.frame.replace("___", target.en), `${target.en} is seven purple.`, `Goodbye ${target.en} because.`] },
      { q: "Nhiệm vụ cuối: chọn câu con muốn nói thành tiếng.", a: week.model, opts: [week.model, week.frame.replace("___", target.en), `I remember the word ${target.en}.`] },
    ];
    const mission = missionPrompts[step];
    return <div className="challenge mission-challenge"><p className="challenge-kicker">Mini mission · dùng tiếng Anh có mục đích</p><div className="dialogue-rory"><span>🦝</span><p>{mission.q}</p></div><div className="choice-list">{mission.opts.map((option) => <button key={option} className={chosen === option ? (option === mission.a ? "correct" : "wrong") : ""} onClick={() => choose(option, mission.a, target.en)}>{option}</button>)}</div>{chosen === mission.a && <div className="feedback success"><Check /> Hay lắm! <button onClick={() => speak(mission.a)}><Volume2 /> Nghe rồi nói lại</button></div>}</div>;
  }

  return <div className="challenge listening-challenge"><p className="challenge-kicker">Chỉ nghe trước · nhịp {band}</p><h2>Con nghe thấy từ nào?</h2><button className="listen-orb" onClick={() => { setHeard(true); speak(target.en, band === "Gỡ nút" || step < 2); }}><Headphones /><span>{heard ? "Nghe lại" : "Bấm để nghe"}</span></button><div className="picture-choices">{choices.map((word) => <button key={word.en} disabled={!heard} className={chosen === word.en ? (word.en === target.en ? "correct" : "wrong") : ""} onClick={() => choose(word.en, target.en, target.en)}><span>{word.icon}</span><b>{word.en}</b></button>)}</div>{!heard && <p className="tip">Hãy nghe trước rồi mới mở khóa các lựa chọn.</p>}{chosen && chosen !== target.en && <p className="feedback try">Âm chưa khớp. Nghe chậm lại và thử tiếp nhé.</p>}{chosen === target.en && <p className="feedback success"><Check /> Đúng âm rồi: <b>{target.en}</b> · {target.vi}</p>}</div>;
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
      return { ...current, completedLessons: { ...current.completedLessons, [id]: { score, confidence, firstTry: scores.filter((value) => value === 100).length, completedAt: now.toISOString() } }, wordMemory };
    });
    setFinished(true);
  }

  if (finished) {
    const score = average(scores);
    return <div className="page lesson-page result-page"><div className="result-burst"><span>🦝</span><i>✨</i></div><p className="eyebrow">Buổi {sessionIndex + 1} đã hoàn thành</p><h1>Con đã dùng tiếng Anh thật!</h1><p>Điểm này là dấu vết học tập, không phải nhãn “giỏi” hay “yếu”.</p><div className="result-grid"><div><b>{score}%</b><span>hoàn thành thử thách</span></div><div><b>{scores.filter((value) => value === 100).length}/5</b><span>đúng ngay lần đầu</span></div><div><b>{wordsSeen.length}</b><span>từ được luyện chủ động</span></div></div><div className="result-actions"><Button onClick={() => navigate({ kind: "week", id: weekNumber })}>Về tuần {weekNumber}</Button>{id < 180 && <Button variant="outline" onClick={() => navigate({ kind: "lesson", id: id + 1 })}>Buổi tiếp theo <ArrowRight /></Button>}</div></div>;
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
    return <div className="page assessment-result"><span className="assessment-mascot">🦝🔎</span><p className="eyebrow">Khám phá năng lực</p><h1>Đã tìm được điểm bắt đầu</h1><div className="diagnostic-score"><b>{percent}%</b><span>Nhịp gợi ý: {band}</span></div><p>Đây chỉ là ảnh chụp hôm nay. Ứng dụng sẽ tiếp tục điều chỉnh theo cách con nghe, nhớ và dùng từ trong các buổi thật.</p><Button onClick={() => navigate({ kind: "lesson", id: 1 })}>Bắt đầu hành trình <ArrowRight /></Button></div>;
  }
  return <div className="page assessment-page"><div className="assessment-top"><div><p className="eyebrow">Không tính điểm thi</p><h1>Khám phá cách con đang học</h1></div><span>{index + 1}/{diagnosticItems.length}</span></div><Progress value={(index / diagnosticItems.length) * 100} /><div className="assessment-card"><p>{item.prompt}</p>{item.mode === "listen" && <button className="listen-orb compact" onClick={() => speak(item.spoken ?? "", true)}><Play /><span>Nghe</span></button>}<div className="choice-list">{item.options.map((option) => <button key={option} className={selected === option ? (option === item.answer ? "correct" : "wrong") : ""} onClick={() => answer(option)}>{option}</button>)}</div>{selected && <p className={selected === item.answer ? "feedback success" : "feedback try"}>{selected === item.answer ? "Con nghe/đọc đúng rồi." : `Đáp án phù hợp là: ${item.answer}`}</p>}<Button disabled={!selected} onClick={next}>{index === diagnosticItems.length - 1 ? "Xem điểm bắt đầu" : "Câu tiếp theo"} <ArrowRight /></Button></div></div>;
}

function ParentView({ profile, setProfile }: { profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const records = Object.values(profile.completedLessons);
  const total = records.length;
  const score = average(records.map((record) => record.score));
  const confidence = average(records.map((record) => record.confidence));
  const remembered = Object.values(profile.wordMemory).filter((word) => word.strength >= 65).length;
  const [message, setMessage] = useState("");
  function download() {
    const payload = { product: "English Raccoon", schemaVersion: 1, exportedAt: new Date().toISOString(), profile };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = `english-raccoon-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); setMessage("Đã tạo bản sao lưu trên thiết bị.");
  }
  function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)); const restored = parsed.profile ?? parsed;
        if (parsed.product !== "English Raccoon" || restored.schemaVersion !== 1 || !restored.completedLessons) throw new Error();
        setProfile(restored); setMessage("Đã khôi phục đúng hồ sơ English Raccoon.");
      } catch { setMessage("Tệp này không phải bản sao lưu English Raccoon hợp lệ."); }
    };
    reader.readAsText(file); event.target.value = "";
  }
  return <div className="page parent-page"><div className="page-intro"><p className="eyebrow">Góc đồng hành</p><h1>Nhìn tiến bộ, không gắn nhãn</h1><p>Dữ liệu dưới đây nằm trên thiết bị này. Ứng dụng không có quảng cáo, phân tích hành vi hay tài khoản trẻ em.</p></div><section className="parent-summary"><div><span>Buổi đã học</span><b>{total}/180</b></div><div><span>Hoàn thành trung bình</span><b>{score || "—"}{score ? "%" : ""}</b></div><div><span>Tự tin khi nói</span><b>{confidence || "—"}{confidence ? "%" : ""}</b></div><div><span>Từ đang nhớ vững</span><b>{remembered}</b></div></section><section className="parent-card"><div><p className="eyebrow">Hồ sơ của bé</p><h2>Tên gọi trong ứng dụng</h2></div><label className="name-field"><span>Tên thân mật</span><input value={profile.nickname} maxLength={24} onChange={(event) => setProfile((current) => ({ ...current, nickname: event.target.value || "Nhà thám hiểm" }))} /></label></section><section className="parent-card"><div><p className="eyebrow">Sao lưu riêng tư</p><h2>Giữ hành trình khi đổi thiết bị</h2><p>GitHub chỉ chứa chương trình. Hồ sơ học không được đưa vào kho mã công khai.</p></div><div className="backup-actions"><Button onClick={download}><Download /> Sao lưu JSON</Button><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Khôi phục</Button><input ref={fileRef} type="file" accept="application/json" hidden onChange={restore} /></div>{message && <p className="inline-note">{message}</p>}</section><section className="safety-card"><ShieldCheck /><div><h2>Nguyên tắc chấm nói</h2><p>English Raccoon không dùng nhận dạng giọng nói để phán “đúng/sai”. Bé nghe mẫu, ghi âm, nghe lại và tự đánh giá với phụ huynh. Điều này tránh đánh giá oan do micro, tiếng ồn hoặc giọng vùng miền.</p></div></section></div>;
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
  function navigate(next: View) {
    window.history.pushState({}, "", `${BASE_PATH}${pathFor(next)}`);
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  let content: React.ReactNode;
  if (!ready) content = <div className="loading"><span>🦝</span><p>Đang mở hành trình…</p></div>;
  else if (view.kind === "roadmap") content = <RoadmapView profile={profile} navigate={navigate} />;
  else if (view.kind === "assessment") content = <AssessmentView setProfile={setProfile} navigate={navigate} />;
  else if (view.kind === "parent") content = <ParentView profile={profile} setProfile={setProfile} />;
  else if (view.kind === "week") content = <WeekView id={view.id} profile={profile} navigate={navigate} />;
  else if (view.kind === "lesson") content = <LessonView key={view.id} id={view.id} profile={profile} setProfile={setProfile} navigate={navigate} />;
  else content = <HomeView profile={profile} navigate={navigate} />;
  return <AppShell active={view.kind} profile={profile} navigate={navigate}>{content}</AppShell>;
}

export default function Page() { return <EnglishRaccoonApp />; }
