import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BoxRenderable, RenderContext, Renderable } from "@opentui/core";
import { Component, Container, isFocusable } from "./index.ts";

class FakeRenderable {
  children: Renderable[] = [];
  renderRequests = 0;
  add(child: Renderable): number {
    this.children.push(child);
    return this.children.length - 1;
  }
  remove(child: Renderable): void {
    this.children = this.children.filter((item) => item !== child);
  }
  getChildren(): Renderable[] {
    return this.children;
  }
  getChildrenCount(): number {
    return this.children.length;
  }
  requestRender(): void {
    this.renderRequests++;
  }
}

const ctx = {} as RenderContext;
const fake = () => new FakeRenderable() as unknown as BoxRenderable;

class StubComponent extends Component {
  readonly renderable: Renderable;
  invalidateCount = 0;
  constructor(renderable = fake() as unknown as Renderable) {
    super();
    this.renderable = renderable;
  }
  override invalidate(): void {
    this.invalidateCount++;
    super.invalidate();
  }
}

class FocusableStub extends StubComponent {
  focused = false;
}

describe("Container", () => {
  it("mounts child renderables into its BoxRenderable", () => {
    const box = fake();
    const container = new Container(ctx, box);
    const child = new StubComponent();
    container.addChild(child);
    assert.deepEqual(container.children, [child]);
    assert.deepEqual(container.renderable.getChildren(), [child.renderable]);
  });

  it("clears children and detaches all renderables", () => {
    const container = new Container(ctx, fake());
    container.addChild(new StubComponent());
    container.addChild(new StubComponent());
    container.clear();
    assert.equal(container.children.length, 0);
    assert.equal(container.renderable.getChildrenCount(), 0);
  });

  it("cascades invalidation to children", () => {
    const container = new Container(ctx, fake());
    const child = new StubComponent();
    container.addChild(child);
    container.invalidate();
    assert.equal(child.invalidateCount, 1);
  });

  it("detects focusable components by public focused flag", () => {
    assert.equal(isFocusable(new FocusableStub()), true);
    assert.equal(isFocusable(new StubComponent()), false);
  });
});
