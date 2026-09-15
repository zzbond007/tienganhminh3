"use client";

import { BookOpen, Check, Grid2X2, Mic, Music2, RefreshCw, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { weeks, type WeekPlan, type WordCard } from "./english-curriculum";
import { orderChoiceOptions, scoreWithSupport, spellingIsCorrect } from "./learning-integrity";
import { correctPrefixLength, isPunctuation, sentenceIsCorrect, tokenizeSentence } from "./sentence-builder";
import type { LearningBand } from "./app-types";
import { DialoguePractice, Recorder, SpeechControl } from "./speech-practice";
import { HighlightedText, Rory, VocabularyArt, playFeedback, speak } from "./learning-ui";

type ChallengeProps = { week: WeekPlan; lessonId: number; sessionIndex: number; step: number; band: LearningBand; onDone: (score: number, confidence?: number, word?: string) => void };

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

function PhonicsLab({ week, onDone }: { week: WeekPlan; onDone: (score: number, confidence?: number, word?: string) => void }) {
  const [focus, focusWord] = week.sound.split(" trong ");
  const index = focusWord.toLowerCase().indexOf(focus.toLowerCase());
  const before = index >= 0 ? focusWord.slice(0, index) : "";
  const marked = index >= 0 ? focusWord.slice(index, index + focus.length) : focus;
  const after = index >= 0 ? focusWord.slice(index + focus.length) : focusWord;
  const [heardSlow, setHeardSlow] = useState(false);
  const [heardNatural, setHeardNatural] = useState(false);
  const [said, setSaid] = useState(false);
  function finish() { setSaid(true); playFeedback("correct"); onDone(heardSlow && heardNatural ? 100 : 75, undefined, focusWord); }
  return <div className="challenge phonics-lab"><p className="challenge-kicker">Phòng âm thanh · nghe bằng tai, nhìn bằng mắt</p><h2>Khám phá cụm âm <mark>{focus}</mark></h2><div className="sound-word" aria-label={focusWord}><span>{before}</span><strong>{marked}</strong><span>{after}</span></div><div className="sound-family"><small>Ba từ cùng đường âm</small><div>{week.soundFamily.map((word, familyIndex) => <button key={word} onClick={() => speak(word, familyIndex === 0)}><span>{familyIndex + 1}</span><b>{word}</b><Volume2 /></button>)}</div></div><div className="sound-track"><span className={heardSlow ? "done" : ""}>1 · Nghe chậm</span><i /><span className={heardNatural ? "done" : ""}>2 · Nối liền</span><i /><span className={said ? "done" : ""}>3 · Tự nói</span></div><div className="phonics-actions"><SpeechControl text={focusWord} slow label="Kéo chậm cả từ" className="phonics-audio-button" onHeard={() => setHeardSlow(true)} /><SpeechControl text={focusWord} label="Nghe tự nhiên" className="phonics-audio-button" onHeard={() => setHeardNatural(true)} /><button className="say-it" onClick={finish}><Mic /> Con nói liền một hơi</button></div><p className="tip">Nghe ba từ để tìm phần âm giống nhau, rồi nói cả từ liền mạch. Không đọc tên từng chữ cái.</p></div>;
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
    if (next === 4) { setFinished(true); playFeedback("complete"); onDone(100, undefined, chantWords[3].en); }
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
  const tokens = tokenizeSentence(sentence);
  const source = tokens.map((token, index) => ({ id: index, token }));
  const shuffled = [...source.slice(1), source[0]].reverse();
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [showModel, setShowModel] = useState(false);
  const orderedTokens = placed.map((id) => source[id].token);
  const correctPrefix = correctPrefixLength(tokens, orderedTokens);
  const wordCount = tokens.filter((token) => !isPunctuation(token)).length;
  const ending = [...tokens].reverse().find((token) => isPunctuation(token));

  function add(id: number) { if (!placed.includes(id) && !checked) { setPlaced((value) => [...value, id]); setWrong(false); } }
  function remove(id: number) { if (!checked) { setPlaced((value) => value.filter((item) => item !== id)); setWrong(false); } }
  function openNextHint() {
    const next = Math.min(3, hintLevel + 1);
    setHintLevel(next);
    if (next === 3) { setShowModel(true); speak(sentence, true); }
  }
  function verify() {
    if (placed.length !== source.length) return;
    const correct = sentenceIsCorrect(sentence, orderedTokens);
    if (correct) {
      setChecked(true); setWrong(false); playFeedback("correct");
      onDone(scoreWithSupport(hintLevel, attempts), undefined, words.find((word) => sentence.toLowerCase().includes(word.en.toLowerCase()))?.en);
    } else { setAttempts((value) => value + 1); setHintLevel((value) => Math.max(value, 1)); setWrong(true); playFeedback("try"); }
  }
  return <div className="challenge sentence-builder">
    <p className="challenge-kicker">Xưởng tạo câu · viết bằng thẻ từ</p><h2>Ghép ý thành một câu trọn vẹn</h2><p className="sentence-instruction"><span>1</span> Chọn thẻ theo thứ tự <b>ai → làm gì → chi tiết</b>. Chạm thẻ trong câu để đưa xuống.</p>
    <div className={wrong ? "sentence-drop needs-fix" : checked ? "sentence-drop is-correct" : "sentence-drop"} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); add(Number(event.dataTransfer.getData("text/plain"))); }}>{placed.length ? placed.map((id, index) => <button key={id} className={hintLevel >= 2 && index < correctPrefix ? "right-place" : ""} onClick={() => remove(id)}>{source[id].token}</button>) : <span>Kéo hoặc chạm các từ theo thứ tự câu con muốn nói</span>}</div>
    <div className="sentence-tiles">{shuffled.filter((item) => !placed.includes(item.id)).map((item) => <button key={item.id} draggable={!checked} disabled={checked} onDragStart={(event) => event.dataTransfer.setData("text/plain", String(item.id))} onClick={() => add(item.id)}>{item.token}</button>)}</div>
    <div className="builder-actions"><button onClick={() => { setPlaced([]); setWrong(false); setChecked(false); setShowModel(false); }}><RefreshCw /> Xếp lại</button><button className="hint-button" disabled={checked} onClick={hintLevel < 3 ? openNextHint : () => setShowModel((value) => !value)}><Sparkles /> {hintLevel < 3 ? `Gợi ý tầng ${hintLevel + 1}` : showModel ? "Ẩn câu mẫu" : "Xem lại câu mẫu"}</button><button className="check-sentence" disabled={placed.length !== source.length || checked} onClick={verify}><Check /> Kiểm tra câu</button></div>
    {hintLevel > 0 && !checked && <div className={`sentence-hints level-${hintLevel}`} aria-live="polite"><div className="hint-head"><Sparkles /><b>Gợi ý {hintLevel}/3</b><span>Mỗi tầng hé lộ thêm một điểm tựa</span></div><div className="hint-step unlocked"><b>1 · Tìm khung câu</b><p>Câu có <strong>{wordCount} từ</strong>, mở đầu bằng <strong>“{tokens[0]}”</strong>{ending ? <> và kết thúc bằng dấu <strong>“{ending}”</strong></> : null}.</p></div>{hintLevel >= 2 && <div className="hint-step unlocked"><b>2 · Nhìn bản đồ câu</b><div className="sentence-map">{tokens.map((token, index) => <span key={`${token}-${index}`} className={index < correctPrefix ? "slot-correct" : isPunctuation(token) ? "slot-punctuation" : ""}>{isPunctuation(token) ? token : index === 0 ? token : `${token[0]}${"•".repeat(Math.min(Math.max(token.length - 1, 1), 6))}`}</span>)}</div><p>{correctPrefix === tokens.length ? "Các vị trí đều đã khớp. Con hãy kiểm tra câu." : <>Con đã đặt đúng <strong>{correctPrefix}</strong> thẻ từ đầu. Thẻ đúng tiếp theo bắt đầu bằng <strong>“{tokens[correctPrefix]?.[0]?.toUpperCase()}”</strong>.</>}</p></div>}{hintLevel >= 3 && <div className="hint-step unlocked model-hint"><b>3 · Quan sát – nghe – che mẫu</b>{showModel ? <><p className="hint-model-sentence">{sentence}</p><div className="model-actions"><button onClick={() => speak(sentence, true)}><Volume2 /> Nghe cả câu</button><button onClick={() => setShowModel(false)}>Con đã nhớ · che mẫu</button></div></> : <button className="show-model" onClick={() => setShowModel(true)}>Xem lại đáp án mẫu</button>}</div>}</div>}
    {wrong && <div className="feedback try sentence-feedback"><b>Chưa khớp từ vị trí {correctPrefix + 1}.</b><span>Câu con đang xếp: “{orderedTokens.join(" ")}”</span><span>Dùng gợi ý theo từng tầng, sửa thẻ chưa đúng rồi kiểm tra lại. Con không cần làm lại từ đầu.</span></div>}
    {checked && <div className="feedback success sentence-feedback"><b><Check /> Chính xác! Câu đúng là: “{sentence}”</b><button onClick={() => speak(sentence, true)}><Volume2 /> Nghe và nói lại</button><span>Bây giờ hãy đổi một chi tiết để tạo câu mới của riêng con.</span></div>}
    {attempts > 0 && checked && <p className="retry-note">Con đã tự sửa sau {attempts} lượt thử — đó là cách trí nhớ mạnh lên.</p>}
  </div>;
}

