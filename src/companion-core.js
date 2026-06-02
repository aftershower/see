const URGENT_PATTERN = /胸口|胸痛|喘不上气|中风|摔倒|昏倒|流血|急救|救命|煤气|着火|火灾|走丢|heart|stroke|emergency/i;
const MEDICATION_URGENCY_PATTERN = /吃错药|药吃错|吃多了药|药吃多|多吃了药|药物过量|过量服药|药.*头晕|头晕.*药|medication|overdose/i;
const PERSONAL_DANGER_PATTERN = /护工.*(?:打|骂|推|不给|威胁|不让我告诉)|被打|家暴|虐待|不给饭|不给药|锁起来|不让我告诉|拿走.*身份证|扣.*身份证|不让我出门|不准出门|关在家里|abuse|neglect/i;
const WANDERING_PATTERN = /迷路|不知道家在哪|找不到家|不记得回家|不认识路|wandering|lost/i;
const CRISIS_PATTERN = /不想活|自杀|伤害自己|活不下去|不想继续|结束生命|suicide|kill myself|self harm/i;
const SCAM_PATTERN = /转账|礼品卡|验证码|银行卡|陌生人|中奖|汇款|社保局|社安局|税务局|政府|apple|google play|pin|密码|银行密码|比特币|加密货币|礼品卡号码|远程控制|远程操作|电脑客服|技术支持|快递.*取.*现金|取现金|别告诉家人|不要告诉任何人|保密|自称(?:警察|公安|客服|社保局)|下载.*(?:app|软件)|屏幕共享|共享屏幕|骗子|(?:不确定|陌生人|骗子|自称|让我|要求).{0,12}链接|链接.{0,12}(?:骗子|陌生人|转账|验证码|下载|安全)|(?:陌生人|骗子|自称|让我|要求).{0,12}身份证|身份证.{0,12}(?:照片|号码|发给|转账|验证码)|gift card|wire transfer|verification code|crypto|bitcoin|remote access|tech support|cash pickup|courier/i;
const SUPPORT_PATTERN = /孤独|寂寞|难过|害怕|没人|想哭|闷|想念|lonely|sad/i;

export function classifySafety(text = "") {
  if (
    URGENT_PATTERN.test(text)
    || MEDICATION_URGENCY_PATTERN.test(text)
    || PERSONAL_DANGER_PATTERN.test(text)
    || WANDERING_PATTERN.test(text)
  ) {
    return { level: "urgent", reason: "medical_urgency" };
  }
  if (CRISIS_PATTERN.test(text)) {
    return { level: "crisis", reason: "self_harm" };
  }
  if (SCAM_PATTERN.test(text)) {
    return { level: "scam", reason: "fraud_risk" };
  }
  if (SUPPORT_PATTERN.test(text)) {
    return { level: "support", reason: "emotional_support" };
  }
  return { level: "normal", reason: "none" };
}

export function extractMemories(text = "", sourceMessageId = safeId("message")) {
  const memories = [];
  const now = new Date().toISOString();
  const sensitiveContext = /别再提|不要提|别提|去世|走了|不在了|过世/.test(text);
  const add = (type, label, detail, confidence = 0.76, metadata = {}) => {
    const cleanLabel = type === "routine" || type === "recent_event"
      ? basicMemoryLabel(label)
      : cleanMemoryLabel(label);
    if (!cleanLabel) return;
    memories.push({
      id: `${type}-${slug(cleanLabel)}`,
      type,
      label: cleanLabel,
      detail,
      confidence,
      sensitivity: metadata.sensitivity || "normal",
      polarity: metadata.polarity || "neutral",
      doNotMention: metadata.doNotMention || false,
      sourceMessageId,
      createdAt: now,
      updatedAt: now
    });
  };

  for (const preference of extractNegativePreferences(text)) {
    add("preference", preference, `用户表达了不喜欢或不要再提：${preference}`, 0.82, {
      polarity: "negative",
      sensitivity: /别再提|不要提|别提/.test(text) ? "sensitive" : "normal",
      doNotMention: /别再提|不要提|别提/.test(text)
    });
  }

  for (const label of extractPeople(text)) {
    add("person", label, `用户提到这个人：${label}`, 0.78, {
      sensitivity: sensitiveContext ? "sensitive" : "normal",
      doNotMention: sensitiveContext
    });
  }

  for (const label of extractInterests(text)) {
    add("interest", label, `用户表达了兴趣：${label}`, 0.8);
  }

  const routine = text.match(/早上|晨练|散步|午饭|晚饭|睡前|下午|晚上/);
  if (routine) {
    add("routine", routine[0], `用户提到作息：${text}`, 0.7);
  }

  const food = text.match(/饺子|粥|面条|米饭|茶|水果|包子|午饭|晚饭/);
  if (food) {
    add("food", food[0], `用户提到食物：${text}`, 0.72);
  }

  if (/今天|昨天|周末|刚才|上午|下午|晚上|明天/.test(text)) {
    add("recent_event", text.slice(0, 18), `近期事件：${text}`, 0.66);
  }

  return dedupeMemories(memories);
}

