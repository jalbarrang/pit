import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { routeGlobalInput, type GlobalInputDeps } from "./global-input.ts";

type Call = string;
const fakeDeps = (overrides: Partial<GlobalInputDeps> = {}): { deps: GlobalInputDeps; calls: Call[] } => {
  const calls: Call[] = [];
  const deps: GlobalInputDeps = {
    hasOverlay: () => false, editorText: () => "", matches: { matches: () => false },
    openLastImage: () => void calls.push("openLastImage"), page: (delta) => void calls.push(`page:${delta}`),
    toggleTools: () => void calls.push("toggleTools"), exit: () => void calls.push("exit"),
    abortIfStreaming: (data) => { calls.push(`abort:${data}`); return false; },
    cycleModel: (dir) => void calls.push(`cycleModel:${dir}`), cycleThinking: () => void calls.push("cycleThinking"),
    suspend: () => void calls.push("suspend"), externalEditor: () => void calls.push("externalEditor"),
    exitKeysInput: () => "ignored", ...overrides,
  };
  return { deps, calls };
};

describe("routeGlobalInput", () => {
  it("short-circuits when an overlay is open", () => {
    const { deps, calls } = fakeDeps({ hasOverlay: () => true });
    assert.equal(routeGlobalInput(deps, "\u0019"), undefined);
    assert.deepEqual(calls, []);
  });
  it("opens last image on raw ctrl+y", () => {
    const { deps, calls } = fakeDeps();
    assert.deepEqual(routeGlobalInput(deps, "\u0019"), { consume: true });
    assert.deepEqual(calls, ["openLastImage"]);
  });
  it("pages chat on page-up and page-down", () => {
    const { deps, calls } = fakeDeps();
    assert.deepEqual(routeGlobalInput(deps, "\u001b[5~"), { consume: true });
    assert.deepEqual(routeGlobalInput(deps, "\u001b[6~"), { consume: true });
    assert.deepEqual(calls, ["page:-10", "page:10"]);
  });
  it("toggles tools and exits when editor empty", () => {
    const { deps, calls } = fakeDeps({
      matches: { matches: (data, id) => (data === "o" && id === "app.tools.expand") || (data === "d" && id === "app.exit") },
    });
    assert.deepEqual(routeGlobalInput(deps, "o"), { consume: true });
    assert.deepEqual(routeGlobalInput(deps, "d"), { consume: true });
    assert.deepEqual(calls, ["toggleTools", "exit"]);
  });
  it("cycles model forward and backward", () => {
    const { deps, calls } = fakeDeps({
      matches: { matches: (data, id) => (data === "fwd" && id === "app.model.cycleForward") || (data === "bwd" && id === "app.model.cycleBackward") },
    });
    assert.deepEqual(routeGlobalInput(deps, "fwd"), { consume: true });
    assert.deepEqual(routeGlobalInput(deps, "bwd"), { consume: true });
    assert.deepEqual(calls, ["cycleModel:1", "cycleModel:-1"]);
  });
  it("cycles thinking level", () => {
    const { deps, calls } = fakeDeps({ matches: { matches: (data, id) => data === "tab" && id === "app.thinking.cycle" } });
    assert.deepEqual(routeGlobalInput(deps, "tab"), { consume: true });
    assert.deepEqual(calls, ["cycleThinking"]);
  });
  it("suspends on app.suspend", () => {
    const { deps, calls } = fakeDeps({ matches: { matches: (data, id) => data === "z" && id === "app.suspend" } });
    assert.deepEqual(routeGlobalInput(deps, "z"), { consume: true });
    assert.deepEqual(calls, ["suspend"]);
  });
  it("opens external editor on app.editor.external", () => {
    const { deps, calls } = fakeDeps({ matches: { matches: (data, id) => data === "g" && id === "app.editor.external" } });
    assert.deepEqual(routeGlobalInput(deps, "g"), { consume: true });
    assert.deepEqual(calls, ["externalEditor"]);
  });
  it("aborts stream on interrupt when abortIfStreaming returns true", () => {
    const { deps, calls } = fakeDeps({
      matches: { matches: (_d, id) => id === "app.interrupt" },
      abortIfStreaming: (data) => { calls.push(`abort:${data}`); return true; },
    });
    assert.deepEqual(routeGlobalInput(deps, "esc"), { consume: true });
    assert.deepEqual(calls, ["abort:esc"]);
  });
  it("does not consume interrupt when abortIfStreaming returns false", () => {
    const { deps, calls } = fakeDeps({
      matches: { matches: (_d, id) => id === "app.interrupt" }, abortIfStreaming: () => false, exitKeysInput: () => "ignored",
    });
    assert.equal(routeGlobalInput(deps, "esc"), undefined);
    assert.deepEqual(calls, []);
  });
  it("consumes when double-ctrl+c arms and exits on exit", () => {
    const armed = fakeDeps({ exitKeysInput: () => "armed" });
    assert.deepEqual(routeGlobalInput(armed.deps, "\u0003"), { consume: true });
    assert.deepEqual(armed.calls, []);
    const exit = fakeDeps({ exitKeysInput: () => "exit" });
    assert.equal(routeGlobalInput(exit.deps, "\u0003"), undefined);
    assert.deepEqual(exit.calls, ["exit"]);
  });
});
