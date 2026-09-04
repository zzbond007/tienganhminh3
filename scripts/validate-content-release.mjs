import { readFile } from "node:fs/promises";

const release = JSON.parse(await readFile(new URL("../public/content-release.json", import.meta.url), "utf8"));
const catalog = JSON.parse(await readFile(new URL("../public/content-catalog.json", import.meta.url), "utf8"));
const curriculum = await readFile(new URL("../app/english-curriculum.ts", import.meta.url), "utf8");

if (!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(release.version ?? "")) {
  throw new Error("Release version must use YYYY.MM.DD.N format.");
}
if (release.approval?.status !== "approved-for-pilot" || release.approval?.parentApprovalRequired !== true) {
  throw new Error("Pilot content must pass review and remain under parent supervision.");
}
const requiredChecks = ["curriculumAlignment", "answerVerification", "childLanguage", "privacyAndExternalLinks", "audioAndMicrophoneSafety"];
for (const check of requiredChecks) {
  if (release.approval?.checks?.[check] !== true) throw new Error(`Release check failed: ${check}.`);
}
if (catalog.program?.worlds !== 9 || catalog.program?.weeks !== 36 || catalog.program?.sessions !== 180 || catalog.program?.focusWords !== 288) {
  throw new Error("Catalog must describe 9 worlds, 36 weeks, 180 sessions and 288 focus word slots.");
}
if (catalog.learningCycle?.length !== 5 || catalog.adaptiveBands?.join("|") !== "Gỡ nút|Vừa sức|Bứt phá") {
  throw new Error("Learning cycle or adaptive bands are incomplete.");
}
const rowsBlock = curriculum.match(/const rawWeeks:[\s\S]*?= \[([\s\S]*?)\n\];\n\nfunction parseWords/);
if (!rowsBlock) throw new Error("Could not locate the curated week list.");
const weekRows = rowsBlock[1].match(/^\s{2}\["/gm) ?? [];
if (weekRows.length !== 36) throw new Error(`Expected 36 curated weeks, found ${weekRows.length}.`);
const wordGroups = [...rowsBlock[1].matchAll(/"([^"\n]*(?:\|[^"\n]*){2}(?:;[^"\n]*(?:\|[^"\n]*){2}){7})"/g)];
if (wordGroups.length !== 36) throw new Error(`Every week must contain exactly one eight-word group; found ${wordGroups.length}.`);
for (const [index, match] of wordGroups.entries()) {
  const words = match[1].split(";");
  if (words.length !== 8 || words.some((word) => word.split("|").length !== 3)) throw new Error(`Week ${index + 1} has an invalid word group.`);
}
if (!curriculum.includes("Pre‑A1 vững · tiếp cận A1")) throw new Error("Year target is missing from the curriculum.");

console.log(`English Raccoon ${release.version} passed: 36 weeks, 180 sessions, 288 focus word slots, 5 activity rhythms.`);
