# Elder Companion Optimization Research - 2026-06-02

## Sources Checked

- NYSOFA's 2026 ElliQ update reports older-adult engagement and loneliness outcomes: average client age 75, 41 interactions per day, 4.6/5 satisfaction, 94% saying they feel less lonely, and 97% reporting they feel better overall. Source: https://aging.ny.gov/system/files/documents/2026/02/nysofa-elliq-project-update-2026.pdf
- AARP's 2026 technology trends survey says privacy, trust, and data security are major barriers for older adults considering AI tools, and that many adults 50+ do not feel technology is designed with their age in mind. Source: https://www.aarp.org/pri/topics/technology/internet-media-devices/2026-technology-trends-older-adults/
- NIST's Privacy Framework describes privacy risk management around data processing, including how individuals can understand and exercise choices about data collection, use, retention, disclosure, and deletion. Source: https://www.nist.gov/privacy-framework
- OWASP API Security Top 10 2023 API3 covers broken object property-level authorization, including excessive data exposure and mass assignment risks, and recommends cherry-picking only the object properties an endpoint needs. Source: https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/
- WHO frames loneliness and social isolation among older people as public-health concerns and notes that digital and face-to-face interventions can help when they strengthen social connection. Source: https://www.who.int/activities/reducing-social-isolation-and-loneliness-among-older-people
- NIH/NIA guidance emphasizes staying connected with family, friends, shared interests, activities, and community; it also distinguishes loneliness from social isolation. Source: https://magazine.medlineplus.gov/article/stay-connected-tips-from-the-national-institute-on-aging-for-combating-social-isolation-and-loneliness/
- WCAG 2.2 adds guidance relevant to older users, including target size, visible focus, and support for low-vision, cognitive, and mobile accessibility. Source: https://www.w3.org/TR/WCAG22/
- FTC guidance says gift card, PIN, urgent-payment, government-impersonation, tech-support, and "do not tell anyone" payment requests should be treated as scams, and reports can be filed at ReportFraud.ftc.gov. Source: https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams
- FTC guidance on mobile payment apps says scammers may try to trick people into sending money through apps such as Venmo, Cash App, or PayPal, and that mobile payment app scam reports can go to ReportFraud.ftc.gov. Source: https://consumer.ftc.gov/articles/mobile-payment-apps-how-avoid-scam-when-you-use-one
- AARP's long-term-care AI guidance warns that AI tools for older adults need guardrails for errors, bias, privacy vulnerabilities, and overreliance. Source: https://www.aarp.org/pri/topics/ltss/artificial-intelligence-long-term-care/
- MIT Media Lab's AI companionship research argues that chatbots should complement, not replace, human connections. Source: https://www-prod.media.mit.edu/publications/chatbot-companionship-loneliness-study/
- A 2026 Psychological Science longitudinal study reports that lower perceived social connection predicted later social chatbot use, so companion products should avoid deepening substitution patterns. Source: https://journals.sagepub.com/doi/10.1177/09567976261427747
- Apple CloudKit private databases are user-owned iCloud storage: only the user can access private database content by default, it requires an iCloud account for writes, and it counts toward the user's iCloud quota. Source: https://developer.apple.com/documentation/cloudkit/ckcontainer/privateclouddatabase
- Apple's Speech framework supports recognizing spoken words from recorded or live audio, which keeps a future native iOS path open for tap-to-start voice capture without committing the PWA to continuous listening. Source: https://developer.apple.com/documentation/speech/
- MDN documents `navigator.clipboard.writeText()` as a browser Clipboard API method for writing text in secure contexts, which fits a user-click copy flow without adding a server-side sharing channel. Source: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
- UK official guidance lists 999 and 112 as national emergency numbers. Source: https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers
- Samaritans lists 116 123 as its UK/Ireland freephone support number. Source: https://www.samaritans.org/how-we-can-help/contact-samaritan/
- Canada 9-8-8 is the national suicide crisis helpline. Source: https://988.ca/
- Australian government emergency guidance points to Triple Zero 000 for life-threatening emergencies, and Lifeline publishes 13 11 14 for crisis support. Sources: https://www.studyaustralia.gov.au/en/life-in-australia/safety-in-australia/emergencies.html and https://www.lifeline.org.au/get-help/national-services/lifeline-crisis-support
- New Zealand Police lists 111 for emergencies, and Health New Zealand lists 1737 for free 24/7 mental-health support. Sources: https://www.police.govt.nz/111-txt and https://info.health.nz/mental-health/mental-health-conditions/suicide-prevention?stage=Live
- Ireland's official emergency service lists 112 and 999 as emergency numbers, and Samaritans provides 116 123 for Ireland/UK crisis support. Sources: https://www.112.ie/ and https://www.samaritans.org/how-we-can-help/contact-samaritan/
- Singapore official emergency guidance lists 995 for ambulance/fire and 999 for police, while Singapore's Ministry of Health lists Samaritans of Singapore 1767 for suicide prevention support. Sources: https://www.gov.sg/contact-us/ and https://www.moh.gov.sg/seeking-healthcare/find-a-facility-or-service/mental-health-services/
- India's official ERSS service uses 112 for emergencies, and an official Press Information Bureau note describes Tele MANAS as a nationwide toll-free helpline at 14416. Sources: https://112.gov.in/ and https://static.pib.gov.in/WriteReadData/specificdocs/documents/2024/oct/doc20241013415701.pdf

