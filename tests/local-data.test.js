import test from "node:test";
import assert from "node:assert/strict";
import {
  mergeLocalDataStates,
  needsImportConflictConfirmation,
  normalizeMessageItems,
  normalizeMemoryItems,
  normalizeImportedState
} from "../src/local-data.js";

test("normalizes imported local data while rejecting invalid exports", () => {
  const normalized = normalizeImportedState({
    messages: [
      { id: "m1", role: "assistant", text: "你好", createdAt: "2026-06-02T10:00:00.000Z" },
      { id: "bad", role: "system", text: "ignore me" }
    ],
    memories: [
      { id: "person-xiaoling", type: "person", label: "小玲", detail: "女儿" },
      { type: "broken", detail: "missing label" }
    ],
    checkIn: { text: "晚上好", slot: "evening" },
    deletedMemoryKeys: ["person:小玲", 123, ""]
  }, { createId: (prefix) => `${prefix}-fallback`, now: () => "2026-06-02T12:00:00.000Z" });

  assert.equal(normalized.messages.length, 1);
  assert.equal(normalized.messages[0].role, "assistant");
  assert.equal(normalized.memories.length, 1);
  assert.equal(normalized.memories[0].label, "小玲");
  assert.equal(normalized.checkIn.text, "晚上好");
  assert.deepEqual(normalized.deletedMemoryKeys, ["person:小玲"]);

  assert.throws(() => normalizeImportedState({ messages: [], memories: [] }), /no messages/i);
  assert.throws(() => normalizeImportedState({ messages: [{ role: "assistant", text: "hi" }] }), /invalid/i);
});

test("normalizes imported memories by trimming labels and dropping blank records", () => {
  const normalized = normalizeImportedState({
    messages: [
      { id: "m1", role: "assistant", text: "你好", createdAt: "2026-06-02T10:00:00.000Z" }
    ],
    memories: [
      { id: "blank-label", type: "person", label: "   ", detail: "ignore" },
      { id: "blank-type", type: "   ", label: "小玲", detail: "ignore" },
      { id: "trimmed", type: " person ", label: " 小玲 ", detail: "女儿" }
    ]
  }, { createId: (prefix) => `${prefix}-fallback` });

  assert.equal(normalized.memories.length, 1);
  assert.equal(normalized.memories[0].type, "person");
  assert.equal(normalized.memories[0].label, "小玲");
});

test("normalizes stored memory items for saved local records", () => {
  const memories = normalizeMemoryItems([
    { id: "blank-label", type: "person", label: "   ", detail: "ignore" },
    { id: "blank-type", type: "   ", label: "小玲", detail: "ignore" },
    { id: "trimmed", type: " person ", label: " 小玲 ", detail: "女儿" },
    { id: "bad", type: "person", detail: "missing label" }
  ], { createId: (prefix) => `${prefix}-fallback` });

  assert.deepEqual(memories, [
    { id: "trimmed", type: "person", label: "小玲", detail: "女儿" }
  ]);
});

test("normalizes stored message items for saved local records", () => {
  const messages = normalizeMessageItems([
    { id: "m1", role: "assistant", text: " 你好 ", createdAt: "2026-06-02T10:00:00.000Z" },
    { id: "bad-role", role: "system", text: "ignore" },
    { id: "bad-text", role: "user", text: 123 },
    { id: "blank-text", role: "user", text: "   " },
    { role: "user", text: "今天想聊天" }
  ], { createId: (prefix) => `${prefix}-fallback`, now: () => "2026-06-02T12:00:00.000Z" });

  assert.deepEqual(messages, [
    { id: "m1", role: "assistant", text: "你好", safetyLevel: "normal", createdAt: "2026-06-02T10:00:00.000Z" },
    { id: "user-fallback", role: "user", text: "今天想聊天", safetyLevel: "normal", createdAt: "2026-06-02T12:00:00.000Z" }
  ]);
});

