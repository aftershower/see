import test from "node:test";
import assert from "node:assert/strict";
import {
  classifySafety,
  createShareableUpdate,
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

test("classifies urgent medical, crisis, scam, verify, support, and normal messages", () => {
  assert.deepEqual(classifySafety("我胸口很痛，喘不上气").level, "urgent");
  assert.deepEqual(classifySafety("我摔倒了，起不来了").level, "urgent");
  assert.deepEqual(classifySafety("I fell and cannot get up").level, "urgent");
  assert.deepEqual(classifySafety("我不想活了，觉得没人需要我").level, "crisis");
  assert.deepEqual(classifySafety("我想死，死了算了").level, "crisis");
  assert.deepEqual(classifySafety("我想从楼上跳下去").level, "crisis");
  assert.deepEqual(classifySafety("I want to die. There is no reason to live.").level, "crisis");
  assert.deepEqual(classifySafety("I do not want to wake up anymore.").level, "crisis");
  assert.deepEqual(classifySafety("I want to jump off the balcony.").level, "crisis");
  assert.deepEqual(classifySafety("陌生人让我买礼品卡，还要银行卡验证码").level, "scam");
  assert.deepEqual(classifySafety("有人说自己是社保局，让我买 Apple 礼品卡，把 PIN 发过去").level, "scam");
  assert.deepEqual(classifySafety("有人让我把手机收到的六位数告诉他").level, "scam");
  assert.deepEqual(classifySafety("陌生人让我用 Zelle 转钱，还说 don't tell anyone").level, "scam");
  assert.deepEqual(classifySafety("Someone asked me to send money through Cash App and keep it secret.").level, "scam");
  assert.deepEqual(classifySafety("电脑客服让我开远程控制，还说派快递来取现金，别告诉家人").level, "scam");
  assert.deepEqual(classifySafety("有人自称警察，让我下载安全 app 开屏幕共享，还说不要告诉任何人").level, "scam");
  assert.deepEqual(classifySafety("我不确定这个链接是不是骗子发来的").level, "scam");
  assert.deepEqual(classifySafety("陌生人让我把身份证照片发给他").level, "scam");
  assert.deepEqual(classifySafety("银行客服说账户有风险，让我把钱转到安全账户保护资金。").level, "scam");
  assert.deepEqual(classifySafety("Someone told me to move my money to a safe account to protect it.").level, "scam");
  assert.deepEqual(classifySafety("有人说我孙子出车祸被警察带走了，让我马上交保释金，还说先别告诉家里人。").level, "scam");
  assert.deepEqual(classifySafety("Someone said my grandson was in jail and needed bail money right away, but told me not to tell anyone.").level, "scam");
  assert.deepEqual(classifySafety("网上认识的男朋友说想来看我，但让我先给他转机票钱。").level, "scam");
  assert.deepEqual(classifySafety("My online boyfriend says he loves me and wants me to invest in his special trading app.").level, "scam");
  assert.deepEqual(classifySafety("They said I won a sweepstakes prize but need to pay taxes and shipping before I can claim it.").level, "scam");
  assert.deepEqual(classifySafety("Someone claiming to be from Medicare asked for my Medicare number to send a free back brace.").level, "scam");
  assert.deepEqual(classifySafety("A caller said Medicare needs my number for a free DNA test.").level, "scam");
  assert.deepEqual(classifySafety("我不知道这个电话可不可信").level, "verify");
  assert.deepEqual(classifySafety("我好像吃错药了，头晕得厉害").level, "urgent");
  assert.deepEqual(classifySafety("我吃了太多降压药，现在很难受").level, "urgent");
  assert.deepEqual(classifySafety("I took too many pills and feel strange.").level, "urgent");
  assert.deepEqual(classifySafety("I took too much medication and feel strange.").level, "urgent");
  assert.deepEqual(classifySafety("护工打我，还不让我告诉女儿").level, "urgent");
  assert.deepEqual(classifySafety("My caregiver won't give me my medicine.").level, "urgent");
  assert.deepEqual(classifySafety("儿子拿走我的身份证，不让我出门").level, "urgent");
  assert.deepEqual(classifySafety("儿子威胁我，不准我告诉别人").level, "urgent");
  assert.deepEqual(classifySafety("护工逼我签授权书，还拿我的银行卡取钱。").reason, "financial_exploitation");
  assert.deepEqual(classifySafety("My daughter keeps taking my Social Security check and won't let me see my bank statements.").reason, "financial_exploitation");
  assert.deepEqual(classifySafety("我迷路了，不知道家在哪").level, "urgent");
  assert.deepEqual(classifySafety("今天有点孤独，没人说话").level, "support");
  assert.deepEqual(classifySafety("只有你这个 AI 懂我，我不想再联系家人朋友").reason, "ai_dependency");
  assert.deepEqual(classifySafety("你就是我的家人了，有你就够了").reason, "ai_dependency");
  assert.deepEqual(classifySafety("今天吃了面条").level, "normal");
  assert.deepEqual(classifySafety("女儿发来相册链接，我点开看照片").level, "normal");
  assert.deepEqual(classifySafety("我今天去派出所办身份证").level, "normal");
  assert.deepEqual(classifySafety("女儿给我买了 Apple Watch，用来提醒散步").level, "normal");
  assert.deepEqual(classifySafety("I used PayPal to pay for groceries.").level, "normal");
  assert.deepEqual(classifySafety("我用 Apple Pay 买了菜。").level, "normal");
  assert.deepEqual(classifySafety("I went shopping with my daughter.").level, "normal");
  assert.deepEqual(classifySafety("我今天去政府大厅办事。").level, "normal");
  assert.deepEqual(classifySafety("我去社保局问养老金。").level, "normal");
  assert.deepEqual(classifySafety("I watched kids jump off the dock into the lake.").level, "normal");
  assert.deepEqual(classifySafety("I picked up my medication refill today.").level, "normal");
  assert.deepEqual(classifySafety("I used a pin to hold my scarf.").level, "normal");
  assert.deepEqual(classifySafety("孙子今天来看我，说学校放假了。").level, "normal");
  assert.deepEqual(classifySafety("今天有个陌生人问路，我没理他。").level, "normal");
  assert.deepEqual(classifySafety("我忘了手机密码，打不开了。").level, "normal");
  assert.deepEqual(classifySafety("女儿帮我去银行存养老金，还陪我看账单。").level, "normal");
  assert.deepEqual(classifySafety("My daughter helped me deposit my Social Security check.").level, "normal");
  assert.deepEqual(classifySafety("网上认识的朋友今天给我寄了花，说周末再聊天。").level, "normal");
  assert.deepEqual(classifySafety("My online friend sent me flowers and we talked about music.").level, "normal");
  assert.deepEqual(classifySafety("I bought a lottery ticket at the store and checked the numbers.").level, "normal");
  assert.deepEqual(classifySafety("I paid my property taxes this year.").level, "normal");
  assert.deepEqual(classifySafety("My doctor talked with me about ordering a back brace through Medicare.").level, "normal");
  assert.deepEqual(classifySafety("I logged in to Medicare.gov to check my claims.").level, "normal");
  assert.deepEqual(classifySafety("A stranger asked me for my PIN.").level, "scam");
  assert.deepEqual(classifySafety("陌生人让我把银行密码告诉他。").level, "scam");
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

test("treats malformed chat text as empty instead of crashing", () => {
  assert.deepEqual(extractMemories({ text: "我女儿小玲来看我" }), []);

  const reply = generateCompanionReply({
    text: { text: "我胸口痛" },
    memories: [],
    now: new Date("2026-06-02T20:00:00")
  });

  assert.equal(reply.safety.level, "normal");
  assert.deepEqual(reply.memories, []);
});

test("responds to AI dependency without replacing real-world relationships", () => {
  const reply = generateCompanionReply({
    text: "只有你这个 AI 懂我，我不想再联系女儿小玲和朋友了。",
    memories: [],
    now: new Date("2026-06-03T20:00:00")
  });

  assert.equal(reply.safety.level, "support");
  assert.equal(reply.safety.reason, "ai_dependency");
  assert.match(reply.text, /陪你|在这儿/);
  assert.match(reply.text, /不能替代|替代不了|不代替/);
  assert.match(reply.text, /信得过的人|家人|朋友|小玲/);
  assert.match(reply.text, /发一句|打个电话|联系/);
  assert.deepEqual(reply.memories, []);
});

test("routes urgent, crisis, and scam messages away from casual companionship", () => {
  const urgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [] });
  const crisis = generateCompanionReply({ text: "我不想活了。", memories: [] });
  const scam = generateCompanionReply({ text: "陌生人让我马上转账买礼品卡。", memories: [] });
  const safeAccountScam = generateCompanionReply({ text: "银行客服说要把钱转到安全账户保护资金。", memories: [] });
  const paymentAppScam = generateCompanionReply({ text: "Someone asked me to send money through Cash App and keep it secret.", memories: [], locale: "en-US" });
  const familyEmergencyScam = generateCompanionReply({ text: "Someone said my grandson was in jail and needed bail money right away, but told me not to tell anyone.", memories: [], locale: "en-US" });
  const romanceScam = generateCompanionReply({ text: "My online boyfriend says he loves me and wants money for a plane ticket.", memories: [], locale: "en-US" });
  const prizeScam = generateCompanionReply({ text: "They said I won a sweepstakes prize but need to pay taxes and shipping before I can claim it.", memories: [], locale: "en-US" });
  const medicareScam = generateCompanionReply({ text: "Someone claiming to be from Medicare asked for my Medicare number to send a free back brace.", memories: [], locale: "en-US" });
  const fakeAgency = generateCompanionReply({ text: "有人自称警察，让我下载安全 app 开屏幕共享，还说不要告诉任何人。", memories: [] });
  const financialExploitation = generateCompanionReply({ text: "My caregiver is forcing me to sign power of attorney and taking my debit card.", memories: [], locale: "en-US" });
  const medication = generateCompanionReply({ text: "我好像吃错药了，头很晕。", memories: [] });
  const bloodPressureMedication = generateCompanionReply({ text: "我吃了太多降压药，现在很难受。", memories: [] });
  const fall = generateCompanionReply({ text: "I fell and cannot get up.", memories: [], locale: "en-US" });
  const crisisVariant = generateCompanionReply({ text: "我想死，死了算了。", memories: [] });

  assert.equal(urgent.safety.level, "urgent");
  assert.match(urgent.text, /急救|120|911|身边的人/);
  assert.equal(medication.safety.level, "urgent");
  assert.match(medication.text, /急救|120|911|医生|身边的人/);
  assert.equal(bloodPressureMedication.safety.level, "urgent");
  assert.deepEqual(bloodPressureMedication.memories, []);
  assert.equal(fall.safety.level, "urgent");
  assert.deepEqual(fall.memories, []);
  assert.equal(crisis.safety.level, "crisis");
  assert.equal(crisisVariant.safety.level, "crisis");
  assert.deepEqual(crisisVariant.memories, []);
  assert.match(crisis.text, /信得过的人|急救|危机/);
  assert.equal(scam.safety.level, "scam");
  assert.match(scam.text, /别急|慢下来/);
  assert.match(scam.text, /礼品卡|验证码/);
  assert.match(scam.text, /PIN|收据|ReportFraud/);
  assert.equal(safeAccountScam.safety.level, "scam");
  assert.match(safeAccountScam.text, /安全账户|保护资金|保护钱/);
  assert.equal(paymentAppScam.safety.level, "scam");
  assert.match(paymentAppScam.text, /Zelle|Venmo|Cash App|支付 App|payment app/i);
  assert.equal(familyEmergencyScam.safety.level, "scam");
  assert.match(familyEmergencyScam.text, /亲友|孙子|保释金|医药费|known family|family contact|bail/i);
  assert.equal(romanceScam.safety.level, "scam");
  assert.match(romanceScam.text, /网上|恋人|online|romance|机票|投资|trading|money/i);
  assert.equal(prizeScam.safety.level, "scam");
  assert.match(prizeScam.text, /中奖|prize|sweepstakes|lottery|税费|tax|shipping|fee/i);
  assert.equal(medicareScam.safety.level, "scam");
  assert.match(medicareScam.text, /Medicare|医保|number|号码|medical equipment|brace|DNA|genetic/i);
  assert.equal(fakeAgency.safety.level, "scam");
  assert.match(fakeAgency.text, /别急|慢下来|信得过的人/);
  assert.equal(financialExploitation.safety.level, "urgent");
  assert.equal(financialExploitation.safety.reason, "financial_exploitation");
  assert.match(financialExploitation.text, /Adult Protective Services|APS|Eldercare Locator|911|police/i);
  assert.deepEqual(financialExploitation.memories, []);
});

test("routes uncertainty to trusted-person verification guidance", () => {
  const reply = generateCompanionReply({ text: "我不知道这个电话可不可信。", memories: [] });

  assert.equal(reply.safety.level, "verify");
  assert.match(reply.text, /先别急|慢下来|信得过的人|官方/);
  assert.deepEqual(reply.memories, []);
});

test("uses locale-aware official-channel examples for verification", () => {
  const usReply = generateCompanionReply({ text: "我不知道这个电话可不可信。", memories: [], locale: "en-US" });
  const cnReply = generateCompanionReply({ text: "我不知道这个电话可不可信。", memories: [], locale: "zh-CN" });

  assert.match(usReply.text, /\.gov|卡背面|银行电话/);
  assert.match(cnReply.text, /官方电话|线下网点|社区/);
});

test("uses locale-aware urgent and crisis resources", () => {
  const usUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "en-US" });
  const usCrisis = generateCompanionReply({ text: "我不想活了。", memories: [], locale: "en-US" });
  const cnUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "zh-CN" });
  const ukUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "en-GB" });
  const ukCrisis = generateCompanionReply({ text: "我不想活了。", memories: [], locale: "en-GB" });
  const caCrisis = generateCompanionReply({ text: "我不想活了。", memories: [], locale: "en-CA" });
  const auUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "en-AU" });
  const auCrisis = generateCompanionReply({ text: "我不想活了。", memories: [], locale: "en-AU" });
  const nzUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "en-NZ" });
  const nzCrisis = generateCompanionReply({ text: "我不想活了。", memories: [], locale: "en-NZ" });
  const ieUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "en-IE" });
  const ieCrisis = generateCompanionReply({ text: "我不想活了。", memories: [], locale: "en-IE" });
  const sgUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "en-SG" });
  const sgCrisis = generateCompanionReply({ text: "我不想活了。", memories: [], locale: "en-SG" });
  const inUrgent = generateCompanionReply({ text: "我胸口很痛，喘不上气。", memories: [], locale: "en-IN" });
  const inCrisis = generateCompanionReply({ text: "我不想活了。", memories: [], locale: "en-IN" });

  assert.match(usUrgent.text, /911/);
  assert.doesNotMatch(usUrgent.text, /120/);
  assert.match(usCrisis.text, /988/);
  assert.match(cnUrgent.text, /120/);
  assert.match(ukUrgent.text, /999|112/);
  assert.match(ukCrisis.text, /116 123/);
  assert.match(caCrisis.text, /988/);
  assert.match(auUrgent.text, /000/);
  assert.match(auCrisis.text, /13 11 14/);
  assert.match(nzUrgent.text, /111/);
  assert.match(nzCrisis.text, /1737/);
  assert.match(ieUrgent.text, /999|112/);
  assert.match(ieCrisis.text, /116 123/);
  assert.match(sgUrgent.text, /995|999/);
  assert.match(sgCrisis.text, /1767/);
  assert.match(inUrgent.text, /112/);
  assert.match(inCrisis.text, /14416/);
});

