import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({ appType: "custom", configFile: false, root, resolve: { alias: { "@": root } }, server: { middlewareMode: true } });
after(async () => vite.close());

test("contains the complete 36-week, 180-session program", async () => {
  const { weeks, worlds, sessionKinds, programFacts } = await vite.ssrLoadModule("/app/english-curriculum.ts");
  assert.equal(worlds.length, 9);
  assert.equal(weeks.length, 36);
  assert.equal(sessionKinds.length, 5);
  assert.equal(programFacts.sessions, 180);
  assert.equal(weeks.flatMap((week) => week.words).length, 288);
  assert.deepEqual(weeks.map((week) => week.week), Array.from({ length: 36 }, (_, index) => index + 1));
});

test("every curated week has usable words, a model, reading and a verified answer", async () => {
  const { weeks } = await vite.ssrLoadModule("/app/english-curriculum.ts");
  for (const week of weeks) {
    assert.equal(week.words.length, 8, `week ${week.week}`);
    assert.ok(week.words.every((word) => word.en && word.vi && word.icon), `week ${week.week} word cards`);
    assert.ok(week.frame.includes("___") || week.frame.length > 8, `week ${week.week} sentence frame`);
    assert.ok(week.model.length > 8, `week ${week.week} model`);
    assert.ok(week.passage.split(/\s+/).length >= 8, `week ${week.week} reading`);
    assert.equal(week.check.options.length, 3, `week ${week.week} options`);
    assert.equal(new Set(week.check.options).size, 3, `week ${week.week} unique options`);
    assert.equal(week.check.options.filter((option) => option === week.check.answer).length, 1, `week ${week.week} one answer`);
    assert.ok(week.check.options.includes(week.check.answer), `week ${week.week} answer`);
    assert.equal(week.soundFamily.length, 3, `week ${week.week} sound family`);
    assert.equal(week.soundFamily[0], week.sound.split(" trong ")[1], `week ${week.week} sound anchor`);
    assert.ok(week.mission.length >= 60, `week ${week.week} real-world mission`);
    assert.ok(week.think.prompt.length >= 20 && week.think.starter.length >= 8, `week ${week.week} open thinking prompt`);
  }
});

test("keeps early reading light and spirals a previous-week word into every later passage", async () => {
  const { weeks } = await vite.ssrLoadModule("/app/english-curriculum.ts");
  for (const week of weeks.slice(0, 4)) {
    assert.ok((week.passage.match(/[.!?]/g) ?? []).length <= 2, `week ${week.week} early sentence load`);
    assert.ok(week.passage.split(/\s+/).length <= 12, `week ${week.week} early word load`);
  }
  assert.deepEqual(weeks[0].reviewWords, []);
  for (let index = 1; index < weeks.length; index += 1) {
    const week = weeks[index];
    const previousWords = new Set(weeks[index - 1].words.map((word) => word.en.toLowerCase()));
    assert.ok(week.reviewWords.length >= 1 && week.reviewWords.length <= 2, `week ${week.week} review count`);
    for (const reviewWord of week.reviewWords) {
      assert.ok(previousWords.has(reviewWord.toLowerCase()), `week ${week.week} review source: ${reviewWord}`);
      const escaped = reviewWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(week.passage, new RegExp(`\\b${escaped}\\b`, "i"), `week ${week.week} passage review: ${reviewWord}`);
    }
  }
});

test("fully restores week 19 and applies the reviewed vocabulary and comprehension fixes", async () => {
  const { weeks } = await vite.ssrLoadModule("/app/english-curriculum.ts");
  const week6 = weeks[5];
  const week7 = weeks[6];
  const week11 = weeks[10];
  const week12 = weeks[11];
  const week18 = weeks[17];
  const week19 = weeks[18];
  assert.equal(week6.words.find((word) => word.en === "desk")?.icon, "🖥️");
  assert.equal(week7.words.find((word) => word.en === "drink")?.icon, "🧃");
  assert.equal(week7.words.find((word) => word.en === "go")?.icon, "➡️");
  assert.equal(week18.words.find((word) => word.en === "between")?.icon, "🔲");
  assert.equal(week12.frame, "Please help me with ___.");
  assert.equal(week11.check.answer, "Ride a bike and swim");
  assert.deepEqual(week19.words.map((word) => word.en), ["walk", "bike", "bus", "car", "train", "boat", "plane", "helmet"]);
  assert.ok(week19.frame && week19.model && week19.sound && week19.passage && week19.check.answer);
});

