/* eslint-disable @next/next/no-img-element -- generated QR data URLs are local transfer artifacts */
"use client";

import { Copy, Download, QrCode, ShieldCheck, Upload, Volume2 } from "lucide-react";
import QRCode from "qrcode";
import type React from "react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { weeks } from "./english-curriculum";
import { averageSpeakingConfidence } from "./learning-integrity";
import { calculateStreak, earnedWorlds, localDay, migrateProfile, newProfile } from "./profile-model";
import type { LearningBand, LessonRecord, Profile } from "./app-types";
import { playFeedback, speak } from "./learning-ui";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const vocabularyIndex = [...new Set(weeks.flatMap((week) => week.words.map((word) => word.en)))];
const dayNumber = (value: string) => Math.floor(new Date(value).getTime() / 86_400_000);
const dayFromNumber = (value: number) => new Date(value * 86_400_000).toISOString();

function compactProfile(profile: Profile) {
  const band = profile.diagnostic?.band === "Gỡ nút" ? 0 : profile.diagnostic?.band === "Bứt phá" ? 2 : 1;
  return {
    v: 3,
    n: profile.nickname,
    d: profile.diagnostic ? [profile.diagnostic.score, band, dayNumber(profile.diagnostic.takenAt)] : undefined,
    l: Object.entries(profile.completedLessons).map(([id, item]) => [Number(id), item.score, item.firstTry, dayNumber(item.completedAt), item.measurementVersion, item.speakingConfidence ?? -1, item.speakingSamples ?? 0]),
    w: Object.entries(profile.wordMemory).map(([word, item]) => [vocabularyIndex.indexOf(word), item.strength, dayNumber(item.dueAt), item.seen]),
    a: profile.activityDates.map((date) => dayNumber(date)),
  };
}

