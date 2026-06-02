import {
  generateCompanionReply,
  mergeMemories,
  planCheckIn
} from "./src/companion-core.js";

const STORAGE_KEY = "see.elderCompanion.v1";
const state = loadState();

const messagesEl = document.querySelector("#messages");
const memoryListEl = document.querySelector("#memoryList");
const topicListEl = document.querySelector("#topicList");
const checkInButton = document.querySelector("#checkInButton");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const resetButton = document.querySelector("#resetButton");
const exportButton = document.querySelector("#exportButton");
const trimHistoryButton = document.querySelector("#trimHistoryButton");
const storageWarning = document.querySelector("#storageWarning");
const renderedMessageIds = new Set();
const MAX_RETAINED_MESSAGES = 12;

function defaultState() {
  return {
    messages: [{
      id: createId("assistant"),
      role: "assistant",
      text: "我在这儿。今天想聊家里的事、老朋友，还是就说说此刻的心情？",
      safetyLevel: "normal",
      createdAt: new Date().toISOString()
    }],
    memories: [],
    checkIn: null
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState();
    const parsed = JSON.parse(saved);
    return {
      messages: Array.isArray(parsed.messages) && parsed.messages.length > 0 ? parsed.messages : defaultState().messages,
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
      checkIn: parsed.checkIn || null
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setStorageWarning("");
    return true;
  } catch {
    setStorageWarning("这台设备暂时没有保存新的聊天。你仍可以继续聊，稍后再试。");
    return false;
  }
}

function addMessage(role, text, safetyLevel = "normal") {
  state.messages.push({
    id: createId(role),
    role,
    text,
    safetyLevel,
    createdAt: new Date().toISOString()
  });
}

async function handleUserText(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  addMessage("user", trimmed);
  saveState();
  render();

  const reply = await requestCompanionReply(trimmed);
  state.memories = mergeMemories(state.memories, reply.memories || []);
  addMessage("assistant", reply.text, reply.safety?.level || "normal");
  state.checkIn = reply.checkIn || planCheckIn({ memories: state.memories });
  saveState();
  render();
}

async function requestCompanionReply(text) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, memories: state.memories }),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Companion API returned ${response.status}`);
    }
    return await response.json();
  } catch {
    return localCompanionReply(text);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function localCompanionReply(text) {
  return generateCompanionReply({
    text,
    memories: state.memories,
    now: new Date()
  });
}

function render() {
  if (!state.checkIn) {
    state.checkIn = planCheckIn({ memories: state.memories, lastMessageAt: latestUserMessageAt() });
  }
  renderMessages();
  renderMemories();
  renderTopics();
  renderCheckIn();
}

function renderMessages() {
  const activeMessageIds = new Set(state.messages.map((message) => message.id));
  for (const node of messagesEl.querySelectorAll("[data-message-id]")) {
    const messageId = node.getAttribute("data-message-id");
    if (!activeMessageIds.has(messageId)) {
      renderedMessageIds.delete(messageId);
      node.remove();
    }
  }

  for (const message of state.messages) {
    if (renderedMessageIds.has(message.id)) continue;
    messagesEl.append(createMessageElement(message));
    renderedMessageIds.add(message.id);
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function createMessageElement(message) {
  const article = document.createElement("article");
  article.className = [
    "message",
    `message--${message.role}`,
    message.safetyLevel ? `message--${message.safetyLevel}` : ""
  ].filter(Boolean).join(" ");
  article.setAttribute("data-message-id", message.id);

  const meta = document.createElement("span");
  meta.className = "message__meta";
  meta.textContent = message.role === "user" ? "你" : "See";

  const body = document.createElement("p");
  body.textContent = message.text;

  article.append(meta, body);
  return article;
}

function renderMemories() {
  memoryListEl.innerHTML = "";
  if (state.memories.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "聊几句后，我会把重要的人和事记在这里。";
    memoryListEl.append(empty);
    return;
  }

  for (const item of state.memories.slice(0, 8)) {
    const row = document.createElement("div");
    row.className = "memory-item";

    const label = document.createElement("strong");
    label.textContent = item.label;

    const type = document.createElement("span");
    type.textContent = memoryTypeLabel(item.type);

    const removeButton = document.createElement("button");
    removeButton.className = "memory-remove";
    removeButton.type = "button";
    removeButton.setAttribute("data-memory-id", item.id);
    removeButton.textContent = "删除";
    removeButton.setAttribute("aria-label", `删除记忆：${item.label}`);
    removeButton.addEventListener("click", () => removeMemory(item.id));

    row.append(label, type, removeButton);
    memoryListEl.append(row);
  }
}

function removeMemory(memoryId) {
  state.memories = state.memories.filter((item) => item.id !== memoryId);
  state.checkIn = planCheckIn({ memories: state.memories, lastMessageAt: latestUserMessageAt() });
  saveState();
  render();
}

function exportState() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    messages: state.messages,
    memories: state.memories,
    checkIn: state.checkIn
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `see-companion-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function trimHistory() {
  if (state.messages.length <= MAX_RETAINED_MESSAGES) return;
  const confirmed = window.confirm("只保留最近 12 条聊天吗？长期记忆会继续保留。");
  if (!confirmed) return;
  state.messages = state.messages.slice(-MAX_RETAINED_MESSAGES);
  state.checkIn = planCheckIn({ memories: state.memories, lastMessageAt: latestUserMessageAt() });
  saveState();
  render();
}

function setStorageWarning(message) {
  storageWarning.textContent = message;
  storageWarning.hidden = !message;
}

function renderTopics() {
  topicListEl.innerHTML = "";
  const topics = buildTopics();
  for (const topic of topics) {
    const chip = document.createElement("button");
    chip.className = "topic-chip";
    chip.type = "button";
    chip.textContent = topic;
    chip.addEventListener("click", () => {
      input.value = topic;
      input.focus();
    });
    topicListEl.append(chip);
  }
}

function renderCheckIn() {
  state.checkIn = planCheckIn({
    memories: state.memories,
    lastMessageAt: latestUserMessageAt(),
    now: new Date()
  });
  checkInButton.textContent = state.checkIn.text;
}

function buildTopics() {
  const person = state.memories.find((item) => item.type === "person");
  const interest = state.memories.find((item) => item.type === "interest");
  const recent = state.memories.find((item) => item.type === "recent_event");
  return [
    person ? `想听你说说${person.label}` : "说说今天见到的人",
    interest ? `继续聊聊${interest.label}` : "聊一件年轻时喜欢的事",
    recent ? "把今天的小事慢慢说完" : "晚上想记住什么"
  ];
}

function latestUserMessageAt() {
  const latest = [...state.messages].reverse().find((message) => message.role === "user");
  return latest?.createdAt || null;
}

function memoryTypeLabel(type) {
  return {
    person: "人和关系",
    interest: "喜欢的事",
    routine: "生活节奏",
    food: "吃喝口味",
    place: "熟悉地方",
    story: "往事",
    recent_event: "最近发生",
    preference: "偏好",
    concern: "牵挂"
  }[type] || "记忆";
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value;
  input.value = "";
  void handleUserText(text);
});

checkInButton.addEventListener("click", () => {
  void handleUserText(checkInButton.textContent);
});

exportButton.addEventListener("click", exportState);
trimHistoryButton.addEventListener("click", trimHistory);

resetButton.addEventListener("click", () => {
  const confirmed = window.confirm("要清空这次体验里的聊天和记忆吗？");
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  const fresh = defaultState();
  state.messages = fresh.messages;
  state.memories = fresh.memories;
  state.checkIn = fresh.checkIn;
  saveState();
  render();
});

render();