test("keeps release metadata and the offline catalog complete JSON documents", async () => {
  const release = JSON.parse(await readFile(new URL("../public/content-release.json", import.meta.url), "utf8"));
  const catalog = JSON.parse(await readFile(new URL("../public/content-catalog.json", import.meta.url), "utf8"));
  assert.equal(release.version, "2026.09.10.1");
  assert.deepEqual(catalog.reviewIntervalsDays, [1, 3, 7]);
  assert.equal(catalog.contentQuality.spiralReviewWeeks, 35);
  assert.equal(catalog.contentQuality.realWorldMissions, 36);
});

test("keeps child data local and treats speech recording as self-review", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /english-raccoon-learning-v1/);
  assert.match(source, /speechSynthesis/);
  assert.match(source, /getUserMedia/);
  assert.match(source, /Bản ghi chỉ ở tạm trên thiết bị/);
  assert.doesNotMatch(source, /SpeechRecognition|webkitSpeechRecognition/);
  assert.doesNotMatch(source, /fetch\(/);
});

test("provides direct static params for every week and lesson", async () => {
  const weekRoute = await vite.ssrLoadModule("/app/week/[id]/page.tsx");
  const lessonRoute = await vite.ssrLoadModule("/app/lesson/[id]/page.tsx");
  assert.equal(weekRoute.generateStaticParams().length, 36);
  assert.equal(lessonRoute.generateStaticParams().length, 180);
  assert.deepEqual(weekRoute.generateStaticParams().at(-1), { id: "36" });
  assert.deepEqual(lessonRoute.generateStaticParams().at(-1), { id: "180" });
});

test("packages a consistent offline vector illustration for every vocabulary card", async () => {
  const { weeks } = await vite.ssrLoadModule("/app/english-curriculum.ts");
  const fileFor = (symbol) => Array.from(symbol).map((character) => character.codePointAt(0).toString(16)).filter((code) => code !== "fe0f").join("-");
  for (const word of weeks.flatMap((week) => week.words)) {
    await access(new URL(`../public/illustrations/${fileFor(word.icon)}.svg`, import.meta.url));
  }
});

test("adds phonics, rhythm, matching, story ordering and sentence construction", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const component of ["PhonicsLab", "RhythmChant", "PictureDrop", "MemoryMatch", "SentenceBuilder", "SpellingBuilder", "StorySequence"]) {
    assert.match(source, new RegExp(`function ${component}`));
  }
  assert.match(source, /draggable/);
  assert.match(source, /onDrop/);
  assert.match(source, /Gợi ý tầng/);
  assert.match(source, /Gợi ý \{hintLevel\}\/3/);
  assert.match(source, /Cầu nối trí nhớ/);
  assert.match(source, /Không có một đáp án duy nhất/);
  assert.match(source, /Dùng tiếng Anh để tạo một việc thật/);
  assert.doesNotMatch(source, /Goodbye, chair|seven purple/);
});

test("accepts the visible sentence even when identical word tiles swap identities", async () => {
  const { sentenceIsCorrect, tokenizeSentence, correctPrefixLength } = await vite.ssrLoadModule("/app/sentence-builder.ts");
  const target = "I can see what I can do.";
  const tokens = tokenizeSentence(target);
  assert.equal(sentenceIsCorrect(target, ["I", "can", "see", "what", "I", "can", "do", "."]), true);
  assert.equal(sentenceIsCorrect(target, ["I", "can", "see", "what", "can", "I", "do", "."]), false);
  assert.equal(sentenceIsCorrect("She's kind!", ["she’s", "kind", "!"]), true);
  assert.equal(correctPrefixLength(tokens, ["I", "can", "see", "do"]), 3);
});

test("supports safe v1 migration, streaks, badges, QR transfer and printable week sheets", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /migrateProfile/);
  assert.match(source, /schemaVersion: 2/);
  assert.match(source, /calculateStreak/);
  assert.match(source, /earnedWorlds/);
  assert.match(source, /QRCode\.toDataURL/);
  assert.match(css, /@media print/);
});
