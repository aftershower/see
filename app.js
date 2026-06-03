import {
  createShareableUpdate,
  generateCompanionReply,
  mergeMemories,
  planCheckIn
} from "./src/companion-core.js";
import {
  mergeLocalDataStates,
  needsImportConflictConfirmation,
  normalizeImportedState
} from "./src/local-data.js";

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
const importButton = document.querySelector("#importButton");
const importInput = document.querySelector("#importInput");
const trimHistoryButton = document.querySelector("#trimHistoryButton");
const shareUpdateButton = document.querySelector("#shareUpdateButton");
const copyUpdateButton = document.querySelector("#copyUpdateButton");
const shareUpdateText = document.querySelector("#shareUpdateText");
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
    deletedMemoryKeys: [],
    checkIn: null
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState();
    const parsed = JSON.parse(saved);
    const messages = Array.isArray(parsed.messages) && parsed.messages.length > 0 ? parsed.messages : defaultState().messages;
    return {
      messages: retainedMessages(messages),
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
      deletedMemoryKeys: normalizeDeletedMemoryKeys(parsed.deletedMemoryKeys),
      checkIn: parsed.checkIn || null
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  pruneRetainedMessages();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setStorageStatus("");
    return true;
  } catch {
    setStorageStatus("这台设备暂时没有保存新的聊天。你仍可以继续聊，稍后再试。", "error");
    return false;
  }
}

function pruneRetainedMessages() {
  state.messages = retainedMessages(state.messages);
}

function retainedMessages(messages = []) {
  return messages.length > MAX_RETAINED_MESSAGES ? messages.slice(-MAX_RETAINED_MESSAGES) : messages;
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
  forgetTombstonesForActiveMemories();
  clearShareDraft();
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
      body: JSON.stringify({ text, memories: companionMemoryContext(), locale: currentLocale() }),
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
    memories: companionMemoryContext(),
    now: new Date(),
    locale: currentLocale()
  });
}

function companionMemoryContext() {
  return state.memories
    .filter((item) => item.sensitivity !== "sensitive" && !item.doNotMention)
    .slice(0, 8)
    .map(({ type, label }) => ({ type, label }));
}

function currentLocale() {
  return navigator.language || "zh-CN";
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
  const removed = state.memories.find((item) => item.id === memoryId);
  rememberDeletedMemory(removed);
  state.memories = state.memories.filter((item) => item.id !== memoryId);
  state.checkIn = planCheckIn({ memories: state.memories, lastMessageAt: latestUserMessageAt() });
  const saved = saveState();
  render();
  clearShareDraft(saved);
}

function exportState() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    messages: state.messages,
    memories: state.memories,
    deletedMemoryKeys: state.deletedMemoryKeys,
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
  setStorageStatus("记录已导出。请在下载文件里查看。");
}

function importState(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = JSON.parse(String(reader.result || "{}"));
      let mergeWithCurrent = false;
      if (needsImportConflictConfirmation(state, imported)) {
        const confirmed = window.confirm("导入的记录比当前聊天旧。继续导入会合并旧记录，不会删除现在的聊天和记忆，要继续吗？");
        if (!confirmed) return;
        mergeWithCurrent = true;
      }
      if (applyImportedState(imported, { mergeWithCurrent })) {
        setStorageStatus("导入完成。聊天和记忆已经更新。");
      }
    } catch {
      setStorageStatus("导入失败。请确认这是之前导出的 See JSON 文件。", "error");
    } finally {
      importInput.value = "";
    }
  });
  reader.addEventListener("error", () => {
    setStorageStatus("导入失败。请稍后再试。", "error");
    importInput.value = "";
  });
  reader.readAsText(file);
}

