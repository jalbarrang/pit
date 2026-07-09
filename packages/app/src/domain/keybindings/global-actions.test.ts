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

  it("returns none when nothing matches", () => {
    assertAction("x", [], false, "none");
  });
});
