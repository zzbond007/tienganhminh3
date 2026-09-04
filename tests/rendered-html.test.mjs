import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const values = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? readCssTree(entryPath) : entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
  }));
  return values.join("\n");
}

test("renders English Raccoon metadata and core navigation", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<html\s+lang="vi">/i);
  assert.match(html, /<title>English Raccoon · Tiếng Anh thực hành lớp 3<\/title>/i);
  assert.match(html, /rel="manifest"/i);
  assert.match(html, /English Raccoon/i);
  assert.match(html, /aria-label="Điều hướng chính"/i);
  assert.match(html, /180 buổi/i);
});

test("ships responsive, readable and reduced-motion styles", async () => {
  const css = await readCssTree(path.join(root, "dist"));
  assert.match(css, /font:\s*500 16px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /(max-width:\s*680px|width<=680px)/);
  assert.match(css, /\.listen-orb/);
  assert.match(css, /\.bottom-nav/);
});
