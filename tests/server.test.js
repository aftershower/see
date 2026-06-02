import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../server.js";

async function withServer(assertions) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await assertions(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("health endpoint reports ready", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });
});

test("chat endpoint returns companion reply without external services", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "我女儿小玲今天来看我。", memories: [] })
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.match(payload.text, /小玲|惦记|聊/);
    assert.ok(payload.memories.some((item) => item.type === "person" && item.label.includes("小玲")));
  });
});

test("static server returns the app shell", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/`);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /陪你聊聊/);
    assert.match(response.headers.get("content-type"), /text\/html/);
  });
});

test("static server does not expose source, tests, docs, or malformed paths", async () => {
  await withServer(async (baseUrl) => {
    const sourceResponse = await fetch(`${baseUrl}/tests/server.test.js`);
    const docsResponse = await fetch(`${baseUrl}/docs/research/2026-06-02-optimization-research.md`);
    const malformedResponse = await fetch(`${baseUrl}/%E0%A4%A`);

    assert.equal(sourceResponse.status, 404);
    assert.equal(docsResponse.status, 404);
    assert.equal(malformedResponse.status, 400);
  });
});
