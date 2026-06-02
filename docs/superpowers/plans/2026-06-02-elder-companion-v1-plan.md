# Elder Companion V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and push a text-first, elder-first AI companion PWA that can chat, remember life details, propose gentle check-ins, and route risky topics safely.

**Architecture:** Use a static browser app backed by pure JavaScript companion logic. The pure core powers both the UI and Node tests, while the browser layer handles rendering, localStorage persistence, and PWA behavior. A tiny Node server serves files and exposes a demo `/api/chat` boundary without requiring external services.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, Node.js built-in `node:test`, localStorage, static PWA manifest.

---

## File Structure

- `package.json`: scripts for local server and tests.
- `index.html`: accessible single-screen app shell.
- `styles.css`: elder-friendly responsive visual system.
- `app.js`: browser state, event handling, rendering, persistence.
- `src/companion-core.js`: pure logic for memory extraction, safety, check-ins, and fallback responses.
- `server.js`: static file server plus `/health` and `/api/chat`.
- `manifest.webmanifest`: PWA metadata.
- `memory/.gitkeep`: keeps the ignored local memory directory present.
- `tests/companion-core.test.js`: Node tests for core behavior.
- `README.md`: local run instructions, product notes, privacy notes.

## Task 1: Project Skeleton

**Files:**
- Create: `package.json`
- Create: `memory/.gitkeep`
- Create: `README.md`

- [ ] **Step 1: Create scripts and project metadata**

Add `package.json`:

```json
{
  "name": "see-elder-companion",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Create README with run and privacy notes**

Add `README.md` explaining:

```markdown
# See

Text-first elder companion prototype.

## Run

```bash
npm start
```

Open `http://localhost:5173`.

## Test

```bash
npm test
```

## Privacy

V1 stores conversation memory locally in the browser. There is no account system, family dashboard, continuous microphone, or cloud memory service.
```

- [ ] **Step 3: Keep memory directory**

Add empty `memory/.gitkeep`.

- [ ] **Step 4: Commit skeleton**

Run:

```bash
git add package.json README.md memory/.gitkeep
git commit -m "Add project skeleton"
```

Expected: commit succeeds.

## Task 2: Companion Core With Tests

**Files:**
- Create: `src/companion-core.js`
- Create: `tests/companion-core.test.js`

- [ ] **Step 1: Write failing core tests**

Add `tests/companion-core.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  classifySafety,
  extractMemories,
  mergeMemories,
  planCheckIn,
  generateCompanionReply
} from "../src/companion-core.js";

test("extracts elder-life memories from a message", () => {
  const memories = extractMemories("我女儿小玲周末来看我，我喜欢和她一起包饺子。", "m1");
  assert.ok(memories.some((item) => item.type === "person" && item.label.includes("小玲")));
  assert.ok(memories.some((item) => item.type === "interest" && item.label.includes("包饺子")));
});

test("deduplicates memories by type and label", () => {
  const first = extractMemories("我女儿小玲今天来看我。", "m1");
  const second = extractMemories("小玲说明天还来。", "m2");
  const merged = mergeMemories(first, second);
  const xiaoling = merged.filter((item) => item.label.includes("小玲"));
  assert.equal(xiaoling.length, 1);
});

test("classifies urgent medical and scam messages", () => {
  assert.equal(classifySafety("我胸口很痛，喘不上气").level, "urgent");
  assert.equal(classifySafety("陌生人让我买礼品卡转账").level, "scam");
});

test("plans time-aware check-ins", () => {
  const morning = planCheckIn({
    now: new Date("2026-06-02T08:00:00"),
    lastMessageAt: null,
    memories: [{ type: "routine", label: "晨练", detail: "喜欢早上散步" }]
  });
  assert.equal(morning.slot, "morning");
  assert.match(morning.text, /早|晨|散步/);
});

