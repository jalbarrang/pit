import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ExtensionUIContext } from "@earendil-works/pi-coding-agent";
import { createDialogFlows, type ExtensionDialogPort } from "../../domain/extensions/index.ts";

class FakeDialogs implements ExtensionDialogPort {
  lastNotify?: string;
  select(_t: string, options: string[]) { return Promise.resolve(options[0]); }
  confirm() { return Promise.resolve(true); }
  input() { return Promise.resolve("typed"); }
  notify(message: string) { this.lastNotify = message; }
}

describe("extension dialog flows", () => {
  it("resolves select/confirm/input through the dialog port", async () => {
    const port = new FakeDialogs();
    const flows = createDialogFlows(port);
    assert.equal(await flows.select("t", ["a", "b"]), "a");
    assert.equal(await flows.confirm("t", "m"), true);
    assert.equal(await flows.input("t"), "typed");
    flows.notify("hi");
    assert.equal(port.lastNotify, "hi");
  });
});

describe("ExtensionUIContext structural assignability", () => {
  it("accepts a stub that satisfies the SDK interface shape", () => {
    const stub = {
      select: async () => undefined,
      confirm: async () => false,
      input: async () => undefined,
      notify: () => {},
      onTerminalInput: () => () => {},
      setStatus: () => {},
      setWorkingMessage: () => {},
      setWorkingVisible: () => {},
      setWorkingIndicator: () => {},
      setHiddenThinkingLabel: () => {},
      setWidget: () => {},
      setFooter: () => {},
      setHeader: () => {},
      setTitle: () => {},
      custom: async () => undefined as never,
      pasteToEditor: () => {},
      setEditorText: () => {},
      getEditorText: () => "",
      editor: async () => undefined,
      addAutocompleteProvider: () => {},
      setEditorComponent: () => {},
      getEditorComponent: () => undefined,
      theme: {} as ExtensionUIContext["theme"],
      getAllThemes: () => [],
      getTheme: () => undefined,
      setTheme: () => ({ success: true }),
      getToolsExpanded: () => false,
      setToolsExpanded: () => {},
    } satisfies ExtensionUIContext;
    assert.equal(typeof stub.select, "function");
  });
});
