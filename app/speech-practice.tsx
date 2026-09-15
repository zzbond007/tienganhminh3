"use client";

import "./speech-practice.css";

import { ArrowRight, Headphones, LockKeyhole, MessageCircle, Mic, RefreshCw, Square, UserRound, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { recorderErrorMessage, selectRecordingMimeType } from "./audio-support";
import type { DialogueTurn } from "./english-curriculum";
import { speak } from "./learning-ui";

export function Recorder({ onPractised }: { onPractised: (confidence: number) => void }) {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | undefined>(undefined);
  const [recording, setRecording] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [reviewed, setReviewed] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [spokenWithoutRecording, setSpokenWithoutRecording] = useState(false);
  const [error, setError] = useState("");

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function clearAudio() {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = undefined;
    setAudioUrl(undefined);
  }

  useEffect(() => () => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.ondataavailable = null;
      mediaRef.current.onstop = null;
      mediaRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  async function start() {
    setError("");
    setReviewed(false);
    setSpokenWithoutRecording(false);
    setManualMode(false);
    clearAudio();
    if (!window.isSecureContext) {
      setError("Trình duyệt chỉ cho ghi âm ở trang bảo mật. Con hãy mở đúng địa chỉ https hoặc chọn cách nói trực tiếp.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") {
      setError("Trình duyệt này chưa hỗ trợ ghi âm. Con vẫn có thể luyện đầy đủ bằng cách nói trực tiếp.");
      return;
    }
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = typeof window.MediaRecorder.isTypeSupported === "function"
        ? selectRecordingMimeType(navigator.userAgent, navigator.maxTouchPoints, (type) => window.MediaRecorder.isTypeSupported(type))
        : undefined;
      const recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
      recorder.onerror = () => {
        setRecording(false);
        setError("Bản ghi bị gián đoạn. Con hãy thử lại hoặc chọn cách nói trực tiếp.");
        stopStream();
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
        setRecording(false);
        stopStream();
        if (!blob.size) {
          setError("Bản ghi chưa có tiếng. Hãy giữ nút ghi trong lúc nói rồi thử lại.");
          return;
        }
        const nextUrl = URL.createObjectURL(blob);
        audioUrlRef.current = nextUrl;
        setAudioUrl(nextUrl);
      };
      recorder.start(250);
      mediaRef.current = recorder;
      setRecording(true);
    } catch (reason) {
      stopStream();
      setError(recorderErrorMessage(reason instanceof DOMException ? reason.name : undefined));
    } finally {
      setRequesting(false);
    }
  }

  function stop() {
    if (mediaRef.current?.state !== "recording") return;
    mediaRef.current.stop();
  }

  function useDirectSpeech() {
    if (recording) stop();
    setError("");
    setReviewed(false);
    setSpokenWithoutRecording(false);
    setManualMode(true);
  }

  return (
    <div className="recorder">
      <div className="record-actions"><Button variant="outline" disabled={requesting} onClick={recording ? stop : start}>{requesting ? <><RefreshCw className="spin" /> Đang xin phép micro…</> : recording ? <><Square /> Dừng ghi</> : <><Mic /> {audioUrl ? "Ghi lại" : "Ghi giọng của con"}</>}</Button>{audioUrl && <audio controls preload="metadata" src={audioUrl} aria-label="Nghe lại giọng vừa ghi" onEnded={() => setReviewed(true)} onError={() => setError("Trình duyệt chưa phát được định dạng này. Hãy ghi lại hoặc chọn cách nói trực tiếp.")} />}</div>
      {recording && <p className="recording-live"><span /> Đang ghi… Con nói xong thì bấm “Dừng ghi”.</p>}
      {error && <p className="inline-note record-error">{error}</p>}
      {!manualMode && !recording && <button className="direct-speech-option" onClick={useDirectSpeech}>Không dùng micro · Con sẽ nói trực tiếp</button>}
      {manualMode && <div className="direct-speech-card"><span aria-hidden="true">🗣️</span><div><b>Nói trực tiếp, vẫn luyện đủ</b><p>Nhìn người nghe, nói trọn ý và tự nghe giọng của mình.</p></div><button onClick={() => setSpokenWithoutRecording(true)}><Mic /> Con đã nói xong</button></div>}
      <p className="privacy-note"><LockKeyhole /> Bản ghi chỉ ở tạm trên thiết bị và không được tải đi.</p>
      {reviewed || spokenWithoutRecording ? <div className="self-check"><span>{reviewed ? "Sau khi nghe hết bản ghi, con thấy:" : "Sau khi tự nghe giọng mình, con thấy:"}</span><button onClick={() => onPractised(55)}>Cần thử lại</button><button onClick={() => onPractised(78)}>Đã nói trọn ý</button><button onClick={() => onPractised(92)}>Rõ và tự tin</button></div> : <p className="review-gate"><Headphones /> {audioUrl ? "Nghe hết bản ghi để mở phần tự đánh giá." : manualMode ? "Nói thành tiếng trước, rồi xác nhận con đã nói xong." : "Ghi âm và nghe lại, hoặc chọn cách nói trực tiếp."}</p>}
    </div>
  );
}

export function SpeechControl({ text, slow = false, label, className = "speech-control", onHeard }: { text: string; slow?: boolean; label: string; className?: string; onHeard?: () => void }) {
  const [status, setStatus] = useState<"idle" | "starting" | "playing" | "played" | "error">("idle");
  const watchdogRef = useRef<number | undefined>(undefined);
  useEffect(() => () => {
    if (watchdogRef.current !== undefined) window.clearTimeout(watchdogRef.current);
  }, []);
  function stopWatchdog() {
    if (watchdogRef.current !== undefined) window.clearTimeout(watchdogRef.current);
    watchdogRef.current = undefined;
  }
  function listen() {
    stopWatchdog();
    setStatus("starting");
    const supported = speak(text, slow, {
      onStart: () => { stopWatchdog(); setStatus("playing"); onHeard?.(); },
      onEnd: () => { stopWatchdog(); setStatus("played"); },
      onError: () => { stopWatchdog(); setStatus("error"); },
    });
    if (!supported) { setStatus("error"); return; }
    watchdogRef.current = window.setTimeout(() => setStatus((current) => current === "starting" ? "error" : current), 2500);
  }
  function confirmReader() { stopWatchdog(); setStatus("played"); onHeard?.(); }
  return <div className="speech-control-wrap"><button className={className} onClick={listen}><Volume2 /><span>{status === "starting" ? "Đang mở giọng…" : status === "playing" ? "Đang nghe…" : status === "played" ? `Nghe lại · ${label}` : label}</span></button>{status === "error" && <div className="speech-fallback"><p>Thiết bị chưa phát được giọng mẫu.</p><button onClick={confirmReader}><UserRound /> Nhờ người lớn đọc câu này</button></div>}</div>;
}

function responseHint(line: string, level: number) {
  const words = line.split(/\s+/);
  if (level === 1) return `Bắt đầu bằng “${words[0]}” · câu có ${words.length} từ.`;
  if (level === 2) return words.map((word, index) => index > 0 && index % 3 === 0 ? "____" : word).join(" ");
  return line;
}

export function DialoguePractice({ turns, guided, title, focusWord, onDone }: { turns: DialogueTurn[]; guided: boolean; title: string; focusWord: string; onDone: (score: number, confidence?: number, word?: string) => void }) {
  const [turnIndex, setTurnIndex] = useState(0);
  const [heard, setHeard] = useState(false);
  const [hintLevel, setHintLevel] = useState(guided ? 3 : 0);
  const [confidences, setConfidences] = useState<number[]>([]);
  const current = turns[turnIndex];

  function advance() {
    setTurnIndex((value) => value + 1);
    setHeard(false);
    setHintLevel(guided ? 3 : 0);
  }

  function finishTurn(confidence: number) {
    const next = [...confidences, confidence];
    setConfidences(next);
    if (turnIndex < turns.length - 1) { advance(); return; }
    const averageConfidence = Math.round(next.reduce((sum, value) => sum + value, 0) / next.length);
    onDone(averageConfidence >= 75 ? 100 : 70, averageConfidence, focusWord);
  }

  return <div className="challenge dialogue-practice"><p className="challenge-kicker">Nghe – chờ lượt – đáp lời</p><h2>{title}</h2><p className="dialogue-purpose"><MessageCircle /> Không đọc đồng thanh: Rory nói trước, con nghe ý rồi mới trả lời.</p><div className="dialogue-progress" aria-label={`Lượt ${turnIndex + 1} trên ${turns.length}`}>{turns.map((turn, index) => <article key={`${turn.speaker}-${index}`} className={`${turn.speaker === "Rory" ? "rory-turn" : "child-turn"} ${index === turnIndex ? "current" : ""} ${index < turnIndex ? "done" : ""}`}><span className="speaker-avatar" aria-hidden="true">{turn.speaker === "Rory" ? "🦝" : "🧒"}</span><div><small>{turn.speaker === "Rory" ? "Rory" : "Con"}</small><p>{index < turnIndex || (guided && index <= turnIndex) || (index === turnIndex && turn.speaker === "Rory") || (index === turnIndex && hintLevel === 3) ? turn.line : index === turnIndex ? "Tự nghĩ câu đáp…" : "Lượt tiếp theo"}</p></div></article>)}</div>{current.speaker === "Rory" ? <div className="current-turn-actions"><SpeechControl text={current.line} label="Nghe Rory nói" onHeard={() => setHeard(true)} /><Button disabled={!heard} onClick={advance}>Con đã nghe ý · đến lượt con <ArrowRight /></Button>{!heard && <p className="turn-tip">Nghe hết ý của Rory; nếu thiết bị không phát tiếng, dùng nút nhờ người lớn đọc.</p>}</div> : <div className="child-response"><div className="response-support"><span>Đến lượt con trả lời</span>{guided ? <p>{current.line}</p> : hintLevel === 0 ? <p>Thử tự đáp bằng ý của con trước.</p> : <p className={hintLevel === 3 ? "full-hint" : ""}>{responseHint(current.line, hintLevel)}</p>}{!guided && hintLevel < 3 && <button onClick={() => setHintLevel((value) => Math.min(3, value + 1))}>Mở gợi ý {hintLevel + 1}/3</button>}</div>{(guided || hintLevel === 3) && <SpeechControl text={current.line} slow label="Nghe câu đáp mẫu" />}<Recorder key={`${turnIndex}-${guided ? "guided" : "independent"}`} onPractised={finishTurn} /></div>}</div>;
}
