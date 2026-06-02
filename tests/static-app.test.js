import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("app shell is a chat-first elder companion interface", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /id="messages"/);
  assert.match(html, /id="chatForm"/);
  assert.match(html, /id="memoryList"/);
  assert.match(html, /id="checkInButton"/);
  assert.doesNotMatch(html, /hero|landing|pricing/i);
});

test("styles use large readable text and responsive layout", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

  assert.match(css, /font-size:\s*(?:20|21|22)px/);
  assert.match(css, /\.app-shell/);
  assert.match(css, /@media \(max-width:\s*860px\)/);
  assert.match(css, /:focus-visible/);
});

test("browser app wires local memory and companion core", async () => {
  const app = await readFile(new URL("../app.js", import.meta.url), "utf8");

  assert.match(app, /generateCompanionReply/);
  assert.match(app, /mergeMemories/);
  assert.match(app, /localStorage/);
  assert.match(app, /checkInButton/);
  assert.match(app, /resetButton/);
});

test("manifest defines installable app identity", async () => {
  const manifest = JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));

  assert.equal(manifest.name, "See Elder Companion");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
});