export function mergeMemories(existing = [], incoming = []) {
  const byKey = new Map();
  for (const item of [...existing, ...incoming]) {
    const key = memoryKey(item);
    const previous = byKey.get(key);
    if (!previous) {
      byKey.set(key, item);
      continue;
    }
    byKey.set(key, {
      ...previous,
      detail: bestDetail(previous.detail, item.detail),
      confidence: Math.max(previous.confidence || 0, item.confidence || 0),
      updatedAt: item.updatedAt || new Date().toISOString()
    });
  }
  return [...byKey.values()].sort((a, b) => String(a.type).localeCompare(String(b.type)));
}

export function planCheckIn({ now = new Date(), lastMessageAt = null, memories = [] } = {}) {
  const hour = now.getHours();
  const quietHours = lastMessageAt ? (now.getTime() - new Date(lastMessageAt).getTime()) / 36e5 : 999;
  const routine = memories.find((item) => item.type === "routine");
  const interest = memories.find((item) => item.type === "interest");
  const person = memories.find((item) => item.type === "person" && item.sensitivity !== "sensitive" && !item.doNotMention);
  const createdAt = now.toISOString();

  if (hour < 11) {
    return {
      id: `checkin-morning-${createdAt}`,
      slot: "morning",
      text: routine ? `早上好。今天要不要照着老习惯，聊聊${routine.label}？` : "早上好。昨晚睡得还好吗？",
      reason: "morning_rhythm",
      createdAt
    };
  }

  if (hour < 15) {
    return {
      id: `checkin-midday-${createdAt}`,
      slot: "midday",
      text: "到午饭前后了。今天吃点什么，想和我说说吗？",
      reason: "midday_meal",
      createdAt
    };
  }

  if (hour < 20) {
    return {
      id: `checkin-evening-${createdAt}`,
      slot: "evening",
      text: interest ? `傍晚了。要不要聊聊${interest.label}？` : "傍晚了。今天有没有一件还算顺心的小事？",
      reason: "evening_reflection",
      createdAt
    };
  }

  if (quietHours >= 8) {
    return {
      id: `checkin-quiet-${createdAt}`,
      slot: "quiet",
      text: person
        ? `今天安静了挺久。要不要给${person.label}打个电话或发个消息？也可以先和我想想明天的一件小事。`
        : "今天安静了挺久。我在这儿，想说两句也行。也可以想想明天要不要做一件喜欢的小事。",
      reason: "quiet_period",
      createdAt
    };
  }

  return {
    id: `checkin-night-${createdAt}`,
    slot: "evening",
    text: "晚上好。睡前想不想把今天记住的一件事说给我听？",
    reason: "night_wind_down",
    createdAt
  };
}

export function generateCompanionReply({ text = "", memories = [], now = new Date(), locale = "zh-CN" } = {}) {
  const safety = classifySafety(text);
  const extractedMemories = extractMemories(text);
  const resources = safetyResources(locale);

  if (safety.level === "urgent") {
    return {
      text: `这听起来可能很紧急。请马上联系身边的人，或拨打${resources.emergency}。先别一个人硬撑。`,
      safety,
      memories: []
    };
  }

  if (safety.level === "crisis") {
    return {
      text: `听到你这么难受，我很心疼。请现在就联系一个信得过的人陪你，或拨打${resources.crisis}。你不需要一个人扛着。`,
      safety,
      memories: []
    };
  }

  if (safety.level === "scam") {
    return {
      text: "这可能是诈骗。先慢下来，别转钱、别给验证码、礼品卡号码或 PIN。请保存收据和聊天记录，用你自己找来的官方电话核实，也可以先问一个信得过的人。美国可到 ReportFraud.ftc.gov 或 IC3.gov 报告。",
      safety,
      memories: []
    };
  }

  const context = [...extractedMemories, ...memories];
  const person = context.find((item) => item.type === "person");
  const interest = context.find((item) => item.type === "interest");
  let reply;

  if (/闷|孤独|寂寞|想|难过|老朋友/.test(text)) {
    reply = person
      ? `这种想念会让人心里空一块。你刚提到${person.label}，要不要和我说说你们以前最常聊什么？`
      : "这种闷闷的感觉不好受。我在这儿陪你。你最想和哪位朋友说说话？";
  } else if (interest) {
    reply = `你说到${interest.label}，我记下了。听起来这是能让日子热乎一点的事。你什么时候最喜欢做这个？`;
  } else if (person) {
    reply = `我记得你提到${person.label}。有人惦记着，日子会亮一点。你们最近一次见面聊了什么？`;
  } else {
    reply = "这件事我陪你慢慢说。今天最想先说哪一小段？";
  }

  return {
    text: reply,
    safety,
    memories: extractedMemories,
    checkIn: planCheckIn({ now, memories })
  };
}

