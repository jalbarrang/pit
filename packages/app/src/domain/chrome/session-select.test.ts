import assert from "node:assert/strict";
import { test } from "node:test";
import { formatAge, sessionSelectItems } from "./session-select.ts";

const now = new Date("2026-07-08T12:00:00Z");
const sessions = [
  { path: "/s/old.jsonl", id: "old", firstMessage: "fix the parser bug in the tokenizer module please", modified: new Date("2026-07-01T12:00:00Z"), messageCount: 12 },
  { path: "/s/new.jsonl", id: "new", name: "chrome work", firstMessage: "plan chrome", modified: new Date("2026-07-08T11:30:00Z"), messageCount: 40 },
];

test("sessions sort by modified desc, label from name or first message", () => {
  const { items } = sessionSelectItems(sessions, undefined, now);
  assert.deepEqual(items.map((item) => item.value), ["/s/new.jsonl", "/s/old.jsonl"]);
  assert.equal(items[0]!.label, "chrome work");
  assert.match(items[1]!.label, /^fix the parser bug/);
});

test("description carries message count and age; current session is marked", () => {
  const { items, initialIndex } = sessionSelectItems(sessions, "/s/new.jsonl", now);
  assert.match(items[0]!.description ?? "", /40 msgs · 30m ago · current/);
  assert.match(items[1]!.description ?? "", /12 msgs · 7d ago/);
  assert.equal(initialIndex, 0);
});

test("long first messages are truncated for the label", () => {
  const long = [{ path: "/s/x.jsonl", id: "x", firstMessage: "a".repeat(100), modified: now, messageCount: 1 }];
  const { items } = sessionSelectItems(long, undefined, now);
  assert.ok(items[0]!.label.length <= 61);
  assert.match(items[0]!.label, /…$/);
});

test("formatAge buckets", () => {
  assert.equal(formatAge(new Date(now.getTime() - 30_000), now), "just now");
  assert.equal(formatAge(new Date(now.getTime() - 5 * 60_000), now), "5m ago");
  assert.equal(formatAge(new Date(now.getTime() - 3 * 3_600_000), now), "3h ago");
  assert.equal(formatAge(new Date(now.getTime() - 2 * 86_400_000), now), "2d ago");
});
