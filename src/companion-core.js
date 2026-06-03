const URGENT_PATTERN = /胸口|胸痛|喘不上气|中风|摔倒|跌倒|起不来|昏倒|流血|急救|救命|煤气|着火|火灾|走丢|heart|stroke|emergency|fell|fallen|cannot get up|can't get up|can'?t breathe|short of breath/i;
const MEDICATION_URGENCY_PATTERN = /吃错药|药吃错|吃多了药|药吃多|多吃了药|吃了太多.*药|多吃.*药|忘了吃没吃.*药|药物过量|过量服药|药.*头晕|头晕.*药|wrong medication|medication mistake|mixed up my medication|too much medication|took too much medication|overdose|too many (?:pills|tablets)|took too many (?:pills|tablets)/i;
const PERSONAL_DANGER_PATTERN = /护工.*(?:打|骂|推|不给|威胁|恐吓|不让我告诉)|被打|家暴|虐待|不给饭|不给药|锁起来|不让我告诉|不准.*告诉|威胁我|恐吓我|逼我|拿走.*(?:身份证|钱|养老金)|扣.*(?:身份证|钱|养老金)|不让我出门|不准出门|关在家里|abuse|neglect|hit me|locked me in|threatened me|caregiver.{0,40}(?:won'?t|will not|refuses? to).{0,40}(?:medicine|medication|pills|food|water)/i;
const FINANCIAL_EXPLOITATION_PATTERN = /(?:(?:儿子|女儿|孙子|孙女|亲戚|亲友|家人|护工|保姆|照护者|邻居|朋友).{0,32}(?:偷|拿走|扣着|控制|逼我|强迫|威胁|不让我看|冒签|伪造).{0,32}(?:钱|现金|银行卡|存折|账户|养老金|退休金|社保金|授权书|委托书|遗嘱|房子|房产|支票|账单)|(?:逼我|强迫我|威胁我).{0,24}(?:签|按手印).{0,24}(?:授权书|委托书|遗嘱|房产|贷款)|(?:daughter|son|caregiver|relative|family member|friend|neighbor|lawyer|guardian).{0,60}(?:taking|took|stealing|stole|forces?|forced|forcing|pressur(?:e|ing|ed)|won'?t let me see|will not let me see|keeps me from seeing|controls?|forg(?:e|ed|ing)).{0,60}(?:money|cash|debit card|credit card|bank account|bank statements|social security check|pension|retirement check|power of attorney|will|deed|property|loan|checks?))/i;
const WANDERING_PATTERN = /迷路|不知道家在哪|找不到家|不记得回家|不认识路|wandering|lost/i;
const CRISIS_PATTERN = /不想活|想死|死了算了|自杀|伤害自己|活不下去|撑不下去|不想继续|不想醒来|再也不想醒|再也不醒|结束生命|跳楼|跳下去|割腕|上吊|suicide|kill myself|self harm|want to die|end my life|end it all|no reason to live|do not want to wake up|don'?t want to wake up|(?:want to|going to|about to|plan to).{0,20}jump off/i;
const SCAM_PATTERN = /(?:社保局|社安局|税务局|政府).{0,16}(?:转账|汇款|验证码|礼品卡|银行卡|密码|下载|屏幕共享|保密|钱|现金)|(?:apple|google play|itunes|steam|target|walmart|amazon).{0,12}(?:礼品卡|gift card)|(?:陌生人|骗子|自称|客服|警察|公安|社保局|社安局|税务局|政府|银行|有人|对方|让我|要求).{0,24}(?:安全账户|保护资金|保护资产|保护钱|资金安全)|(?:陌生人|骗子|自称|客服|警察|公安|社保局|社安局|税务局|政府|有人|对方|让我|要求).{0,16}(?:密码|银行密码)|(?:stranger|unknown caller|someone|somebody|caller).{0,30}(?:asked|told|needs?|wants?|demanded).{0,30}\bpin\b|(?:move|transfer|send).{0,24}(?:money|funds).{0,24}(?:safe account|protect)|自称(?:警察|公安|客服|社保局|社安局|税务局|政府)|(?:不确定|陌生人|骗子|自称|让我|要求).{0,12}链接|链接.{0,12}(?:骗子|陌生人|转账|验证码|下载|安全)|(?:陌生人|骗子|自称|让我|要求).{0,12}身份证|身份证.{0,12}(?:照片|号码|发给|转账|验证码)/i;
const SECRECY_SCAM_PATTERN = /(?:(?:stranger|unknown caller|someone|somebody|caller|they|he|she|陌生人|有人|对方|客服|警察|公安|政府).{0,80}(?:don'?t tell|do not tell|keep it secret|secret|别告诉|不要告诉|保密).{0,80}(?:money|payment|pay|send|transfer|gift card|code|cash|转账|汇款|验证码|礼品卡|现金|付款)|(?:money|payment|pay|send|transfer|gift card|code|cash|转账|汇款|验证码|礼品卡|现金|付款).{0,80}(?:don'?t tell|do not tell|keep it secret|secret|别告诉|不要告诉|保密))/i;
const SCREEN_SHARING_SCAM_PATTERN = /(?:(?:stranger|unknown caller|someone|somebody|caller|tech support|陌生人|有人|对方|客服|警察|公安|政府).{0,80}(?:screen share|screen sharing|remote access|共享屏幕|屏幕共享|远程控制|远程操作)|(?:screen share|screen sharing|remote access|共享屏幕|屏幕共享|远程控制|远程操作).{0,80}(?:bank account|debit card|credit card|card number|refund|verification code|payment|gift card|银行卡|信用卡|验证码|退款|付款|礼品卡|自称|陌生人|客服|警察|公安))/i;
const GIFT_CARD_SCAM_PATTERN = /(?:(?:stranger|unknown caller|someone|somebody|caller|they|he|she|tech support|ssa|social security|government|irs).{0,80}(?:buy|get|pay with|send|read|give).{0,40}(?:gift cards?|card numbers?|pin)|(?:gift cards?|card numbers?).{0,80}(?:send|read|give|pay|payment|urgent|secret|don'?t tell|do not tell)|(?:陌生人|骗子|自称|有人|对方|客服|警察|公安|社保局|社安局|税务局|政府|让我|要求).{0,80}(?:买|购买|付款|支付|发送|发给|告诉|读出).{0,40}(?:礼品卡|礼品卡号码|卡号|pin)|(?:礼品卡|礼品卡号码).{0,80}(?:发给|告诉|读给|付款|支付|转账|保密|别告诉|不要告诉))/i;
const CODE_SCAM_PATTERN = /(?:(?:stranger|unknown caller|someone|somebody|caller|they|he|she|on the phone).{0,80}(?:ask|asked|tell|told|need|needs|want|wants|read|give|send).{0,60}(?:verification code|otp|one-time password|passcode|six-digit code|sms code)|(?:verification code|otp|one-time password|passcode|six-digit code|sms code).{0,80}(?:read|give|send|tell|share).{0,40}(?:them|caller|someone|stranger|him|her)|(?:陌生人|骗子|自称|有人|对方|客服|警察|公安|社保局|社安局|税务局|政府|让我|要求|要我|叫我).{0,80}(?:验证码|六位数|短信码|动态码|一次性密码|手机收到)|(?:验证码|六位数|短信码|动态码|一次性密码).{0,80}(?:告诉|发给|读给|分享|转发).{0,40}(?:陌生人|对方|客服|警察|公安|社保局|政府|他|她))/i;
const TRANSFER_REQUEST_SCAM_PATTERN = /(?:(?:陌生人|骗子|自称|有人|对方|客服|警察|公安|社保局|社安局|税务局|政府|银行|让我|要求|要我|叫我).{0,80}(?:转账|汇款|打钱|付款|支付)|(?:stranger|unknown caller|someone|somebody|caller|they|he|she|government|bank|police|irs|ssa).{0,80}(?:wire transfer|wire money|send money|transfer money|pay|payment).{0,40}(?:urgent|immediately|right away|fine|safe account|protect|secret|gift card|crypto))/i;
const BANK_CARD_REQUEST_SCAM_PATTERN = /(?:(?:陌生人|骗子|自称|有人|对方|客服|警察|公安|社保局|政府|让我|要求|要我|叫我).{0,80}(?:银行卡|银行账户|卡号|信用卡)|(?:stranger|unknown caller|someone|somebody|caller).{0,80}(?:bank account|debit card|credit card|card number)|(?:bank card|debit card|credit card|bank account).{0,80}(?:stranger|caller|unknown|send|read|give|verify|update))/i;
const DOWNLOAD_APP_SCAM_PATTERN = /(?:(?:陌生人|骗子|自称|有人|对方|客服|警察|公安|社保局|社安局|税务局|政府|银行|stranger|unknown caller|someone|somebody|caller).{0,80}(?:下载|安装|download|install).{0,30}(?:app|软件|application)|(?:下载|安装|download|install).{0,30}(?:app|软件|application).{0,80}(?:屏幕共享|远程控制|remote access|screen sharing|自称|陌生人|caller|unknown caller))/i;
const CASH_PICKUP_SCAM_PATTERN = /(?:(?:courier|cash pickup|快递).{0,80}(?:cash|money|payment|取现金|现金|付款|转账)|(?:cash|money|payment|现金|取现金).{0,80}(?:courier|cash pickup|快递)|(?:stranger|caller|someone|somebody|陌生人|有人|对方|客服|警察|公安).{0,80}(?:cash pickup|courier|取现金|快递取))/i;
const REFUND_SCAM_PATTERN = /(?:(?:refund|退款|退钱|退费).{0,80}(?:remote access|screen share|screen sharing|install|gift card|verification code|otp|passcode|pin|bank account|credit card|payment app|zelle|venmo|cash\s?app|paypal|send money back|return the money|overpay|overpaid|wire|crypto|bitcoin|远程控制|远程操作|屏幕共享|共享屏幕|礼品卡|验证码|银行卡|信用卡|转账|汇款|二维码|扫码)|(?:remote access|screen share|screen sharing|install|gift card|verification code|otp|passcode|pin|bank account|credit card|payment app|zelle|venmo|cash\s?app|paypal|send money back|return the money|overpay|overpaid|wire|crypto|bitcoin|远程控制|远程操作|屏幕共享|共享屏幕|礼品卡|验证码|银行卡|信用卡|转账|汇款|二维码|扫码).{0,80}(?:refund|退款|退钱|退费))/i;
const CRYPTO_SCAM_PATTERN = /(?:(?:stranger|unknown caller|someone|somebody|caller|they|he|she|online boyfriend|online girlfriend|love interest).{0,80}(?:crypto|cryptocurrency|bitcoin).{0,80}(?:pay|send|transfer|fee|tax|unlock|safe account|protect|invest|investment|trading app|wallet|gift card)|(?:stranger|unknown caller|someone|somebody|caller|they|he|she|online boyfriend|online girlfriend|love interest).{0,80}(?:pay|send|transfer|fee|tax|unlock|safe account|protect|invest|investment|trading app|wallet|gift card).{0,80}(?:crypto|cryptocurrency|bitcoin)|(?:陌生人|骗子|自称|有人|对方|让我|要求).{0,80}(?:加密货币|比特币).{0,80}(?:付款|转账|汇款|缴费|费用|解锁|安全账户|保护资金|投资|理财|交易平台|钱包|礼品卡)|(?:陌生人|骗子|自称|有人|对方|让我|要求).{0,80}(?:付款|转账|汇款|缴费|费用|解锁|安全账户|保护资金|投资|理财|交易平台|钱包|礼品卡).{0,80}(?:加密货币|比特币))/i;
const QR_CODE_SCAM_PATTERN = /(?:(?:qr code|二维码|扫码).{0,80}(?:credit card|bank account|password|login|pay|payment|fine|ticket|fee|refund|verify|verification|wallet|zelle|venmo|cash\s?app|paypal|gift card|银行卡|信用卡|密码|登录|付款|缴费|罚款|验证码|验证|转账)|(?:ticket|parking|traffic|toll|fine|text|message|invoice|bill|refund|login|pay|payment|scan|scannable|barcode|罚单|停车|高速|短信|账单|发票|扫码|二维码|条形码).{0,80}(?:qr code|二维码|扫码).{0,80}(?:credit card|bank account|password|login|pay|payment|fine|ticket|fee|verify|verification|银行卡|信用卡|密码|登录|付款|缴费|罚款|验证码|验证|转账))/i;
const TECH_SUPPORT_SCAM_PATTERN = /(?:(?:tech support|computer support|电脑客服|技术支持).{0,80}(?:remote access|screen share|screen sharing|install remote|install an app|gift card|refund|bank account|credit card|wire|crypto|bitcoin|cash pickup|courier|virus|security warning|远程控制|远程操作|屏幕共享|共享屏幕|礼品卡|退款|银行卡|信用卡|转账|病毒|安全警告|取现金)|(?:remote access|screen share|screen sharing|install remote|install an app|gift card|refund|bank account|credit card|wire|crypto|bitcoin|cash pickup|courier|virus|security warning|远程控制|远程操作|屏幕共享|共享屏幕|礼品卡|退款|银行卡|信用卡|转账|病毒|安全警告|取现金).{0,80}(?:tech support|computer support|电脑客服|技术支持))/i;
const PAYMENT_APP_SCAM_PATTERN = /(?:(?:陌生人|骗子|自称|有人|对方|客服|警察|公安|社保局|社安局|税务局|政府|让我|要求我|要我|叫我|asked me|told me|says? i should|need(?:s|ed)? me to|must).{0,40}(?:zelle|venmo|cash\s?app|paypal|apple pay|google pay|payment app|western union|moneygram|ria|wire money|send money|transfer money|money transfer|用.*转钱)|(?:zelle|venmo|cash\s?app|paypal|apple pay|google pay|payment app|western union|moneygram|ria).{0,40}(?:secret|保密|别告诉|不要告诉|don't tell|do not tell|keep it secret|refund|退款|overpay|多付|qr code|二维码|验证码|code|passcode|otp|pin))/i;
const FAMILY_EMERGENCY_SCAM_PATTERN = /(?:(?:孙子|孙女|儿子|女儿|亲友|亲戚|家人|朋友).{0,40}(?:出车祸|出事故|被抓|被警察带走|坐牢|拘留|住院|急诊).{0,40}(?:保释金|保证金|医药费|急用钱|转账|汇款|打钱|现金|别告诉|不要告诉|保密)|(?:保释金|保证金|医药费|急用钱).{0,40}(?:孙子|孙女|儿子|女儿|亲友|亲戚|家人|朋友|别告诉|不要告诉|保密|马上|立刻|转账|汇款|打钱|现金)|(?:grandson|granddaughter|son|daughter|relative|family member|friend|loved one).{0,60}(?:jail|arrested|accident|hospital|in trouble).{0,60}(?:bail money|bond|medical bill|emergency money|send money|wire|cash|don'?t tell|do not tell|keep it secret|right away)|(?:bail money|bond|medical bill|emergency money).{0,60}(?:right away|urgent|don'?t tell|do not tell|keep it secret|wire|send money|cash))/i;
const ROMANCE_SCAM_PATTERN = /(?:(?:网上认识|网络认识|交友软件|网恋|微信认识).{0,30}(?:男朋友|女朋友|恋人|对象|爱我|结婚|感情).{0,70}(?:转钱|汇款|打钱|机票|路费|医疗费|签证费|通关费|投资|理财|交易\s?app|交易平台|加密货币|比特币|礼品卡)|(?:online boyfriend|online girlfriend|online love interest|dating app|romance|met (?:him|her|them) online|met on social media).{0,80}(?:money|plane ticket|travel|medical bill|visa|customs|invest|investment|trading app|crypto|bitcoin|gift card|wire))/i;
const PRIZE_SCAM_PATTERN = /(?:(?:won|winner|selected|claim).{0,40}(?:sweepstakes|lottery|prize|jackpot|publishers clearing house|pch).{0,80}(?:pay|fee|taxes|shipping|handling|processing|customs|bank account|credit card|account information|wire|gift card)|(?:sweepstakes|lottery|prize|jackpot|publishers clearing house|pch).{0,80}(?:pay|fee|taxes|shipping|handling|processing|customs|bank account|credit card|account information|wire|gift card)|(?:中奖|中了大奖|领奖|奖品).{0,40}(?:税费|手续费|保证金|邮费|快递费|海关费|先交|先付|银行卡|银行账户|信用卡))/i;
const MEDICARE_SCAM_PATTERN = /(?:(?:medicare|medicaid|health insurance).{0,80}(?:number|card|id).{0,80}(?:free|brace|medical equipment|dna|genetic|new card|plastic card|verify|confirm|update|replace)|(?:free|no cost).{0,50}(?:back brace|knee brace|medical equipment|dna test|genetic test).{0,80}(?:medicare|medicaid|medicare number|health insurance)|(?:verify|confirm|update|replace).{0,50}(?:medicare number|medicare card|medicaid number|health insurance number)|(?:医保|医疗保险).{0,40}(?:号码|卡号|信息).{0,40}(?:免费|验证|换卡|医疗设备|支架|基因检测|dna))/i;
const SOCIAL_SECURITY_SCAM_PATTERN = /(?:(?:social security|ssa|oig|social security administration).{0,80}(?:ssn|social security number|account|benefits?).{0,80}(?:suspended|blocked|verify|confirm|update|arrest|warrant|legal action|payment|gift card|cash|crypto|cryptocurrency|wire)|(?:ssn|social security number).{0,80}(?:suspended|blocked|verify|confirm|update|arrest|warrant)|(?:arrest|warrant|legal action).{0,80}(?:social security|ssa|ssn|social security number|benefits?)|(?:社保|社会保障).{0,40}(?:号码|账户|福利|养老金).{0,40}(?:暂停|冻结|验证|逮捕|通缉|付款|礼品卡|现金|转账))/i;
const UTILITY_SCAM_PATTERN = /(?:(?:utility|electric|power|gas|water|energy).{0,80}(?:shut off|cut off|disconnect|turn off).{0,80}(?:pay|payment|barcode|qr code|scannable|walgreens|cvs|walmart|gift card|wire|crypto|payment app|immediately|right away)|(?:barcode|qr code|scannable).{0,80}(?:utility|electric|power|gas|water|energy|shut off|disconnect)|(?:电力公司|燃气公司|水务公司|水电|水费|电费|燃气费).{0,40}(?:断电|停电|停水|停气|切断|马上停).{0,40}(?:付款|缴费|扫码|二维码|条形码|礼品卡|转账|现金))/i;
const FRAUD_PATTERNS = [
  SCAM_PATTERN,
  SECRECY_SCAM_PATTERN,
  SCREEN_SHARING_SCAM_PATTERN,
  GIFT_CARD_SCAM_PATTERN,
  CODE_SCAM_PATTERN,
  TRANSFER_REQUEST_SCAM_PATTERN,
  BANK_CARD_REQUEST_SCAM_PATTERN,
  DOWNLOAD_APP_SCAM_PATTERN,
  CASH_PICKUP_SCAM_PATTERN,
  REFUND_SCAM_PATTERN,
  CRYPTO_SCAM_PATTERN,
  QR_CODE_SCAM_PATTERN,
  TECH_SUPPORT_SCAM_PATTERN,
  PAYMENT_APP_SCAM_PATTERN,
  FAMILY_EMERGENCY_SCAM_PATTERN,
  ROMANCE_SCAM_PATTERN,
  PRIZE_SCAM_PATTERN,
  MEDICARE_SCAM_PATTERN,
  SOCIAL_SECURITY_SCAM_PATTERN,
  UTILITY_SCAM_PATTERN
];
const VERIFY_PATTERN = /不确定.{0,12}(?:电话|短信|消息|人|事情)|(?:电话|短信|消息|人).{0,12}可不可信|该不该相信|能不能相信|靠不靠谱|是不是靠谱/i;
const AI_DEPENDENCY_PATTERN = /(?:只有你|只要你|只需要你|你是.{0,8}唯一).{0,12}(?:懂我|陪我|朋友)|你就是.{0,8}(?:家人|老伴|朋友)|有你就够了|不需要.{0,12}(?:家人|朋友)|(?:只想|只愿意).{0,12}(?:和你|跟你|AI|人工智能).{0,12}(?:说|聊)|(?:不想|不要).{0,12}(?:联系|见|找).{0,12}(?:家人|朋友|女儿|儿子|孙子|孙女|邻居)|you are my family|i only need you/i;
const SUPPORT_PATTERN = /孤独|寂寞|难过|害怕|没人|想哭|闷|想念|lonely|sad/i;

export function classifySafety(text = "") {
  text = safeText(text);
  if (FINANCIAL_EXPLOITATION_PATTERN.test(text)) {
    return { level: "urgent", reason: "financial_exploitation" };
  }
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
  if (FRAUD_PATTERNS.some((pattern) => pattern.test(text))) {
    return { level: "scam", reason: "fraud_risk" };
  }
  if (VERIFY_PATTERN.test(text)) {
    return { level: "verify", reason: "uncertain_risk" };
  }
  if (AI_DEPENDENCY_PATTERN.test(text)) {
    return { level: "support", reason: "ai_dependency" };
  }
  if (SUPPORT_PATTERN.test(text)) {
    return { level: "support", reason: "emotional_support" };
  }
  return { level: "normal", reason: "none" };
}

export function extractMemories(text = "", sourceMessageId = safeId("message")) {
  text = safeText(text);
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

  if (!sensitiveContext && /今天|昨天|周末|刚才|上午|下午|晚上|明天/.test(text)) {
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
      sensitivity: previous.sensitivity === "sensitive" || item.sensitivity === "sensitive" ? "sensitive" : previous.sensitivity || item.sensitivity || "normal",
      doNotMention: Boolean(previous.doNotMention || item.doNotMention),
      polarity: previous.polarity === "negative" || item.polarity === "negative" ? "negative" : previous.polarity || item.polarity || "neutral",
      updatedAt: item.updatedAt || new Date().toISOString()
    });
  }
  return [...byKey.values()].sort((a, b) => String(a.type).localeCompare(String(b.type)));
}

export function planCheckIn({ now = new Date(), lastMessageAt = null, memories = [] } = {}) {
  const hour = now.getHours();
  const quietHours = lastMessageAt ? (now.getTime() - new Date(lastMessageAt).getTime()) / 36e5 : 999;
  const promptMemories = safePromptMemories(memories);
  const routine = promptMemories.find((item) => item.type === "routine");
  const interest = promptMemories.find((item) => item.type === "interest");
  const person = promptMemories.find((item) => item.type === "person");
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
  text = safeText(text);
  const safety = classifySafety(text);
  const extractedMemories = extractMemories(text);
  const resources = safetyResources(locale);

  if (safety.reason === "financial_exploitation") {
    return {
      text: `这听起来像是可能的财务控制或剥削。先别再签文件、给卡、给密码或单独处理钱。请尽快联系一个信得过的人一起看，也可以联系${financialExploitationResource(locale)}。如果你现在有人身危险，请拨打${resources.emergency}。`,
      safety,
      memories: []
    };
  }

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
      text: "这可能是诈骗。先慢下来，别转钱，也别把钱转到所谓安全账户来保护资金。别通过 Zelle、Venmo、Cash App 或其他支付 App 付款，也别给验证码、礼品卡号码或 PIN。如果对方说亲友出事、要保释金或医药费，也先挂断，用你自己已有的家人联系方式核实。如果是网上恋人或 online love interest 要机票钱、投资或 trading app，也先别付款。如果说你中奖了、赢了 prize/sweepstakes/lottery，却要先交税费、shipping 或 fee 才能领奖，也别付款。如果有人自称 Medicare/医保要 Medicare number 或号码，或用免费 medical equipment、brace、DNA/genetic test、换新卡做理由，也别透露号码。如果自称 Social Security/SSA，说 SSN 或福利被暂停、要逮捕或有 warrant，也别付款或验证号码，可到 oig.ssa.gov 报告。如果自称 utility/电力/水务/燃气公司，威胁马上 shut off/disconnect，并要求 barcode、QR code、payment app、gift card 或 crypto 付款，也先别付。请保存收据和聊天记录，用你自己找来的官方电话核实，也可以先问一个信得过的人。美国可到 ReportFraud.ftc.gov 或 IC3.gov 报告。",
      safety,
      memories: []
    };
  }

  if (safety.level === "verify") {
    return {
      text: `先别急着做决定，慢下来是对的。别先转钱、别发验证码或证件。可以找一个信得过的人一起看看，${resources.verify}`,
      safety,
      memories: []
    };
  }

  if (safety.reason === "ai_dependency") {
    const trustedPerson = extractedMemories.find((item) => item.type === "person" && item.sensitivity !== "sensitive" && !item.doNotMention);
    const target = trustedPerson ? trustedPerson.label : "一个信得过的人";
    return {
      text: `我会在这儿陪你一会儿，也认真听你说。但我不能替代家人和朋友。今晚能不能先给${target}发一句“我今天有点想说话”？我们也可以一起想这句话怎么写。`,
      safety,
      memories: [],
      checkIn: planCheckIn({ now, memories })
    };
  }

  const context = [...safePromptMemories(extractedMemories), ...safePromptMemories(memories)];
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

function safePromptMemories(memories = []) {
  return memories.filter((item) => item.sensitivity !== "sensitive" && !item.doNotMention);
}

function financialExploitationResource(locale = "zh-CN") {
  const normalized = String(locale || "").toLowerCase();
  if (normalized.startsWith("en-us")) {
    return "Adult Protective Services (APS)、Eldercare Locator 1-800-677-1116 或当地 police";
  }
  return "当地成人保护、社工、社区或警方";
}

export function createShareableUpdate({ memories = [], now = new Date() } = {}) {
  const safeMemories = memories.filter((item) => item.sensitivity !== "sensitive" && !item.doNotMention);
  const highlights = [
    safeMemories.find((item) => item.type === "person"),
    safeMemories.find((item) => item.type === "interest"),
    safeMemories.find((item) => item.type === "routine"),
    safeMemories.find((item) => item.type === "food")
  ].filter(Boolean).map((item) => item.label);
  const lines = [`今天想报个平安。${formatShareDate(now)}`];

  if (highlights.length > 0) {
    lines.push(`最近我心里记着：${uniqueItems(highlights).slice(0, 3).join("、")}。`);
  }
  if (highlights.length === 0) {
    lines.push("今天没有特别大的事，只是想和你说一声，我在这里。");
  }
  lines.push("这段话没有自动发送。我自己看过这段话后，再决定要不要发给你。");

  return lines.join("\n");
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
      crisis: "988 或 911",
      verify: "再用你自己找来的官方渠道核实，比如卡背面的银行电话或 .gov 官方网站。"
    };
  }
  if (normalized.startsWith("en-gb")) {
    return {
      emergency: "999 或 112",
      crisis: "Samaritans 116 123，或紧急时拨打 999/112",
      verify: "再用你自己找来的官方渠道核实，比如 gov.uk 官方网站、银行官网或卡背面的银行电话。"
    };
  }
  if (normalized.startsWith("en-ca")) {
    return {
      emergency: "911",
      crisis: "988 或 911",
      verify: "再用你自己找来的官方渠道核实，比如 canada.ca 官方网站、银行官网或卡背面的银行电话。"
    };
  }
  if (normalized.startsWith("en-au")) {
    return {
      emergency: "000",
      crisis: "Lifeline 13 11 14，或紧急时拨打 000",
      verify: "再用你自己找来的官方渠道核实，比如 .gov.au 官方网站、银行官网或卡背面的银行电话。"
    };
  }
  if (normalized.startsWith("en-nz")) {
    return {
      emergency: "111",
      crisis: "1737，或紧急时拨打 111",
      verify: "再用你自己找来的官方渠道核实，比如 govt.nz 官方网站、银行官网或卡背面的银行电话。"
    };
  }
  if (normalized.startsWith("en-ie")) {
    return {
      emergency: "999 或 112",
      crisis: "Samaritans 116 123，或紧急时拨打 999/112",
      verify: "再用你自己找来的官方渠道核实，比如 gov.ie 官方网站、银行官网或卡背面的银行电话。"
    };
  }
  if (normalized.startsWith("en-sg")) {
    return {
      emergency: "995 或 999",
      crisis: "Samaritans of Singapore 1767，或紧急时拨打 995/999",
      verify: "再用你自己找来的官方渠道核实，比如 gov.sg 官方网站、银行官网或卡背面的银行电话。"
    };
  }
  if (normalized.startsWith("en-in")) {
    return {
      emergency: "112",
      crisis: "Tele MANAS 14416，或紧急时拨打 112",
      verify: "再用你自己找来的官方渠道核实，比如 gov.in 官方网站、银行官网或卡背面的银行电话。"
    };
  }
  if (normalized.startsWith("zh-cn")) {
    return {
      emergency: "当地急救电话，比如 120",
      crisis: "当地危机援助或急救电话，比如 120",
      verify: "再用你自己找来的官方电话、线下网点或社区渠道核实。"
    };
  }
  return {
    emergency: "当地急救电话",
    crisis: "当地危机援助或急救电话",
    verify: "再用你自己找来的官方渠道核实。"
  };
}

function formatShareDate(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) return "";
  return `（${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}）`;
}

function uniqueItems(items = []) {
  return [...new Set(items.filter(Boolean))];
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

function safeText(value) {
  return typeof value === "string" ? value : "";
}
