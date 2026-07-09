import assert from "node:assert/strict";
import { test } from "node:test";
import { ShellChrome } from "./chrome.ts";

const makeChrome = () => {
  const log: string[] = [];
  const host = {
    notify: (text: string) => void log.push(`notify:${text}`),
    exit: () => void log.push("exit"),
    tui: () => ({}) as never,
    session: () => undefined,
    refreshFooter: () => {},
    settings: () => ({ theme: "dark" as const, showImages: false, autoResizeImages: true, blockImages: false, editorPaddingX: 0, autocompleteMaxVisible: 5 }),
    setSetting: async () => ({ theme: "dark" as const, showImages: false, autoResizeImages: true, blockImages: false, editorPaddingX: 0, autocompleteMaxVisible: 5 }),
    applyTheme: () => {},
  };
  const chrome = new ShellChrome(host);
  return { chrome, log };
};

test("handles builtin commands and reports consumption", async () => {
  const { chrome, log } = makeChrome();
  assert.equal(await chrome.handle("/quit"), true);
  assert.deepEqual(log, ["exit"]);
});

test("unknown slash command notifies with a friendly error and consumes", async () => {
  const { chrome, log } = makeChrome();
  assert.equal(await chrome.handle("/nonexistent"), true);
  assert.equal(log.length, 1);
  assert.match(log[0]!, /notify:.*\/nonexistent/);
});

test("plain prompts are not consumed", async () => {
  const { chrome, log } = makeChrome();
  assert.equal(await chrome.handle("tell me about /quit"), false);
  assert.deepEqual(log, []);
});

test("autocomplete lists slash commands with descriptions", async () => {
  const { chrome } = makeChrome();
  const provider = chrome.autocomplete(process.cwd());
  const suggestions = await provider.getSuggestions(["/qu"], 0, 3, { signal: new AbortController().signal });
  assert.ok(suggestions);
  assert.ok(suggestions.items.some((item) => item.value === "quit" && item.description));
});

test("autocomplete still completes file paths", async () => {
  const { chrome } = makeChrome();
  const provider = chrome.autocomplete(process.cwd());
  const suggestions = await provider.getSuggestions(["read ./package.js"], 0, 18, { signal: new AbortController().signal });
  assert.ok(suggestions);
  assert.ok(suggestions.items.some((item) => item.value.includes("package.json")));
});
