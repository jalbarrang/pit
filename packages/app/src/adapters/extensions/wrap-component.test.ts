import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RenderContext, Renderable, StyledText } from "@opentui/core";
import { Text } from "@pit/tui";
import { wrapExtensionComponent } from "./wrap-component.ts";

class FakeRenderable {
  children: unknown[] = [];
  content: string | StyledText = "";
  options: Record<string, unknown> = {};
  add(c: unknown) { this.children.push(c); return this.children.length - 1; }
  remove(c: unknown) { this.children = this.children.filter((x) => x !== c); }
  getChildrenCount() { return this.children.length; }
  requestRender() {}
}

const fake = () => new FakeRenderable() as unknown as Renderable;
const inject = {
  box: fake() as never,
  makeLine: (_ctx: RenderContext, content: StyledText) =>
    new Text({} as never, content, 0, 0, undefined, fake() as never),
};

describe("wrapExtensionComponent", () => {
  it("passes through components that already have a renderable", () => {
    const text = new Text({} as never, "x", 0, 0, undefined, fake() as never);
    assert.equal(wrapExtensionComponent({} as never, text), text);
  });

  it("wraps legacy render(width) components in AnsiBridge", () => {
    const wrapped = wrapExtensionComponent({} as never, { render: () => ["hi"] }, inject);
    assert.ok(wrapped);
    assert.ok("renderable" in wrapped!);
  });

  it("wraps string[] as a static legacy component", () => {
    const wrapped = wrapExtensionComponent({} as never, ["a", "b"], inject);
    assert.ok(wrapped);
  });
});