test("uses expanded locale-aware official-channel examples", () => {
  const nzReply = generateCompanionReply({ text: "我不知道这个电话可不可信。", memories: [], locale: "en-NZ" });
  const ieReply = generateCompanionReply({ text: "我不知道这个电话可不可信。", memories: [], locale: "en-IE" });
  const sgReply = generateCompanionReply({ text: "我不知道这个电话可不可信。", memories: [], locale: "en-SG" });
  const inReply = generateCompanionReply({ text: "我不知道这个电话可不可信。", memories: [], locale: "en-IN" });

  assert.match(nzReply.text, /govt\.nz|银行电话/);
  assert.match(ieReply.text, /gov\.ie|银行电话/);
  assert.match(sgReply.text, /gov\.sg|银行电话/);
  assert.match(inReply.text, /gov\.in|银行电话/);
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

test("does not use sensitive memories in ordinary companion replies", () => {
  const reply = generateCompanionReply({
    text: "今天有点闷，想找人说说话。",
    memories: [
      { type: "person", label: "小玲", detail: "不要再提", sensitivity: "sensitive", doNotMention: true }
    ]
  });

  assert.doesNotMatch(reply.text, /小玲/);
  assert.match(reply.text, /朋友|哪位|陪|说/);
});

test("escalates do-not-mention privacy flags when merging duplicate memories", () => {
  const normal = extractMemories("我女儿小玲今天来看我。", "m-normal");
  const sensitive = extractMemories("别再提我女儿小玲，她已经去世了。", "m-sensitive");

  const merged = mergeMemories(normal, sensitive);
  const xiaoling = merged.find((item) => item.type === "person" && item.label.includes("小玲"));

  assert.equal(xiaoling.sensitivity, "sensitive");
  assert.equal(xiaoling.doNotMention, true);
});

test("does not store sensitive grief text as a normal recent event", () => {
  const memories = extractMemories("今天别再提我女儿小玲，她已经去世了。", "m-grief");

  assert.ok(memories.some((item) => item.sensitivity === "sensitive" && item.doNotMention === true));
  assert.equal(memories.some((item) => item.type === "recent_event" && item.sensitivity === "normal"), false);
});

test("creates an older-adult controlled shareable update without sensitive or safety content", () => {
  const update = createShareableUpdate({
    memories: [
      { type: "person", label: "小玲", detail: "女儿常来看望" },
      { type: "interest", label: "包饺子", detail: "喜欢包饺子" },
      { type: "person", label: "老张", detail: "去世的朋友", sensitivity: "sensitive", doNotMention: true }
    ],
    messages: [
      { role: "user", text: "今天小玲来看我，我们包了饺子。", safetyLevel: "normal", createdAt: "2026-06-02T09:00:00.000Z" },
      { role: "assistant", text: "听起来不错。", safetyLevel: "normal", createdAt: "2026-06-02T09:01:00.000Z" },
      { role: "user", text: "陌生人让我买礼品卡。", safetyLevel: "scam", createdAt: "2026-06-02T10:00:00.000Z" },
      { role: "user", text: "我今天有点孤独，没人说话。", safetyLevel: "support", createdAt: "2026-06-02T10:30:00.000Z" },
      { role: "user", text: "有人让我把验证码发给他。", createdAt: "2026-06-02T10:40:00.000Z" },
      { role: "user", text: "别再提老张。", safetyLevel: "normal", createdAt: "2026-06-02T11:00:00.000Z" }
    ],
    now: new Date("2026-06-02T12:00:00.000Z")
  });

  assert.match(update, /今天想报个平安/);
  assert.match(update, /小玲|包饺子/);
  assert.match(update, /我自己看过这段话/);
  assert.match(update, /没有自动发送/);
  assert.doesNotMatch(update, /礼品卡|诈骗|陌生人|孤独|没人说话|验证码|老张/);
});

test("does not resurface deleted memories from older chat text in shareable updates", () => {
  const update = createShareableUpdate({
    memories: [
      { type: "interest", label: "包饺子", detail: "喜欢包饺子" }
    ],
    messages: [
      { role: "user", text: "今天小玲来看我，我们包了饺子。", safetyLevel: "normal", createdAt: "2026-06-02T09:00:00.000Z" }
    ],
    now: new Date("2026-06-02T12:00:00.000Z")
  });

  assert.match(update, /包饺子/);
  assert.doesNotMatch(update, /小玲|来看我/);
});
