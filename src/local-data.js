export function normalizeImportedState(imported, options = {}) {
  const createId = options.createId || ((prefix) => `${prefix}-${Date.now()}`);
  const now = options.now || (() => new Date().toISOString());

  if (!imported || !Array.isArray(imported.messages) || !Array.isArray(imported.memories)) {
    throw new Error("Invalid See export");
  }

  const messages = normalizeMessageItems(imported.messages, { createId, now });

  if (messages.length === 0) {
    throw new Error("Imported export has no messages");
  }

  return {
    messages,
    memories: normalizeMemoryItems(imported.memories, { createId }),
    checkIn: normalizeCheckIn(imported.checkIn),
    deletedMemoryKeys: normalizeDeletedMemoryKeys(imported.deletedMemoryKeys)
  };
}

export function normalizeMessageItems(messages = [], options = {}) {
  const createId = options.createId || ((prefix) => `${prefix}-${Date.now()}`);
  const now = options.now || (() => new Date().toISOString());
  if (!Array.isArray(messages)) return [];
  return messages.reduce((items, item) => {
    if (!item || typeof item.text !== "string" || !["assistant", "user"].includes(item.role)) {
      return items;
    }
    const text = item.text.trim();
    if (!text) return items;
    items.push({
      id: typeof item.id === "string" ? item.id : createId(item.role),
      role: item.role,
      text,
      safetyLevel: item.safetyLevel || "normal",
      createdAt: item.createdAt || now()
    });
    return items;
  }, []);
}

export function normalizeMemoryItems(memories = [], options = {}) {
  const createId = options.createId || ((prefix) => `${prefix}-${Date.now()}`);
  if (!Array.isArray(memories)) return [];
  return memories
    .filter((item) => item && typeof item.label === "string" && typeof item.type === "string")
    .map((item) => ({
      ...item,
      type: item.type.trim(),
      label: item.label.trim(),
      id: typeof item.id === "string" ? item.id : createId("memory")
    }))
    .filter((item) => item.type && item.label);
}

export function normalizeCheckIn(checkIn) {
  if (!checkIn || typeof checkIn.text !== "string") return null;
  const text = checkIn.text.trim();
  if (!text) return null;
  const normalized = { text };
  for (const field of ["id", "slot", "reason", "createdAt"]) {
    if (typeof checkIn[field] !== "string") continue;
    const value = checkIn[field].trim();
    if (value) normalized[field] = value;
  }
  return normalized;
}

export function needsImportConflictConfirmation(currentState, imported) {
  const currentLatest = latestTimestamp(currentState?.messages || []);
  const importedLatest = timestamp(imported?.exportedAt) || latestTimestamp(imported?.messages || []);
  return currentLatest > 0 && importedLatest > 0 && importedLatest < currentLatest;
}

export function mergeLocalDataStates(currentState = {}, importedState = {}) {
  const deletedMemoryKeys = normalizeDeletedMemoryKeys([
    ...(currentState.deletedMemoryKeys || []),
    ...(importedState.deletedMemoryKeys || [])
  ]);
  const deletedMemoryKeySet = new Set(deletedMemoryKeys);
  const currentMemories = (currentState.memories || []).filter((item) => !deletedMemoryKeySet.has(memoryKey(item)));
  const importedMemories = (importedState.memories || []).filter((item) => !deletedMemoryKeySet.has(memoryKey(item)));

  return {
    messages: mergeMessages(currentState.messages || [], importedState.messages || []),
    memories: mergeMemoryItems(currentMemories, importedMemories),
    checkIn: normalizeCheckIn(currentState.checkIn) || normalizeCheckIn(importedState.checkIn),
    deletedMemoryKeys
  };
}

function mergeMessages(currentMessages, importedMessages) {
  const byKey = new Map();
  for (const message of [...importedMessages, ...currentMessages]) {
    if (!message || typeof message.text !== "string") continue;
    byKey.set(messageKey(message), message);
  }
  return [...byKey.values()].sort((a, b) => timestamp(a.createdAt) - timestamp(b.createdAt));
}

function mergeMemoryItems(currentMemories, importedMemories) {
  const byKey = new Map();
  for (const item of [...importedMemories, ...currentMemories]) {
    if (!item || typeof item.label !== "string" || typeof item.type !== "string") continue;
    const key = memoryKey(item);
    const previous = byKey.get(key);
    byKey.set(key, previous ? mergeMemoryItem(previous, item) : item);
  }
  return [...byKey.values()].sort((a, b) => String(a.type).localeCompare(String(b.type)));
}

function normalizeDeletedMemoryKeys(keys = []) {
  if (!Array.isArray(keys)) return [];
  return [...new Set(keys.filter((key) => typeof key === "string" && key.trim()).map((key) => key.trim().toLowerCase()))];
}

function memoryKey(item = {}) {
  return `${item.type}:${String(item.label || "").trim().toLowerCase()}`;
}

function mergeMemoryItem(previous, next) {
  const chosen = chooseNewerOrRicher(previous, next);
  return {
    ...chosen,
    confidence: Math.max(previous.confidence || 0, next.confidence || 0),
    sensitivity: previous.sensitivity === "sensitive" || next.sensitivity === "sensitive" ? "sensitive" : chosen.sensitivity || "normal",
    doNotMention: Boolean(previous.doNotMention || next.doNotMention),
    polarity: previous.polarity === "negative" || next.polarity === "negative" ? "negative" : chosen.polarity || "neutral",
    updatedAt: latestDate(previous.updatedAt, next.updatedAt) || chosen.updatedAt
  };
}

function chooseNewerOrRicher(previous, next) {
  const previousUpdated = timestamp(previous.updatedAt);
  const nextUpdated = timestamp(next.updatedAt);
  if (nextUpdated > previousUpdated) return next;
  if (previousUpdated > nextUpdated) return previous;
  return String(next.detail || "").length > String(previous.detail || "").length ? next : previous;
}

function messageKey(message) {
  return typeof message.id === "string" && message.id
    ? message.id
    : `${message.role}:${message.createdAt || ""}:${message.text}`;
}

function latestDate(a, b) {
  const latest = Math.max(timestamp(a), timestamp(b));
  return latest > 0 ? new Date(latest).toISOString() : null;
}

function latestTimestamp(messages) {
  return Math.max(0, ...messages.map((message) => timestamp(message?.createdAt)));
}

function timestamp(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? time : 0;
}
