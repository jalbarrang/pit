import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Selection } from "@opentui/core";
import { bindSelectionCopy, type CopyClock, type CopyFooter, type CopyRenderer } from "./selection-copy.ts";

function fakeRenderer(copyOk = true) {
  let handler: ((selection: Selection) => void) | null = null;
  const copies: string[] = [];
  const renderer: CopyRenderer = {
    on(_event, listener) { handler = listener as (selection: Selection) => void; },
    off() { handler = null; },
    copyToClipboardOSC52(text) { copies.push(text); return copyOk; },
  };
  return { renderer, copies, getHandler: () => handler };
}

function fakeFooter(): CopyFooter & { notices: string[]; clears: number } {
  const notices: string[] = [];
  let clears = 0;
  return {
    notices,
    get clears() { return clears; },
    notice(text) { notices.push(text); },
    clearNotice() { clears += 1; },
  };
}

function fakeClock(): CopyClock & { run(): void; cleared: unknown[] } {
  let stored: (() => void) | null = null;
  const cleared: unknown[] = [];
  return {
    cleared,
    setTimeout(fn) { stored = fn; return Symbol("timer"); },
    clearTimeout(handle) { cleared.push(handle); },
    run() { stored?.(); },
  };
}

function selection(text: string): Selection {
  return { getSelectedText: () => text } as unknown as Selection;
}

describe("bindSelectionCopy", () => {
  it("copies multi-line selection and notices line count", () => {
    const { renderer, copies, getHandler } = fakeRenderer(true);
    const footer = fakeFooter();
    bindSelectionCopy(renderer, footer, fakeClock());
    getHandler()!(selection("line1\nline2"));
    assert.deepEqual(copies, ["line1\nline2"]);
    assert.deepEqual(footer.notices, ["Copied 2 lines"]);
  });

  it("ignores empty selection", () => {
    const { renderer, copies, getHandler } = fakeRenderer(true);
    const footer = fakeFooter();
    bindSelectionCopy(renderer, footer, fakeClock());
    getHandler()!(selection(""));
    assert.deepEqual(copies, []);
    assert.deepEqual(footer.notices, []);
  });

  it("notices when clipboard is unavailable", () => {
    const { renderer, getHandler } = fakeRenderer(false);
    const footer = fakeFooter();
    bindSelectionCopy(renderer, footer, fakeClock());
    getHandler()!(selection("line1\nline2"));
    assert.deepEqual(footer.notices, ["Clipboard unavailable — terminal has no OSC52"]);
  });

  it("clears notice when clock fires", () => {
    const { renderer, getHandler } = fakeRenderer(true);
    const footer = fakeFooter();
    const clock = fakeClock();
    bindSelectionCopy(renderer, footer, clock);
    getHandler()!(selection("line1\nline2"));
    clock.run();
    assert.equal(footer.clears, 1);
  });

  it("unsubscribe calls renderer.off", () => {
    const { renderer, getHandler } = fakeRenderer(true);
    const unsub = bindSelectionCopy(renderer, fakeFooter(), fakeClock());
    assert.ok(getHandler());
    unsub();
    assert.equal(getHandler(), null);
  });
});
