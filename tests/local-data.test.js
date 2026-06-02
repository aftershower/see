import test from "node:test";
import assert from "node:assert/strict";
import {
  needsImportConflictConfirmation,
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
    checkIn: { text: "晚上好", slot: "evening" }
  }, { createId: (prefix) => `${prefix}-fallback`, now: () => "2026-06-02T12:00:00.000Z" });

  assert.equal(normalized.messages.length, 1);
  assert.equal(normalized.messages[0].role, "assistant");
  assert.equal(normalized.memories.length, 1);
  assert.equal(normalized.memories[0].label, "小玲");
  assert.equal(normalized.checkIn.text, "晚上好");

  assert.throws(() => normalizeImportedState({ messages: [], memories: [] }), /no messages/i);
  assert.throws(() => normalizeImportedState({ messages: [{ role: "assistant", text: "hi" }] }), /invalid/i);
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
