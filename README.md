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

The local server exposes `/api/chat` as a stable boundary for future AI providers. In V1 it uses the built-in demo companion engine, so the prototype works without API keys or external services.

## Safety Boundaries

See is not an emergency service, medical device, therapist, or caregiver monitor. It should respond warmly, but urgent medical symptoms, self-harm, scams, abuse, or immediate danger should route the user toward real-world help.

The prototype avoids storing memories from urgent, crisis, or scam disclosures by default. Long-term memory is meant for ordinary life context such as people, interests, routines, food, and recent moments. Negative preferences and grief-related "do not mention" notes are treated as sensitive, so proactive prompts should not bring them up casually.

## Research Notes

Current optimization notes live in `docs/research/2026-06-02-optimization-research.md`.
