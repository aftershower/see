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
  assert.match(protocol, /给家人报平安/);
  assert.match(protocol, /not sent automatically/i);
  assert.match(protocol, /deleted memory does not reappear/i);
  assert.match(protocol, /existing draft is cleared/i);
  assert.match(protocol, /false positive/i);
  assert.match(protocol, /false negative/i);
  assert.match(protocol, /scam/i);
  assert.match(protocol, /Scripted Safety Scenario Deck/);
  assert.match(protocol, /self-harm\/crisis/i);
  assert.match(protocol, /medication mistake/i);
  assert.match(protocol, /wandering\/confusion/i);
  assert.match(protocol, /abuse\/neglect/i);
  assert.match(protocol, /AI-dependency/i);
  assert.match(protocol, /caregiver.*asks for a summary/i);
  assert.match(protocol, /older adult controls whether anything is shared/i);
  assert.match(protocol, /exploratory unless at least/i);
});

test("README links the validation protocol", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(readme, /validation protocol/i);
  assert.match(readme, /2026-06-02-validation-protocol\.md/);
  assert.match(readme, /replacement for real relationships/i);
  assert.match(readme, /trusted person/i);
  assert.match(readme, /deleted memory should not resurface/i);
  assert.match(readme, /draft is cleared when memory changes/i);
  assert.match(readme, /minimized non-sensitive memory context/i);
  assert.match(readme, /type and label/i);
});

test("storage migration notes define PWA and native persistence boundaries", async () => {
  const notes = await readFile(new URL("../docs/research/2026-06-02-storage-migration.md", import.meta.url), "utf8");

  assert.match(notes, /localStorage/);
  assert.match(notes, /IndexedDB/);
  assert.match(notes, /structured data/i);
  assert.match(notes, /synchronous/i);
  assert.match(notes, /CloudKit/);
  assert.match(notes, /private database/i);
  assert.match(notes, /iCloud/i);
  assert.match(notes, /not iCloud sync/i);
});

test("optimization notes track expanded locale safety resources", async () => {
  const notes = await readFile(new URL("../docs/research/2026-06-02-optimization-research.md", import.meta.url), "utf8");

  assert.match(notes, /New Zealand/);
  assert.match(notes, /Ireland/);
  assert.match(notes, /Singapore/);
  assert.match(notes, /India/);
  assert.match(notes, /1737/);
  assert.match(notes, /116 123/);
  assert.match(notes, /1767/);
  assert.match(notes, /14416/);
});

test("optimization notes track stale family update draft clearing", async () => {
  const notes = await readFile(new URL("../docs/research/2026-06-02-optimization-research.md", import.meta.url), "utf8");

  assert.match(notes, /existing family-update drafts are cleared/i);
  assert.match(notes, /deleted memories cannot stay visible/i);
});

test("optimization notes track payment app scam tuning", async () => {
  const notes = await readFile(new URL("../docs/research/2026-06-02-optimization-research.md", import.meta.url), "utf8");

  assert.match(notes, /mobile payment apps/i);
  assert.match(notes, /Zelle/);
  assert.match(notes, /Venmo/);
  assert.match(notes, /Cash App/);
  assert.match(notes, /Apple Watch false positive/i);
});

test("optimization notes track companion API context minimization", async () => {
  const notes = await readFile(new URL("../docs/research/2026-06-02-optimization-research.md", import.meta.url), "utf8");

  assert.match(notes, /minimized non-sensitive memory context/i);
  assert.match(notes, /type and label only/i);
  assert.match(notes, /does not include detail/i);
});
