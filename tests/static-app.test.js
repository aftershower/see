import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("app shell is a chat-first elder companion interface", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /id="messages"/);
  assert.match(html, /id="messages"[^>]*role="log"/);
  assert.match(html, /id="messages"[^>]*aria-relevant="additions"/);
  assert.match(html, /id="messages"[^>]*aria-atomic="false"/);
  assert.match(html, /id="chatForm"/);
  assert.match(html, /id="memoryList"/);
  assert.match(html, /id="checkInButton"/);
  assert.match(html, /privacyNotice/);
  assert.match(html, /id="exportButton"/);
  assert.match(html, /id="importButton"/);
  assert.match(html, /id="importInput"[^>]*type="file"/);
  assert.match(html, /id="importInput"[^>]*accept="application\/json,.json"/);
  assert.match(html, /id="trimHistoryButton"/);
  assert.match(html, /id="storageWarning"[^>]*aria-live="polite"/);
  assert.match(html, /id="resetButton"[^>]*aria-label="清空聊天和记忆"/);
  assert.doesNotMatch(html, /hero|landing|pricing/i);
});

test("styles use large readable text and responsive layout", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

  assert.match(css, /font-size:\s*(?:20|21|22)px/);
  assert.match(css, /\.app-shell/);
  assert.match(css, /\.privacy-actions/);
  assert.match(css, /\.storage-warning/);
  assert.match(css, /\.storage-warning--info/);
  assert.match(css, /\.message--verify/);
  assert.match(css, /@media \(max-width:\s*860px\)/);
  assert.match(css, /:focus-visible/);
});

test("browser app wires local memory and companion core", async () => {
  const app = await readFile(new URL("../app.js", import.meta.url), "utf8");

  assert.match(app, /generateCompanionReply/);
  assert.match(app, /fetch\("\/api\/chat"/);
  assert.match(app, /navigator\.language/);
  assert.match(app, /localCompanionReply/);
  assert.match(app, /mergeMemories/);
  assert.match(app, /localStorage/);
  assert.match(app, /checkInButton/);
  assert.match(app, /resetButton/);
  assert.match(app, /exportButton/);
  assert.match(app, /importButton/);
  assert.match(app, /importInput/);
  assert.match(app, /trimHistoryButton/);
  assert.match(app, /storageWarning/);
  assert.match(app, /exportState/);
  assert.match(app, /setStorageStatus/);
  assert.match(app, /记录已导出/);
  assert.match(app, /导入完成/);
  assert.match(app, /已保留最近/);
  assert.match(app, /importState/);
  assert.match(app, /applyImportedState/);
  assert.match(app, /if\s*\(\s*applyImportedState\(imported,\s*\{\s*mergeWithCurrent\s*\}\)\s*\)/);
  assert.match(app, /if\s*\(\s*saveState\(\)\s*\)\s*\{\s*render\(\);\s*setStorageStatus\("已保留最近/s);
  assert.match(app, /mergeLocalDataStates/);
  assert.match(app, /new FileReader/);
  assert.match(app, /trimHistory/);
  assert.match(app, /URL\.createObjectURL/);
  assert.match(app, /new Blob/);
  assert.match(app, /removeMemory/);
  assert.match(app, /data-memory-id/);
});

test("manifest defines installable app identity", async () => {
  const manifest = JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));

  assert.equal(manifest.name, "See Elder Companion");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
});
