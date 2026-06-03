# See

Text-first elder companion prototype.

## Run

```bash
npm start
```

Open `http://localhost:5173`.

## Test

```bash
npm test
```

## Privacy

V1 stores conversation memory locally in the browser. There is no account system, family dashboard, continuous microphone, or cloud memory service.

The prototype includes basic local-data controls: export the current record as JSON, import a previous export, trim older chat messages while keeping long-term memory, delete a single memory, or clear everything.

The "给家人报平安" control creates a local, editable update that the older adult can review and copy. It does not send anything automatically, does not create a family dashboard, and filters safety-sensitive or "do not mention" content out of the draft.

The browser app sends chats through `/api/chat` as a stable boundary for future AI providers. In V1 the endpoint uses the built-in demo companion engine, and the browser falls back to the same local engine if the request times out or fails.

## Safety Boundaries

See is not an emergency service, medical device, therapist, or caregiver monitor. It should respond warmly, but urgent medical symptoms, medication mistakes, self-harm, scams, abuse, wandering/confusion, or immediate danger should route the user toward real-world help. Urgent and crisis replies use the browser locale when choosing emergency-resource wording.

The prototype avoids storing memories from urgent, crisis, or scam disclosures by default. Long-term memory is meant for ordinary life context such as people, interests, routines, food, and recent moments. Negative preferences and grief-related "do not mention" notes are treated as sensitive, so proactive prompts should not bring them up casually.

## Research Notes

Current optimization notes live in `docs/research/2026-06-02-optimization-research.md`.

The validation protocol for elder-reader usability, loneliness/support outcomes, privacy trust, and safety-review evidence lives in `docs/research/2026-06-02-validation-protocol.md`.

Storage migration notes for localStorage, IndexedDB, and future native CloudKit live in `docs/research/2026-06-02-storage-migration.md`.
