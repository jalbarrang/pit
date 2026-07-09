import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { wrapExtensionComponent } from "./wrap-component.ts";
import { Text } from "@pit/tui";

class FakeRenderable {
  children: unknown[] = [];
  content = "";
  options: Record<string, unknown> = {};
  add(c: unknown) { this.children.push(c); return this.children.length - 1; }
  remove(c: unknown) { this.children = this.children.filter((x) => x !== c); }
  getChildrenCount() { return this.children.length; }
  requestRender() {}
}

describe("wrapExtensionComponent", () => {
  it("passes through components that already have a renderable", () => {
    const text = new Text({} as never, "x", 0, 0, undefined, new FakeRenderable() as never);
    assert.equal(wrapExtensionComponent({} as never, text), text);
  });

  it("wraps legacy render(width) components in AnsiBridge", () => {
    const legacy = { render: () => ["hi"] };
    const wrapped = wrapExtensionComponent({} as never, legacy);
    assert.ok(wrapped);
    assert.ok("renderable" in wrapped!);
  });

  it("wraps string[] as a static legacy component", () => {
    const wrapped = wrapExtensionComponent({} as never, ["a", "b"]);
    assert.ok(wrapped);
  });
});
