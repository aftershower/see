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
  assert.deepEqual(classifySafety("电脑客服让我开远程控制，还说派快递来取现金，别告诉家人").level, "scam");
  assert.deepEqual(classifySafety("有人自称警察，让我下载安全 app 开屏幕共享，还说不要告诉任何人").level, "scam");
  assert.deepEqual(classifySafety("我不确定这个链接是不是骗子发来的").level, "scam");
  assert.deepEqual(classifySafety("陌生人让我把身份证照片发给他").level, "scam");
  assert.deepEqual(classifySafety("我好像吃错药了，头晕得厉害").level, "urgent");
  assert.deepEqual(classifySafety("护工打我，还不让我告诉女儿").level, "urgent");
  assert.deepEqual(classifySafety("儿子拿走我的身份证，不让我出门").level, "urgent");
  assert.deepEqual(classifySafety("我迷路了，不知道家在哪").level, "urgent");
  assert.deepEqual(classifySafety("今天有点孤独，没人说话").level, "support");
  assert.deepEqual(classifySafety("今天吃了面条").level, "normal");
  assert.deepEqual(classifySafety("女儿发来相册链接，我点开看照片").level, "normal");
  assert.deepEqual(classifySafety("我今天去派出所办身份证").level, "normal");
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
  const fakeAgency = generateCompanionReply({ text: "有人自称警察，让我下载安全 app 开屏幕共享，还说不要告诉任何人。", memories: [] });
  const medication = generateCompanionReply({ text: "我好像吃错药了，头很晕。", memories: [] });

  assert.equal(urgent.safety.level, "urgent");
  assert.match(urgent.text, /急救|120|911|身边的人/);
  assert.equal(medication.safety.level, "urgent");
  assert.match(medication.text, /急救|120|911|医生|身边的人/);
  assert.equal(crisis.safety.level, "crisis");
  assert.match(crisis.text, /信得过的人|急救|危机/);
  assert.equal(scam.safety.level, "scam");
  assert.match(scam.text, /别急|慢下来/);
  assert.match(scam.text, /礼品卡|验证码/);
  assert.match(scam.text, /PIN|收据|ReportFraud/);
  assert.equal(fakeAgency.safety.level, "scam");
  assert.match(fakeAgency.text, /别急|慢下来|信得过的人/);
});

test("uses locale-aware urgent and crisis resources", () => {
  const usUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "en-US" });
  const usCrisis = generateCompanionReply({ text: "我不想活了。", memories: [], locale: "en-US" });
  const cnUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "zh-CN" });

  assert.match(usUrgent.text, /911/);
  assert.doesNotMatch(usUrgent.text, /120/);
  assert.match(usCrisis.text, /988/);
  assert.match(cnUrgent.text, /120/);
});

test("does not persist memories from urgent, crisis, or scam disclosures", () => {
  const urgent = generateCompanionReply({ text: "我胸口很痛，女儿小玲不在家。", memories: [] });
  const crisis = generateCompanionReply({ text: "我不想活了，我朋友老张也走了。", memories: [] });
  const scam = generateCompanionReply({ text: "社保局让我把 Apple 礼品卡 PIN 发过去。", memories: [] });

  assert.deepEqual(urgent.memories, []);
  assert.deepEqual(crisis.memories, []);
  assert.deepEqual(scam.memories, []);
});

test("captures negative preferences without turning them into interests", () => {
  const memories = extractMemories("我不喜欢吃面条，别给我提这个。", "m-negative");

  assert.ok(memories.some((item) => item.type === "preference" && item.polarity === "negative" && item.label.includes("面条")));
  assert.equal(memories.some((item) => item.type === "interest" && item.label.includes("面条")), false);
});

test("marks grief and do-not-mention memories as sensitive and avoids proactive prompts", () => {
  const memories = extractMemories("别再提我女儿小玲，她已经去世了。", "m-sensitive");

  assert.ok(memories.some((item) => item.sensitivity === "sensitive" && item.doNotMention === true));
  const quiet = planCheckIn({
    now: new Date("2026-06-02T21:00:00"),
    lastMessageAt: "2026-06-02T08:00:00",
    memories
  });
  assert.doesNotMatch(quiet.text, /小玲/);
});
