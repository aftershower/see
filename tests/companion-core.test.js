import test from "node:test";
import assert from "node:assert/strict";
import {
  classifySafety,
  extractMemories,
  generateCompanionReply,
  mergeMemories,
  planCheckIn
} from "../src/companion-core.js";

test("extracts people, interests, food, routines, and recent events from elder-life messages", () => {
  const memories = extractMemories("我女儿小玲周末来看我，我喜欢和她一起包饺子，早上还想去散步。", "m1");

  assert.ok(memories.some((item) => item.type === "person" && item.label.includes("小玲")));
  assert.ok(memories.some((item) => item.type === "interest" && item.label.includes("包饺子")));
  assert.ok(memories.some((item) => item.type === "food" && item.label.includes("饺子")));
  assert.ok(memories.some((item) => item.type === "routine" && item.label.includes("早上")));
  assert.ok(memories.some((item) => item.type === "recent_event"));
});

test("merges memories by stable type and label while preserving stronger detail", () => {
  const first = extractMemories("我女儿小玲今天来看我。", "m1");
  const second = extractMemories("小玲说明天还来，还要陪我吃午饭。", "m2");
  const merged = mergeMemories(first, second);
  const xiaoling = merged.filter((item) => item.type === "person" && item.label.includes("小玲"));

  assert.equal(xiaoling.length, 1);
  assert.match(xiaoling[0].detail, /小玲/);
});

test("classifies urgent medical, crisis, scam, support, and normal messages", () => {
  assert.deepEqual(classifySafety("我胸口很痛，喘不上气").level, "urgent");
  assert.deepEqual(classifySafety("我不想活了，觉得没人需要我").level, "crisis");
  assert.deepEqual(classifySafety("陌生人让我买礼品卡，还要银行卡验证码").level, "scam");
  assert.deepEqual(classifySafety("有人说自己是社保局，让我买 Apple 礼品卡，把 PIN 发过去").level, "scam");
  assert.deepEqual(classifySafety("今天有点孤独，没人说话").level, "support");
  assert.deepEqual(classifySafety("今天吃了面条").level, "normal");
});

test("plans check-ins using day rhythm and memories", () => {
  const morning = planCheckIn({
    now: new Date("2026-06-02T08:00:00"),
    lastMessageAt: null,
    memories: [{ type: "routine", label: "晨练", detail: "喜欢早上散步" }]
  });
  const evening = planCheckIn({
    now: new Date("2026-06-02T18:30:00"),
    lastMessageAt: "2026-06-02T07:00:00",
    memories: [{ type: "interest", label: "听越剧", detail: "喜欢听越剧" }]
  });

  assert.equal(morning.slot, "morning");
  assert.match(morning.text, /早|晨|散步/);
  assert.equal(evening.slot, "evening");
  assert.match(evening.text, /越剧|今天/);
});

test("plans connection nudges that encourage real-world contact and activities", () => {
  const quiet = planCheckIn({
    now: new Date("2026-06-02T21:00:00"),
    lastMessageAt: "2026-06-02T08:00:00",
    memories: [
      { type: "person", label: "小玲", detail: "女儿" },
      { type: "interest", label: "包饺子", detail: "喜欢包饺子" }
    ]
  });

  assert.equal(quiet.slot, "quiet");
  assert.match(quiet.text, /小玲/);
  assert.match(quiet.text, /电话|发个消息|明天/);
});

test("generates short elder-first replies with extracted memories", () => {
  const reply = generateCompanionReply({
    text: "今天有点闷，想老朋友了。",
    memories: [],
    now: new Date("2026-06-02T20:00:00")
  });

  assert.equal(reply.safety.level, "support");
  assert.ok(reply.text.length < 180);
  assert.match(reply.text, /朋友|想念|陪|说/);
});

test("routes urgent, crisis, and scam messages away from casual companionship", () => {
  const urgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [] });
  const crisis = generateCompanionReply({ text: "我不想活了。", memories: [] });
  const scam = generateCompanionReply({ text: "陌生人让我马上转账买礼品卡。", memories: [] });

  assert.equal(urgent.safety.level, "urgent");
  assert.match(urgent.text, /急救|120|911|身边的人/);
  assert.equal(crisis.safety.level, "crisis");
  assert.match(crisis.text, /信得过的人|急救|危机/);
  assert.equal(scam.safety.level, "scam");
  assert.match(scam.text, /别急|慢下来/);
  assert.match(scam.text, /礼品卡|验证码/);
  assert.match(scam.text, /PIN|收据|ReportFraud/);
});

test("does not persist memories from urgent, crisis, or scam disclosures", () => {
  const urgent = generateCompanionReply({ text: "我胸口很痛，女儿小玲不在家。", memories: [] });
  const crisis = generateCompanionReply({ text: "我不想活了，我朋友老张也走了。", memories: [] });
  const scam = generateCompanionReply({ text: "社保局让我把 Apple 礼品卡 PIN 发过去。", memories: [] });

  assert.deepEqual(urgent.memories, []);
  assert.deepEqual(crisis.memories, []);
  assert.deepEqual(scam.memories, []);
});
