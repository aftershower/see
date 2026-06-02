# Elder Companion Optimization Research - 2026-06-02

## Sources Checked

- NYSOFA's 2026 ElliQ update reports older-adult engagement and loneliness outcomes: average client age 75, 41 interactions per day, 4.6/5 satisfaction, 94% saying they feel less lonely, and 97% reporting they feel better overall. Source: https://aging.ny.gov/system/files/documents/2026/02/nysofa-elliq-project-update-2026.pdf
- AARP's 2026 technology trends survey says privacy, trust, and data security are major barriers for older adults considering AI tools, and that many adults 50+ do not feel technology is designed with their age in mind. Source: https://www.aarp.org/pri/topics/technology/internet-media-devices/2026-technology-trends-older-adults/
- WHO frames loneliness and social isolation among older people as public-health concerns and notes that digital and face-to-face interventions can help when they strengthen social connection. Source: https://www.who.int/activities/reducing-social-isolation-and-loneliness-among-older-people
- NIH/NIA guidance emphasizes staying connected with family, friends, shared interests, activities, and community; it also distinguishes loneliness from social isolation. Source: https://magazine.medlineplus.gov/article/stay-connected-tips-from-the-national-institute-on-aging-for-combating-social-isolation-and-loneliness/
- WCAG 2.2 adds guidance relevant to older users, including target size, visible focus, and support for low-vision, cognitive, and mobile accessibility. Source: https://www.w3.org/TR/WCAG22/
- FTC guidance says gift card, PIN, urgent-payment, government-impersonation, tech-support, and "do not tell anyone" payment requests should be treated as scams, and reports can be filed at ReportFraud.ftc.gov. Source: https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams
- AARP's long-term-care AI guidance warns that AI tools for older adults need guardrails for errors, bias, privacy vulnerabilities, and overreliance. Source: https://www.aarp.org/pri/topics/ltss/artificial-intelligence-long-term-care/
- Apple CloudKit private databases are user-owned iCloud storage: only the user can access private database content by default, it requires an iCloud account for writes, and it counts toward the user's iCloud quota. Source: https://developer.apple.com/documentation/cloudkit/ckcontainer/privateclouddatabase
- Apple's Speech framework supports recognizing spoken words from recorded or live audio, which keeps a future native iOS path open for tap-to-start voice capture without committing the PWA to continuous listening. Source: https://developer.apple.com/documentation/speech/

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
- Users can now export local companion data as JSON, import a previous JSON export, trim old chat history while keeping long-term memory, and see a visible warning if browser storage fails.
- Urgent and crisis replies now use locale-aware emergency resources, with the browser passing `navigator.language` through `/api/chat` and the local fallback.
- Safety routing now also catches fake-agency app downloads, screen-sharing pressure, secrecy demands, suspicious links, identity-document coercion, and "not allowed to leave" abuse signals.
- A validation protocol now defines pilot tasks and metrics for elder-reader usability, loneliness/support outcomes, privacy trust, caregiver consent boundaries, and safety false positive/false negative review.
- Local import restore now normalizes imported records and warns before an older export overwrites newer local conversations.
- Scam detection now avoids broad false positives for ordinary family photo links and routine identity-document errands while still catching suspicious links and requests for ID photos.

## Next Optimization Backlog

1. Deepen safety and localization:
   - clearer "ask a trusted person" guidance for non-emergency uncertainty
   - expand locale profiles beyond current US/China/default handling
   - keep collecting false positive/false negative examples from pilot sessions

2. Improve product validation:
   - run the validation protocol with 5 to 8 older adults
   - convert observed blockers into product changes
   - keep caregiver/family summary sharing opt-in and older-adult controlled

3. Strengthen local persistence:
   - consider IndexedDB for larger histories
   - define an iCloud/CloudKit migration path for a native iOS version
   - add merge support for restoring exports without replacing newer local data