function SpellingBuilder({ word, onDone }: { word: WordCard; onDone: (score: number, confidence?: number, word?: string) => void }) {
  const source = Array.from(word.en).map((letter, index) => ({ id: index, letter }));
  const shuffled = [...source.slice(2), ...source.slice(0, 2)].reverse();
  const [placed, setPlaced] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const [complete, setComplete] = useState(false);
  function check() {
    const correct = spellingIsCorrect(word.en, placed.map((id) => source[id].letter));
    if (correct) { setComplete(true); playFeedback("correct"); speak(word.en); onDone(100, undefined, word.en); }
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
  function verify() { const correct = order.every((value, index) => value === index); if (correct) { playFeedback("correct"); onDone(100); } else { setWrong(true); playFeedback("try"); } }
  return <div className="challenge story-path"><p className="challenge-kicker">Đạo diễn câu chuyện</p><h2>Sự việc nào diễn ra trước?</h2><div className="story-timeline">{order.map((index, position) => <button key={index} onClick={() => setOrder((value) => value.filter((item) => item !== index))}><span>{position + 1}</span>{source[index].sentence}</button>)}</div><div className="story-cards">{shuffled.filter((item) => !order.includes(item.index)).map((item) => <button key={item.index} onClick={() => add(item.index)}>{item.sentence}</button>)}</div><Button disabled={order.length !== source.length} onClick={verify}>Kiểm tra mạch truyện</Button>{wrong && <p className="feedback try">Hãy tìm dấu hiệu mở đầu, sự việc tiếp theo và kết quả cuối.</p>}</div>;
}

export function Challenge({ week, lessonId, sessionIndex, step, band, onDone }: ChallengeProps) {
  const targetIndex = (lessonId + step * 2) % week.words.length;
  const target = week.words[targetIndex];
  const choices = optionsFor(week.words, targetIndex, band === "Gỡ nút" || step === 0 ? 3 : 4);
  const [chosen, setChosen] = useState<string>();
  const [attempts, setAttempts] = useState(0);
  const [heard, setHeard] = useState(false);
  function choose(value: string, answer: string, word?: string) {
    if (chosen === answer) return;
    const nextAttempts = attempts + 1; setAttempts(nextAttempts); setChosen(value);
    if (value === answer) { playFeedback("correct"); onDone(nextAttempts === 1 ? 100 : 65, undefined, word); } else playFeedback("try");
  }
  if (sessionIndex === 1) {
    if (step === 0) return <PhonicsLab week={week} onDone={onDone} />;
    const modelWord = week.words.find((word) => week.model.toLocaleLowerCase("en").includes(word.en.toLocaleLowerCase("en"))) ?? target;
    if (step === 2) return <DialoguePractice turns={week.dialogue.slice(0, 2)} guided title="Hội thoại 1 · Nghe câu hỏi, đáp trọn ý" focusWord={modelWord.en} onDone={onDone} />;
    if (step === 3) return <DialoguePractice turns={week.dialogue.slice(2, 4)} guided title="Hội thoại 2 · Nghe ý mới, nối cuộc nói chuyện" focusWord={modelWord.en} onDone={onDone} />;
    if (step === 4) return <DialoguePractice turns={week.dialogue} guided={false} title="Đóng vai trọn cuộc hội thoại" focusWord={modelWord.en} onDone={onDone} />;
    return <div className="challenge speaking-challenge"><p className="challenge-kicker">Nghe → nhẩm → nói</p><VocabularyArt symbol={target.icon} label={target.vi} size="large" /><h2>{target.en}</h2><SpeechControl text={target.en} slow label="Nghe từ mẫu" className="listen-orb" /><p className="big-phrase">{target.en}</p><p className="tip">Nghe kỹ, che chữ rồi gọi lại từ bằng tranh. Nếu micro không dùng được, con vẫn nói trực tiếp và tự đánh giá.</p><Recorder onPractised={(confidence) => onDone(confidence >= 75 ? 100 : 70, confidence, target.en)} /></div>;
  }
  if (sessionIndex === 2) {
    if (step === 0) return <PictureDrop words={choices} onDone={onDone} />;
    if (step === 3) return <StorySequence passage={week.passage} onDone={onDone} />;
    if (step === 4) return <SentenceBuilder sentence={week.model} words={week.words} onDone={onDone} />;
    if (step === 2) return <div className="challenge reading-challenge"><p className="challenge-kicker">Đọc để tìm ý</p><div className="reading-card"><BookOpen /><div>{week.reviewWords.length > 0 && <small><RotateCcw /> Từ tuần trước được tô sáng</small>}<p><HighlightedText text={week.passage} terms={week.reviewWords} /></p></div></div><h2>{week.check.question}</h2><div className="choice-list">{week.check.options.map((option) => <button key={option} className={chosen === option ? (option === week.check.answer ? "correct" : "wrong") : ""} onClick={() => choose(option, week.check.answer)}>{option}</button>)}</div>{chosen && chosen !== week.check.answer && <p className="feedback try">Đọc lại từng câu và loại phương án không khớp chi tiết. Con vẫn còn lượt thử.</p>}{chosen === week.check.answer && <><p className="feedback success"><Check /> Đúng rồi. Con đã tìm được bằng chứng trong đoạn đọc.</p><div className="think-card"><span>🧠 Không có một đáp án duy nhất</span><h3>{week.think.prompt}</h3><p>Bắt đầu bằng: <b>{week.think.starter}</b></p><button onClick={() => speak(week.think.starter, true)}><Volume2 /> Nghe câu mở đầu</button></div></>}</div>;
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
    if (step === 4) return <div className="challenge mission-challenge"><p className="challenge-kicker">Nhiệm vụ ngoài màn hình</p><Rory mood="brave" /><h2>Dùng tiếng Anh để tạo một việc thật</h2><div className="mission-route"><span><b>1</b> Nhìn thật</span><i /><span><b>2</b> Nói thật</span><i /><span><b>3</b> Đổi ý</span></div><p className="mission-scene">{week.mission}</p><p className="big-phrase">Điểm xuất phát: {week.frame}</p><p className="tip">Con có thể thay từ, thêm lý do hoặc đổi vai. Mục tiêu là làm người nghe hiểu ý, không phải đọc thuộc câu mẫu.</p><Recorder onPractised={(confidence) => onDone(confidence >= 75 ? 100 : 70, confidence, target.en)} /></div>;
    const nearbyModels = [weeks[week.week % weeks.length].model, weeks[(week.week + 7) % weeks.length].model];
    const contextChoices = [week.model, ...nearbyModels];
    const rotatedContextChoices = contextChoices.slice(week.week % 3).concat(contextChoices.slice(0, week.week % 3));
    const missionPrompts = [
      { q: `Trong tình huống “${week.scene}”, câu nào mở đúng chủ đề?`, a: week.model, opts: rotatedContextChoices },
      { q: `Từ nào có nghĩa “${target.vi}” trong tình huống này?`, a: target.en, opts: orderChoiceOptions([target.en, ...choices.filter((word) => word.en !== target.en).slice(0, 2).map((word) => word.en)], target.en, week.week + step) },
      { q: week.check.question, a: week.check.answer, opts: week.check.options },
      { q: "Câu nào dùng trọn vẹn mẫu giao tiếp của tuần này?", a: week.model, opts: rotatedContextChoices },
    ];
    const mission = missionPrompts[step];
    return <div className="challenge mission-challenge"><p className="challenge-kicker">Mini mission · chọn ngôn ngữ có mục đích</p><div className="dialogue-rory"><Rory mood="listen" /><p>{mission.q}</p></div><div className="choice-list">{mission.opts.map((option) => <button key={option} className={chosen === option ? (option === mission.a ? "correct" : "wrong") : ""} onClick={() => choose(option, mission.a, target.en)}>{option}</button>)}</div>{chosen === mission.a && <div className="feedback success"><Check /> Câu này phù hợp với tình huống. <button onClick={() => speak(mission.a)}><Volume2 /> Nghe rồi đổi một chi tiết</button></div>}</div>;
  }
  if (step === 4) return <RhythmChant words={week.words} onDone={onDone} />;
  return <div className="challenge listening-challenge"><p className="challenge-kicker">Chỉ nghe trước · nhịp {band}</p><h2>Con nghe thấy ý nào?</h2><SpeechControl text={target.en} slow={band === "Gỡ nút" || step < 2} label={heard ? "Nghe lại" : "Bấm để nghe"} className="listen-orb" onHeard={() => setHeard(true)} /><div className="picture-choices">{choices.map((word) => <button key={word.en} disabled={!heard} className={chosen === word.en ? (word.en === target.en ? "correct" : "wrong") : ""} onClick={() => choose(word.en, target.en, target.en)}><VocabularyArt symbol={word.icon} label={word.vi} /><b>{band === "Bứt phá" && step > 1 ? "?" : word.en}</b></button>)}</div>{!heard && <p className="tip">Hãy nghe trước rồi mới mở khóa các lựa chọn. Nếu thiết bị im lặng, nhờ người lớn đọc từ.</p>}{chosen && chosen !== target.en && <p className="feedback try">Âm chưa khớp. Nghe chậm lại và thử tiếp nhé.</p>}{chosen === target.en && <p className="feedback success"><Check /> Đúng âm rồi: <b>{target.en}</b> · {target.vi}</p>}</div>;
}
