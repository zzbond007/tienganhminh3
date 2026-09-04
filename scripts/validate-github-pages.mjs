import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "out");

const expectedRoutes = [
  "week/1/index.html",
  "week/36/index.html",
  "lesson/1/index.html",
  "lesson/180/index.html",
  "assessment/index.html",
  "roadmap/index.html",
  "parent/index.html",
];

await Promise.all(expectedRoutes.map((route) => access(path.join(outputRoot, route))));

const fallback = await readFile(path.join(outputRoot, "404.html"), "utf8");
if (!fallback.includes("window.location.replace") || !fallback.includes("?route=")) {
  throw new Error("GitHub Pages 404 fallback is missing its route redirect.");
}

const serviceWorker = await readFile(path.join(outputRoot, "sw.js"), "utf8");
if (!serviceWorker.includes("index.html")) {
  throw new Error("Offline navigation fallback is missing from the service worker.");
}

console.log("GitHub Pages routes passed: assessment, roadmap, parent, 36 weeks, 180 lessons, and 404 fallback.");