test("detects when an imported export is older than current local messages", () => {
  const currentState = {
    messages: [
      { role: "assistant", text: "old", createdAt: "2026-06-02T09:00:00.000Z" },
      { role: "user", text: "new", createdAt: "2026-06-02T12:00:00.000Z" }
    ]
  };
  const olderExport = {
    exportedAt: "2026-06-02T10:00:00.000Z",
    messages: [{ role: "assistant", text: "backup", createdAt: "2026-06-02T08:00:00.000Z" }],
    memories: []
  };
  const newerExport = {
    exportedAt: "2026-06-02T13:00:00.000Z",
    messages: [{ role: "assistant", text: "backup", createdAt: "2026-06-02T13:00:00.000Z" }],
    memories: []
  };

  assert.equal(needsImportConflictConfirmation(currentState, olderExport), true);
  assert.equal(needsImportConflictConfirmation(currentState, newerExport), false);
});

test("merges imported local data without replacing newer local messages", () => {
  const currentState = {
    messages: [
      { id: "m-current", role: "user", text: "今天女儿来了", createdAt: "2026-06-02T12:00:00.000Z" }
    ],
    memories: [
      { id: "person-xiaoling-current", type: "person", label: "小玲", detail: "女儿今天来过", confidence: 0.9, updatedAt: "2026-06-02T12:00:00.000Z" }
    ],
    checkIn: { text: "现在的问候", slot: "evening" }
  };
  const importedState = {
    messages: [
      { id: "m-old", role: "assistant", text: "早上好", createdAt: "2026-06-01T08:00:00.000Z" },
      { id: "m-current", role: "user", text: "今天女儿来了", createdAt: "2026-06-02T12:00:00.000Z" }
    ],
    memories: [
      { id: "person-xiaoling-old", type: "person", label: "小玲", detail: "女儿", confidence: 0.7, updatedAt: "2026-06-01T08:00:00.000Z" },
      { id: "interest-opera", type: "interest", label: "听戏", detail: "喜欢听戏", confidence: 0.8 }
    ],
    checkIn: { text: "旧问候", slot: "morning" }
  };

  const merged = mergeLocalDataStates(currentState, importedState);

  assert.deepEqual(merged.messages.map((message) => message.id), ["m-old", "m-current"]);
  assert.equal(merged.memories.length, 2);
  assert.equal(merged.memories.find((item) => item.type === "person").detail, "女儿今天来过");
  assert.equal(merged.checkIn.text, "现在的问候");
});

test("preserves conservative privacy flags when imported memories merge", () => {
  const currentState = {
    messages: [
      { id: "m-current", role: "user", text: "今天女儿来了", createdAt: "2026-06-02T12:00:00.000Z" }
    ],
    memories: [
      { id: "person-xiaoling-current", type: "person", label: "小玲", detail: "女儿今天来过", sensitivity: "normal", doNotMention: false, confidence: 0.9, updatedAt: "2026-06-02T12:00:00.000Z" }
    ]
  };
  const importedState = {
    messages: [
      { id: "m-old", role: "user", text: "别再提小玲", createdAt: "2026-06-01T12:00:00.000Z" }
    ],
    memories: [
      { id: "person-xiaoling-sensitive", type: "person", label: "小玲", detail: "不要再提小玲", sensitivity: "sensitive", doNotMention: true, confidence: 0.7, updatedAt: "2026-06-01T12:00:00.000Z" }
    ]
  };

  const merged = mergeLocalDataStates(currentState, importedState);
  const xiaoling = merged.memories.find((item) => item.type === "person" && item.label === "小玲");

  assert.equal(xiaoling.sensitivity, "sensitive");
  assert.equal(xiaoling.doNotMention, true);
  assert.equal(xiaoling.detail, "女儿今天来过");
});

test("does not resurrect locally deleted memories from older imports", () => {
  const currentState = {
    messages: [
      { id: "m-current", role: "user", text: "我删掉了小玲", createdAt: "2026-06-02T12:00:00.000Z" }
    ],
    memories: [],
    deletedMemoryKeys: ["person:小玲"]
  };
  const importedState = {
    messages: [
      { id: "m-old", role: "user", text: "小玲来看我", createdAt: "2026-06-01T12:00:00.000Z" }
    ],
    memories: [
      { id: "person-xiaoling-old", type: "person", label: "小玲", detail: "旧导出里的女儿", confidence: 0.7, updatedAt: "2026-06-01T12:00:00.000Z" }
    ],
    deletedMemoryKeys: []
  };

  const merged = mergeLocalDataStates(currentState, importedState);

  assert.equal(merged.memories.some((item) => item.type === "person" && item.label === "小玲"), false);
  assert.deepEqual(merged.deletedMemoryKeys, ["person:小玲"]);
});
