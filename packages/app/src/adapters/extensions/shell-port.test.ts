import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Text, type Component, type EditorComponent, type TUI } from "@pit/tui";
import { ShellExtensionPort, type ShellUiHost } from "./shell-port.ts";

class FakeRenderable { content = ""; options = {}; requestRender() {} }
const component = (text: string) => new Text({} as never, text, 0, 0, undefined, new FakeRenderable() as never) as never;

const host = () => {
  const mounted: { area: string; key?: string; component?: Component; placement?: string }[] = [];
  const fakeTui = { ctx: {}, renderer: { width: 80 } } as unknown as TUI;
  const fakeEditor = { getText: () => "", setText() {}, handleInput() {} } as unknown as EditorComponent;
  return {
    mounted,
    port: new ShellExtensionPort({
      tui: () => fakeTui,
      getEditor: () => fakeEditor,
      getToolsExpanded: () => false,
      setToolsExpanded() {},
      mountHeader: (c) => mounted.push({ area: "header", component: c }),
      mountFooter: (c) => mounted.push({ area: "footer", component: c }),
      mountWidget: (key, c, placement) => mounted.push({ area: "widget", key, component: c, placement }),
      setWorkingMessage: (message) => mounted.push({ area: `working:${message}` }),
      setWorkingVisible: (visible) => mounted.push({ area: `visible:${visible}` }),
      theme: { name: "dark" } as never,
    } satisfies ShellUiHost),
  };
};

describe("ShellExtensionPort chrome mounting", () => {
  it("mounts and clears widget factories with placement", () => {
    const h = host();
    h.port.setWidget("plan", (() => component("widget")) as never, { placement: "belowEditor" });
    h.port.setWidget("plan", undefined);
    assert.equal(h.mounted[0].area, "widget");
    assert.equal(h.mounted[0].placement, "belowEditor");
    assert.equal(h.mounted.at(-1)?.component, undefined);
  });

  it("replaces header/footer and disposes previous components", () => {
    const h = host();
    let disposed = false;
    h.port.setHeader((() => Object.assign(component("one"), { dispose: () => { disposed = true; } })) as never);
    h.port.setHeader((() => component("two")) as never);
    h.port.setFooter((() => component("foot")) as never);
    assert.equal(disposed, true);
    assert.deepEqual(h.mounted.map((m) => m.area), ["header", "header", "footer"]);
  });

  it("forwards working-message controls to the shell status path", () => {
    const h = host();
    h.port.setWorkingMessage("Planning");
    h.port.setWorkingVisible(false);
    assert.deepEqual(h.mounted.map((m) => m.area), ["working:Planning", "visible:false"]);
  });
});
