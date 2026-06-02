import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("validation protocol defines elder companion pilot measures", async () => {
  const protocol = await readFile(new URL("../docs/research/2026-06-02-validation-protocol.md", import.meta.url), "utf8");

  assert.match(protocol, /Campaign to End Loneliness Measurement Tool/);
  assert.match(protocol, /ULS-6/);
  assert.match(protocol, /PEMAT/);
  assert.match(protocol, /System Usability Scale|SUS/);
  assert.match(protocol, /consent/i);
  assert.match(protocol, /caregiver/i);
  assert.match(protocol, /false positive/i);
  assert.match(protocol, /false negative/i);
  assert.match(protocol, /scam/i);
});

test("README links the validation protocol", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(readme, /validation protocol/i);
  assert.match(readme, /2026-06-02-validation-protocol\.md/);
});
