import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveGlobalAction, type GlobalAction } from "./global-actions.ts";

const fakeKb = (pairs: Array<[string, string]>) => ({
  matches(data: string, id: string): boolean {
    return pairs.some(([d, i]) => d === data && i === id);
  },
});

const assertAction = (
  data: string,
  pairs: Array<[string, string]>,
  editorEmpty: boolean,
  expected: GlobalAction,
): void => {
  assert.equal(resolveGlobalAction(data, fakeKb(pairs), { editorEmpty }), expected);
};

describe("resolveGlobalAction", () => {
  it("returns interrupt when app.interrupt matches", () => {
    assertAction("\u001b", [["\u001b", "app.interrupt"]], false, "interrupt");
  });

  it("returns tools-expand when app.tools.expand matches", () => {
    assertAction("\u000f", [["\u000f", "app.tools.expand"]], false, "tools-expand");
  });

  it("returns exit-if-empty only when editor is empty and app.exit matches", () => {
    const pairs: Array<[string, string]> = [["\u0004", "app.exit"]];
    assertAction("\u0004", pairs, true, "exit-if-empty");
    assertAction("\u0004", pairs, false, "none");
  });

  it("returns page-up and page-down for raw escape sequences", () => {
    assertAction("\u001b[5~", [], false, "page-up");
    assertAction("\u001b[6~", [], false, "page-down");
  });

  it("returns model-next when app.model.cycleForward matches", () => {
    assertAction("\u0010", [["\u0010", "app.model.cycleForward"]], false, "model-next");
  });

  it("returns model-prev when app.model.cycleBackward matches", () => {
    assertAction("\u0010", [["\u0010", "app.model.cycleBackward"]], false, "model-prev");
  });

  it("returns thinking-cycle when app.thinking.cycle matches", () => {
    assertAction("\u001b[Z", [["\u001b[Z", "app.thinking.cycle"]], false, "thinking-cycle");
  });

  it("returns suspend when app.suspend matches", () => {
    assertAction("\u001a", [["\u001a", "app.suspend"]], false, "suspend");
  });

  it("returns external-editor when app.editor.external matches", () => {
    assertAction("\u0007", [["\u0007", "app.editor.external"]], false, "external-editor");
  });

  it("returns paste-image when app.clipboard.pasteImage matches", () => {
    assertAction("\u0016", [["\u0016", "app.clipboard.pasteImage"]], false, "paste-image");
  });

  it("returns follow-up when app.message.followUp matches", () => {
    assertAction("\u001b\r", [["\u001b\r", "app.message.followUp"]], false, "follow-up");
  });

  it("returns dequeue when app.message.dequeue matches", () => {
    assertAction("\u001b[A", [["\u001b[A", "app.message.dequeue"]], false, "dequeue");
  });

  it("returns model-select when app.model.select matches", () => {
    assertAction("\u000c", [["\u000c", "app.model.select"]], false, "model-select");
  });

  it("returns none when nothing matches", () => {
    assertAction("x", [], false, "none");
  });
});
