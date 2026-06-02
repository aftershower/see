# Elder Companion Optimization Research - 2026-06-02

## Sources Checked

- NYSOFA's 2026 ElliQ update reports older-adult engagement and loneliness outcomes: average client age 75, 41 interactions per day, 4.6/5 satisfaction, 94% saying they feel less lonely, and 97% reporting they feel better overall. Source: https://aging.ny.gov/system/files/documents/2026/02/nysofa-elliq-project-update-2026.pdf
- AARP's 2026 technology trends survey says privacy, trust, and data security are major barriers for older adults considering AI tools, and that many adults 50+ do not feel technology is designed with their age in mind. Source: https://www.aarp.org/pri/topics/technology/internet-media-devices/2026-technology-trends-older-adults/
- WHO frames loneliness and social isolation among older people as public-health concerns and notes that digital and face-to-face interventions can help when they strengthen social connection. Source: https://www.who.int/activities/reducing-social-isolation-and-loneliness-among-older-people
- NIH/NIA guidance emphasizes staying connected with family, friends, shared interests, activities, and community; it also distinguishes loneliness from social isolation. Source: https://magazine.medlineplus.gov/article/stay-connected-tips-from-the-national-institute-on-aging-for-combating-social-isolation-and-loneliness/
- WCAG 2.2 adds guidance relevant to older users, including target size, visible focus, and support for low-vision, cognitive, and mobile accessibility. Source: https://www.w3.org/TR/WCAG22/
- FTC guidance says gift card, PIN, urgent-payment, government-impersonation, tech-support, and "do not tell anyone" payment requests should be treated as scams, and reports can be filed at ReportFraud.ftc.gov. Source: https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams
- AARP's long-term-care AI guidance warns that AI tools for older adults need guardrails for errors, bias, privacy vulnerabilities, and overreliance. Source: https://www.aarp.org/pri/topics/ltss/artificial-intelligence-long-term-care/

## Product Direction

The strongest lane is not a roleplay companion or AI replacement friend. It is a quiet, respectful, text-first companion that helps older adults feel seen and reconnect with real people.

## Optimizations Applied In This Batch

- Risky urgent, crisis, and scam disclosures no longer become long-term memories.
- Scam routing now includes a clearer pause-and-verify script with gift card/PIN/receipt/official-reporting language.
- Quiet-period check-ins now suggest real-world contact, such as calling or messaging a known person.
- The UI now displays a visible privacy note near memory.
- Individual memories can be deleted instead of requiring all-or-nothing reset.
- Negative preferences are stored as preferences instead of interests.
- Grief and "do not mention" memories are marked sensitive and skipped by proactive prompts.
- The local static server now allowlists public assets and does not expose source, tests, or docs.

## Next Optimization Backlog

1. Broaden safety routing:
   - medication mistakes
   - gas/fire/wandering/confusion
   - abuse/coercion/neglect
   - crypto, courier pickup, remote tech support, fake agency links
   - locale-configurable emergency resources

2. Improve accessibility:
   - use `role="log"` and `aria-relevant="additions"` for the message stream
   - avoid rebuilding the entire live region on every render
   - add clearer accessible labels for reset and memory deletion

3. Align UI with the API boundary:
   - route chat through `/api/chat` with timeout and local fallback
   - document data flow clearly for local-only vs future AI-provider modes

4. Harden server and privacy:
   - add security headers
   - add retention/export controls
   - add tests for malformed API usage and storage failure
