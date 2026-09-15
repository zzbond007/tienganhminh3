"use client";

import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { lessonToSession, lessonToWeek, sessionKinds, weeks } from "./english-curriculum";
import type { LessonRecord, Profile, View } from "./app-types";
import { average, localDay, trackFromProfile } from "./profile-model";
import { Challenge } from "./learning-activities";
import { Rory, playFeedback } from "./learning-ui";

export function LessonView({ id, profile, setProfile, navigate }: { id: number; profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>>; navigate: (view: View) => void }) {
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

  function stageComplete(score: number, confidence?: number, word?: string) {
    if (stageDone) return;
    setStageDone(true);
    setScores((values) => [...values, score]);
    if (typeof confidence === "number") setConfidences((values) => [...values, confidence]);
    if (word) setWordsSeen((values) => [...new Set([...values, word])]);
  }

  function next() {
    if (!stageDone) return;
    if (step < 4) { setStep((value) => value + 1); setStageDone(false); return; }
    const score = average(scores);
    const speakingConfidence = confidences.length ? average(confidences) : undefined;
    const now = new Date();
    const dueDays = score >= 86 ? 7 : score >= 65 ? 3 : 1;
    const dueAt = new Date(now.getTime() + dueDays * 86_400_000).toISOString();
    setProfile((current) => {
      const wordMemory = { ...current.wordMemory };
      wordsSeen.forEach((word) => {
        const old = wordMemory[word] ?? { strength: 0, dueAt, seen: 0 };
        wordMemory[word] = { strength: Math.max(old.strength, score), dueAt, seen: old.seen + 1 };
      });
      const record: LessonRecord = {
        score,
        firstTry: scores.filter((value) => value === 100).length,
        completedAt: now.toISOString(),
        measurementVersion: 3,
        ...(speakingConfidence === undefined ? {} : { speakingConfidence, speakingSamples: confidences.length }),
      };
      return { ...current, completedLessons: { ...current.completedLessons, [id]: record }, wordMemory, activityDates: [...new Set([...current.activityDates, localDay(now)])].sort() };
    });
    playFeedback("complete");
    setFinished(true);
  }

  if (finished) {
    const score = average(scores);
    return <div className="page lesson-page result-page"><div className="celebration" aria-hidden="true"><i>★</i><i>●</i><i>★</i><i>●</i><i>★</i></div><div className="result-burst"><Rory mood="celebrate" /></div><p className="eyebrow">Buổi {sessionIndex + 1} đã hoàn thành</p><h1>Con vừa tạo ra tiếng Anh của mình!</h1><p>Điểm là dấu vết để chọn thử thách tiếp theo, không phải nhãn “giỏi” hay “yếu”.</p><div className="result-grid"><div><b>{score}%</b><span>hoàn thành thử thách</span></div><div><b>{scores.filter((value) => value === 100).length}/5</b><span>tự tìm ra ngay lần đầu</span></div><div><b>{wordsSeen.length}</b><span>từ/cụm đã luyện trong buổi</span></div></div><div className="result-actions"><Button onClick={() => navigate({ kind: "week", id: weekNumber })}>Về tuần {weekNumber}</Button>{id < 180 && <Button variant="outline" onClick={() => navigate({ kind: "lesson", id: id + 1 })}>Buổi tiếp theo <ArrowRight /></Button>}</div></div>;
  }

  return (
    <div className="lesson-layout">
      <aside className="lesson-sidebar"><button className="back-button" onClick={() => navigate({ kind: "week", id: weekNumber })}><ArrowLeft /> Tuần {weekNumber}</button><p className="eyebrow">Buổi {sessionIndex + 1} · {session.icon}</p><h1>{session.title}</h1><p>{session.subtitle}</p><div className="step-dots" aria-label={`Bước ${step + 1} trên 5`}>{Array.from({ length: 5 }, (_, index) => <i key={index} className={index < step ? "done" : index === step ? "current" : ""}>{index < step ? <Check /> : index + 1}</i>)}</div><Progress value={(step / 5) * 100} /><small>{week.title} · {band}</small></aside>
      <section className="lesson-stage">{previous && step === 0 && <p className="replay-note"><RotateCcw /> Con đã học buổi này. Học lại sẽ làm trí nhớ chắc hơn.</p>}<Challenge key={`${id}-${step}`} week={week} lessonId={id} sessionIndex={sessionIndex} step={step} band={band} onDone={stageComplete} /><Button className="next-stage" disabled={!stageDone} onClick={next}>{step === 4 ? "Hoàn thành buổi học" : "Tiếp tục"} <ArrowRight /></Button></section>
    </div>
  );
}