## Product Direction

The strongest lane is not a roleplay companion or AI replacement friend. It is a quiet, respectful, text-first companion that helps older adults feel seen and reconnect with real people.

For a future native iOS version, the most coherent sync story is CloudKit private database storage rather than a custom account backend. That matches the product's privacy promise, but still requires explicit handling for missing iCloud accounts, user storage quota, migration, and restore.

## Optimizations Applied In This Batch

- Risky urgent, crisis, and scam disclosures no longer become long-term memories.
- Scam routing now includes a clearer pause-and-verify script with gift card/PIN/receipt/official-reporting language.
- Quiet-period check-ins now suggest real-world contact, such as calling or messaging a known person.
- The UI now displays a visible privacy note near memory.
- Individual memories can be deleted instead of requiring all-or-nothing reset.
- Negative preferences are stored as preferences instead of interests.
- Grief and "do not mention" memories are marked sensitive and skipped by proactive prompts.
- The local static server now allowlists public assets and does not expose source, tests, or docs.
- Safety routing now also catches medication mistakes, wandering/confusion, abuse/neglect language, remote tech-support scams, courier cash pickup, and "do not tell family" scam pressure.
- The browser app now sends chats through `/api/chat` with a timeout and local fallback, keeping the UI aligned with the future AI-provider boundary.
- The message stream now uses `role="log"`, announces additions only, and avoids rebuilding the entire live region on every render.
- The local server now enforces POST+JSON for `/api/chat`, returns method/media-type errors, adds browser-hardening headers, and marks API responses `no-store`.
- Users can now export local companion data as JSON, import a previous JSON export, trim old chat history while keeping long-term memory, and see visible success or warning feedback for each privacy action.
- Urgent and crisis replies now use locale-aware emergency resources, with the browser passing `navigator.language` through `/api/chat` and the local fallback.
- Safety routing now also catches fake-agency app downloads, screen-sharing pressure, secrecy demands, suspicious links, identity-document coercion, and "not allowed to leave" abuse signals.
- A validation protocol now defines pilot tasks and metrics for elder-reader usability, loneliness/support outcomes, privacy trust, caregiver consent boundaries, and safety false positive/false negative review.
- Local import restore now normalizes imported records and merges older exports with newer local conversations instead of replacing newer data.
- Scam detection now avoids broad false positives for ordinary family photo links and routine identity-document errands while still catching suspicious links and requests for ID photos.
- Non-emergency uncertainty now routes to a `verify` response that tells the user to slow down, avoid sending money/codes/documents, ask a trusted person, and use official channels.
- `verify` responses now include locale-aware official-channel examples, such as card-back bank phone numbers and `.gov` sites for US users, or official phone/branch/community channels for China users.
- Locale safety profiles now include UK, Canada, Australia, New Zealand, Ireland, Singapore, and India emergency/crisis resources in addition to US, China, and a generic fallback.
- Storage migration notes now separate the current localStorage prototype from the future IndexedDB PWA path and native CloudKit private-database sync path.
- A new "给家人报平安" flow creates a local, editable, user-copied update instead of a caregiver dashboard or automatic send. It rechecks candidate messages with safety routing and excludes urgent, crisis, scam, verify, support, sensitive, and "do not mention" content.
- AI-dependency language now routes to a support response that validates the feeling, says See cannot replace family or friends, suggests one small trusted-person contact, and avoids saving that dependency disclosure as memory.
- Family update drafts now use only the current non-sensitive memory list, not raw chat text, so deleting a memory prevents it from resurfacing in a share draft.
- Existing family-update drafts are cleared when memories are deleted, imports are applied, the record is reset, or new chat updates memory, so deleted memories cannot stay visible in stale copy text.
- Scam routing now covers mobile payment apps and payment services such as Zelle, Venmo, Cash App, PayPal, payment app, Western Union, MoneyGram, OTP/passcodes, QR-code/refund scams, and six-digit SMS codes.
- Scam routing avoids an Apple Watch false positive by treating Apple as risky only in gift-card/PIN-style contexts instead of flagging every ordinary Apple device mention.
- Sensitive "do not mention" and grief memories now escalate existing duplicate memories to sensitive/do-not-mention, and sensitive grief text is not stored as a normal recent event.
- `/api/chat` requests now use a minimized non-sensitive memory context with type and label only; the request does not include detail, source message IDs, timestamps, or sensitive/do-not-mention memories.
- `/api/chat` now also enforces the same minimization server-side: it accepts a maximum of 8 valid non-sensitive memory items and strips each item down to type and label only before generating a reply, matching the OWASP API Security Top 10 guidance to avoid over-broad object properties at API boundaries.
- Deleted-memory tombstones are exported, imported, and used during local merge so older imports cannot resurrect deleted memories.
- An automatic raw chat retention cap keeps only the most recent 12 messages while long-term memory remains separate, including loaded legacy localStorage records.
- Scam false-positive tuning now avoids a shopping false positive from bare `pin` matching and avoids flagging routine government or benefits-office visits without payment/code pressure.

## Next Optimization Backlog

1. Deepen safety and localization:
   - expand locale profiles beyond current US/UK/Canada/Australia/New Zealand/Ireland/Singapore/India/China/default handling
   - keep collecting false positive/false negative examples from pilot sessions
   - tune `verify` examples after pilot sessions show which institutions older adults actually ask about

2. Improve product validation:
   - run the validation protocol with 5 to 8 older adults
   - convert observed blockers into product changes
   - test whether older adults understand that "给家人报平安" is editable, copied by choice, and not sent automatically
   - test whether deleted memories stay absent from "给家人报平安" drafts
   - test whether stale "给家人报平安" drafts disappear after memory/import/reset changes
   - use the scripted safety scenario deck to cover scam, self-harm/crisis, medication mistake, wandering/confusion, abuse/neglect, AI-dependency, and caregiver-consent boundaries
   - add scripted AI-dependency prompts to check that See nudges toward human connection without shaming the user

3. Strengthen local persistence:
   - implement IndexedDB only after pilot usage proves localStorage is too small or too blocking
   - prototype native CloudKit only after cross-device continuity is a validated requirement
   - define cross-device conflict behavior for future CloudKit sync