function expandProfile(value: unknown): Profile | undefined {
  if (!value || typeof value !== "object") return undefined;
  const data = value as { v?: number; n?: string; d?: number[]; l?: number[][]; w?: number[][]; a?: number[] };
  if ((data.v !== 2 && data.v !== 3) || !Array.isArray(data.l)) return undefined;
  const base = newProfile();
  const bands: LearningBand[] = ["Gỡ nút", "Vừa sức", "Bứt phá"];
  return {
    ...base,
    nickname: data.n?.slice(0, 24) || base.nickname,
    diagnostic: data.v === 3 && data.d ? { score: data.d[0], band: bands[data.d[1]] ?? "Vừa sức", takenAt: dayFromNumber(data.d[2]), measurementVersion: 3 } : undefined,
    completedLessons: Object.fromEntries(data.l.map((item) => {
      if (data.v === 2) {
        const [id, score, , firstTry, day] = item;
        return [String(id), { score, firstTry, completedAt: dayFromNumber(day), measurementVersion: 2 } satisfies LessonRecord];
      }
      const [id, score, firstTry, day, measurementVersion, speakingConfidence, speakingSamples] = item;
      const record: LessonRecord = {
        score,
        firstTry,
        completedAt: dayFromNumber(day),
        measurementVersion: measurementVersion === 3 ? 3 : 2,
        ...(speakingConfidence >= 0 && speakingSamples > 0 ? { speakingConfidence, speakingSamples } : {}),
      };
      return [String(id), record];
    })),
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

export function ParentView({ profile, setProfile }: { profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const records = Object.values(profile.completedLessons);
  const total = records.length;
  const confidence = averageSpeakingConfidence(records.filter((record) => record.measurementVersion === 3));
  const legacyRecords = records.filter((record) => record.measurementVersion !== 3).length;
  const weakWords = Object.entries(profile.wordMemory).filter(([, word]) => word.strength < 65).sort((a, b) => a[1].strength - b[1].strength).slice(0, 6);
  const badges = earnedWorlds(profile);
  const streak = calculateStreak(profile);
  const [message, setMessage] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [transferLink, setTransferLink] = useState("");
  const [incoming, setIncoming] = useState<Profile>();

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("transfer");
    if (!token) return;
    decodeTransfer(token).then((received) => received ? setIncoming(received) : setMessage("Mã chuyển tiến độ không hợp lệ hoặc đã bị thiếu dữ liệu.")).catch(() => setMessage("Chưa đọc được mã chuyển tiến độ này."));
  }, []);

  function download() {
    const payload = { product: "English Raccoon", schemaVersion: 3, exportedAt: new Date().toISOString(), profile };
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
      url.hash = new URLSearchParams({ transfer: token }).toString();
      const value = url.toString();
      const image = await QRCode.toDataURL(value, { width: 320, margin: 2, errorCorrectionLevel: "L", color: { dark: "#102a43", light: "#ffffff" } });
      setTransferLink(value); setQrImage(image); setMessage("Mở camera trên thiết bị mới và quét mã. Tiến độ chỉ được nhập sau khi xác nhận.");
    } catch { setMessage("Hồ sơ hiện quá lớn cho một mã QR. Hãy dùng tệp JSON để giữ toàn bộ dữ liệu."); }
  }
  function acceptIncoming() {
    if (!incoming) return;
    setProfile(incoming); setIncoming(undefined); window.history.replaceState({}, "", `${BASE_PATH}/parent/`); setMessage("Đã chuyển tiến độ sang thiết bị này."); playFeedback("complete");
  }
  return <div className="page parent-page"><div className="page-intro"><p className="eyebrow">Góc đồng hành</p><h1>Nhìn tiến bộ, không gắn nhãn</h1><p>Dữ liệu nằm trên thiết bị này. Báo cáo tập trung vào thói quen, mức tự tin và từ cần dùng lại trong đời sống.</p></div>{incoming && <section className="incoming-transfer"><QrCode /><div><h2>Đã nhận một hành trình</h2><p>{incoming.nickname} · {Object.keys(incoming.completedLessons).length}/180 buổi. Chỉ nhập nếu đây là hồ sơ của bé.</p></div><Button onClick={acceptIncoming}>Xác nhận nhập</Button></section>}{legacyRecords > 0 && <section className="integrity-note"><ShieldCheck /><div><h2>Đã bảo toàn {legacyRecords} buổi học cũ</h2><p>Các buổi này vẫn được tính là đã hoàn thành, nhưng điểm cũ không còn dùng để đổi độ khó. Bé làm lại bài Khám phá và các buổi tiếp theo để tạo số liệu theo chuẩn mới.</p></div></section>}<section className="parent-summary"><div><span>Chuỗi học hiện tại</span><b>{streak} ngày</b></div><div><span>Buổi đã học</span><b>{total}/180</b></div><div><span>Tự tin khi nói</span><b className={confidence === undefined ? "no-data" : ""}>{confidence === undefined ? "Chưa có dữ liệu nói" : `${confidence}%`}</b></div><div><span>Huy hiệu thế giới</span><b>{badges.length}/9</b></div></section><section className="parent-insight"><div><p className="eyebrow">Gợi ý tuần này</p><h2>{weakWords.length ? "Đưa từ còn yếu vào cuộc sống" : "Tạo thêm một câu mới ngoài màn hình"}</h2><p>{weakWords.length ? "Không kiểm tra lại bằng danh sách. Hãy chọn hai từ dưới đây, tìm vật hoặc tình huống thật và để bé tự đặt câu." : "Sau mỗi buổi, hỏi bé dùng một từ vừa học để nói về chính căn phòng, gia đình hoặc kế hoạch của mình."}</p></div><div className="weak-word-list">{weakWords.length ? weakWords.map(([word, item]) => <button key={word} onClick={() => speak(word, true)}><Volume2 /> {word}<small>{item.strength}%</small></button>) : <span>Chưa có từ nào cần hỗ trợ đặc biệt.</span>}</div></section><section className="parent-card"><div><p className="eyebrow">Hồ sơ của bé</p><h2>Tên gọi và âm phản hồi</h2></div><div className="profile-controls"><label className="name-field"><span>Tên thân mật</span><input value={profile.nickname} maxLength={24} onChange={(event) => setProfile((current) => ({ ...current, nickname: event.target.value || "Nhà thám hiểm" }))} /></label><label className="sound-toggle"><input type="checkbox" checked={profile.settings.soundEffects} onChange={(event) => setProfile((current) => ({ ...current, settings: { ...current.settings, soundEffects: event.target.checked } }))} /><span>Âm chúc mừng</span></label></div></section><section className="parent-card backup-card"><div><p className="eyebrow">Sao lưu riêng tư</p><h2>Giữ hành trình khi đổi thiết bị</h2><p>QR chuyển nhanh tiến độ giữa hai thiết bị. JSON là bản dự phòng đầy đủ và nên lưu mỗi tháng.</p></div><div className="backup-actions"><Button onClick={makeQr}><QrCode /> Tạo mã chuyển</Button><Button variant="outline" onClick={download}><Download /> Sao lưu JSON</Button><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Khôi phục</Button><input ref={fileRef} type="file" accept="application/json" hidden onChange={restore} /></div>{qrImage && <div className="qr-panel"><img src={qrImage} alt="Mã QR chuyển tiến độ English Raccoon" /><div><b>Quét bằng thiết bị mới</b><p>Mã chứa dữ liệu nén trong phần riêng tư của liên kết; không gửi hồ sơ tới máy chủ.</p><Button variant="outline" onClick={() => navigator.clipboard?.writeText(transferLink).then(() => setMessage("Đã sao chép liên kết chuyển tiến độ."))}><Copy /> Sao chép liên kết</Button></div></div>}{message && <p className="inline-note">{message}</p>}</section><section className="safety-card"><ShieldCheck /><div><h2>Nguyên tắc chấm nói</h2><p>English Raccoon không dùng nhận dạng giọng nói để phán “đúng/sai”. Bé nghe mẫu, ghi âm, nghe lại và tự đánh giá với phụ huynh. Điều này tránh đánh giá oan do micro, tiếng ồn hoặc giọng vùng miền.</p></div></section></div>;
}
