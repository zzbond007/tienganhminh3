/* eslint-disable @next/next/no-img-element -- local SVG vocabulary art is packaged for offline use */
"use client";

import { Headphones, Trophy } from "lucide-react";
import { useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type SpeechCallbacks = { onStart?: () => void; onEnd?: () => void; onError?: () => void };
let activeUtterance: SpeechSynthesisUtterance | undefined;
let speechStartTimer: number | undefined;

export function speak(text: string, slow = false, callbacks: SpeechCallbacks = {}) {
  if (
    typeof window === "undefined"
    || !("speechSynthesis" in window)
    || !("SpeechSynthesisUtterance" in window)
  ) return false;
  const synthesis = window.speechSynthesis;
  if (speechStartTimer !== undefined) window.clearTimeout(speechStartTimer);
  if (activeUtterance) {
    activeUtterance.onstart = null;
    activeUtterance.onend = null;
    activeUtterance.onerror = null;
    activeUtterance = undefined;
  }
  synthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = slow ? 0.7 : 0.88;
  utterance.pitch = 1.02;
  const voices = synthesis.getVoices();
  const preferred = /samantha|ava|aria|jenny|zira|google.*english|serena|daniel/i;
  const english = voices.find((voice) => voice.lang.startsWith("en") && voice.localService && preferred.test(voice.name))
    ?? voices.find((voice) => voice.lang.startsWith("en") && voice.localService)
    ?? voices.find((voice) => voice.lang.startsWith("en"));
  if (english) utterance.voice = english;
  utterance.onstart = () => callbacks.onStart?.();
  utterance.onend = () => { callbacks.onEnd?.(); activeUtterance = undefined; };
  utterance.onerror = () => { callbacks.onError?.(); activeUtterance = undefined; };
  activeUtterance = utterance;
  // Safari/iPad can silently drop an utterance when speak() follows cancel() in the same tick.
  speechStartTimer = window.setTimeout(() => {
    try {
      synthesis.resume();
      synthesis.speak(utterance);
    } catch {
      callbacks.onError?.();
      activeUtterance = undefined;
    }
  }, 60);
  return true;
}

export function playFeedback(kind: "correct" | "try" | "complete") {
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

export function HighlightedText({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return text;
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const review = new Set(terms.map((term) => term.toLowerCase()));
  return <>{text.split(pattern).map((part, index) => review.has(part.toLowerCase()) ? <mark key={`${part}-${index}`}>{part}</mark> : part)}</>;
}

export function VocabularyArt({ symbol, label, size = "medium" }: { symbol: string; label: string; size?: "small" | "medium" | "large" }) {
  const [fallback, setFallback] = useState(false);
  if (fallback) return <span className={`art-fallback art-${size}`} role="img" aria-label={label}>{symbol}</span>;
  return <img className={`vocabulary-art art-${size}`} src={`${BASE_PATH}/illustrations/${illustrationFile(symbol)}.svg`} alt={label} draggable={false} onError={() => setFallback(true)} />;
}

export function Rory({ mood = "listen" }: { mood?: "listen" | "celebrate" | "brave" }) {
  return <div className={`rory rory-${mood}`} aria-label={mood === "celebrate" ? "Rory đang vỗ tay chúc mừng" : mood === "brave" ? "Rory đang giơ cờ cổ vũ" : "Rory đang lắng nghe"}><VocabularyArt symbol="🦝" label="Rory" size="large" /><span className="rory-action" aria-hidden="true">{mood === "celebrate" ? <Trophy /> : mood === "brave" ? "🚩" : <Headphones />}</span></div>;
}
