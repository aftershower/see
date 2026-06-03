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
  assert.match(html, /id="shareUpdateButton"/);
  assert.match(html, /id="copyUpdateButton"/);
  assert.match(html, /id="shareUpdateText"/);
  assert.match(html, /aria-label="给家人报平安"/);
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
  assert.match(css, /\.share-section/);
  assert.match(css, /\.share-output/);
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
  assert.match(app, /pruneRetainedMessages/);
  assert.match(app, /retainedMessages/);
  assert.match(app, /messages:\s*retainedMessages\(/);
  assert.match(app, /function saveState[\s\S]*pruneRetainedMessages\(\)/);
  assert.match(app, /function retainedMessages[\s\S]*messages\.slice\(-MAX_RETAINED_MESSAGES\)/);
  assert.match(app, /checkInButton/);
  assert.match(app, /resetButton/);
  assert.match(app, /exportButton/);
  assert.match(app, /importButton/);
  assert.match(app, /importInput/);
  assert.match(app, /trimHistoryButton/);
  assert.match(app, /shareUpdateButton/);
  assert.match(app, /copyUpdateButton/);
  assert.match(app, /shareUpdateText/);
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
  assert.match(app, /createShareableUpdate/);
  assert.match(app, /clearShareDraft/);
  assert.match(app, /shareUpdateText\.value\s*=\s*""/);
  assert.match(app, /报平安草稿已清空/);
  assert.match(app, /companionMemoryContext/);
  assert.match(app, /memories:\s*companionMemoryContext\(\)/);
  assert.match(app, /sensitivity\s*!==\s*"sensitive"/);
  assert.match(app, /!item\.doNotMention/);
  assert.match(app, /map\(\(\{\s*type,\s*label\s*\}\)\s*=>\s*\(\{\s*type,\s*label\s*\}\)\)/);
  assert.match(app, /navigator\.clipboard\.writeText/);
  assert.match(app, /生成近况/);
  assert.match(app, /已复制/);
  assert.doesNotMatch(app, /navigator\.share/);
  assert.doesNotMatch(app, /\/api\/share/);
  assert.doesNotMatch(app, /mailto:/);
  assert.match(app, /removeMemory/);
  assert.match(app, /function removeMemory[\s\S]*clearShareDraft/);
  assert.match(app, /deletedMemoryKeys/);
  assert.match(app, /rememberDeletedMemory/);
  assert.match(app, /memoryTombstoneKey/);
  assert.match(app, /deletedMemoryKeys:\s*state\.deletedMemoryKeys/);
  assert.match(app, /state\.deletedMemoryKeys\s*=\s*nextState\.deletedMemoryKeys/);
  assert.match(app, /function applyImportedState[\s\S]*clearShareDraft/);
  assert.match(app, /resetButton\.addEventListener[\s\S]*clearShareDraft/);
  assert.match(app, /data-memory-id/);
});

test("manifest defines installable app identity", async () => {
  const manifest = JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));

  assert.equal(manifest.name, "See Elder Companion");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
});
