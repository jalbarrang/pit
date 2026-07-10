import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clearAll,
  enableAll,
  isEnabled,
  reorder,
  type ScopedState,
  toggle,
  toggleProvider,
} from "./scoped-state.ts";

const U = ["openai/a", "openai/b", "anthropic/c", "anthropic/d"];
const all = (): ScopedState => ({ enabled: null });
const some = (ids: string[]): ScopedState => ({ enabled: ids });

describe("isEnabled", () => {
  it("null enables every universe id only", () => {
    for (const id of U) assert.equal(isEnabled(all(), id, U), true);
    assert.equal(isEnabled(all(), "other/x", U), false);
  });
  it("explicit list is membership", () => {
    const s = some(["openai/a", "anthropic/c"]);
    assert.equal(isEnabled(s, "openai/a", U), true);
    assert.equal(isEnabled(s, "openai/b", U), false);
  });
});

describe("toggle", () => {
  // Upstream scoped-models-selector.ts:26 — null → [id] only
  it("from null starts with only the toggled id", () => {
    assert.deepEqual(toggle(all(), "openai/b", U), some(["openai/b"]));
  });
  it("removes enabled; appends disabled at end (upstream:29)", () => {
    const s = some(["openai/a", "openai/b", "anthropic/c"]);
    assert.deepEqual(toggle(s, "openai/b", U), some(["openai/a", "anthropic/c"]));
    assert.deepEqual(toggle(s, "anthropic/d", U), some(["openai/a", "openai/b", "anthropic/c", "anthropic/d"]));
  });
  it("round-trips off then on by appending; can empty", () => {
    const off = toggle(some(["openai/a", "openai/b"]), "openai/a", U);
    assert.deepEqual(off, some(["openai/b"]));
    assert.deepEqual(toggle(off, "openai/a", U), some(["openai/b", "openai/a"]));
    assert.deepEqual(toggle(some(["openai/a"]), "openai/a", U), some([]));
  });
});

describe("enableAll", () => {
  it("no-ops when already all-enabled", () => {
    assert.deepEqual(enableAll(all(), U, U), all());
    assert.deepEqual(enableAll(all(), ["openai/a"], U), all());
  });
  it("full filter collapses to null; partial appends in filter order", () => {
    assert.deepEqual(enableAll(some(["openai/a"]), U, U), all());
    assert.deepEqual(enableAll(some(["anthropic/c"]), ["openai/b", "openai/a"], U), some(["anthropic/c", "openai/b", "openai/a"]));
    assert.deepEqual(enableAll(some(["openai/a", "openai/b"]), ["anthropic/c", "anthropic/d"], U), all());
  });
});

describe("clearAll", () => {
  it("materializes from null; removes filtered; may be empty", () => {
    assert.deepEqual(clearAll(all(), U, U), some([]));
    assert.deepEqual(clearAll(all(), ["openai/a", "anthropic/c"], U), some(["openai/b", "anthropic/d"]));
    assert.deepEqual(clearAll(some(["openai/a", "openai/b", "anthropic/c"]), ["openai/b"], U), some(["openai/a", "anthropic/c"]));
  });
});

describe("toggleProvider", () => {
  it("disables a fully-enabled provider; enables a partial one", () => {
    assert.deepEqual(toggleProvider(all(), "openai", U), some(["anthropic/c", "anthropic/d"]));
    assert.deepEqual(toggleProvider(some(["openai/a", "anthropic/c"]), "openai", U), some(["openai/a", "anthropic/c", "openai/b"]));
  });
});

describe("reorder", () => {
  it("no-ops when null or absent; swaps and clamps", () => {
    assert.deepEqual(reorder(all(), "openai/a", 1), all());
    assert.deepEqual(reorder(some(["openai/a"]), "missing", 1), some(["openai/a"]));
    const s = some(["openai/a", "openai/b", "anthropic/c"]);
    assert.deepEqual(reorder(s, "openai/b", -1), some(["openai/b", "openai/a", "anthropic/c"]));
    assert.deepEqual(reorder(s, "openai/a", -1), s);
    assert.deepEqual(reorder(s, "anthropic/c", 1), s);
    assert.deepEqual(reorder(s, "openai/a", 1), some(["openai/b", "openai/a", "anthropic/c"]));
  });
});
