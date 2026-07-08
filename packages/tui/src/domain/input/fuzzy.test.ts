import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fuzzyFilter, fuzzyMatch } from "./index.ts";

describe("fuzzyMatch", () => {
  it("matches empty queries and rejects out-of-order text", () => {
    assert.deepEqual(fuzzyMatch("", "anything"), { matches: true, score: 0 });
    assert.equal(fuzzyMatch("abc", "aXbXc").matches, true);
    assert.equal(fuzzyMatch("abc", "cba").matches, false);
  });

  it("scores consecutive and boundary matches better", () => {
    assert.ok(fuzzyMatch("foo", "foobar").score < fuzzyMatch("foo", "f_o_o_bar").score);
    assert.ok(fuzzyMatch("fb", "foo-bar").score < fuzzyMatch("fb", "afbx").score);
  });

  it("matches swapped alpha numeric model tokens", () => {
    assert.equal(fuzzyMatch("codex52", "gpt-5.2-codex").matches, true);
  });
});

describe("fuzzyFilter", () => {
  it("filters and sorts by match quality", () => {
    assert.deepEqual(fuzzyFilter(["apple", "banana", "cherry"], "an", (x) => x), ["banana"]);
    assert.equal(fuzzyFilter(["a_p_p", "app", "application"], "app", (x) => x)[0], "app");
  });

  it("matches slash-separated query tokens", () => {
    const item = { id: "gpt-5.5", provider: "openai-codex" };
    assert.deepEqual(fuzzyFilter([item], "openai-codex/gpt-5.5", (model) => `${model.id} ${model.provider}`), [item]);
  });
});
