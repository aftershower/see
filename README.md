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