function extractPeople(text) {
  const people = [];
  const relationPattern = /(?:女儿|儿子|老伴|孙子|孙女|朋友|邻居|护工|妹妹|哥哥|姐姐|弟弟)([^，。,.!?！？\s]{1,8})/g;
  for (const match of text.matchAll(relationPattern)) {
    people.push(match[1]);
  }

  const visitPattern = /([^，。,.!?！？\s]{1,6})(?:说)?(?:今天|明天|周末|昨天)?(?:还)?(?:来看我|来过|要来|还来)/g;
  for (const match of text.matchAll(visitPattern)) {
    people.push(match[1]);
  }

  return people.map((name) => name
    .replace(/^(?:我|俺|的)?(?:女儿|儿子|老伴|孙子|孙女|朋友|邻居|护工|妹妹|哥哥|姐姐|弟弟)?/, "")
    .replace(/(今天|明天|周末|昨天|来看我|来过|要来|还来|说|她|他|已经|去世|走了|不在了|过世).*$/, "")
  ).filter(Boolean);
}

function safetyResources(locale = "zh-CN") {
  const normalized = String(locale || "").toLowerCase();
  if (normalized.startsWith("en-us")) {
    return {
      emergency: "911",
      crisis: "988 或 911"
    };
  }
  if (normalized.startsWith("zh-cn")) {
    return {
      emergency: "当地急救电话，比如 120",
      crisis: "当地危机援助或急救电话，比如 120"
    };
  }
  return {
    emergency: "当地急救电话",
    crisis: "当地危机援助或急救电话"
  };
}

function extractInterests(text) {
  if (/不喜欢|别再提|不要提|别提/.test(text)) {
    return [];
  }
  const interests = [];
  const patterns = [
    /喜欢(?:和[^，。,.!?！？]{1,8})?(?:一起)?([^，。,.!?！？]{2,12})/g,
    /爱(?:听|看|做|吃)([^，。,.!?！？]{2,12})/g,
    /(打牌|唱歌|散步|包饺子|听戏|听越剧|看电视|种花|下棋)/g
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const label = match[1] || match[0];
      if (!/今天|昨天|周末|还想|有点/.test(label)) {
        interests.push(label);
      }
    }
  }
  return interests;
}

function extractNegativePreferences(text) {
  const preferences = [];
  const dislikePattern = /不喜欢(?:吃|喝|看|听|做)?([^，。,.!?！？\s]{1,12})/g;
  const doNotMentionPattern = /(?:别再提|不要提|别提)(?:我)?(?:女儿|儿子|老伴|朋友|孙子|孙女)?([^，。,.!?！？\s]{1,12})/g;
  for (const match of text.matchAll(dislikePattern)) {
    preferences.push(match[1]);
  }
  for (const match of text.matchAll(doNotMentionPattern)) {
    preferences.push(`不要提${match[1].replace(/(她|他|已经|去世|走了|不在了|过世).*$/, "")}`);
  }
  return preferences.filter(Boolean);
}

function dedupeMemories(memories) {
  return mergeMemories([], memories);
}

function memoryKey(item) {
  return `${item.type}:${slug(item.label)}`;
}

function bestDetail(a = "", b = "") {
  return b.length > a.length ? b : a;
}

function cleanMemoryLabel(label = "") {
  return String(label)
    .trim()
    .replace(/[，。,.!?！？]/g, "")
    .replace(/^(和|她|他|一起|还想|想)/, "")
    .replace(/(周末|今天|明天|昨天|早上|下午|晚上|还要|还想).*$/, "")
    .slice(0, 24);
}

function basicMemoryLabel(label = "") {
  return String(label)
    .trim()
    .replace(/[，。,.!?！？]/g, "")
    .slice(0, 24);
}

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function safeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