test("generates short elder-first replies and safety routing", () => {
  const safeReply = generateCompanionReply({
    text: "今天有点闷，想老朋友了。",
    memories: [],
    now: new Date("2026-06-02T20:00:00")
  });
  assert.ok(safeReply.text.length < 160);
  assert.match(safeReply.text, /朋友|想念|陪/);

  const urgentReply = generateCompanionReply({
    text: "我胸口很痛，喘不上气。",
    memories: [],
    now: new Date("2026-06-02T20:00:00")
  });
  assert.equal(urgentReply.safety.level, "urgent");
  assert.match(urgentReply.text, /急救|120|911|身边的人/);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test
```

Expected: fails because `src/companion-core.js` does not exist.

- [ ] **Step 3: Implement core functions**

Create `src/companion-core.js` with exported functions:

```js
export function classifySafety(text) {
  const normalized = text.toLowerCase();
  if (/胸口|胸痛|喘不上气|中风|摔倒|昏倒|流血|急救|救命|heart|stroke|emergency/.test(normalized)) {
    return { level: "urgent", reason: "medical_urgency" };
  }
  if (/不想活|自杀|伤害自己|活不下去|suicide|kill myself|self harm/.test(normalized)) {
    return { level: "crisis", reason: "self_harm" };
  }
  if (/转账|礼品卡|验证码|银行卡|陌生人|中奖|gift card|wire transfer|verification code/.test(normalized)) {
    return { level: "scam", reason: "fraud_risk" };
  }
  if (/孤独|寂寞|难过|害怕|没人|想哭|lonely|sad/.test(normalized)) {
    return { level: "support", reason: "emotional_support" };
  }
  return { level: "normal", reason: "none" };
}

export function extractMemories(text, sourceMessageId = cryptoSafeId()) {
  const memories = [];
  const add = (type, label, detail, confidence = 0.78) => {
    const cleanLabel = label.trim().replace(/[，。,.!?！？]/g, "");
    if (!cleanLabel) return;
    memories.push({
      id: `${type}-${slug(cleanLabel)}`,
      type,
      label: cleanLabel,
      detail,
      confidence,
      sourceMessageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const personPatterns = [
    /(?:我|俺)?(?:女儿|儿子|老伴|孙子|孙女|朋友|邻居|护工|妹妹|哥哥|姐姐|弟弟)([^，。,.!?！？\s]{1,6})/g,
    /([^，。,.!?！？\s]{1,6})(?:周末|今天|明天|昨天)?(?:来看我|来过|要来)/g
  ];
  for (const pattern of personPatterns) {
    for (const match of text.matchAll(pattern)) {
      add("person", match[1], `用户提到这个人：${match[0]}`, 0.74);
    }
  }

  const interestPatterns = [
    /喜欢(?:和[^，。,.!?！？]{1,8})?一起?([^，。,.!?！？]{2,10})/g,
    /爱(?:听|看|做|吃)([^，。,.!?！？]{2,10})/g,
    /想(?:打牌|唱歌|散步|包饺子|听戏|看电视|种花|下棋)/g
  ];
  for (const pattern of interestPatterns) {
    for (const match of text.matchAll(pattern)) {
      add("interest", match[1] || match[0].replace("想", ""), `用户表达了兴趣：${match[0]}`, 0.8);
    }
  }

  if (/早上|晨练|散步|午饭|晚饭|睡前|下午/.test(text)) {
    add("routine", text.match(/早上|晨练|散步|午饭|晚饭|睡前|下午/)?.[0] || "日常作息", `用户提到作息：${text}`, 0.68);
  }
  if (/饺子|粥|面条|米饭|茶|水果|包子/.test(text)) {
    add("food", text.match(/饺子|粥|面条|米饭|茶|水果|包子/)?.[0] || "食物", `用户提到食物：${text}`, 0.72);
  }
  if (/今天|昨天|周末|刚才|上午|下午|晚上/.test(text)) {
    add("recent_event", text.slice(0, 18), `近期事件：${text}`, 0.66);
  }
  return memories;
}
```

Append these exports in the same file:

```js
export function mergeMemories(existing = [], incoming = []) {
  const byKey = new Map();
  for (const item of [...existing, ...incoming]) {
    const key = `${item.type}:${slug(item.label)}`;
    const previous = byKey.get(key);
    byKey.set(key, previous ? {
      ...previous,
      detail: item.detail.length > previous.detail.length ? item.detail : previous.detail,
      confidence: Math.max(previous.confidence, item.confidence),
      updatedAt: item.updatedAt || new Date().toISOString()
    } : item);
  }
  return [...byKey.values()];
}

export function planCheckIn({ now = new Date(), lastMessageAt = null, memories = [] } = {}) {
  const hour = now.getHours();
  const quietHours = lastMessageAt ? (now - new Date(lastMessageAt)) / 36e5 : 999;
  const routine = memories.find((item) => item.type === "routine");
  const interest = memories.find((item) => item.type === "interest");
  if (hour < 11) {
    return { id: `checkin-morning-${now.toISOString()}`, slot: "morning", text: routine ? `早上好。今天要不要照着老习惯，聊聊${routine.label}？` : "早上好。昨晚睡得还好吗？", reason: "morning_rhythm", createdAt: now.toISOString() };
  }
  if (hour < 15) {
    return { id: `checkin-midday-${now.toISOString()}`, slot: "midday", text: "到午饭前后了。今天吃点什么，想和我说说吗？", reason: "midday_meal", createdAt: now.toISOString() };
  }
  if (hour < 20) {
    return { id: `checkin-evening-${now.toISOString()}`, slot: "evening", text: interest ? `傍晚了。要不要聊聊${interest.label}？` : "傍晚了。今天有没有一件还算顺心的小事？", reason: "evening_reflection", createdAt: now.toISOString() };
  }
  if (quietHours >= 6) {
    return { id: `checkin-quiet-${now.toISOString()}`, slot: "quiet", text: "今天安静了挺久。我在这儿，想说两句也行。", reason: "quiet_period", createdAt: now.toISOString() };
  }
  return { id: `checkin-night-${now.toISOString()}`, slot: "evening", text: "晚上好。睡前想不想把今天记住的一件事说给我听？", reason: "night_wind_down", createdAt: now.toISOString() };
}

export function generateCompanionReply({ text, memories = [], now = new Date() } = {}) {
  const safety = classifySafety(text || "");
  if (safety.level === "urgent") {
    return { text: "这听起来可能很紧急。请马上联系身边的人，或拨打当地急救电话，比如 120 或 911。先别一个人硬撑。", safety, memories: extractMemories(text) };
  }
  if (safety.level === "crisis") {
    return { text: "听到你这么难受，我很心疼。请现在就联系一个信得过的人陪你，或拨打当地危机援助/急救电话。你不需要一个人扛着。", safety, memories: extractMemories(text) };
  }
  if (safety.level === "scam") {
    return { text: "这件事先别急着转钱或给验证码。请挂断或停下来，打官方电话确认，也可以先问一个信得过的人。", safety, memories: extractMemories(text) };
  }
  const extracted = extractMemories(text);
  const person = [...extracted, ...memories].find((item) => item.type === "person");
  const interest = [...extracted, ...memories].find((item) => item.type === "interest");
  let reply = "我听见了。";
  if (/闷|孤独|寂寞|想|难过/.test(text)) {
    reply = person ? `这种想念会让人心里空一块。你刚提到${person.label}，要不要和我说说你们以前最常聊什么？` : "这种闷闷的感觉不好受。我在这儿陪你。你最想和谁说说话？";
  } else if (interest) {
    reply = `你说到${interest.label}，我记下了。听起来这是能让日子热乎一点的事。你什么时候最喜欢做这个？`;
  } else if (person) {
    reply = `我记得你提到${person.label}。有人惦记着，日子会亮一点。你们最近一次见面聊了什么？`;
  } else {
    reply = "这件事我陪你慢慢说。今天最想先说哪一小段？";
  }
  return { text: reply, safety, memories: extracted, checkIn: planCheckIn({ now, memories }) };
}

function cryptoSafeId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slug(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
}
```

- [ ] **Step 4: Run tests to verify pass**

Run:

```bash
npm test
```

Expected: all `companion-core` tests pass.

- [ ] **Step 5: Commit core**

Run:

```bash
git add src/companion-core.js tests/companion-core.test.js
git commit -m "Add elder companion core"
```

Expected: commit succeeds.

## Task 3: Browser UI

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`
- Create: `manifest.webmanifest`

- [ ] **Step 1: Build semantic app shell**

Create `index.html` with:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>See - 陪你聊聊</title>
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main class="app-shell">
    <section class="conversation" aria-label="陪伴聊天">
      <header class="conversation__header">
        <div>
          <p class="eyebrow">今日陪伴</p>
          <h1>陪你聊聊</h1>
        </div>
        <button id="resetButton" class="ghost-button" type="button">清空</button>
      </header>
      <div id="messages" class="messages" aria-live="polite"></div>
      <form id="chatForm" class="composer">
        <label class="sr-only" for="messageInput">想说的话</label>
        <textarea id="messageInput" rows="3" placeholder="今天想聊点什么？"></textarea>
        <button type="submit">发送</button>
      </form>
    </section>
    <aside class="companion-panel" aria-label="记忆和问候">
      <section class="panel-section">
        <h2>现在可以说</h2>
        <button id="checkInButton" class="check-in-button" type="button"></button>
      </section>
      <section class="panel-section">
        <h2>我记得</h2>
        <div id="memoryList" class="memory-list"></div>
      </section>
      <section class="panel-section">
        <h2>下次聊</h2>
        <div id="topicList" class="topic-list"></div>
      </section>
    </aside>
  </main>
  <script type="module" src="/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Add elder-friendly styling rules**

Create `styles.css` with these rule groups:

```css
:root { color-scheme: light; --ink:#17201b; --muted:#657068; --paper:#f7f6f1; --panel:#fffdf8; --line:#d8ded3; --accent:#286f63; --accent-2:#b44630; --focus:#1b6fd6; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--paper); color: var(--ink); font-size: 20px; line-height: 1.55; }
button, textarea { font: inherit; }
button { min-height: 48px; border: 0; border-radius: 8px; cursor: pointer; }
button:focus-visible, textarea:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.app-shell { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 20px; width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 20px 0; }
.conversation, .panel-section { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }
.conversation { min-height: calc(100vh - 40px); display: grid; grid-template-rows: auto 1fr auto; }
.conversation__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px; border-bottom: 1px solid var(--line); }
.eyebrow { margin: 0 0 4px; color: var(--accent); font-size: 15px; font-weight: 800; letter-spacing: 0; }
h1, h2 { margin: 0; letter-spacing: 0; }
h1 { font-size: 34px; }
h2 { font-size: 22px; }
.messages { padding: 22px; overflow: auto; display: flex; flex-direction: column; gap: 14px; }
.message { max-width: 78%; padding: 14px 16px; border-radius: 8px; background: #eef3ef; }
.message--user { align-self: flex-end; background: #e8f0ff; }
.message--assistant { align-self: flex-start; }
.message__meta { display: block; margin-bottom: 4px; color: var(--muted); font-size: 14px; font-weight: 700; }
.composer { display: grid; grid-template-columns: 1fr 120px; gap: 12px; padding: 18px; border-top: 1px solid var(--line); }
.composer textarea { width: 100%; resize: vertical; border: 1px solid var(--line); border-radius: 8px; padding: 14px; background: white; color: var(--ink); }
.composer button, .check-in-button { background: var(--accent); color: white; font-weight: 800; }
.ghost-button { background: transparent; color: var(--muted); border: 1px solid var(--line); padding: 0 14px; }
.companion-panel { display: flex; flex-direction: column; gap: 16px; }
.panel-section { padding: 18px; }
.check-in-button { width: 100%; text-align: left; padding: 14px; margin-top: 12px; }
.memory-list, .topic-list { display: grid; gap: 10px; margin-top: 12px; }
.memory-item, .topic-chip { border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; background: white; }
.memory-item strong { display: block; font-size: 18px; }
.memory-item span { color: var(--muted); font-size: 15px; }
.empty { color: var(--muted); }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
@media (max-width: 860px) { .app-shell { grid-template-columns: 1fr; width: min(100% - 20px, 680px); padding: 10px 0; } .conversation { min-height: 70vh; } .composer { grid-template-columns: 1fr; } .message { max-width: 92%; } h1 { font-size: 30px; } body { font-size: 19px; } }
```

- [ ] **Step 3: Wire browser state and rendering functions**

Create `app.js` importing from `src/companion-core.js`. It must define these functions and event handlers:

- Load and save state from `localStorage`.
- Render messages.
- Render memories grouped by type.
- Render the current check-in.
- Send typed text through `generateCompanionReply`.
- Extract and merge memories.
- Support reset.

Required browser behavior:

- `loadState` returns saved JSON from `localStorage` or a default state with one assistant greeting.
- `saveState` serializes messages, memories, and the latest check-in into `localStorage`.
- `addMessage` appends `{ id, role, text, safetyLevel, createdAt }`.
- `handleUserText` appends the user message, calls `generateCompanionReply`, merges returned memories, appends the assistant message, saves, and renders.
- `renderMessages` writes `.message`, `.message--user`, and `.message--assistant` nodes.
- `renderMemories` shows a friendly empty state or memory items with label and type.
- `renderTopics` derives three chips from memory: one person topic, one interest topic, and one evening reflection topic.
- `renderCheckIn` calls `planCheckIn` with `lastMessageAt` and current memories.
- The submit handler prevents blank sends.
- The check-in button sends its current text as a user message.
- The reset button confirms, clears local state, and restores the default greeting.

- [ ] **Step 4: Create manifest metadata**

Create `manifest.webmanifest`:

```json
{
  "name": "See Elder Companion",
  "short_name": "See",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f7f6f1",
  "theme_color": "#286f63",
  "description": "A private text-first companion for older adults."
}
```

- [ ] **Step 5: Manual browser smoke test**

Run:

```bash
npm start
```

Open `http://localhost:5173`, send `我女儿小玲周末来看我，我喜欢包饺子。`, and confirm:

- Assistant replies.
- Memory panel shows 小玲 and 包饺子.
- Check-in button has a useful prompt.

- [ ] **Step 6: Commit UI**

Run:

```bash
git add index.html styles.css app.js manifest.webmanifest
git commit -m "Build elder companion web app"
```

Expected: commit succeeds.

## Task 4: Local Server And API Boundary

**Files:**
- Create: `server.js`
- Modify: `README.md`

- [ ] **Step 1: Add static server behavior**

Create `server.js` using Node built-ins. It must implement:

- Serve files from the repository root.
- Default `/` to `index.html`.
- Return JSON from `/health`.
- Accept `POST /api/chat` with `{ text, memories }`.
- Return the same shape as `generateCompanionReply`.

Required server behavior:

- Use `http.createServer`.
- Use `readFile` from `node:fs/promises`.
- Resolve paths from `import.meta.url`.
- Protect static file serving from directory traversal by normalizing requested paths and rejecting paths outside the repository root.
- Map content types for `.html`, `.css`, `.js`, `.json`, `.webmanifest`, `.svg`, and default text.
- `sendJson(response, status, payload)` sets `application/json` and serializes payloads.
- `readJson(request)` buffers request chunks, rejects payloads over 1 MB, and parses JSON.
- `serveStatic(request, response)` maps `/` to `index.html`, serves existing files, and returns 404 for missing files.
- `/health` returns `{ "ok": true }`.
- `POST /api/chat` calls `generateCompanionReply({ text, memories })` and returns the result.

- [ ] **Step 2: Update README sections**

Update README so it contains these sections:

- `npm start`.
- `npm test`.
- Local-only memory.
- No continuous microphone in V1.
- Future AI provider can be connected behind `/api/chat`.

- [ ] **Step 3: Verify server**

Run:

```bash
npm start
```

Then in another command:

```bash
curl -sS http://localhost:5173/health
```

Expected:

```json
{"ok":true}
```

- [ ] **Step 4: Commit server**

Run:

```bash
git add server.js README.md
git commit -m "Add local server boundary"
```

Expected: commit succeeds.

## Task 5: Final Verification And Push

**Files:**
- Modify only files needed to fix verification failures.

- [ ] **Step 1: Run automated tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run local app smoke test**

Run:

```bash
npm start
```

Open `http://localhost:5173` and test:

- Normal loneliness message.
- Memory-bearing message.
- Urgent medical message.
- Scam message.

- [ ] **Step 3: Inspect git state**

Run:

```bash
git status --short
```

Expected: clean or only intentional files staged.

- [ ] **Step 4: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds.
