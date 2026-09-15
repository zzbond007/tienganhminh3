"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Flame,
  Home,
  Map,
  Printer,
  RotateCcw,
  Sparkles,
  Trophy,
  UserRound,
  Volume2,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  lessonToSession,
  lessonToWeek,
  programFacts,
  sessionKinds,
  weeks,
  worlds,
} from "./english-curriculum";
import type { Profile, View } from "./app-types";
import { calculateStreak, earnedWorlds, migrateProfile, newProfile, trackFromProfile } from "./profile-model";
import { Rory, VocabularyArt, speak } from "./learning-ui";
import { SpeechControl } from "./speech-practice";
import { LessonView } from "./lesson-view";
import { ParentView } from "./parent-view";
import { diagnosticItems } from "./diagnostic-items";

const STORAGE_KEY = "english-raccoon-learning-v1";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
      <section className="week-transfer-grid">
        <div className="spiral-card"><span className="transfer-icon"><RotateCcw /></span><div><p className="eyebrow">Cầu nối trí nhớ</p><h2>{week.reviewWords.length ? "Gọi lại từ cũ trong ý mới" : "Khởi động hành trình"}</h2><p>{week.reviewWords.length ? "Những từ này đến từ tuần trước và sẽ xuất hiện trong đoạn đọc mới." : "Tuần đầu tiên tạo các điểm tựa nghe – nhìn – nói để dùng lại ở tuần sau."}</p>{week.reviewWords.length ? <div className="review-word-row">{week.reviewWords.map((word) => <button key={word} onClick={() => speak(word, true)}><Volume2 /> {word}</button>)}</div> : <b className="first-week-chip">hello → friend → name</b>}</div></div>
        <div className="mission-preview"><span className="transfer-icon">🚀</span><div><p className="eyebrow">Thử thách thật</p><h2>Dùng tiếng Anh ngoài màn hình</h2><p>{week.mission}</p></div></div>
      </section>
      <section><div className="section-heading"><div><p className="eyebrow">Năm buổi ngắn</p><h2>Một vòng học trọn vẹn</h2></div></div><div className="session-list">{sessionKinds.map((session, index) => {
        const lessonId = (id - 1) * 5 + index + 1;
        const record = profile.completedLessons[lessonId];
        return <button key={session.key} className="session-row" onClick={() => navigate({ kind: "lesson", id: lessonId })}><span className="session-icon">{record ? "✓" : session.icon}</span><span><small>Buổi {index + 1}</small><b>{session.title}</b><em>{session.subtitle}</em></span><span className={record ? "done-pill" : "go-pill"}>{record ? `${record.score}%` : "Bắt đầu"}</span></button>;
      })}</div></section>
      <section className="print-sheet" aria-hidden="true"><h1>English Raccoon · Tuần {week.week}</h1><h2>{week.title}</h2><p>{week.scene}</p><div className="print-words">{week.words.map((word) => <div key={word.en}><VocabularyArt symbol={word.icon} label={word.vi} /><b>{word.en}</b><span>{word.vi}</span></div>)}</div><h3>Câu dùng trong đời sống</h3><p className="print-model">{week.model}</p><h3>Thử thách cùng gia đình</h3><p>{week.mission}</p><h3>Câu hỏi mở</h3><p>{week.think.prompt} <b>{week.think.starter}</b></p></section>
    </div>
  );
}

function AssessmentView({ setProfile, navigate }: { setProfile: React.Dispatch<React.SetStateAction<Profile>>; navigate: (view: View) => void }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string>();
  const [heard, setHeard] = useState(false);
  const [complete, setComplete] = useState(false);
  const item = diagnosticItems[index];
  function answer(option: string) { if (selected || (item.mode === "listen" && !heard)) return; setSelected(option); if (option === item.answer) setScore((value) => value + 1); }
  function next() {
    if (index < diagnosticItems.length - 1) { setIndex((value) => value + 1); setSelected(undefined); setHeard(false); return; }
    const percent = Math.round((score / diagnosticItems.length) * 100);
    const band = percent < 50 ? "Gỡ nút" : percent >= 85 ? "Bứt phá" : "Vừa sức";
    setProfile((current) => ({ ...current, diagnostic: { score: percent, band, takenAt: new Date().toISOString(), measurementVersion: 3 } }));
    setComplete(true);
  }
  if (complete) {
    const percent = Math.round((score / diagnosticItems.length) * 100);
    const band = percent < 50 ? "Gỡ nút" : percent >= 85 ? "Bứt phá" : "Vừa sức";
    return <div className="page assessment-result"><Rory mood="brave" /><p className="eyebrow">Khám phá năng lực</p><h1>Đã tìm được điểm bắt đầu</h1><div className="diagnostic-score"><b>{percent}%</b><span>Nhịp gợi ý: {band}</span></div><p>Đây chỉ là ảnh chụp hôm nay. Ứng dụng sẽ tiếp tục điều chỉnh theo cách con nghe, nhớ và dùng từ trong các buổi thật.</p><Button onClick={() => navigate({ kind: "lesson", id: 1 })}>Bắt đầu hành trình <ArrowRight /></Button></div>;
  }
  return <div className="page assessment-page"><div className="assessment-top"><div><p className="eyebrow">Không tính điểm thi</p><h1>Khám phá cách con đang học</h1></div><span>{index + 1}/{diagnosticItems.length}</span></div><Progress value={(index / diagnosticItems.length) * 100} /><div className="assessment-card"><p>{item.prompt}</p>{item.mode === "listen" && <SpeechControl text={item.spoken ?? ""} slow label={heard ? "Nghe lại" : "Nghe"} className="listen-orb compact" onHeard={() => setHeard(true)} />}<div className="choice-list">{item.options.map((option) => <button key={option} disabled={item.mode === "listen" && !heard} className={selected === option ? (option === item.answer ? "correct" : "wrong") : ""} onClick={() => answer(option)}>{option}</button>)}</div>{item.mode === "listen" && !heard && <p className="tip">Nghe trước để mở khóa các lựa chọn. Nếu thiết bị im lặng, nhờ người lớn đọc từ.</p>}{selected && <p className={selected === item.answer ? "feedback success" : "feedback try"}>{selected === item.answer ? "Con nghe/đọc đúng rồi." : `Đáp án phù hợp là: ${item.answer}`}</p>}<Button disabled={!selected} onClick={next}>{index === diagnosticItems.length - 1 ? "Xem điểm bắt đầu" : "Câu tiếp theo"} <ArrowRight /></Button></div></div>;
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
