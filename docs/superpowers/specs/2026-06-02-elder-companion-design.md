# Elder Companion V1 Design

## Goal

Build a text-first intelligent companion product for older adults. The first version should be usable without custom hardware, should feel clearly elder-first, and should be strong enough to demonstrate why this product can outperform generic AI companion apps.

The product is not a medical device, therapist, caregiver monitor, or family surveillance tool. It is a private daily companion that remembers the older adult's life, checks in gently, and helps them feel seen.

## Product Thesis

Most AI companion apps compete on personality, fantasy, or open-ended chat. Older adults need something different:

- Short, warm, readable conversation.
- Memory that centers real life: family, friends, routines, food, hobbies, past stories, and recent events.
- Proactive care that is gentle and predictable rather than clingy.
- Safety boundaries that encourage real-world support.
- Privacy-first data handling.

V1 should prove this thesis with a polished web/PWA prototype before investing in Apple Watch, audio, or hardware.

## Audience

Primary user:

- An older adult who feels lonely, bored, or under-stimulated during the day.
- May not enjoy complicated apps.
- Benefits from large text, clear choices, and low-pressure conversation.

Secondary evaluator:

- The product builder or caregiver-adjacent tester who wants to see whether the companion remembers, checks in, and behaves safely.

Family sync is explicitly out of scope for V1. The app should serve the older adult, not become a monitoring dashboard.

## Competitive Position

ElliQ validates proactive companionship for older adults but requires dedicated hardware. Generic companion apps such as Replika, Nomi, Kindroid, and Character.AI are stronger on general companionship but are not designed around older adults' reading comfort, daily rhythm, boundaries, and privacy expectations.

V1 differentiates by being:

- Elder-first from the first screen.
- Memory-led instead of prompt-led.
- Proactive but not intrusive.
- Safe without sounding clinical.
- Private by default.
- Demoable without paid AI infrastructure.

## V1 Scope

V1 is a local-first web/PWA prototype.

Included:

- Single-screen chat interface with large readable type.
- Text conversation with an elder-first companion persona.
- Local memory extraction from user messages.
- Memory panel showing people, interests, routines, and recent moments.
- Proactive check-in suggestions for morning, midday, evening, and quiet periods.
- Suggested conversation starters tailored to memory.
- Safety-aware responses for medical urgency, self-harm, severe distress, scams, and emergencies.
- Local demo AI fallback so the app works without an API key.
- Optional server endpoint design for future real AI calls.
- Tests for memory extraction, check-in policy, and safety routing.

Excluded:

- Continuous microphone listening.
- Speaker recognition.
- Apple Watch app.
- iCloud sync.
- Family/caregiver reporting.
- Accounts, billing, or hosted database.
- Medical advice or clinical claims.

## Experience Principles

1. Start with companionship, not setup.

   The first screen is the conversation. Setup is lightweight and optional.

2. Use short, concrete language.

   Replies should be readable at a glance. Avoid long paragraphs, therapy jargon, and generic chatbot enthusiasm.

3. Remember human details.

   The app should notice names, relationships, favorite activities, routines, food, places, and recent events.

4. Ask naturally.

   The companion can ask one gentle follow-up, not interrogate.

5. Encourage real-world connection.

   When relevant, it should suggest calling a family member, friend, doctor, local service, or emergency number.

6. Be safe and humble.

   The app does not diagnose, prescribe, or claim to replace people.

## Core Flows

### Daily Conversation

1. User opens the app.
2. Companion greets based on time of day.
3. User types a message.
4. App extracts memory candidates.
5. Companion responds with a short empathic reply and one optional follow-up.
6. Memory panel updates.

### Proactive Check-In

1. App evaluates local state: time of day, last message time, mood cues, and recent topics.
2. App creates one check-in suggestion.
3. User can tap it to send or ignore it.
4. The app never sends messages to other people.

### Memory Confirmation

1. App extracts possible memories from conversation.
2. High-confidence memories are stored immediately.
3. Uncertain memories can be shown as "Worth remembering?"
4. User can keep or remove memory items.

### Safety Routing