function applyImportedState(imported, options = {}) {
  const importedState = normalizeImportedState(imported, { createId });
  const nextState = options.mergeWithCurrent ? mergeLocalDataStates(state, importedState) : importedState;

  state.messages = nextState.messages;
  state.memories = nextState.memories;
  state.deletedMemoryKeys = nextState.deletedMemoryKeys || [];
  state.checkIn = nextState.checkIn;
  renderedMessageIds.clear();
  for (const node of messagesEl.querySelectorAll("[data-message-id]")) {
    node.remove();
  }
  const saved = saveState();
  render();
  clearShareDraft();
  return saved;
}

function trimHistory() {
  if (state.messages.length <= MAX_RETAINED_MESSAGES) {
    setStorageStatus("现在聊天不多，不需要清理。");
    return;
  }
  const confirmed = window.confirm("只保留最近 12 条聊天吗？长期记忆会继续保留。");
  if (!confirmed) return;
  state.messages = state.messages.slice(-MAX_RETAINED_MESSAGES);
  state.checkIn = planCheckIn({ memories: state.memories, lastMessageAt: latestUserMessageAt() });
  if (saveState()) {
    render();
    setStorageStatus("已保留最近 12 条聊天，长期记忆还在。");
    return;
  }
  render();
}

function rememberDeletedMemory(memory) {
  const key = memoryTombstoneKey(memory);
  if (key && !state.deletedMemoryKeys.includes(key)) {
    state.deletedMemoryKeys.push(key);
  }
}

function forgetTombstonesForActiveMemories() {
  const activeKeys = new Set(state.memories.map(memoryTombstoneKey).filter(Boolean));
  state.deletedMemoryKeys = state.deletedMemoryKeys.filter((key) => !activeKeys.has(key));
}

function memoryTombstoneKey(memory = {}) {
  if (!memory.type || !memory.label) return "";
  return `${memory.type}:${String(memory.label).trim().toLowerCase()}`;
}

function normalizeDeletedMemoryKeys(keys = []) {
  if (!Array.isArray(keys)) return [];
  return [...new Set(keys.filter((key) => typeof key === "string" && key.trim()).map((key) => key.trim().toLowerCase()))];
}

function generateShareableUpdate() {
  shareUpdateText.value = createShareableUpdate({
    memories: state.memories,
    now: new Date()
  });
  shareUpdateText.hidden = false;
  copyUpdateButton.hidden = false;
  setStorageStatus("已生成近况。请先看一遍，再决定要不要发给家人。");
}

function clearShareDraft(announce = false) {
  shareUpdateText.value = "";
  shareUpdateText.hidden = true;
  copyUpdateButton.hidden = true;
  if (announce) {
    setStorageStatus("报平安草稿已清空。请重新生成近况。");
  }
}

async function copyShareableUpdate() {
  const text = shareUpdateText.value.trim();
  if (!text) {
    generateShareableUpdate();
  }
  try {
    await navigator.clipboard.writeText(shareUpdateText.value);
    setStorageStatus("已复制近况。");
  } catch {
    shareUpdateText.focus();
    shareUpdateText.select();
    setStorageStatus("复制失败。你可以手动选中文字再复制。", "error");
  }
}

function setStorageStatus(message, tone = "info") {
  storageWarning.textContent = message;
  storageWarning.hidden = !message;
  storageWarning.classList.toggle("storage-warning--info", Boolean(message) && tone === "info");
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
importButton.addEventListener("click", () => importInput.click());
importInput.addEventListener("change", importState);
trimHistoryButton.addEventListener("click", trimHistory);
shareUpdateButton.addEventListener("click", generateShareableUpdate);
copyUpdateButton.addEventListener("click", copyShareableUpdate);

resetButton.addEventListener("click", () => {
  const confirmed = window.confirm("要清空这次体验里的聊天和记忆吗？");
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  const fresh = defaultState();
  state.messages = fresh.messages;
  state.memories = fresh.memories;
  state.deletedMemoryKeys = fresh.deletedMemoryKeys;
  state.checkIn = fresh.checkIn;
  const saved = saveState();
  render();
  clearShareDraft(saved);
});

render();
