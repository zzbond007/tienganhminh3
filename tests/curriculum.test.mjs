import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
    assert.ok(week.check.options.includes(week.check.answer), `week ${week.week} answer`);
  }
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
