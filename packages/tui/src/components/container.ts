import { BoxRenderable, type RenderContext } from "@opentui/core";
import { Component } from "./component.ts";

export class Container extends Component {
  readonly renderable: BoxRenderable;
  readonly children: Component[] = [];

  constructor(ctx: RenderContext, renderable?: BoxRenderable) {
    super();
    this.renderable = renderable ?? new BoxRenderable(ctx, {
      flexDirection: "column",
      width: "100%",
      height: "auto",
      border: false,
    });
  }

  addChild(child: Component): void {
    this.children.push(child);
    this.renderable.add(child.renderable);
  }

  removeChild(child: Component): void {
    const index = this.children.indexOf(child);
    if (index < 0) return;
    this.children.splice(index, 1);
    this.renderable.remove(child.renderable);
  }

  clear(): void {
    for (const child of [...this.children]) this.removeChild(child);
  }

  override invalidate(): void {
    super.invalidate();
    for (const child of this.children) child.invalidate();
  }
}