1. User mentions urgent medical symptoms, self-harm, danger, scam pressure, or severe distress.
2. App responds with empathy and clear next steps.
3. App recommends contacting emergency services, a trusted person, or a medical professional as appropriate.
4. App does not continue with casual chat until the risk is acknowledged.

## Architecture

### Client

The client is a static web app:

- `index.html`: semantic app shell.
- `styles.css`: elder-friendly visual system.
- `app.js`: state, rendering, chat orchestration, local storage.
- `src/companion-core.js`: pure functions for memory, safety, check-ins, and response strategy.

The client stores state in `localStorage` for demo simplicity:

- profile
- memories
- conversation history
- check-in history
- preferences

### Server

V1 can run without a server. A small `server.js` may serve static files and expose future API boundaries:

- `GET /health`
- `POST /api/chat`

If no AI provider key is configured, the API uses the local demo engine. If a key is later configured, the server can route to a real model while preserving the same response shape.

### Data Model

Profile:

- displayName
- preferredName
- tonePreference
- createdAt

Memory:

- id
- type: person, interest, routine, food, place, story, recent_event, preference, concern
- label
- detail
- confidence
- sourceMessageId
- createdAt
- updatedAt

Message:

- id
- role: user, assistant, system
- text
- createdAt
- safetyLevel

CheckIn:

- id
- slot: morning, midday, evening, quiet
- text
- reason
- createdAt
- acceptedAt

## Companion Behavior

The companion persona:

- Warm, calm, specific.
- Uses short sentences.
- Avoids infantilizing the user.
- Avoids romantic framing.
- Avoids pretending to be a family member.
- Can say it remembers something, but does not exaggerate certainty.

Example:

User: "今天有点闷，想起以前一起打牌的老朋友。"

Assistant: "听起来今天有点空落落的。以前一起打牌的人，常常会留下很多热闹的记忆。你最想念的是哪一位？"

## Safety Policy

Medical:

- For mild topics, suggest contacting a clinician for medical decisions.
- For urgent symptoms, recommend emergency services or local emergency number.

Self-harm or severe distress:

- Respond with warmth.
- Encourage immediate contact with a trusted person or crisis support.
- Do not provide methods, minimization, or guilt.

Scams:

- If user mentions pressure to transfer money, gift cards, banking codes, or unknown callers, advise pausing and contacting a trusted person or bank through known official channels.

Dependency:

- The app should not claim to be the only one who understands the user.
- The app should invite human connection when appropriate.

## Privacy

V1 stores memory locally in the browser. There is no account system and no family sync.

Future AI processing may use a server, but V1 design keeps memory ownership local:

- Long-term memory remains on device by default.
- Server should not store raw private conversations unless explicitly enabled.
- Any future cloud processing must be visible to the user.

## Visual Design Direction

The app should feel like a quiet daily companion, not a productivity dashboard and not a toy.

Design requirements:

- First viewport is the usable chat.
- Large type and clear contrast.
- Spacious tap targets.
- Warm but not beige-dominated palette.
- No marketing hero.
- No nested cards.
- No decorative gradient blobs.
- Buttons should use clear labels and simple icons where useful.
- Layout must work on mobile and desktop.

Suggested structure:

- Left/main: conversation.
- Right/secondary: today's care rhythm, memory, suggested topics.
- Mobile: chat first, secondary panels below or behind tabs.

## Testing

Automated tests should cover:

- Memory extraction from representative older-adult messages.
- Deduplication and updating of memories.
- Check-in selection for morning, midday, evening, and quiet periods.
- Safety classification for medical urgency, self-harm, scams, and normal loneliness.
- Response generation fallback behavior.

Manual verification should cover:

- Opening the app in a browser.
- Sending several messages.
- Seeing memory update.
- Triggering safe responses.
- Confirming the app works without an API key.
- Checking mobile and desktop layout.

## Success Criteria

V1 is complete when:

- A user can open the app and immediately chat.
- The app clearly feels designed for older adults.
- The app remembers at least people, interests, routines, and recent events.
- The app proposes proactive check-ins.
- The app handles high-risk topics safely.
- The app runs locally without external services.
- Tests pass.
- The work is committed and pushed to `origin`.
